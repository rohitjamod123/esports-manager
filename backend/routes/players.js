const Player = require('../models/Player');
module.exports = require('./crud')(Player, { searchField: 'ign', populate: 'team' });
