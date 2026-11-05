const { test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');

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
                return [[{
                    id: 7,
                    name: 'Admin',
                    username: 'admin',
                    email: 'admin@example.com',
                    role: 'admin',
                    password: bcrypt.hashSync('valid-password', 4)
                }]];
            }
        }
    }
};

const { login } = require('./authController');

if (originalDbModule) {
    require.cache[dbPath] = originalDbModule;
} else {
    delete require.cache[dbPath];
}

test('login looks up users through the database pool', async () => {
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

    await login({
        body: { username: 'admin', password: 'valid-password' }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.user.username, 'admin');
    assert.ok(response.body.token);
    assert.deepEqual(calls, [[
        'SELECT * FROM users WHERE username = ?',
        ['admin']
    ]]);
});
