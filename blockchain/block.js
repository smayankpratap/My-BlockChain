
const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require('../config');
const cryptoHash = require('../util/crypto-hash');

class Block{
    // put curly braces so that in case of having large number of arguments we 
    // would not have to worry about the order of the arguments
    // i.e. argument is an object
    constructor({timestamp, lastHash, hash, data, nonce, difficulty}){
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    // static methods can not be accessed by an instance of class, it is accessed by class name
    // i.e. Class_Name.Static_Method
    static genesis(){
        return new this(GENESIS_DATA);
    }

    static mineBlock({lastBlock, data}){
        // const timestamp = Date.now();
        const lastHash = lastBlock.hash;
        // const {difficulty} = lastBlock;
        // const difficulty = lastBlock.difficulty;
        let {difficulty} = lastBlock;
        let hash, timestamp;
        let nonce = 0;

        do{
            nonce++;
            timestamp = Date.now();
            // difficulty changes according to the rate of mining
            difficulty = Block.adjustDifficulty({originalBlock: lastBlock, timestamp: timestamp});
            hash = cryptoHash(timestamp, lastHash, data, difficulty, nonce);

        }while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({
            timestamp,
            lastHash,
            data,
            difficulty,
            nonce,
            hash
            // hash: cryptoHash(timestamp, lastHash, data, difficulty, nonce)
        });
    }

    static adjustDifficulty({originalBlock, timestamp}){ // timestamp -- of new mined block
        const {difficulty} = originalBlock; // destructuring of originalBlock
        if((timestamp - originalBlock.timestamp) > MINE_RATE) return difficulty-1;
        return difficulty+1;
    }
}
/*
const block1 = new Block({
    timestamp: '01/01/01',
    lastHash: 'foo-lastHash',
    hash: 'foo-hash',
    data: 'foo-data'
});
console.log('block1', block1);
*/

module.exports = Block;
