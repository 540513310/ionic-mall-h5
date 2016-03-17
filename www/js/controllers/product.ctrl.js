angular.module('xgStore.controllers')

  .controller('productCtrl', function (xgApi, $scope, $rootScope, $state, $http, $stateParams, $timeout, $window,
                                       $ionicModal, $ionicLoading, sku, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
    // 产品信息
    $scope.productInfo = {is_del: 0};
    $scope.multiple = false;
    $scope.moreHide = true;
    $scope.specArray = [];
    $scope.from = 'product';
    $scope.comments = {
      list: [],
      more: true,
      current: 1
    };

    $scope.$on('$ionicView.beforeEnter', function () { //This is fired twice in a row
      $rootScope.showBtns.cart = true;
      $rootScope.showBtns.quitAble = true;
      if ($rootScope.entry == 'goods') {
        $rootScope.showBtns.returnMobile = true;

        // 通知native关闭顶部bar
        if ($rootScope.entry != 'preview') {
          Ponto.invoke("H5ToMobileRequest", "hideNativeNavBar", {}, null, null);
        }
      }
      reloadView();
    });

    $scope.$on('$ionicView.beforeLeave', function () { //This is fired twice in a row
      $rootScope.showBtns.cart = false;
      $rootScope.showBtns.quitAble = false;
      if ($rootScope.entry == 'goods') {
        $rootScope.showBtns.returnMobile = false;
      }
    });

    // 路由发生改变时
    $scope.$on('$stateChangeStart', function () {
      $scope.modal && $scope.modal.hide();
    });

    // 滚动
    $scope.onScroll = function(){
      //angular.element(document.querySelectorAll('.text-and-img-wrap img')).removeClass('xx')
      if(document.querySelector('ion-content').scrollTop > 739){
      }
    };

    var reloadView = function () {
      // 获取产品信息
      xgApi.requestApi("/api/goods/detail", {'goods_id': $stateParams.id}).then(function (result) {
        console.log(result);
        // 判断是否是团购商品换团购封面
        if(result.regiment && result.regiment.img){
          result.photo_list.unshift(result.regiment.img);
        }
        // 判断团购是否已经生效
        if(result.regiment && result.regiment.store_nums){
          result.regiment.success = (result.regiment.store_nums - result.regiment.sum_count > 0) ? false : true;
        }


        $scope.productInfo = result;

        // 产品图片切换
        $ionicSlideBoxDelegate.update();
        angular.element(document.querySelector('.slider-pager')).css('display', 'block');

        // 判断多属性
        if (typeof result.price_range === "object" && !(result.price_range instanceof Array)) {
          for (var prop in result.price_range) {
            $scope.multiple = true;
            break;
          }
        }

        $scope.initProduct();

      }, function (message) {
        $scope.productInfo.is_del = 1;
      });
    };

    $scope.callNativeSliderChange = function(){
      Ponto.invoke("H5ToMobileRequest", "sliderChange", {}, null, null);
      console.log('swipe');
    }


    // 初始化库存和价格
    $scope.initProduct = function(){
      $scope.multiple == true ? $scope.specArray = JSON.parse($scope.productInfo.spec_array) : '';
      if ($scope.multiple) {
        if ($scope.productInfo.price_range.min_sell_price == $scope.productInfo.price_range.max_sell_price) {
          $scope.productInfo.current_price = $scope.productInfo.price_range.min_sell_price;
        } else {
          $scope.productInfo.current_price = $scope.productInfo.price_range.min_sell_price + '-' + $scope.productInfo.price_range.max_sell_price;
        }
      } else {
        $scope.productInfo.current_price = $scope.productInfo.sell_price;
      }
      $scope.productInfo.current_store_nums = $scope.productInfo.store_nums;
    };

    // 获取产品评价列表
    $scope.loadComment = function(){
      xgApi.requestApi("/api/comment/all", {'goods_id': $stateParams.id,'page':$scope.comments.current})
        .then(function (result) {
          // 没有评论
          if(result.length == 0){
            $scope.comments.more = false;
            return;
          }

          // 小于20
          if(result.length < 20){
            $scope.comments.more = false;
          }

          $scope.comments.list =  $scope.comments.list.concat(result);
          $scope.comments.current++;

        })
    };


    $scope.isHalf = function(score){
      return score - parseInt(score,10) > 0;
    };


    // 获取更多产品详情
    $scope.loadMoreData = function () {
      // 加载评论列表
      $scope.loadComment();
      // 加载推荐列表
      xgApi.requestApi("/api/goods/commend", {'goods_id': $stateParams.id})
        .then(function(result){
          $scope.recommendList = result;
        });
      // 加载猜你喜欢
      xgApi.requestApi("/api/goods/guess", {'goods_id': $stateParams.id})
        .then(function(result){
          $scope.guessList = result;
        });
      $timeout(function () {
        $scope.moreHide = false;
        $timeout(function(){
          angular.element(document.querySelectorAll('.text-and-img-wrap img')).addClass('viewed')
        },100);
        //angular.element(document.querySelector('#productDetail')).triggerHandler('click');
      }, 1000);
    };

    $scope.addCart = function () {
      $rootScope.buyNow = 1;
      $scope.showSku();
    };

    $scope.checkNow = function () {
      $rootScope.buyNow = 2;
      $scope.showSku();
    };

    $scope.showSku = function () {
      xgApi.requestApi('api/goods/sku',{goods_id:$stateParams.id})
        .then(function(result){
          $scope.skuInfo = result.sku_map;
          $scope.specMap = result.spec_map;
          $scope.specImgMap = result.spec_img_map;
        })
        .then(function(){
          // 显示加入购物车
          $ionicModal.fromTemplateUrl('templates/product/sku.html', {
            scope: $scope
          }).then(function (modal) {
            $scope.modal = modal;
          })
          .then(function(){
            $scope.initProduct();
            $timeout(function () {
              $scope.modal.show();
              $rootScope.modelGroup.push($scope.modal);
            }, 50);
          });
        })
    };

    // 关闭加入购物车
    $scope.closeSku = function () {
      $rootScope.modelGroup.pop().hide();
    };

    $scope.showShare = function () {
      var data = {
        title: $scope.productInfo.share_content.title,
        desc: $scope.productInfo.share_content.desc,
        link: $scope.productInfo.share_content.link,
        img: $scope.productInfo.share_content.img
      };
      Ponto.invoke("H5ToMobileRequest", "popupShareView", data, null, null);
    }

    $scope.contactQQ = function () {
      var data = {
        qq: $scope.productInfo.seller.server_num,
        ios_msg: "未安装 QQ 无法打开",
        android_msg: "未安装 QQ 无法打开"
      };
      Ponto.invoke("H5ToMobileRequest", "qqChat", data, null, null);
    };

    // 团购指南
    $scope.showTip = function () {
      // 显示加入购物车
      $ionicModal.fromTemplateUrl('templates/product/tip.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.modalTip = modal;
      }).then(function () {
        $scope.modalTip.show();
        $rootScope.modelGroup.push($scope.modalTip);
      })
    };
    $scope.closeTip = function () {
      $rootScope.modelGroup.pop().hide();
    };

    $scope.contactMall = function(){
      $state.go('mallConnect');
    }

  });


