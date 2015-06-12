/** @jsx React.DOM */
/* global React */
"use strict";
var React = require('../../../public/bower_components/react/react');

// var data = {
//     description: 'Charge description',
//     audience: 'private',
//     individualTotal: 30,
//     groupIDs: [
//         'id1abasdf',
//         'id2asdfas'
//     ]
// };

// var StagedUsergroup = React.createClass({

//     render: function() {
//         return (
//           <div className="staged-user">
//                 <b>{this.props.displayName}: </b> {this.props.phoneNumber}
//                 <a href="#" id='delete-icon' onClick={this._removeUser}>
//                     <span className="glyphicon glyphicon-remove"></span>
//                 </a>
//           </div>
//         );
//     }
// });


// var StagedUsergroupList = React.createClass({

//     render: function() {
//         var userNodes = this.props.data.members.map(function (user, index) {
//             return (
//                 <User 
//                     removeStagedUser={this._removeStagedUser}
//                     displayName={user.displayName}
//                     phoneNumber={user.phoneNumber} 
//                     userId={index} />

//             );
//         }.bind(this));

//         return (
//           <div className="commentList">
//             {userNodes}
//           </div>
//         );
//     }

// });


// var ChargeInformationForm = React.createClass({

//     _stageUser: function(e) {
//         e.preventDefault();

//         var name = React.findDOMNode(this.refs.name).value.trim();
//         var userPhoneNumber = React.findDOMNode(this.refs.phoneNumber).value.trim();
//         var groupName = React.findDOMNode(this.refs.groupName).value.trim();
//         if (!userPhoneNumber || !name) {
//           return;
//         }

//         var obj = {displayName: name, phoneNumber: userPhoneNumber};
//         this.props.addStagedUser(obj);
//         this.props.setGroupName(groupName);

//         React.findDOMNode(this.refs.name).value = '';
//         React.findDOMNode(this.refs.phoneNumber).value = '';

//         return;
//     },

//     _handleSubmit: function(e) {
//         e.preventDefault();
//         var x;
//         var groupName = React.findDOMNode(this.refs.groupName).value.trim();
//         this.props.createUserGroup(groupName);
//         React.findDOMNode(this.refs.groupName).value = '';      
//     },

//     render: function() {
//         return (  
//             <form role="form" className="ui-form" onSubmit={this._handleSubmit}>
//                 <div className="container">
//                     <div className="row">
//                         <div className="col-sm-4">
//                             <div class='form-group'> 
//                                 <input className='form-control' type="text" placeholder="User's Name" ref="name" />
//                             </div>
//                             <div class='form-group'> 
//                                 <input className='form-control' type="text" placeholder="User's Phone Number" ref="phoneNumber" />
//                             </div>   
//                             <input type="button" onClick={this._stageUser} className='btn btn-default btn-secondary' value="Add User To Group" />

//                         </div>

//                         <div className="col-sm-4">
//                             <div class='form-group'> 
//                                 <input className='form-control' type="text" placeholder="Group Name" ref="groupName" />
//                             </div>                         
//                             <input type="submit" className='btn btn-default btn-secondary' value="Create Group" /> <br/>
//                         </div>
//                     </div>
//                 </div>
//             </form>     
//         );
//     }
// });


var ChargeCreatorContainer = React.createClass({
    getInitialState: function() {

        return {
                    description: '',
                    audience: '',
                    individualTotal: 0,
                    groupIDs: []
                };
    },

    _initializeCharge: function() {
        // use request handler to issue POST
    },

    _check: function() {
        this.setState({
                    description: '',
                    audience: '',
                    individualTotal: 0,
                    groupIDs: []
                });
    },

    render: function() {

        // var myUsergroups = JSON.parse(document.getElementById('initial-usergroupList').innerHTML);
        var myUsergroups = document.getElementById('initial-usergroupList').innerHTML;
        var parsed = JSON.parse(myUsergroups);
        // var jobj = JSON.stringify(myUsergroups);
        // console.log(typeof myUsergroups);
        console.log(parsed);

        return (
            // <h1>Charge Creator COntainer</h1>
            <input type="button" onClick={this._check} className='btn btn-default btn-secondary' value="Click" />
          // <div className="charge-form">
          //   // <h3>Create your group charge below</h3>
          //   // <ChargeInformationForm 
          //   //     handleSubmit={this._initializeCharge} 
          //   //     usergroups={myUsergroups} />
          // </div>
        );
    }

});


React.render(
  <ChargeCreatorContainer />,
  document.getElementById('charge-container')
);

module.exports = ChargeCreatorContainer;