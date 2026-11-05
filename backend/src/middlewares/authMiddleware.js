const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'kga_super_secret_key_2026', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa.' });
        }
        req.user = user;
        next();
    });
};

module.exports = verifyToken;