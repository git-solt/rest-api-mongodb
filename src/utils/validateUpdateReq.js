const validateUpdateRequest = (req, res) => {
  const updates = Object.keys(req.body)
  const validUpdates = ['userName', 'password', 'email']
  const isValidUpdates = updates.every((cur) => validUpdates.includes(cur))

  if (!isValidUpdates) {
    return res.status(500).send('Can only update userName, password and email property')
  }

  return updates
}

module.exports = validateUpdateRequest