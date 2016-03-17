angular.module('xgStore.services')

  .factory('xgApi', function ($q, $http, $rootScope, $ionicLoading) {

    var requestApi = function (url, params) {

      var defer = $q.defer();

      // 公共参数
      params.platform = 'wap';
      angular.forEach($rootScope.paramsGroup,function(v,k){
        params[k] = v;
      });


      if ($rootScope.session_id != undefined) {
        params.session_id = $rootScope.session_id;
      }

      // 请求api
      $http.get(url, {params: params, timeout: 8000}).then(function (result) {
        if (result.data.status == 'success') {
          defer.resolve(result.data.result);
        } else {
          defer.reject(result.data.message);
        }
      }, function (response) {
        $ionicLoading.show({ template: '目前网络状况不佳，请检查网络配置', noBackdrop: true, duration: 1000 })
      });

      return defer.promise;
    };

    return {
      requestApi : requestApi
    };

  })
