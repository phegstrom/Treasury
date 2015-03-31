/** @jsx React.DOM */
/* global React */
"use strict";
var React = require('../../public/bower_components/react/react');


var Root = React.createClass({
  // console.log("hello from Root");

  render: function() {
    return (
      <p>
        Hello, ther
        It is Hello React Please!
      </p>
    );
  }
});

module.exports = Root;