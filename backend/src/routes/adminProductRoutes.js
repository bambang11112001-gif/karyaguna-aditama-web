const express = require('express');
const router = express.Router();
const { getCategories, getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/adminProductController');
const verifyToken = require('../middlewares/authMiddleware');
const createImageUpload = require('../middlewares/productImageUpload');
const uploadProductImage = createImageUpload('products');

router.get('/categories', verifyToken, getCategories);
router.get('/', verifyToken, getProducts);
router.post('/', verifyToken, uploadProductImage, createProduct);
router.put('/:id', verifyToken, uploadProductImage, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;
// Tambah Produk Baru
exports.createProduct = async (req, res) => {
    try {
        const { category_id, name, description, image_url } = req.body;

        if (!category_id || !name || !description) {
            return res.status(400).json({ success: false, message: 'Kategori, nama, dan deskripsi produk wajib diisi.' });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Gunakan image_url dari input, atau default jika kosong
        const img = image_url && image_url.trim() !== '' ? image_url : 'default-product.jpg';

        const query = `INSERT INTO products (category_id, name, slug, description, image_url, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, NOW())`;
        
        const [result] = await db.execute(query, [category_id, name, slug, description, img]);

        res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan.',
            data: { id: result.insertId, name }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan produk.' });
    }
};