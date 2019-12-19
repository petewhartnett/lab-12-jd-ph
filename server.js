

'use strict';

const express = require('express');
const ejs = require('ejs');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const app = express();
const pg = require('pg');

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');


const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (e) => console.error(e));
client.connect();

app.get('/search', (req, res) => {
  res.render('searchGoogleApi');
});

app.get('/', (req, res) => {
  const instruction = 'SELECT * FROM books;';
  client.query(instruction).then(function(sqlData){
    console.log(sqlData.rows);
    const booksArray = sqlData.rows;
    if(booksArray.length > 0){
      res.render('index', { booksArray });
    } else {
      res.render('index');
    }

  });
});


app.post('/user-books', (req, res) => {
    // const bookArray = [];
    // bookArray.push(req.body);
    const books = req.body(savedBooks => new Book(savedBooks));
    res.render('savedBooks', bookArray);
    
  });

app.get('/hello', (req, res) => {
  res.render('pages/hello');
});

app.post('/searches', (req, res) => {
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=${req.body.query}+in${req.body.search}`).then(data => {
    const books = data.body.items.map(book => new Book(book));
    res.render('searchList', { books });
  }).catch(error => {
    res.render('error', { error });
  });
});

function Book(bookObj) {
  this.image_url = bookObj.volumeInfo.imageLinks && bookObj.volumeInfo.imageLinks.thumbnail;
  this.title = bookObj.volumeInfo.title;
  this.author = bookObj.volumeInfo.authors;
  this.summary = bookObj.volumeInfo.description;
  this.categorie = bookObj.volumeInfo.categories;
  this.isbn = bookObj.volumeInfo.industryIdentifiers[0].identifier;
}

app.listen(PORT, () => console.log(`app running on ${PORT}`));