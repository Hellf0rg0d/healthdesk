# Use a slim Python image
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Create non-root user
RUN useradd -m appuser
USER appuser

# Expose port (default 7860 for HF Spaces)
EXPOSE 7860

# Use PORT env var with fallback to 7860
CMD ["sh", "-c", "gunicorn app:app -k uvicorn.workers.UvicornWorker --workers 1 --bind 0.0.0.0:${PORT:-7860} --timeout 120"]