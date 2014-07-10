var d3 = require('d3');

var barChart = module.exports = function() {

  var data = [];

  // var data = [
  //   {
  //     'name': '20130601',
  //     'count': 26
  //   },
  //   {
  //     'name': '20130602',
  //     'count': 43
  //   }, ...
  // ];


  // default values for configurable input parameters
  var width = 400;
  var height = 300;
  var margin = {
    top: 10,
    right: 10,
    bottom: 40,
    left: 40
  };
  var xAxisLabel = 'Categories';
  var yAxisLabel = 'Count';


  var chart = function(container) {

    setDimensions();
    setupXAxis();
    setupYAxis();
    setupBarChartLayout();
    addBackground();
    addXAxisLabel();
    addYAxisLabel();
    addBarChartData();




    var axisLabelMargin;

    function setDimensions() {

      axisLabelMargin = 10;

    }




    var xScale, xAxis, xAxisCssClass;

    function setupXAxis() {

      xScale = d3.scale.ordinal()
        .domain(data.map(function(d) {
          return d.name;
        }))
        .rangeRoundBands([0, width - axisLabelMargin - margin.left - margin.right], 0.25);

      if (data.length > 12 && width < 500) {
        xAxisCssClass = 'axis-font-small';
      } else {
        xAxisCssClass = '';
      }

      xAxis = d3.svg.axis()
        .scale(xScale)
        .innerTickSize(0)
        .outerTickSize(0)
        .orient('bottom');

    }




    var yScale, yAxis;

    function setupYAxis() {

      yScale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) {
          return d.count;
        })])
        .range([height - axisLabelMargin - margin.top - margin.bottom, 0]);

      yAxis = d3.svg.axis()
        .ticks(5)
        .tickFormat(d3.format('s'))
        .innerTickSize(-width + axisLabelMargin + margin.left + margin.right)
        .outerTickSize(0)
        .scale(yScale)
        .orient('left');

    }




    var g;

    function setupBarChartLayout() {

      g = container.append('svg')
        .attr('class', 'svg-chart')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    }




    function addXAxisLabel() {

      g.append('g')
        .attr('class', 'x axis ' + xAxisCssClass)
        .attr('transform', 'translate(' + axisLabelMargin + ',' +
          (height - axisLabelMargin - margin.top - margin.bottom) + ')')
        .call(xAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', (width - margin.left - margin.right - axisLabelMargin) / 2)
        .attr('y', margin.left)
        .style('text-anchor', 'middle')
        .text(xAxisLabel);

    }




    function addYAxisLabel() {

      g.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + axisLabelMargin + ', 0)')
        .call(yAxis)
        .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left)
        .attr('x', -(height - margin.top - margin.bottom - axisLabelMargin) / 2)
        .style('text-anchor', 'middle')
        .text(yAxisLabel);

    }




    function addBackground() {

      g.append('rect')
        .attr('class', 'background')
        .attr('x', axisLabelMargin)
        .attr('y', -axisLabelMargin)
        .attr('width', width - axisLabelMargin - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom);

    }




    var bar;

    function addBarChartData() {

      bar = g.selectAll('.bar')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', function(d) {
          return xScale(d.name) + axisLabelMargin;
        })
        .attr('y', function(d) {
          return yScale(d.count);
        })
        .attr('width', xScale.rangeBand())
        .attr('height', function(d) {
          return height - margin.top - margin.bottom - yScale(d.count) - axisLabelMargin;
        });


    }


  };




  chart.data = function(value) {
    if (!arguments.length) return data;
    data = value;
    return chart;
  };

  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return chart;
  };

  chart.margin = function(value) {
    if (!arguments.length) return margin;
    margin = value;
    return chart;
  };

  chart.xAxisLabel = function(value) {
    if (!arguments.length) return xAxisLabel;
    xAxisLabel = value;
    return chart;
  };

  chart.yAxisLabel = function(value) {
    if (!arguments.length) return yAxisLabel;
    yAxisLabel = value;
    return chart;
  };

  return chart;
};
