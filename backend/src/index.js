// index.js
const express = require('express');
const app = express();

// Port configuration
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Simple GET endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Node.js!' });
});

// Simple POST endpoint
app.post('/echo', (req, res) => {
  const data = req.body;
  res.json({ received: data });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
