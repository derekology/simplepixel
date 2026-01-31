#!/bin/bash

# Simple Pixel Quick Start Script

set -e

echo "========================================="
echo "   Simple Pixel - Quick Start"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH"
    echo "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✓ Docker is installed and running"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi
echo ""

# Build the image
echo "Building Docker image..."
docker-compose build
echo "✓ Build complete"
echo ""

# Start the application
echo "Starting Simple Pixel..."
docker-compose up -d
echo "✓ Simple Pixel is running"
echo ""

# Wait a moment for the container to fully start
echo "Waiting for application to be ready..."
sleep 5

# Check if the container is healthy
if docker-compose ps | grep -q "Up"; then
    echo "✓ Container is running"
    echo ""
    echo "========================================="
    echo "   Simple Pixel is ready!"
    echo "========================================="
    echo ""
    echo "Access the application at:"
    echo "  http://localhost:3000"
    echo ""
    echo "To create your first pixel, visit:"
    echo "  http://localhost:3000/create-pixel"
    echo ""
    echo "Useful commands:"
    echo "  docker-compose logs -f    # View logs"
    echo "  docker-compose stop       # Stop the application"
    echo "  docker-compose down       # Stop and remove containers"
    echo "  docker-compose restart    # Restart the application"
    echo ""
else
    echo "⚠ Warning: Container may not be healthy"
    echo "Check logs with: docker-compose logs"
fi
