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
                if (args[0].startsWith('SELECT image_url, image_urls FROM business_fields')) {
                    return [[{
                        image_url: '/uploads/business-fields/first.jpg',
                        image_urls: JSON.stringify(['/uploads/business-fields/first.jpg'])
                    }]];
                }
                if (args[0].startsWith('INSERT INTO business_fields')) return [{ insertId: 4 }];
                return [{ affectedRows: 1 }];
            }
        }
    }
};

const { createBusinessField, updateBusinessField } = require('./businessFieldController');

if (originalDbModule) {
    require.cache[dbPath] = originalDbModule;
} else {
    delete require.cache[dbPath];
}

const createResponse = () => ({
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
});

test('createBusinessField stores multiple uploaded image URLs', async () => {
    calls.length = 0;
    const response = createResponse();

    await createBusinessField({
        body: { title: 'Food Trading', description: 'Komoditas pangan', icon: 'TrendingUp' },
        files: [
            { filename: 'food-one.jpg', path: 'unused-food-one.jpg' },
            { filename: 'food-two.jpg', path: 'unused-food-two.jpg' }
        ]
    }, response);

    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.body.data.image_urls, [
        '/uploads/business-fields/food-one.jpg',
        '/uploads/business-fields/food-two.jpg'
    ]);
    assert.deepEqual(JSON.parse(calls[0][1][4]), response.body.data.image_urls);
});

test('updateBusinessField keeps selected existing photos and appends new photos', async () => {
    calls.length = 0;
    const response = createResponse();

    await updateBusinessField({
        params: { id: '2' },
        body: {
            title: 'Food Trading',
            description: 'Komoditas pangan nasional',
            icon: 'TrendingUp',
            keep_image_urls: JSON.stringify(['/uploads/business-fields/first.jpg'])
        },
        files: [{ filename: 'food-new.jpg', path: 'unused-food-new.jpg' }]
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body.data.image_urls, [
        '/uploads/business-fields/first.jpg',
        '/uploads/business-fields/food-new.jpg'
    ]);
    assert.deepEqual(JSON.parse(calls[1][1][4]), response.body.data.image_urls);
});