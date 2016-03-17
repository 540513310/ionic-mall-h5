
angular.module('xgStore.controllers')

  .controller('addressCheckCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicLoading, xgUser, xgApi, $timeout, xgAddress, $ionicHistory, $ionicPopup) {

    xgApi.requestApi("/api/user/detail", {}).then(function (result) {
      $scope.userInfo = result;
    });

    // 修改默认收货地址
    $scope.setDefault = function(id) {

      xgUser.getSessionId().then(function () {
        var address_list = $scope.userInfo.address_list;
        var address = {};
        angular.forEach(address_list, function (obj) {
          if (obj.address_id == id) {
            address = obj;
          }
        });
        address.default = 1;
        return xgApi.requestApi("/api/address/edit", address);
      }).then(function (result) {
        $scope.userInfo = result;
        $ionicLoading.show({ template: '设置成功', noBackdrop: true, duration: 1000 })
      });
    }


    // 删除收货地址
    $scope.deleteAddress = function (id) {


      var deleteAddressPopup = $ionicPopup.confirm({
        title: '删除收货地址',
        cssClass: 'remove-order-popup',
        subTitle: '确认删除该收货地址？',
        cancelText: '取消',
        cancelType: 'button button-outline button-dark',
        okText: '确定',
        okType: 'button button-outline button-positive',
      });

      deleteAddressPopup.then(function (res) {
        if (res == true) {
          xgUser.getSessionId().then(function () {
            return xgApi.requestApi("/api/address/delete", {address_id : id});
          }).then(function(result) {
            $scope.userInfo = result;
            if ($scope.userInfo.address_list.length <= 0 ) {
              $scope.defaultAddress.address_id = 0;
            }
            $ionicLoading.show({template: '删除成功', noBackdrop: true, duration: 1000})
          })

        }
      });

    };

    // 保存地址
    $rootScope.addressSave = function () {

      xgUser.getSessionId().then(function () {
        var address = $scope.address;
        address.default = address.default == true ? 1 : 0;
        return xgApi.requestApi("/api/address/edit", address);
      }).then(function (result) {
        $scope.userInfo.address_list = result.address_list;
        xgAddress.init(result.address_list);
        // 只有一条时候默认选择这条
        if (result.address_list.length == 1) {
          $scope.defaultChooseAddress(result.address_list.address_id);
        }
        $ionicLoading.show({template: '保存成功', noBackdrop: true, duration: 1000})
        $timeout($scope.closeNewAddress(),1500);
      }, function (message) {
        $ionicLoading.show({template: message, noBackdrop: true, duration: 1000})
      });
    }

    //$location.path($ionicHistory.backView().url)
  });









