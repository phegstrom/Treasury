/** @jsx React.DOM */
/* global React */
"use strict";
var React = require('react');


var Root = React.createClass({
  console.log("hello from Root");
  render: function() {
    return (
      <p>
        Hello, <input type="text" placeholder="Your name here" />!
        It is Hello React
      </p>
    );
  }
});

exports.root = Root;