angular.module('xgStore.controllers', [])

  .controller('AppCtrl', function ($scope, $rootScope, $ionicLoading,xgUser,$state) {

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

    $scope.showAlert = function (template, interval) {
      $ionicLoading.show({
        template: template,
        duration: interval,
        noBackdrop: true
      });
    };

  })

  .controller('productCtrl', function ($scope, $rootScope, $http, $stateParams, $timeout, $ionicModal, $ionicLoading, sku) {
    // 产品信息
    $scope.productInfo = {};
    $scope.multiple = false;
    $scope.moreHide = true;
    $scope.specArray = [];

    $scope.$on('$ionicView.beforeEnter', function () { //This is fired twice in a row
      $rootScope.showBtns.cart = true;
      $rootScope.showBtns.quitAble = true;
      if ($rootScope.entry == 'goods') {
        $rootScope.showBtns.returnMobile = true;
      }
    });

    $scope.$on('$ionicView.beforeLeave', function () { //This is fired twice in a row
      $rootScope.showBtns.cart = false;
      $rootScope.showBtns.quitAble = false;
      if ($rootScope.entry == 'goods') {
        $rootScope.showBtns.returnMobile = false;
      }
    });

    // 路由发生改变时
    $scope.$on('$stateChangeStart',function(){
      $scope.modal.hide();
    });

    // 获取产品信息
    $http.get("/api/goods/detail", {params: {'goods_id': $stateParams.id, 'platform': 'wap'}})
      .then(function (result) {
        if (result.data.status == 'success') {
          $scope.productInfo = result.data.result;
          if (typeof result.data.result.price_range === "object" && !(result.data.result.price_range instanceof Array)) {
            for (var prop in result.data.result.price_range) {
              $scope.multiple = true;
              break;
            }
          }
          $scope.multiple == true ? $scope.specArray = JSON.parse(result.data.result.spec_array) : '';
        }
      });

    // 获取更多产品详情
    $scope.loadMoreData = function () {
      $timeout(function () {
        $scope.moreHide = false;
      }, 1500);
    };

    // 显示加入购物车
    $ionicModal.fromTemplateUrl('templates/product/sku.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.addCart = function () {
      $rootScope.buyNow = 1;
      $scope.showSku();
    };

    $scope.checkNow = function () {
      $rootScope.buyNow = 2;
      $scope.showSku();
    };

    $scope.showSku = function () {
      //$ionicLoading.show({
      //    template: 'Loading...'
      //});
      //$timeout(function () {
      //    $ionicLoading.hide();
      //}, 1500);
      $scope.modal.show();
    };

    // 关闭加入购物车
    $scope.closeSku = function () {
      $scope.modal.hide();
    };

    // 显示分享
    //$ionicModal.fromTemplateUrl('templates/layout/share.html', {
    //    scope: $scope
    //}).then(function (modal) {
    //    $scope.modalShare = modal;
    //});
    //
    $scope.showShare = function () {
        //$scope.modalShare.show();
      Ponto.invoke("H5ToMobileRequest", "popupShareView", {}, null, null);
    }
    //
    //$scope.hideShare = function () {
    //    $scope.modalShare.hide();
    //}

  })

  .controller('skuCtrl', function ($scope, $http, $stateParams, $ionicPopover, $location, xgApi, xgAddress, xgUser) {

    $scope.xgAddress = xgAddress;

    $scope.item = {
      quantity: 1,
      id: 0,
      goods_id: $stateParams.id,
      product_id: 0
    };

    $scope.step = [];

    $scope.addItem = function (quantity) {
      $scope.item.quantity = parseInt($scope.item.quantity) + quantity;
    };

    $scope.getProductId = function (spec) {

      var productId = 0;

      if (Object.keys($scope.step).length != 3) return productId;

      angular.forEach($scope.productInfo.product_list, function (product) {
        var productSpec = JSON.parse(product.spec_array);
        var spec_value_list = [];
        angular.forEach(productSpec, function (spec) {
          spec_value_list.push(spec.value);
        });

        var isContain = true;
        for (var id in $scope.step) {
          var value = $scope.step[id];
          if (inArray(spec_value_list, value) == false) {
            isContain = false;
            break;
          }
        }

        if (isContain) {
          productId = product.id;
        }
      });

      return productId;
    };

    function inArray(arr, val) {
      var result = false;
      angular.forEach(arr, function (v) {
        if (v == val) {
          result = true;
        }
      });
      return result;
    }

    $scope.changeItem = function (id, value, index) {
      $scope.step[id] = value;
      $scope.specArray[id].clicked = index;
      var productId = $scope.getProductId({
        id: id,
        value: value
      });
      productId ? $scope.item.product_id = productId : '';
    };

    // 立即添加到购物车
    $scope.addToCart = function (cartId, goods_id) {
      if ($scope.multiple && Object.keys($scope.step).length != Object.keys($scope.specArray).length) {
        $scope.showAlert('请选择产品属性', 1000);
        return;
      }
      cartId ? $scope.item.id = cartId : '';
      goods_id ? $scope.item.goods_id = goods_id : '';

      xgUser.getSessionId().then(function () {
        return xgApi.requestApi('api/cart/edit', $scope.item);
      }).then(function (result) {
        $scope.closeSku();
        $scope.showAlert('添加成功', 1000);
      })
    };

    // 立即购买
    $scope.goCheckNow = function () {
      var defaultAddressId = 0;
      if ($scope.multiple && Object.keys($scope.step).length != Object.keys($scope.specArray).length) {
        $scope.showAlert('请选择产品属性', 1000);
        return;
      }
      xgUser.getSessionId().then(function () {
        return xgApi.requestApi("/api/user/detail", {});
      }).then(function (result) {
        xgAddress.init(result.address_list);
      }).then(function(){
        $scope.closeSku();
        defaultAddressId = xgAddress.getDefault().address_id || 0;
        $location.path('/order/check/'+$scope.item.goods_id +'/'+$scope.item.product_id+'/'+$scope.item.quantity+'/'+defaultAddressId);
      })
    };

  })

  .controller('cartCtrl', function ($scope, $http, $rootScope, $ionicModal, xgCart, xgApi, xgAddress, xgUser) {
    $scope.xgCart = xgCart;
    $scope.xgAddress = xgAddress;
    $scope.checkout = {selected: 0, total: 0, allSelected: false};

    $scope.$on('$ionicView.beforeEnter', function () {
      if ($rootScope.entry == 'cart') {
        $rootScope.showBtns.returnMobile = true;
      }
    });

    $scope.$on('$ionicView.beforeLeave', function () {
      if ($rootScope.entry == 'cart') {
        $rootScope.showBtns.returnMobile = false;
      }
    });

    // 路由发生改变时
    $scope.$on('$stateChangeStart',function(){
      $scope.modal && $scope.modal.hide();
    });


    xgUser.getSessionId().then(function () {
      return xgApi.requestApi("/api/cart/rows", {});
    })
      .then(function (result) {
        $scope.cartItems = result;
        xgCart.init(result);
      })
      .then(function () {
        $scope.$watch('cartItems', function (items) {
          var checkout = xgCart.getCheckoutTotal(),
            storeLen = xgCart.getStoreId().length;

          // 商品选中状态切换
          angular.forEach(checkout, function (v, k) {
            if (typeof v == 'object' && v.total == v.selected) {
              storeLen--;
              angular.forEach($scope.cartItems[k], function (v, k) {
                v.seller.selected = true;
              })
            } else {
              angular.forEach($scope.cartItems[k], function (v, k) {
                v.seller.selected = false;
              })
            }
          });

          // 全局编辑状态切换
          $rootScope.editAllState = xgCart.getStoreAllState();

          // 结算
          $scope.checkout = xgCart.getCheckoutTotal();

          if (storeLen == 0) {
            $scope.checkout.allSelected = true;
          } else {
            $scope.checkout.allSelected = false;
          }

        }, true);
      }).then(function () {
        xgApi.requestApi("/api/user/detail", {})
          .then(function (result) {
            xgAddress.init(result.address_list);
          })
      });
    // 切换编辑状态
    $scope.toggleEdit = function (storeId) {
      angular.forEach($scope.cartItems[storeId], function (v) {
        v.editNow ? v.editNow = false : v.editNow = true;
      });
    };
    // 编辑全部
    $rootScope.toggleEditAll = function () {
      angular.forEach($scope.cartItems, function (v) {
        angular.forEach(v, function (j, k) {
          if (!$rootScope.editAllState) {
            j.editNow = true;
          } else {
            j.editNow = false;
          }
        });
      });
    };

    // 显示加入购物车
    $ionicModal.fromTemplateUrl('templates/product/sku.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });
    // 修改Sku
    $scope.changeSku = function (storeId, index) {
      angular.forEach($scope.cartItems[storeId], function (v, k) {
        if (index == k) {
          $rootScope.buyNow = 3;
          $scope.editCartId = $scope.cartItems[storeId][k].cart.id;
          $scope.productInfo = $scope.cartItems[storeId][k].goods;
          $scope.specArray = JSON.parse($scope.productInfo.spec_array);
          $scope.editGoodsId = $scope.productInfo.id;
        }
      });
      $scope.modal.show();
    };

    // 关闭Sku
    $scope.closeSku = function () {
      $scope.modal.hide();
    }
    $scope.addItem = function (storeId, goodsIndex, quantity) {
      angular.forEach($scope.cartItems[storeId], function (v, k) {
        if (k == goodsIndex) {
          v.cart.quantity = parseInt(v.cart.quantity) + quantity;
        }
      })
    };

    $scope.delCartItem = function (storeId, index) {
      angular.forEach($scope.cartItems[storeId], function (v, k) {
        if (k == index) {
          var delParams = {
            cart_id: v.cart.id
          };
          xgApi.requestApi("/api/cart/delete", delParams)
            .then(function (result) {
              var a = $scope.cartItems[storeId].splice(k, 1);
            })
        }
      })
    };

    $scope.$on('$ionicView.beforeEnter', function () {
      $rootScope.showBtns.editAble = true;
    });

    $scope.$on('$ionicView.beforeLeave', function () {
      $rootScope.showBtns.editAble = false;
    });

  });
