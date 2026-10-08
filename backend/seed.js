// Run once:  npm run seed   -> fills the database with demo data
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Team = require('./models/Team');
const Player = require('./models/Player');
const Tournament = require('./models/Tournament');

const day = 24 * 60 * 60 * 1000;

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Team.deleteMany(), Player.deleteMany(), Tournament.deleteMany()]);

  await User.create({ name: 'Admin', email: 'admin@booyah.com', password: 'admin123', role: 'admin' });
  await User.create({ name: 'Demo Captain', email: 'captain@booyah.com', password: 'captain123', role: 'captain' });

  const teams = await Team.insertMany([
    { name: 'Desert Hawks', tag: 'DSH', region: 'Gujarat', captain: 'Hawk', wins: 14, points: 1420 },
    { name: 'Blaze Squad', tag: 'BLZ', region: 'Maharashtra', captain: 'Blaze', wins: 12, points: 1315 },
    { name: 'Nova Esports', tag: 'NOVA', region: 'Delhi', captain: 'Nova', wins: 10, points: 1180 },
    { name: 'Phoenix Rising', tag: 'PHX', region: 'Rajasthan', captain: 'Ash', wins: 9, points: 1040 },
    { name: 'Storm Riders', tag: 'STR', region: 'Karnataka', captain: 'Rider', wins: 7, points: 905 },
    { name: 'Night Wolves', tag: 'NWV', region: 'Tamil Nadu', captain: 'Wolf', wins: 5, points: 760 }
  ]);

  const roles = ['IGL', 'Rusher', 'Sniper', 'Support'];
  const players = [];
  teams.forEach((t, ti) => {
    roles.forEach((role, ri) => {
      players.push({
        ign: `${t.tag}_${['Zero', 'Viper', 'Ghost', 'Pixel'][ri]}`,
        realName: `Player ${ti * 4 + ri + 1}`,
        uid: String(5000000 + ti * 100 + ri),
        role, team: t._id,
        kills: 300 + ((ti * 37 + ri * 53) % 400),
        headshotRate: 25 + ((ti * 7 + ri * 11) % 45)
      });
    });
  });
  await Player.insertMany(players);

  await Tournament.insertMany([
    { title: 'Booyah Masters Cup', prize: 500000, mode: 'Squad', slots: 12, status: 'Upcoming', startDate: new Date(Date.now() + 5 * day), teams: [teams[0]._id, teams[1]._id, teams[2]._id] },
    { title: 'Island Clash Weekly', prize: 100000, mode: 'Squad', slots: 8, status: 'Live', startDate: new Date(Date.now() - 1 * day), teams: teams.slice(0, 5).map((t) => t._id) },
    { title: 'Duo Rush Showdown', prize: 50000, mode: 'Duo', slots: 16, status: 'Upcoming', startDate: new Date(Date.now() + 12 * day), teams: [teams[3]._id] },
    { title: 'Campus Champions League', prize: 25000, mode: 'Squad', slots: 6, status: 'Upcoming', startDate: new Date(Date.now() + 20 * day), teams: [] },
    { title: 'Winter Finals 2025', prize: 750000, mode: 'Squad', slots: 12, status: 'Completed', startDate: new Date(Date.now() - 40 * day), teams: teams.map((t) => t._id) }
  ]);

  console.log('Seed complete.\nAdmin:   admin@booyah.com / admin123\nCaptain: captain@booyah.com / captain123');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
