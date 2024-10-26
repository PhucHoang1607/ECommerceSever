const { expressjwt: expjwt } = require('express-jwt');

const { Token } = require('../models/token');

function authJwt() {
    const API = process.env.API_URL;
    return expjwt({
        secret: process.env.ACCESS_TOKEN_SECRET,
        algorithms: ['HS256'],
        isRevoked: isRevoked,
        //http://
    }).unless({
        path: [
            `${API}/login`,
            `${API}/login/`,

            `${API}/register`,
            `${API}/register/`,

            `${API}/forgot-password`,
            `${API}/forgot-password/`,

            `${API}/verify-otp`,
            `${API}/verify-otp/`,

            `${API}/reset-password`,
            `${API}/reset-password/`,

        ],
    });
}

async function isRevoked(req, jwt) {
    const authHeader = req.header('Authorization');

    if (!authHeader.startsWith('Bearer ')) {
        return true;
    }

    const accessToken = authHeader.replace('Bearer', '').trim();
    const token = await Token.findOne({ accessToken });

    const adminRoutesRegex = /^\/api\/v1\/admin\//i;
    const adminFault =
        !jwt.payload.isAdmin && adminRoutesRegex.test(req.originalUrl);

    return adminFault || !token;
}

module.exports = authJwt;