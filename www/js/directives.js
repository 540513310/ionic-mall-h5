angular.module('xgStore.directives', [])
  .directive('tabs', function ($ionicScrollDelegate) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: ["$scope","$ionicScrollDelegate", function ($scope,$ionicScrollDelegate) {
        var panes = $scope.panes = [];

        $scope.select = function (pane,init) {
          angular.forEach(panes, function (pane) {
            pane.selected = false;
          });
          pane.selected = true;
          //if(init){
          //  $ionicScrollDelegate.scrollTo(0,angular.element(document.querySelector('.nav-tabs'))[0].offsetTop-66,true);
          //  return;
          //}
          //$ionicScrollDelegate.scrollTo(0,angular.element(document.querySelector('.nav-tabs'))[0].offsetTop-9,true);
        }

        this.addPane = function (pane) {
          if (panes.length == 0) $scope.select(pane,true);
          panes.push(pane);
        }
        $ionicScrollDelegate.resize();
      }],
      template: '<div class="tab-able ">' +
      '<ul class="nav nav-tabs item">' +
      '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">' +
      '<a href="" ng-click="select(pane)">{{pane.title}}</a>' +
      '</li>' +
      '</ul>' +
      '<div class="tab-content" ng-transclude></div>' +
      '</div>',
      replace: true
    };
  })

  .directive('pane', function () {
    return {
      require: '^tabs',
      restrict: 'E',
      transclude: true,
      scope: {title: '@'},
      link: function (scope, element, attrs, tabsCtrl) {
        tabsCtrl.addPane(scope);
      },
      template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
      '</div>',
      replace: true
    };
  })

  .filter('reverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  })

  .filter('range', function() {
    return function(label, total) {
      total = parseInt(total);
      for (var i=0; i<total; i++)
        label.push(i);
      return label;
    };
  });



