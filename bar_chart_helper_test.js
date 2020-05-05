const assert = require('assert').strict;
const jsdom = require('jsdom');
const barChartHelper = require('./bar_chart_helper');

const { JSDOM } = jsdom;

const data = [
  {
      name: "first",
      count: 20
  },
  {
      name: "second",
      count: 10
  }
];

const results = barChartHelper.getBarChart({
  data: data,
  width: 400,
  height: 300,
  xAxisLabel: '2012',
  yAxisLabel: 'Views',
  containerId: 'test-id'
});

const document = new JSDOM(results).window.document;

const container = document.getElementById('test-id');
assert.ok(container, 'container id should exist');

assert.deepEqual(
  ['2012', 'Views'],
  Array.from(container.querySelectorAll('.axis-label')).map(element => element.textContent)
);

assert.equal('400', document.querySelector('.svg-chart').getAttribute('width'));
assert.equal('300', document.querySelector('.svg-chart').getAttribute('height'));

assert.equal(data.length, document.querySelectorAll('.bar').length);
