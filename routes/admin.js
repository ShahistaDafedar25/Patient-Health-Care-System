const express = require('express');
const router = express.Router();

// Define your routes for the admin portal
router.get('/login', (req, res) => {
    res.send('Admin Login Page');
});

router.get('/dashboard', (req, res) => {
    res.send('Admin Dashboard');
});

module.exports = router; 