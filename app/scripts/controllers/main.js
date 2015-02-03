'use strict';

/**
 * @ngdoc function
 * @name weatherApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the weatherApp
 */
angular.module('weatherApp')
  .controller('MainCtrl', ['$rootScope','apiService', '$timeout', function ($scope, apiService, timeout) {
    //boolean to define whether to get data from api or use local data
    var getfromBackend = false;
    $scope.data0 = [];
    $scope.data1 = [];
    $scope.forecastData0 = [];
    $scope.forecastData1 = [];

    var getFromFile = function(fileName,callback){
      $.ajax({
        dataType: "json",
        url: fileName,
        success: function(data){
          if(typeof callback == 'function'){
            callback(data);
          }
        }
      });
    };
    var successCallback = function(data,dataIndex){
      if(data.list){
        $scope[dataIndex].push(data.list);
        $scope.$digest();
      }
    };

    var getData = function(start, end){
      if(getfromBackend){
        var historyPromises = apiService.getHistoryData(start,end);
        var forecastPromises = apiService.getForecastData();
        angular.forEach(historyPromises, function(httpPromise,i){
          var dataIndex = "data"+i;
          $scope[dataIndex] = [];
          httpPromise.success(function(data,status){
            if(status == 200){
              if(data.list){
                $scope[dataIndex].push(data.list);


              }
            }
          }).error(function(data, status){
            console.log("Error calling API: " + status);
          });
        });
        angular.forEach(forecastPromises, function(httpPromise,i){
          var dataIndex = "forecastData"+i;
          $scope[dataIndex] = [];
          httpPromise.success(function(data,status){
            if(status == 200){
              if(data.list){
                $scope[dataIndex].push(data.list);

              }
            }
          }).error(function(data, status){
            console.log("Error calling API: " + status);
          });
        });

      }else{
        getFromFile('../data/data.json',function(data){successCallback(data,'data0');});
        getFromFile('../data/data2.json',function(data){successCallback(data,'data1');});
        getFromFile('../data/forecastData.json',function(data){successCallback(data,'forecastData0');});
        getFromFile('../data/forecastData2.json',function(data){successCallback(data,'forecastData1');});

      }
    };
    $scope.active = function(index){
      return $scope.activeKpi == index;
    }
    var endTime = moment.utc().format("YYYY-MM-DD HH:mm");
    var startTime = moment.utc().subtract(15,'hours').format("YYYY-MM-DD HH:mm");
    $scope.startDate = startTime;
    $scope.endDate = endTime;

    $scope.$on('dateChange',function(event, difference, start,end){
      $scope.startDate = start;
      $scope.endDate = end;
      getData(start.utc().unix(), end.utc().unix());
    });

    $scope.activateKpi = function(kpiIndex){
      $scope.activeKpi = kpiIndex;
      //work around until defaults are fixed in mm-chart
      //TODO Fix default configs in mm-chart
      $scope.lineChartOptions = $scope.kpiConfigs[kpiIndex].lineChartOptions || {config:{}};
      $scope.forecastOptions = $scope.kpiConfigs[kpiIndex].foreCastOptions|| {config:{}};

    };

    $scope.kpiConfigs = [
      {
        title:"Temperature",
        lineChartOptions: {
          width: 800,
          drawMethods: {
            drawXAxis: true,
            drawYAxis: true,
            area: false,
            line: true,
            verticalLines: false,
            circles: true
          },
          xValue: function (d) {
            if (d) {
              return moment.unix(d.dt).format('YYYY-MM-DD HH:mm');
            }
          },
          yValue: function (d) {
            if (d) {
              return d.main.temp;
            }

          },
          valueFormat: function (d) {
            return d + "\xB0" + " K"
          }
        },
        foreCastOptions:{

            width: 800,
            drawMethods: {
              drawXAxis: true,
              drawYAxis: true,
              area: false,
              line: true,
              verticalLines: false,
              circles: true
            },
            xValue: function (d) {
              if (d) {
                return moment.unix(d.dt).format('YYYY-MM-DD HH:mm');
              }
            },
            yValue: function (d) {
              if (d) {
                return d.temp.day;
              }

            },
            valueFormat: function (d) {
              return d + "\xB0" + " K"
            }

        }
      },
      {
        title:"Humidity",
        lineChartOptions: {
          width: 800,
          drawMethods: {
            drawXAxis: true,
            drawYAxis: true,
            area: false,
            line: true,
            verticalLines: false,
            circles: true
          },
          xValue: function (d) {
            if (d) {
              return moment.unix(d.dt).format('YYYY-MM-DD HH:mm');
            }
          },
          yValue: function (d) {
            if (d) {
              return d.main.humidity;
            }

          },
          valueFormat: function (d) {
            return d + "%";
          }
        },
        foreCastOptions:{

          width: 800,
          drawMethods: {
            drawXAxis: true,
            drawYAxis: true,
            area: false,
            line: true,
            verticalLines: false,
            circles: true
          },
          xValue: function (d) {
            if (d) {
              return moment.unix(d.dt).format('YYYY-MM-DD HH:mm');
            }
          },
          yValue: function (d) {
            if(d) {
              return d.humidity;
            }
          },
          valueFormat: function (d) {
            return d+ "%";
          }

        }
      },

      {
        title:"Wind",
        lineChartOptions: {
          width: 800,
          drawMethods: {
            drawXAxis: true,
            drawYAxis: true,
            area: false,
            line: true,
            verticalLines: false,
            circles: true
          },
          xValue: function (d) {
            if (d) {
              return moment.unix(d.dt).format('YYYY-MM-DD HH:mm');
            }
          },
          yValue: function (d) {
            if (d) {
              return d.wind.speed;
            }

          },
          valueFormat: function (d) {
            return d + "mps";
          }
        },
        foreCastOptions:{

          width: 800,
          drawMethods: {
            drawXAxis: true,
            drawYAxis: true,
            area: false,
            line: true,
            verticalLines: false,
            circles: true
          },
          xValue: function (d) {
            if (d) {
              return moment.unix(d.dt).format('YYYY-MM-DD HH:mm');
            }
          },
          yValue: function (d) {
            if (d) {
              return d.speed;
            }

          },
          valueFormat: function (d) {
            return d+ "mps";
          }

        }
      },
      {
        title:"Pressure",
        lineChartOptions: {
          width: 800,
          drawMethods: {
            drawXAxis: true,
            drawYAxis: true,
            area: false,
            line: true,
            verticalLines: false,
            circles: true
          },
          xValue: function (d) {
            if (d) {
              return moment.unix(d.dt).format('YYYY-MM-DD HH:mm');
            }
          },
          yValue: function (d) {
            if (d) {
              return d.main.pressure;
            }

          },
          valueFormat: function (d) {
            return d + "hPa";
          }
        },
        foreCastOptions:{

          width: 800,
          drawMethods: {
            drawXAxis: true,
            drawYAxis: true,
            area: false,
            line: true,
            verticalLines: false,
            circles: true
          },
          xValue: function (d) {
            if (d) {
              return moment.unix(d.dt).format('YYYY-MM-DD HH:mm');
            }
          },
          yValue: function (d) {
            if (d) {
              return d.pressure;
            }

          },
          valueFormat: function (d) {
            return d + "hPa";
          }

        }
      }
    ];
    $scope.activateKpi(0);

  }]);
