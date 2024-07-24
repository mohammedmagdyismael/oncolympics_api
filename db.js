const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'srv973.hstgr.io',
  user: 'u702351445_admin',
  password: 'Df^F*=p*$eM1',
  database: 'u702351445_oncolympics'
});

// Connect to the database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

module.exports = connection;