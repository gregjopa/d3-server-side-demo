const jsdom = require('jsdom');
const d3 = require('d3')
const Modernizr = require('modernizr')
const Handlebars = require('handlebars')

const barChart = require('./bar_chart');
const { settings } = require('./settings')
const { csv } = require('./csv')

const { JSDOM } = jsdom;
const window = new JSDOM().window
global.document = window.document

const document = window.document;
const $ = require('jquery')(window)
const jQuery = require('jquery')(window)

var tune = function (opts) {
  // Overall vars
  var data = null;
  opts.music = typeof opts.music == 'undefined' ? true : opts.music;
  var app = {
    init: function () {
      function processData(error, lyrics) {
        // Clear any content
        $('#tunes-' + opts.container).empty();
        // Sanitize lyrics
        if (opts.file == 'bigpun') {
          lyrics[21].text = 'ña';
        }
        if (error) {
          return false;
        };
        opts.easing = Modernizr.touch ? '' : 'elastic';
        opts.speed = Modernizr.touch ? 100 : 400;
        opts.startSize = Modernizr.touch ? 1 : .3;
        data = {
          file: opts.file,
          container: opts.container,
          lyrics: lyrics,
          show: opts.show,
          title: opts.title,
          artist: opts.artist,
          music: opts.music,
          album: opts.album,
          easing: opts.easing,
          speed: opts.speed,
          startSize: opts.startSize,
          hedcut: opts.hedcut
        };
        // Create audio and lyric containers through handlebars
        app.handlebars(data);
        // Create the viz to accompany it
        app.createViz(data);
        // Trigger resize to ensure swiper container properly sized
        $(window).trigger('resize');
      };
      if (!$('#tunes-' + opts.container).hasClass('built')) {
        if (typeof opts.data == 'undefined') {
          queue()
            .defer(d3.csv, 'data/' + opts.source)
            .await(processData);
        } else {
          processData(false, opts.data)
        }
      } else if (opts.container == 'userviz') {
        processData(false, opts.data)
      }
      return this;
    },
    handlebars: function (data) {
      Handlebars.registerHelper('breakspace', function (linebreak, space) {
        var ret = space == 1 ? ' ' : '';
        ret += linebreak == 1 ? '<br />' : '';
        return ret;
      });
      Handlebars.registerHelper('highlight', function (d) {
        return data.file == 'hamilton' && d[data.container] == 1 ? 'active' : '';
      });

      // Create the basic structure targeting #tunes-{{file}}
      // var structureSource = $('#structure-template').html();
      var structureSource = `
<div class="viz-audio-wrapper">
      <div class="standalone-play-pause">
        <div class="jp-play" tabindex="0"><span class="glyphicon glyphicon-play"></span></div>
        <div class="jp-pause" tabindex="0"><span class="glyphicon glyphicon-pause"></span></div>
      </div>
      <div class="audio-player" id="audio-player-{{container}}"></div>
      <div class="viz-container" id="viz-{{container}}"></div>
    </div>
    <div class="lyrics-container" id="lyrics-{{container}}"></div>
      `
      var structureTemplate = Handlebars.compile(structureSource);
      var structureOutput = structureTemplate(data);
      $('#tunes-' + data.container).append(structureOutput);

      // Create lyrics container
      const lyricsSource = `
      <div class="lyrics-box">
      <div class="lyrics">

        {{#each lyrics}}<span class="{{highlight this}}" data-index="{{@key}}" data-timecode="{{timecode}}" data-classed="{{classed}}">{{{text}}}</span>{{{breakspace linebreak space}}}{{/each}}
        <span class="song-meta">
        "{{title}}" on "{{album}}"
      </span>
      </div>
    </div>
    <div class="lyrics-meta mobi-meta">
        <span class="song-title">{{artist}} performing "{{title}}" on "{{album}}"</span>
    </div>
    <div class="lyrics-meta">
      <img class="hedcut" src="//graphics.wsj.com/hamilton/img/{{hedcut}}.png" alt="">
      <span class="song-title">{{artist}}</span>
      <span class="album"></span>
      <span class="view-lyrics"><span class="view">View</span><span class="hides">Hide</span> lyrics</span>
    </div>

    <div class="clearfix"></div>
      `
      var lyricsTemplate = Handlebars.compile(lyricsSource);
      var lyricsOutput = lyricsTemplate(data);
      $('#lyrics-' + data.container).append(lyricsOutput);

      if (data.container == 'userviz') {
        $('#tunes-' + data.container + ' .lyrics-container,#tunes-' + data.container + ' .lyrics-container span').addClass('active');
      }

      // Add class to wrapper to prevent doubling up
      $('#tunes-' + data.container).addClass('built');
    },
    createViz: function (data) {
      // Set vars that will change
      var margin,
        width,
        height,
        svg,
        unitWidth,
        unitHeight,
        rSize,
        x,
        y;

      var rotate = -45;

      var numberOfRows = 0; // Include zero based row
      var rowsArr = [];
      var numberOfBreaks = 0;
      var numberOfSyllables = data.lyrics.length;
      var wordSoundOffset = -5;
      // Get number of groups
      $.each(data.lyrics, function (i, d) {
        d.classed = parseFloat(d.classed);
        d.shown = false;
        numberOfRows = d.classed > numberOfRows ? d.classed : numberOfRows;
        if (jQuery.inArray(d.classed, rowsArr) < 0) {
          rowsArr.push(d.classed);
        }
        numberOfBreaks += d.linebreak;
      });

      numberOfRows++;

      function setVars() {
        margin = {
          top: 60,
          right: 30,
          bottom: 15,
          left: 30
        },
          width = $('#viz-' + data.container).width() - margin.left - margin.right;

        height = 200 - margin.top - margin.bottom;

        wordSoundOffset = window.innerWidth < 620 ? -15 : -5;
        // Calculate height and width based on number of rows and entries
        unitWidth = width / (numberOfSyllables);

        if (data.container == 'userviz') {
          rSize = unitWidth;
          height = rSize * numberOfRows;
          if (height > 400) {
            height = 400;
            rSize = height / numberOfRows;
          }
        } else {
          unitHeight = (height / (numberOfRows));
          rSize = unitHeight < unitWidth ? unitHeight : unitWidth;
        }

        // Axes
        xOffsetViz = (width - (numberOfSyllables * rSize)) / 2;
        x = d3.scaleLinear().domain([0, numberOfSyllables]).range([0, numberOfSyllables * rSize]);
        if (window.innerWidth > 620) {
          y = d3.scaleLinear().domain([0, numberOfRows]).range([0, numberOfRows * rSize]);
        } else {
          y = d3.scaleLinear().domain([0, numberOfRows]).range([0, height]);
        }

        // Adjust RSze
        rSize = rSize < 15 ? 15 : rSize;
      }

      setVars();

      // Viz-unit variables that don't change
      var maxOpacity = 0.8;

      function resize() {
        if ($(window).width() >= 991) {
          var xOffset = 48;
        }
        else if (($(window).width() < 991) && ($(window).width() > 767)) {
          var xOffset = 40;
        }
        else if (($(window).width() < 767) && ($(window).width() > 620)) {
          var xOffset = 45;
        }

        else {
          var xOffset = 0 + margin.left;
        }

        setVars();
        d3.select('#viz-' + data.container + ' svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        svg
          .attr('transform', 'translate(' + (xOffsetViz + xOffset) + ',' + margin.top + ')');

        svg.selectAll('.viz-row')
          .attr('transform', function (d, i) {
            return 'translate(' + (x(0)) + ',' + y(d) + ')';
          });

        var note = rows.selectAll('.note')
          .attr('class', 'note')
          .attr('transform', function (d, i) {
            return 'translate(' + x(i) + ',' + 0 + ')';
          })

        note.selectAll('circle')
          .attr('r', rSize)

        svg.selectAll('.bg')
          .attr('width', width)
          .attr('height', height - rSize);
      }

      var svg = d3.select('#viz-' + data.container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      //BG
      var bg = svg.append('rect')
        .attr('class', 'bg')
        .attr('width', width)
        .attr('height', height - rSize)
        .attr('fill', 'transparent');

      for (var j = 0; j <= numberOfRows; j++) {
        var row = svg.selectAll('.viz-row')
          .data(rowsArr).enter()
          .append('g')
          .attr('class', 'viz-row')
          .attr('data-row', function (d) { return d; });
      }

      // Append sounds if exist
      if (typeof settings[data.file] !== 'undefined') {
        // Add sound prefixes
        var sounds = svg.selectAll('.viz-row')
          .append('g')
          .attr('class', 'sound')
          .attr('transform', function () {
            var x = 5 + xOffsetViz;
            return 'translate(-' + x + ',' + (rSize / 2) + ')';
          })

          .attr('opacity', 0);
        sounds.append('text')
          .text(function (d, i) {
            return settings[data.file].sounds[d];
          })
          .attr('data-classed', function (d, i) { return d; })
      }

      // Append Groups for each note
      var rows = svg.selectAll('.viz-row');
      var note = rows.selectAll('.note')
        .data(data.lyrics).enter()
        .append('g')
        .attr('class', 'note')
        .attr('transform', function (d, i) {
          return 'translate(' + (x(i)) + ',' + (0) + ')';
        })

      var firstRow = rows.filter(function (d) {
        return d == 0 ? this : null;
      });

      // Vertical lines
      if (data.container != 'introviz') {
        firstRow.selectAll('.note').filter(function (d, i) {
          return d.linebreak == 1;
        }).append('path')
          .attr('class', 'break')
          .attr('data-timecode', function (d) { return d.timecode; })
          .attr('d', 'M ' + (rSize) + ' ' + (0) + ' L ' + (rSize) + ' ' + (height))
          .attr('stroke-dasharray', ('1,1'))
          .attr('stroke', '#999')
          .attr('opacity', function () {
            return data.show ? 1 : 0;
          });
        var firstRowLine = svg.append('path')
          .attr('class', 'break')
          .attr('d', 'M ' + (0) + ' ' + (0) + ' L ' + (0) + ' ' + (height))
          .attr('stroke-dasharray', ('1,1'))
          .attr('stroke', '#999')
          .attr('opacity', function () {
            return data.show ? 1 : 0;
          });
      }

      var wordSound = firstRow.selectAll('.note')
        .append('g')
        .attr('class', 'word-sound')
        .attr('transform', 'translate(0,' + (wordSoundOffset) + ')');
      wordSound.append('text')
        .text(function (d) { return d.text; })
        .attr('data-timecode', function (d) { return d.timecode; })
        .attr('data-classed', function (d) { return d.classed; })
        .attr('class', 'word-sound')
        .attr('transform', 'scale(1)')
        .attr('opacity', 0);

      // Append disamond rect
      note.filter(function (d, i) {
        var rowNum = d3.select(this.parentNode).datum();
        return rowNum == d.classed && d.classed != 0;
      }).append('rect')
        .attr('width', rSize * 1.35)
        .attr('height', rSize * 1.35)
        .attr('x', -rSize / 2)
        .attr('y', -rSize / 2)
        .attr('opacity', function (d) {

          return maxOpacity;
        })
        .attr('class', function (d) {
          if (data.show) {
            if (typeof d[data.container] != 'undefined' && d[data.container] != '') {
              return 'viz-unit active';
            } else {
              if (d.classed == 0) {
                return 'viz-unit subtle';
              } else {
                return 'viz-unit subtle active';
              }
            }
          } else {
            return 'viz-unit';
          }
        })
        .attr('data-classed', function (d) {
          var rowNum = d3.select(this.parentNode.parentNode).datum();
          if (rowNum == d.classed) {
            return d.classed;
          } else {
            return 0;
          }
        })
        .attr('transform', function (d) {
          var rowNum = d3.select(this.parentNode.parentNode).datum();
          if (d.classed == rowNum && data.show) {
            // If set to "show," simply show it
            return 'scale(1) rotate(' + rotate + ')';
          } else {
            if (d.classed == rowNum) {
              // If a real circle, show it
              return 'scale(1) rotate(' + rotate + ')';
            } else {
              // If not a real circle, don't show it
              return 'scale(0) rotate(0)';
            }
          }
        });

      // Append annotations where applicable
      if (typeof settings[data.file] !== 'undefined' && typeof settings[data.file].annotations !== 'undefined' && typeof settings[data.file].annotations[data.container] !== 'undefined') {
        $.each(settings[data.file].annotations[data.container], function (i, match) {
          var annotation = note.filter(function (d) {
            // Get only notes where we're showing the color
            var rowNum = d3.select(this.parentNode).datum();
            return rowNum == d.classed && match.timecode == d.timecode ? this : null;
          })
            .append('g')
            .attr('class', 'annotation')
            .attr('transform', function () {
              return data.show ? 'scale(1)' : 'scale(0)';
            });

          $.each(match.text.split('<br />'), function (j, text) {
            annotation.append('text')
              .text(function (d) {
                return text;
              })
              .attr('text-anchor', function (d) {
                return match.anchor;
              })
              .attr('y', function (d) {
                var lineSpacing = 14;
                if (match.position == 'under') {
                  return rSize * 1.75 + (lineSpacing * j);
                } else if (match.position == 'above') {
                  return -rSize * 2 + (lineSpacing * j);
                }
              });
          });
        });
      }

      //  Trigger resize function now that we're done
      $(window).resize(resize);
    },
  }
  return app.init();
}

function getBarChart(params) {
  const chart = new barChart(params);
  const { containerId } = params;

  d3.select(document.body)
    .append('div')
    .attr('id', containerId)
    .call(chart.render.bind(chart));

  const svg = d3.select(document.getElementById(containerId)).node().outerHTML;
  d3.select(document.getElementById(containerId)).remove();

  d3.select(document.body)
    .append('div')
    .attr('id', 'tunes-userviz')

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
  const svg2 = d3.select(document.getElementById('tunes-userviz')).node().outerHTML

  return svg2;
}

module.exports = {
  getBarChart
};
