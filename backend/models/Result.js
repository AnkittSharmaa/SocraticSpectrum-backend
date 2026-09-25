const { Schema, model } = require('mongoose');

const ResultSchema = new Schema({
  answers: {
    type: [Number],
    required: true,
    validate: arr => arr.length > 0 && arr.every(value => Number.isInteger(value) && value >= 1 && value <= 5)
  },
  scores: [{
    name: { type: String, required: true },
    percent: { type: Number, required: true }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = model('Result', ResultSchema);
