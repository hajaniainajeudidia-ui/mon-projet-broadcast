const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const { sendBroadcast, getMyMessages, markAsRead, downloadFile, getAllUsers } = require('../controllers/messageController');

const { protect, adminOnly } = require('../middleware/auth');

// ROUTES ADMIN
router.post('/send',protect,adminOnly,upload.single('file'), sendBroadcast);
router.get('/users', protect, adminOnly, getAllUsers);

// ROUTES UTILISATEUR
router.get('/my-messages', protect, getMyMessages);           
router.patch('/mark-read/:messageId', protect, markAsRead);   
router.get('/download/:messageId', protect, downloadFile);    

//Export
module.exports = router;