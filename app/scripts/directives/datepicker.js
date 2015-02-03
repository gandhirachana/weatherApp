'use strict';

/**
 * @ngdoc directive
 * @name weatherAppApp.directive:datepicker
 * @description
 * # datepicker
 */
angular.module('weatherApp')
  .directive('datepicker', function () {
    return {
      templateUrl:'scripts/templates/datepicker.tpl.html',
      restrict: 'A',
      replace:true,
      scope:{
        startDate:'=',
        endDate:'='
      },
      link: function postLink(scope, ele, attrs) {

        var ranges = {
          'Today': [moment(), moment()],
          'Yesterday': [moment().subtract('days', 1), moment().subtract('days', 1)],
          'Last 3 Days': [moment().subtract('days', 3), moment().subtract('days', 1)],
          'Last 7 Days': [moment().subtract('days', 7), moment().subtract('days', 1)],
          'Last 30 Days': [moment().subtract('days', 30), moment().subtract('days', 1)],
          'Month To Date': [moment().startOf('month'), moment().subtract('days', 1)],
          'Previous Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
        };

        var defaultRange = ranges["Last 7 Days"];


        if(scope.startDate && scope.endDate){
          defaultRange = [moment(scope.startDate,"YYYY-MM-DD HH:mm"),moment(scope.endDate,"YYYY-MM-DD HH:mm")];
        }
        var callback = function(start, end, apply) {
          if(typeof apply == 'undefined'){
            apply = true;
          }
          $(ele).find('span').html(start.format('MMM D, YYYY') + ' - ' + end.format('MMM D, YYYY'));
          var difference = end.diff(start,'days')+1;
          scope.$emit('dateChange',difference,start,end);
          if(apply){
            scope.$apply();
          }
        };

        $(ele).find('span').html(defaultRange[0].format('MMM D, YYYY') + ' - ' + defaultRange[1].format('MMM D, YYYY'));
        callback(defaultRange[0], defaultRange[1], false);

        $(ele).daterangepicker(
          {
            ranges: ranges,
            startDate: defaultRange[0],
            endDate:  defaultRange[1],
            timePicker: false,
            timePickerIncrement: 1,
            timePicker12Hour: true,
            opens:"left",
            showDropdowns:false,
            buttonClasses: ['btn btn-default'],
            applyClass: 'btn-small btn-primary',
            cancelClass: 'btn-small',
            format: 'MM/DD/YYYY',
            separator: ' to '
          },callback);

        var updateStartDate = function () {
          var startDate = $(this).val();
          $(ele).data('daterangepicker').setStartDate(startDate);

        };
        var updateEndDate= function () {
          var endDate = $(this).val();
          $(ele).data('daterangepicker').setEndDate(endDate);

        };

        $(ele).on("show.daterangepicker", function(ev, picker){
          //hide the Month to Date option if today is 1st of any month
          if(moment().format("DD") == '01'){
            $('.ranges li:contains("Month To Date")').hide();
          }else{
            $('.ranges li:contains("Month To Date")').show();
          }

          // If custom range is set to false, hide it
          if(attrs.hasOwnProperty("customrange")) {
            if(attrs.customrange === "false") {
              var customRangeElement = $(picker.container).find("div.ranges ul li")
                .filter(function(){
                  return $(this).html().toLowerCase().indexOf("custom range") >= 0;
                });
              if(customRangeElement.length == 1) {
                customRangeElement.css('display', 'none');
              }
            }
          }

          var startInput = $(picker.container).find('input[name=daterangepicker_start]');
          var endInput = $(picker.container).find('input[name=daterangepicker_end]');

          if(startInput.attr('disabled')){
            startInput.removeAttr("disabled");
          }

          if(endInput.attr('disabled')){
            endInput.removeAttr("disabled");
          }

          startInput.off('change').on("change",updateStartDate);
          endInput.off('change').on("change",updateEndDate);
          // Let the others know the date range popup has appeared
          scope.$emit("show.daterange-popup");
        });

      }
    };
  });
