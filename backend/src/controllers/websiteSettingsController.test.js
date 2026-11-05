const { test } = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../config/db');
const originalDbModule = require.cache[dbPath];
const calls = [];
const settingsRow = {
    id: 1,
    website_name: 'KGA Test',
    tagline: 'Tagline test',
    logo_url: '',
    address: 'Jakarta',
    phone: '0800000000',
    email: 'test@example.com',
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: ''
};

require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: {
        pool: {
            execute: async (...args) => {
                calls.push(args);
                if (args[0].startsWith('SELECT * FROM website_settings')) return [[settingsRow]];
                return [{ affectedRows: 1, insertId: 1 }];
            }
        }
    }
};

const { getWebsiteSettings, updateWebsiteSettings } = require('./websiteSettingsController');

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

test('getWebsiteSettings initializes storage and returns saved settings', async () => {
    calls.length = 0;
    const response = createResponse();

    await getWebsiteSettings({}, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.website_name, 'KGA Test');
    assert.match(calls[0][0], /CREATE TABLE IF NOT EXISTS website_settings/);
    assert.match(calls[1][0], /INSERT IGNORE INTO website_settings/);
});

test('updateWebsiteSettings rejects invalid social URLs', async () => {
    calls.length = 0;
    const response = createResponse();

    await updateWebsiteSettings({
        body: {
            website_name: 'KGA Test',
            instagram_url: 'javascript:alert(1)'
        }
    }, response);

    assert.equal(response.statusCode, 400);
    assert.equal(calls.length, 0);
});

test('updateWebsiteSettings stores validated website information', async () => {
    calls.length = 0;
    const response = createResponse();

    await updateWebsiteSettings({
        body: {
            website_name: 'KGA Baru',
            tagline: 'Tagline baru',
            address: 'Bandung',
            phone: '08123456789',
            email: 'hello@example.com',
            facebook_url: 'https://facebook.com/example',
            instagram_url: '',
            linkedin_url: '',
            youtube_url: '',
            remove_logo: 'false'
        }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.website_name, 'KGA Baru');
    assert.match(calls.at(-1)[0], /^UPDATE website_settings SET/);
});