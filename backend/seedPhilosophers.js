require('dotenv').config();
const mongoose = require('mongoose');
const Philosopher = require('./models/Philosopher');

// The final ten dimensions extend the original 20-item response profiles using
// their closest existing themes; these are heuristic affinity profiles, not
// psychometric diagnoses.
const extensionDimensions = [15, 1, 18, 15, 19, 4, 8, 18, 3, 15];
const profiles = [
  { name: 'Albert Camus', description: 'Absurdist – believed life has no inherent meaning but we must rebel against that meaninglessness.', weights: [4,3,2,5,4,4,4,4,4,4,5,3,4,4,3,3,3,3,3,5] },
  { name: 'Friedrich Nietzsche', description: 'Existentialist – emphasized individual will, power, and the creation of personal values.', weights: [5,4,5,5,4,5,5,3,5,4,5,4,4,5,3,4,4,4,4,3] },
  { name: 'Søren Kierkegaard', description: 'Christian existentialist – emphasized faith, personal responsibility, and subjective truth.', weights: [3,3,3,5,3,3,5,4,2,5,4,5,4,3,4,4,3,2,3,4] },
  { name: 'Jean-Paul Sartre', description: 'Existentialist – championed radical freedom and responsibility for meaning.', weights: [5,4,5,5,3,3,3,5,3,5,4,5,4,5,4,3,3,4,3,5] },
  { name: 'Immanuel Kant', description: 'Deontologist – focused on duty, universal laws, and reason.', weights: [3,3,4,3,4,3,1,1,4,3,3,5,2,1,3,4,4,1,3,4] },
  { name: 'Plato', description: 'Idealist – believed in a world of perfect forms and the role of reason.', weights: [3,4,3,3,4,3,4,4,2,3,3,4,3,4,2,2,3,4,2,4] },
  { name: 'Karl Marx', description: 'Believed history is driven by class struggle and aimed for a classless society.', weights: [3,4,2,2,4,2,4,3,2,3,4,2,2,3,5,2,2,4,4,4] },
  { name: 'Gautama Buddha', description: 'Eastern philosopher – taught detachment, compassion, and transcendence of suffering.', weights: [2,3,3,4,2,3,2,4,3,3,2,3,4,5,3,2,3,2,4,3] },
  { name: 'Confucius', description: 'Stressed harmony, virtue, and order in society based on relationships.', weights: [3,3,4,3,3,4,4,3,3,3,3,3,3,5,2,5,3,5,3,3] },
  { name: 'Adi Shankaracharya', description: 'Indian Vedanta philosopher – emphasized non-duality and the illusory nature of the world.', weights: [3,2,3,4,4,5,4,5,2,4,3,4,4,2,3,3,4,4,3,4] },
  { name: 'Guru Nanak', description: 'Founder of Sikhism – emphasized devotion, equality, and remembrance of God.', weights: [4,3,3,2,4,3,5,4,4,5,3,3,5,4,4,3,2,2,5,3] },
  { name: 'Fyodor Dostoevsky', description: 'Explored themes of suffering, faith, and morality in human psychology.', weights: [4,4,4,5,4,4,3,4,4,5,3,4,4,4,4,4,3,4,4,5] },
  { name: 'Franz Kafka', description: 'Explored alienation, bureaucracy, and the absurdity of life.', weights: [4,4,3,4,4,3,4,3,2,4,4,2,3,3,4,4,3,2,4,5] },
  { name: 'Georg Wilhelm Friedrich Hegel', description: 'Dialectical idealist – focused on the evolution of consciousness and history through conflict.', weights: [5,3,5,3,4,3,4,4,3,4,3,3,2,3,5,3,5,4,3,3] },
  { name: 'Islamic Philosophy', description: 'A diverse intellectual tradition bringing reason, revelation, justice, and questions of existence into conversation.', weights: [4,1,3,2,2,4,4,2,4,5,4,3,3,3,2,2,4,4,4,2] },
  { name: 'Ibn Khaldun', description: 'A historian and social thinker who studied how solidarity, power, and economic life shape civilizations.', weights: [4,3,3,3,4,3,4,3,3,4,3,3,3,4,2,4,3,3,4,3] },
  { name: 'Mary Wollstonecraft', description: 'An Enlightenment writer who argued that equal education is essential to women’s freedom and moral development.', weights: [5,5,3,3,5,3,2,2,4,5,4,5,5,3,3,5,2,2,4,4] },
  { name: 'Simone de Beauvoir', description: 'An existentialist philosopher who examined freedom, gender, and the social conditions that shape a life.', weights: [5,4,4,3,4,4,3,3,4,4,4,5,5,3,2,5,3,2,4,4] },
  { name: 'Ayn Rand', description: 'The founder of Objectivism, known for defending reason, individual rights, and rational self-interest.', weights: [5,2,2,2,5,2,2,1,2,4,5,3,5,2,2,1,3,5,1,5] },
  { name: 'Marcus Aurelius', description: 'A Roman emperor and Stoic whose private notes reflect on character, duty, and what lies within our control.', weights: [3,4,4,3,5,3,4,3,3,5,3,4,3,3,3,4,4,2,4,3] },
  { name: 'Epictetus', description: 'A Stoic teacher who emphasized freedom through sound judgment and attention to what we can control.', weights: [3,4,4,3,5,3,4,3,2,5,2,4,3,3,2,3,4,1,3,3] },
  { name: 'Rumi', description: 'A Persian poet and Sufi mystic whose work explores love, spiritual longing, and transformation.', weights: [4,3,4,5,2,5,4,5,5,4,4,4,4,5,3,3,4,2,4,5] },
  { name: 'Lao Tzu', description: 'The tradition-linked author of the Dao De Jing, associated with simplicity and acting in accord with the Dao.', weights: [2,3,4,4,3,4,4,4,4,3,2,3,3,4,3,2,3,2,4,2] },
  { name: 'Zhuangzi', description: 'A Daoist writer whose stories question rigid certainty and invite a wider view of change and nature.', weights: [3,3,4,3,3,4,3,3,5,3,2,3,3,4,2,2,3,2,4,2] },
  { name: 'Hannah Arendt', description: 'A political thinker of public life, shared action, freedom, and political responsibility.', weights: [4,4,3,3,4,3,3,2,4,5,3,4,4,3,3,5,3,2,5,3] },
];

const readingStarters = {
  'Albert Camus': [{ title: 'The Myth of Sisyphus', note: 'A direct introduction to Camus on absurdity and revolt.' }],
  'Friedrich Nietzsche': [{ title: 'On the Genealogy of Morality', note: 'A focused entry into his critique of moral values.' }],
  'Søren Kierkegaard': [{ title: 'Fear and Trembling', note: 'A challenging work on faith and individual responsibility.' }],
  'Jean-Paul Sartre': [{ title: 'Existentialism Is a Humanism', note: 'A short introduction to freedom, choice, and responsibility.' }],
  'Immanuel Kant': [{ title: 'Groundwork of the Metaphysics of Morals', note: 'Kant’s concise statement of duty and moral principles.' }],
  Plato: [{ title: 'Apology', note: 'A short dialogue and an accessible first encounter with Socrates.' }, { title: 'Republic', note: 'A longer inquiry into justice, education, and political life.' }],
  'Karl Marx': [{ title: 'The Communist Manifesto', note: 'A brief political text; read alongside a historical introduction.' }],
  'Gautama Buddha': [{ title: 'The Dhammapada', note: 'A collection of verses; translations differ, so an edition with notes helps.' }],
  Confucius: [{ title: 'The Analects', note: 'Conversations and sayings on virtue, learning, and relationships.' }],
  'Adi Shankaracharya': [{ title: 'Upadeśasāhasrī (A Thousand Teachings)', note: 'A primary text introducing Shankara’s Advaita Vedanta.' }],
  'Guru Nanak': [{ title: 'Selections from the Guru Granth Sahib', note: 'Use a Sikh-authored translation or commentary for context.' }],
  'Fyodor Dostoevsky': [{ title: 'The Brothers Karamazov', note: 'A novel exploring freedom, faith, responsibility, and suffering.' }],
  'Franz Kafka': [{ title: 'The Trial', note: 'A novel about guilt, authority, and opaque institutions.' }],
  'Georg Wilhelm Friedrich Hegel': [{ title: 'Phenomenology of Spirit', note: 'A demanding work; a guide or companion is useful.' }],
  'Islamic Philosophy': [{ title: 'A History of Islamic Philosophy — Majid Fakhry', note: 'A broad secondary introduction to a diverse tradition.' }],
  'Ibn Khaldun': [{ title: 'The Muqaddimah', note: 'Begin with its treatment of society, group solidarity, and political power.' }],
  'Mary Wollstonecraft': [{ title: 'A Vindication of the Rights of Woman', note: 'Her argument for women’s education and equal moral agency.' }],
  'Simone de Beauvoir': [{ title: 'The Ethics of Ambiguity', note: 'A philosophical entry point before the longer The Second Sex.' }],
  'Ayn Rand': [{ title: 'The Virtue of Selfishness', note: 'Her essays present Objectivist ethics; read critically alongside responses.' }],
  'Marcus Aurelius': [{ title: 'Meditations', note: 'Personal Stoic reflections on judgment, character, and public duty.' }],
  Epictetus: [{ title: 'Enchiridion (Handbook)', note: 'A brief practical summary; follow it with selected Discourses.' }],
  Rumi: [{ title: 'The Masnavi', note: 'Begin with selected stories in a translation that explains their Sufi context.' }],
  'Lao Tzu': [{ title: 'Dao De Jing (Tao Te Ching)', note: 'Compare translations; its short poetic chapters invite multiple readings.' }],
  Zhuangzi: [{ title: 'Zhuangzi — Inner Chapters', note: 'A good first section for its stories, humor, and shifting perspectives.' }],
  'Hannah Arendt': [{ title: 'The Human Condition', note: 'Her account of labor, work, and political action in public life.' }],
};

const traditions = {
  'Albert Camus': 'Absurdism', 'Friedrich Nietzsche': 'Value creation', 'Søren Kierkegaard': 'Existential Christianity',
  'Jean-Paul Sartre': 'Existentialism', 'Immanuel Kant': 'Deontological ethics', Plato: 'Idealism',
  'Karl Marx': 'Historical materialism', 'Gautama Buddha': 'Buddhist philosophy', Confucius: 'Confucian ethics',
  'Adi Shankaracharya': 'Advaita Vedanta', 'Guru Nanak': 'Sikh philosophy', 'Fyodor Dostoevsky': 'Moral psychology',
  'Franz Kafka': 'Modernist literature', 'Georg Wilhelm Friedrich Hegel': 'German idealism', 'Islamic Philosophy': 'Islamic philosophy',
  'Ibn Khaldun': 'Philosophy of history', 'Mary Wollstonecraft': 'Enlightenment feminism', 'Simone de Beauvoir': 'Existentialist feminism',
  'Ayn Rand': 'Objectivism', 'Marcus Aurelius': 'Stoicism', Epictetus: 'Stoicism', Rumi: 'Sufi poetry',
  'Lao Tzu': 'Daoism', Zhuangzi: 'Daoism', 'Hannah Arendt': 'Political philosophy',
};

async function seed() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  await mongoose.connect(process.env.MONGO_URI);
  const documents = profiles.map((profile) => ({
    ...profile,
    tradition: traditions[profile.name],
    featuredWorks: readingStarters[profile.name] || [],
    weights: [...profile.weights, ...extensionDimensions.map((dimension) => profile.weights[dimension])],
  }));
  await Philosopher.bulkWrite(documents.map((profile) => ({
    updateOne: { filter: { name: profile.name }, update: { $set: profile }, upsert: true },
  })), { ordered: false });
  console.log(`Upserted ${documents.length} thinker profiles with 30 scoring dimensions; other database profiles were preserved.`);
}

seed()
  .catch((error) => {
    console.error(`Could not seed philosopher profiles: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
