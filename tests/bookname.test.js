const request = require('supertest');
const app = require('../app.js');
const mongoose = require('mongoose');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

describe('POST /bookname', () => {
    test('should return available date for existing book', async () => {
        const bookname = 'psst huzzah meh';
        const response = await request(app)
        .post('/bookname')
        .type('form') 
        .send({ bookname });

            console.log("Response status:", response.status); // Add this line to log the response status
            console.log("Response text:", response.text); 

        expect(response.status).toBe(200);
        expect(response.text).toMatch(/The Book.*will be available by/);
    });

    test('should return 404 for non-existing book', async () => {
        const bookname = 'psst';
        const response = await request(app)
        .post('/bookname')
        .type('form') 
        .send({ bookname });

        expect(response.status).toBe(404);
        expect(response.text).toBe('Book not found');
    });

    test('should return 500 for internal server error', async () => {
        const response = await request(app)
            .post('/bookname')
            .type('form') 
            .send();

        expect(response.status).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });
});
