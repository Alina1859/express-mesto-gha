const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => next(err));
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      } else {
        const cardOwner = card.owner.toString();
        if (req.user._id !== cardOwner) {
          throw new ForbiddenError('У вас нет прав на удаление данной карточки');
        } else {
          return Card.findByIdAndRemove(req.params.cardId);
        }
      }
    })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => next(err));
};

module.exports.likeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req.user._id } },
  { new: true },
  { runValidators: true },
)
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Переданы некорректные данные для постановки лайка');
    } else {
      next(res.send({ data: card }));
    }
  })
  .catch((err) => next(err));

module.exports.dislikeCard = (req, res, next) => Card.findByIdAndUpdate(
  req.params.cardId,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Передан несуществующий _id карточки');
    } else {
      next(res.send({ data: card }));
    }
  })
  .catch((err) => next(err));
