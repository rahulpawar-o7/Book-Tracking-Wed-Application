import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;


app.use(express.static("public")); // CSS aur images serve karne ke liye
app.use(bodyParser.urlencoded({ extended: true })); // HTML form ka data read karne ke liye

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "My books",
    password: "10256",
    port: 5434,
});

db.connect()
    .then(() => console.log("Database connected successfully! 🎉"))
    .catch((err) => console.error("Database connection error ❌", err.stack));



app.get("/", async (req, res) => {
  try {
   
    const result = await db.query("SELECT * FROM book ORDER BY rating DESC");
    const books = result.rows; 

    
    res.render("index.ejs", { 
      title: "My Book Notes",
      listItems: books 
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error fetching books from database");
  }
});

// Add New Book Route
app.post("/add", async (req, res) => {
  // Form se aane wala data destructure kar rahe hain
  const { title, author, rating, date_read, isbn, notes } = req.body;

  try {
    // Database me data INSERT karne ki SQL query
    await db.query(
      "INSERT INTO books (title, author, rating, date_read, isbn, notes) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, rating, date_read, isbn, notes]
    );
    
    // Data save hone ke baad wapas home page par bhej do
    res.redirect("/");
  } catch (error) {
    console.log("Error inserting data:", error);
    res.status(500).send("Error adding book to the database.");
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});