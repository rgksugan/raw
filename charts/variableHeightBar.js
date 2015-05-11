(function(){
  var model = raw.model();

  var width = model.dimension().title('Width').types(Number);
  var height = model.dimension().title('Height').types(Number);
  var type = model.dimension().title('Color of the bar').types(String);

  model.map(function(data) {
    return data.map(function(d) {
        return {
            width : +width(d),
            height : +height(d),
            type: type(d)
        }
    })
  });

  var chart = raw.chart().thumbnail('imgs/variableHeightBar.png')
  chart.model(model);

  chart.title('Variable Height Bar chart').description('A varibale height horizontal bar chart.');

  var chartWidth = chart.number().title('Width').defaultValue(900);

  var colors = chart.color().title('Color Scale');

  chart.draw(function(selection, data) {

    data.sort(function (a, b) {
      return parseFloat(b.width) - parseFloat(a.width);
    }).reverse();

    var _getFirstPositiveElement = function (data, param) {
      var idx;
      for(idx = 0; idx < data.length; idx++) {
        if (data[idx][param] >= 0) {
          return idx;
        }
      }
    };

    selection.attr('width', chartWidth());

    var dataset = data;

    var g = selection.append('g');

    var axis = g.append('g').attr('id', 'axis');

    var minWidth = d3.min(data, function (d) {
      return d.width;
    });
    var maxWidth = d3.max(data, function (d) {
      return d.width;
    });

    maxWidth = (maxWidth > Math.abs(minWidth)) ? maxWidth : Math.abs(minWidth);

    var widthScale = d3.scale.linear()
      .domain([ 0, maxWidth])
      .range([0, (chartWidth() / 2) - 40]);

    var minHeight = d3.min(data, function (d) { return d.height; });

    var heightScale = d3.scale.linear()
      .domain([ minHeight, d3.max(data, function (d) {
        return d.height;
      })])
      .range([12, 50]);

    var currentHeight = 0;
    var heightOffset = data.map(function (datum) {
      var tmpHeight = currentHeight;
      currentHeight += heightScale(datum.height);
      return tmpHeight;
    });

    var yCenter = _getFirstPositiveElement(data, 'width') ? heightOffset[_getFirstPositiveElement(data, 'width')] : 0;
    var totalHeight = heightOffset[heightOffset.length - 1] + heightScale(data[data.length - 1].height);

    selection.attr('height', totalHeight);
    axis.append('line')
      .attr('x1', chartWidth() / 2)
      .attr('y1', 0)
      .attr('x2', chartWidth() / 2)
      .attr('y2', totalHeight)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .classed('y-axis', true);

    axis.append('line')
      .attr('x1', 0)
      .attr('y1', yCenter)
      .attr('x2', chartWidth())
      .attr('y2', yCenter)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5, 5')
      .classed('x-axis', true);

    colors.domain(data.filter(function (d) {
      return d.type;
    }), function (d) {
      return d.type;
    });

    g.selectAll('rect').data(data).enter().append('rect')
      .classed('box', true)
      .attr('height', function (d) {
        return heightScale(d.height);
      })
      .attr('y', function (d, i) { return heightOffset[i]; })
      .attr('x', function (d, i) {
          if (d.width > 0) {
              return (chartWidth() / 2);
          } else {
              return (chartWidth() / 2) - widthScale(Math.abs(d.width));
          }
      })
      .attr('width', 0)
      .attr('fill', function (d, i) {
        return d.type ? colors()(d.type) : '#fff';
      })
      .transition()
      .delay(function (d, i) { return i * 10; })
      .attr('width', function (d) { return widthScale(Math.abs(d.width)); });

    g.append('g').selectAll('text').data(data).enter().append('text')
      .attr('x', function (d) {
          if (d.width > 0) {
              return (chartWidth() / 2) + widthScale(Math.abs(d.width));
          } else {
            return (chartWidth() / 2) - widthScale(Math.abs(d.width)) - 5;
          }
        })
      .attr('y', function (d, i) {
        var tmp;
        if (i !== data.length - 1) {
          tmp = heightOffset[i] + (heightOffset[i+1] - heightOffset[i]) / 2;
        } else {
          tmp = heightOffset[i] + heightScale(d.height) / 2;
        }
        return tmp;
      })
      .text(function (d) { return parseInt(d.width.toFixed(0)); })
      .classed('label', true)
      .attr('dominant-baseline', 'central')
      .attr('font-size', 12)
      .transition()
      .attr('transform', function (d) {
        if (d.width < 0) {
          return 'translate( ' + -(this.getBBox().width) + 5 + ', 0)';
        } else {
          return 'translate(5, 0)';
        }
      });
  });

})();