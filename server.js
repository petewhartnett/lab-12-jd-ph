'use strict';

const express = require('express');
const ejs = require('ejs');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const methodoverride = require('method-override');
const app = express();
const pg = require('pg');

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.set('view engine', 'ejs');
app.use(methodoverride('_method'));
app.delete('/delete', deleteBook);

// POSTGRESS SET UP CLIENT 
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', (e) => console.error(e));
client.connect();

//SEARCH PATH
app.get('/search', (req, res) => {
  res.render('searchGoogleApi');
});

//USER SAVED BOOKS PATH 
app.get('/savedBook', (req, res) => {
    res.render('savedBooks');
  });

  app.get('/detail-view', (req, res) => {
    res.render('details');
  });

  //this selects all of the books from SQL saved books
app.get('/', (req, res) => {
  const instruction = 'SELECT * FROM books;';
  client.query(instruction).then(function(sqlSaveData){
    //console.log(sqlSaveData.rows);
    const booksArray = sqlSaveData.rows;
    //console.log(booksArray);
    if(booksArray.length > 0){
      res.render('index', { booksArray });
    } else {
      res.redirect('/search');
    }
  });
});

//THIS WILL SAVE THE USER BOOKS TO SQL AND RENDER THEM TO SAVED BOOKS PAGE
app.post('/user-books', (req, res) => {
  let SQL = `INSERT INTO books
  (author, title, isbn, image_url, summary, category)
  VALUES($1,$2,$3,$4,$5,$6);`;

  let sqlData = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.summary, req.body.category];

  // let SQLrow = (SQL, [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.summary, req.body.category]);

  client.query(SQL, sqlData).then(() => {
    res.redirect('/');
  });

});

app.post('/detail-view', (req, res) => {
  
  let info = [req.author, req.title, req.isbn, req.image_url, req.summary, req.category];

    res.redirect('details');
  

});

  //THIS WILL DELETE A
function deleteBook(req, res){
  console.log("HELLO", req.body.id);
    client.query('DELETE FROM books WHERE id=$1', [req.body.id]).then(result=>{
    //console.log(req.params.id);
    res.redirect('/');
    });
}

app.post('/searches', (req, res) => {
  superagent.get(`https://www.googleapis.com/books/v1/volumes?q=+in${req.body.search}:${req.body.query}`).then(data => {
    const books = data.body.items.map(book => new Book(book));
    res.render('searchList', { books });
  }).catch(error => {
    res.render('error', { error });
  });
});

function Book(bookObj) {
  this.image_url = bookObj.volumeInfo.imageLinks && bookObj.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpeg';
  this.title = bookObj.volumeInfo.title || 'undefined';
  this.author = bookObj.volumeInfo.authors || 'undefined';
  this.summary = bookObj.volumeInfo.description || 'undefined';
  this.categorie = bookObj.volumeInfo.categories || 'undefined';
  this.isbn = bookObj && bookObj.volumeInfo && bookObj.volumeInfo.industryIdentifiers && bookObj.volumeInfo.industryIdentifiers[0] && bookObj.volumeInfo.industryIdentifiers[0].identifier || 'undefined';
}

app.listen(PORT, () => console.log(`app running on ${PORT}`));