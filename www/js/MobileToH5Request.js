/**
 * Created by william on 15/8/13.
 */

function MobileToH5Request(params) {
  this.paymentSuccess = function() {
    var $body = angular.element(document.body);
    var $rootScope = $body.scope().$root;
    $rootScope.paymentSuccess(params);
    return "{}";
  };
  this.paymentFailure = function(params) {
    var $body = angular.element(document.body);
    var $rootScope = $body.scope().$root;
    $rootScope.paymentFailure(params);
    return "{}";
  };
  this.androidHardback = function(){
    var $body = angular.element(document.body);
    var $rootScope = $body.scope().$root;
    $rootScope.goStateBack();
    return "{}";
  }
}
Ponto.PontoBaseHandler.derive(MobileToH5Request);
MobileToH5Request.getInstance = function(){
  return new MobileToH5Request();
};

