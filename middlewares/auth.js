const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;
  try {
    if (!token) {
      const err = new Error('Необходима авторизация');
      err.statusCode = 401;
      next(err);
    }
    // попытаемся верифицировать токен
    payload = jwt.verify(token, 'some-secret-key');
  } catch (e) {
    next(e);
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
