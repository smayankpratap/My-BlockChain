
const Block = require('./block');
const cryptoHash = require('../util/crypto-hash');
const TransactionPool = require('../wallet/transaction-pool');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

class Blockchain {
    constructor(){
        this.chain = [Block.genesis()];
    }

    addBlock({data}) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });

        this.chain.push(newBlock);
    }

    
    static isValidChain(chain) {
        // two objects in javascript can not be strictly equal (i.e. '===') unless both of them
        // are derived from same Class
        // here we use stringify() method of JSON

        // first condition to ensure the validity of the chain
        // check if chain has correct genesis block
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false
        };
    
        for (let i=1; i<chain.length; i++) {
            const { timestamp, lastHash, hash, nonce, difficulty, data } = chain[i];

            // validate 'lastHash' of the last block
            const actualLastHash = chain[i-1].hash;
            if (lastHash !== actualLastHash) return false;
            
            // validate 'hash' of the current block
            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if (hash !== validatedHash) return false;
            
            // it prevents attacker to raise difficulty too high or too low
            const lastDifficulty = chain[i-1].difficulty;
            if (Math.abs(lastDifficulty - difficulty) > 1) return false;
        }
    
        return true;
    }

    // onSuccess() is a callback fn for the situation when a node performs mining of transactions it adds 
    // those transactions into the chain but other nodes might still have those already mined transactions
    // in their transaction-pool hence to delete those transactions we need this callback fn
    replaceChain(chain, validateTransactions, onSuccess) {
        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        // when 'validateTransactions' flag is set then only 'validTransactionData()' is called
        if(validateTransactions && !this.validTransactionData({ chain })){
            console.error('The incoming chain has invalid data');
            return;
        }

        if(onSuccess) onSuccess();

        console.log('replacing chain with', chain);
        this.chain = chain;
    }   

    validTransactionData({ chain }){
        for(let i=1; i<chain.length; i++){
            const block = chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount = 0;

            for(let transaction of block.data){
                if(transaction.input.address === REWARD_INPUT.address){
                    rewardTransactionCount++;

                    if(rewardTransactionCount > 1){
                        console.error('Miner rewards exceeds limit');
                        return false;
                    }

                    // transaction is a reward transaction bcz of the parent if condition
                    if(Object.values(transaction.outputMap)[0] !== MINING_REWARD){
                        console.error('Miner reward amount is invalid');
                        return false;
                    }
                }
                else{ // transaction is not a reward transaction
                    if(!Transaction.validTransaction(transaction)){
                        console.error('Invalid transaction');
                        return false;
                    }

                    // to make sure the incoming chain is based on the history of the existing chain
                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain, // existing chain
                        address: transaction.input.address
                    });

                    if(transaction.input.amount !== trueBalance){
                        console.error('Invalid input amount');
                        return false;
                    }

                    if(transactionSet.has(transaction)){
                        console.error('An identical transaction appears more than once in the block');
                        return false;
                    }
                    else{
                        transactionSet.add(transaction);
                    }
                }
            }
        }

        return true;
    }
}

module.exports = Blockchain;