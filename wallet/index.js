const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../config');
const { ec } = require('../util');
const cryptoHash = require('../util/crypto-hash');
const Transaction = require('./transaction');

class Wallet{
    constructor(){
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair(); // generates private and public keyPair

        // this.publicKey = keyPair.getPublic() -- generates (x, y) a decimal co-ordinate
        this.publicKey = this.keyPair.getPublic().encode('hex'); // generates a single hexadecimal value
    }

    // returns signature
    sign(data){
        // sign() method works more optimally if data is fed in hash format
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({ recipient, amount, chain }){
        // as soon as chain is passed we make sure balance is based on blockchain history
        if(chain){
            this.balance = Wallet.calculateBalance({
                chain,
                address: this.publicKey
            });
        }

        if(amount > this.balance){
            throw new Error('Amount exceeds balance');
        }

        return new Transaction({ senderWallet: this, recipient, amount });
    }

    static calculateBalance({ chain, address }){
        let outputsTotal = 0;
        let hasConductedTransaction = false;

        // Skip the genesis block
        // Start from the end of the Blockchain, since its more likely for wallet
        // to have done a recent transaction at the end of the chain
        for(let i=chain.length-1; i>0; i--){
            const block = chain[i];

            for(let transaction of block.data){
                if(transaction.input.address === address){
                    hasConductedTransaction = true;
                }

                const addressOutput = transaction.outputMap[address];

                if(addressOutput){
                    outputsTotal += addressOutput;
                }
            }

            if(hasConductedTransaction){
                break;
            }
        }

        return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
    }
};

module.exports = Wallet;