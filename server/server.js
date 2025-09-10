// Load environment variables automatically (shorthand)
import 'dotenv/config';

// Import necessary modules
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';

// Import custom modules
import './configs/passport.js';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import postRouter from './routes/postRoutes.js';
import commentRouter from './routes/commentRoutes.js';
import preventServerSleep from './utils/preventServerSleep.js'; 

import Sentiment from 'sentiment';

// --------------------- Connect to MongoDB ---------------------
await connectDB();

// --------------------- Express App ---------------------
const app = express();

// --------------------- CORS ---------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://interview-experience-gsmcoe.vercel.app",
  "https://interview-experience-gsmcoe.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// --------------------- Middlewares ---------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// --------------------- Static Files ---------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// --------------------- Test Route ---------------------
app.post('/test-sentiment', (req, res) => {
  const sentiment = new Sentiment();
  const result = sentiment.analyze(req.body.content || "");
  const sentimentLabel =
    result.score > 0 ? "positive" : result.score < 0 ? "negative" : "neutral";

  res.json({
    score: result.score,
    comparative: result.comparative,
    sentiment: sentimentLabel,
    words: result.words,
  });
});

// --------------------- API Routes ---------------------
app.use('/user', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);

// --------------------- Home Route ---------------------
app.get('/', (req, res) => {
  res.status(200).json({ name: 'Interview Experience API' });
});

// --------------------- Start Server ---------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
  preventServerSleep(); // Schedule background task
});

export default app;
