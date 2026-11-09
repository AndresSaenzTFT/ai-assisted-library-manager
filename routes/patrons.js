var express = require('express');
var router = express.Router();
var Patron = require('../models').Patron;
var Sequelize = require('sequelize');
var pageLimit = 10;

// List patrons with optional field-wide search and bounded pagination.
router.get('/', async function(req, res, next) {
  try {
    var search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    var requestedPage = Number.parseInt(req.query.page, 10);
    var page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    var where = {};

    if (search) {
      var searchTerm = '%' + search.toLowerCase() + '%';
      where[Sequelize.Op.or] = Object.keys(Patron.rawAttributes)
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

    var count = await Patron.count({ where: where });
    var totalPages = Math.ceil(count / pageLimit);
    page = Math.min(page, Math.max(totalPages, 1));
    var patrons = await Patron.findAll({
      where: where,
      order: [['last_name', 'ASC'], ['first_name', 'ASC']],
      limit: pageLimit,
      offset: (page - 1) * pageLimit
    });
    var searchQuery = search ? '&search=' + encodeURIComponent(search) : '';
    var pages = Array.from({ length: totalPages }, function(_, index) {
      return {
        number: index + 1,
        href: '/patrons?page=' + (index + 1) + searchQuery,
        current: index + 1 === page
      };
    });

    res.render('all_patrons', {
      title: 'All Patrons',
      patrons: patrons,
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
  res.render('new_patron', { title: 'New Patron', patron: {} });
});

// Assign the next library ID when creating a patron.
router.post('/new', async function(req, res, next) {
  try {
    var lastPatron = await Patron.findOne({ order: [['id', 'DESC']] });
    var libraryId = lastPatron ? lastPatron.library_id + 1 : 1;
    var patron = await Patron.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      address: req.body.address || null,
      email: req.body.email,
      library_id: libraryId,
      zip_code: req.body.zip_code || null
    });
    res.redirect('/patrons');
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).render('new_patron', {
        title: 'New Patron',
        patron: req.body,
        errors: error.errors
      });
    }
    next(error);
  }
});

router.get('/:id', async function(req, res, next) {
  try {
    var patron = await Patron.findByPk(req.params.id);
    if (!patron) {
      var err = new Error('The requested patron could not be found.');
      err.status = 404;
      return next(err);
    }
    res.render('update_patron', { title: 'Update Patron', patron: patron });
  } catch (error) {
    next(error);
  }
});

// Update patron details while retaining the generated library ID.
router.put('/:id', async function(req, res, next) {
  try {
    var patron = await Patron.findByPk(req.params.id);
    if (!patron) {
      var err = new Error('The requested patron could not be found.');
      err.status = 404;
      return next(err);
    }

    patron.first_name = req.body.first_name;
    patron.last_name = req.body.last_name;
    patron.address = req.body.address || null;
    patron.email = req.body.email;
    patron.zip_code = req.body.zip_code || null;
    await patron.save();
    res.redirect('/patrons');
  } catch (error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).render('update_patron', {
        title: 'Update Patron',
        patron: Object.assign({}, req.body, {
          id: req.params.id,
          library_id: patron.library_id
        }),
        errors: error.errors
      });
    }
    next(error);
  }
});

module.exports = router;
