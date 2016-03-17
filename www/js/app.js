// xgStore App
angular.module('xgStore', ['ionic', 'xgStore.controllers', 'xgStore.directives', 'xgStore.services', 'ui.angularSku',
  'ngAnimate', 'angularLazyImg', 'ionicRating', 'pasvaz.bindonce', 'angulartics', 'angulartics.baidu','ngIOS9UIWebViewPatch'])
  // 百度统计
  .config(function ($analyticsProvider) {
    $analyticsProvider.firstPageview(true); /* Records pages that don't use $state or $route */
    $analyticsProvider.withAutoBase(true);  /* Records full path */
  })

  .run(function ($rootScope, $location, $state, $ionicHistory, $ionicNavBarDelegate, xgUser, $ionicPopup, $ionicLoading) {

    // 配置统计参数
    var search = $location.search();
    $rootScope.paramsGroup = {
      platform2: search.platform || '',
      platform_version: search.platform_version || '',
      device_id: search.device_id || '',
      channel: search.channel || '',
      app_version: search.app_version || ''
    };

    // 设置返回到移动端的功能
    $rootScope.entry = $location.search().entry || 'goods'; // 夏总说默认用goods
    $rootScope.sdk = $location.search().sdk || 19;
    $rootScope.returnMobile = function () {
      Ponto.invoke("H5ToMobileRequest", "returnMobile", {entry: $rootScope.entry, msg: {}}, null, null);
    };

    $rootScope.modelGroup = [];

    // 支付成功
    $rootScope.paymentSuccess = function (params) {
      $state.go('orderList', {reload: true, replace: true}).then(function () {

        $ionicHistory.clearHistory();
        $ionicNavBarDelegate.showBackButton(false)
        $rootScope.showBtns.returnMobile = true;

        var paymentSuccessPopup = $ionicPopup.alert({
          title: '支付成功  <span class="status"></span>',
          template: '亲, 订单已成功支付,</br> 请耐心等待吧!',
          cssClass: 'payment-success-popup',
          okText: '确定',
          okType: 'button button-outline button-positive',
        });

        paymentSuccessPopup.then(function (res) {
          $rootScope.reloadOrderList();
        })
      });
    };


    // 支付失败
    $rootScope.paymentFailure = function (params) {
      $state.go('orderList', {reload: true, replace: true}).then(function () {

        $ionicHistory.clearHistory();
        $ionicNavBarDelegate.showBackButton(false)
        $rootScope.showBtns.returnMobile = true;

        var paymentFailurePopup = $ionicPopup.confirm({
          title: '支付失败 <span class="status"></span>',
          cssClass: 'payment-failure-popup',
          template: '亲, 该订单支付失败, </br>请重新支付!',
          //subTitle: '亲, 该订单支付失败, 请重新支付!',
          cancelText: '取消',
          cancelType: 'button button-outline button-dark',
          okText: '去支付',
          okType: 'button button-outline button-positive',
        });

        paymentFailurePopup.then(function (res) {
          if (res == true) {
            var args = {
              order_str: params.order_str,
              pay_type: params.pay_type,
            };
            Ponto.invoke("H5ToMobileRequest", "payment", args, null, null);
          }
        });
      });
    };

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

    $rootScope.gotoShopCart = function () {
      xgUser.getSessionId().then(function (result) {
        $state.go('shoppingCart');
      });
    };

    $rootScope.goStateBack = function () {
      if ($rootScope.modelGroup.length > 0) {
        $rootScope.modelGroup.pop().hide();
        return;
      }
      if ($ionicHistory.backView()) {
        $ionicHistory.goBack();
      } else if ($rootScope.entry !== '') {
        $rootScope.returnMobile();
      }
    }

  })

  .config(function ($ionicConfigProvider) {

    var configProperties = {
      views: {
        maxCache: 3,
        forwardCache: true,
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
        maxCache: 3,
        forwardCache: true,
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
      },
      scrolling: {
        jsScrolling: false
      }
    };

    $ionicConfigProvider.setPlatformConfig('android', configPropertiesAndroid);
    $ionicConfigProvider.setPlatformConfig('ios', configProperties);
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider


      .state('product', {
        url: '/product/:id',
        templateUrl: 'templates/product/detail.html',
        controller: 'productCtrl'
      })

      // android sdk低于4.4使用
      .state('product4', {
        url: '/product4/:id',
        templateUrl: 'templates/product/detail.html',
        controller: 'productCtrl'
      })
      // 店铺
      .state('mall', {
        url: '/mall/:id',
        templateUrl: 'templates/mall/index.html',
        controller: 'mallCtrl'
      })
      // 店铺
      .state('mallConnect', {
        url: '/mall/connect/:id',
        templateUrl: 'templates/mall/connect.html',
        controller: 'mallConnectCtrl'
      })
      // top layout menu
      .state('productPreview', {
        url: '/product/preview/:id',
        templateUrl: 'templates/product/preview.html',
        controller: 'productCtrl'
      })

      .state('shoppingCart', {
        url: '/shopping/cart',
        cache: false,
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
        cache: false,
        templateUrl: 'templates/order/detail.html',
        controller: 'orderDetailCtrl'
      })

      // 订单宝贝评价
      .state('orderGrade', {
        url: '/order/grade/:id',
        cache: false,
        templateUrl: 'templates/order/grade.html',
        controller: 'orderGradeCtrl'
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
    $urlRouterProvider.otherwise('/product/166');

  });
