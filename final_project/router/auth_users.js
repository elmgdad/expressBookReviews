const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  let x = users.filter((user) => {
    return user.username === username;
  });
  if (x.length > 0)
    return false;
  return true;
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  let x = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  if (x.length > 0)
    return true;
  return false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  // check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Please provide both username and password." });
  }

  // check if user is registered
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  // check if password is correct
  if (user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  // generate JWT token
  const accessToken = jwt.sign({ username: user.username }, 'elmgdad');

  // save token in session
  req.session.accessToken = accessToken;
  req.session.username = username;

  // return success message with access token
  return res.json({ message: "Login successful.", accessToken });
});



regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.username;
  const isbn = req.params.isbn;
  const review = req.body.review;
  if (!review) {
    return res.status(400).json({ message: "Please provide a review" });
  }
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  if (books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review;
    return res.json({ message: "Review modified successfully" });
  }
  books[isbn].reviews[username] = review;
  return res.json({ message: "Review added successfully",data : books[isbn] });
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;
  //const user = req.body.username;
  console.log(isbn);

  if (!books[isbn]) {
    return res.status(400).json({ message: "Invalid ISBN" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(400).json({ message: "Review not found for the given ISBN and username" });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully"});
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
