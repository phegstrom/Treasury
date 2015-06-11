/** @jsx React.DOM */
/* global React */
console.log("in main again");
var React = require('../../public/bower_components/react/react.js');
//var TabBox = require("./pagenav.jsx");
var TabBox = require('./tab_box.jsx');


// React.render(
//   <TabBox />,
//   document.getElementById("mainContainer")
// );

React.render(
  <TabBox />,
  document.getElementById("main-container")
);

