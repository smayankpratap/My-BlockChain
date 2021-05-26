const crypto = require('crypto');
// const hexToBinary = require('hex-to-binary');

const cryptoHash = (...inputs) => {
    const hash = crypto.createHash('sha256');

    // stringifying makes sure if any object's property is changed then those changes are visible
    hash.update(inputs.map(input => JSON.stringify(input)).sort().join());
    return hash.digest('hex');
    // return hexToBinary(hash.digest('hex'));
}

module.exports = cryptoHash;