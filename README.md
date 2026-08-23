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
- [Usage](#usage)
- [Demo](#demo)
- [Future Improvements](#future-improvements)
- [Contributing](#contributing)
- [Screenshots](#screenshots)

## Project Overview

**Interview Experience GSMCOE** is designed to help students preparing for placements by providing a repository of **real interview experiences** shared by their peers. 

Students can browse, search, and filter interview posts by **company, role, or tags**, as well as share their own experiences. The platform ensures every student has **equal access to preparation resources**.

### Key Features:
- **User Authentication**: Secure registration & login with JWT-based authentication.  
- **Post Management**: Users can write, edit, and view detailed interview experiences.  
- **Comments & Reactions**: Engage with posts via comments, likes, and shares.  
- **Search & Filter**: Quickly find experiences by company, role, or keywords.  
- **Rate Us Section**: Students can rate the platform and update their feedback later.  
- **Responsive UI**: Built with Tailwind CSS to support desktop and mobile devices.  

## Features

### Artificial Intelligence
- **RAG Pipeline**: Utilizes **Qdrant Vector DB** for semantic similarity matching of interview experiences.
- **Gemini 3.5 Flash**: Powers the intelligent resume grading and conversational assistant.
- **Real-Time AI Status**: WebSocket integration keeps users updated on the status of background AI processing.

### Community & Social
- **Interview Repository**: Browse, search, and filter real interview experiences by company, role, or tags.
- **Rich Text Authoring**: Write detailed posts with an integrated, image-optimized Quill editor.
- **Engagement**: Upvote, comment, and share experiences.

### Security & Cloud
- **Robust Auth**: JWT-based stateless authentication, paired with Google & GitHub OAuth via Passport.js.
- **Cloud Storage**: Seamless integration with **Cloudinary** for scalable profile picture and PDF resume hosting.
- **Email Verification**: Automated OTP and verification links via Nodemailer. 

## Tech Stack

- **Frontend**:
  - Javascript
  - React
  - Redux
  - React Router Dom
  - Formik and Yup
  - React Query
  - Axios
  - React Hot Toast
  - Quill Editor
  - React Icons
  - Helmet
  - Eslint
  - Prettier
  - AirBnb Lint Configs
  - Google Analytics and Google Search Console

- **Backend**:
  - Node.js
  - Express.js
  - MongoDB + Mongoose
  - JWT (Authentication)
  - Bcrypt.js (Password hashing)
  - Eslint
  - Prettier

## Usage 

### As a Student:
1. Register or login with your account.  
2. Browse interview experiences by company, role, or tags.  
3. Post your own interview experience to help others.  
4. Comment, upvote, and share experiences.  
5. Rate the platform and give feedback.  

## Demo

You can view the live demo of the project here:  
[Live Demo](https://interview-experience-gsmcoe.vercel.app/)

## Future Improvements

This project is continuously evolving. Some planned features include:  

- **Downloadable Interview Guides**  
- **Notification System** (email + in-app)  
- **Mobile App (React Native)**  
- **Leaderboard for Most Helpful Posts**  
- **Company-specific preparation guides**  

## Screenshots

Here are some screenshots of the project in action:

### 1. **Homepage**:  
![Homepage](https://i.postimg.cc/fb3X5b3Y/home-page.png)  

### 2. **Profile Page**:  
![Profile Page](https://i.postimg.cc/vTyVQL0v/profile-page.png)  

### 3. **Post List**:  
![Post List](https://i.postimg.cc/133DnBsC/post-list.png)  

### 4. **Login Page**:  
![Login Page](https://i.postimg.cc/G2yF3pdb/login.png)  

### 5. **Registration Page**:  
![Registration Page](https://i.postimg.cc/FFbST8KC/registration.png)  

### 6. **Post Form**:  
![Post Form](https://i.postimg.cc/GhrFrrN1/post-form.png)  

### 7. **User List**:  
![User List](https://i.postimg.cc/Z5nyKqxX/user-list.png)  

### 8. **Events Page**:  
![Events Page](https://i.postimg.cc/RhwLdZDg/events.png)  

---

## Contributing
Contributions are welcome! 🎉  
Feel free to fork the repo, create a feature branch, and submit a pull request.


## Contact 
If you have any questions or suggestions, feel free to reach out!  
**Developer**: Vaibhav Patil   
