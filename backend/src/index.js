// index.js
import express from 'express'
import {supabase} from './db/index.js';
import {testConnection} from './db/index.js';
import authRoutes from './routes/auth.routes.js';
import sessionRoutes from './routes/session.routes.js';
import cors from 'cors';
import questionsRoutes from './routes/questions.routes.js';
import participantRoutes from './routes/participant.routes.js';
import questionRoutes from './routes/questions.routes.js';

const app = express();
// Port configuration
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://quiz-app-tzvw.vercel.app" // your actual domain
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

//Routes
app.use('/api/auth',authRoutes);
app.use('/api/session',sessionRoutes);
app.use('/api/sessions/:sessionId/questions',questionsRoutes);
app.use('/api/participants',participantRoutes);

// Simple GET endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Node.js!' });
});

// Simple POST endpoint
app.post('/echo', (req, res) => {
  const data = req.body;
  res.json({ received: data });
});

//test database connection
app.get("/test-connection",async(req,res) => {
  try{
    const ok = await testConnection();
    if (ok){
      return res.status(200).json({
        status : 'ok',
        message : 'Supabase connection successful',
      });
    }else{
      return res.status(500).json({
        status: 'fail',
        message : 'Supabase connection failed',
      });
    }
  }catch(err){
    return res.status(500).json({
      status: 'fail',
      message : 'Error checking Supabase connection',
      error : err.message,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});