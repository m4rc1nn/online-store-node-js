const jwt = require('jsonwebtoken');

const config = {
    secret: 'rE9AnBmhWUONdo9EOc9ZiZpegvH1zjc4DIE8r14f'
}

module.exports.createToken = (id) => {
    return jwt.sign({ id: id }, config.secret, {
        expiresIn: 900
    });
}

module.exports.decodeToken = async (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.secret, (err, decode) => {
            if(err) resolve(null);
            resolve(decode.id);
        })
    })
}