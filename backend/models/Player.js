const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  ign: { type: String, required: true, trim: true },          // in-game name
  realName: { type: String, trim: true },
  uid: { type: String, trim: true },
  role: { type: String, enum: ['Rusher', 'Sniper', 'Support', 'IGL'], default: 'Rusher' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  kills: { type: Number, default: 0, min: 0 },
  headshotRate: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
