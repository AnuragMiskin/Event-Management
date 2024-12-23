// js/event-details.js
let currentEvent = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        window.location.href = 'index.html';
        return;
    }

    loadEventDetails(eventId);
    
    document.getElementById('addAttendeeForm').addEventListener('submit', handleAddAttendee);
    document.getElementById('addTaskForm').addEventListener('submit', handleAddTask);
});

async function loadEventDetails(eventId) {
    try {
        // Load event details
        const event = await api.get(`/events/${eventId}`);
        currentEvent = event;
        
        document.getElementById('eventDetails').innerHTML = `
            <h2>${event.name}</h2>
            <p>${event.description}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        `;

        // Load attendees and tasks
        await Promise.all([
            loadEventAttendees(),
            loadEventTasks(),
            loadAvailableAttendees()
        ]);

        updateProgressStats();
    } catch (error) {
        console.error('Error loading event details:', error);
        alert('Failed to load event details. Please try again.');
    }
}

async function loadEventAttendees() {
    try {
        const attendees = await api.get('/attendees');
        const eventAttendees = attendees.filter(a => a.event_id === currentEvent.id);
        
        const eventAttendeesHtml = eventAttendees.map(attendee => `
            <div class="list-item">
                <div>
                    <strong>${attendee.name}</strong>
                    <div>${attendee.email}</div>
                </div>
                <button onclick="removeAttendee(${attendee.id})" class="delete-btn">Remove</button>
            </div>
        `).join('');

        document.getElementById('eventAttendees').innerHTML = 
            eventAttendees.length ? eventAttendeesHtml : '<p>No attendees assigned to this event yet.</p>';

        // Update task attendee select
        const taskAttendeeSelect = document.getElementById('taskAttendee');
        taskAttendeeSelect.innerHTML = eventAttendees.map(attendee =>
            `<option value="${attendee.id}">${attendee.name}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading attendees:', error);
        document.getElementById('eventAttendees').innerHTML = '<p>Error loading attendees.</p>';
    }
}

async function loadEventTasks() {
    try {
        const tasks = await api.get(`/tasks/${currentEvent.id}`);
        
        document.getElementById('eventTasks').innerHTML = tasks.map(task => `
            <div class="list-item">
                <div>
                    <strong>${task.name}</strong>
                    <div>Assigned to: ${task.attendee_name}</div>
                // js/event-details.js (continued)
                    <div>Deadline: ${new Date(task.deadline).toLocaleDateString()}</div>
                    <div class="status-${task.status.toLowerCase()}">${task.status}</div>
                </div>
                <button onclick="toggleTaskStatus(${task.id}, '${task.status === 'Pending' ? 'Completed' : 'Pending'}')">
                    ${task.status === 'Pending' ? 'Mark Complete' : 'Mark Pending'}
                </button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadAvailableAttendees() {
    try {
        const attendees = await api.get('/attendees');
        const eventAttendees = attendees.filter(a => a.event_id === currentEvent.id);
        const availableAttendees = attendees.filter(a => !a.event_id || a.event_id !== currentEvent.id);
        
        document.getElementById('attendeeSelect').innerHTML = availableAttendees.map(attendee =>
            `<option value="${attendee.id}">${attendee.name}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading available attendees:', error);
    }
}

async function handleAddAttendee(e) {
    e.preventDefault();
    const attendeeId = document.getElementById('attendeeSelect').value;
    if (!attendeeId) return;

    try {
        // Use the new update endpoint
        await api.put(`/attendees/${attendeeId}`, { event_id: currentEvent.id });
        
        // Show success message
        alert('Attendee added to event successfully!');
        
        // Refresh the attendee lists
        await Promise.all([
            loadEventAttendees(),
            loadAvailableAttendees()
        ]);
        
        // Update progress stats
        updateProgressStats();
    } catch (error) {
        console.error('Error adding attendee to event:', error);
        alert('Failed to add attendee to event. Please try again.');
    }
}


async function handleAddTask(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('taskName').value,
        deadline: document.getElementById('taskDeadline').value,
        attendee_id: document.getElementById('taskAttendee').value,
        event_id: currentEvent.id,
        status: 'Pending'
    };

    try {
        await api.post('/tasks', data);
        e.target.reset();
        await loadEventTasks();
        updateProgressStats();
    } catch (error) {
        console.error('Error creating task:', error);
        alert('Failed to create task. Please try again.');
    }
}

async function removeAttendee(attendeeId) {
    if (!confirm('Are you sure you want to remove this attendee from the event?')) return;

    try {
        // Set event_id to null to remove from event
        await api.put(`/attendees/${attendeeId}`, { event_id: null });
        
        // Show success message
        alert('Attendee removed from event successfully!');
        
        // Refresh the attendee lists
        await Promise.all([
            loadEventAttendees(),
            loadAvailableAttendees()
        ]);
        
        // Update progress stats
        updateProgressStats();
    } catch (error) {
        console.error('Error removing attendee:', error);
        alert('Failed to remove attendee. Please try again.');
    }
}

async function toggleTaskStatus(taskId, newStatus) {
    try {
        await api.put(`/tasks/${taskId}`, { status: newStatus });
        await loadEventTasks();
        updateProgressStats();
    } catch (error) {
        console.error('Error updating task status:', error);
        alert('Failed to update task status. Please try again.');
    }
}

async function updateProgressStats() {
    try {
        const tasks = await api.get(`/tasks/${currentEvent.id}`);
        const attendees = await api.get('/attendees');
        const eventAttendees = attendees.filter(a => a.event_id === currentEvent.id);
        
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        document.getElementById('progressStats').innerHTML = `
            <div class="stat-card">
                <h4>Total Attendees</h4>
                <div class="number">${eventAttendees.length}</div>
            </div>
            <div class="stat-card">
                <h4>Total Tasks</h4>
                <div class="number">${totalTasks}</div>
            </div>
            <div class="stat-card">
                <h4>Completed Tasks</h4>
                <div class="number">${completedTasks}</div>
            </div>
            <div class="stat-card">
                <h4>Completion Rate</h4>
                <div class="number">${completionRate}%</div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${completionRate}%"></div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error updating progress stats:', error);
    }
}
