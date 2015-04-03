/** @jsx React.DOM */
/* global React */
"use strict";
var React = require('../../public/bower_components/react/react');
//var ProfileContainer = require("./profile_container.jsx").ProfileContainer;
//var GroupContainer = require("./group_container.jsx").GroupContainer;

var TabBox = React.createClass({
	getInitialState: function() {
		return {
			tabs: [
				{title: 'My Profile', content: 'Content 1 -- hello Profile'},
				{title: 'Groups', content: 'Content 2 -- hello Group'}
			],
			active: 0
		};
	},
	render: function() {
		return <div>
			<TabsNav items={this.state.tabs} active={this.state.active} onTabClick={this.handleTabClick}/>
			<MainContainer items={this.state.tabs} active={this.state.active}/>
		</div>;
	},
	handleTabClick: function(index) {
		//sets active equal to a new value of index
		this.setState({active: index})
	}
});


var TabsNav = React.createClass({
	render: function() {
		var active = this.props.active;
		var items = this.props.items.map(
			function(item, index) {
				return 
					<a href="#" className={'tab ' + (active === index ? 'tab_selected' : '')} onClick={this.onClick.bind(this, index)}>
						{item.title}
					</a>;
			}.bind(this));

		return <div>{items}</div>;
	},
	onClick: function(index) {
		this.props.onTabClick(index);
	}
});


var MainContainer = React.createClass({
	render: function() {
		var active = this.props.active;
		//for each item create a div below and set the className accordingly
		var items = this.props.items.map(function(item, index) {
			return 
				<div className={'tabs-panel ' + (active === index ? 'tabs-panel_selected' : '')}>
					//TODO: update with groupRow Components
					{item.content}
				</div>;
		});
		return <div>{items}</div>;
	}
});

exports.pagenav = TabBox;
