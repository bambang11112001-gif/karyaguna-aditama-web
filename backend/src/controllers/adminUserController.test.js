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
                if (args[0].startsWith('SELECT password FROM users')) {
                    return [[{ password: bcrypt.hashSync('old-password-123', 4) }]];
                }
                return [{ affectedRows: 1, insertId: 7 }];
            }
        }
    }
};

const { createAdmin, updateAdmin, changeOwnPassword } = require('./adminUserController');

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

test('createAdmin stores a bcrypt password hash and returns no credential data', async () => {
    calls.length = 0;
    const response = createResponse();

    await createAdmin({
        body: {
            name: 'Admin Baru',
            username: 'admin.baru',
            email: 'admin@example.com',
            password: 'a-secure-password'
        }
    }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.data.role, 'admin');
    assert.equal(Object.hasOwn(response.body.data, 'password'), false);
    assert.equal(await bcrypt.compare('a-secure-password', calls[0][1][3]), true);
});

test('changeOwnPassword verifies current password and saves a new hash', async () => {
    calls.length = 0;
    const response = createResponse();

    await changeOwnPassword({
        user: { id: 4 },
        body: { current_password: 'old-password-123', new_password: 'new-password-123' }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(calls[1][0], 'UPDATE users SET password = ? WHERE id = ?');
    assert.equal(await bcrypt.compare('new-password-123', calls[1][1][0]), true);
});

test('updateAdmin changes account profile without changing its role', async () => {
    calls.length = 0;
    const response = createResponse();

    await updateAdmin({
        params: { id: '7' },
        body: { name: 'Updated Admin', username: 'updated.admin', email: 'updated@example.com' }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.role, 'admin');
    assert.match(calls[1][0], /UPDATE users SET name = \?, username = \?, email = \?/);
});

test('changeOwnPassword rejects an incorrect current password', async () => {
    calls.length = 0;
    const response = createResponse();

    await changeOwnPassword({
        user: { id: 4 },
        body: { current_password: 'wrong-password', new_password: 'new-password-123' }
    }, response);

    assert.equal(response.statusCode, 401);
    assert.equal(calls.length, 1);
});