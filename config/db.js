const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
    host: 'localhost',   // Replace with your database host
    user: 'root',   // Replace with your MySQL user
    password: 'Shahista@123',  
    database: 'health_management_system' 
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
});

module.exports = connection;
