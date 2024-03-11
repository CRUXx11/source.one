const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
require('dotenv').config();


app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
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

// model
const Bookstore = mongoose.model('bookstore', bookstoreSchema,'bookstore');

if (!module.parent) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch(err => console.error('Error connecting to MongoDB Atlas', err));

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Listening to port ${PORT}`);
    });
}

app.get("/available",async (req,res)=>{
    res.render("availability.ejs");
})
app.get("/returnBook",async (req,res)=>{
    res.render("returnBook.ejs");
})

app.post("/bookname", async (req, res) => {
    try {
        const bookname = req.body.bookname;
        console.log("Received bookname:", bookname); 
        if (!bookname) {
            throw new Error("Bookname is missing in request body");
        }
      
        const customers = await Bookstore.find({ "books.book_name": bookname });
        
        if (customers.length === 0) {
            res.status(404).send("Book not found");
            return;
        }
        
        let maxReturnDate = new Date(0);
        customers.forEach(customer => {
            const matchedBook = customer.books.find(b => b.book_name === bookname);
            const daysToReturn = matchedBook.days_to_return;
            const lendDate = new Date(matchedBook.lend_date);
            const returnDate = new Date(lendDate.getTime() + (daysToReturn * 24 * 60 * 60 * 1000) + 1);
            
            if (returnDate > maxReturnDate) {
                maxReturnDate = returnDate;
            }
        });

        if (maxReturnDate > new Date(0)) {
            const formattedReturnDate = maxReturnDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            res.status(200).send(`The Book <b>${bookname}</b> will be available by : <b>${formattedReturnDate}</b>`);
        } else {
            res.status(404).send("Book not found");
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});


app.post("/rent", async (req, res) => {
    try {
        let username = req.body.username;
        let bookname = req.body.bookname;

       // Check if customer is a number (assuming ID)
       if (!isNaN(username)) {
        username = await Bookstore.findOne({ "customer_id": parseInt(username) });
    } else {
        // If not a number, treat it as a name
        username = await Bookstore.findOne({ "customer_name": username });
    }
   let bookDetails = username.books.find(book=> book.book_name==bookname);
   let returnDate = bookDetails.lend_date;

 const customers = await Bookstore.find({ "books.book_name": bookname });
 let customerDetails = {};
 let maxReturnDate = new Date(0);

        customers.forEach(customer => {
            const matchedBook = customer.books.find(b => b.book_name === bookname);
            const daysToReturn = matchedBook.days_to_return;
            const lendDate = new Date(matchedBook.lend_date);
            const returnDate = new Date(lendDate.getTime() + (daysToReturn * 24 * 60 * 60 * 1000) + 1);
            formattedLendDate = matchedBook.lend_date.toISOString().split('T')[0];
            if (returnDate > maxReturnDate) {
                maxReturnDate = returnDate;
                customerDetails = {
                    customer_id:customer.customer_id,
                    customer_name:customer.customer_name,
                    formattedLendDate:formattedLendDate,
                    bookDetails:matchedBook
                }
            }
        });

      
          
            let date = maxReturnDate.toISOString().split('T')[0];
            console.log(customerDetails,"sjsj",maxReturnDate.toISOString().split('T')[0])
            res.render(`rent.ejs`,{customerDetails,date});
      
        
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

app.post("/charges", async (req, res) => {
    try {
        let username = req.body.username;
        let bookname = req.body.bookname;
        let bookDetails = JSON.parse(req.body.bookDetails);
        let returnDate = req.body.date;

        const lendDate = new Date(bookDetails.lend_date);
        const returnDateObj = new Date(returnDate);

        //  difference in milliseconds
        const timeDifference = returnDateObj.getTime() - lendDate.getTime();

        // difference to days
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

        let totalCharges = 0;
       if(bookDetails.book_type == "Regular"){
        totalCharges = 2;
        if(daysDifference>2){
            totalCharges += 1.5 * (daysDifference - 2);
        }
  
       }else if(bookDetails.book_type == "Novel"){
        totalCharges = 4.5 ;
        if(daysDifference>3){
        totalCharges += 1.5 * (daysDifference - 3)
        }
       }  else{
        totalCharges += 3 * daysDifference ;
       }
  

        res.send(`Total Charges for <b>${username}</b> for the <b>${bookDetails.book_type}</b> book <b>${bookname}</b> are ${totalCharges}`);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});


module.exports = app;