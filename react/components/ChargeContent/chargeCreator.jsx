/** @jsx React.DOM */
/* global React */
"use strict";
var React = require('../../../public/bower_components/react/react');
var FormData = require('react-form-data');
var RequestHandler = require('./charge.RequestHandler');
var _ = require('underscore');

// var data = {
//     description: 'Charge description',
//     audience: 'private',
//     individualTotal: 30,
//     groupIDs: [
//         'id1abasdf',
//         'id2asdfas'
//     ]
// };

var Loader = React.createClass({
  render: function(){
    return (
      <div className={"loader " + (this.props.issuingCharge ? "active" : "")}>
        <img src="loaders/default.svg" />
      </div>
    )
  }
});

var Charge = React.createClass({
    render: function(){
        // TODO - Parker/Ryan: populate charge info, all this information is
        // is located in this.props.transactions
        return(
            <li className="list-group-item">
                <a data-toggle="collapse" href={"#collapseExample" + this.props.chargeID} aria-expanded="false" aria-controls={"collapseExample" + this.props.chargeID}>
                    <span className="glyphicon glyphicon-chevron-down"></span>
                </a>                            
                {this.props.description}
                <div className="current-balance">
                Received {this.props.totalReceived} of {this.props.total}  
                </div>
                <div className="collapse" id={"collapseExample" + this.props.chargeID}>
                    <div className="well">
                        Charge info goes here...
                    </div>
                </div>                
            </li>
        );
    }
});


var ChargeList = React.createClass({
    render: function(){

        return(
            <ul className="list-group">
                {this.props.charges.map(function(charge, index){
                    return(
                        <Charge 
                            description={charge.description}
                            totalReceived={charge.totalReceived}
                            total={charge.total}
                            chargeID={index}
                            transactions={charge.transactions} 
                        />
                    );
                }.bind(this))}                
            </ul>
        );
    }
});


var ChargeInformationForm = React.createClass({
    mixins: [FormData],


    _createChargeObject: function(data) {
        var toRet = {   
                        description: data.description,
                        audience: data.audience,
                        individualTotal: data.chargeAmount,
                        groupIDs: data.groups
                    };

        return toRet;
    },

    _handleSubmit: function(e) {
        e.preventDefault();
        var chargeObj = this._createChargeObject(this.formData);
        document.getElementById("charge-form").reset();
        this.props.handleSubmit(chargeObj);

    },

    render: function() {
        return (  
            <form role="form" id="charge-form" className="ui-form" onChange={this.updateFormData} onSubmit={this._handleSubmit}>
                <div className='form-group'> 
                    <label>Charge description</label>
                    <input className='form-control' name="description" type="text" placeholder="Description..." ref="description" />
                </div>

                <div className='form-group'>
                    <label> Audience </label>
                    <div className="radio">
                        <label>
                            <input type="radio" name="audience" value="public" refs="public"/>
                            public
                        </label>
                    </div>                              
                    <div className="radio">
                        <label>
                            <input type="radio" name="audience" value="private" refs="private"/>
                            private
                        </label>
                    </div>                      
                </div>   

                <div className="form-group">
                    <label>Individual charge amount</label>
                    <div className="input-group amount-input">
                      <div className="input-group-addon">$</div>
                          <input type="text" className="form-control" name="chargeAmount" id="exampleInputAmount" placeholder="Amount" />
                      
                    </div>
                </div>

                <div className='form-group'>
                    <label>Choose groups to charge</label>
                    <div className="group-selector">
                        {this.props.usergroups.map(function(ugroup){
                            return(
                                <div className="checkbox">
                                    <label>
                                        <input type="checkbox" name="groups" value={ugroup._id}/>
                                        {ugroup.name}
                                    </label> 
                                </div> 
                            );
                        }.bind(this))} 
                    </div>
                </div>                         
                <input type="submit" className='btn btn-brand' value="Create Charge" />
            </form>  

        );
    }
});


var ChargeCreatorContainer = React.createClass({
    getInitialState: function() {
        // get intiial data from server upon connection
        var myUsergroups = JSON.parse(document.getElementById('initial-usergroupList').innerHTML);
        var myCharges = JSON.parse(document.getElementById('initial-chargeList').innerHTML);
        return {
                    charges: myCharges,
                    userGroups: myUsergroups,
                    issuingCharge: false
                };
    },

    componentDidMount: function() {        
        // handle socket communication for live updates
        var socket = io.connect('http://localhost:3000/');
        socket.on('chargeCreated', function(charge) {
            console.log('got emitted event from charge');
            var newChargeList = this.state.charges;
            newChargeList.push(charge);
            newChargeList = _.sortBy(newChargeList, 'dateCreated')            
            newChargeList.reverse();
            var self = this;

            // setting time out for fun, just to see if loader works
            setTimeout(function(){

            // new state, turn off loader
            self.setState({charges: newChargeList, issuingCharge: false});

            }, 2000);    

        }.bind(this));
    },

    _initializeCharge: function(chargeObj) {        
        // issue POST request to server
        var self = this;
        self.setState({issuingCharge: true});
        RequestHandler.issueCharge(chargeObj, function (err, charge) {
            if (err) {
                alert('error creating charge');
                self.setState({issuingCharge: false});
                return;    
            }                
            return;
        });        

    },

    render: function() {
        console.log(this.state);

        return (
          <div className="charge-container">
            <Loader issuingCharge={this.state.issuingCharge}/>

            <h3>See below for your issued charges:</h3>
            <ChargeList
                charges={this.state.charges} />
            <h3>Create group charge below</h3>
            
            <ChargeInformationForm 
                handleSubmit={this._initializeCharge} 
                usergroups={this.state.userGroups} />
          </div>
        );
    }

});


// React.render(
//   <ChargeCreatorContainer />,
//   document.getElementById('charge-container')
// );

module.exports = ChargeCreatorContainer;