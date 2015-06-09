/** @jsx React.DOM */
/* global React */
"use strict";
var React = require('../../public/bower_components/react/react');

var tabList = [
	{'id': 1, 'name': 'Profile', 'url': '/profile', 'descr': 'This is the Profile page'},
	{'id': 2, 'name': 'Groups', 'url': '/groups', 'descr': 'This is the Groups page'},
	{'id': 3, 'name': 'Charges', 'url': '/charges', 'descr': 'This is the Charges page'}
];

var Tab = React.createClass({
	handleClick: function(e){
		e.preventDefault();
		this.props.handleClick(); //call handleClick method one level up (in Tabs Component)
	},

	render: function(){
		return (
			<li className={this.props.isCurrent ? 'current' : null}>
				<a onClick={this.handleClick} href={this.props.url}>
					{this.props.name}
				</a>
			</li>
		)
	}
});


var Tabs = React.createClass({
	handleClick: function(tab){
		this.props.changeTab(tab); //method in MainContainer
	},

	render: function(){
		return (
			<nav>
				<ul className="nav nav-tabs">
					{this.props.tabList.map(function(tab){
						return(
							<Tab 
								key={tab.id}
								handleClick={this.handleClick.bind(this, tab)}
								url={tab.url} 
								name={tab.name} 
								descr={tab.descr} 
								isCurrent = {(this.props.currentTab === tab.id)}
							/>
						);
					}.bind(this))}
				</ul>
			</nav>
		);
	}
});

//*****************************************************
    //TODO: Ryan -- build out API request for getting group information 
    //IN PROGRESS
//*****************************************************


var Content = React.createClass({
	render: function(){
		return(
            <div className="content">
                {this.props.currentTab === 1 ?
                <div className="profile">
                    <p>This is Profile </p>
                </div>
                :null}

                {this.props.currentTab === 2 ?
                <div className="groups">
                     <p>This is Groups </p>
                </div>
                :null}

                {this.props.currentTab === 3 ?
                <div className="charges">
                     <p>This is Charges </p>
                </div>
                :null}
            </div>
		);
	}
});


var MainContainer = React.createClass({
	getInitialState: function(){
		return{
			tabList: tabList,
			currentTab: 1
		};
	},

	changeTab: function(tab){
		this.setState({currentTab: tab.id});
		console.log("able to change tab soon");
	},


	render: function() {
		return (
    		<div>
    			<Tabs 
    				changeTab={this.changeTab} 
    				tabList={this.state.tabList} 
    				currentTab={this.state.currentTab} />
    			<Content currentTab={this.state.currentTab}/>
    		</div>
    	);
	}
});






React.render(
  <MainContainer/>,
  document.getElementById('main-container')
);

module.exports = MainContainer;