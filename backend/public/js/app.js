const API_BASE_URL = 'http://localhost:3000';

// Fetch and display all events
async function fetchEvents() {
  const response = await fetch(`${API_BASE_URL}/events`);
  const events = await response.json();

  const eventList = document.getElementById('event-list');
  eventList.innerHTML = ''; // Clear previous list

  events.forEach(event => {
    const eventDiv = document.createElement('div');
    eventDiv.innerHTML = `
      <strong>${event.name}</strong> (${event.date})<br>
      ${event.description}<br>
      Location: ${event.location}<br>
      <button onclick="prefillUpdateForm(${event.id})">Edit</button>
      <button onclick="deleteEvent(${event.id})">Delete</button>
    `;
    eventList.appendChild(eventDiv);
  });  
}

// Create a new event
async function createEvent(event) {
  event.preventDefault();

  const name = document.getElementById('event-name').value;
  const description = document.getElementById('event-description').value;
  const location = document.getElementById('event-location').value;
  const date = document.getElementById('event-date').value;

  const response = await fetch(`${API_BASE_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, location, date })
  });

  if (response.ok) {
    alert('Event created successfully!');
    fetchEvents();
    document.getElementById('event-form').reset();
  } else {
    const error = await response.json();
    alert(`Error: ${error.message}`);
  }
}

// Delete an event
async function deleteEvent(id) {
  if (confirm('Are you sure you want to delete this event?')) {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Event deleted successfully!');
      fetchEvents();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  }
}
//update
async function prefillUpdateForm(eventId) {
  const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
  const event = await response.json();

  // Populate the form fields
  document.getElementById('update-event-id').value = event.id;
  document.getElementById('update-event-name').value = event.name;
  document.getElementById('update-event-description').value = event.description;
  document.getElementById('update-event-location').value = event.location;
  document.getElementById('update-event-date').value = event.date;
}

async function updateEvent(event) {
  event.preventDefault();

  const id = document.getElementById('update-event-id').value;
  const name = document.getElementById('update-event-name').value;
  const description = document.getElementById('update-event-description').value;
  const location = document.getElementById('update-event-location').value;
  const date = document.getElementById('update-event-date').value;

  const response = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, location, date })
  });

  if (response.ok) {
    alert('Event updated successfully!');
    fetchEvents(); // Reload the events list
    document.getElementById('update-event-form').reset();
  } else {
    const error = await response.json();
    alert(`Error: ${error.message}`);
  }
}

// Add event listener to the form
document.getElementById('event-form').addEventListener('submit', createEvent);
// Load events on page load
fetchEvents();

//update
document.getElementById('update-event-form').addEventListener('submit', updateEvent);



// Fetch and display all attendees
async function fetchAttendees() {
  const response = await fetch(`${API_BASE_URL}/attendees`);
  const attendees = await response.json();

  const attendeeList = document.getElementById('attendee-list');
  attendeeList.innerHTML = ''; // Clear previous list

  attendees.forEach(attendee => {
    const attendeeDiv = document.createElement('div');
    attendeeDiv.innerHTML = `
      <strong>${attendee.name}</strong> (${attendee.email})<br>
      <button onclick="deleteAttendee(${attendee.id})">Delete</button>
    `;
    attendeeList.appendChild(attendeeDiv);
  });
}

// Create a new attendee
async function addAttendee(event) {
  event.preventDefault();

  const name = document.getElementById('attendee-name').value;
  const email = document.getElementById('attendee-email').value;
  const eventId = document.getElementById('attendee-event-id').value;

  const response = await fetch(`${API_BASE_URL}/attendees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, event_id: eventId })
  });

  if (response.ok) {
    alert('Attendee added successfully!');
    fetchAttendees(); // Reload the attendees list
    document.getElementById('attendee-form').reset();
  } else {
    const error = await response.json();
    alert(`Error: ${error.message}`);
  }
}

// Delete an attendee
async function deleteAttendee(id) {
  if (confirm('Are you sure you want to delete this attendee?')) {
    const response = await fetch(`${API_BASE_URL}/attendees/${id}`, { method: 'DELETE' });
    if (response.ok) {
      alert('Attendee deleted successfully!');
      fetchAttendees(); // Reload the attendees list
    } else {
      const error = await response.json();
      alert(`Error: ${error.message}`);
    }
  }
}

// Add event listener to the attendee form
document.getElementById('attendee-form').addEventListener('submit', addAttendee);

// Load attendees on page load
fetchAttendees();