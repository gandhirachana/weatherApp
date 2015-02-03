
/**
 * @ngdoc service
 * @name weatherApp.apiService
 * @description
 * # apiService
 * Service in the weatherApp.
 */
angular.module('weatherApp')
  .service('apiService', ['$http', function ($http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var APIKEY = '0ae374e41ae4e795d745d9ff42ad68a6';

    var cityId={
      NewYork:5128581,
      London:4298960
      //Fremont:5155207
    };
    var ApiUrl ={
      history:'http://api.openweathermap.org/data/2.5/history/city?id={id}&type=hour&start={start}&end={end}&APPID='+APIKEY,
      forecast:'http://api.openweathermap.org/data/2.5/forecast/daily?id={id}&APPID='+APIKEY
    };

    //private function
    function _isValidParameters(start, end){
      if(start && end){
        return end>=start;
      }
      return false;
    }


    this.getHistoryData = function(start, end){
      var promises = [];
      if(_isValidParameters(start, end)){
        angular.forEach(cityId, function(id, city){
          var url = ApiUrl.history.replace('{id}',id)
            .replace('{start}',start)
            .replace('{end}',end);
          var promise = $http.get(url);
          promises.push(promise);
        });

      }
      return promises;

    };

    this.getForecastData = function(){
      var promises = [];
      angular.forEach(cityId, function(id, city){
          var url = ApiUrl.forecast.replace('{id}',id);
          var promise = $http.get(url);
          promises.push(promise);
      });

      return promises;

    };
  }]);
