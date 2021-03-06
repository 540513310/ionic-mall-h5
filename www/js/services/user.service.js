angular.module('xgStore.services')

  .factory('xgUser', function ($rootScope, $ionicLoading, $q) {

    var getSessionId = function () {
      var defer = $q.defer();

      // 测试环境
      //defer.resolve('65');
      //$rootScope.session_id = '65';

      // 生产环境
      Ponto.invoke("H5ToMobileRequest", "getSessionId", { msg : {}}, function (params) {
        $rootScope.session_id = params.session_id;
        if ($rootScope.session_id != undefined && $rootScope.session_id != "") {
          defer.resolve(params.session_id);
        } else {
          defer.reject("");
        }
      }, function () {
        $ionicLoading.show({ template: '用户登录失败', noBackdrop: true, duration: 1000 })
        defer.reject("用户登录失败了");
      });

      return defer.promise;
    };

    return {
      getSessionId : getSessionId
    };

  })
