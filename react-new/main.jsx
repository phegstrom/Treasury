import React from "react";
import ReactDOM from "react-dom";

import {InputForm} from './components/inputForm.jsx';
import QueryList from './components/queryList.jsx';

class App extends React.Component {

	render() {
		return (
				<div className="row">
					<InputForm name="name 1"/>
					<QueryList />
				</div>
		);
	}
}

ReactDOM.render(
  <App />,
  document.getElementById('test-container')
);