import os
import json
import uuid
import requests
import whisper
import uvicorn

from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import DB-related modules
from database import Base, engine, get_db
from models import Transcript

# Create DB tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS: allow requests from frontend on http://localhost:3000
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# By default, talk to LM Studio on port 1234 on your host machine
# Change if your LM Studio runs elsewhere or on a different port
LMSTUDIO_URL = os.environ.get("LMSTUDIO_URL") or "http://host.docker.internal:1234"

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI with Docker Compose"}

@app.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    1. Receive the uploaded audio file.
    2. Transcribe with Whisper.
    3. Send transcript to LM Studio for summary/emotion in JSON.
    4. Store and return results.
    """
    # -----------------------------
    # Save file to temporary location
    # -----------------------------
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    with open(temp_filename, "wb") as f:
        f.write(await file.read())

    # -----------------------------
    # Transcribe using Whisper
    # -----------------------------
    model = whisper.load_model("base")  # or "small", "medium", etc.
    result = model.transcribe(temp_filename)
    transcript_text = result["text"]

    # -----------------------------
    # Prepare a prompt for LM Studio
    # -----------------------------
    # We'll instruct the LLM to return JSON with "summary" and "emotion" fields.
    prompt = (
        "You are a helpful assistant. The user gives you text. "
        "Respond in valid JSON only, with two keys: 'summary' for a brief summary, "
        "'emotion' for the overall emotion.\n\n"
        "Example output:\n"
        "{\n"
        '  "summary": "This is a summary",\n'
        '  "emotion": "Happy"\n'
        "}\n"
    )

    payload = {
        "model": "YourModelNameOrPath",  # adjust to match your loaded LM Studio model
        "messages": [
            {
                "role": "system",
                "content": prompt
            },
            {
                "role": "user",
                "content": f"Text: {transcript_text}\nSummarize and provide overall emotion."
            }
        ],
        "temperature": 0.7
    }

    summary_text = "Could not get summary"
    emotion_text = "Unknown"

    # -----------------------------
    # Call LM Studio's /v1/chat/completions endpoint
    # -----------------------------
    try:
        lmstudio_endpoint = f"{LMSTUDIO_URL}/v1/chat/completions"
        response = requests.post(lmstudio_endpoint, json=payload, timeout=30)

        if response.status_code == 200:
            data = response.json()
            # Extract the assistant's message text
            assistant_message = data["choices"][0]["message"]["content"]
            # Attempt to parse the JSON
            try:
                parsed = json.loads(assistant_message)
                summary_text = parsed.get("summary", "No summary found")
                emotion_text = parsed.get("emotion", "No emotion found")
            except json.JSONDecodeError:
                summary_text = f"LLM responded but not in JSON: {assistant_message}"
        else:
            summary_text = f"LLM Error: status {response.status_code}"

    except Exception as e:
        summary_text = f"Error: {str(e)}"

    # -----------------------------
    # Store results in PostgreSQL
    # -----------------------------
    new_transcript = Transcript(
        transcript_text=transcript_text,
        summary_text=summary_text,
        emotion_text=emotion_text
    )
    db.add(new_transcript)
    db.commit()
    db.refresh(new_transcript)

    # Clean up temp file
    os.remove(temp_filename)

    # Return final response
    return {
        "transcript": new_transcript.transcript_text,
        "summary": new_transcript.summary_text,
        "emotion": new_transcript.emotion_text,
    }

if __name__ == "__main__":
    # Start FastAPI on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
