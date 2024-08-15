
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

        if (!user) {
            return res.status(401).json({ error: 'user not found' });
        }
        req.data = user;
        next();
    }
    catch(error){
        res.status(401).json({msg:'Token denied'})
    }
}