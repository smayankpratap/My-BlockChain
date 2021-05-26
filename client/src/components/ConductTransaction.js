import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import history from '../history';

class ConductTransaction extends Component{
    state = { recipient: '', amount: 0 };

    updateRecipent = event => {
        this.setState({ recipient: event.target.value });
    }
    
    updateAmount = event => {
        this.setState({ amount: Number(event.target.value) });
    }

    conductTransaction = () => {
        const { recipient, amount } = this.state;

        fetch(`${document.location.origin}/api/transact`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ recipient, amount })
        }).then(response => response.json())
          .then(json => {
              alert(json.message || json.type);
              history.push('./transaction-pool'); // after alert message it redirects to transaction pool page
          });
    }

    render(){
        // console.log('this.state', this.state);

        return(
            <div className='ConductTransaction'>
                <div><Link to='/'>Home</Link></div>
                <h3>Conduct a Transaction</h3>
                <FormGroup>
                    <FormControl 
                        input='text' 
                        placeholder='recipient' 
                        value={this.state.recipient} 
                        onChange={this.updateRecipent}
                    />
                </FormGroup>
                <FormGroup>
                    <FormControl 
                        input='number' 
                        placeholder='amount' 
                        value={this.state.amount} 
                        onChange={this.updateAmount}
                    />
                </FormGroup>
                <div>
                    <Button className='button' bsStyle='danger' onClick={this.conductTransaction}>
                        Submit
                    </Button>
                </div>
            </div>
        )
    }
}

export default ConductTransaction;