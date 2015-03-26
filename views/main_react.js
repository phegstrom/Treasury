/** @jsx React.DOM */
/* global React */

var Root = require("root.js").root;
console.log(Root);
console.log("in main");

React.renderComponent(
  Root({}),
  document.getElementById("root")
);

