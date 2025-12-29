# 🎨 PixelPoet: AI-Powered Social Media Content Generator (MVP)

> **Status:** 🚧 Prototype / Work in Progress
> **Tech Stack:** Next.js (React), FastAPI (Python), TensorFlow/PyTorch, Transformers (BLIP + Flan-T5)

## 🚀 Overview
PixelPoet is an automated content creation tool designed to streamline the workflow for social media managers and creators. By leveraging **Computer Vision (Salesforce BLIP)** and **Large Language Models (Google Flan-T5)**, it analyzes images/videos and instantly generates viral, professional, or artistic captions with relevant hashtags.

This repository serves as the **MVP (Minimum Viable Product)** demonstrating the core AI pipeline integration.

## ✨ Key Features (Implemented)
* **🖼️ Smart Image Analysis:** Uses Deep Learning to "see" and understand image context.
* **🎥 Video Frame Extraction:** Automatically grabs keyframes from video uploads for analysis.
* **✍️ Context-Aware Copywriting:** Generates distinct writing styles (Viral, Professional, Poetic) rather than generic descriptions.
* **⚡ Real-Time Inference:** Runs inference locally using optimized Hugging Face pipelines.

## 🛠️ Installation & Setup

### 1. Backend (Python/FastAPI)
The brain of the operation. Handles AI inference.
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
Note: First run will download AI models (~1.5GB).

2. Frontend (Next.js)
The modern UI for drag-and-drop uploads.

Bash

cd frontend
npm install
npm run dev
🔮 Future Roadmap (To-Do)
[ ] Add User Authentication (Supabase/Auth0)

[ ] Direct posting to Instagram/Twitter APIs

[ ] History & Analytics Dashboard

[ ] Cloud Deployment (AWS/Vercel)

Built with ❤️ by [Zain Ali]
