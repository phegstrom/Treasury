/** @jsx React.DOM */
/* global React */
console.log("in main again");
var React = require('../../public/bower_components/react/react.js');
var TabBox = require("./pagenav.jsx");


React.render(
  <TabBox />,
  document.getElementById("mainContainer")
);

