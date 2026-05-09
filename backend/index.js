require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
/*
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
*/

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Harikrishnan Portfolio API is running' });
});

const path = require('path');

// Routes
const projectsRoute = require('./routes/projects');
app.use('/api/projects', projectsRoute);

// Serve Flutter Web Build
app.use(express.static(path.join(__dirname, '../build/web')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build/web/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

