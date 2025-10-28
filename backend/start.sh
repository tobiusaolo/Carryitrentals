#!/bin/bash

# Rental Management System Backend Startup Script

echo "Starting Rental Management System Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo "Please edit .env file with your configuration before running the application."
fi

# Create upload directories
echo "Creating upload directories..."
mkdir -p uploads/unit_images
mkdir -p uploads/documents
mkdir -p uploads/maintenance_images

# Run database migrations (if using Alembic)
# echo "Running database migrations..."
# alembic upgrade head

# Start the application
echo "Starting FastAPI application..."
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload



