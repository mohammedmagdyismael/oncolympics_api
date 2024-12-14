const db = require('../db');
const prisma = require('../db_prisma');
const Constants = require('../utils/Constants');

// Login function
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {

        const user = await prisma.users.findFirst({
            where: {
                username: {
                    equals: username,
                },
                password: {
                    equals: password,
                },
            },
        });

        if (!user) {
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
    try {
        const { role, id } = req?.data;
        const payload = {
            isAdmin: false,
            name: '',
            logo: '',
        }
        if (role === Constants.ROLES.ADMIN) {
            payload.name = Constants.ROLES.ADMIN;
            payload.isAdmin = true;
        }
        else if (role === Constants.ROLES.TEAM) {
            const teamInfo = await prisma.teams.findFirst({
                where: {
                    userId: id,
                },
            });
            payload.logo = teamInfo?.logo;
            payload.name = teamInfo?.name;
        }
        res.status(200).json({ status: 200, data: payload });
    } catch (e) {
        return res.status(500).json({ message: e });
    }
};
