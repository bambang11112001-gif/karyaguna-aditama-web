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
                if (args[0].startsWith('INSERT INTO products')) {
                    return [{ insertId: 2 }];
                }
                if (args[0].startsWith('SELECT image_url FROM products')) {
                    return [[{ image_url: '/uploads/products/existing.jpg' }]];
                }
                if (args[0].startsWith('UPDATE products')) {
                    return [{ affectedRows: 1 }];
                }
                return [[{
                    id: 1,
                    name: 'Beras',
                    category_name: 'Bahan Pokok'
                }]];
            }
        }
    }
};

const { getProducts, getPublicProducts, createProduct, updateProduct } = require('./adminProductController');

if (originalDbModule) {
    require.cache[dbPath] = originalDbModule;
} else {
    delete require.cache[dbPath];
}

test('getProducts queries the database pool and returns product rows', async () => {
    calls.length = 0;
    const response = {
        body: null,
        statusCode: 200,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };

    await getProducts({}, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, {
        success: true,
        data: [{ id: 1, name: 'Beras', category_name: 'Bahan Pokok' }]
    });
    assert.equal(calls.length, 1);
    assert.match(calls[0][0], /FROM products p/);
});

test('getPublicProducts only returns active catalog products', async () => {
    calls.length = 0;
    const response = {
        body: null,
        json(body) {
            this.body = body;
            return this;
        }
    };

    await getPublicProducts({}, response);

    assert.equal(response.body.success, true);
    assert.match(calls[0][0], /WHERE p\.is_active = 1/);
});

test('createProduct saves an uploaded image URL with the product', async () => {
    calls.length = 0;
    const response = {
        statusCode: null,
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

    await createProduct({
        body: {
            category_id: '3',
            name: 'Produk Uji',
            description: 'Deskripsi produk uji'
        },
        file: { filename: 'test-image.jpg', path: 'unused-test-image.jpg' }
    }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.image_url, '/uploads/products/test-image.jpg');
    assert.equal(calls[0][1][4], '/uploads/products/test-image.jpg');
});

test('updateProduct preserves the existing image when no replacement is uploaded', async () => {
    calls.length = 0;
    const response = {
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

    await updateProduct({
        params: { id: '5' },
        body: { category_id: '3', name: 'Produk Diperbarui', description: 'Deskripsi baru' }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.image_url, '/uploads/products/existing.jpg');
    assert.equal(calls[1][1][4], '/uploads/products/existing.jpg');
    assert.match(calls[1][0], /^UPDATE products SET/);
});
