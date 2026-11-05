const fs = require('node:fs/promises');
const path = require('node:path');
const { pool } = require('../config/db');

let heroTableReady;

function ensureHeroTable() {
    if (!heroTableReady) {
        heroTableReady = pool.execute(`
            CREATE TABLE IF NOT EXISTS hero_slideshow (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                image_url VARCHAR(1000) NOT NULL,
                order_priority INT NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `).catch((error) => {
            heroTableReady = null;
            throw error;
        });
    }
    return heroTableReady;
}

function isValidImageReference(value) {
    if (typeof value !== 'string' || value.length > 1000) return false;
    const imageUrl = value.trim();
    if (!imageUrl) return false;

    try {
        const url = new URL(imageUrl);
        return ['http:', 'https:'].includes(url.protocol);
    } catch {
        if (imageUrl.startsWith('/uploads/')) {
            return !imageUrl.split('/').includes('..') && !imageUrl.includes('\\');
        }
        return !imageUrl.includes('/') && !imageUrl.includes('\\') && !imageUrl.includes('..');
    }
}

exports.getAdminHeroSlides = async (req, res) => {
    try {
        await ensureHeroTable();
        const [rows] = await pool.execute(
            'SELECT id, image_url, order_priority, is_active, created_at FROM hero_slideshow ORDER BY order_priority ASC, id ASC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error loading admin hero slides:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat slideshow.' });
    }
};

exports.createHeroSlide = async (req, res) => {
    const imageUrl = req.file
        ? `/uploads/hero/${req.file.filename}`
        : typeof req.body.image_url === 'string' ? req.body.image_url.trim() : '';
    if (!isValidImageReference(imageUrl)) {
        if (req.file) await fs.unlink(req.file.path).catch((error) => {
            if (error.code !== 'ENOENT') console.error('Error cleaning up invalid hero image:', error);
        });
        return res.status(400).json({
            success: false,
            message: 'Pilih foto yang valid untuk slideshow.'
        });
    }

    try {
        await ensureHeroTable();
        const [priorityRows] = await pool.execute(
            'SELECT COALESCE(MAX(order_priority), 0) + 1 AS next_priority FROM hero_slideshow'
        );
        const orderPriority = Number(priorityRows[0]?.next_priority) || 1;
        const [result] = await pool.execute(
            'INSERT INTO hero_slideshow (image_url, order_priority, is_active) VALUES (?, ?, TRUE)',
            [imageUrl, orderPriority]
        );
        res.status(201).json({
            success: true,
            message: 'Foto slideshow berhasil ditambahkan.',
            data: {
                id: result.insertId,
                image_url: imageUrl,
                order_priority: orderPriority,
                is_active: true
            }
        });
    } catch (error) {
        if (req.file) await fs.unlink(req.file.path).catch((cleanupError) => {
            if (cleanupError.code !== 'ENOENT') console.error('Error cleaning up failed hero upload:', cleanupError);
        });
        console.error('Error creating hero slide:', error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan foto slideshow.' });
    }
};

exports.deleteHeroSlide = async (req, res) => {
    try {
        await ensureHeroTable();
        const [rows] = await pool.execute('SELECT image_url FROM hero_slideshow WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Foto slideshow tidak ditemukan.' });
        }
        await pool.execute('DELETE FROM hero_slideshow WHERE id = ?', [req.params.id]);
        const imageUrl = rows[0].image_url;
        if (imageUrl?.startsWith('/uploads/hero/')) {
            const imagePath = path.resolve(__dirname, '..', 'uploads', 'hero', path.basename(imageUrl));
            await fs.unlink(imagePath).catch((error) => {
                if (error.code !== 'ENOENT') console.error('Error removing hero image:', error);
            });
        }
        res.json({ success: true, message: 'Foto slideshow berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting hero slide:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus foto slideshow.' });
    }
};

exports.getActiveHeroSlides = async (req, res) => {
    try {
        await ensureHeroTable();
        const [rows] = await pool.execute(
            'SELECT id, image_url, order_priority FROM hero_slideshow WHERE is_active = TRUE ORDER BY order_priority ASC, id ASC'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error loading public hero slides:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat slideshow halaman utama.' });
    }
};
