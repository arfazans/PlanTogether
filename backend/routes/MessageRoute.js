const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {getUserForSidebar,getMessages,sendMessage,getRecentMessages,markMessagesRead } = require('../controller/MessageController');

router
.get('/users',getUserForSidebar)
.get('/recent-messages', getRecentMessages)
.get('/:id', getMessages)
.post('/send/:id', upload.single('image'), sendMessage)
.post('/read/:id', markMessagesRead);
module.exports = router;