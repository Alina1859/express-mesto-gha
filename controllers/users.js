const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/validation-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const ForbiddenError = require('../errors/forbidden-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');
const ReferenceError = require('../errors/reference-err');

const {
  VALIDATION_ERROR,
  NOT_FOUND_ERROR,
  REFERENCE_ERROR,
} = require('../errors/errorsCodes');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' }));
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Пользователь по указанному _id не найден.' });
      } else {
        next(res.send(user));
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные _id' });
      } else {
        res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
      }
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при создании пользователя' });
      } else {
        res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
      }
    });
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      } else {
        next(res.send(user));
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new ValidationError('Переданы некорректные данные _id'));
        // res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные _id' });
      } else {
        next(err)
        // res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
      }
    });
};

function cachingDecorator(func) {
  const cache = new Map();

  return function (x) {
    if (cache.has(x)) {
      return cache.get(x);
    }

    const result = func(x);

    cache.set(x, result);
    return result;
  };
}

function updateUserData(req, res, next, args) {
  User.findByIdAndUpdate(req.user._id, args, { new: true, runValidators: true })
    .then((user) => next(res.send({ data: user })))
    .catch((err) => {
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Пользователь с указанным _id не найден.' });
      } else if (err instanceof mongoose.Error.ValidationError) {
        res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else {
        res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
      }
    });
}

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  cachingDecorator(updateUserData(req, res, next, { name, about }));
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  cachingDecorator(updateUserData(req, res, next, { avatar }));
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
    // аутентификация успешна! пользователь в переменной user
      // создадим токен
      const token = jwt.sign({ _id: user._id }, 'some-secret-key');

      // вернём токен

      // отправим токен, браузер сохранит его в куках

      res.cookie('jwt', token, {
        // token - наш JWT токен, который мы отправляем
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true,
      });
      res.send(user);// если у ответа нет тела, можно использовать метод end
    })
    .catch((err) => {
    // ошибка аутентификации
      res
        .status(401)
        .send({ message: err.message });
    });
};
