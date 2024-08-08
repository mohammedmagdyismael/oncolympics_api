const db = require('../db'); 

module.exports = async (req ,res, next)=>{
    try {
        const token = req.headers.token;
        const [user] = await db.query('SELECT * FROM Users WHERE token = ?', [token]);
        if (user.length === 0 || user[0].role !== 'Team') {
        return res.status(401).json({ error: 'User is not authorized to perform this action' });
        }

        next();
    }
    catch(error){
        res.status(401).json({msg:'Token denied'})
    }

}