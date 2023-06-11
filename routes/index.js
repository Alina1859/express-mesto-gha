const express = require('express');
const { celebrate, Joi } = require('celebrate');

const router = express.Router();

const usersRouter = require('./users');
const cardsRouter = require('./cards');

const { createUser, login } = require('../controllers/users');

const auth = require('../middlewares/auth');

const { NOT_FOUND_ERROR } = require('../errors/errorsCodes');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    // eslint-disable-next-line no-useless-escape
    avatar: Joi.string().regex(/^(http|https):\/\/[-a-zA-Z0-9._~\-:?#[\]@!$&'()*+,\/;=]{2,256}/),
    about: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

router.use(auth);

router.use('/users', usersRouter);
router.use('/cards', cardsRouter);

router.use('*', (req, res, next) => {
  next(res.status(NOT_FOUND_ERROR).send({ message: 'Передан некорректный путь' }));
});

module.exports = router;
