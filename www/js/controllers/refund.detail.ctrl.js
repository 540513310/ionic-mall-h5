angular.module('xgStore.controllers')
  .controller('refundDetailCtrl', function ($scope, $stateParams, $ionicLoading, $rootScope, xgApi, xgUser, $ionicPopup, $location) {

    $scope.order_id = $stateParams.order_id;
    $scope.goods_id = $stateParams.goods_id;
    $scope.product_id = $stateParams.product_id;
    $scope.order = {};
    $scope.order_goods = {};
    $scope.data = {};

    xgUser.getSessionId().then(function () {

      return xgApi.requestApi("/api/order/detail", {order_id : $scope.order_id});
    }).then(function (result) {

      $scope.order = result;
      angular.forEach(result.order_goods_list, function (order_goods) {
        if (order_goods.goods_id == $scope.goods_id && order_goods.product_id == $scope.product_id) {
          $scope.order_goods = order_goods;
          return;
        }
      })
      //console.log(result);
      //console.log($scope.order_goods);
      return xgApi.requestApi("/api/refund/detail", {
        order_id: $scope.order_id,
        goods_id: $scope.goods_id,
        product_id: $scope.product_id,
      });
    }).then(function (result) {

      //console.log(result);
      $scope.data = result;
      var origin_price = $scope.order_goods.real_price * $scope.order_goods.goods_nums;
      $scope.data.origin_price = origin_price.toFixed(2);
    });



  })