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
    document.getElementById('editEventForm').addEventListener('submit', handleEventUpdate);
});

async function loadEventDetails(eventId) {
    try {
        // Load event details
        const event = await api.get(`/events/${eventId}`);
        currentEvent = event;
        
        // Update view mode
        document.querySelector('#eventDetails .view-mode').innerHTML = `
            <h2>${event.name}</h2>
            <p>${event.description}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <button onclick="toggleEditMode(true)">Edit Event</button>
        `;

        // Update edit form
        document.getElementById('editEventName').value = event.name;
        document.getElementById('editEventDescription').value = event.description;
        document.getElementById('editEventLocation').value = event.location;
        document.getElementById('editEventDate').value = event.date.split('T')[0];

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

function toggleEditMode(show) {
    document.querySelector('#eventDetails .view-mode').style.display = show ? 'none' : 'block';
    document.querySelector('#eventDetails .edit-mode').style.display = show ? 'block' : 'none';
}

async function handleEventUpdate(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('editEventName').value,
        description: document.getElementById('editEventDescription').value,
        location: document.getElementById('editEventLocation').value,
        date: document.getElementById('editEventDate').value
    };

    try {
        await api.put(`/events/${currentEvent.id}`, data);
        toggleEditMode(false);
        loadEventDetails(currentEvent.id);
        alert('Event updated successfully!');
    } catch (error) {
        console.error('Error updating event:', error);
        alert('Failed to update event. Please try again.');
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

        return eventAttendees;
    } catch (error) {
        console.error('Error loading attendees:', error);
        document.getElementById('eventAttendees').innerHTML = '<p>Error loading attendees.</p>';
        return [];
    }
}

async function loadEventTasks() {
    try {
        const tasks = await api.get(`/tasks/${currentEvent.id}`);
        const attendees = await api.get('/attendees');
        const eventAttendees = attendees.filter(a => a.event_id === currentEvent.id);
        
        document.getElementById('eventTasks').innerHTML = tasks.map(task => {
            // Create attendee selection dropdown for reassignment
            const attendeeOptions = eventAttendees.map(attendee =>
                `<option value="${attendee.id}" ${attendee.id === task.attendee_id ? 'selected' : ''}>
                    ${attendee.name}
                </option>`
            ).join('');

            return `
                <div class="list-item">
                    <div>
                        <strong>${task.name}</strong>
                        ${task.attendee_id ? 
                            `<div>Assigned to: ${task.attendee_name}</div>` :
                            `<div class="form-group">
                                <select class="task-reassign" data-task-id="${task.id}">
                                    <option value="">Select Assignee</option>
                                    ${attendeeOptions}
                                </select>
                            </div>`
                        }
                        <div>Deadline: ${new Date(task.deadline).toLocaleDateString()}</div>
                        <div class="status-${task.status.toLowerCase()}">${task.status}</div>
                    </div>
                    <div>
                        ${task.attendee_id ? 
                            `<button onclick="unassignTask(${task.id})" class="delete-btn">Unassign</button>` : ''
                        }
                        <button onclick="toggleTaskStatus(${task.id}, '${task.status === 'Pending' ? 'Completed' : 'Pending'}')">
                            ${task.status === 'Pending' ? 'Mark Complete' : 'Mark Pending'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add change event listeners for task reassignment
        document.querySelectorAll('.task-reassign').forEach(select => {
            select.addEventListener('change', (e) => {
                const taskId = e.target.dataset.taskId;
                const newAttendeeId = e.target.value;
                if (newAttendeeId) {
                    reassignTask(taskId, newAttendeeId);
                }
            });
        });

        return tasks;
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('eventTasks').innerHTML = '<p>Error loading tasks.</p>';
        return [];
    }
}

// Add these new functions
async function unassignTask(taskId) {
    if (!confirm('Are you sure you want to unassign this task?')) return;

    try {
        await api.put(`/tasks/${taskId}/assign`, { attendee_id: null });
        await loadEventTasks();
        updateProgressStats();
    } catch (error) {
        console.error('Error unassigning task:', error);
        alert('Failed to unassign task. Please try again.');
    }
}

async function reassignTask(taskId, attendeeId) {
    try {
        await api.put(`/tasks/${taskId}/assign`, { attendee_id: attendeeId });
        await loadEventTasks();
        updateProgressStats();
    } catch (error) {
        console.error('Error reassigning task:', error);
        alert('Failed to reassign task. Please try again.');
    }
}

async function loadAvailableAttendees() {
    try {
        const attendees = await api.get('/attendees');
        const availableAttendees = attendees.filter(a => !a.event_id || a.event_id !== currentEvent.id);
        
        document.getElementById('attendeeSelect').innerHTML = availableAttendees.map(attendee =>
            `<option value="${attendee.id}">${attendee.name}</option>`
        ).join('');

        if (availableAttendees.length === 0) {
            document.getElementById('attendeeSelect').innerHTML = '<option value="">No available attendees</option>';
        }
    } catch (error) {
        console.error('Error loading available attendees:', error);
        document.getElementById('attendeeSelect').innerHTML = '<option value="">Error loading attendees</option>';
    }
}

async function handleAddAttendee(e) {
    e.preventDefault();
    const attendeeId = document.getElementById('attendeeSelect').value;
    if (!attendeeId) return;

    try {
        await api.put(`/attendees/${attendeeId}`, { event_id: currentEvent.id });
        
        // Refresh the attendee lists
        await Promise.all([
            loadEventAttendees(),
            loadAvailableAttendees()
        ]);
        
        // Update progress stats
        updateProgressStats();
        
        // Show success message
        alert('Attendee added to event successfully!');
    } catch (error) {
        console.error('Error adding attendee to event:', error);
        alert('Failed to add attendee to event. Please try again.');
    }
}

async function handleAddTask(e) {
    e.preventDefault();
    
    const attendeeSelect = document.getElementById('taskAttendee');
    if (attendeeSelect.options.length === 0) {
        alert('Please add attendees to the event before creating tasks.');
        return;
    }

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
        await api.put(`/attendees/${attendeeId}`, { event_id: null });
        
        // Refresh the attendee lists and tasks
        await Promise.all([
            loadEventAttendees(),
            loadAvailableAttendees(),
            loadEventTasks()
        ]);
        
        // Update progress stats
        updateProgressStats();
        
        // Show success message
        alert('Attendee removed from event successfully!');
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
        document.getElementById('progressStats').innerHTML = '<p>Error loading progress stats.</p>';
    }
}
