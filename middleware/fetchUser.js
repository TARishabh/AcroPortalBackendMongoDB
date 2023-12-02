const jwt = require('jsonwebtoken');
require('dotenv').config()

const JWT_SIGNATURE = process.env.JWT_SIGNATURE

const fetchuser = async (req,res,next)=>{
    const token = req.header('Authorization');
    if (!token){
        return res.status(401).json({error:"Please Authenticate using valid token"})
    }
    try {
        const data = jwt.verify(token,JWT_SIGNATURE);
        req.user = data.user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"Please Authenticate using valid token"})
    }
}

module.exports = fetchuser;