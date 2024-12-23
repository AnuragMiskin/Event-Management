// js/attendees.js
document.addEventListener('DOMContentLoaded', () => {
    loadAttendees();
    document.getElementById('attendeeForm').addEventListener('submit', handleAttendeeSubmit);
});

async function loadAttendees() {
    try {
        const [attendees, events] = await Promise.all([
            api.get('/attendees'),
            api.get('/events')
        ]);
        
        const attendeesList = document.getElementById('attendeesList');
        attendeesList.innerHTML = attendees.map(attendee => {
            const event = events.find(e => e.id === attendee.event_id);
            return `
                <div class="list-item">
                    <div>
                        <strong>${attendee.name}</strong>
                        <div>${attendee.email}</div>
                        ${event ? `<div><small>Assigned to: ${event.name}</small></div>` : ''}
                    </div>
                    <button onclick="deleteAttendee(${attendee.id})" class="delete-btn">Delete</button>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading attendees:', error);
        alert('Failed to load attendees. Please try again.');
    }
}

async function handleAttendeeSubmit(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('attendeeName').value,
        email: document.getElementById('attendeeEmail').value
    };

    try {
        await api.post('/attendees', data);
        e.target.reset();
        loadAttendees();
    } catch (error) {
        console.error('Error creating attendee:', error);
        alert('Failed to create attendee. Please try again.');
    }
}

async function deleteAttendee(id) {
    if (!confirm('Are you sure you want to delete this attendee?')) return;
    
    try {
        await api.delete(`/attendees/${id}`);
        loadAttendees();
    } catch (error) {
        console.error('Error deleting attendee:', error);
        alert('Failed to delete attendee. Please try again.');
    }
}
