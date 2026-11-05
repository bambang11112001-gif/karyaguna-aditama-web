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
                return [[
                    { id: 1, title: 'Jasa Konstruksi', description: 'Konstruksi sejak 1997', icon: 'Building2', image_url: null },
                    { id: 2, title: 'Food Trading', description: 'Perdagangan pangan', icon: 'TrendingUp', image_url: null },
                    { id: 3, title: 'Procurement', description: 'Pengadaan profesional', icon: 'ShieldCheck', image_url: null }
                ]];
            }
        }
    }
};

const { getBusinessFields } = require('./businessFieldController');

if (originalDbModule) {
    require.cache[dbPath] = originalDbModule;
} else {
    delete require.cache[dbPath];
}

test('getBusinessFields returns the ordered business fields from MySQL', async () => {
    calls.length = 0;
    const response = {
        body: null,
        json(body) {
            this.body = body;
            return this;
        }
    };

    await getBusinessFields({}, response);

    assert.equal(response.body.success, true);
    assert.deepEqual(response.body.data.map((field) => field.title), ['Jasa Konstruksi', 'Food Trading', 'Procurement']);
    assert.match(calls[0][0], /FROM business_fields ORDER BY id ASC/);
});