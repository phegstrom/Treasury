import React from "react";

export class InputForm extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
				<h4 className="col s6 header">{this.props.name}</h4>
		);
	}
}