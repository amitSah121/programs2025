function deny(res, code, message) {
  return res.status(400).json({ code, message });
}

module.exports = {
  deny,
};
