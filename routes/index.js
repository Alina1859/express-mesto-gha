const express = require('express');

const router = express.Router();

const usersRouter = require('./users');
const cardsRouter = require('./cards');

const { NOT_FOUND_ERROR } = require('../errors/errorsCodes');

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);

router.use('*', (req, res, next) => {
  next(res.status(NOT_FOUND_ERROR).send({ message: 'Передан некорректный путь' }));
});

module.exports = router;
