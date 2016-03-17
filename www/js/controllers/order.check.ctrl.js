/**
 * 地址控制器, 编辑,添加,列表
 * Created by william on 15/8/6.
 */

angular.module('xgStore.controllers')

  .controller('orderCheckCtrl', function ($scope, $location, $state, $stateParams, xgApi, xgCart, xgAddress) {
    $location.search('entry', null);
    $scope.xgCart = xgCart;
    $scope.address = xgAddress;
    $scope.postscript = {};

    var orderCheckParams = {
      'goods_id_list': $stateParams.goodsIdList,
      'product_id_list': $stateParams.productIdList,
      'quantity_list': $stateParams.quantityList
    };
    console.log(orderCheckParams)
    xgApi.requestApi("/api/order/check", orderCheckParams)
      .then(function (result) {
        $scope.orderCheck = result;
        $scope.CartStructure = result.cart_structure;
        console.log(result);
        xgCart.init($scope.CartStructure);
        xgAddress.init($scope.orderCheck.address_list);
      })
      .then(function () {
        $scope.defaultAddress = xgAddress.getDefault($stateParams.defaultAddressId);
      });

    $scope.pay = {
      method: 100001
    };

    $scope.getAddress = function(){
      $state.go('addressList',{},{relative:'^'});
    }

    $scope.getPayAmount = function () {
      var total = 0;
      angular.forEach($scope.CartStructure, function (v, k) {
        var storeTotal = 0;
        angular.forEach(v, function (m, n) {
          storeTotal += m.goods.sell_price * m.cart.quantity;
        });
        total += storeTotal;
      })

      return total.toFixed(2);
    };

    $scope.payment = function () {
      var paymentParams = orderCheckParams;
      paymentParams.address_id = $stateParams.defaultAddressId;
      paymentParams.pay_type = $scope.pay.method;
      paymentParams.postscript = $scope.postscript;

      if (paymentParams.address_id == 0) {
        $scope.showAlert('请填写收货地址', 1000);
        return;
      }

      //提交订单
      xgApi.requestApi('/api/order/submit', paymentParams)
        .then(function (result) {
          Ponto.invoke("H5ToMobileRequest", "payment", result, null, null);
        })
    };

  });