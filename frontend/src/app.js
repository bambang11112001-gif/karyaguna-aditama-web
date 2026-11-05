const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const adminMessageRoutes = require('./routes/adminMessageRoutes');
import AdminProducts from './admin/Products';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder statis untuk penyimpanan upload gambar
app.use('/uploads', express.static('src/uploads'));

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/messages', adminMessageRoutes);
<Route path="products" element={<AdminProducts />} />

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'API PT Karyaguna Aditama Berjalan dengan Baik' });
});

// Port Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Backend berjalan di port ${PORT}`);
});