/** @jsx React.DOM */
/* global React */
"use strict";
var React = require('../../../public/bower_components/react/react');
var RequestHandler = require('./ugroup.requestHandler');

var data = {
    name: "Group 1",
    members: [
        {displayName: "Name 1", phoneNumber: "9703141555"},
        {displayName: "Name 2", phoneNumber: "9702605589"}
    ]
};

var User = React.createClass({

    _removeUser: function(e) {
        e.preventDefault();
        this.props.removeStagedUser(this.props.userId);
    },

    render: function() {
        return (
          <div className="staged-user">
                <b>{this.props.displayName}: </b> {this.props.phoneNumber}
                <a href="#" id='delete-icon' onClick={this._removeUser}>
                    <span className="glyphicon glyphicon-remove"></span>
                </a>
          </div>
        );
    }
});


var UserList = React.createClass({

    _removeStagedUser: function(userId) {
        console.log('next: ' + userId);
        this.props.removeStagedUser(userId);
    },

    render: function() {
        var userNodes = this.props.data.members.map(function (user, index) {
            return (
                <User 
                    removeStagedUser={this._removeStagedUser}
                    displayName={user.displayName}
                    phoneNumber={user.phoneNumber} 
                    userId={index} />

            );
        }.bind(this));

        return (
          <div className="commentList">
            {userNodes}
          </div>
        );
    }

});


var UserInformationForm = React.createClass({

    _stageUser: function(e) {
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

    _handleSubmit: function(e) {
        e.preventDefault();
        var x;
        var groupName = React.findDOMNode(this.refs.groupName).value.trim();
        this.props.createUserGroup(groupName);
        React.findDOMNode(this.refs.groupName).value = '';      
    },

    render: function() {
        return (  
            <form role="form" className="ui-form" onSubmit={this._handleSubmit}>
                <div className="container">
                    <div className="row">
                        <div className="col-sm-4">
                            <div class='form-group'> 
                                <input className='form-control' type="text" placeholder="User's Name" ref="name" />
                            </div>
                            <div class='form-group'> 
                                <input className='form-control' type="text" placeholder="User's Phone Number" ref="phoneNumber" />
                            </div>   
                            <input type="button" onClick={this._stageUser} className='btn btn-default btn-secondary' value="Add User To Group" />

                        </div>

                        <div className="col-sm-4">
                            <div class='form-group'> 
                                <input className='form-control' type="text" placeholder="Group Name" ref="groupName" />
                            </div>                         
                            <input type="submit" className='btn btn-default btn-secondary' value="Create Group" /> <br/>
                        </div>
                    </div>
                </div>
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

    _createUserGroup: function(groupName) {
        var self = this;
        var usergroupObj = self.state.data;
        usergroupObj.name = groupName;
        if (!usergroupObj.name || usergroupObj == '') {
            alert('need group name');
            return;
        }

        // issue POST request to server
        RequestHandler.createUserGroup(usergroupObj, function (err, uGroup) {
            if (err) {
                alert('error creating group');
                return;    
            }
            self.setState({data: {name: '', members: []}});
            alert('usergroup created successfully!');
            return;
        });
    },

    _addStagedUser: function(user) {
        var stagedUsers = this.state.data;
        var newArray = stagedUsers.members.concat([user]);
        stagedUsers.members = newArray;

        this.setState({data: stagedUsers});
    },

    _removeStagedUser: function(userId) {
        var stagedUsers = this.state.data;
        stagedUsers.members.splice(userId, 1);

        this.setState({data: stagedUsers});
    },

    _setGroupName: function(ugroupName) {
        var usergroup = this.state.data;
        usergroup.name = ugroupName;
        this.setState({data: usergroup});   
    },

    render: function() {
        return (
          <div className="usergroup-form">
            <h3>Create User Group</h3>
            <UserList 
                removeStagedUser={this._removeStagedUser} 
                data={this.state.data} />
            <UserInformationForm 
                setGroupName={this._setGroupName} 
                createUserGroup={this._createUserGroup} 
                addStagedUser={this._addStagedUser} />
          </div>
        );
    }

});

React.render(
  <UserGroupCreator/>,
  document.getElementById('usergroup-container')
);

module.exports = UserGroupCreator;