const { pool } = require('../config/db');
const fs = require('node:fs/promises');
const path = require('node:path');

const defaults = {
    website_name: 'PT Karyaguna Aditama',
    tagline: 'CONSTRUCTION & FOOD TRADING',
    logo_url: '',
    address: 'Jakarta, Indonesia',
    phone: '+62 811-1182-6087',
    email: 'karyagunaaditama88@gmail.com',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: ''
};

let tableReady;
const ensureSettingsTable = () => {
    if (!tableReady) {
        tableReady = (async () => {
            await pool.execute(`
                CREATE TABLE IF NOT EXISTS website_settings (
                    id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
                    website_name VARCHAR(150) NOT NULL,
                    tagline VARCHAR(255) NOT NULL DEFAULT '',
                    logo_url VARCHAR(255) NOT NULL DEFAULT '',
                    address VARCHAR(255) NOT NULL DEFAULT '',
                    phone VARCHAR(50) NOT NULL DEFAULT '',
                    email VARCHAR(150) NOT NULL DEFAULT '',
                    facebook_url VARCHAR(255) NOT NULL DEFAULT '',
                    instagram_url VARCHAR(255) NOT NULL DEFAULT '',
                    linkedin_url VARCHAR(255) NOT NULL DEFAULT '',
                    youtube_url VARCHAR(255) NOT NULL DEFAULT '',
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            await pool.execute(
                `INSERT IGNORE INTO website_settings
                    (id, website_name, tagline, logo_url, address, phone, email, facebook_url, instagram_url, linkedin_url, youtube_url)
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                Object.values(defaults)
            );
            await pool.execute(
                'UPDATE website_settings SET tagline = ? WHERE id = 1 AND tagline = ?',
                [defaults.tagline, 'FOOD TRADING & DISTRIBUTION']
            );
        })().catch((error) => {
            tableReady = null;
            throw error;
        });
    }
    return tableReady;
};

const getSettings = async () => {
    await ensureSettingsTable();
    const [rows] = await pool.execute('SELECT * FROM website_settings WHERE id = 1');
    return rows[0] || defaults;
};

exports.getWebsiteSettings = async (req, res) => {
    try {
        const settings = await getSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        console.error('Error loading website settings:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat pengaturan website.' });
    }
};

exports.updateWebsiteSettings = async (req, res) => {
    const stringFields = ['website_name', 'tagline', 'address', 'phone', 'email', 'facebook_url', 'instagram_url', 'linkedin_url', 'youtube_url'];
    const valuesByField = Object.fromEntries(stringFields.map((field) => [field, typeof req.body[field] === 'string' ? req.body[field].trim() : '']));
    const maxLengthByField = { website_name: 150, tagline: 255, address: 255, phone: 50, email: 150, facebook_url: 255, instagram_url: 255, linkedin_url: 255, youtube_url: 255 };

    if (!valuesByField.website_name || valuesByField.website_name.length > 150
        || stringFields.some((field) => valuesByField[field].length > maxLengthByField[field])) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ success: false, message: 'Nama website wajib diisi dan panjang informasi tidak valid.' });
    }
    if (valuesByField.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valuesByField.email)) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ success: false, message: 'Format email tidak valid.' });
    }

    const urlFields = ['facebook_url', 'instagram_url', 'linkedin_url', 'youtube_url'];
    for (const field of urlFields) {
        if (!valuesByField[field]) continue;
        try {
            const url = new URL(valuesByField[field]);
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
        } catch {
            if (req.file) await fs.unlink(req.file.path).catch(() => {});
            return res.status(400).json({ success: false, message: 'Tautan social media harus berupa URL http atau https yang valid.' });
        }
    }

    try {
        const current = await getSettings();
        const removeLogo = req.body.remove_logo === 'true';
        const logoUrl = req.file ? `/uploads/settings/${req.file.filename}` : removeLogo ? '' : current.logo_url;
        const fields = [...stringFields, 'logo_url'];
        const values = [...stringFields.map((field) => valuesByField[field]), logoUrl];
        await pool.execute(
            `UPDATE website_settings SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = 1`,
            values
        );

        if ((req.file || removeLogo) && current.logo_url?.startsWith('/uploads/settings/')) {
            const oldLogoPath = path.resolve(__dirname, '..', 'uploads', 'settings', path.basename(current.logo_url));
            await fs.unlink(oldLogoPath).catch((error) => {
                if (error.code !== 'ENOENT') console.error('Error removing previous website logo:', error);
            });
        }

        res.json({
            success: true,
            message: 'Pengaturan website berhasil disimpan.',
            data: { ...valuesByField, logo_url: logoUrl }
        });
    } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        console.error('Error updating website settings:', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan pengaturan website.' });
    }
};
