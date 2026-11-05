const fs = require('node:fs/promises');
const path = require('node:path');
const { pool } = require('../config/db');

let galleryPhotosTableReady;

function ensureGalleryPhotosTable() {
    if (!galleryPhotosTableReady) {
        galleryPhotosTableReady = pool.execute(`
            CREATE TABLE IF NOT EXISTS gallery_photos (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                gallery_id BIGINT UNSIGNED NOT NULL,
                image_url VARCHAR(500) NOT NULL,
                sort_order INT NOT NULL DEFAULT 0,
                is_cover TINYINT(1) NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_gallery_photos_gallery_order (gallery_id, sort_order, id)
            ) ENGINE=InnoDB
        `).catch((error) => {
            galleryPhotosTableReady = null;
            throw error;
        });
    }
    return galleryPhotosTableReady;
}

function getUploadedFiles(req) {
    if (Array.isArray(req.files)) return req.files;
    return req.file ? [req.file] : [];
}

async function removeUploadedFiles(files) {
    await Promise.all(files.map((file) => fs.unlink(file.path).catch((error) => {
        if (error.code !== 'ENOENT') console.error('Error cleaning up gallery upload:', error);
    })));
}

async function removeGalleryImages(imageUrls) {
    const storedImages = [...new Set(imageUrls)].filter((url) => url?.startsWith('/uploads/gallery/'));
    await Promise.all(storedImages.map((url) => {
        const imagePath = path.resolve(__dirname, '..', 'uploads', 'gallery', path.basename(url));
        return fs.unlink(imagePath).catch((error) => {
            if (error.code !== 'ENOENT') console.error('Error removing gallery image:', error);
        });
    }));
}

function getGalleryCategory(row) {
    return row.category || row.description || '';
}

exports.getGallery = async (req, res) => {
    try {
        await ensureGalleryPhotosTable();
        const [rows] = await pool.execute(
            'SELECT id, title, description AS category, description, image_url, created_at FROM galleries ORDER BY id DESC'
        );

        if (rows.length === 0) {
            res.json({ success: true, data: [] });
            return;
        }

        const galleryIds = rows.map((row) => row.id);
        const placeholders = galleryIds.map(() => '?').join(', ');
        const [photoRows] = await pool.execute(
            `SELECT id, gallery_id, image_url, sort_order, is_cover FROM gallery_photos WHERE gallery_id IN (${placeholders}) ORDER BY sort_order ASC, id ASC`,
            galleryIds
        );
        const photosByGallery = new Map();
        photoRows.forEach((photo) => {
            const photos = photosByGallery.get(photo.gallery_id) || [];
            photos.push(photo);
            photosByGallery.set(photo.gallery_id, photos);
        });

        const data = rows.map((row) => {
            const photos = photosByGallery.get(row.id);
            const albumPhotos = photos?.length
                ? photos.map(({ id, image_url, is_cover }) => ({ id, image_url, is_cover: Boolean(is_cover) }))
                : [{ id: `legacy-${row.id}`, image_url: row.image_url, is_cover: true }];
            const cover = albumPhotos.find((photo) => photo.is_cover) || albumPhotos[0];
            return {
                ...row,
                category: getGalleryCategory(row),
                image_url: cover?.image_url || row.image_url,
                photos: albumPhotos
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Error loading gallery:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat galeri.' });
    }
};

exports.createGalleryItem = async (req, res) => {
    const files = getUploadedFiles(req);
    let galleryId;
    try {
        await ensureGalleryPhotosTable();
        const { title, category, description = '' } = req.body;
        const galleryCategory = (category || description).trim();
        if (!title?.trim() || !galleryCategory || files.length === 0) {
            await removeUploadedFiles(files);
            return res.status(400).json({
                success: false,
                message: 'Kategori, judul, dan minimal satu foto dokumentasi wajib diisi.'
            });
        }

        const imageUrl = `/uploads/gallery/${files[0].filename}`;
        const [result] = await pool.execute(
            'INSERT INTO galleries (title, description, image_url, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [title.trim(), galleryCategory, imageUrl]
        );
        galleryId = result.insertId;
        for (const [index, file] of files.entries()) {
            await pool.execute(
                'INSERT INTO gallery_photos (gallery_id, image_url, sort_order, is_cover) VALUES (?, ?, ?, ?)',
                [galleryId, `/uploads/gallery/${file.filename}`, index, index === 0 ? 1 : 0]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Dokumentasi berhasil ditambahkan.',
            data: {
                id: galleryId,
                title: title.trim(),
                category: galleryCategory,
                description: galleryCategory,
                image_url: imageUrl,
                photos: files.map((file, index) => ({
                    image_url: `/uploads/gallery/${file.filename}`,
                    is_cover: index === 0
                }))
            }
        });
    } catch (error) {
        if (galleryId) {
            try {
                await pool.execute('DELETE FROM gallery_photos WHERE gallery_id = ?', [galleryId]);
                await pool.execute('DELETE FROM galleries WHERE id = ?', [galleryId]);
            } catch (cleanupError) {
                console.error('Error cleaning up incomplete gallery album:', cleanupError);
            }
        }
        await removeUploadedFiles(files);
        console.error('Error creating gallery item:', error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan dokumentasi.' });
    }
};

exports.updateGalleryItem = async (req, res) => {
    const files = getUploadedFiles(req);
    const { id } = req.params;
    try {
        await ensureGalleryPhotosTable();
        const { title, category, description = '' } = req.body;
        const galleryCategory = (category || description).trim();
        if (!title?.trim() || !galleryCategory) {
            await removeUploadedFiles(files);
            return res.status(400).json({
                success: false,
                message: 'Kategori dan judul wajib diisi.'
            });
        }

        const [rows] = await pool.execute('SELECT id, image_url FROM galleries WHERE id = ?', [id]);
        if (rows.length === 0) {
            await removeUploadedFiles(files);
            return res.status(404).json({ success: false, message: 'Dokumentasi tidak ditemukan.' });
        }

        await pool.execute(
            'UPDATE galleries SET title = ?, description = ?, updated_at = NOW() WHERE id = ?',
            [title.trim(), galleryCategory, id]
        );

        if (files.length > 0) {
            const [existingPhotos] = await pool.execute(
                'SELECT COUNT(*) AS photo_count FROM gallery_photos WHERE gallery_id = ?',
                [id]
            );
            let sortOrder = Number(existingPhotos[0]?.photo_count) || 0;
            if (sortOrder === 0) {
                await pool.execute(
                    'INSERT INTO gallery_photos (gallery_id, image_url, sort_order, is_cover) VALUES (?, ?, 0, 1)',
                    [id, rows[0].image_url]
                );
                sortOrder = 1;
            }
            for (const file of files) {
                await pool.execute(
                    'INSERT INTO gallery_photos (gallery_id, image_url, sort_order, is_cover) VALUES (?, ?, ?, 0)',
                    [id, `/uploads/gallery/${file.filename}`, sortOrder++]
                );
            }
        }

        res.json({
            success: true,
            message: 'Dokumentasi berhasil diperbarui.'
        });
    } catch (error) {
        if (files.length > 0) {
            const placeholders = files.map(() => '?').join(', ');
            try {
                await pool.execute(
                    `DELETE FROM gallery_photos WHERE gallery_id = ? AND image_url IN (${placeholders})`,
                    [id, ...files.map((file) => `/uploads/gallery/${file.filename}`)]
                );
            } catch (cleanupError) {
                console.error('Error cleaning up incomplete gallery photo update:', cleanupError);
            }
        }
        await removeUploadedFiles(files);
        console.error('Error updating gallery item:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui dokumentasi.' });
    }
};

exports.deleteGalleryItem = async (req, res) => {
    try {
        await ensureGalleryPhotosTable();
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT image_url FROM galleries WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Dokumentasi tidak ditemukan.' });
        }

        const [photos] = await pool.execute(
            'SELECT image_url FROM gallery_photos WHERE gallery_id = ?',
            [id]
        );
        await pool.execute('DELETE FROM gallery_photos WHERE gallery_id = ?', [id]);
        await pool.execute('DELETE FROM galleries WHERE id = ?', [id]);
        await removeGalleryImages([rows[0].image_url, ...photos.map((photo) => photo.image_url)]);

        res.json({ success: true, message: 'Dokumentasi berhasil dihapus.' });
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus dokumentasi.' });
    }
};
