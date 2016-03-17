
angular.module('xgStore.controllers')

  .controller('addressListCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicLoading, xgUser, xgApi,$location, $ionicHistory) {

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

      xgUser.getSessionId().then(function () {
        return xgApi.requestApi("/api/address/delete", {address_id : id});
      }).then(function(result) {
        $scope.userInfo = result;
        $ionicLoading.show({template: '删除成功', noBackdrop: true, duration: 1000})
      })
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









