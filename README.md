# e-SAKSHI 2.0 Sentinel — MPLADS Vigilance & Analytics Portal

> **SIH 2026 Problem Statement 26102** — AI-Powered MPLADS Anomaly, Fraud & Inefficiency Detection System

## 🏗️ Architecture

```
┌─────────────────────────────────┐      ┌────────────────────────────────┐
│   Frontend (Vercel / Next.js)   │◄────►│  Backend (Render / FastAPI)    │
│   • Dashboard UI (4 roles)      │      │  • 14 REST API endpoints       │
│   • Audit Trail & Dossiers      │      │  • SQLite + SQLAlchemy ORM     │
│   • Alert System                │      │  • ML Pipeline (Ensemble)      │
│   • Notice Generation           │      │  • Isolation Forest Engine     │
└─────────────────────────────────┘      └────────────────────────────────┘
```

## 🚀 Quick Start

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

### Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000` in `frontend/.env.local` to connect to local backend.

## 📊 ML Pipeline

- **15 multi-modal forensic features** (cost inflation, photo hash collision, geofence gates, vendor concentration)
- **Soft Voting Ensemble** (Random Forest + Extra Trees + Gradient Boosting)
- **99.58% accuracy**, **100% anomaly recall**

## 🌐 Live Deployment

- **Frontend**: [Vercel](https://frontend-chi-two-40.vercel.app)
- **Backend**: Render (Python)

## 📁 Project Structure

```
SIH2026/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── pipeline.py          # Audit pipeline
│   │   ├── detection/           # ML engines
│   │   └── routers/             # API endpoints
│   ├── data/                    # Seed datasets
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   ├── components/          # React components
│   │   └── lib/                 # API client, mock data
│   └── package.json
└── README.md
```

## 👥 Team

SIH 2026 — Problem Statement 26102
