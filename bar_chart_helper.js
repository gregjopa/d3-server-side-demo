const jsdom = require('jsdom');
const d3 = Object.assign({}, require('d3-selection'));
const barChart = require('./bar_chart');
const { tune } = require('./tunes-viz-only')
const { csv } = require('./csv')

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

  var userviz = tune({
    source: '',
    file: 'userviz',
    title: '',
    artist: '',
    album: '',
    data: csv,
    show: true,
    music: false,
    container: 'userviz',
    missing_words: false
  });
  console.log('userviz:', userviz)
  console.log('document:', document)
  const svg2 = d3.select(document.getElementById('tunes-userviz'))
  console.log('svg2:', svg2)

  return svg;
}

module.exports = {
  getBarChart
};
