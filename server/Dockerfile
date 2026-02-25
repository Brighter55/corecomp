FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY corecomp/ .

# Run migrations and start server
CMD ["sh", "-c", "python manage.py migrate && gunicorn corecomp.wsgi:application --bind 0.0.0.0:${PORT}"]