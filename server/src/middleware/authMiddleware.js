import jwt from 'jsonwebtoken';
import {User} from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req,res,next) => {
    let token;

    if(req.cookies?.token){
        token = req.cookies.token;
    }
    else if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split('')[1];
    }

    if(!token){
        throw new ApiError(401, 'Not authorized to access this route. Please login.');
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if(!user){
            throw new ApiError(404, 'User no longer exists');
        }

        req.user = user;
        next();
    } catch (error){
        throw new ApiError(401, 'Token invalid or expired. Please login again.');
    }
})