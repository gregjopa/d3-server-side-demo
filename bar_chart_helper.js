const d3 = require('d3');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const doc = new JSDOM(`<!DOCTYPE html><body></body>`).window.document;
const barChart = require('./bar_chart');


const getBarChart = function (params) {

  const chart = barChart()
    .data(params.data)
    .width(params.width)
    .height(params.height)
    .xAxisLabel(params.xAxisLabel)
    .yAxisLabel(params.yAxisLabel);


  d3.select(doc.body).append('div').attr('id', params.containerId).call(chart);

  const selector = params.containerId;
  const svg = d3.select(doc.getElementById(selector)).node().outerHTML;
  d3.select(doc.getElementById(selector)).remove();

  return svg;

};


module.exports = {
  getBarChart: getBarChart
};
