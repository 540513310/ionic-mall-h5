angular.module('xgStore.controllers')

  .controller('mallConnectCtrl', function (xgApi, $scope, $sce, $stateParams) {
    xgApi.requestApi("/api/seller/home", {'seller_id': $stateParams.id})
      .then(function (result) {
        $scope.mall = result;
      })

    $scope.trustSrc = function(src){
      return $sce.trustAsResourceUrl(src);
    };
  });


