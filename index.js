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
  
  const { title, author, rating, date_read, isbn, notes } = req.body;

  try {
   
    await db.query(
      "INSERT INTO book (title, author, rating, date_read, isbn, notes) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, rating, date_read, isbn, notes]
    );
    
    
    res.redirect("/");
  } catch (error) {
    console.log("Error inserting data:", error);
    res.status(500).send("Error adding book to the database.");
  }
});


app.post("/delete", async (req, res) => {
  const deleteId = req.body.deleteItemId; 

  try {
    
    await db.query("DELETE FROM books WHERE id = $1", [deleteId]);
    res.redirect("/"); 
  } catch (error) {
    console.log("Error deleting data:", error);
    res.status(500).send("Error deleting the book.");
  }
});

// Edit/Update Book Route
app.post("/edit", async (req, res) => {
  const id = req.body.updateItemId;
  const newRating = req.body.updatedRating;
  const newNotes = req.body.updatedNotes;

  try {
    
    await db.query(
      "UPDATE book SET rating = $1, notes = $2 WHERE id = $3",
      [newRating, newNotes, id]
    );
    res.redirect("/");
  } catch (error) {
    console.log("Error updating data:", error);
    res.status(500).send("Error updating the book.");
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});