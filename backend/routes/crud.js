// Reusable CRUD router factory - gives GET (list/one), POST, PUT, DELETE for any Mongoose model.
//   GET    /          -> list (supports ?q=search&sort=-points&field=value)
//   GET    /:id       -> read one
//   POST   /          -> create   (login required)
//   PUT    /:id       -> update   (login required)
//   DELETE /:id       -> delete   (admin only)
const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');

module.exports = (Model, { searchField, populate } = {}) => {
  const router = express.Router();
  const withPopulate = (q) => (populate ? q.populate(populate) : q);

  router.get('/', async (req, res, next) => {
    try {
      const { q, sort, ...filters } = req.query;
      const query = {};
      Object.entries(filters).forEach(([key, val]) => { if (val) query[key] = val; });
      if (q && searchField) query[searchField] = { $regex: q, $options: 'i' };
      const items = await withPopulate(Model.find(query).sort(sort || '-createdAt'));
      res.json(items);
    } catch (err) { next(err); }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const item = await withPopulate(Model.findById(req.params.id));
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (err) { next(err); }
  });

  router.post('/', protect, async (req, res, next) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (err) { next(err); }
  });

  router.put('/:id', protect, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json(item);
    } catch (err) { next(err); }
  });

  router.delete('/:id', protect, adminOnly, async (req, res, next) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted successfully' });
    } catch (err) { next(err); }
  });

  return router;
};
