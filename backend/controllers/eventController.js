const db = require('../config/db');

// Create an Event
exports.createEvent = async (req, res) => {
  const { name, description, location, date } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO events (name, description, location, date) VALUES (?, ?, ?, ?)',
      [name, description, location, date]
    );
    res.status(201).json({ id: result.insertId, message: 'Event created successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Events
exports.getAllEvents = async (req, res) => {
  try {
    const [events] = await db.query('SELECT * FROM events');
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an Event
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, location, date } = req.body;
  try {
    await db.query(
      'UPDATE events SET name = ?, description = ?, location = ?, date = ? WHERE id = ?',
      [name, description, location, date, id]
    );
    res.status(200).json({ message: 'Event updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an Event
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM events WHERE id = ?', [id]);
    res.status(200).json({ message: 'Event deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get an Event by ID
exports.getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const [event] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
    if (event.length > 0) {
      res.status(200).json(event[0]);
    } else {
      res.status(404).json({ error: 'Event not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
