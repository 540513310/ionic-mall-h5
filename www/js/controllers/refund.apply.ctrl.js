angular.module('xgStore.controllers')
  .controller('refundApplyCtrl', function ($scope, $stateParams, $ionicLoading, $rootScope, xgApi, xgUser, $ionicPopup, $ionicHistory) {

    $scope.order_id = $stateParams.order_id;
    $scope.order_goods_id = $stateParams.order_goods_id;
    $scope.form = {};
    $scope.form.content = "";


    // 全额退款
    $scope.refundAll = function () {
      submitRefundApply(0)
    }

    // 部分退款
    $scope.refundPart = function () {

      var refundInputPopup = $ionicPopup.prompt({
        title: '请输入退款金额并点击确定',
        subTitle: '(输入金额不得超过实付金额哦)',
        cssClass: 'refund-input-popup',
        inputType: 'text',
        cancelText: '取消',
        cancelType: 'button button-outline button-dark',
        okText: '确定',
        okType: 'button button-outline button-positive',
      });

      refundInputPopup.then(function(res) {
        if (res == undefined) {
          return;
        }

        var amount = parseFloat(res);
        if(isNaN(amount) || amount <= 0){
          alert('请输入有效金额');
          return;
        }
        submitRefundApply(amount)
      });
    }

    // 提交退款申请
    var submitRefundApply = function (amount) {
      xgUser.getSessionId().then(function () {
        return xgApi.requestApi("/api/refund/apply", {
          order_id: $scope.order_id,
          order_goods_id: $scope.order_goods_id,
          amount: amount,
          content: $scope.form.content
        })
      }).then(function (result) {
        popupResult(result.amount);
      }, function (message) {
        $ionicLoading.show({ template: message, noBackdrop: true, duration: 1000 })
      })
    }

    // 显示返回结果
    var popupResult = function (amount) {

      var refundResultPopup = $ionicPopup.alert({
        title: '到账金额 ' + amount + ' 元',
        subTitle: '亲, 您的退款已申请, 等待卖家处理!',
        cssClass: 'refund-result-popup',
        inputType: 'text',
        okText: '返回订单详情',
        okType: 'button button-outline button-positive',
      });
      refundResultPopup.then(function(res) {
        var backView = $ionicHistory.backView();
        if (backView.url.indexOf("/app/refund/detail") == -1) {
          $ionicHistory.goBack();
        } else {
          $ionicHistory.goBack(-2);
        }
      });
    }



  })
