const User = require('../models/user');
const {
  VALIDATION_ERROR,
  NOT_FOUND_ERROR,
  REFERENCE_ERROR,
} = require('../errors/errorsCodes');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' }));
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
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
        res.status(NOT_FOUND_ERROR).send({ message: 'Пользователь по указанному _id не найден.' });
      } else {
        next(res.send({ data: user }));
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные _id' });
      } else {
        res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
      }
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then((user) => next(res.send({ data: user })))
    .catch((err) => {
      if (err.name === 'NotFoundError') {
        res.status(NOT_FOUND_ERROR).send({ message: 'Пользователь с указанным _id не найден.' });
      } else if (err.name === 'ValidationError') {
        res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
      } else {
        res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => next(res.send({ data: user })))
    .catch((err) => {
      if (err.name === 'NotFoundError') {
        res.status(NOT_FOUND_ERROR).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
      } else if (err.name === 'ValidationError') {
        res.status(VALIDATION_ERROR).send({ message: 'Пользователь с указанным _id не найден.' });
      } else {
        res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
      }
    });
};
