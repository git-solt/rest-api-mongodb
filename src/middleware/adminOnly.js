const adminOnly = (req, res, next) => {
  req.needToBeAdmin = true
  next()
}

module.exports = adminOnly