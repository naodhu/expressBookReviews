const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();
const axios = require('axios');

let users = [{ username: 'testuser', password: 'testpass' }];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }
  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });
    return res.status(200).json({ message: 'Login successful', token });
  } else {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Add or modify a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  //Write your code here
  const { review } = req.query;
  const { isbn } = req.params;
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token.split(' ')[1], 'secret_key', (err, decoded) => {
    if (err)
      return res.status(500).json({ message: 'Failed to authenticate token' });

    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }

    let book = books[isbn];
    if (!book.reviews) {
      book.reviews = {};
    }

    book.reviews[username] = review;

    return res.status(200).json({ message: 'Review added', book });
  });
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token.split(' ')[1], 'secret_key', (err, decoded) => {
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }

    let book = books[isbn];
    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: 'Review not found' });
    }

    delete book.reviews[username];

    return res.status(200).json({ message: 'Review deleted', book });
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
