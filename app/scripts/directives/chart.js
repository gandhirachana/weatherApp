'use strict';

/**
 * @ngdoc directive
 * @name weatherAppApp.directive:chart
 * @description
 * # chart
 */
angular.module('weatherApp')
  .directive('lineChart',['chartService', 'tooltipService',function (chartService, tooltipService) {
    return {
      restrict: 'A',
      scope: {
        options: '=',
        data0:'=',
        data1:'='
      },
      controller:'chartCtrl',
      link: function postLink(scope, ele, attrs, chartCtrl) {
        var container = d3.select(ele[0]);
        var chart = chartService.getChart(container,scope.options);

        scope.$watch('data0', function(newVal, oldVal){
          if(newVal && newVal.length){
            var data0 = newVal[0];
            scope.$watch('data1', function(newVal, oldVal){
              if(newVal && newVal.length){
                chart.draw(data0,newVal[0],container,chart);
                chart.addLine(container,newVal[0]);
              }
            },true);
          }
        },true);

        var tooltipOptions = {
          headerFormat:'',
          bodyFormat:''

        };

        chart.dispatch.on('circleHoverEnter', function(d,i,svg){
          tooltipOptions.body = 'Date: ' + d[0] + '<br>' +
          'Value: ' + scope.options.valueFormat(d[1]);
          tooltipOptions.header = "";
          tooltipService.init(d,i,svg,tooltipOptions);
          tooltipService.show();
        });

        chart.dispatch.on('circleHoverLeave', function(){
          tooltipService.hide();
        });

        scope.$watch('options', function(newVal, oldVal){
          if(newVal){
            chartService.updateProps(chart, newVal);
            chart.setDrawMethods(scope.options.drawMethods,chart);
            chart.clearAll(container);
            chart.draw(null, null, container,chart);
            chart.addLine(container,null);
          }
        });
      }
    };
  }]);
