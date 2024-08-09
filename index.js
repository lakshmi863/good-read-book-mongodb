const express = require('express');
const mongoose = require('mongoose');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

// MongoDB connection
const mongoDBURI = 'mongodb://localhost:27017/bookstore';
mongoose.connect(mongoDBURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

// MySQL connection
const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',          
  password: 'lakshmi',  
  database: 'product' 
});

// MongoDB Schema and Model
const bookSchema = new mongoose.Schema({
  id: Number,
  title: String,
  authorId: Number,
  rating: Number,
  ratingCount: Number,
  reviewCount: Number,
  description: String,
  pages: Number,
  dateOfPublication: Date,
  editionalLanguage: String,
  price: Number,
  onlineStore: String,
});

const Book = mongoose.model('Book', bookSchema);

// GET request (MongoDB)
app.get('/api/books/mongodb', async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST request (MongoDB)
app.post('/api/books/mongodb', async (req, res) => {
  const book = new Book(req.body);
  try {
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Connect to the MySQL database
mysqlConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database');
});

// Create the bookDetails table
const createTableQuery = `
CREATE TABLE IF NOT EXISTS bookDetails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  authorId INT NOT NULL,
  rating DECIMAL(3,2) NOT NULL,
  ratingCount INT NOT NULL,
  reviewCount INT NOT NULL,
  description TEXT,
  pages INT,
  dateOfPublication DATE,
  editionalLanguage VARCHAR(255),
  price DECIMAL(10,2),
  onlineStore VARCHAR(255)
)`;

mysqlConnection.query(createTableQuery, (err, results) => {
  if (err) {
    console.error('Error creating table:', err.stack);
    return;
  }
  console.log('Table created successfully:', results);
});

// GET request (MySQL)
app.get('/api/books/mysql', (req, res) => {
  mysqlConnection.query('SELECT * FROM bookDetails', (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.json(results);
  });
});

// POST request (MySQL)
app.post('/api/books/mysql', (req, res) => {
  const { title, authorId, rating, ratingCount, reviewCount, description, pages, dateOfPublication, editionalLanguage, price, onlineStore } = req.body;
  
  const query = `
    INSERT INTO bookDetails (title, authorId, rating, ratingCount, reviewCount, description, pages, dateOfPublication, editionalLanguage, price, onlineStore)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const bookData = [
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionalLanguage,
    price,
    onlineStore
  ];

  mysqlConnection.query(query, bookData, (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(201).json({ message: 'Book added successfully', bookId: results.insertId });
  });
});

// PUT request (MySQL) - Update a book
app.put('/api/books/mysql/:id', (req, res) => {
  const { id } = req.params;
  const { title, authorId, rating, ratingCount, reviewCount, description, pages, dateOfPublication, editionalLanguage, price, onlineStore } = req.body;

  const query = `
    UPDATE bookDetails
    SET title = ?, authorId = ?, rating = ?, ratingCount = ?, reviewCount = ?, description = ?, pages = ?, dateOfPublication = ?, editionalLanguage = ?, price = ?, onlineStore = ?
    WHERE id = ?
  `;

  const bookData = [
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionalLanguage,
    price,
    onlineStore,
    id
  ];

  mysqlConnection.query(query, bookData, (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book updated successfully' });
  });
});

// DELETE request (MySQL) - Delete a book
app.delete('/api/books/mysql/:id', (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM bookDetails WHERE id = ?`;

  mysqlConnection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  });
});

// Start the server
app.listen(4000, () => {
  console.log('Server is up and running on port 4000');
});
