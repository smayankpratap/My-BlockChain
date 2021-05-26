const redis = require('redis');
const TransactionPool = require('../wallet/transaction-pool');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
};

class PubSub{
    constructor({ blockchain, transactionPool }){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        // subscribe the subscriber to the channels
        // this.subscriber.subscribe(CHANNELS.TEST);
        this.subscribeToChannels();

        // this is 'message' event listener, which fires a callback with arguments 'channel' and 'message'
        this.subscriber.on('message', (channel, message) => this.handleMessage(channel, message));
    }

    // it handles message broadcasted on a specific channel
    handleMessage(channel, message){
        console.log(`Message received. Channel: ${channel}. Message: ${message}`);

        const parsedMessage = JSON.parse(message);

        /*if(channel === CHANNELS.BLOCKCHAIN){
            this.blockchain.replaceChain(parsedMessage);
        }*/

        switch(channel){
            case CHANNELS.BLOCKCHAIN:
                // just before replacing the chain with the new one, delete all those transactions from 
                // the transaction-pool which already exists in the new chain
                this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransactions({ chain: parsedMessage });
                });
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                return;
        }
    }

    subscribeToChannels(){
        // Object.values(object_name) returns an array of the values of the object 'object_name'

        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        });
    }

    publishMessage({channel, message}){
        // this.publisher.publish(channel, message);

        // this piece of code prevents a publisher node from publishing to itself
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
        });
    }

    broadcastChain(){
        this.publishMessage({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction){
        this.publishMessage({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }
};

module.exports = PubSub;


/*
const testPubSub = new PubSub();

// publisher publishes 'foo' message on 'CHANNELS.TEST' channel
// add delay to make sure all subscription and registration occure before any publish 
setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, 'foo'), 1000);
*/
