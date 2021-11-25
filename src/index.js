// import React from 'react';
// import ReactDOM from 'react-dom';

import React from './react/index';
import ReactDOM from './react/ReactDOM';
import Component from './react/Component';

import './index.css';

const App = () => {
    return (<div class="app">APP</div>)
}

class Bpage extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { name  } = this.props;
        return (
            <div>Bpage {name}</div>
        )
    }
}

const jsx = (
    <div className="boder">
        <App />
        <Bpage name="classPage" />
        <h1>Free React</h1>
        <p>make a mini React</p>
        开开心心研究技术
        <>
            <h5>1</h5>
            <h5>2</h5>
        </>

        {
            [2,3,4].map(it => (<h2>Map{it}</h2>))
        }
    </div>
)

console.log('jsx', jsx);

ReactDOM.render(jsx, document.getElementById('root'));
