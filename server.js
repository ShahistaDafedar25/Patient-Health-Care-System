const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // Add this line to import body parser
const app = express();
const PORT = 3000;
// const router = require('./routes/router'); // Import the central router
// app.use('/', router); // Use the central router


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Adjust the views folder path if necessary

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));


// Use body parser to parse form data in requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const session = require('express-session');

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set `true` if using HTTPS
}));



// Serve static files from public folder
app.use(express.static('public'));

// Route for the hero page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/index.html'));
});

app.get('/patient/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/patient-login.html'));
});

app.get('/patient/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/patient-signup.html'));
});

app.get('/patient/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/patient-dashboard.html'));
});



app.get('/doctor/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/doctor-login.html'));
});

app.get('/doctor/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/doctor-signup.html'));
});

app.get('/doctor/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/doctor-dashboard.html'));
});

app.get('/doctor/appointment', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/doctor-appointment.html'));
});
app.get('/doctor/appointment-today', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/doctor-appointment-today.html'));
});





// Import routes
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');


// Use routes
app.use('/admin', adminRoutes);
app.use('/doctor', doctorRoutes);
app.use('/patient', patientRoutes);


app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
