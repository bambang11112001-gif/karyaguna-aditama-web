const express = require('express');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const adminGalleryRoutes = require('./routes/adminGalleryRoutes');
const companyProfileRoutes = require('./routes/companyProfileRoutes');
const adminCompanyProfileRoutes = require('./routes/adminCompanyProfileRoutes');
const adminMessageRoutes = require('./controllers/adminMessageRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');
const websiteSettingsRoutes = require('./routes/websiteSettingsRoutes');
const adminWebsiteSettingsRoutes = require('./routes/adminWebsiteSettingsRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const businessFieldRoutes = require('./routes/businessFieldRoutes');
const adminBusinessFieldRoutes = require('./routes/adminBusinessFieldRoutes');
const heroRoutes = require('./routes/heroRoutes');
const adminHeroRoutes = require('./routes/adminHeroRoutes');
const path = require('node:path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder statis untuk penyimpanan upload gambar
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin/gallery', adminGalleryRoutes);
app.use('/api/company-profile', companyProfileRoutes);
app.use('/api/admin/company-profile', adminCompanyProfileRoutes);
app.use('/api/admin/messages', adminMessageRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/settings', websiteSettingsRoutes);
app.use('/api/admin/settings', adminWebsiteSettingsRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/business-fields', businessFieldRoutes);
app.use('/api/admin/business-fields', adminBusinessFieldRoutes);
app.use('/api/hero-slides', heroRoutes);
app.use('/api/admin/hero', adminHeroRoutes);

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'API PT Karyaguna Aditama Berjalan dengan Baik' });
});

// Port Server
const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server Backend berjalan di port ${PORT}`);
    });
}
module.exports = app;