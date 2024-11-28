require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser'); // Add this line to import body parser
const session = require('express-session');
const Redis = require('ioredis');
const connectRedis = require('connect-redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Redis setup
const client = new Redis({
    url:'rediss://:p16fe2eecfbe29b21dd664179e2e4109cdf95f6601a81c63d9537a753e174b8ea@ec2-23-20-87-41.compute-1.amazonaws.com:10800' // Replace with your Redis URL, e.g., from Heroku config
  });

// Connect to Redis
client.connect().catch(err => {
    console.error("Error connecting to Redis", err);
});

const RedisStore = connectRedis(session);

// Set up session with Redis store
app.use(session({
    store: new RedisStore({ client }),
    secret: 'your-secret-key', // Replace with a secure secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use true if in production with HTTPS
      httpOnly: true, // To prevent client-side JavaScript from accessing the cookie
      maxAge: 1000 * 60 * 60 * 24 // Example: 1 day expiration for the session
    }
  }));

// Set up view engine and static file paths
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Adjust the views folder path if necessary

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

// Use body parser to parse form data in requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the public folder
app.use(express.static('public'));

// Routes for the hero page and login/signup
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/index.html'));
});

// Patient routes
app.get('/patient/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/patient-login.html'));
});
app.get('/patient/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/patient-signup.html'));
});
app.get('/patient/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/patient-dashboard.html'));
});

// Doctor routes
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

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
