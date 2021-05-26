// These imports incorporate other files which are located in node_modules folder or anywhere else but our webpage
// only supports single page javascript file hence we use bundler which bundles all necessary requirements in one
// javascript file which  will be used by the index.html file to serve on web

import React from 'react';
import { render } from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import history from './history';
import App from './components/App';
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransaction';
import TransactionPool from './components/TransactionPool';
import './index.css'

// renders(presents) components
render( // (content, position)

    // <div>Cryptochain in React!: Live Server...</div>,

    // <App/>, or <App></App> 

    <Router history={history}>
        <Switch>
            {/* 'exact' keyword is to make sure the end point is strictly '/' */}
            <Route exact path='/' component={App} />
            <Route path='/blocks' component={Blocks} />
            <Route path='/conduct-transaction' component={ConductTransaction} />
            <Route path='/transaction-pool' component={TransactionPool} />
        </Switch>
    </Router>,
    document.getElementById('root')
)