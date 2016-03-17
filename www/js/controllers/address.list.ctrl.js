
angular.module('xgStore.controllers')

  .controller('addressListCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicLoading, xgUser, xgApi,$location, $ionicHistory, $ionicPopup) {

    $scope.userInfo = {};

    $scope.$on('$ionicView.beforeEnter', function(){
      $rootScope.showBtns.addressAdd = true;
      if ($rootScope.entry == 'address') {
        $rootScope.showBtns.returnMobile = true;
      }
      $scope.doRefresh();
    });

    $scope.$on('$ionicView.beforeLeave', function(){
      $rootScope.showBtns.addressAdd = false;
      if ($rootScope.entry == 'address') {
        $rootScope.showBtns.returnMobile = false;
      }
    });

    // 获取用户信息 并设置到 scope
    function setUserInfo() {
      xgApi.requestApi("/api/user/detail", {}).then(function (result) {
        $scope.userInfo = result;
      }).finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

    // 刷新数据
    $scope.doRefresh = function() {
      xgUser.getSessionId().then(function () {
        if ($rootScope.entry == 'address') {
          // 通知native关闭顶部bar
          Ponto.invoke("H5ToMobileRequest", "hideNativeNavBar", {}, null, null);
        }
        setUserInfo();
      });
    }

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
            $ionicLoading.show({template: '删除成功', noBackdrop: true, duration: 1000})
          })
        }
      });

    };

    //$location.path($ionicHistory.backView().url)
    $scope.chooseAddress = function(id){
      if($ionicHistory.backView() !== null && $ionicHistory.backView().stateName == 'orderCheck'){
        var historyParams = $ionicHistory.backView().stateParams;
        historyParams.defaultAddressId = id;
        $state.go('orderCheck', historyParams);
      }
    }
  });









