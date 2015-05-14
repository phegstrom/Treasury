/** @jsx React.DOM */
/* global React */
"use strict";
var React = require('../../public/bower_components/react/react');

var data = {
	name: "Group 1",
	members: [
	  	{displayName: "Name 1", phoneNumber: "9703141555"},
  		{displayName: "Name 2", phoneNumber: "9702605589"}
	]
};

var User = React.createClass({
	render: function() {
		return (
		  <div className="staged-user">
		    	<b>{this.props.displayName}: </b>
		    	{this.props.phoneNumber}
		  </div>
		);
	}
});




var UserList = React.createClass({
	render: function() {

	// create array of <User>

	var userNodes = this.props.data.members.map(function (user) {
	  return (
	    <User displayName={user.displayName} phoneNumber={user.phoneNumber} />
	  );
	});

	return (
	  <div className="commentList">
		{userNodes}
	  </div>
	);
	}
});


var UserInformationForm = React.createClass({
	stageUser: function(e) {
		e.preventDefault();
		var name = React.findDOMNode(this.refs.name).value.trim();
		var userPhoneNumber = React.findDOMNode(this.refs.phoneNumber).value.trim();
		var groupName = React.findDOMNode(this.refs.groupName).value.trim();
		if (!userPhoneNumber || !name) {
		  return;
		}

		var obj = {displayName: name, phoneNumber: userPhoneNumber};
		this.props.addStagedUser(obj);
		this.props.setGroupName(groupName);

		React.findDOMNode(this.refs.name).value = '';
		React.findDOMNode(this.refs.phoneNumber).value = '';

		return;
	},

	handleSubmit: function(e) {
		e.preventDefault();
		var groupName = React.findDOMNode(this.refs.groupName).value.trim();
		this.props.createUserGroupFn(groupName);
		React.findDOMNode(this.refs.groupName).value = '';		
	},

	render: function() {
		return (
		  <form role="form" className="ui-form" onSubmit={this.handleSubmit}>
		  	<div class='form-group'> 
		    	<input className='form-control' type="text" placeholder="User's Name..." ref="name" />
		    </div>
		    <div class='form-group'> 
		    	<input className='form-control' type="text" placeholder="User's Phone Number..." ref="phoneNumber" />
		    </div>	 
		    <input type="button" onClick={this.stageUser} className='btn btn-default' value="Add User To Group" />
		    <div class='form-group'> 
		    	<input className='form-control' type="text" placeholder="Group Name..." ref="groupName" />
		    </div>			    		   
		   	<input type="submit" className='btn btn-primary' value="Create Group" /> <br/>
		  </form>
		);
	}
});


var UserGroupCreator = React.createClass({
	getInitialState: function() {
		return {data: {name: '', members: []}};
	},


	componentDidMount: function() {

	},

	createUserGroup: function(groupName) {
		// ajax request to create user group in backend
		console.log('heck for name...');
		var usergroupObj = this.state.data;
		usergroupObj.name = groupName;
		if (!usergroupObj.name || usergroupObj == '') {
			alert('need group name');
			return;
		}

		$.ajax({
			type: 'POST',
			url: '/usergroup',
			data: JSON.stringify(usergroupObj),			
			contentType: 'application/json; charset=UTF-8',
			success: function(uGroup) {				
				this.setState({data: {name: '', members: []}});
				alert('usergroup created successfully!');
				return;
			}.bind(this),
			error: function() {
				alert('error creating group');
				return;
			}.bind(this)
		});

	},

	addStagedUser: function(user) {
	    var stagedUsers = this.state.data;
	    var newArray = stagedUsers.members.concat([user]);
	    stagedUsers.members = newArray;
	    this.setState({data: stagedUsers});
	},

	setGroupName: function(ugroupName) {
		var usergroup = this.state.data;
		usergroup.name = ugroupName;
		this.setState({data: usergroup});	
	},

	render: function() {
		return (
		  <div className="usergroup-form">
		    <h2>Create User Group</h2>
		    <UserList data={this.state.data}/>
		    <UserInformationForm setGroupName={this.setGroupName} createUserGroupFn={this.createUserGroup} addStagedUser={this.addStagedUser} />
		  </div>
		);
	}

});

React.render(
  <UserGroupCreator/>,
  document.getElementById('usergroup-container')
);

module.exports = UserGroupCreator;