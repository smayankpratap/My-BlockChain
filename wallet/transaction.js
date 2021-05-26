const uuid = require('uuid/v1');
const { verifySignature } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

class Transaction{
    constructor({senderWallet, recipient, amount, outputMap, input }){
        this.id = uuid();

        // if outputMap is given then intialized it directly otherwise go to the later part (in case of reward transaction)
        this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });
        this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({senderWallet, recipient, amount}){
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    }

    createInput({senderWallet, outputMap}){
        return{
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        }
    }

    update({ senderWallet, recipient, amount }){
        if(amount > this.outputMap[senderWallet.publicKey]){
            throw new Error('Amount exceeds balance');
        }

        if(!this.outputMap[recipient]){ // if the recipient does not exist in the map
            this.outputMap[recipient] = amount;
        }
        else{ // if the recipient already exists in the map
            this.outputMap[recipient] = this.outputMap[recipient] + amount;
        }
        
        // this.outputMap[recipient] = amount;

        this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    static validTransaction(transaction){
        // const { input, outputMap } = transaction;
        // const { address, signature, amount } = input;
        const { input: { address, signature, amount }, outputMap } = transaction;

        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total + outputAmount);

        // amount --> total money available in the sender wallet currently
        // outputTotal --> (amount sent by sender) + (amount remaining to the sender)
        if(amount !== outputTotal){
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        if(!verifySignature({ publicKey: address, data: outputMap, signature })){
            console.error(`Invalid transaction from ${address}`);
            return false;
        }

        return true;
    }

    static rewardTransaction({ minerWallet }){
        return new this({
            input:REWARD_INPUT,
            outputMap: { [minerWallet.publicKey]: MINING_REWARD }
        });
    }
};

module.exports = Transaction;