// js/events.js
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();

    document.getElementById('eventForm').addEventListener('submit', handleEventSubmit);
    document.getElementById('toggleEventForm').addEventListener('click', () => {
        const form = document.getElementById('eventForm');
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
});

async function loadEvents() {
    try {
        const events = await api.get('/events');
        const eventsList = document.getElementById('eventsList');
        
        eventsList.innerHTML = events.map(event => `
            <div class="card">
                <h3>${event.name}</h3>
                <p>${event.description}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Date:</strong> ${formatDate(event.date)}</p>
                <div style="margin-top: 15px">
                    <button onclick="window.location.href='event-details.html?id=${event.id}'">
                        View Details
                    </button>
                    <button onclick="deleteEvent(${event.id})" class="delete-btn">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        alert('Failed to load events. Please try again.');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

async function handleEventSubmit(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('eventName').value,
        description: document.getElementById('eventDescription').value,
        location: document.getElementById('eventLocation').value,
        date: document.getElementById('eventDate').value
    };

    try {
        await api.post('/events', data);
        loadEvents();
        e.target.reset();
        document.getElementById('eventForm').style.display = 'none';
    } catch (error) {
        console.error('Error creating event:', error);
        alert('Failed to create event. Please try again.');
    }
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
        await api.delete(`/events/${id}`);
        loadEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
    }
}
