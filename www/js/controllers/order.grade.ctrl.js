angular.module('xgStore.controllers')

  .controller('orderGradeCtrl', function ($scope, $http, $stateParams, $rootScope, $ionicLoading, $location, xgUser, xgApi, $ionicPopup, $state) {

    $scope.order_no = $stateParams.id;
    $scope.order = {};
    $scope.order.lastDelivery = "";

    $scope.max = 5;


    $scope.$on('$ionicView.beforeEnter', function(){
      $scope.doRefresh();
    });

    // 刷新数据
    $scope.doRefresh = function() {
      xgUser.getSessionId().then(function () {
        return xgApi.requestApi("/api/comment/rows", {order_no: $scope.order_no});
      }).then(function (result) {
        $scope.commentList = result;
      });
    };

    // 提交宝贝评价
    $scope.submitGrade = function(){
      var commentList = [],flag = false;
      angular.forEach($scope.commentList,function(goods){
        if(goods.status == 0){
          var comment = {};
          comment.id = goods.id;
          comment.quality_point = goods.quality_point;
          comment.speed_point = goods.speed_point;
          comment.service_point = goods.service_point;
          comment.content = goods.content;
          commentList.push(comment);
          if(goods.content && goods.content.toString().length>300){
            flag = true;
            $scope.showAlert('字段太长',1000);
          }
        }
      });

      if(flag) return;

      xgUser.getSessionId().then(function () {
        return xgApi.requestApi("/api/comment/submit", {json: JSON.stringify(commentList)});
      }).then(function (result) {
        $scope.goStateBack();
      });
    }
  });
