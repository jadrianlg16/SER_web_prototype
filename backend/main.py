import os
import json
import uuid
import requests
import whisper
import uvicorn

from fastapi import FastAPI, File, UploadFile, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict

# Database / models
from database import Base, engine, get_db
from models import Transcript

# Create DB tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["http://localhost:3000"]  # Adjust if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LM Studio base URL (e.g. http://host.docker.internal:1234 on Docker Desktop)
LMSTUDIO_BASE_URL = os.environ.get("LMSTUDIO_URL") or "http://host.docker.internal:1234"

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI with Docker Compose"}

# -----------------------------
# 1) Audio upload -> transcript, summary, emotion
# -----------------------------
@app.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save file
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    with open(temp_filename, "wb") as f:
        f.write(await file.read())

    # Transcribe using Whisper
    model = whisper.load_model("base")  # or "small", "medium", etc.
    result = model.transcribe(temp_filename)
    transcript_text = result["text"]

    # >>> Call the LLM for summary/emotion <<<
    # We'll instruct the LLM to respond in JSON with "summary" and "emotion" keys.
    prompt = (
        "You are a helpful assistant. The user gives you text. "
        "Respond in valid JSON only, with two keys: 'summary' for a brief summary, "
        "'emotion' for the overall emotion.\n\n"
        "Example output:\n"
        "{\n"
        '  "summary": "This is a summary",\n'
        '  "emotion": "Happy"\n'
        "}\n\n"
        f"Text: {transcript_text}\n"
        "Please provide JSON now."
    )

    summary_text = "Could not get summary"
    emotion_text = "Unknown"

    # Prepare request to LM Studio
    lmstudio_endpoint = f"{LMSTUDIO_BASE_URL}/v1/chat/completions"
    payload = {
        "model": "YourModelNameOrPath",  # Adjust to match your loaded LM Studio model
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant that outputs ONLY valid JSON with 'summary' and 'emotion'."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(lmstudio_endpoint, json=payload, timeout=30)
        if response.status_code == 200:
            data = response.json()
            # The assistant's text
            assistant_message = data["choices"][0]["message"]["content"]
            # Try to parse the JSON
            try:
                parsed = json.loads(assistant_message)
                summary_text = parsed.get("summary", "No summary found")
                emotion_text = parsed.get("emotion", "No emotion found")
            except json.JSONDecodeError:
                summary_text = f"LLM responded but not in valid JSON: {assistant_message}"
        else:
            summary_text = f"LLM Error: status {response.status_code}"
    except Exception as e:
        summary_text = f"Error calling LLM: {str(e)}"

    # Insert into DB
    new_transcript = Transcript(
        transcript_text=transcript_text,
        summary_text=summary_text,
        emotion_text=emotion_text
    )
    db.add(new_transcript)
    db.commit()
    db.refresh(new_transcript)

    # Cleanup
    os.remove(temp_filename)

    # Return transcript + ID so the frontend can use it later for chat
    return {
        "id": new_transcript.id,
        "transcript": new_transcript.transcript_text,
        "summary": new_transcript.summary_text,
        "emotion": new_transcript.emotion_text
    }

# -----------------------------
# Pydantic model for Chat Request
# -----------------------------
class ChatRequest(BaseModel):
    transcript_id: int
    messages: List[Dict]

# -----------------------------
# 2) Chat endpoint
# -----------------------------
@app.post("/chat")
def chat_endpoint(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    transcript_obj = db.query(Transcript).filter(Transcript.id == request.transcript_id).first()
    if not transcript_obj:
        raise HTTPException(status_code=404, detail="Transcript not found")

    # Build system context with the transcript details
    system_prompt = (
        "You have the following context:\n\n"
        f"Transcript: {transcript_obj.transcript_text}\n"
        f"Summary: {transcript_obj.summary_text}\n"
        f"Emotion: {transcript_obj.emotion_text}\n\n"
        "The user will ask questions or make requests based on this transcript. Provide helpful answers."
    )

    conversation = [{"role": "system", "content": system_prompt}]
    conversation.extend(request.messages)

    payload = {
        "model": "YourModelNameOrPath",
        "messages": conversation,
        "temperature": 0.7
    }

    try:
        endpoint = f"{LMSTUDIO_BASE_URL}/v1/chat/completions"
        response = requests.post(endpoint, json=payload, timeout=30)
        if response.status_code != 200:
            return {"error": f"LLM error. Status: {response.status_code}"}
        data = response.json()
        assistant_reply = data["choices"][0]["message"]["content"]
        return {"assistant_message": assistant_reply}
    except Exception as e:
        return {"error": f"Exception calling LLM: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
