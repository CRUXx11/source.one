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
        days_to_return: Number,
        book_type:String
    }]
});

// Define a model based on the schema
const Bookstore = mongoose.model('bookstore', bookstoreSchema,'bookstore');

mongoose.connect(process.env.MONGODB_URI)
    .then(() =>  { console.log('Connected to MongoDB Atlas');
   })
    .catch(err => console.error('Error connecting to MongoDB Atlas', err));

app.listen(8081, () => {
    console.log("Listening to port 8081");
});

app.get("/book/:bookname", async (req, res) => {
    try {
        console.log("entered bookname");
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
            res.send(`The book will be available on : <b>${formattedReturnDate}</b>`);
        } else {
            res.status(404).send("Book not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// cost if he returns indiviual books
app.get("/rent/:customer/:bookname/:day", async (req, res) => {
    try {
        console.log("entered rent");
        let { customer,bookname,day } = req.params;

        // Check if customer is a number (assuming ID)
        if (!isNaN(customer)) {
            customer = await Bookstore.findOne({ "customer_id": parseInt(customer) });
        } else {
            // If not a number, treat it as a name
            customer = await Bookstore.findOne({ "customer_name": customer });
        }
       let bookDetails = customer.books.find(book=> book.book_name==bookname);
       let totalPrice = 0;
       if(bookDetails.book_type == "Regular"){
        totalPrice = 2;
        if(day>2){
            totalPrice += 1.5 * (day - 2);
        }
  
       }else if(bookDetails.book_type == "Novel"){
        totalPrice = 4.5 ;
        totalPrice += 1.5 * (day - 3)
       }  else{
        totalPrice += 3 * day ;
       }
  

        if (customer) {
            res.send(`Total Rental Cost for <b>${customer.customer_name}</b> for the ${bookDetails.book_type} Book: <b>${bookDetails.book_name}</b> is <b> ${totalPrice} Rs</b>`);
        } else {
            res.status(404).send("customer not found");
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

