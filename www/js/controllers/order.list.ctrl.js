angular.module('xgStore.controllers')

  .controller('orderListCtrl', function ($scope, $http, $rootScope, $ionicLoading,$ionicTabsDelegate, $ionicNavBarDelegate, $state,
                                         $location, xgUser, xgApi, $ionicPopup, $stateParams, xgOrder) {

    $scope.currentIndex = 0;    // 当前选中哪个tab
    //$scope.waitGoodsCount = 0;  // 等待收货总数
    //$scope.waitPayCount = 0;    // 等待支付总数
    //
    //$scope.orderTabList = [0, 1, 2, 3];      // 查找数据的类型
    //$scope.pageList = [1, 1, 1, 1];          // 各个类型当前的页数
    ////$scope.ordersList = [[], [], [], []]; // 各个类型内的数据
    //
    //$scope.ordersLoadMore = [
    //  {loadMore: true},
    //  {loadMore: true},
    //  {loadMore: true},
    //  {loadMore: true}
    //];

    $scope.xgOrder = xgOrder;
    $scope.ordersList = xgOrder.ordersList;

    $scope.$on('$ionicView.beforeEnter', function () {
      if ($rootScope.entry == 'order' || $rootScope.entry == 'goods' || $rootScope.entry == 'cart') {
        $rootScope.showBtns.returnMobile = true;
      }
      $rootScope.reloadOrderList();
    });

    $scope.$on('$ionicView.beforeLeave', function () {
      $rootScope.showBtns.returnMobile = false;
      $ionicNavBarDelegate.showBackButton(true)
    });

    $scope.taobaoOrder = function () {
      Ponto.invoke("H5ToMobileRequest", "taobaoOrder", {}, null, null);
    };


    // 获取订单列表
    //function loadOrderList(index) {
    //  var params = {
    //    order_tab : $scope.orderTabList[index],
    //    page : $scope.pageList[index]
    //  };
    //
    //  xgApi.requestApi("/api/order/rows", params)
    //    .then(function (result) {
    //      if ($scope.pageList[index] == 1) {
    //        $scope.ordersList[index] = [];
    //      }
    //      if(result.order_list.length == 0){
    //        $scope.ordersLoadMore[index].loadMore = false;
    //        console.log($scope.ordersLoadMore);
    //        return;
    //      }
    //      angular.forEach(result.order_list, function(order, order_key){
    //        order.total_goods_num = 0;
    //        order.total_goods_price = 0;
    //        angular.forEach(order.order_goods_list , function(goods, goods_key){
    //          goods.goods_array = angular.fromJson(goods.goods_array);
    //          order.total_goods_num += goods.goods_nums;
    //          order.total_goods_price += goods.real_price * goods.goods_nums;
    //        });
    //      });
    //      $scope.ordersList[index] = $scope.ordersList[index].concat(result.order_list);
    //      $scope.waitGoodsCount = result.wait_goods_count;
    //      $scope.waitPayCount = result.wait_pay_count;
    //      $scope.pageList[index] = $scope.pageList[index] + 1;
    //    }, function(message) {
    //
    //    }
    //  ).finally(function () {
    //      $scope.$broadcast('scroll.refreshComplete');
    //      $scope.$broadcast('scroll.infiniteScrollComplete');
    //    }
    //  );
    //}

    // 刷新数据
    //$scope.doRefresh = function(index) {
    //  xgUser.getSessionId().then(function () {
    //    $scope.pageList[index] = 1;
    //    loadOrderList(index);
    //  });
    //}

    // 加载更多
    //$scope.loadMore = function (index) {
    //  xgUser.getSessionId().then(function () {
    //    loadOrderList(index);
    //  });
    //};

    // 获取订单
    $rootScope.reloadOrderList = function () {
      xgUser.getSessionId().then(function () {
        if ($rootScope.entry == 'order') {
          // 通知native关闭顶部bar
          Ponto.invoke("H5ToMobileRequest", "hideNativeNavBar", {}, null, null);
        }
        var params = {
          order_tab: $scope.currentIndex,
          page: 1,
          init: true
        };
        xgApi.requestApi("/api/order/rows", params)
          .then(function(result){
            xgOrder.init(result,params);
            $scope.ordersList = xgOrder.ordersList;
            console.log($scope.ordersList);
            $scope.ordersList[params.order_tab].current = params.page + 1;
          })
      });
    }

    // 加载更多
    $scope.loadMore = function(index){
      xgUser.getSessionId().then(function () {
        xgOrder.getOrderList({
          order_tab: index,
          page: $scope.ordersList[index].current
        });
        $scope.ordersList = xgOrder.ordersList;
      }).finally(function(){
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };
    // 切换 tab 加载数据
    $scope.onTabSelected = function (index) {
      $scope.currentIndex = index;
      xgUser.getSessionId().then(function () {
        if ($scope.ordersList[index] != undefined && $scope.ordersList[index].more == true) {
          var params = {
            order_tab: index,
            page: $scope.ordersList[index].page || 1
          };
          xgOrder.getOrderList(params);
          $scope.ordersList = xgOrder.ordersList;
          console.log('tab selected:' + index)
          console.log($scope.ordersList)
        }
      });
    };

    // 支付订单
    $scope.buy = function (order_id) {
      xgApi.requestApi("/api/order/clickPay", {order_id: order_id, pay_type: 100001})
        .then(function (result) {
          Ponto.invoke("H5ToMobileRequest", "payment", result, null, null);
        }, function (message) {
          $ionicLoading.show({template: message, noBackdrop: true, duration: 1000})
        });
    }

    // 取消订单
    $scope.cancel = function (order_id,tabOn) {
     xgOrder.cancel(order_id,tabOn);
    };

    // 确认订单
    $scope.confirm = function (order_id, total_goods_price) {
      var confirmOrderPopup = $ionicPopup.confirm({
        title: '确认收货',
        cssClass: 'confirm-order-popup',
        subTitle: total_goods_price + ' 元',
        cancelText: '取消',
        cancelType: 'button button-outline button-dark',
        okText: '确定',
        okType: 'button button-outline button-positive',
      });
      confirmOrderPopup.then(function (res) {
        if (res == true) {
          xgApi.requestApi("/api/order/confirm", {order_id: order_id}).then(function (result) {
            $rootScope.reloadOrderList();
            $ionicLoading.show({template: result.msg, noBackdrop: true, duration: 1000})
          }, function (message) {
            $ionicLoading.show({template: message, noBackdrop: true, duration: 1000})
          });
        }
      });
    }

    // 物流跟踪
    $scope.delivery = function (order_id) {
      $state.go('delivery.trace', {order_id: order_id});
    }

    // 重新购买
    $scope.rebuy = function (order_id) {
      xgUser.getSessionId().then(function () {
        return xgApi.requestApi("/api/order/rebuy", {order_id: order_id});
      }).then(function (result) {
        var params_path = result.goods_id_list + "/" + result.product_id_list + "/" + result.quantity_list + "/" + result.default_address_id;
        console.log(params_path);
        $location.path("/order/check/" + params_path);
      });
    }

    // 删除订单
    $scope.remove = function (order_id) {
      var removeOrderPopup = $ionicPopup.confirm({
        title: '删除订单',
        cssClass: 'remove-order-popup',
        subTitle: '确认删除订单? 删除后订单不可恢复',
        cancelText: '取消',
        cancelType: 'button button-outline button-dark',
        okText: '确定',
        okType: 'button button-outline button-positive',
      });
      removeOrderPopup.then(function (res) {
        if (res == true) {
          xgOrder.remove(order_id);
          $rootScope.reloadOrderList();
        }
      });
    }

    $scope.gotoOrderDetail = function (id) {
      $state.go('orderDetail', {id: id});
    }


  })


