const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');

const { UNAUTHORIZED_ERROR } = require('../errors/errorsCodes');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => next(err));
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      } else {
        next(res.send(user));
      }
    })
    .catch((err) => next(err));
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  console.log(email)

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      const { ...userData } = user.toObject();
      delete userData.password;
      res.send({ data: userData });
    })
    .catch((err) => next(err));
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
    .catch((err) => next(err));
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
    .catch((err) => next(err));
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
console.log(req)
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
      res.send(user);
    })
    .catch((err) => {
      res
        .status(UNAUTHORIZED_ERROR)
        .send({ message: err.message });
    });
};
