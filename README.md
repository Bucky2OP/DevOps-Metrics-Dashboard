🚀 DevOps Metrics Dashboard

A full-stack DevOps Metrics Dashboard built with Go, Python, React, PostgreSQL, and Docker.
It provides real-time monitoring of system metrics, backend processing, and data aggregation through a Python worker service.

This project is designed to simulate a production-grade DevOps platform and is fully containerized using Docker Compose.

📌 Features
✅ Go Backend API (backend-go)

REST API for exposing system metrics

Writes metrics into PostgreSQL

Exposes endpoints for:

/metrics – fetch latest metrics

/emit_demo – generate test metrics

Containerized Go microservice (Go 1.22)

✅ Python Data Worker (data-worker)

Periodically pulls metrics from Postgres

Performs real-time aggregation and analysis

Calculates:

average metric values

top events

hourly statistics

Runs every 30 seconds

Containerized using python:3.11-slim

✅ React Frontend (frontend)

Modern UI for viewing DevOps metrics

“Emit demo metric” button for testing

Vite + React (fast dev server)

Fetches metrics from Go backend

✅ PostgreSQL Database

Stores metrics

Managed using a Docker volume

Auto-created metrics table

✅ Docker Compose

One command starts the entire stack:

docker compose up --build

🏗️ Architecture
DevOps Metrics Dashboard/
│
├── backend-go/          # Go API server
│   ├── main.go
│   ├── go.mod
│   ├── Dockerfile
│
├── data-worker/         # Python analytics engine
│   ├── compute_metrics.py
│   ├── requirements.txt
│   ├── Dockerfile
│
├── frontend/            # React dashboard (Vite)
│   ├── src/
│   ├── Dockerfile
│
└── docker-compose.yml   # full system orchestration

⚙️ Installation & Setup
Clone the repo
git clone https://github.com/<your-username>/devops-metrics-dashboard
cd devops-metrics-dashboard

Start all services
docker compose up --build

Access the system

Frontend (React) → http://localhost:5173

Backend API (Go) → http://localhost:8080/metrics

Python Worker → prints analysis in container logs

Database → Postgres on port 5432

Docker logs → docker compose logs -f

🔌 API Endpoints (Go Backend)
GET /metrics

Fetch all stored metrics.

GET /emit_demo

Insert a demo metric into the database (testing only).

📊 Worker Analytics (Python)

The Python worker calculates:

hourly rolling averages

top metrics

number of events

anomaly detection (basic)

Runs automatically every 30 seconds.

🖥️ Frontend (React + Vite)

The dashboard includes:

Latest metric list

Button to emit test metrics

Automatically refreshes when new metrics appear

🧪 Local Development (without Docker)
Backend
cd backend-go
go run main.go

Worker
cd data-worker
python compute_metrics.py

Frontend
cd frontend
npm install
npm run dev

📦 Docker Compose Services
services:
  db            # PostgreSQL database
  backend-go    # Go API server
  data-worker   # Python analytics engine
  frontend      # React dashboard


The Go backend and worker both depend on the db container.

📘 Future Enhancements (Planned)

🔥 Add Prometheus / Grafana integration

🔒 Authentication for dashboard

📉 Time-series visualization (charts)

📡 WebSockets for live metrics push

🚀 Deployment to AWS / Render / Railway

🏁 Summary

This project demonstrates a production-style DevOps monitoring platform with:

Go microservices

Python analytics

React dashboard

PostgreSQL

Full Docker Compose orchestration

It’s built to showcase real DevOps + Cloud + Full-Stack engineering skills.
