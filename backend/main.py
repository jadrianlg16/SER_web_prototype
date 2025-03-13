import sys
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
from typing import List, Dict, Optional

# Database / models
from database import Base, engine, get_db
from models import Transcript

import oci
from oci.config import from_file
from oci.ai_language import AIServiceLanguageClient
from oci.ai_language.models import (
    BatchDetectLanguageSentimentsDetails,
    TextDocument
)

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

LMSTUDIO_BASE_URL = os.environ.get("LMSTUDIO_URL") or "http://host.docker.internal:1234"

oci_config = from_file()
language_client = AIServiceLanguageClient(oci_config)


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI with Docker Compose"}


def generate_summary_with_llm(transcript_text: str) -> str:
    """
    Send the transcript to your LLM to get a concise summary.
    Adjust the prompt, model, and other parameters as needed.
    """
    endpoint = f"{LMSTUDIO_BASE_URL}/v1/chat/completions"

    prompt = (
        "You are a helpful assistant. Given the following call transcript, "
        "please generate a concise summary that covers key points, overall tone, and important details:\n\n"
        f"{transcript_text}\n"
    )

    payload = {
        "model": "YourModelNameOrPath",  # Adjust to match your loaded LM Studio model
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(endpoint, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        # Extract the summary text
        summary_text = data["choices"][0]["message"]["content"]
        return summary_text
    except Exception as e:
        print("ERROR generating summary with LLM:", e, file=sys.stderr)
        return "No summary (error calling LLM)."


@app.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1) Save file locally
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    with open(temp_filename, "wb") as f:
        f.write(await file.read())

    # 2) Transcribe using Whisper
    model = whisper.load_model("base")  # or "small", "medium", etc.
    result = model.transcribe(temp_filename)
    transcript_text = result["text"]

    # ---------------------------------------------------------
    # FOR DEMO: Overwrite transcript_text with your mock text
    # ---------------------------------------------------------
    
    # transcript_text = """Alex:
    # Good morning! This is Alex calling from Quick Tech Solutions. How are you doing today?

    # Jamie:
    # Hi Alex, I’m doing well, thank you. What can I do for you?

    # Alex:
    # That's wonderful to hear, Jamie! I’m excited to share some news about our latest eco-friendly home appliances. 

    # Alex:
    # Have a wonderful day, Jamie! Talk soon.
    # """



    transcript_text = """Alex:
    Good morning! This is Alex calling from Quick Tech Solutions. How are you doing today?

    Jamie:
    Hi Alex, I’m doing well, thank you. What can I do for you?

    Alex:
    That's wonderful to hear, Jamie! I’m excited to share some news about our latest eco-friendly home appliances. Our new line not only helps you save on energy costs but also brings a modern touch to your home—all while being environmentally responsible.

    Jamie:
    That sounds really interesting. Can you tell me more about the features?

    Alex:
    Absolutely! For instance, our smart thermostat adjusts automatically to your schedule, learning your preferences to optimize comfort and efficiency. Plus, it comes with a user-friendly app that puts complete control at your fingertips. We’re currently offering an exclusive promotion that makes this upgrade even more appealing!

    Jamie:
    I love the sound of that. It seems like a great way to enhance home comfort and save money.

    Alex:
    Exactly, Jamie! At Quick Tech Solutions, our goal is to create a win-win situation where you enjoy both luxury and savings. Would you be interested in a short, personalized demo to see how these features work in real time?

    Jamie:
    Yes, that would be great. When can we schedule it?

    Alex:
    Fantastic! I have some openings later this week. How does Thursday afternoon at 2 PM sound?

    Jamie:
    That works perfectly for me.

    Alex:
    Great! I’ll send you an email confirmation with all the details right away. Thank you so much for your time today, Jamie. I truly appreciate the opportunity to show you how our innovative products can make a difference in your home. I look forward to our demo on Thursday!

    Jamie:
    Thank you, Alex. I’m looking forward to it as well!

    Alex:
    Have a wonderful day, Jamie! Talk soon.
    """






    # 3) Prepare OCI Sentiment request (looking for aspect-level analysis)
    documents = [
        TextDocument(
            key="doc1",
            text=transcript_text,
            language_code="en"
        )
    ]
    sentiment_request = BatchDetectLanguageSentimentsDetails(documents=documents)

    # 4) Call OCI
    emotion_text = "Unknown"
    aspects_json_str = None  # Will store JSON string of aspects
    try:
        response = language_client.batch_detect_language_sentiments(
            batch_detect_language_sentiments_details=sentiment_request
        )
        print("DEBUG: Full OCI response:", response.data, file=sys.stderr)

        if response.data.documents and len(response.data.documents) > 0:
            doc_result = response.data.documents[0]

            # If doc-level sentiment is not present, we fallback to aspects
            if hasattr(doc_result.document_sentiment, "label"):
                # If an actual doc-level sentiment is returned
                emotion_text = doc_result.document_sentiment.label
            else:
                # or doc_result.document_sentiment might be empty
                # fallback to first aspect, if any
                if doc_result.aspects:
                    emotion_text = doc_result.aspects[0].sentiment
                else:
                    emotion_text = "No document-level sentiment found"

            # Collect aspects (keywords + sentiment)
            if doc_result.aspects:
                aspects_json_str = json.dumps([
                    {
                        "text": a.text,
                        "sentiment": a.sentiment,
                        "scores": a.scores
                    } for a in doc_result.aspects
                ])
    except Exception as ex:
        print("DEBUG: Exception calling OCI:", ex, file=sys.stderr)
        emotion_text = "Unknown"

    # 5) Generate the summary via LLM
    summary_text = generate_summary_with_llm(transcript_text)

    # 6) Insert into DB
    #    If you want to store aspects_json_str, ensure your Transcript model
    #    has a field for it. (e.g. aspects_text = Column(Text))
    new_transcript = Transcript(
        transcript_text=transcript_text,
        summary_text=summary_text,
        emotion_text=emotion_text,
        # aspects_text=aspects_json_str  # only if your table/ORM has this field
    )
    db.add(new_transcript)
    db.commit()
    db.refresh(new_transcript)

    # Cleanup local file
    os.remove(temp_filename)

    # 7) Return data to the frontend
    aspects_list = json.loads(aspects_json_str) if aspects_json_str else []
    return {
        "id": new_transcript.id,
        "transcript": new_transcript.transcript_text,
        "summary": new_transcript.summary_text,
        "emotion": new_transcript.emotion_text,
        "aspects": aspects_list
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

    # Build system context
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
        "model": "YourModelNameOrPath",  # Adjust to match your loaded LM Studio model
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

# -----------------------------
# 3) Test OCI endpoint
# -----------------------------
@app.get("/test_oci")
def test_oci_call():
    """
    Quick test route to see if OCI returns a normal doc-level sentiment for known text.
    """
    text = "I hate everything about this. This is the absolute worst experience. I'm so upset."
    documents = [
        TextDocument(
            key="doc1",
            text=text,
            language_code="en"
        )
    ]
    sentiment_request = BatchDetectLanguageSentimentsDetails(documents=documents)

    try:
        response = language_client.batch_detect_language_sentiments(
            batch_detect_language_sentiments_details=sentiment_request
        )
        print("DEBUG /test_oci response:", response.data, file=sys.stderr)
        return response.data
    except Exception as ex:
        print("DEBUG /test_oci exception:", ex, file=sys.stderr)
        return {"error": str(ex)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)





