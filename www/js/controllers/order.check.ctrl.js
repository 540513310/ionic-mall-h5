/**
 * 地址控制器, 编辑,添加,列表
 * Created by william on 15/8/6.
 */

angular.module('xgStore.controllers')

  .controller('orderCheckCtrl', function ($scope, $rootScope, $location, $state, $stateParams, $ionicModal, xgApi, xgCart, xgAddress) {
    $location.search('entry', null);
    $scope.xgCart = xgCart;
    $scope.xgAddress = xgAddress;
    $scope.postscript = {};

    $scope.$on('$ionicView.beforeEnter', function () {
      $scope.paymentState = true;

      var orderCheckParams = {
        'goods_id_list': $stateParams.goodsIdList,
        'product_id_list': $stateParams.productIdList,
        'quantity_list': $stateParams.quantityList
      };

      xgApi.requestApi("/api/order/check", orderCheckParams)
        .then(function (result) {
          $scope.orderCheck = result;
          $scope.CartStructure = result.cart_structure;
          $scope.payAmount = getPayAmount();
          xgCart.init($scope.CartStructure);
          xgAddress.init($scope.orderCheck.address_list);
        })
        .then(function () {
          $scope.defaultAddress = xgAddress.getDefault($stateParams.defaultAddressId);
        });
    });


    $scope.pay = {
      method: 100001
    };

    $ionicModal.fromTemplateUrl('templates/address/check.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.addressModal = modal;
    });

    $scope.getAddress = function(){
      //$state.go('addressList');
      $rootScope.modelGroup.push($scope.addressModal);
      $scope.addressModal.show();
    };

    $scope.closeAddress = function(){
      $rootScope.modelGroup.pop();
      $scope.addressModal.hide();
    };
    $scope.closeNewAddress = function(){
      $rootScope.modelGroup.pop();
      $scope.addressNewModal.hide();
    };

    $ionicModal.fromTemplateUrl('templates/address/new.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.addressNewModal = modal;
    });

    $scope.newAddress = function(id){
      $scope.address = xgAddress.edit(id);
      $scope.addressNewModal.show();
      $rootScope.modelGroup.push($scope.addressNewModal);
    };

    $scope.chooseAddress = function(id){
      $scope.defaultAddress = xgAddress.getDefault(id);
      $scope.closeAddress();
    }

    $scope.defaultChooseAddress = function(id){
      $scope.defaultAddress = xgAddress.getDefault(id);
    }

    var getPayAmount = function () {
      var total = 0;


      var orderValidCheckParams = {
        goods_id_list : [],
        product_id_list : [],
        quantity_list : []
      }

      angular.forEach($scope.CartStructure, function (v, k) {
        var storeTotal = 0;
        angular.forEach(v, function (m, n) {
          if (m.is_valid) {
            storeTotal += m.goods.sell_price * m.cart.quantity;

            orderValidCheckParams.goods_id_list.push(m.cart.goods_id);
            orderValidCheckParams.product_id_list.push(m.cart.product_id);
            orderValidCheckParams.quantity_list.push(m.cart.quantity);
          }
        });
        total += storeTotal;
      });


      $scope.paymentState = total == 0 ? true : false;
      orderValidCheckParams.goods_id_list = orderValidCheckParams.goods_id_list.join(',');
      orderValidCheckParams.product_id_list = orderValidCheckParams.product_id_list.join(',');
      orderValidCheckParams.quantity_list = orderValidCheckParams.quantity_list.join(',');
      $scope.orderValidCheckParams = orderValidCheckParams;


      return total.toFixed(2);
    };

    $scope.payment = function () {
      $scope.paymentState = true;

      var paymentParams = $scope.orderValidCheckParams;
      paymentParams.address_id = $scope.defaultAddress.address_id;
      paymentParams.pay_type = $scope.pay.method;
      paymentParams.postscript = $scope.postscript;

      if (paymentParams.address_id == 0) {
        $scope.showAlert('请填写收货地址', 1000);
        $scope.paymentState = false;
        return;
      }

      //提交订单
      xgApi.requestApi('/api/order/submit', paymentParams)
        .then(function (result) {
          Ponto.invoke("H5ToMobileRequest", "payment", result, null, null);
        })
    };

    $scope.gotoProductDetail = function (id) {
      if ($rootScope.sdk >= 19) {
        $state.go('product', {id: id});
      } else {
        $state.go('product4', {id: id});
      }
    }

  });