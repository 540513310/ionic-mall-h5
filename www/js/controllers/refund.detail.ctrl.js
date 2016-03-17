angular.module('xgStore.controllers')
  .controller('refundDetailCtrl', function ($scope, $stateParams, $ionicLoading, $ionicActionSheet, $ionicHistory,
                                            $rootScope, xgApi, xgUser, $ionicPopup, $location, $timeout) {

    $scope.order_id = $stateParams.order_id;
    $scope.goods_id = $stateParams.goods_id;
    $scope.product_id = $stateParams.product_id;
    $scope.order = {};
    $scope.order_goods = {};
    $scope.data = {};
    $scope.logistics = {
      no : ''
    };

    $scope.$on('$ionicView.beforeEnter', function(){
      $scope.doRefresh();
    });
    $scope.doRefresh = function (){
      xgUser.getSessionId().then(function () {

        return xgApi.requestApi("/api/order/detail", {order_id : $scope.order_id});
      }).then(function (result) {

        $scope.order = result;
        angular.forEach(result.order_goods_list, function (order_goods) {
          if (order_goods.goods_id == $scope.goods_id && order_goods.product_id == $scope.product_id) {
            $scope.order_goods = order_goods;
            return;
          }
        })
        //console.log(result);
        //console.log($scope.order_goods);
        return xgApi.requestApi("/api/refund/detail", {
          order_id: $scope.order_id,
          goods_id: $scope.goods_id,
          product_id: $scope.product_id,
        });
      }).then(function (result) {

        $scope.data = result;
        var origin_price = $scope.order_goods.real_price * $scope.order_goods.goods_nums;
        $scope.data.origin_price = origin_price.toFixed(2);

        // 当用户退货时
        if(result.type == true){
          return xgApi.requestApi('/api/refund/sales_return', {
            order_id: $scope.order_id,
            goods_id: $scope.goods_id,
            product_id: $scope.product_id,
          })
        }
      }).then(function(result){
        if(result){
          $scope.refundPlease = result;
          $scope.refundPlease.freight_company[0].selected = true;
          $scope.selectedFreight = $scope.refundPlease.freight_company[0];
        }
      });
    }

    // 显示快递选择
    $scope.showFreight = function() {

      var hideSheet = $ionicActionSheet.show({
        buttons: $scope.refundPlease.freight_company,
        buttonClicked: function(index) {
          angular.forEach($scope.refundPlease.freight_company,function(v,k){
            v.selected = false;
            if(index == k){
              $scope.selectedFreight = v;
              v.selected = true;
            }
          });
          return true;
        }
      });

    };

    // 提交请退货申请
    $scope.submitRefund = function(){

      if($scope.selectedFreight == undefined){
        $scope.showAlert('请选择快递公司', 1000);
        return false;
      }

      if($scope.logistics.no == ''){
        $scope.showAlert('请填写物流单号', 1000);
        return false;
      }

      xgUser.getSessionId().then(function(){
        return xgApi.requestApi('/api/refund/sales_return_post',{
          order_id: $scope.order_id,
          goods_id: $scope.goods_id,
          product_id: $scope.product_id,
          logistics_company: $scope.selectedFreight.id,
          logistics_no: $scope.logistics.no
        })
      })
        .then(function(){
          $scope.doRefresh();
        })
    };

    // 取消退款申请
    $scope.cancelRefund = function(){
      var refundPopup = $ionicPopup.confirm({
        //title: '取消退款申请后，退款将关闭',
        subTitle: '取消退款申请后，退款将关闭',
        cssClass: 'refund-confirm',
        inputType: 'text',
        cancelText: '不退款了',
        okText: '继续退款',
        okType: 'button button-outline button-positive',
      });
      refundPopup.then(function(res) {
        if(res == false){
          xgUser.getSessionId().then(function () {
            return xgApi.requestApi("/api/refund/cancel_apply", {
              order_id : $scope.order_id,
              goods_id : $scope.goods_id,
              product_id : $scope.product_id,
            });
          })
            .then(function(result){
              if(result.status = 'success'){
                $ionicHistory.goBack();
              }
            })
        }
      });
    };

    $scope.contactQQ = function () {
      var data = {
        qq: $scope.order.seller.server_num,
        ios_msg: "未安装 QQ 无法打开",
        android_msg: "未安装 QQ 无法打开"
      };
      Ponto.invoke("H5ToMobileRequest", "qqChat", data, null, null);
    };


  })