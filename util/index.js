const EC = require('elliptic').ec;
const cryptoHash = require('./crypto-hash');

const ec = new EC('secp256k1'); 
// 'secp256k1' -- elliptic cryptographic algo (used by BitCoin too)

const verifySignature = ({publicKey, data, signature}) => {
    // to verify a signature we have to generate a temporary key from publicKey
    // we have tell ec that publicKey is in 'hex' format
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    return keyFromPublic.verify(cryptoHash(data), signature);
};

module.exports = { ec, verifySignature };