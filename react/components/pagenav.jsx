/** @jsx React.DOM */
/* global React */
"use strict";

var ProfileComp = require("./profile").ProfileComp;
var GroupComp = require("./group").GroupComp;




var Tab = React.createClass({
  render: function() {
    var activeTab = this.props.initialActive ? "active" : "";
    return (
      <li className={activeTab}>
        <a href={this.props.href} data-toggle="tab" onClick={this.handleClick.bind(null, 'Google')}> {this.props.name}
        </a>
      </li> 
    );
  }
});


var TabBox = React.createClass({
  render: function() {
    return (
      <ul className="nav nav-tabs">
        <Tab href="#profile-tab" name="Profile" initialActive={this.state.profileClicked} />
        <Tab href="#group-tab" name="My Groups" initialActive={this.state.groupClicked}/>
      </ul>
    );
  }
});



var PageNav = React.createClass({
    handleClick: function(tabName, e) {
	    e.preventDefault();

	    alert('You clicked ' + tabName);
    },



	handleClick: function(clicked){
	    if(clicked){
	      click = true
	    } else {
	      click = false;
	    }
	    this.setState({ profileClicked: click });
	},
	isGroupClicked: function(clicked){
	    if(clicked){
	      click = true
	    } else {
	      click = false;
	    }
	    this.setState({ groupClicked: click });
	}, 
	render: function() {
		return (
			<div className="PageNav">
				<TabBox profileClicked={this.isProfileClicked} groupClicked={this.isGroupClicked}/>
				<div className="tab-content">
					
					<div className="tab-pane" id="profile-tab">
						<section id="profile">
							<ProfileComp>
							//<SearchBox courses={this.state.courses} 
							//handleSelected={this.searchResultSelected}/>
						</section>
					</div>


					<div className="tab-pane" id="group-tab">
						<section id="group">
							<GroupComp>
							//<SelectList courses={this.state.selected} />
						</section>
					</div>
				</div>
			</div>
		);
	}
})



exports.pagenav = PageNav;