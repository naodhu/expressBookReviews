const express = require('express');
const axios =require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  console.log('Register endpoint hit');
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' });
  }
  let filtered_users = users.filter((user) => user.username === username);
  if (filtered_users.length > 0) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  users.push({ username, password });
  return res.status(200).json({ message: 'User registered successfully' });
});



// Get the book list available in the shop
public_users.get('/', function (req, res) {
  //Write your code here
  res.send(JSON.stringify({ books }, null, 4));
  return res.status(300).json({ message: 'Yet to be implemented' });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
    try {
        const response = await axios.get(`http://localhost:7070/books/${isbn}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching book details' });
    }
});


// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
  const author = req.params.author.toLowerCase();
    try {
        const response = await axios.get(`http://localhost:7070/books?author=${author}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by author' });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();
    try {
        const response = await axios.get(`http://localhost:7070/books?title=${title}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books by title' });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (books[isbn] && books[isbn].reviews) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(300).json({ message: 'Book reviews not found' });
});

module.exports.general = public_users;
