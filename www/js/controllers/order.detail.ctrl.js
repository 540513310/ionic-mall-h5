angular.module('xgStore.controllers')

  .controller('orderDetailCtrl', function ($scope, $http, $stateParams, $rootScope, $ionicLoading, $location, xgUser, xgApi, $ionicPopup, $state) {

    $scope.order_id = $stateParams.id;
    $scope.order = {};
    $scope.order.lastDelivery = "";

    $scope.$on('$ionicView.beforeEnter', function(){
      $scope.doRefresh();
    });

    // 刷新数据
    $scope.doRefresh = function() {

      xgUser.getSessionId().then(function () {

        return xgApi.requestApi("/api/order/detail", {order_id: $scope.order_id});
      }).then(function (result) {
        console.log(result);
        result.total_goods_price = 0;
        // 是否是团购订单
        if(result.regiment && result.regiment.store_nums){
          result.regiment.success = parseInt(result.regiment.store_nums,10) > parseInt(result.regiment.sum_count,10) ? false : true;
        }
        angular.forEach(result.order_goods_list, function (goods) {
          goods.goods_array = angular.fromJson(goods.goods_array);
          result.total_goods_price += goods.real_price * goods.goods_nums;
        });
        $scope.order = result;

        // 判断是否是团购，获取分享信息
        if(result.regiment){
          $scope.productInfo = $scope.order.order_goods_list[0];
        }

        if ($scope.order.pay_status == 0 && $scope.order.status == 1) {
          $scope.displayPayBtn = true;
        } else {
          $scope.displayPayBtn = false;
        }

        return xgApi.requestApi("/api/delivery/trace", {order_id: $scope.order_id});
      }).then(function (result) {

        if (result.length != 0) {
          $scope.order.lastDelivery = result[0].traces[result[0].traces.length - 1];
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });

    }

    $scope.returnMobile = function () {
      $rootScope.returnMobile();
    }

    $scope.gotoProductDetail = function (id) {
      if ($rootScope.sdk >= 19) {
        $state.go('product', {id: id});
      } else {
        $state.go('product4', {id: id});
      }
    }

    $scope.gotoPayment = function (order_id) {
      xgApi.requestApi("/api/order/clickPay", {order_id: order_id, pay_type: 100001})
        .then(function (result) {
          Ponto.invoke("H5ToMobileRequest", "payment", result, null, null);
        }, function (message) {
          $ionicLoading.show({template: message, noBackdrop: true, duration: 1000})
        });
    }

    $scope.gotoRefundApply = function (order_id, goods_id, $event) {
      $state.go('refundApply', {order_id: order_id, order_goods_id: goods_id});
      $event.stopPropagation();
    }

    $scope.gotoRefundDetail = function (order_id, goods_id, product_id, $event) {
      $state.go('refundDetail', {order_id: order_id, goods_id: goods_id, product_id: product_id},{reload:true});
      $event.stopPropagation();
    }

    $scope.showShare = function () {
      var data = {
        title: $scope.productInfo.goods_array.name,
        desc: $scope.productInfo.goods_array.name,
        link: 'http://app.mall.jpjie.com/#/product/'+ $scope.productInfo.goods_id+'?is_share=1',
        img: $scope.productInfo.img
      };
      Ponto.invoke("H5ToMobileRequest", "popupShareView", data, null, null);
    }

    $scope.contactQQ = function () {
      var data = {
        qq: $scope.order.seller.server_num,
        ios_msg: "未安装 QQ 无法打开",
        android_msg: "未安装 QQ 无法打开"
      };
      Ponto.invoke("H5ToMobileRequest", "qqChat", data, null, null);
    };

  })
