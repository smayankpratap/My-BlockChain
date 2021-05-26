// it is child of Blocks.js file

import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component{
    state = { displayTransaction: false };

    toggleTransaction = () => {
        this.setState({ displayTransaction: !this.state.displayTransaction });
    }

    // The get keyword will bind an object property to a function;
    // the return value of the getter function then determines which property is returned.
    get displayTransaction() { // returns JSX element
        const { data } = this.props.block;

        const stringifiedData = JSON.stringify(data);

        const dataDisplay = stringifiedData.length>35 ?
            `${stringifiedData.substring(0,35)}...` : 
            stringifiedData;

        if(this.state.displayTransaction){
            return(
                <div>
                    {
                        data.map(transaction => (
                            <div key={transaction.id}>
                                <hr/>
                                <Transaction transaction={transaction} />
                            </div>
                        ))
                    }
                    <br/>
                    <Button className='button' bsStyle='danger' bsSize='small' onClick={this.toggleTransaction}>
                        Show Less
                    </Button>
                </div>
            )
        }
        
        // return <div>Data: {dataDisplay}</div>;
        return(
            <div>
                <div>Data: {dataDisplay}</div>
                <Button className='button' bsStyle='danger' bsSize='small' onClick={this.toggleTransaction}>
                    Show More
                </Button>
            </div>
        )
    }

    /*
    // it has disadvantage over the above method, since it is a function whenever it is called 
    // everytime it is re-evaluated, whereas in above scenario the return value is set and remains same
    // and we have to render it as {this.displayTransaction()}
    displayTransaction = () => { 
        const exampleString = 'example';

        return <div>Display Transaction: {exampleString}</div>
    }*/

    render(){
        // with the help of props(i.e. properties) we can access the parent component
        const { timestamp, hash } = this.props.block;

        const hashDisplay = `${hash.substring(0,15)}...`;
        
        return(
            <div className='Block'>
                <div>Hash: {hashDisplay}</div>
                <div>Timestamp: {(new Date(timestamp)).toLocaleString()}</div>
                {this.displayTransaction}
            </div>
        )
    }
}

export default Block;