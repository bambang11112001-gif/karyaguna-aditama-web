const { pool } = require('../config/db');

const profileFields = ['company_name', 'year_established', 'background', 'vision', 'mission'];

exports.getCompanyProfile = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT ${profileFields.join(', ')} FROM company_profile ORDER BY id ASC LIMIT 1`
        );
        res.json({ success: true, data: rows[0] || null });
    } catch (error) {
        console.error('Error loading company profile:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat profil perusahaan.' });
    }
};

exports.updateCompanyProfile = async (req, res) => {
    const { company_name, year_established, background, vision, mission } = req.body;
    const year = Number(year_established);

    if (!company_name?.trim() || !Number.isInteger(year) || year < 1800 || year > new Date().getFullYear()
        || !background?.trim() || !vision?.trim() || !mission?.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Semua field wajib diisi dan tahun berdiri harus valid.'
        });
    }

    try {
        const values = [company_name.trim(), year, background.trim(), vision.trim(), mission.trim()];
        const [existing] = await pool.execute('SELECT id FROM company_profile ORDER BY id ASC LIMIT 1');
        if (existing.length > 0) {
            await pool.execute(
                `UPDATE company_profile SET ${profileFields.map((field) => `${field} = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`,
                [...values, existing[0].id]
            );
        } else {
            await pool.execute(
                `INSERT INTO company_profile (${profileFields.join(', ')}, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                values
            );
        }

        res.json({
            success: true,
            message: 'Profil perusahaan berhasil diperbarui.',
            data: {
                company_name: values[0],
                year_established: values[1],
                background: values[2],
                vision: values[3],
                mission: values[4]
            }
        });
    } catch (error) {
        console.error('Error updating company profile:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan profil perusahaan.' });
    }
};
