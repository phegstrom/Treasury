/** @jsx React.DOM */
/* global React */
console.log("in main");
var React = require('../../public/bower_components/react/react');
var Root = require("./root.jsx");


React.render(
	
  <Root />,
  document.getElementById("root")
);

