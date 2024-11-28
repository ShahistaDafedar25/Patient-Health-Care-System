const express = require('express');
const path = require('path');  // You need to import 'path'
const router = express.Router();
const db = require('../config/db');  // Import the database connection
const session = require('express-session');

// Patient login route (GET)
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/patient-login.html'));
});

// Patient login route (POST) - Handle login/authentication logic
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query to check if the user exists with the given email and password
    const sql = 'SELECT * FROM patients WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Error querying the database:', err.stack);
            res.status(500).send('Error logging in');
        } else if (results.length > 0) {
            // User found, save `patient_id` to session
            req.session.patientId = results[0].id; // Make sure to use `patientId` consistently
            
            res.redirect('/patient/dashboard');
            console.log('Patient ID set in session:', req.session.patientId);
        } else {
            res.status(401).send('Invalid email or password');
        }
    });
});

// Patient signup route (GET)
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/patient-signup.html'));
});

// Patient signup route (POST) - Handle registration logic
router.post('/signup', (req, res) => {
    const { name, mobile, address, dob, email, password, confirm_password } = req.body;

    // Validate the form data
    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }

    // Insert the new patient into the database
    const sql = 'INSERT INTO patients (name, email, password, dateofbirth, mobileno, address) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, email, password, dob, mobile, address ], (err, results) => {
        if (err) {
            console.error('Error inserting into the database:', err.stack);
            res.status(500).send('Error signing up');
        } else {
            res.redirect('/patient/login');
        }
    });
});

// Route to serve the appointment form page (GET)
router.get('/book-appointment', (req, res) => {
   
    const sql = 'SELECT id, name FROM doctors';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching doctors:', err.stack);
            res.status(500).send('Failed to load doctors');
        } else {
            // Pass the list of doctors to the HTML template
            res.render('appointment-form', { doctors: results });
        }
    });
});

// Route to handle appointment form submission (POST)
router.post('/book-appointment', (req, res) => {
    const { doctor_id, date, time, reason } = req.body;
    const patient_id = req.session.patientId; // Retrieve patient_id from session

    if (!patient_id) {
        return res.status(400).send('Please log in to book an appointment');
    }

    // Combine date and time into a single DATETIME string
    const appointment_date = new Date(`${date}T${time}`); // Convert to DATETIME

    // Insert the appointment details into the database
    const sql = 'INSERT INTO appointments (reason, patient_id, doctor_id, appointment_date, status) VALUES (?, ?, ?, ?, ?)';
    const status = 'Pending';
    db.query(sql, [reason, patient_id, doctor_id, appointment_date, status], (err, results) => {
        if (err) {
            console.error('Error booking appointment:', err.stack);
            res.status(500).send('Error booking appointment');
        } else {
            res.redirect('/patient/dashboard');
        }
    });
});

// Route to fetch patient's medical records
router.get('/records', (req, res) => {
    const patientId = req.session.patientId;

    const recordsQuery = `
        SELECT m.*, d.name AS doctor_name
        FROM medical_records m
        JOIN doctors d ON m.doctor_id = d.id
        WHERE m.patient_id = ?
    `;

    db.query(recordsQuery, [patientId], (err, recordsResults) => {
        if (err) {
            console.error('Error fetching medical records:', err);
            res.status(500).json({ error: 'Failed to fetch medical records' });
        } else {
            res.render('patient-records', { records: recordsResults });
        }
    });
});

module.exports = router;
