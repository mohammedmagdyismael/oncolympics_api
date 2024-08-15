const mysql = require('mysql2');

// Create a connection to the database
const pool = mysql.createPool({
  host: 'srv973.hstgr.io',
  user: 'u702351445_admin',
  password: 'Df^F*=p*$eM1',
  database: 'u702351445_oncolympics',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();