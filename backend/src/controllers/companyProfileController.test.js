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
                if (args[0].startsWith('SELECT id FROM company_profile')) return [[{ id: 1 }]];
                return [[{
                    company_name: 'PT Contoh',
                    year_established: 2000,
                    background: 'Sejarah',
                    vision: 'Visi',
                    mission: 'Misi'
                }]];
            }
        }
    }
};

const { getCompanyProfile, updateCompanyProfile } = require('./companyProfileController');

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

test('getCompanyProfile returns the public profile fields', async () => {
    calls.length = 0;
    const response = createResponse();

    await getCompanyProfile({}, response);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.company_name, 'PT Contoh');
    assert.match(calls[0][0], /FROM company_profile/);
});

test('updateCompanyProfile updates the existing company profile', async () => {
    calls.length = 0;
    const response = createResponse();

    await updateCompanyProfile({
        body: {
            company_name: 'PT Baru',
            year_established: '2001',
            background: 'Riwayat perusahaan',
            vision: 'Visi baru',
            mission: 'Misi pertama\nMisi kedua'
        }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(calls.length, 2);
    assert.match(calls[1][0], /^UPDATE company_profile SET/);
    assert.equal(calls[1][1][0], 'PT Baru');
    assert.equal(calls[1][1][1], 2001);
});
