'use strict';

/**
 * @ngdoc service
 * @name weatherApp.chartService
 * @description
 * # chartService
 * Service in the weatherAppApp.
 */
angular.module('weatherApp')
  .service('chartService', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var lineChart = function(selection,config){
      this.outerHeight= config.height ||300;
      this.outerWidth= config.width || 700;
      this.margin=config.margin || {
        top: 25,
        right: 30,
        bottom: 43,
        left: 68
      };
      this.tickPadding= config.tickPadding || 18;
      this.xtickCount= config.xtickCount || 5;
      this.ytickCount=config.ytickCount ||  5;
      this.data= config.data || null;
      this.transitionDuration= 0;
      this.xScale= d3.time.scale();
      this.yScale= d3.scale.linear();
      this.dailyFormat= d3.time.format('%m/%d');
      this.hourlyFormat= d3.time.format('%m/%d %H:%M');
      this.format = this.hourlyFormat;
      this.valueFormat = config.valueFormat || function(d){
        return d;

      };
      this.label = config.label || function(i){
        var labels = ['NY City','London'];
        if(i<=labels.length){
          return labels[i];
        }
        return "label"+i;
      }
      this.xAxis= function(){
        var _this = this;
        return d3.svg.axis().scale(_this.xScale)
          .orient('bottom')
          .tickSize(0, 1)
          .ticks(_this.xtickCount)
          .tickFormat(function(d) { return _this.format(d); })
          .tickPadding(_this.tickPadding);
      };
      this.yAxis= function(){

        var _this = this;
        return d3.svg.axis().scale(_this.yScale)
          .orient('left')
          .ticks(_this.ytickCount)
          .tickSize(0, 1)
          .tickFormat(function(d) {return _this.valueFormat(d); })
          .tickPadding(_this.tickPadding);
      };
      this.xValue= config.xValue || function(d) { return d[0]};
      this.yValue= config.yValue || function(d) { return d[1]};
      this.lineFunc= function(){
        var _this = this;

        return d3.svg.line().x(function(d){
          return _this.xScale(new Date(d[0]));

        }).y(function(d){
          return _this.yScale(d[1]);
        });
      };
      this.mouseOverRadius = 6;
      this.drawMethods=[];
      this.setDrawMethods= function(methods, chart){
        chart.drawMethods = [];
        for(var key in methods){
          if(chart[key]){
            if(typeof(methods[key]) === "boolean" && methods[key] === true){
              chart.drawMethods.push(key);
            }else if(typeof(methods[key]) !== "boolean"){
              chart[key] = methods[key];
              chart.drawMethods.push(key);
            }

          }
        }
      };

    };

    lineChart.prototype.draw= function(stateData0,stateData1,selection, chart){
        // If we have no data to render, return
        if (!stateData0  && !chart.data0) return chart;
        if(!stateData0 && chart.oldData){
          stateData0 = chart.oldData;
          stateData1 = chart.prevData;
        }
        chart.oldData = stateData0;
        chart.prevData = stateData1;
        // Convert stateData to a copy of standard representations
        // (greedily, which is needed for nondeterministic accessors)
        chart.data0 = stateData0.map(function(d, i) {
          return [chart.xValue.call(null, d, i), chart.yValue.call(null, d, i)];
        });
        chart.data1 = stateData1.map(function(d, i) {
        return [chart.xValue.call(null, d, i), chart.yValue.call(null, d, i)];
        });


        var data = chart.data0;

        // draw the line chart

        var g = chart.drawSVG(selection, chart.data0);
        var svg = selection.selectAll("svg").data([data]);

        // Update the scale.
        this.setScale(chart.data0,chart.data1);


        // delete all previous drawn element
        // since d3 join won't do update/delete automatically
        // when we update the drawMethods
        g.select('g.x-axis').selectAll('g').remove();
        g.select('g.x-axis').selectAll('path').remove();
        g.select('g.y-axis').selectAll('g').remove();
        g.select('g.y-axis').selectAll('path').remove();

        g.select('g.area').selectAll('path').remove();
        g.select('g.lines').selectAll('path').remove();
        g.select('g.grid').selectAll('line').remove();
        g.select('g.circles').selectAll('circle').remove();
        g.select('text').remove();

        // Call each of the methods in the chart.drawMethods array
        for(var fn in chart.drawMethods){
          chart[chart.drawMethods[fn]].call(chart, g, data, svg);
        }

    };

    lineChart.prototype.setScale = function(data0, data1){
      var minDate = d3.min(data0, function(d){
        return new Date(d[0]);
      });
      //minDate = new Date(minDate);
      var maxDate = d3.max(data0, function(d){
        return new Date(d[0]);
      });

      this.xScale.domain([minDate, maxDate]).range([0,this.width]);

      if(data0 && data0.length){
        var minY1 = d3.min(data0, function(d){return d[1];});
        var maxY1 = d3.max(data0, function(d){return d[1];});
      }

      if(data1 && data1.length){
        var minY2 = d3.min(data1, function(d){return d[1];});
        var maxY2 = d3.max(data1, function(d){return d[1];});
      }
      if(minY1 && minY2){
        var minY = d3.min([minY1,minY2]);
      }
      if(maxY1 && maxY2){
        var maxY = d3.max([maxY1,maxY2]);
      }

      if(minY && maxY){
        this.yScale.domain([minY,maxY]);
      }else{
        if(minY1 && maxY1){
          this.yScale.domain([minY1,maxY1]);
        }else{
          if(minY2 && maxY2){
            this.yScale.domain([minY2,maxY2]);
          }
        }
      }
      if(this.yScale.domain()[0] == this.yScale.domain()[1]){
        this.yScale.domain()[0] = 0;
      }
      this.yScale.range([this.height,0]);

    };

    lineChart.prototype.clearAll = function(container){
      var svg = container.selectAll("svg").data([this.data]);
      var g = svg.select("g.canvas");

      g.select('g.x-axis').selectAll('g').remove();
      g.select('g.x-axis').selectAll('path').remove();
      g.select('g.y-axis').selectAll('g').remove();
      g.select('g.y-axis').selectAll('path').remove();

      g.select('g.area').selectAll('path').remove();
      g.select('g.lines').selectAll('path').remove();
      g.select('g.grid').selectAll('line').remove();
      g.select('g.circles').selectAll('circle').remove();
      g.select('text').remove();
    };

    lineChart.prototype.drawSVG = function(selection, data){
      // draw the svg
      var svg = selection.selectAll("svg").data([data]);

      // Update our width / height
      this.width = this.outerWidth - this.margin.left - this.margin.right;
      this.height = this.outerHeight - this.margin.top - this.margin.bottom;

      // create the skeletal chart
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "x-axis");
      gEnter.append("g").attr("class", "y-axis");
      gEnter.append("g").attr("class", "area");
      gEnter.append("g").attr("class", "lines");
      gEnter.append("g").attr("class", "grid");
      gEnter.append("g").attr("class", "circles");


      // Update the outer dimensions.
      svg.attr("width", this.outerWidth)
        .attr("height", this.outerHeight);

      // Update the inner dimensions.
      var g = svg.select("g")
        .attr('class','canvas')
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
      return g;
    };
    //Methods
    /*
     * Draw/update the X axis
     */
    lineChart.prototype.drawXAxis = function(g){
      var _this = this;
      g.select("g.x-axis")
        .transition()
        .duration(_this.transitionDuration)
        .attr("transform", "translate(0," + _this.yScale.range()[0] + ")")
        .call(_this.xAxis());
    };

    /*
     * Draw/update the Y axis
     */
    lineChart.prototype.drawYAxis = function(g){
      var _this = this;
      g.select("g.y-axis")
        .transition()
        .duration(_this.transitionDuration)
        .call(_this.yAxis());
    };

    /*
     * Draw/update the graph line
     */
    lineChart.prototype.line = function(g, data, svg){
      if(!data.length){
        return;
      }
      var _this = this;

      var line;

      line = g.selectAll('g.lines')
        .selectAll('path.line').data([data]);

      var lineEnter = line.enter().append('path')
        .attr('class','line line-color-1');

      lineEnter.transition()
        .duration(_this.transitionDuration)
        .attr("d", _this.lineFunc.call(_this));

      g.selectAll('g.lines').selectAll('text.label').data([data]).enter().append('text').attr('class','label label0')
        .attr("transform", "translate(" + 0 + "," + _this.yScale(data[0][1]) + ")").text(_this.label(0));
      line.exit().remove();
    };

    lineChart.prototype.addLine=function(selection,data){
      if(!data && !this.prevData){
        return;
      }
      if((data && !data.length) || (this.prevData && !this.prevData.length)){
        return;
      }
      if(!data){
        data = this.prevData;
      }
      this.prevData = data;
      var _this = this;
      var line;
      var values  = data.map(function(d, i) {
        return [_this.xValue.call(null, d, i), _this.yValue.call(null, d, i)];
      });
      var g = _this.drawSVG(selection, data);
      var svg = selection.selectAll("svg").data([data]);

      line = g.selectAll('g.lines').selectAll('path.line2').data([values]);
      var textEnter = g.selectAll('g.lines').selectAll('text.label2').data([values]);
      var lineEnter = line.enter().append('path')
        .attr('class','line2 line-color-2');

      lineEnter.transition()
        .duration(_this.transitionDuration)
        .attr("d", _this.lineFunc.call(_this));

      textEnter.enter().append('text').attr('class','label label1')
        .attr("transform", "translate(" + 0 + "," + _this.yScale(values[0][1]) + ")").text(_this.label(1));

      line.exit().remove();
      if(_this.drawMethods.indexOf('circles') >=0){
        _this.circles.call(_this,g,values, svg,1);
      }
    };

    /*
     * Draw circles over each data point that expand slightly on hover
     */
    lineChart.prototype.circles = function(g, data, svg, index) {
      var _this = this,
        circles;
      if(typeof index != 'number'){
        index = 0;
      }
      // Draw a circle at each data point to provide hover over
      // load chart.data
      circles = g.select(".circles")
        .selectAll('g.circleBlock'+index)
        .data([data]);

      circles.enter()
        .append('g')
        .attr('class','circleBlock'+index);

      circles.exit().remove();
      _this.drawCircles(circles,svg);

    };


    lineChart.prototype.drawCircles = function(circles,svg) {
      var _this = this;
      var circle = circles.selectAll('circle')
        .data(function(d){
          return d;
        });

      circle.enter().append("circle")
        .classed("data-circle", true)
        .attr("r", _this.mouseOverRadius)
        // Start circles in a flat line on the x-axis
        .attr("cx", function(d) { return _this.xScale(new Date(d[0])); })
        .attr("cy", function(d) { return _this.yScale(d[1]); })
        .on("mouseover", function(d, i) {
          var circle = this;

          // Animate the circle to expand on mouseover
          d3.select(circle)
            .transition()
            .duration(_this.transitionDuration / 3)
            .attr("r", _this.mouseOverRadius * 1.7);

          // publish a hoverEnter event
          _this.dispatch.circleHoverEnter(d, i, svg);
        })
        .on("mouseout", function(d, i) {

          var circle = this;

          d3.select(circle)
            .transition()
            .duration(_this.transitionDuration / 3)
            .attr("r", _this.mouseOverRadius);
          // publish a hoverLeave event

          _this.dispatch.circleHoverLeave(d, i, svg);
        });


      circle.exit().remove();
    };

    return {
      getChart:function(selection,config){
        var chartObj = new lineChart(selection,config);
        chartObj.setDrawMethods(config.drawMethods, chartObj);
        chartObj.dispatch = d3.dispatch("circleHoverEnter", "circleHoverLeave","lineHoverEnter","lineHoverLeave","line2HoverEnter","line2HoverLeave");
        return chartObj;
      },
      updateProps: function(dest, config){
        // set chart config to default config
        for (var c in dest){
          if(config.hasOwnProperty(c)){
            dest[c] = config[c];
          }
        }
      }

    };

  });
