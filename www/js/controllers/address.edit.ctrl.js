
angular.module('xgStore.controllers')
  .controller('addressEditCtrl', function ($scope, $stateParams, $ionicLoading, $rootScope, $location, xgApi, xgUser, $ionicModal, $timeout) {
    $scope.id = $stateParams.id;
    $scope.address = {};

    $scope.$on('$ionicView.beforeEnter', function(){
      $rootScope.showBtns.addressSave = true;
    });

    $scope.$on('$ionicView.beforeLeave', function(){
      $rootScope.showBtns.addressSave = false;
    });

    // 获取用户信息
    xgApi.requestApi("/api/user/detail", {}).then(function (result) {

      $scope.userInfo = result;

      var address_list = $scope.userInfo.address_list;
      angular.forEach(address_list, function (obj) {
        if (obj.address_id == $scope.id) {
          $scope.address = obj;
          $scope.address.default = $scope.address.default == 1 ? true : false;
        }
      });
    });

    // 保存地址
    $rootScope.addressSave = function() {

      xgUser.getSessionId().then(function () {
        var address = $scope.address;
        address.default = address.default == true ? 1 : 0;
        return xgApi.requestApi("/api/address/edit", address);
      }).then(function (result) {
        $ionicLoading.show({ template: '保存成功', noBackdrop: true, duration: 1000 })
        $location.path('/address/list');
      }, function (message) {
        $ionicLoading.show({ template: message, noBackdrop: true, duration: 1000 })
      });
    }

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


  })
