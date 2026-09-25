// ============================================
//   QUESTIONS INDEX — يجمع كل الفئات
// ============================================

const geography = require("./geography");
const history = require("./history");
const science = require("./science");
const sports = require("./sports");
const techGames = require("./tech-games");

// نجمعو كل الأسئلة في مصفوفة وحدة
const ALL_QUESTIONS = [
  ...geography,
  ...history,
  ...science,
  ...sports,
  ...techGames,
];

// نجمعو كل الفئات
const CATEGORIES = {
  geography: { name: "🌍 جغرافيا", questions: geography },
  history:   { name: "🏛️ تاريخ", questions: history },
  science:   { name: "🔬 علوم", questions: science },
  sports:    { name: "⚽ رياضة", questions: sports },
  techGames: { name: "📱🎮 تقنية وألعاب", questions: techGames },
};

// نختارو أسئلة عشوائية
function getRandomQuestions(count = 10) {
  const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// نختارو سؤال عشوائي واحد
function getRandomQuestion() {
  return ALL_QUESTIONS[Math.floor(Math.random() * ALL_QUESTIONS.length)];
}

module.exports = {
  ALL_QUESTIONS,
  CATEGORIES,
  getRandomQuestions,
  getRandomQuestion,
  totalCount: ALL_QUESTIONS.length,
};
