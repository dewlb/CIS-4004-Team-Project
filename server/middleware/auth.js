// middleware/auth.js
module.exports = (req, res, next) => {
  req.user = {
    _id: "123",
    role: "student" // or "professor"
  };

  next();
};