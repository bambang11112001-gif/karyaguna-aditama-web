const express = require('express');
const {
    getBusinessFields,
    createBusinessField,
    updateBusinessField,
    deleteBusinessField
} = require('../controllers/businessFieldController');
const verifyToken = require('../middlewares/authMiddleware');
const createImageUpload = require('../middlewares/productImageUpload');

const router = express.Router();
const uploadBusinessFieldImages = createImageUpload('business-fields', { multiple: true, maxFiles: 10, fieldName: 'images' });

router.get('/', verifyToken, getBusinessFields);
router.post('/', verifyToken, uploadBusinessFieldImages, createBusinessField);
router.put('/:id', verifyToken, uploadBusinessFieldImages, updateBusinessField);
router.delete('/:id', verifyToken, deleteBusinessField);

module.exports = router;