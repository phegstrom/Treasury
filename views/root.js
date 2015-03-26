/** @jsx React.DOM */
/* global React */

var Root = React.createClass({
	render: function() {
		console.log("rendering");
		return (
			<p>Hello React</p>

		)
	}
})

exports.root = Root;