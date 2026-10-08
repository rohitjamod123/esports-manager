const Team = require('../models/Team');
module.exports = require('./crud')(Team, { searchField: 'name' });
