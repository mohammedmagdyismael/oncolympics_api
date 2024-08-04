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


exports.userInfo = async (req, res) => {
    const token = req.headers.token;
    const [user] = await db.query('SELECT * FROM Users WHERE token = ?', [token]);
    if (user.length === 0) {
      return res.status(403).json({ error: 'User is not authorized to perform this action' });
    }

    try {
        const payload = {
            isAdmin: false,
            name: '',
            logo: '',
        }
        if (user[0].role === 'Admin') {
            payload.name = 'Admin';
            payload.isAdmin = true;
            res.json({ status: 200, data: payload });
        }
        else if (user[0].role === 'Team') {
            const userId = user[0].id;
            const query = `
                select name, logo from Teams where userId = ${userId};
            `;
            const [userInfo] = await db.query(query);
            payload.logo = userInfo?.[0].logo;
            payload.name = userInfo?.[0].name;
            res.json({ status: 200, data: payload });
        }

    } catch (e) {
        return res.status(500).json({ message: e });
    }
};
