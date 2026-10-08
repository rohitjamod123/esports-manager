require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const Team = require('./models/Team');
const Player = require('./models/Player');
const Tournament = require('./models/Tournament');

const app = express();

// ---------- Middleware ----------
app.use(cors());                 // allows the React dev server (port 5173) to call this API
app.use(express.json());
app.use((req, res, next) => {    // simple request logger
  if (req.url.startsWith('/api')) console.log(`${req.method} ${req.url}`);
  next();
});

// ---------- API routes ----------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/players', require('./routes/players'));
app.use('/api/tournaments', require('./routes/tournaments'));

app.get('/api/stats', async (req, res, next) => {
  try {
    const [teams, players, tournaments, live] = await Promise.all([
      Team.countDocuments(), Player.countDocuments(), Tournament.countDocuments(),
      Tournament.countDocuments({ status: 'Live' })
    ]);
    const prizeAgg = await Tournament.aggregate([{ $group: { _id: null, total: { $sum: '$prize' } } }]);
    res.json({ teams, players, tournaments, live, prizePool: prizeAgg[0] ? prizeAgg[0].total : 0 });
  } catch (err) { next(err); }
});

// ---------- Serve the HTML/CSS/JS frontend ----------
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ---------- Error handling ----------
app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID or value' });
  if (err.code === 11000) return res.status(400).json({ message: 'Duplicate value: that name/email already exists' });
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running -> http://localhost:${PORT}`)))
  .catch((err) => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
