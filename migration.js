const mongoose = require("mongoose");
require('dotenv').config();

// schema
const bookstoreSchema = new mongoose.Schema({
    customer_id: Number,
    customer_name: String,
    books: [{
        book_id: String,
        author_name: String,
        book_name: String,
        lend_date: Date,
        days_to_return: Number,
        book_type: String 
    }]
});

// model
const Bookstore = mongoose.model('bookstore', bookstoreSchema,'bookstore');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');

        // Run migration script
        updateBookTypes()
            .then(() => {
                console.log("Migration complete");
                mongoose.connection.close();
            })
            .catch(error => {
                console.error("Migration failed:", error);
                mongoose.connection.close();
            });
    })
    .catch(err => console.error('Error connecting to MongoDB Atlas', err));

    async function updateBookTypes() {
        try {
            const allBooks = await Bookstore.find();
            const bookTypes = ["Regular", "Fiction", "Novel"];
            for (const customer of allBooks) {
                for (const book of customer.books) {
                    book.book_type = bookTypes[Math.floor(Math.random() * bookTypes.length)];
                }
                await customer.save();
            }
        } catch (error) {
            throw new Error("Failed to update book types: " + error.message);
        }
    }
