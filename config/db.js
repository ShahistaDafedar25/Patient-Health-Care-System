const mysql = require('mysql2');

// Check if JAWSDB_URL environment variable is set (Heroku will automatically set this)
const connectionConfig = process.env.JAWSDB_URL
    ? {
        uri: process.env.JAWSDB_URL, // Use Heroku's JawsDB connection string
      }
    : {
        host: 'localhost',   // Localhost for local development
        user: 'root',        // Your local MySQL user (e.g., 'root' for local development)
        password: 'Shahista@123',  // Your local MySQL password
        database: 'health_management_system'  // The name of your local database
      };

// Create a connection to the database using the appropriate configuration
const connection = mysql.createConnection(connectionConfig.uri || connectionConfig);

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
});

module.exports = connection;

