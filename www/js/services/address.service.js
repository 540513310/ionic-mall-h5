angular.module('xgStore.services')

  .service('xgAddress', function (xgApi) {

    this.init = function (addressList) {
      angular.forEach(addressList, function (v, k) {
        v.choosed = false;
      });
      this.addressList = addressList;
    };

    this.default = function (id) {
      angular.forEach(this.addressList, function (v, k) {
        if (v.id == id) {
          v.default = 1;
        }
        v.default = 0;
      });
    };

    this.getDefault = function (id) {
      var defAddress = null;
      angular.forEach(this.addressList, function (v, k) {
        if (id == null && v.default == 1) {
          defAddress = v;
        }
        if (v.address_id == id) {
          defAddress = v;
        }
      });
      if (defAddress == null) {
        defAddress = {
          address_id: 0
        }
      }
      return defAddress;
    };

    this.edit = function(id){
      var address = {};

      angular.forEach(this.addressList, function (v, k) {
        if (v.address_id == id) {
          address = v;
        }
      });
      address.default = address.default == 1 ? true : false;

      return address;
    };

    this.choose = function (id) {
      angular.forEach(this.addressList, function (v, k) {
        if (v.id == id) {
          v.choosed = true;
        }
        v.choosed = 0;
      })
    };

  });
