// index.js
import express from 'express'
import {supabase} from './db/index.js';
import {testConnection} from './db/index.js';
import authRoutes from './routes/auth.routes.js';
import sessionRoutes from './routes/session.routes.js';
import cors from 'cors';

const app = express();
// Port configuration
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

app.use(
  cors({
    origin: "*",      // allow all origins (remove * in production)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//Routes
app.use('/api/auth',authRoutes);
app.use('/api/session',sessionRoutes);

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
