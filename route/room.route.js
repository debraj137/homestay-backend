const express = require('express');
const router = express.Router();
const roomController = require('../controller/room.controller');
const auth = require('../middleware/auth'); // middleware to verify JWT

router.post('/', auth.verifyToken, roomController.createRoom);
router.put('/update', auth.verifyToken, roomController.updateRoom);
router.get('/', roomController.getAllApprovedRooms);
router.get('/owner', auth.verifyToken, roomController.getOwnerRooms);
router.post('/search/city', roomController.getRoomsByCity);
router.post('/getById', roomController.getRoomById);
module.exports = router;
