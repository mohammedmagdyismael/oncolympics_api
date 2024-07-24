const db = require('../db'); // Import the database connection

// Login function
exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Fetch the user from the database
    const query = 'SELECT * FROM Users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        // Compare the provided password with the stored password
        const passwordMatch = password === user.password;
        
        if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Return the token and role
        res.json(
            {
                status: 200,
                data: { token: user.token, role: user.role }
            }
        );
    });
};
