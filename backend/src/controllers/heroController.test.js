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
                const [query] = args;
                if (query.includes('MAX(order_priority)')) return [[{ next_priority: 3 }]];
                if (query.startsWith('INSERT INTO hero_slideshow')) return [{ insertId: 7 }];
                if (query.startsWith('DELETE FROM hero_slideshow')) return [{ affectedRows: 1 }];
                if (query.includes('WHERE is_active = TRUE')) {
                    return [[{ id: 7, image_url: 'hero.jpg', order_priority: 3 }]];
                }
                return [[{ id: 7, image_url: 'hero.jpg', order_priority: 3, is_active: 1 }]];
            }
        }
    }
};

const {
    getAdminHeroSlides,
    createHeroSlide,
    deleteHeroSlide,
    getActiveHeroSlides
} = require('./heroController');

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

test('admin and public endpoints return slides in their expected visibility scope', async () => {
    calls.length = 0;
    const adminResponse = createResponse();
    const publicResponse = createResponse();

    await getAdminHeroSlides({}, adminResponse);
    await getActiveHeroSlides({}, publicResponse);

    assert.equal(adminResponse.body.data[0].is_active, 1);
    assert.equal(publicResponse.body.data[0].image_url, 'hero.jpg');
    assert.ok(calls.some(([query]) => query.includes('WHERE is_active = TRUE')));
});

test('createHeroSlide validates and stores the image reference', async () => {
    calls.length = 0;
    const response = createResponse();

    await createHeroSlide({ body: { image_url: 'https://example.com/hero.jpg' } }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.order_priority, 3);
    assert.deepEqual(calls.find(([query]) => query.startsWith('INSERT INTO hero_slideshow'))[1], [
        'https://example.com/hero.jpg',
        3
    ]);
});

test('createHeroSlide stores an uploaded image in the hero uploads directory', async () => {
    calls.length = 0;
    const response = createResponse();

    await createHeroSlide({
        body: {},
        file: { filename: 'uploaded-hero.jpg', path: 'unused-upload.jpg' }
    }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.image_url, '/uploads/hero/uploaded-hero.jpg');
    assert.deepEqual(calls.find(([query]) => query.startsWith('INSERT INTO hero_slideshow'))[1], [
        '/uploads/hero/uploaded-hero.jpg',
        3
    ]);
});

test('createHeroSlide rejects invalid image references', async () => {
    const response = createResponse();

    await createHeroSlide({ body: { image_url: 'javascript:alert(1)' } }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
});

test('deleteHeroSlide removes an existing slide', async () => {
    const response = createResponse();

    await deleteHeroSlide({ params: { id: '7' } }, response);

    assert.equal(response.body.success, true);
});
