const bcrypt = require('bcryptjs')

async function hashPw(pwd) {
    return await bcrypt.hash(pwd,8)
}


async function comparePassword(pwd, hash) {
    return await bcrypt.compare(pwd, hash)
}


module.exports = {hashPw, comparePassword}