import jwt from 'jsonwebtoken'


export const generatetoken = (userId) =>{
    const token = jwt.sign({id:userId}, process.env.JWT_SECRETE, {expiresIn:'1d'});
    return token
}