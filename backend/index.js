const express = require('express');
const path = require('path');

const bodyParser = require('body-parser');

const eventRoutes = require('./routes/eventRoutes');
const attendeeRoutes = require('./routes/attendeeRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));
// Middleware
app.use(bodyParser.json());

// Routes
app.use('/events', eventRoutes);
app.use('/attendees', attendeeRoutes);
app.use('/tasks', taskRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
