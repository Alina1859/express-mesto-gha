const Card = require('../models/card');
const {
  VALIDATION_ERROR,
  NOT_FOUND_ERROR,
  REFERENCE_ERROR,
} = require('../errors/errorsCodes');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'ReferenceError') {
        next(res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' }));
      } else {
        next(err);
      }
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные при создании карточки' }));
      } else {
        next(res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' }));
      }
    });
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findByIdAndRemove(req.params.id)
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'NotFoundError') {
        next(res.status(NOT_FOUND_ERROR).send({ message: 'Карточка с указанным _id не найдена.' }));
      } else {
        next(res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' }));
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
      next(res.status(NOT_FOUND_ERROR).send({ message: 'Переданы некорректные данные для постановки лайка.' }));
    } else {
      next(res.send({ data: card }));
    }
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      next(res.status(VALIDATION_ERROR).send({ message: 'Передан несуществующий _id карточки.' }));
    } else {
      next(res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' }));
    }
  });

module.exports.dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      next(res.status(NOT_FOUND_ERROR).send({ message: 'Передан несуществующий _id карточки.' }));
    } else {
      next(res.send({ data: card }));
    }
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      next(res.status(VALIDATION_ERROR).send({ message: 'Переданы некорректные данные для снятия лайка.' }));
    } else {
      next(res.status(REFERENCE_ERROR).send({ message: 'Произошла ошибка по умолчанию' }));
    }
  });
