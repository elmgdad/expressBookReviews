const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
  console.log(password);
  console.log(req.body);
  if (!username && username.length > 1)
    return res.status(400).json({ error: "name is required" });
  if (!password && password.length > 1)
    return res.status(400).json({ error: "password is required" });

  // check if username is already exist or not
  //if (!isValid(username))
  //  return res.status(400).json({ error: "user is already exist" });

  users.push({ username: username, password: password, });
  res.status(200).json({ message: "user registered successfully.", users });
});

function getBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}
// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  try {
    const bks = await getBooks();
    res.send(JSON.stringify(bks));
  } catch (error) {
    console.error(error);    
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  return new Promise((resolve, reject) => {

    let isbnNum = parseInt(req.params.isbn);
    if (books[isbnNum]) {
      res.send(books[isbnNum]);
    } else {
      res.status(300).json({ message: `ISBN ${isbnNum} not found` });
    }
  })
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  //Write your code here
  const author = req.params.author;
  getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.author === author))
    .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here
  const title = req.params.title;
  const book_arr = Object.values(books);
  const book = book_arr.filter((book) => book.title === title);
  res.status(200).json(book);

});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const book_isbn = req.params.isbn;
  const book = books[book_isbn];
  res.send(book);

});

module.exports.general = public_users;
