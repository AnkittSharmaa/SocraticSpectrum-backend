const { Schema, model } = require('mongoose');

const QuestionSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  order: { type: Number, index: true }
});

module.exports = model('Question', QuestionSchema);
