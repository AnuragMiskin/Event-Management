const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Create a Task
router.post('/', taskController.createTask);

// Get Tasks for an Event
router.get('/:event_id', taskController.getTasksByEvent);

// Update Task Status
router.put('/:id', taskController.updateTaskStatus);

module.exports = router;
