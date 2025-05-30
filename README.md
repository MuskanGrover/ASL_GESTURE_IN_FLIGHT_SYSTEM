# AI-Based Sign Language Detection System for Flights

An AI-powered system designed to assist needy passengers during flights by detecting American Sign Language (ASL) gestures and hand movements. The project integrates a Flask-based AI model with a ReactJS frontend and a Next.js backend to provide seamless communication and assistance.
Now The Mute Users In the Flight Can easily access any Inflight Entertainment,Meal Accessibilty,Crew Assistance etc by just performing A sign Language Gesture.

---
<img width="932" alt="image" src="https://github.com/user-attachments/assets/fed67d5d-83ab-46ae-9a41-507d3b310651" />

## Project Overview

This project aims to bridge communication gaps for passengers who use sign language, especially in-flight, by automatically detecting ASL gestures through a webcam and interpreting them into actionable requests.

- **AI Model:** Flask server hosting the hand gesture and ASL detection model
- **Frontend:** ReactJS-based user interface for real-time video capture and interaction
- **Backend:** Next.js server managing API requests, user sessions, and communication between frontend and AI model

---

## Features

- Real-time hand gesture and American Sign Language detection via webcam
- Seamless integration of AI model (Flask) with frontend (ReactJS) and backend (Next.js)
- Flight-specific assistance features, such as crew call, entertainment control, and feedback submission
- User-friendly UI optimized for in-flight environments
- Multi-modal communication support to aid disabled or hearing-impaired passengers

---

## Technologies Used

- **AI/ML:** Python, Flask, OpenCV, TensorFlow/PyTorch (for ASL and hand gesture recognition)
- **Frontend:** ReactJS, WebRTC (for webcam video capture), Tailwind CSS (for styling)
- **Backend:** Next.js (API routing, session management)
- **Communication:** REST API for Flask model and Next.js backend interaction

---

## Getting Started

### Prerequisites

- Node.js (for ReactJS and Next.js)
- Python 3.x (for Flask and AI model)
- npm or yarn
- pip (Python package manager)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/flight-sign-language-assistant.git
cd flight-sign-language-assistant
```
2 Setup AI Model (Flask)
cd ai-model-flask
pip install -r requirements.txt
python app.py

3 Setup Backend (Next.js)
cd ../backend-nextjs
npm install
npm run dev
Next.js backend runs at http://localhost:3001 by default.

4 Setup Frontend (ReactJS)
cd ../frontend-react
npm install
npm start

5 Usage
Open the frontend in a browser (http://localhost:3000)
Allow webcam access when prompted
Perform ASL gestures or hand signals
The AI model processes gestures and sends interpreted commands through the backend
Relevant flight assistance features activate based on recognized gestures (e.g., call crew, control entertainment,Vending Machine Functionality,Inflight Entertainment)



