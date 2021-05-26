// const { validTransaction } = require("./transaction");
const Transaction = require("./transaction");

class TransactionPool{
    constructor(){
        this.transactionMap = {};
    }

    clear(){
        this.transactionMap = {};
    }

    setTransaction(transaction){
        this.transactionMap[transaction.id] = transaction;
    }

    // when a new peer is activated then it synchronizes the transactionMap of new node with the
    // transactionMap of root node (i.e. localhost:3000)
    setMap(transactionMap){
        this.transactionMap = transactionMap;
    }

    existingTransaction({ inputAddress }){
        // transactions --> array of transactions
        const transactions = Object.values(this.transactionMap);

        // returns first matching transaction
        return transactions.find(transaction => (transaction.input.address === inputAddress));
    }

    validTransactions(){
        /*
        const validTransactions = [];
        const allTransactions = Object.values(this.transactionMap);

        for(let i=0; i<allTransactions.length; i++){
            if(Transaction.validTransaction(allTransactions[i])){
                validTransactions.push(allTransactions[i]);
            }
        }
        return validTransactions;
        */

        // returns array of all valid transactions after filtering
        return Object.values(this.transactionMap).filter(transaction => Transaction.validTransaction(transaction));
    }

    // clears all transactions from the transactionPool which already exists in the blockchain
    clearBlockchainTransactions({ chain }){
        for(let i=1; i<chain.length; i++){
            const block = chain[i];

            for(let transaction of block.data){
                if(this.transactionMap[transaction.id]){
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }
}

module.exports = TransactionPool;