const db = require('../db'); // Import the database connection

// Login function
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Fetch the user from the database
    const query = `SELECT * FROM Users WHERE username="${username}" AND password="${password}"`;


    try {
        const [results] = await db.query(query);
        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const user = results[0];

        const passwordMatch = password === user.password;
        
        if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
        }

        res.json(
            {
                status: 200,
                data: { token: user.token, role: user.role }
            }
        );
    } catch (e) {
        return res.status(500).json({ message: e });
    }
};
