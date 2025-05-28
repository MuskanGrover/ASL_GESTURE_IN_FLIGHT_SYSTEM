# Use official Python 3.10 slim image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install OS-level dependencies for OpenCV, MediaPipe, etc.
RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    libsm6 \
    libxext6 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy project files into container
COPY . .

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (change to whatever port Render uses — 10000 or default 5000)
EXPOSE 10000

# Run the app using Gunicorn, referencing `app:app` (your file is `app.py`, and Flask object is `app`)
CMD ["gunicorn", "-b", "0.0.0.0:10000", "app:app"]
