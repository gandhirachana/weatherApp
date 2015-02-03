'use strict';

/**
 * @ngdoc service
 * @name weatherApp.tooltipService
 * @description
 * # tooltipService
 * Service in the weatherAppApp.
 */
angular.module('weatherApp')
  .service('tooltipService', ['$filter', function ($filter) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var tooltip, tooltipdiv;

    return {
      init: function(d,i,svg,options){
        if(!tooltip){
          tooltip = d3.tip().attr('class', 'd3-tip');

          // register some getter/setter for tooltip object
          // when initial the tooltip
          tooltip.bgcolor=function(_){
            tooltipdiv.css("background-color",_);
            return tooltip;
          };

          tooltip.css = function(selector, val){
            if(!arguments[1]) return tooltipdiv.css(selector);
            tooltipdiv.css(selector,val);
            return tooltip;
          };

          tooltip.appendCls=function(_){
            tooltipdiv.addClass(_);
            return tooltip;

          };


        }

        function clearTooltipDiv(tooltipdiv){
          tooltipdiv.removeClass("n s e w ne nw se sw");
        };

        // tooltip default options
        var defaultSetting = {
          metric: "",
          headerFormat: "",
          bodyFormat: "number",
          header: d[0] || d,
          body: d.length>1 ? d[1]:d
        }

        // load default settings to tooltip object
        for (var ds in defaultSetting){
          tooltip[ds] = defaultSetting[ds];
        }

        // overwrite the default settings using
        // user specified options
        if(options){
          for (var key in defaultSetting){
            if(options.hasOwnProperty(key)){
              tooltip[key] = options[key];
              if(typeof options[key] === 'function'){
                tooltip[key] =  options[key].call(null, d);
              }
            }
          }
        }

        if(!tooltipdiv)  tooltipdiv = angular.element(document.querySelector('.d3-tip'));

        clearTooltipDiv(tooltipdiv);
        svg.call(tooltip);

        return tooltip;
      },

      show:function(customDirection){
        if(!customDirection){
          var tooltipWidth = tooltipdiv.offsetWidth || 150;
          var tooltipHeight = tooltipdiv.offsetHeight || 150;

          // get bbox to get the exact size of the svg element
          var bbox = tooltip.getbBox();
          if(bbox.e.x < tooltipWidth){
            tooltip.direction('e').offset([0,10]);
          }

          else if((screen.width - bbox.e.x) < tooltipWidth){
            tooltip.direction('w').offset([0,-10]);
          }

          else if (bbox.n.y < tooltipHeight) {

            tooltip.direction('s').offset([10,0]);
          }

          else {
            tooltip.direction('n').offset([-10,0]);
          }
        }
        var headerFormat = tooltip.headerFormat.replace(/\s/g,"").split(":") || "";
        var bodyFormat = tooltip.bodyFormat.replace(/\s/g,"").split(":") || "";

        var header = tooltip.header, body = tooltip.body;
        if (headerFormat[0]){
          if(headerFormat[1]) header = $filter(headerFormat[0])(tooltip.header, headerFormat[1])
          else {
            header = $filter(headerFormat[0])(tooltip.header);
          }
        };

        if(bodyFormat[0]){
          if(bodyFormat[1]) body = $filter(bodyFormat[0])(tooltip.body, bodyFormat[1])
          else {
            body = $filter(bodyFormat[0])(tooltip.body)
          }
        }

        var content =  "<div class='graph-tooltip'>"
          + "<div class='graph-label'>"
          + header + "</div>"
          + "<div class='graph-number'>"
          + body + " " + tooltip.metric;
        + "</div>"
        + "</div>";
        tooltip.html(content);
        tooltip.show();
      },

      hide:function(){
        if(tooltip){
          tooltip.hide();
        }
      }

    }
  }]);
