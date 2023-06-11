const mongoose = require('mongoose');
const Card = require('../models/card');
const {
  VALIDATION_ERROR,
  NOT_FOUND_ERROR,
  REFERENCE_ERROR,
} = require('../errors/errorsCodes');

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch(() => res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
      }
    });
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card || (req.user._id !== card.owner)) {
        res.status(NOT_FOUND_ERROR).send({ message: 'Карточка с указанным _id не найдена.' });
      } else {
        next(res.send({ data: card }));
      }
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные для удаления карточки' });
      } else {
        res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
      }
    });
};

module.exports.likeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
  { runValidators: true },
)
  .then((card) => {
    if (!card) {
      res.status(NOT_FOUND_ERROR).send({ message: 'Переданы некорректные данные для постановки лайка.' });
    } else {
      next(res.send({ data: card }));
    }
  })
  .catch((err) => {
    if (err instanceof mongoose.Error.CastError) {
      res.status(VALIDATION_ERROR).send({ message: 'Передан несуществующий _id карточки.' });
    } else {
      res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
    }
  });

module.exports.dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      res.status(NOT_FOUND_ERROR).send({ message: 'Передан несуществующий _id карточки.' });
    } else {
      next(res.send({ data: card }));
    }
  })
  .catch((err) => {
    if (err instanceof mongoose.Error.CastError) {
      res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные для снятия лайка.' });
    } else {
      res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' });
    }
  });
