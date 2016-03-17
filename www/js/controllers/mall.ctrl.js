angular.module('xgStore.controllers')

  .controller('mallCtrl', function (xgApi, $scope, $rootScope, $stateParams) {

    xgApi.requestApi("/api/seller/home", {'seller_id': $stateParams.id})
      .then(function (result) {
        $scope.mall = result;
        console.log(result)
      })
  });


