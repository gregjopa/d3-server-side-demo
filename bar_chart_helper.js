const jsdom = require('jsdom');
const d3 = Object.assign({}, require('d3-selection'));
const barChart = require('./bar_chart');

const { JSDOM } = jsdom;
const document = new JSDOM().window.document;

function getBarChart(params) {
  const chart = new barChart(params);
  const { containerId } = params;

  d3.select(document.body)
    .append('div')
    .attr('id', containerId)
    .call(chart.render.bind(chart));

  const svg = d3.select(document.getElementById(containerId)).node().outerHTML;
  d3.select(document.getElementById(containerId)).remove();

  return svg;
}

module.exports = {
  getBarChart
};
