const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const Player = require('../models/Player');
const { protect } = require('../middleware/auth');

const router = require('./crud')(Tournament, { searchField: 'title', populate: 'teams' });

const ROLES = ['IGL', 'Rusher', 'Sniper', 'Support'];   // default roles for player 1 to 4
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/*
  POST /api/tournaments/:id/register
  Body: { teamName, tag, players: [ { ign, uid } x 4 ] }
  - creates the squad and its 4 players (player 1 = captain)
  - if the captain already owns a squad with this name, that squad is reused
  - then locks a slot in the tournament
*/
router.post('/:id/register', protect, async (req, res, next) => {
  let createdTeam = null;
  try {
    const name = String(req.body.teamName || '').trim();
    const tag = String(req.body.tag || '').trim().toUpperCase();
    const players = req.body.players;

    // ---- validate the form ----
    if (name.length < 3) return res.status(400).json({ message: 'Squad name must be at least 3 characters' });
    if (!tag || tag.length > 5) return res.status(400).json({ message: 'Tag is required (maximum 5 characters)' });
    if (!Array.isArray(players) || players.length !== 4) {
      return res.status(400).json({ message: 'Exactly 4 players are required' });
    }
    const clean = players.map((p) => ({ ign: String((p && p.ign) || '').trim(), uid: String((p && p.uid) || '').trim() }));
    for (let i = 0; i < clean.length; i++) {
      if (!clean[i].ign) return res.status(400).json({ message: `Player ${i + 1}: in-game name is required` });
      if (!/^\d{6,12}$/.test(clean[i].uid)) return res.status(400).json({ message: `Player ${i + 1}: UID must be 6 to 12 digits` });
    }
    if (new Set(clean.map((p) => p.ign.toLowerCase())).size !== 4) return res.status(400).json({ message: 'Each player needs a different in-game name' });
    if (new Set(clean.map((p) => p.uid)).size !== 4) return res.status(400).json({ message: 'Each player needs a different UID' });

    // ---- check the tournament ----
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    if (tournament.status === 'Completed') return res.status(400).json({ message: 'Tournament already completed' });
    if (tournament.teams.length >= tournament.slots) return res.status(400).json({ message: 'All slots are full' });

    // ---- find or create the squad ----
    let team = await Team.findOne({ name: new RegExp('^' + escapeRegex(name) + '$', 'i') });
    if (team) {
      const isOwner = team.owner ? String(team.owner) === String(req.user.id) : req.user.role === 'admin';
      if (!isOwner) return res.status(400).json({ message: 'This squad name is already taken. Choose a different name.' });
      if (tournament.teams.some((t) => t.equals(team._id))) return res.status(400).json({ message: 'Your squad is already registered in this tournament' });
    } else {
      const taken = await Player.findOne({ uid: { $in: clean.map((p) => p.uid) } });
      if (taken) return res.status(400).json({ message: `UID ${taken.uid} is already registered with another squad` });

      team = await Team.create({ name, tag, captain: clean[0].ign, owner: req.user.id });
      createdTeam = team;
      await Player.insertMany(clean.map((p, i) => ({ ign: p.ign, uid: p.uid, role: ROLES[i], team: team._id })));
    }

    // ---- lock the slot ----
    tournament.teams.push(team._id);
    await tournament.save();
    res.json(await tournament.populate('teams'));
  } catch (err) {
    // undo a half-created squad so the database stays clean
    if (createdTeam) {
      await Player.deleteMany({ team: createdTeam._id });
      await Team.findByIdAndDelete(createdTeam._id);
    }
    next(err);
  }
});

module.exports = router;
