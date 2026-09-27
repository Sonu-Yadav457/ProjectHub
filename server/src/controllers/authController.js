import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendTokenResponse } from '../utils/sendTokenResponse.js';

export const register = asyncHandler(async (req,res) =>{
    const {name,email,password} = req.body;

    if(!name || !email || !password){
        throw new ApiError(400,'Please provide name, email and password');
    }

    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new ApiError(400,'User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    sendTokenResponse(user,201,res);
})


export const login = asyncHandler(async (req,res) => {
    const {email,password} = req.body;

    if(!email || !password){
        throw new ApiError(400,'Please provide email and password');
    }

    const user = await User.findOne({email}).select('+password');

    if(!user){
        throw new ApiError(401,'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        throw new ApiError(401,'Invalid credentials');
    }

    sendTokenResponse(user,200,res);
} );

export const logout = asyncHandler(async (req,res) => {
    res.cookie('token','none',{
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    })
})


export const getMe = asyncHandler(async (req,res) => {
    res.status(200).json({
        success: true,
        data: req.user,
    })
})