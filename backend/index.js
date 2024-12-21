const express = require('express');
const bodyParser = require('body-parser');

const eventRoutes = require('./routes/eventRoutes');
// const attendeeRoutes = require('./routes/attendeeRoutes');
// const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/events', eventRoutes);
// app.use('/attendees', attendeeRoutes);
// app.use('/tasks', taskRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
