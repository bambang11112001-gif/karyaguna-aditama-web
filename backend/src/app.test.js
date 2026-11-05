const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('./app');

let server;
let baseUrl;

before(async () => {
    server = app.listen(0);
    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });

    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
});

test('root route reports that the API is running', async () => {
    const response = await fetch(baseUrl);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
        message: 'API PT Karyaguna Aditama Berjalan dengan Baik'
    });
});
