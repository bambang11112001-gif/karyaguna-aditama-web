const { test } = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../config/db');
const originalDbModule = require.cache[dbPath];
const calls = [];

require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: {
        pool: {
            execute: async (...args) => {
                calls.push(args);
                if (args[0].startsWith('CREATE TABLE')) return [[]];
                if (args[0].startsWith('INSERT INTO galleries')) return [{ insertId: 12 }];
                if (args[0].startsWith('INSERT INTO gallery_photos')) return [{ insertId: calls.length }];
                if (args[0].includes('COUNT(*) AS photo_count')) return [[{ photo_count: 2 }]];
                if (args[0].includes('FROM gallery_photos WHERE gallery_id IN')) {
                    return [[
                        { id: 1, gallery_id: 12, image_url: '/uploads/gallery/cover.jpg', sort_order: 0, is_cover: 1 },
                        { id: 2, gallery_id: 12, image_url: '/uploads/gallery/inside.jpg', sort_order: 1, is_cover: 0 }
                    ]];
                }
                if (args[0].includes('FROM galleries')) {
                    return [[{
                        id: 12,
                        title: 'Dokumentasi Uji',
                        description: 'Logistik & Distribusi',
                        category: 'Logistik & Distribusi',
                        image_url: '/uploads/gallery/cover.jpg'
                    }]];
                }
                return [[]];
            }
        }
    }
};

const { getGallery, createGalleryItem, updateGalleryItem } = require('./galleryController');

if (originalDbModule) {
    require.cache[dbPath] = originalDbModule;
} else {
    delete require.cache[dbPath];
}

function createResponse() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test('getGallery returns gallery records from the database pool', async () => {
    calls.length = 0;
    const response = createResponse();

    await getGallery({}, response);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data[0].id, 12);
    assert.equal(response.body.data[0].photos.length, 2);
    assert.equal(response.body.data[0].image_url, '/uploads/gallery/cover.jpg');
    assert.ok(calls.some(([query]) => query.includes('FROM galleries')));
});

test('createGalleryItem stores multiple uploaded album photos', async () => {
    calls.length = 0;
    const response = createResponse();

    await createGalleryItem({
        body: { title: 'Dokumentasi Uji', category: 'Logistik & Distribusi' },
        files: [
            { filename: 'cover.jpg', path: 'unused-cover.jpg' },
            { filename: 'detail.jpg', path: 'unused-detail.jpg' }
        ]
    }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.image_url, '/uploads/gallery/cover.jpg');
    assert.equal(response.body.data.category, 'Logistik & Distribusi');
    assert.equal(response.body.data.photos.length, 2);
    assert.deepEqual(calls.find(([query]) => query.startsWith('INSERT INTO galleries'))[1], [
        'Dokumentasi Uji',
        'Logistik & Distribusi',
        '/uploads/gallery/cover.jpg'
    ]);
    const savedPhotos = calls.filter(([query]) => query.startsWith('INSERT INTO gallery_photos'));
    assert.equal(savedPhotos.length, 2);
    assert.deepEqual(savedPhotos.map(([, values]) => values.slice(2)), [[0, 1], [1, 0]]);
});

test('updateGalleryItem changes album details and appends uploaded photos', async () => {
    calls.length = 0;
    const response = createResponse();

    await updateGalleryItem({
        params: { id: '12' },
        body: { title: 'Kegiatan Terbaru', category: 'OPERASIONAL' },
        files: [{ filename: 'additional.jpg', path: 'unused-additional.jpg' }]
    }, response);

    assert.equal(response.body.success, true);
    assert.ok(calls.some(([query]) => query.startsWith('UPDATE galleries')));
    const savedPhoto = calls.find(([query]) => query.startsWith('INSERT INTO gallery_photos'));
    assert.deepEqual(savedPhoto[1], ['12', '/uploads/gallery/additional.jpg', 2]);
});
