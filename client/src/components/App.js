// React --> default export
// Components --> secondary export
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/rectangle-logo.png';
// import Blocks from './Blocks';

class App extends Component{
    // The state object is where you store property values that belongs to the component,
    // when the state object changes, the component re-renders.
    // state = { walletInfo: { address: 'fooxv6', balance: 999 } };
    state = { walletInfo: {} };

    // it fires as soon as the component is inserted in main document(DOM)
    componentDidMount(){
        fetch(`${document.location.origin}/api/wallet-info`)
            .then(response => response.json())
            .then(jsonObject => this.setState({ walletInfo: jsonObject })); // updates the state object
    }

    // renders(presents) JSX elements
    // the component re-renders whenever the state object changes
    render(){
        const { address, balance } = this.state.walletInfo;

        return(
            <div className='App'>
                <img className='logo' src={logo}></img>
                <br/>
                <div>Welcome to the blockchain...</div>
                <br/>
                <div><Link to='/blocks'>Blocks</Link></div>
                <div><Link to='/conduct-transaction'>Conduct a Transaction</Link></div>
                <div><Link to='/transaction-pool'>Transaction Pool</Link></div>
                <br/>
                <div className='WalletInfo'>
                    <div>Address: {address}</div>
                    <div>Balance: {balance}</div>
                </div>
                {/* <br/>
                <Blocks/> */}
            </div>
        );
    }
}

export default App; // make 'App' class the default export of this file