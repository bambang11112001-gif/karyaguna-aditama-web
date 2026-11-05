const { pool } = require('../config/db');
const fs = require('node:fs/promises');
const path = require('node:path');

const parseImageUrls = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const removeUploadedFiles = async (files = []) => {
    await Promise.all(files.map((file) => fs.unlink(file.path).catch((error) => {
        if (error.code !== 'ENOENT') console.error('Error removing uploaded business field image:', error);
    })));
};

const removeStoredImages = async (urls = []) => {
    const uploadDirectory = path.resolve(__dirname, '..', 'uploads', 'business-fields');
    await Promise.all(urls
        .filter((url) => typeof url === 'string' && url.startsWith('/uploads/business-fields/'))
        .map((url) => fs.unlink(path.join(uploadDirectory, path.basename(url))).catch((error) => {
            if (error.code !== 'ENOENT') console.error('Error removing stored business field image:', error);
        })));
};

const uploadedImageUrls = (files = []) => files.map((file) => `/uploads/business-fields/${file.filename}`);

exports.getBusinessFields = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT id, title, description, icon, image_url, image_urls FROM business_fields ORDER BY id ASC'
        );
        res.json({
            success: true,
            data: rows.map((row) => ({
                ...row,
                image_urls: parseImageUrls(row.image_urls).length
                    ? parseImageUrls(row.image_urls)
                    : row.image_url ? [row.image_url] : []
            }))
        });
    } catch (error) {
        console.error('Error loading business fields:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat bidang usaha.' });
    }
};

exports.createBusinessField = async (req, res) => {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const icon = typeof req.body.icon === 'string' ? req.body.icon.trim() : '';
    const files = req.files || [];

    if (!title || !description || title.length > 100) {
        await removeUploadedFiles(files);
        return res.status(400).json({ success: false, message: 'Nama bidang usaha dan deskripsi wajib diisi.' });
    }

    try {
        const imageUrls = uploadedImageUrls(files);
        const [result] = await pool.execute(
            'INSERT INTO business_fields (title, description, icon, image_url, image_urls) VALUES (?, ?, ?, ?, ?)',
            [title, description, icon || null, imageUrls[0] || null, JSON.stringify(imageUrls)]
        );
        res.status(201).json({
            success: true,
            message: 'Bidang usaha berhasil ditambahkan.',
            data: { id: result.insertId, title, description, icon: icon || null, image_url: imageUrls[0] || null, image_urls: imageUrls }
        });
    } catch (error) {
        await removeUploadedFiles(files);
        console.error('Error creating business field:', error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan bidang usaha.' });
    }
};

exports.updateBusinessField = async (req, res) => {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const icon = typeof req.body.icon === 'string' ? req.body.icon.trim() : '';
    const files = req.files || [];

    if (!/^\d+$/.test(req.params.id) || !title || !description || title.length > 100) {
        await removeUploadedFiles(files);
        return res.status(400).json({ success: false, message: 'Nama bidang usaha dan deskripsi wajib diisi.' });
    }

    try {
        const [rows] = await pool.execute(
            'SELECT image_url, image_urls FROM business_fields WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            await removeUploadedFiles(files);
            return res.status(404).json({ success: false, message: 'Bidang usaha tidak ditemukan.' });
        }

        const currentImages = parseImageUrls(rows[0].image_urls);
        if (currentImages.length === 0 && rows[0].image_url) currentImages.push(rows[0].image_url);
        let requestedImages = currentImages;
        if (typeof req.body.keep_image_urls === 'string') {
            try {
                const submittedImages = JSON.parse(req.body.keep_image_urls);
                requestedImages = Array.isArray(submittedImages)
                    ? submittedImages.filter((url) => currentImages.includes(url))
                    : currentImages;
            } catch {
                requestedImages = currentImages;
            }
        }

        const newImages = [...requestedImages, ...uploadedImageUrls(files)];
        await pool.execute(
            'UPDATE business_fields SET title = ?, description = ?, icon = ?, image_url = ?, image_urls = ? WHERE id = ?',
            [title, description, icon || null, newImages[0] || null, JSON.stringify(newImages), req.params.id]
        );

        const removedImages = currentImages.filter((url) => !requestedImages.includes(url));
        await removeStoredImages(removedImages);
        res.json({
            success: true,
            message: 'Bidang usaha berhasil diperbarui.',
            data: { id: req.params.id, title, description, icon: icon || null, image_url: newImages[0] || null, image_urls: newImages }
        });
    } catch (error) {
        await removeUploadedFiles(files);
        console.error('Error updating business field:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui bidang usaha.' });
    }
};

exports.deleteBusinessField = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT image_url, image_urls FROM business_fields WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Bidang usaha tidak ditemukan.' });
        }

        const imageUrls = parseImageUrls(rows[0].image_urls);
        if (imageUrls.length === 0 && rows[0].image_url) imageUrls.push(rows[0].image_url);
        await pool.execute('DELETE FROM business_fields WHERE id = ?', [req.params.id]);
        await removeStoredImages(imageUrls);
        res.json({ success: true, message: 'Bidang usaha berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting business field:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus bidang usaha.' });
    }
};