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






import Sentiment from 'sentiment'




// Connect to MongoDB
await connectDB(); 

// Create Express App  
const app = express();

// CORS Options
const corsOptions = {
  origin: process.env.CLIENT_BASE_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
// app.options('*', cors(corsOptions));

// Serve static files from 'public' folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));



//
app.get('/test-sentiment', (req, res) => {


  const sentiment = new Sentiment();
  const result = sentiment.analyze(req.body.content);
  const sentimentLabel = result.score > 0 ? 'positive' : result.score < 0 ? 'negative' : 'neutral';

  res.json({
    score: result.score,
    comparative: result.comparative,
    sentiment: sentimentLabel,
    words: result.words,
  });
});

//





// API Routes
app.use('/user', userRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
// app.use('/quiz', routes.quizRoutes);

// Home Route
app.get('/', (req, res) => {
  res.status(200).json({ name: 'Interview Experience API' });
});

// Fallback Route (404)
// app.use('*', (req, res) => {
//   res.status(404).json({ message: 'API URL is not valid' }); 
// });

// Start Server
const PORT = process.env.PORT || 3000;
// const NODE_VERSION = process.env.NODE_VERSION;

app.listen(PORT, () => {
  console.log(`✅ Server is running on PORT ${PORT}`);
  // console.info(`🧠 Node Version: ${NODE_VERSION || process.version}`);
  preventServerSleep(); // Schedule background task
});

export default app; 
