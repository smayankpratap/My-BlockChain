const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            recipient: 'foo-recipient',
            amount: 50
        });
    });

    describe('setTransaction()', () => {
        it('adds a transaction', () => {
            transactionPool.setTransaction(transaction);

            // toBe() checks whether two objects are equal including their properties
            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });

    describe('existingTransaction', () => {
        it('returns an existing transaction given an input address', () => {
            transactionPool.setTransaction(transaction);

            expect(
                transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey })
            ).toBe(transaction);
        })
    });

    describe('validTransactions()', () => {
        let validTransactions; // a list to store all valid transactions
        let errorMock;

        beforeEach(() => {
            validTransactions = [];
            errorMock = jest.fn();
            global.console.error = errorMock;

            for(let i=0; i<10; i++){
                // create a new transaction
                transaction = new Transaction({
                    senderWallet,
                    recipient: 'foo-recipient',
                    amount: 40
                });

                // now mess with the transaction
                if(i%3 === 0){
                    // tampered the transaction input amount
                    transaction.input.amount = 999999;
                }
                else if(i%3 === 1){
                    // tampered the transaction input signature
                    transaction.input.signature = (new Wallet()).sign('data');
                }
                else{
                    // haven't messed up the transaction
                    validTransactions.push(transaction);
                }

                // transactionPool contains both valid and invalid transactions 
                transactionPool.setTransaction(transaction);
            }
        });

        it('returns valid transactions', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });

        it('logs error for invalid transactions', () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        })
    });

    describe('clear()', () => {
        it('clears all transactions', () => {
            transactionPool.clear();

            expect(transactionPool.transactionMap).toEqual({});
        });
    });

    describe('clearBlockchainTransactions()', () => {
        it('clears the pool of any existing blockchain transactions', () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for(let i=0; i<6; i++){
                const transaction = (new Wallet).createTransaction({
                    recipient: 'foo',
                    amount: 20
                });

                transactionPool.setTransaction(transaction);

                if(i%2 === 0){
                    blockchain.addBlock({ data: [transaction] });
                }
                else{
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }

            transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    });
});