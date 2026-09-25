const { Schema, model } = require('mongoose');

const PhilosopherSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  tradition: { type: String, default: '' },
  featuredWorks: [{
    title: { type: String, required: true },
    note: { type: String, default: '' }
  }],
  weights: {
    type: [Number],
    required: true,
    validate: arr => arr.length === 30 // one profile value for each assessment question
  }
});

module.exports = model('Philosopher', PhilosopherSchema);
