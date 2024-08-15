const db = require('../db'); 
const prisma = require('../db_prisma');

module.exports = async (req ,res, next)=>{
    try {
        const token = req.headers.token;
        const user = await prisma.users.findFirst({
            where: {
                token: {
                    equals: token,
                },
            },
        });

        if (!user || user?.role !== 'Team') {
            return res.status(401).json({ error: 'User is not authorized to perform this action' });
        }
        req.data = user;
        next();
    }
    catch(error){
        res.status(401).json({msg:'Token denied'})
    }
}