const express = require('express');
const router = express.Router();
const attendeeController = require('../controllers/attendeeController');

// Add an Attendee
router.post('/', attendeeController.addAttendee);

// Get All Attendees
router.get('/', attendeeController.getAllAttendees);

// Delete an Attendee
router.delete('/:id', attendeeController.deleteAttendee);

module.exports = router;
