const express = require('express');
const router = express.Router();
const { getAllMessages, markAsRead, updateMessageStatus, deleteMessage } = require('../controllers/adminMessageController');
const verifyToken = require('../middlewares/authMiddleware');

// Semua rute admin diproteksi oleh verifyToken
router.get('/', verifyToken, getAllMessages);
router.put('/:id/read', verifyToken, markAsRead);
router.put('/:id/status', verifyToken, updateMessageStatus);
router.delete('/:id', verifyToken, deleteMessage);

module.exports = router;