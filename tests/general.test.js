const request = require('supertest');
const app = require('../index');

describe('GET /hello', () => {
  test('should return "hello worlddd!"', async () => {
    const response = await request(app).get('/hello');
    
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello Worlddd!");
  });
});