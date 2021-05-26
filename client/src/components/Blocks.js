import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Block from './Block'

class Blocks extends Component{
    state = { blocks: [] };

    componentDidMount(){
        fetch(`${document.location.origin}/api/blocks`)
            .then(response => response.json())
            .then(json => this.setState({ blocks: json}));
    }

    render(){
        return(
            <div>
                <div><Link to='/'>Home</Link></div>
                <br/>
                <h3>Blocks</h3>

                {/* this is how we render a data structure through markup */}
                {
                    this.state.blocks.map(block => {
                        return(
                            // Each child in an array or iterator should have a unique "key" property

                            // <div key={block.hash} className='Block'>{block.hash}</div>

                            <Block key={block.hash} block={block} /> 
                            // we need to mention block attribute so that child can access it through props
                        );
                    })
                }
            </div>
        );
    }
}

export default Blocks;