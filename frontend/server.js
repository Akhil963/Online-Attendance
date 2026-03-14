/**
 * Express Server for Frontend
 * Alternative to static hosting - solves SPA routing issues
 * 
 * Usage:
 * 1. Update render.yaml to use this instead of static site
 * 2. Change buildCommand: cd frontend && npm run build
 * 3. Change startCommand: node frontend/server.js
 * 4. Set PORT environment variable (defaults to 3000)
 */

const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1d',
  etag: false
}));

// SPA routing - serve index.html for all non-static routes
app.get('*', (req, res) => {
  // Serve index.html for all routes
  // React Router will handle the client-side routing
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
});
