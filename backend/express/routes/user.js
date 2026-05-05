// routes/user.js
const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser, createUser } = require('../controllers/userController');

const { protect, adminOnly } = require('../middleware/auth');

// Toutes les routes sont réservées aux admins
router.get('/', protect, adminOnly, getUsers);
router.get('/:id', protect, adminOnly, getUserById);
router.patch('/:id', protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);
router.post('/', protect, adminOnly, createUser);

module.exports = router;