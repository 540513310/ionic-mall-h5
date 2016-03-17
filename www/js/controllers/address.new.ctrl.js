angular.module('xgStore.controllers')

  .controller('addressNewCtrl', function ($scope, $stateParams, $ionicLoading, $rootScope, $location,$timeout, xgApi, xgUser, $ionicModal) {

    // 获取用户信息
    xgApi.requestApi("/api/user/detail", {}).then(function (result) {
      $scope.userInfo = result;
    });

    $scope.popupChooseArea = function () {

      // 显示选择区域
      $ionicModal.fromTemplateUrl('templates/address/area.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.modal = modal;

        $timeout(function () {
          $scope.modal.show();
        }, 50);
      });
    }


  });









