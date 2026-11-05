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
                return [{ affectedRows: 1 }];
            }
        }
    }
};

const { resetAdminPassword } = require('./resetAdminPassword');

if (originalDbModule) {
    require.cache[dbPath] = originalDbModule;
} else {
    delete require.cache[dbPath];
}

test('resetAdminPassword stores a bcrypt hash for the selected username', async () => {
    calls.length = 0;

    await resetAdminPassword('admin', 'a-long-test-password');

    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'UPDATE users SET password = ? WHERE username = ?');
    assert.equal(calls[0][1][1], 'admin');
    assert.equal(await bcrypt.compare('a-long-test-password', calls[0][1][0]), true);
});

test('resetAdminPassword rejects passwords shorter than 12 characters', async () => {
    await assert.rejects(
        resetAdminPassword('admin', 'short'),
        /minimal 12 karakter/
    );
    assert.equal(calls.length, 1);
});
