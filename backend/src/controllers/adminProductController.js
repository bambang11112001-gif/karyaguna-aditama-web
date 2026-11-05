const { pool } = require('../config/db');
const fs = require('node:fs/promises');
const path = require('node:path');

// 1. Ambil Semua Kategori
exports.getCategories = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM product_categories ORDER BY name ASC');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal memuat kategori.' });
    }
};

// 2. Ambil Semua Produk (beserta nama kategorinya)
exports.getProducts = async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN product_categories c ON p.category_id = c.id 
            ORDER BY p.id DESC
        `;
        const [rows] = await pool.execute(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal memuat data produk.' });
    }
};

exports.getPublicProducts = async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE p.is_active = 1
            ORDER BY p.id DESC
        `;
        const [rows] = await pool.execute(query);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error loading public products:', error);
        res.status(500).json({ success: false, message: 'Gagal memuat produk publik.' });
    }
};

// 3. Tambah Produk Baru
exports.createProduct = async (req, res) => {
    try {
        const { category_id, name, description } = req.body;

        if (!category_id || !name || !description) {
            if (req.file) {
                await fs.unlink(req.file.path).catch((error) => {
                    if (error.code !== 'ENOENT') console.error('Error removing uploaded product image:', error);
                });
            }
            return res.status(400).json({ success: false, message: 'Kategori, nama, dan deskripsi produk wajib diisi.' });
        }

        // Buat slug sederhana dari nama produk
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;

        const query = `INSERT INTO products (category_id, name, slug, description, image_url, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())`;
        
        const [result] = await pool.execute(query, [category_id, name, slug, description, imageUrl]);

        res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan.',
            data: { id: result.insertId, name, image_url: imageUrl }
        });
    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch((cleanupError) => {
                if (cleanupError.code !== 'ENOENT') console.error('Error removing uploaded product image:', cleanupError);
            });
        }
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan produk.' });
    }
};

exports.updateProduct = async (req, res) => {
    const categoryId = typeof req.body.category_id === 'string' ? req.body.category_id.trim() : '';
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';

    if (!/^\d+$/.test(req.params.id) || !categoryId || !name || !description) {
        if (req.file) await fs.unlink(req.file.path).catch(() => {});
        return res.status(400).json({ success: false, message: 'Kategori, nama, dan deskripsi produk wajib diisi.' });
    }

    try {
        const [rows] = await pool.execute('SELECT image_url FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            if (req.file) await fs.unlink(req.file.path).catch(() => {});
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan.' });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : rows[0].image_url;
        await pool.execute(
            'UPDATE products SET category_id = ?, name = ?, slug = ?, description = ?, image_url = ? WHERE id = ?',
            [categoryId, name, slug, description, imageUrl, req.params.id]
        );

        if (req.file && rows[0].image_url?.startsWith('/uploads/products/')) {
            const oldImagePath = path.resolve(__dirname, '..', 'uploads', 'products', path.basename(rows[0].image_url));
            await fs.unlink(oldImagePath).catch((error) => {
                if (error.code !== 'ENOENT') console.error('Error removing replaced product image:', error);
            });
        }

        res.json({
            success: true,
            message: 'Produk berhasil diperbarui.',
            data: { id: req.params.id, category_id: categoryId, name, slug, description, image_url: imageUrl }
        });
    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch((cleanupError) => {
                if (cleanupError.code !== 'ENOENT') console.error('Error removing uploaded product image:', cleanupError);
            });
        }
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui produk.' });
    }
};

// 4. Hapus Produk
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT image_url FROM products WHERE id = ?', [id]);
        await pool.execute('DELETE FROM products WHERE id = ?', [id]);
        const imageUrl = rows[0]?.image_url;
        if (imageUrl?.startsWith('/uploads/products/')) {
            const imagePath = path.resolve(__dirname, '..', 'uploads', 'products', path.basename(imageUrl));
            await fs.unlink(imagePath).catch((error) => {
                if (error.code !== 'ENOENT') console.error('Error removing deleted product image:', error);
            });
        }
        res.json({ success: true, message: 'Produk berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menghapus produk.' });
    }
};