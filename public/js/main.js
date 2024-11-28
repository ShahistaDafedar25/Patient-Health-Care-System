document.addEventListener('DOMContentLoaded', () => {
    fetch('/doctor/appointments')
        .then(response => response.json())
        .then(appointments => {
            const appointmentList = document.getElementById('appointment-list');
            
            if (appointments.length === 0) {
                appointmentList.innerHTML = '<p>No appointments available.</p>';
                return;
            }

            appointments.forEach(appointment => {
                const appointmentCard = document.createElement('div');
                appointmentCard.classList.add('appointment-card');
                
                appointmentCard.innerHTML = `
                    <div class="appointment-info">
                        <p>Patient: ${appointment.patient_name}</p>
                        <p>Appointment Date: ${new Date(appointment.appointment_date).toLocaleString()}</p>
                    </div>
                    <div class="appointment-actions">
                        <button class="schedule-btn" data-id="${appointment.id}">Schedule</button>
                        <button class="cancel-btn" data-id="${appointment.id}">Cancel</button>
                    </div>
                `;
                
                appointmentList.appendChild(appointmentCard);
            });

            document.querySelectorAll('.schedule-btn').forEach(btn => {
                btn.addEventListener('click', (e) => handleAppointmentAction(e.target.dataset.id, 'schedule'));
            });
            
            document.querySelectorAll('.cancel-btn').forEach(btn => {
                btn.addEventListener('click', (e) => handleAppointmentAction(e.target.dataset.id, 'cancel'));
            });
        });
});

function handleAppointmentAction(appointmentId, action) {
    fetch('/doctor/appointments/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, action })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert(`Appointment ${action}d successfully!`);
            window.location.reload(); // Reload to update the list
        } else {
            alert('Failed to update appointment.');
        }
    });
}


