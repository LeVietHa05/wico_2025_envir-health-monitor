require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const environmentalRouter = require('./routes/environmental');
const healthRouter = require('./routes/health');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/environmental', environmentalRouter);
app.use('/api/health', healthRouter);

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;