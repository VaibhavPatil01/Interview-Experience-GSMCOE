# 🎓 Experio

Welcome to **Experio**, a next-generation, AI-driven community platform designed to revolutionize how students prepare for placements. 

Experio is a comprehensive **AI-Assisted Career Prep Ecosystem**. It leverages an advanced **Retrieval-Augmented Generation (RAG)** pipeline powered by **Google Gemini, Vector Databases (Qdrant), and Asynchronous Background Processing (BullMQ/Redis)** to provide hyper-personalized resume analysis, intelligent chat assistance, and a collaborative repository of real interview experiences.

## Purpose

While there are many resources available online for interview preparation, finding experiences specifically from alumni and receiving actionable, data-backed feedback on resumes can be challenging.  

**Experio** is designed to bridge this gap by providing a collaborative repository of **real interview experiences** shared by peers, combined with **AI-driven tools** that actively assist in preparation. 

The platform ensures every student has **equal access to preparation resources**. Whether it's browsing interview posts by company and role, getting a resume graded by an AI that performs semantic searches against successful candidates, or practicing technical questions with a context-aware chat assistant, Experio is built to enhance collective placement readiness and confidence.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Demo](#demo)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [Screenshots](#screenshots)

## Project Overview

Experio goes beyond standard CRUD operations. It is a highly scalable, event-driven platform where the core community features (posting, commenting, sharing) are supercharged with AI capabilities.

The platform is designed to:
- **Democratize Interview Prep**: Provide free access to real interview experiences.
- **Provide Instant Feedback**: Use the RAG pipeline to give students instant, accurate, and non-hallucinated feedback on their resumes based on real past successful candidates.
- **Simulate Real Interviews**: Provide a context-aware AI chat assistant that acts as an interviewer for any given company and role.

Heavy background tasks like embedding synchronization and profile matching are offloaded to **BullMQ + Redis** workers. Real-time social updates and matchmaking notifications are pushed directly to the browser via **Socket.IO**.

## Features

### Intelligent Interview Repository & Social Hub
A highly scalable, event-driven community platform designed for crowd-sourced placement preparation.
- **Structured Experience Sharing**: Write detailed interview posts using a comprehensive, multi-step form that captures round-wise breakdowns, DSA topics, core subjects, and salary details.
- **Event-Driven Engagement**: Upvote, bookmark, and comment on experiences with real-time updates pushed directly to the browser via **Socket.IO** and a **Redis WebSockets adapter**.
- **Asynchronous Processing**: Heavy background tasks, such as profile matching and syncing new posts to the vector database, are aggressively offloaded to asynchronous **BullMQ** worker queues.

### Context-Aware AI Resume Analyzer
A sophisticated evaluation pipeline that moves beyond basic keyword matching to deliver actionable, data-backed insights.
- **RAG-Powered Benchmarking**: Utilizes a robust **Retrieval-Augmented Generation (RAG)** pipeline powered by **Qdrant Vector DB**. The analyzer performs semantic similarity searches against a curated database of successful past candidates to benchmark your resume.
- **Gemini 3.5 Flash Inference**: Orchestrates document extraction and contextual retrieval, feeding the enriched structural context to Google's Gemini LLM to generate a deterministic, highly structured JSON evaluation report.
- **Anti-Hallucination Layer**: Features a cross-referencing validation step that strictly verifies and enriches Gemini's citations against actual database documents, ensuring 100% accurate feedback.

### Conversational Mock Interview Assistant
An interactive, AI-driven chat assistant engineered to simulate high-pressure technical and HR interview rounds.
- **Hyper-Personalized Context**: Automatically ingests the specific company, role, and user profile data to dynamically adjust the interviewer's persona and question difficulty.
- **Stateful Memory Management**: Employs a sophisticated sliding-window memory architecture. It summarizes older conversation turns while perfectly preserving recent context to adhere strictly to the LLM's token context limits.
- **Resilient Streaming**: Leverages Server-Sent Events (SSE) to stream AI responses smoothly to the frontend without latency bottlenecks.

### Enterprise-Grade Security & Cloud Infrastructure
- **Stateless Authentication**: Secure JWT-based authentication paired with **Passport.js** for frictionless Google and GitHub OAuth 2.0 integration.
- **Cloud Object Storage**: Direct integration with **Cloudinary** for scalable, high-performance hosting of user avatars and PDF resumes.
- **Automated Mail Delivery**: Uses **Nodemailer** with Handlebars templates for dispatching secure OTPs and account verification emails.

## Tech Stack

### Frontend (React Ecosystem)
- **Core**: React 18, Vite
- **State Management**: Redux Toolkit (Global), TanStack React Query (Server-state caching)
- **Routing & Splitting**: React Router DOM with `Suspense` and `lazy()` for route-based code splitting
- **Styling & UI**: Tailwind CSS, Framer Motion (Micro-interactions), React Hot Toast
- **Rich Media**: Markdown/HTML Rendering
- **Real-Time**: Socket.IO Client

### Backend (Node & AI Infrastructure)
- **Core**: Node.js, Express.js
- **Database**: MongoDB + Mongoose (Document Store)
- **Vector DB**: Qdrant (Semantic Search & RAG)
- **Message Queue**: BullMQ + Redis (Asynchronous Job Processing)
- **AI Models**: Google GenAI SDK (Gemini 3.5 Flash & Text Embeddings)
- **Authentication**: JWT, Passport.js (OAuth 2.0)
- **Cloud Media**: Cloudinary + Multer
- **Real-Time**: Socket.IO + Redis Adapter (Scalable WebSockets)

## Demo

Experience the platform live:    
[Live Demo](https://interview-experience-gsmcoe.vercel.app/)

## Future Improvements

This project is continuously evolving. Some planned features include:  

- **Downloadable Interview Guides**: Auto-compile company-specific interview guides based on community posts.
- **Mobile App**: React Native version for on-the-go preparation.
- **Leaderboard**: Gamification to reward the most helpful post authors.
- **Advanced Analytics**: Dashboard showing company hiring trends and frequency of specific technical questions.

## Screenshots

Here are some screenshots of the project in action:

### 1. **Homepage**:  
![Homepage](https://i.postimg.cc/yd09qM8j/Screenshot-2026-08-23-172639.png)  

### 2. **Profile Page**:  
![Profile Page](https://i.postimg.cc/Twnm8z3J/Screenshot-2026-08-23-172724.png)  

### 3. **Post List**:  
![Post List](https://i.postimg.cc/B62DWrnx/Screenshot-2026-08-23-172742.png)  

### 4. **Post Form**:  
![Post Form](https://i.postimg.cc/1tD6xk36/Screenshot-2026-08-23-172808.png)

### 5. **AI Resume Analyzer**:  
![AI Resume Analyzer](https://i.postimg.cc/1tD6xk3w/Screenshot-2026-08-23-174447.png)  

### 5. **AI Chat Assistant**:  
![AI Chat Assistant](https://i.postimg.cc/gJ3R9C2Z/Screenshot-2026-08-23-174527.png)  

### 6. **Users List**:  
![Users List](https://i.postimg.cc/fLYX4GRS/Screenshot-2026-08-23-180636.png)  

### 7. **Login Page**:  
![Login Page](https://i.postimg.cc/B62DWrn7/Screenshot-2026-08-23-172538.png)  


---

## Contributing
Contributions are welcome! 🎉  
Whether it's optimizing the RAG pipeline or enhancing the UI, feel free to fork the repo, create a feature branch, and submit a pull request.


## Contact 
If you have any questions or suggestions, feel free to reach out!  
**Developer**: Vaibhav Patil   
