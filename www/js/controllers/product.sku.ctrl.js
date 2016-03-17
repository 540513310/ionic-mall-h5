angular.module('xgStore.controllers')

  .controller('skuCtrl', function ($scope, $rootScope, $http, $stateParams, $ionicPopover, $location, $analytics, xgApi, xgAddress, xgUser) {

    $scope.xgAddress = xgAddress;

    $scope.item = {
      quantity: 1,
      id: 0,
      goods_id: $stateParams.id,
      product_id: 0
    };

    $scope.addItem = function (quantity) {
      $scope.item.quantity = parseInt($scope.item.quantity) + quantity;
    };

    // sku选择成功回调
    $scope.setCurrentProductInfo = function(currentSku,key){
      $scope.item.product_id = 0;
      // 修改产品图片
      angular.forEach($scope.specImgMap,function(v,k){
        if(key == k){
          $scope.productCurrentImg = v;
          $scope.item.currentImg = v;
        }
      });

      if(currentSku){ // 定位产品sku成功时
        $scope.productSelected = currentSku;
        $scope.item.product_id = currentSku.product_id;
        $scope.productInfo.current_price = currentSku.sell_price;
        $scope.productInfo.current_store_nums = currentSku.store_nums;
      }else{ // 定位产品sku失败
        $scope.item.product_id = 0;
      }
    };

    // 立即添加到购物车
    $scope.addToCart = function (cartId, goods_id) {
      if ($scope.multiple && $scope.item.product_id == 0) {
        $scope.showAlert('请选择产品属性', 1000);
        return;
      }
      if (isNaN($scope.item.quantity)) {
        $scope.showAlert('请输入有效的数量', 1000);
        return;
      }
      if ($scope.item.quantity <= 0) {
        $scope.showAlert('请选择商品数量', 1000);
        return;
      }
      if ($scope.item.quantity > $scope.productInfo.current_store_nums) {
        $scope.showAlert('库存不足', 1000);
        return;
      }
      cartId ? $scope.item.id = cartId : '';
      goods_id ? $scope.item.goods_id = goods_id : '';

      xgUser.getSessionId().then(function () {
        $analytics.eventTrack('product', {category: 'addToCart', label: 'addToCart2:'+$scope.item.goods_id });
        return xgApi.requestApi('api/cart/edit', $scope.item);
      }).then(function (result) {
        // 清空点击步骤
        //$scope.step.length > 0 ? $scope.step = [] : '';

        $scope.productInfo.cart_count = result.cart_count;
        cartId ? $scope.cartChange($scope.item) : $scope.showAlert('添加成功', 1000);
        $scope.closeSku();

      }, function (msg) {
        $scope.showAlert(msg, 1000);
      })
    };

    // 立即购买
    $scope.goCheckNow = function () {
      var defaultAddressId = 0;
      if ($scope.multiple && $scope.item.product_id == 0) {
        $scope.showAlert('请选择产品属性', 1000);
        return;
      }
      if (isNaN($scope.item.quantity)) {
        $scope.showAlert('请输入有效的数量', 1000);
        return;
      }
      if ($scope.item.quantity <= 0) {
        $scope.showAlert('请选择商品数量', 1000);
        return;
      }
      if ($scope.item.quantity > $scope.productInfo.current_store_nums) {
        $scope.showAlert('库存不足', 1000);
        return;
      }
      xgUser.getSessionId().then(function () {
        return xgApi.requestApi("/api/user/detail", {});
      }).then(function (result) {
        //window._hmt.push(['_trackEvent', 'product', 'buyNow', 'buyNow:'+$scope.item.goods_id]);
        $analytics.eventTrack('product', {category: 'buyNow', label: 'buyNow2:'+$scope.item.goods_id});
        xgAddress.init(result.address_list);
      }).then(function () {
        $scope.closeSku();
        defaultAddressId = xgAddress.getDefault().address_id || 0;
        $location.path('/order/check/' + $scope.item.goods_id + '/' + $scope.item.product_id + '/' + $scope.item.quantity + '/' + defaultAddressId);
      })
    };

  })

