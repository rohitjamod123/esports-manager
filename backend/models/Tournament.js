const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  prize: { type: Number, required: true, min: 0 },            // prize pool in INR
  mode: { type: String, enum: ['Solo', 'Duo', 'Squad'], default: 'Squad' },
  slots: { type: Number, required: true, min: 2, max: 64 },
  startDate: { type: Date, required: true },
  status: { type: String, enum: ['Upcoming', 'Live', 'Completed'], default: 'Upcoming' },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
