const express = require('express');
const path = require('path');
const router = express.Router();
const db = require('../config/db');  // Import your database connection
const session = require('express-session');

// Doctor signup route (GET) - Render signup form
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/doctor-signup.html'));
});

router.get('/test', (req, res) => {
    throw new Error('Test error'); // Example to trigger the error handler
});

// Doctor signup route (POST) - Handle signup logic
router.post('/signup', (req, res) => {
    const { name, email, password, confirm_password } = req.body;

    // Validate form data (expand validation as needed)
    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }

    // Insert new doctor into the database
    const sql = 'INSERT INTO doctors (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, password], (err, results) => {
        if (err) {
            console.error('Error inserting into the database:', err.stack);
            res.status(500).send('Error signing up');
        } else {
            // Redirect to doctor login page after successful signup
            res.redirect('/doctor/login');
        }
    });
});

// Doctor login route (GET) - Render login form
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/doctor-login.html'));
});

// Doctor login route (POST) - Handle login/authentication logic
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query to check if doctor exists in the database
    const sql = 'SELECT * FROM doctors WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err.stack);
            res.status(500).send('Error logging in');
        } else if (results.length > 0) {
            // If doctor is found, redirect to the doctor dashboard
            req.session.doctorId = results[0].id; // Assuming the doctor's ID is in `id`
            res.redirect('/doctor/dashboard');
            
        } else {
            // If no matching doctor is found, send error response
            res.status(401).send('Invalid email or password');
        }
    });
});

// Doctor dashboard
router.get('/schedule-appointment', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/doctor-appointments.html'));
});

// Doctor appointment page
router.get('/doctor-appointment', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/doctor-appointment.html'));
});

// Doctor appointment page
router.get('/doctor-appointment-today', (req, res) => {
    const doctorId = req.session.doctorId; // Assuming doctor ID is stored in the session
    const status = 'Scheduled'

    db.query(
        'SELECT a.appointment_date as Appointment_date, p.name as patient_name FROM appointments a join patients p on a.patient_id=p.id WHERE doctor_id = ? AND status=? ORDER BY appointment_date',
        [doctorId, status],
        (err, results) => {
            if (err) {
                console.error('Database Query Error:', err); // Log the exact error
                return res.json({ success: false, message: 'Database query failed.' });
            }
            res.render('doctor-appointment-today', { appointments: results });
        }
    );
});


// Fetch appointments for logged-in doctor (assume doctor ID is stored in session or token)
router.get('/appointments', (req, res) => {
    const doctorId = req.session.doctorId; // Assume session contains the logged-in doctor's ID

    if (!doctorId) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    const sql = `
        SELECT a.*, p.name AS patient_name
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        WHERE a.doctor_id = ? AND a.status = 'Pending'
    `;
    db.query(sql, [doctorId], (err, results) => {
        if (err) {
            console.error('Error fetching appointments:', err);
            res.status(500).json({ error: 'Failed to fetch appointments' });
        } else {
            console.log('Doctor ID:', doctorId);
            console.log('Appointments:', results);
            res.json(results);
        }
    });
});

// Handle scheduling or canceling an appointment
router.post('/appointments/action', (req, res) => {
    const { appointmentId, action } = req.body;

    let sql;
    if (action === 'schedule') {
        sql = 'UPDATE appointments SET status = ? WHERE id = ?';
    } else if (action === 'cancel') {
        sql = 'UPDATE appointments SET status = ? WHERE id = ?';
    } else {
        return res.status(400).json({ error: 'Invalid action' });
    }

    db.query(sql, [action === 'schedule' ? 'Scheduled' : 'Cancelled', appointmentId], (err, results) => {
        if (err) {
            console.error('Error updating appointment:', err);
            res.status(500).json({ error: 'Failed to update appointment' });
        } else {
            res.json({ success: true });
        }
    });
});


// Route to fetch patients list
router.get('/patients', (req, res) => {
    const doctorId = req.session.doctorId;

    const sql = `
        SELECT p.id, p.name
        FROM patients p
        JOIN appointments a ON p.id = a.patient_id
        WHERE a.doctor_id = ?
        GROUP BY p.id, p.name
    `;
    db.query(sql, [doctorId], (err, results) => {
        if (err) {
            console.error('Error fetching patients:', err);
            res.status(500).json({ error: 'Failed to fetch patients' });
        } else {
            res.render('patients-list', { patients: results });
        }
    });
});

// Route to fetch patient's medical records
router.get('/patients/:id/records', (req, res) => {
    const patientId = req.params.id;
    console.log(req.params.id);

    const patientQuery = 'SELECT id, name, dateofbirth, mobileno, address FROM patients WHERE id = ?';
    const recordsQuery = `
        SELECT m.*, d.name AS doctor_name
        FROM medical_records m
        JOIN doctors d ON m.doctor_id = d.id
        WHERE m.patient_id = ?
    `;

    db.query(patientQuery, [patientId], (err, patientResults) => {
        if (err) {
            console.error('Error fetching patient details:', err);
            res.status(500).json({ error: 'Failed to fetch patient details' });
        } else {
            const patient = patientResults[0];
            console.log('Patient Data:', patient);
            db.query(recordsQuery, [patientId], (err, recordsResults) => {
                if (err) {
                    console.error('Error fetching medical records:', err);
                    res.status(500).json({ error: 'Failed to fetch medical records' });
                } else {
                    res.render('medical-records', { patient, records: recordsResults });
                }
            });
        }
    });
});


// Use the upload middleware in the route
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/patients/:id/records', upload.single('report_file'), (req, res) => {
    console.log('Route Hit');
    const patientId = req.params.id;
    console.log('Patient ID:', patientId);
    const { disease_category, prescription, medicine, diagnosis_report } = req.body;
    const doctorId = req.session.doctorId;
    const reportFile = req.file;

    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    if (!patientId) {
        return res.status(400).send('Patient ID is required');
    }

    if (!reportFile) {
        return res.status(400).send('Diagnosis report file is required');
    }

    const diagnosisReportPath = reportFile.path;

    const sql = `
        INSERT INTO medical_records 
        (patient_id, doctor_id, disease_category, prescription, medicine, diagnosis_report_path) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [patientId, doctorId, disease_category, prescription, medicine, diagnosisReportPath], (err) => {
        if (err) {
            console.error('Error inserting record into database:', err.message);
            return res.status(500).send(`Database Error: ${err.message}`);
        }

        res.status(200).send('Medical record saved successfully');
    });
});





module.exports = router;
