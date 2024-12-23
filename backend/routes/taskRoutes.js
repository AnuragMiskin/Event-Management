const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Create a Task
router.post('/', taskController.createTask);

// Get Tasks for an Event
router.get('/:event_id', taskController.getTasksByEvent);

// Update Task Status
router.put('/:id', taskController.updateTaskStatus);

router.put('/:id/assign', taskController.assignTask);

// Add this line to handle DELETE requests for tasks
router.delete('/:id', taskController.deleteTask);

module.exports = router;
