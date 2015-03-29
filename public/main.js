/** @jsx React.DOM */
/* global React */

var Root = require("../react/components/root").root;
console.log("in main");

React.renderComponent(
  Root({}),
  document.getElementById("root")
);

