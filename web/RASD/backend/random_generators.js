function generateId(text = "ide") {
  return `${text}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function generateIdCompact(text = "ide") {
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `${text}_${time}_${rand}`;
}

module.exports = {
  generateId,
  generateIdCompact,
};
