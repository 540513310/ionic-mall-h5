
angular.module('xgStore.controllers')
  .controller('deliveryTraceCtrl', function ($scope, $stateParams, $ionicLoading, $rootScope, $location, xgApi, xgUser) {
    $scope.order_id = $stateParams.id;

    // 获取用户信息, 取得数据
    xgUser.getSessionId().then(function () {
      return xgApi.requestApi("/api/delivery/trace", {order_id: $scope.order_id});
    }).then(function (result) {
      $scope.data = result;
    });

  })
