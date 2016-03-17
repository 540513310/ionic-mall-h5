angular.module('xgStore.services')

  .factory('xgApi', function ($q, $http, $rootScope) {

    var requestApi = function (url, params) {

      var defer = $q.defer();

      // 公共参数
      params.platform = 'wap';
      if ($rootScope.session_id != undefined) {
        params.session_id = $rootScope.session_id;
      }

      // 请求api
      $http.get(url, {params: params}).then(function (result) {
        if (result.data.status == 'success') {
          defer.resolve(result.data.result);
        } else {
          defer.reject(result.data.message);
        }
      });

      return defer.promise;
    };

    return {
      requestApi : requestApi
    };

  })
