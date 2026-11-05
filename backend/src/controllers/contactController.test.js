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
                return [{ insertId: 42 }];
            }
        }
    }
};

const { createMessage } = require('./contactController');

if (originalDbModule) {
    require.cache[dbPath] = originalDbModule;
} else {
    delete require.cache[dbPath];
}

test('createMessage saves contact data with the database pool', async () => {
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

    await createMessage({
        body: {
            name: 'Test User',
            company_name: '',
            email: 'test@example.com',
            phone: '08123456789',
            subject: 'Kerja Sama',
            message: 'Test inquiry'
        }
    }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.id, 42);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0][1], [
        'Test User',
        null,
        'test@example.com',
        '08123456789',
        'Kerja Sama',
        'Test inquiry'
    ]);
});
