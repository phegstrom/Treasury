/** @jsx React.DOM */
/* global React */
console.log("in main");
var React = require('../bower_components/react/react');
var Root = require("../react/components/root.jsx");


React.render(
  <Root />,
  document.getElementById("root")
);

