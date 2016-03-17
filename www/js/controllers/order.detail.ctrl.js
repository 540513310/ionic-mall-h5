angular.module('xgStore.controllers')

  .controller('orderDetailCtrl', function ($scope, $http, $stateParams, $rootScope, $ionicLoading, $location, xgUser, xgApi, $ionicPopup) {

    $scope.order_id = $stateParams.id;
    $scope.order = {};
    $scope.order.lastDelivery = "";

    $scope.$on('$ionicView.beforeEnter', function(){
      $scope.doRefresh();
    });

    // 刷新数据
    $scope.doRefresh = function() {

      xgUser.getSessionId().then(function () {

        return xgApi.requestApi("/api/order/detail", {order_id: $scope.order_id});
      }).then(function (result) {
        result.total_goods_price = 0;
        angular.forEach(result.order_goods_list, function (goods) {
          goods.goods_array = angular.fromJson(goods.goods_array);
          result.total_goods_price += goods.real_price * goods.goods_nums;
        });
        $scope.order = result;

        return xgApi.requestApi("/api/delivery/trace", {order_id: $scope.order_id});
      }).then(function (result) {

        if (result.length != 0) {
          $scope.order.lastDelivery = result[0].traces[result[0].traces.length - 1];
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });

    }

    $scope.returnMobile = function () {
      $rootScope.returnMobile();
    }

  })
