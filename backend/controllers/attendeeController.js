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
        const [attendees] = await db.query(`
            SELECT a.*, e.name as event_name 
            FROM attendees a 
            LEFT JOIN events e ON a.event_id = e.id
        `);
        res.status(200).json(attendees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete an Attendee
exports.deleteAttendee = async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();
    
    try {
        await conn.beginTransaction();

        // First, delete all tasks assigned to this attendee
        await conn.query('UPDATE tasks SET attendee_id = NULL WHERE attendee_id = ?', [id]);
        
        // Then delete the attendee
        await conn.query('DELETE FROM attendees WHERE id = ?', [id]);
        
        await conn.commit();
        res.status(200).json({ message: 'Attendee and associated tasks deleted successfully!' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
};

// Update an Attendee
exports.updateAttendee = async (req, res) => {
    const { id } = req.params;
    const { event_id } = req.body;
    const conn = await db.getConnection();
    
    try {
        await conn.beginTransaction();
        
        // If removing from event (event_id is null), handle associated tasks
        if (event_id === null) {
            await conn.query('UPDATE tasks SET attendee_id = NULL WHERE attendee_id = ?', [id]);
        }
        
        // Update the attendee's event assignment
        await conn.query(
            'UPDATE attendees SET event_id = ? WHERE id = ?',
            [event_id, id]
        );
        
        await conn.commit();
        res.status(200).json({ message: 'Attendee updated successfully!' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
};

// Get Attendees for a specific event
exports.getEventAttendees = async (req, res) => {
    const { event_id } = req.params;
    try {
        const [attendees] = await db.query(
            'SELECT * FROM attendees WHERE event_id = ?',
            [event_id]
        );
        res.status(200).json(attendees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
