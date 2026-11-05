const express = require('express');
const { getActiveHeroSlides } = require('../controllers/heroController');

const router = express.Router();

router.get('/', getActiveHeroSlides);

module.exports = router;
