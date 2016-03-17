angular.module('xgStore.controllers')
  .controller('refundApplyCtrl', function ($scope, $stateParams, $ionicLoading, $rootScope, xgApi, xgUser, $ionicPopup, $ionicHistory, $state) {

    var order_id = $stateParams.order_id,
      order_goods_id = $stateParams.order_goods_id;

    $scope.form = {
      order_id : order_id,
      order_goods_id : order_goods_id,
      content : ''
    };
    $scope.$on('$ionicView.beforeEnter', function(){
      $scope.doRefresh();
    });
    $scope.doRefresh = function (){
      xgUser.getSessionId().then(function () {
        return xgApi.requestApi("/api/order/detail", {order_id : order_id});
      }).then(function (result) {
        angular.forEach(result.order_goods_list,function(v){
          if(order_goods_id == v.id){
            $scope.refundGood = v;
          }
        });
      });
    };

    $scope.refundNow = function(){

      //退款类型判断
      if($scope.refundGood.is_send == 1 && isNaN($scope.form.type)){
        $ionicLoading.show({ template: '请选择退款类型', noBackdrop: true, duration: 1000 });
        return false;
      }
      // 判断金额
      if(isNaN($scope.form.amount) || $scope.form.amount <= 0){
        $ionicLoading.show({ template: '请输入有效退款金额', noBackdrop: true, duration: 1000 });
        return false;
      }
      // 判断退款原因
      if($scope.form.content.length == 0){
        $ionicLoading.show({ template: '请简单描述下退款原因', noBackdrop: true, duration: 1000 });
        return false;
      }

      submitRefundApply();
    };

    // 提交退款申请
    var submitRefundApply = function () {
      xgUser.getSessionId().then(function () {
        console.log($scope.form);
        return xgApi.requestApi("/api/refund/apply",  $scope.form)
      }).then(function (result) {
        popupResult();
      }, function (message) {
        $ionicLoading.show({ template: message, noBackdrop: true, duration: 1000 })
      })
    }

    // 显示返回结果
    var popupResult = function () {

      var refundResultPopup = $ionicPopup.alert({
        title: '亲, 您的退款已申请, 等待卖家处理!',
        //subTitle: '亲, 您的退款已申请, 等待卖家处理!',
        cssClass: 'refund-result-popup',
        inputType: 'text',
        okText: '返回订单详情',
        okType: 'button button-outline button-positive',
      });
      refundResultPopup.then(function(res) {
        var backView = $ionicHistory.backView();
        if (backView.url.indexOf("/refund/detail") == -1) {
          $ionicHistory.goBack();
        } else {
          $ionicHistory.goBack(-2);
        }
      });
    }



  })
