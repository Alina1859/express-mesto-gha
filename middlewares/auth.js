const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;
  try {
    if (!token) {
      // const err = new Error('Необходима авторизация');
      // err.statusCode = 401;
      // next(err);
      next(new UnauthorizedError('Необходима авторизация'));

    }
    // попытаемся верифицировать токен
    payload = jwt.verify(token, 'some-secret-key');
  } catch (e) {
    // const err = new Error('Необходима авторизация');
    // err.statusCode = 401;
    next(new UnauthorizedError('Необходима авторизация'));

    // next(e);
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
