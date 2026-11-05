const { test } = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../config/db');
const originalDbModule = require.cache[dbPath];
const calls = [];
let messageExists = true;

require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: {
        pool: {
            execute: async (...args) => {
                calls.push(args);
                if (args[0].startsWith('SELECT id FROM messages')) {
                    return [messageExists ? [{ id: 8 }] : []];
                }
                return [{ affectedRows: 1 }];
            }
        }
    }
};

const { updateMessageStatus } = require('./adminMessageController');

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

test('updateMessageStatus stores a read/unread status', async () => {
    calls.length = 0;
    messageExists = true;
    const response = createResponse();

    await updateMessageStatus({ params: { id: '8' }, body: { is_read: 0 } }, response, () => {});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body.data, { id: '8', is_read: 0 });
    assert.deepEqual(calls[1], ['UPDATE messages SET is_read = ? WHERE id = ?', [0, '8']]);
});

test('updateMessageStatus rejects invalid status values', async () => {
    calls.length = 0;
    const response = createResponse();

    await updateMessageStatus({ params: { id: '8' }, body: { is_read: 'yes' } }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(calls.length, 0);
});

test('updateMessageStatus returns not found for a missing message', async () => {
    calls.length = 0;
    messageExists = false;
    const response = createResponse();

    await updateMessageStatus({ params: { id: '404' }, body: { is_read: 1 } }, response);

    assert.equal(response.statusCode, 404);
    assert.equal(calls.length, 1);
});