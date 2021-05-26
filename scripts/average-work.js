// going two steps back automatically selects default file index.js from blockchain directory
const Blockchain = require('../blockchain'); 

const blockchain = new Blockchain();

blockchain.addBlock({data: 'Initial-data'});

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

// create chain of 10000 blocks
for(let i=0; i<9999; i++){
    prevTimestamp = blockchain.chain[blockchain.chain.length-1].timestamp;

    blockchain.addBlock({data: `block ${i}`});

    nextBlock = blockchain.chain[blockchain.chain.length-1];
    nextTimestamp = nextBlock.timestamp;
    timeDiff = nextTimestamp - prevTimestamp;
    times.push(timeDiff); 

    // reduce((accumulator, currentValue) => accumulator + currentValue) -- returns accumulator
    average = times.reduce((total, num) => total+num) / times.length;

    console.log(`Time to mine block ${timeDiff}ms. Difficulty ${nextBlock.difficulty} Average time ${average}`);
}