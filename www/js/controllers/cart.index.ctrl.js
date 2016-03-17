angular.module('xgStore.controllers')

  .controller('cartCtrl', function ($scope, $http, $rootScope, $ionicModal,$timeout, xgCart, xgApi, xgAddress, xgUser, $state) {
    $scope.xgCart = xgCart;
    $scope.xgAddress = xgAddress;
    $scope.checkout = {selected: 0, total: 0, allSelected: false};
    $scope.cartItems = {};

    $scope.$on('$ionicView.beforeEnter', function () {
      $rootScope.showBtns.editAble = true;
      if ($rootScope.entry == 'cart') {
        $rootScope.showBtns.returnMobile = true;
      }
    });

    $scope.$on('$ionicView.beforeLeave', function () {
      $rootScope.showBtns.editAble = false;
      if ($rootScope.entry == 'cart') {
        $rootScope.showBtns.returnMobile = false;
      }
    });

    // 路由发生改变时
    $scope.$on('$stateChangeStart', function () {
      $scope.modal && $scope.modal.hide();
    });

    $scope.taobaoCart = function () {
      Ponto.invoke("H5ToMobileRequest", "taobaoCart", {}, null, null);
    }

    $scope.gotoProductDetail = function (id) {
      if ($rootScope.sdk >= 19) {
        $state.go('product', {id: id});
      } else {
        $state.go('product4', {id: id});
      }
    }

    xgUser.getSessionId().then(function () {
      if ($rootScope.entry == 'cart') {
        Ponto.invoke("H5ToMobileRequest", "hideNativeNavBar", {}, null, null);
      }
      return xgApi.requestApi("/api/cart/rows", {});
    })
      .then(function (result) {
        if (Object.keys(result).length > 0) {
          $scope.cartItems = result;
          $scope.cartEmpty = false;
        } else {
          $scope.cartEmpty = true;
        }
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

          if (Object.keys(items).length == 0) {
            $scope.cartEmpty = true;
          } else {
            $scope.cartEmpty = false;
          }
        }, true);
      }).then(function () {
        xgApi.requestApi("/api/user/detail", {})
          .then(function (result) {
            xgAddress.init(result.address_list);
          })
      })
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
    $scope.skuFromCart = true;

    // 修改Sku
    $scope.changeSku = function (storeId, index) {
      // 循环购物车里当前店铺的所有商品，找到要修改的商品
      angular.forEach($scope.cartItems[storeId], function (v, k) {
        if (index == k) {
          $rootScope.buyNow = 3;
          $scope.editStoreId = storeId;
          $scope.editCartId = $scope.cartItems[storeId][k].cart.id;
          $scope.productInfo = $scope.cartItems[storeId][k].goods;
          $scope.specArray = JSON.parse($scope.productInfo.spec_array);
          $scope.editGoodsId = $scope.productInfo.id;
          $scope.editProductId = v.cart.product_id;

          if (v.cart.product_id == 0) {
            $scope.productInfo.current_price = v.goods.sell_price;
            $scope.productInfo.current_store_nums = v.goods.store_nums;
          } else {
            angular.forEach(v.goods.product_list, function (product, index) {
              if (product.id == v.cart.product_id) {
                $scope.productInfo.current_price = product.sell_price;
                $scope.productInfo.current_store_nums = product.store_nums;
              }
            })
          }
        }
      });
      //$scope.modal.show();
      //$rootScope.modelGroup.push($scope.modal);
      $scope.showSku();
    };

    $scope.showSku = function(){
      xgApi.requestApi('api/goods/sku',{goods_id:$scope.editGoodsId})
        .then(function(result){
          //console.log($scope.productInfo.product_list[$scope.editProductId]);
          $scope.initSku = $scope.productInfo.product_list[$scope.editProductId].spec_current;
          $scope.skuInfo = result.sku_map;
          $scope.specMap = result.spec_map;
          $scope.specImgMap = result.spec_img_map;
          $scope.multiple = true;
        })
        .then(function(){
          // 显示加入购物车
          $ionicModal.fromTemplateUrl('templates/product/sku.html', {
            scope: $scope
          }).then(function (modal) {
            $scope.modal = modal;
          })
            .then(function(){
              $timeout(function () {
                $scope.modal.show();
                $rootScope.modelGroup.push($scope.modal);
              }, 50);
            });
        })
    };

    $scope.cartChange = function (item) {

      angular.forEach($scope.cartItems[$scope.editStoreId], function (v, k) {
        if (item.id == v.cart.id) {
          v.cart.quantity = item.quantity;
          v.cart.product_id = item.product_id;
          var goodsList = v.goods.product_list;
          console.log(v)
          console.log(item);
          angular.forEach(goodsList, function (m, n) {
            if (n == item.product_id) {
              v.goods.sell_price = m.sell_price;
              v.goods.current_img = item.currentImg;
              //v.goods.produc = m.sell_price;
            }
          })
        }
      });

      $scope.showAlert('编辑成功', 1000);
    };

    // 关闭Sku
    $scope.closeSku = function () {
      $rootScope.modelGroup.pop().hide();
    };

    $scope.addItem = function (storeId, goodsIndex, quantity) {
      angular.forEach($scope.cartItems[storeId], function (v, k) {
        if (k == goodsIndex) {
          v.cart.quantity = parseInt(v.cart.quantity) + quantity;

          var params = {
            id: v.cart.id,
            goods_id: v.cart.goods_id,
            product_id: v.cart.product_id,
            quantity: v.cart.quantity
          };
          xgApi.requestApi("/api/cart/edit", params)
            .then(function (result) {
            });
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
              $scope.cartItems[storeId].splice(k, 1);
              if ($scope.cartItems[storeId].length == 0) {
                delete $scope.cartItems[storeId];
              }
            })
        }
      });
    };
  });
