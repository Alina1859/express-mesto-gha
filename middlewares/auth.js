const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;
  try {
    if (!token) {
      throw new UnauthorizedError('jwt must be provided');
    }
    // попытаемся верифицировать токен
    payload = jwt.verify(token, 'some-secret-key');
  } catch (e) {
    // const err = new Error('Необходима авторизация');
    // err.statusCode = 401;
    next(new UnauthorizedError('Необходима авторизация'));

  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше

  // Добавлено явное возвращаемое значение для линта
  // return null;
};
