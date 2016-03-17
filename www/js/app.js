// xgStore App
angular.module('xgStore', ['ionic', 'xgStore.controllers', 'xgStore.directives', 'xgStore.services'])

  .run(function ($rootScope, $location, $state, $ionicHistory, $ionicNavBarDelegate,xgUser, $ionicPopup, $ionicLoading ) {
    // 设置返回到移动端的功能
    $rootScope.entry = $location.search().entry;
    $rootScope.returnMobile = function () {
      Ponto.invoke("H5ToMobileRequest", "returnMobile", {entry: $rootScope.entry, msg: {}}, null, null);
    }

    // 支付成功
    $rootScope.paymentSuccess = function (params) {
      $state.go('orderList', {}).then(function () {

        $ionicHistory.clearHistory();
        $ionicNavBarDelegate.showBackButton(false)
        $rootScope.showBtns.returnMobile = true;

        var paymentSuccessPopup = $ionicPopup.alert({
          title: '支付成功',
          subTitle: '亲, 订单已成功支付, 请耐心等待吧!',
          cssClass: 'payment-success-popup',
          okText: '确定',
          okType: 'button button-outline button-positive',
        });
      });
    }

    // 支付失败
    $rootScope.paymentFailure = function (params) {
      $state.go('orderList', {}).then(function () {

        $ionicHistory.clearHistory();
        $ionicNavBarDelegate.showBackButton(false)
        $rootScope.showBtns.returnMobile = true;

        var paymentFailurePopup = $ionicPopup.confirm({
          title: '支付失败',
          cssClass: 'payment-failure-popup',
          subTitle: '亲, 该订单支付失败, 请重新支付!',
          cancelText: '取消',
          cancelType: 'button button-outline button-dark',
          okText: '去支付',
          okType: 'button button-outline button-positive',
        });

        paymentFailurePopup.then(function(res) {
          if (res == true) {
            var args = {
              order_str: params.order_str,
              pay_type: params.pay_type,
            };
            Ponto.invoke("H5ToMobileRequest", "payment", args, null, null);
          }
        });
      });
    }

    $rootScope.showBtns = {
      cart: false,
      editAble: false,
      addressAdd: false,
      addressSave: false,
      quitAble: false,
      returnMobile: false
    };

    // 编辑全部购物车
    $rootScope.editAllState = false;

    $rootScope.showAlert = function (template, interval) {
      $ionicLoading.show({
        template: template,
        duration: interval,
        noBackdrop: true
      });
    };

    $rootScope.gotoShopCart = function(){
      xgUser.getSessionId().then(function(result){
        $state.go('shoppingCart');
      });
    }

  })

  .config(function ($ionicConfigProvider) {

    var configProperties = {
      views: {
        maxCache: 0,
        forwardCache: false,
        transition: 'ios'
      },
      navBar: {
        alignTitle: 'center',
        positionPrimaryButtons: 'ios',
        positionSecondaryButtons: 'ios',
        transition: 'ios'
      },
      backButton: {
        icon: 'ion-ios-arrow-left',
        text: ' ',
        previousTitleText: false
      },
      form: {
        checkbox: 'ios'
      },
      tabs: {
        style: 'striped',
        position: 'top'
      },
      templates: {
        // maxPrefetch: 0
      }
    };
    var configPropertiesAndroid = {
      views: {
        maxCache: 0,
        forwardCache: false,
        transition: 'none'
      },
      navBar: {
        alignTitle: 'center',
        positionPrimaryButtons: 'ios',
        positionSecondaryButtons: 'ios',
        transition: 'none'
      },
      backButton: {
        icon: 'ion-ios-arrow-left',
        text: ' ',
        previousTitleText: false
      },
      form: {
        checkbox: 'ios'
      },
      tabs: {
        style: 'striped',
        position: 'top'
      },
      templates: {
        // maxPrefetch: 0
      }
    };

    $ionicConfigProvider.setPlatformConfig('android', configPropertiesAndroid);
    $ionicConfigProvider.setPlatformConfig('ios', configProperties);
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

      // top layout menu

      .state('product', {
        url: '/product/:id',
        templateUrl: 'templates/product/detail.html',
        controller: 'productCtrl'
      })

      .state('shoppingCart', {
        url: '/shopping/cart',
        templateUrl: 'templates/shopping/cart.html',
        controller: 'cartCtrl'
      })

      // 编辑 添加 地址
      .state('addressEdit', {
        url: '/address/edit/:id',
        templateUrl: 'templates/address/edit.html',
        controller: 'addressEditCtrl'
      })

      // 地址列表
      .state('addressList', {
        url: '/address/list',
        templateUrl: 'templates/address/list.html',
        controller: 'addressListCtrl'
      })

      // 订单确认页面
      .state('orderCheck', {
        url: '/order/check/:goodsIdList/:productIdList/:quantityList/:defaultAddressId',
        templateUrl: 'templates/order/check.html',
        controller: 'orderCheckCtrl'
        //url: '/order/check',
        //params: {params:null},
      })

      // 订单列表
      .state('orderList', {
        url: '/order/list',
        params: {popup_type: null, order_str: null, pay_type: null},
        templateUrl: 'templates/order/list.html',
        controller: 'orderListCtrl'
      })

      // 订单详情
      .state('orderDetail', {
        url: '/order/detail/:id',
        templateUrl: 'templates/order/detail.html',
        controller: 'orderDetailCtrl'
      })

      // 物流跟踪
      .state('deliveryTrace', {
        url: '/delivery/trace/:id',
        templateUrl: 'templates/delivery/trace.html',
        controller: 'deliveryTraceCtrl'
      })

      // 退款申请
      .state('refundApply', {
        url: '/refund/apply/:order_id/:order_goods_id',
        templateUrl: 'templates/refund/apply.html',
        controller: 'refundApplyCtrl'
      })

      // 退款详情
      .state('refundDetail', {
        url: '/refund/detail/:order_id/:goods_id/:product_id',
        templateUrl: 'templates/refund/detail.html',
        controller: 'refundDetailCtrl'
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/product/5');

  });
