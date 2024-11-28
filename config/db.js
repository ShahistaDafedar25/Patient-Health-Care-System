const mysql = require('mysql');
const url = require('url');

// Access the JAWSDB_URL environment variable
const dbUrl = process.env.JAWSDB_URL;  // or use process.env.CLEARDB_URL for ClearDB

// Parse the database URL
const parsedUrl = url.parse(dbUrl);

// Create a MySQL connection using the parsed URL
const connection = mysql.createConnection({
  host: parsedUrl.hostname,            // Hostname (e.g., t89yihg12rw77y6f.cbetxkdyhwsb.us-east-1.rds.amazonaws.com)
  user: parsedUrl.auth.split(':')[0],   // Username (e.g., dzbpflz9x4j9wnw1)
  password: parsedUrl.auth.split(':')[1], // Password (e.g., xexpfsa4mjedry8f)
  database: parsedUrl.pathname.split('/')[1] // Database name (e.g., ybp2i409tg66lriq)
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the MySQL database');
});

module.exports = connection;

