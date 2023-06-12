const { RANGE_ERROR } = require('./errorsCodes');

class RangeError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = RANGE_ERROR;
  }
}

module.exports = RangeError;
