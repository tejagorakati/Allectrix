const express = require('express');
const { verifyToken, verifyDoctor } = require('../middleware/auth');

const router = express.Router();

// Placeholder routes - to be implemented
router.get('/profile', verifyToken, verifyDoctor, (req, res) => {
  res.json({ success: true, message: 'Doctor routes - Coming soon' });
});

module.exports = router;