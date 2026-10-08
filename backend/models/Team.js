const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  tag: { type: String, required: true, uppercase: true, maxlength: 5, trim: true },
  region: { type: String, default: 'India', trim: true },
  captain: { type: String, required: true, trim: true },
  wins: { type: Number, default: 0, min: 0 },
  points: { type: Number, default: 0, min: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }   // captain account that created the squad
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
