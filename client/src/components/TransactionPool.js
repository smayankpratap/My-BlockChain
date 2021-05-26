import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';
import history from '../history';

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component{
    state = { transactionPoolMap: {} };

    fetchTransactionPoolMap = () => {
        fetch(`${document.location.origin}/api/transaction-pool-map`)
            .then(response => response.json())
            .then(json => this.setState({ transactionPoolMap: json }));
    }

    fetchMineTransactions = () => {
        fetch(`${document.location.origin}/api/mine-transactions`)
            .then(response => {
                if(response.status === 200){
                    alert('Success');
                    history.push('/blocks'); // redirects to the '/blocks' route
                }
                else{
                    alert('The mine-transactions block request did not completed');
                }
            });
    }

    componentDidMount(){
        this.fetchTransactionPoolMap();

        // setInterval() method makes sure if any other peer node has made any transaction then it is 
        // reflected in transactionPoolMap
        this.fetchPoolMapInterval = setInterval(
            () => this.fetchTransactionPoolMap(),
            POLL_INTERVAL_MS  
        );
    }

    // Called immediately before a component is destroyed. Perform any necessary cleanup in this method,
    // such as cancelled network requests, or cleaning up any DOM elements created in componentDidMount.
    componentWillUnmount(){
        // destroys setInterval() as soon as TransactionPool component is unmounted
        clearInterval(this.fetchPoolMapInterval);
    }

    render(){
        return(
            <div className='TransactionPool'>
                <div><Link to='/'>Home</Link></div>
                <div><Link to='/conduct-transaction'>Conduct a Transaction</Link></div>
                <h3>Transaction Pool</h3>{
                    Object.values(this.state.transactionPoolMap).map(transaction => {
                        return(
                            <div key={transaction.id}>
                                <hr/>
                                <Transaction transaction={transaction} />
                            </div>
                        )
                    })
                }
                <hr/>
                <Button bsStyle='danger' onClick={this.fetchMineTransactions}>
                    Mine the Transactions
                </Button>
            </div>
        )
    }
}

export default TransactionPool;