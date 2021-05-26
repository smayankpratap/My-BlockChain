const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const Blockchain = require('./blockchain'); // imports index.js
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

// const app = new express();
const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

// setTimeout(() => pubsub.broadcastChain(), 1000);

// use 'body-parser' middleware to parse json body in http post request
app.use(bodyParser.json());

// middleware to serve static files (e.g. to serve 'index.js' static file through 'index.html')
app.use(express.static(path.join(__dirname, 'client/dist')));

// '/api/blocks' is an end point for http get request where response would be shown
app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

// '/api/mine' is an end point through which we submit a http post request
app.post('/api/mine', (req, res) => {
    // we post a request with the data in json format, body-parser pareses it back in it's original form 
    const {data} = req.body;
    blockchain.addBlock({ data });
    
    pubsub.broadcastChain();
    
    res.redirect('/api/blocks');
});


app.post('/api/transact', (req, res) => {
    // we post a request with the data(recipient and amount) in json format, body-parser pareses it back in it's original form 
    const { recipient, amount } = req.body;

    // it checks whether a transaction having address 'inputAddress' exists in the 'transactionPool' or not
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

    try{
        if(transaction){
            // if transaction exists then only update the existing transaction
            transaction.update({ senderWallet: wallet, recipient, amount });
        }
        else{
            // else create a new transaction
            transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });
        }
    } catch(error){
        // return keyword makes sure that rest of the code doesn't execute after catching an error
        // response status 400 implies for bad request
        return res.status(400).json({ type:'error', message: error.message });
    }
    transactionPool.setTransaction(transaction);

    // console.log('transactionPool', transactionPool);

    pubsub.broadcastTransaction(transaction);

    res.json({ type: 'success', transaction });
});


app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();

    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    const address = wallet.publicKey;

    res.json({
        address,
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address })
    })
});

// '*' means if we hit any end-point except the above ones below response is gonna show up
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html')); // serve bundlled files
})

/*
const syncChains = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        // if a http get request is successful then its statusCode would be 200
        if(!error && response.statusCode===200){
            const rootChain = JSON.parse(body);
            
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });
};*/

// It allows new nodes to synchronize with longest root node and initialize itself with that longest chain
// and now no longer they start with genesis block only
const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        // if a http get request is successful then its statusCode would be 200
        if(!error && response.statusCode===200){
            const rootChain = JSON.parse(body);

            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`}, (error, response, body) => {
        // if a http get request is successful then its statusCode would be 200
        if(!error && response.statusCode===200){
            const rootTransactionPoolMap = JSON.parse(body);

            console.log('replace transaction pool map on a sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
};



const walletFoo = new Wallet();
const walletBar = new Wallet();

const generateWalletTransaction = ({ wallet, recipient, amount }) => {
    const transaction = wallet.createTransaction({ recipient, amount, chain: blockchain.chain });

    transactionPool.setTransaction(transaction);
}

const walletAction = () => generateWalletTransaction({
    wallet, recipient: walletFoo.publicKey, amount: 20
});

const walletFooAction = () => generateWalletTransaction({
    wallet: walletFoo, recipient: walletBar.publicKey, amount: 30
});

const walletBarAction = () => generateWalletTransaction({
    wallet: walletBar, recipient: wallet.publicKey, amount: 40
});

for(let i=0; i<10; i++){
    if(i%3 === 0){
        walletAction();
        walletFooAction();
    }
    else if(i%3 === 1){
        walletAction();
        walletBarAction();
    }
    else{
        walletFooAction();
        walletBarAction();
    }

    transactionMiner.mineTransactions();
}


let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    // Math.random() generates decimal numbers between 0 and 1 randomly
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000); // DEFAULT_PORT + random(1...1000)
}

// to make sure our 'app' actually starts

// if PEER_PORT is undefind then PORT=DEFAULT_PORT 
// when we execute 'npm run dev', GENERATE_PEER_PORT is not set 'true' hence PORT=DEFAULT_PORT
// as soon as we execute 'npm run dev-peer' GENERATE_PEER_PORT is set 'true' and now PEER_PORT is defined
const PORT = PEER_PORT || DEFAULT_PORT; 
app.listen(PORT, () => {
    console.log(`listening at localhost: ${PORT}`);

    // as soon as we create new node we initialize it with longest existing node
    if(PORT !== DEFAULT_PORT){ // if it's root-node(i.e. port 3000) then it don't have to synchronize with itself
        // syncChains();
        syncWithRootState();
    }
});