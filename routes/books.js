var express = require('express');
var router = express.Router();
var Book = require('../models').Book;
var Sequelize = require('sequelize');
var pageLimit = 10;

// List books with optional field-wide search and bounded pagination.
router.get('/', async function(req, res, next) {
  try {
    var search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    var requestedPage = Number.parseInt(req.query.page, 10);
    var page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    var where = {};

    if (search) {
      var searchTerm = '%' + search.toLowerCase() + '%';
      where[Sequelize.Op.or] = Object.keys(Book.rawAttributes)
        .filter(function(field) {
          return field !== 'id';
        })
        .map(function(field) {
          return Sequelize.where(
            Sequelize.fn('LOWER', Sequelize.cast(Sequelize.col(field), 'TEXT')),
            { [Sequelize.Op.like]: searchTerm }
          );
        });
    }

    var count = await Book.count({ where: where });
    var totalPages = Math.ceil(count / pageLimit);
    page = Math.min(page, Math.max(totalPages, 1));
    var books = await Book.findAll({
      where: where,
      order: [['title', 'ASC']],
      limit: pageLimit,
      offset: (page - 1) * pageLimit
    });
    var searchQuery = search ? '&search=' + encodeURIComponent(search) : '';
    var pages = Array.from({ length: totalPages }, function(_, index) {
      return {
        number: index + 1,
        href: '/books?page=' + (index + 1) + searchQuery,
        current: index + 1 === page
      };
    });

    res.render('all_books', {
      title: 'All Books',
      books: books,
      search: search,
      page: page,
      pages: pages,
      resultCount: count
    });
  } catch (error) {
    next(error);
  }
});

router.get('/new', function(req, res) {
  res.render('new_book', { title: 'New Book', book: {} });
});

// Create a book; return submitted values and validation errors to the form.
router.post('/new', async function(req, res, next) {
  try {
    var book = await Book.create({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre || null,
      first_published: req.body.first_published || null
    });
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).render('new_book', {
        title: 'New Book',
        book: req.body,
        errors: error.errors
      });
    }
    next(error);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    var book = await Book.findByPk(req.params.id);
    if (!book) {
      var err = new Error('The requested book could not be found.');
      err.status = 404;
      return next(err);
    }
    res.render('update_book', { title: 'Update Book', book: book });
  } catch (error) {
    next(error);
  }
});

// Persist edits to an existing book and redisplay validation failures.
router.put('/:id', async function(req, res, next) {
  try {
    var book = await Book.findByPk(req.params.id);
    if (!book) {
      var err = new Error('The requested book could not be found.');
      err.status = 404;
      return next(err);
    }

    book.title = req.body.title;
    book.author = req.body.author;
    book.genre = req.body.genre || null;
    book.first_published = req.body.first_published || null;
    await book.save();
    res.redirect('/books');
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).render('update_book', {
        title: 'Update Book',
        book: Object.assign({}, req.body, { id: req.params.id }),
        errors: error.errors
      });
    }
    next(error);
  }
});

module.exports = router;
