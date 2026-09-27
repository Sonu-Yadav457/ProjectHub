export const sendTokenResponse = (user, statusCode, res) => {
    const token  = user.generateAccessToken();

    const options = {
        expires: new Date(Date.now() + 24*60*60*1000), //It will expire in 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }

    user.password = undefined;

    res.status(statusCode).cookie('token',token,options).json({
        success: true,
        data:{
            user,
            token,
        },
    });
};