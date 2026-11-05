const express = require('express');
const { getPublicProducts } = require('../controllers/adminProductController');

const router = express.Router();

router.get('/', getPublicProducts);

module.exports = router;
