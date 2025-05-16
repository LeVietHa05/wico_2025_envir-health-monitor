require('dotenv').config();
const express = require('express');
const path = require('path');
const environmentalRouter = require('./routes/environmental');
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/environmental', environmentalRouter);
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;