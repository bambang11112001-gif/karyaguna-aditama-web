const { pool } = require('../config/db');

// Menyimpan pesan kontak / inquiry baru dari frontend
exports.createMessage = async (req, res) => {
    try {
        const { name, company_name, email, phone, subject, message } = req.body;

        // Validasi input sederhana
        if (!name || !email || !phone || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi kecuali nama perusahaan.' });
        }

        const query = `INSERT INTO messages (name, company_name, email, phone, subject, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`;
        
        const [result] = await pool.execute(query, [
            name, 
            company_name || null, 
            email, 
            phone, 
            subject, 
            message
        ]);

        res.status(201).json({
            success: true,
            message: 'Pesan inquiry berhasil dikirim dan tersimpan di database.',
            data: { id: result.insertId, name, email, subject }
        });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server database.' });
    }
};