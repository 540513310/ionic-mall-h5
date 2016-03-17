
angular.module('xgStore.controllers')
  .controller('addressEditCtrl', function ($scope, $stateParams, $ionicLoading, $rootScope, $location, xgApi, xgUser) {
    $scope.id = $stateParams.id;
    $scope.address = {};
    $scope.province_list = [];
    $scope.city_list = [];
    $scope.area_list = [];

    $scope.$on('$ionicView.beforeEnter', function(){
      $rootScope.showBtns.addressSave = true;
    });

    $scope.$on('$ionicView.beforeLeave', function(){
      $rootScope.showBtns.addressSave = false;
    });

    // 取得区域信息
    $scope.getArea = function(parent_id, type, isUserAction) {

      xgApi.requestApi("/api/area/find", {parent_id: parent_id}).then(function (result) {
        if (type == 'province') {
          $scope.province_list = result;
          if (isUserAction) {
            $scope.city_list = [];
            $scope.area_list = [];
          }
        }
        if (type == 'city') {
          $scope.city_list = result;
          if (isUserAction) {
            $scope.area_list = [];
          }
        }
        if (type == 'area') {
          $scope.area_list = result;
        }
      });
    }

    // 获取用户信息
    xgApi.requestApi("/api/user/detail", {}).then(function (result) {

      $scope.userInfo = result;
      $scope.getArea(0, 'province', false);

      var address_list = $scope.userInfo.address_list;
      angular.forEach(address_list, function (obj) {
        if (obj.address_id == $scope.id) {
          $scope.address = obj;

          $scope.getArea($scope.address.province, 'city', false);
          $scope.getArea($scope.address.city, 'area', false);
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

  })
