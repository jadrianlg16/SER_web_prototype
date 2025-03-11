FROM python:3.9-slim

# Install system packages needed by Whisper (ffmpeg) and libsndfile if required
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    libpq-dev \
    gcc \
 && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Expose port 8000 for FastAPI
EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
