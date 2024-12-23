const db = require('../config/db');

// Add an Attendee
exports.addAttendee = async (req, res) => {
  const { name, email, event_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO attendees (name, email, event_id) VALUES (?, ?, ?)',
      [name, email, event_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Attendee added successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Attendees
exports.getAllAttendees = async (req, res) => {
  try {
    const [attendees] = await db.query('SELECT * FROM attendees');
    res.status(200).json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an Attendee
exports.deleteAttendee = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM attendees WHERE id = ?', [id]);
    res.status(200).json({ message: 'Attendee deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an Attendee
exports.updateAttendee = async (req, res) => {
  const { id } = req.params;
  const { event_id } = req.body;
  try {
    await db.query(
      'UPDATE attendees SET event_id = ? WHERE id = ?',
      [event_id, id]
    );
    res.status(200).json({ message: 'Attendee updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
