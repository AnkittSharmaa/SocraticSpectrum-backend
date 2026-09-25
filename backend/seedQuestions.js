require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const questions = [
  'People are free to shape who they become.',
  'Morality should be guided by universal principles.',
  'Suffering can help us grow into wiser people.',
  'Life has a meaning waiting to be discovered.',
  'Reason should lead when choices are difficult.',
  'Emotions can be trusted as a guide to what matters.',
  'Our destiny is predetermined.',
  'Belief in a higher power is necessary for a meaningful life.',
  'Art can reveal truths that reason cannot.',
  'Honesty is the right choice even when it causes harm.',
  'Personal happiness is a worthy purpose for a life.',
  'A person can be deeply moral without religion.',
  'Existence is more important than essence.',
  'People are inherently good.',
  'Beauty is objective.',
  'Individual freedom should outweigh the collective good.',
  'Death is the end of our existence.',
  'Material possessions bring lasting happiness.',
  'Peace is more valuable than justice.',
  'Life should be driven more by passion than reason.',
  "A society's institutions shape people's opportunities.",
  'Education should be equally available to women and men.',
  'A society should be judged by how it treats its most vulnerable people.',
  'People should be free to pursue goals they have rationally chosen.',
  "A person's character grows through practicing self-discipline.",
  'We should focus on what is within our control and accept what is not.',
  'Poetry and art can express truths ordinary language misses.',
  'A good life depends on living in harmony with the natural world.',
  'History reveals patterns that help explain how societies rise and fall.',
  'Freedom is most meaningful when people can act together in public life.',
];

async function seed() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  await mongoose.connect(process.env.MONGO_URI);
  // Upsert the built-in items without deleting any additional questions.
  await Question.bulkWrite(questions.map((text, index) => ({
    updateOne: { filter: { text }, update: { $set: { order: index + 1 }, $setOnInsert: { text } }, upsert: true },
  })));
  const additional = await Question.find({ order: { $exists: false } }).sort({ _id: 1 }).select('_id');
  for (let index = 0; index < additional.length; index += 1) {
    await Question.updateOne({ _id: additional[index]._id }, { $set: { order: questions.length + index + 1 } });
  }
  console.log(`Seeded ${questions.length} ordered questions; ${additional.length} existing extra questions were kept afterward.`);
}

seed()
  .catch((error) => {
    console.error(`Could not seed questions: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
