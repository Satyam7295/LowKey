// lowkeyAliasGenerator.js

const ALIAS_POOL = [
  "anon",
  "npc",
  "ghost",
  "void",
  "user",
  "quiet",
  "lowkey",
];

// helper: random number with leading zeros
function getRandomDigits(length = 3) {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
}

// main generator
function generateLowkeyAlias() {
  const prefix =
    ALIAS_POOL[Math.floor(Math.random() * ALIAS_POOL.length)];
  const digits = getRandomDigits(3);

  return `${prefix}_${digits}`;
}

module.exports = {
  generateLowkeyAlias,
};
