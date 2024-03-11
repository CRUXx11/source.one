const request = require('supertest');
const app = require('../app.js');
const mongoose = require('mongoose');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
});

describe('POST /rent', () => {
    test('should render rent page with customer details for existing customer and book', async () => {
        const username = 'Mrs. Esther Cartwright';
        const bookname = 'gah laborer superintend';
        const response = await request(app)
            .post('/rent')
            .type('form')
            .send({ username, bookname });

        expect(response.status).toBe(200);
        expect(response.text).toContain('username'); 
       
    });

    test('should return 404 for non-existing customer', async () => {
        const username = 'Non Existing User';
        const bookname = 'gah laborer superintend';
        const response = await request(app)
            .post('/rent')
            .type('form')
            .send({ username, bookname });

        expect(response.status).toBe(404);
        expect(response.text).toBe('Customer not found');
    });

    test('should return 404 for non-existing book', async () => {
        const username = 'Mrs. Esther Cartwright';
        const bookname = 'Non Existing Book';
        const response = await request(app)
            .post('/rent')
            .type('form')
            .send({ username, bookname });

        expect(response.status).toBe(404);
        expect(response.text).toBe('Book not found');
    });

    test('should return 500 for internal server error', async () => {
        const response = await request(app)
            .post('/rent')
            .type('form')
            .send(); // Sending empty request body intentionally to trigger internal server error

        expect(response.status).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });
});
