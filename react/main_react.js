/** @jsx React.DOM */
/* global React */

var Root = require("/react/root").root;
console.log("in main");

React.renderComponent(
  Root({}),
  document.getElementById("root")
);

