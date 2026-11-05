const { pool } = require('../config/db');

// Mengambil semua pesan masuk
exports.getAllMessages = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM messages ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal memuat data pesan.' });
    }
};

// Memperbarui status baca pesan
const setMessageStatus = async (req, res, forcedStatus) => {
    const status = forcedStatus ?? req.body?.is_read;
    if (![true, false, 0, 1, '0', '1'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status pesan tidak valid.' });
    }

    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT id FROM messages WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pesan tidak ditemukan.' });
        }

        const isRead = status === true || status === 1 || status === '1' ? 1 : 0;
        await pool.execute('UPDATE messages SET is_read = ? WHERE id = ?', [isRead, id]);
        res.json({
            success: true,
            message: 'Status pesan berhasil diperbarui.',
            data: { id, is_read: isRead }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui status pesan.' });
    }
};

exports.updateMessageStatus = (req, res) => setMessageStatus(req, res);
exports.markAsRead = (req, res) => setMessageStatus(req, res, true);

// Menghapus pesan
exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM messages WHERE id = ?', [id]);
        res.json({ success: true, message: 'Pesan berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menghapus pesan.' });
    }
};