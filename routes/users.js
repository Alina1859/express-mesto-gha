const router = require('express').Router();
const cookieParser = require('cookie-parser');
const { celebrate, Joi } = require('celebrate');

const {
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

router.use(cookieParser());

router.get('/', getUsers);

router.get('/me', getCurrentUser);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    // eslint-disable-next-line no-useless-escape
    avatar: Joi.string().regex(/^(http|https):\/\/[-a-zA-Z0-9._~\-:?#[\]@!$&'()*+,\/;=]{2,256}/),
  }),
}), updateAvatar);

module.exports = router;
