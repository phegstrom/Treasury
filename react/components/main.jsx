/** @jsx React.DOM */
/* global React */
console.log("in main again");
var React = require('../../public/bower_components/react/react.js');
var TabBox = require("./pagenav.jsx");
var Test = require('./root_test.jsx');


// React.render(
//   <TabBox />,
//   document.getElementById("mainContainer")
// );

React.render(
  <Test />,
  document.getElementById("main-container")
);

