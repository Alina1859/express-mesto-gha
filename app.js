const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const mainRouter = require('./routes');

const { PORT = 3000 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded());

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(cookieParser());

app.use(mainRouter);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
