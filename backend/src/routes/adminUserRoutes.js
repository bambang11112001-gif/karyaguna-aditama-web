const express = require('express');
const {
    getAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    resetAdminPassword,
    changeOwnPassword
} = require('../controllers/adminUserController');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();
const requireSuperAdmin = (req, res, next) => {
    if (req.user?.role !== 'superadmin') {
        return res.status(403).json({ success: false, message: 'Hanya superadmin yang dapat mengelola akun admin.' });
    }
    next();
};

router.put('/password', verifyToken, changeOwnPassword);
router.get('/', verifyToken, requireSuperAdmin, getAdmins);
router.post('/', verifyToken, requireSuperAdmin, createAdmin);
router.put('/:id', verifyToken, requireSuperAdmin, updateAdmin);
router.put('/:id/password', verifyToken, requireSuperAdmin, resetAdminPassword);
router.delete('/:id', verifyToken, requireSuperAdmin, deleteAdmin);

module.exports = router;