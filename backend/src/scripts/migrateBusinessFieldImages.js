const { pool } = require('../config/db');

async function migrateBusinessFieldImages() {
    const [columns] = await pool.execute("SHOW COLUMNS FROM business_fields LIKE 'image_urls'");
    if (columns.length === 0) {
        await pool.execute('ALTER TABLE business_fields ADD COLUMN image_urls JSON NULL AFTER image_url');
    }
    console.log('Business fields image gallery column is ready.');
}

if (require.main === module) {
    migrateBusinessFieldImages()
        .catch((error) => {
            console.error('Failed to migrate business field images:', error);
            process.exitCode = 1;
        })
        .finally(() => pool.end());
}

module.exports = { migrateBusinessFieldImages };