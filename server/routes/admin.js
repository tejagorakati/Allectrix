const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Placeholder routes - to be implemented
router.get('/dashboard', verifyToken, verifyAdmin, (req, res) => {
  res.json({ success: true, message: 'Admin routes - Coming soon' });
});

module.exports = router;