const express = require('express');
const mongoose = require('mongoose');
const { NOT_FOUND_ERROR } = require('./errors/errorsCodes');

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded());

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '64774017b4fbad9f4800b49f',
  };

  next();
});

app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'));

app.use('*', (req, res, next) => {
  next(res.status(NOT_FOUND_ERROR).send({ message: 'Передан некорректный путь' }));
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
