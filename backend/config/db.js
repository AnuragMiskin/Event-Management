const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: 'root123', // Your MySQL password
  database: 'event_management'
});

module.exports = pool.promise();
