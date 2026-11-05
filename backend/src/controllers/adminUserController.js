const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const MIN_PASSWORD_LENGTH = 12;

exports.getAdmins = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            "SELECT id, name, username, email, role, created_at FROM users WHERE role IN ('admin', 'superadmin') ORDER BY id ASC"
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error loading admin accounts:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat akun admin.' });
    }
};

exports.createAdmin = async (req, res) => {
    const { name, username, email, password } = req.body;
    if (typeof name !== 'string' || !name.trim() || typeof username !== 'string' || !username.trim()
        || typeof email !== 'string' || !email.trim() || typeof password !== 'string'
        || password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({
            success: false,
            message: `Nama, username, email, dan password minimal ${MIN_PASSWORD_LENGTH} karakter wajib diisi.`
        });
    }
    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username.trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Format username atau email tidak valid.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.execute(
            'INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [name.trim(), username.trim(), email.trim(), hashedPassword, 'admin']
        );
        res.status(201).json({
            success: true,
            message: 'Akun admin berhasil dibuat.',
            data: { id: result.insertId, name: name.trim(), username: username.trim(), email: email.trim(), role: 'admin' }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Username atau email sudah digunakan.' });
        }
        console.error('Error creating admin account:', error);
        res.status(500).json({ success: false, message: 'Gagal membuat akun admin.' });
    }
};

exports.updateAdmin = async (req, res) => {
    const { name, username, email } = req.body;
    if (typeof name !== 'string' || !name.trim() || typeof username !== 'string' || !username.trim()
        || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Nama, username, dan email wajib diisi.' });
    }
    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username.trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Format username atau email tidak valid.' });
    }

    try {
        const [existing] = await pool.execute("SELECT id FROM users WHERE id = ? AND role = 'admin'", [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Akun admin tidak ditemukan.' });
        }
        await pool.execute(
            "UPDATE users SET name = ?, username = ?, email = ? WHERE id = ? AND role = 'admin'",
            [name.trim(), username.trim(), email.trim(), req.params.id]
        );
        res.json({
            success: true,
            message: 'Informasi akun admin berhasil diperbarui.',
            data: { id: req.params.id, name: name.trim(), username: username.trim(), email: email.trim(), role: 'admin' }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Username atau email sudah digunakan.' });
        }
        console.error('Error updating admin account:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui akun admin.' });
    }
};

exports.deleteAdmin = async (req, res) => {
    if (String(req.user.id) === String(req.params.id)) {
        return res.status(400).json({ success: false, message: 'Akun yang sedang digunakan tidak dapat dihapus.' });
    }

    try {
        const [result] = await pool.execute("DELETE FROM users WHERE id = ? AND role = 'admin'", [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Akun admin tidak ditemukan atau tidak dapat dihapus.' });
        }
        res.json({ success: true, message: 'Akun admin berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting admin account:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus akun admin.' });
    }
};

exports.resetAdminPassword = async (req, res) => {
    const { new_password } = req.body;
    if (typeof new_password !== 'string' || new_password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ success: false, message: `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter.` });
    }

    try {
        const hashedPassword = await bcrypt.hash(new_password, 10);
        const [result] = await pool.execute(
            "UPDATE users SET password = ? WHERE id = ? AND role = 'admin'",
            [hashedPassword, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Akun admin tidak ditemukan.' });
        }
        res.json({ success: true, message: 'Password admin berhasil diperbarui.' });
    } catch (error) {
        console.error('Error resetting admin password:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui password admin.' });
    }
};

exports.changeOwnPassword = async (req, res) => {
    const { current_password, new_password } = req.body;
    if (typeof current_password !== 'string' || typeof new_password !== 'string'
        || new_password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ success: false, message: `Password saat ini wajib diisi dan password baru minimal ${MIN_PASSWORD_LENGTH} karakter.` });
    }

    try {
        const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Akun tidak ditemukan.' });
        }
        if (!await bcrypt.compare(current_password, rows[0].password)) {
            return res.status(401).json({ success: false, message: 'Password saat ini tidak sesuai.' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ success: true, message: 'Password berhasil diperbarui.' });
    } catch (error) {
        console.error('Error changing own password:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui password.' });
    }
};