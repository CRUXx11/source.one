const express = require("express");
const app = express();
const mongoose = require("mongoose");
require('dotenv').config();


app.use(express.urlencoded({extended:true}));

// schema 
const bookstoreSchema= new mongoose.Schema({
    customer_id: Number,
    customer_name: String,
    books: [{
        book_id: String,
        author_name: String,
        book_name: String,
        lend_date: Date,
        days_to_return: Number
    }]
});

// Define a model based on the schema
const Bookstore = mongoose.model('bookstore', bookstoreSchema,'bookstore');

mongoose.connect(process.env.MONGODB_URI)
    .then(() =>  { console.log('Connected to MongoDB Atlas');
   })
    .catch(err => console.error('Error connecting to MongoDB Atlas', err));

app.listen(8080, () => {
    console.log("Listening to port 8080");
});

app.get("/:bookname", async (req, res) => {
    try {
        const { bookname } = req.params;
        const book = await Bookstore.findOne({ "books.book_name": bookname }, { "books.$": 1 });
        let daysToReturn = book.books[0].days_to_return;
        let lendDate = book.books[0].lend_date;

        const returnDate = new Date(lendDate.getTime() + (daysToReturn * 24 * 60 * 60 * 1000) +1);
        const formattedReturnDate = returnDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        console.log(book.books);

        if (book) {
            res.send(`The book will be available on : ${formattedReturnDate}`);
        } else {
            res.status(404).send("Book not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


