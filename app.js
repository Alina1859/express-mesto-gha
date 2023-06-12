const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const mainRouter = require('./routes');
const { REFERENCE_ERROR } = require('./errors/errorsCodes');

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded());

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(cookieParser());

app.use(mainRouter);

app.use(errors()); // обработчик ошибок celebrate

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || REFERENCE_ERROR;

  const message = statusCode === REFERENCE_ERROR
    ? 'На сервере произошла ошибка'
    : err.message;
  res.status(statusCode).send({ message });

  next();
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
