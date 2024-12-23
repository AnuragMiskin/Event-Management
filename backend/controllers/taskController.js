const db = require('../config/db');

// Create a Task
exports.createTask = async (req, res) => {
  const { name, deadline, status, attendee_id, event_id } = req.body;
  try {
    // Validate event_id
    const [event] = await db.query('SELECT id FROM events WHERE id = ?', [event_id]);
    if (event.length === 0) {
      return res.status(400).json({ error: 'Invalid event_id. Event does not exist.' });
    }

    // Validate attendee_id
    const [attendee] = await db.query('SELECT id FROM attendees WHERE id = ?', [attendee_id]);
    if (attendee.length === 0) {
      return res.status(400).json({ error: 'Invalid attendee_id. Attendee does not exist.' });
    }

    // Insert task
    const [result] = await db.query(
      'INSERT INTO tasks (name, deadline, status, attendee_id, event_id) VALUES (?, ?, ?, ?, ?)',
      [name, deadline, status || 'Pending', attendee_id, event_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Task created successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Tasks for an Event
exports.getTasksByEvent = async (req, res) => {
  const { event_id } = req.params;
  try {
    const [tasks] = await db.query(
      'SELECT t.*, a.name AS attendee_name FROM tasks t LEFT JOIN attendees a ON t.attendee_id = a.id WHERE t.event_id = ?',
      [event_id]
    );
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Task Status
exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!['Pending', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use "Pending" or "Completed".' });
    }

    await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    res.status(200).json({ message: 'Task status updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign/Reassign Task
exports.assignTask = async (req, res) => {
  const { id } = req.params;
  const { attendee_id } = req.body;
  try {
    // If attendee_id is provided, verify the attendee exists
    if (attendee_id) {
      const [attendee] = await db.query('SELECT id FROM attendees WHERE id = ?', [attendee_id]);
      if (attendee.length === 0) {
        return res.status(400).json({ error: 'Invalid attendee_id. Attendee does not exist.' });
      }
    }

    await db.query('UPDATE tasks SET attendee_id = ? WHERE id = ?', [attendee_id, id]);
    res.status(200).json({ message: 'Task assignment updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a Task
exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        res.status(200).json({ message: 'Task deleted successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
