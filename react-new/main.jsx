var React = require('react');
var ReactDOM = require('react-dom');

import InputForm from './components/inputForm.jsx';
import QueryList from './components/queryList.jsx';

// var InputForm = require('./components/inputForm.jsx');
// var QueryList = require('./components/queryList.jsx');

var App = React.createClass({
	render: function(){
		return (
				<div>
					<div className="col s6">
						<InputForm />
					</div>
					<div className="col s6" id='query-list'>
						<QueryList />
					</div>
				</div>
		);
	}
});

ReactDOM.render(
  <App />,
  document.getElementById('test-container')
);