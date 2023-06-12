const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const mainRouter = require('./routes');
const {
  VALIDATION_ERROR,
  UNAUTHORIZED_ERROR,
  CONFLICT_ERROR,
  RANGE_ERROR,
  REFERENCE_ERROR,
  FORBIDDEN_ERROR,
} = require('./errors/errorsCodes');
const NotFoundError = require('./errors/not-found-err');
const ValidationError = require('./errors/validation-err');
const UnauthorizedError = require('./errors/unauthorized-err');
const ConflictError = require('./errors/conflict-err');
const RangeError = require('./errors/range-err');
const ForbiddenError = require('./errors/forbidden-err');

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded());

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(cookieParser());

app.use(mainRouter);

app.use(errors()); // обработчик ошибок celebrate

app.use((err, req, res, next) => {
  const { statusCode = `${REFERENCE_ERROR}`, message } = err;

  if (err instanceof mongoose.Error.CastError) {
    res.status(`${VALIDATION_ERROR}`).send({ message: 'Переданы некорректные данные _id' });
    throw new ValidationError('Переданы некорректные данные _id');
  } else if (err instanceof mongoose.Error.ValidationError) {
    res.send({ message: 'Переданы некорректные данные' });
    throw new ValidationError('Переданы некорректные данные');
  } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
    res.send({ message: 'Пользователь с указанным _id не найден' });
    throw new NotFoundError('Пользователь с указанным _id не найден');
  } else if (err === `${UNAUTHORIZED_ERROR}`) {
    res.send({ message: 'Необходима авторизация' });
    throw new UnauthorizedError('Необходима авторизация');
  } else if (err === `${CONFLICT_ERROR}`) {
    res.status(`${CONFLICT_ERROR}`).send({ message: 'Такой пользователь уже существует' });
    throw new ConflictError('Такой пользователь уже существует');
  } else if (err === `${FORBIDDEN_ERROR}`) {
    res.status(`${FORBIDDEN_ERROR}`).send({ message: 'Переданы некорректные данные _id' });
    throw new ForbiddenError('Переданы некорректные данные _id');
  } else if (err.code === `${RANGE_ERROR}`) {
    res.send({ message: 'Такой пользователь уже существует' });
    throw new RangeError('Такой пользователь уже существует');
  } else {
    res.status(statusCode).send({
      message: statusCode === `${REFERENCE_ERROR}`
        ? 'На сервере произошла ошибка'
        : message,
    });
  }

  next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
