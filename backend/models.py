from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    transcript_text = Column(String, nullable=False)
    summary_text = Column(String, nullable=False)
    emotion_text = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
