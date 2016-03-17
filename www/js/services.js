angular.module('xgStore.services', [])

  .service('sku', function () {

    var info = [];

    var setInfo = function (skuInfo) {
      info.push(skuInfo);
    };

    var getInfo = function () {
      return info;
    };

    return {
      setInfo: setInfo,
      getInfo: getInfo
    };
  })
  .service('xgCart', function (xgApi, $state, $location, xgAddress) {
    this.init = function (data) {
      angular.forEach(data, function (v, k) {
        angular.forEach(v, function (i, j) {
          i.selected = false;
          i.editNow = false;
          i.seller.selected = false;
        })
      });
      this.cartItems = data;
    };

    // 获取购物车内店铺id
    this.getStoreId = function () {
      var storeId = [];
      angular.forEach(this.cartItems, function (v, k) {
        storeId.push(k);
      });
      return storeId;
    };

    // 获取店铺商品总数
    this.getItems = function (storeId) {
      var storeItems = this.cartItems[storeId],
        goods_total = 0;
      angular.forEach(storeItems, function (v, k) {
        if (v.is_valid == 1) {
          goods_total += parseInt(v.cart.quantity);
        }
      });
      return goods_total;
    };

    // 获取店铺总价
    this.getStoreTotal = function (storeId) {
      var storeItems = this.cartItems[storeId],
        total = 0;
      angular.forEach(storeItems, function (v, k) {
        if (v.is_valid == 1) {
          total += v.goods.sell_price * v.cart.quantity;
        }
      });
      return total.toFixed(2);
    };

    // 获取购物车总价
    this.getCartTotal = function () {
      var total = 0, _self = this;

      angular.forEach(_self.cartItems, function (v, k) {
        total += parseFloat(_self.getStoreTotal(k), 2);
      });
      return total;
    };

    // 获取店铺选中状态
    this.getCheckoutTotal = function () {
      var checkout = {total: 0, selected: 0};
      angular.forEach(this.cartItems, function (v, k) {
        checkout[k] = {'total': 0, 'selected': 0};
        angular.forEach(v, function (m, n) {
          checkout[k].total += 1;
          if (m.selected == true) {
            checkout[k].selected += 1;
            if (m.is_valid == 1) {
              checkout['selected'] += 1;
              checkout.total += m.cart.quantity * m.goods.sell_price;
            }
          }
        });
      });
      return checkout;
    };

    // 判断店铺是否是全编辑状态
    this.getStoreAllState = function () {
      var storeLenth = Object.keys(this.cartItems).length,
        editLength = 0;

      angular.forEach(this.cartItems, function (v, k) {
        var storeEdit = 0, goodsLen = v.length;
        angular.forEach(v, function (m, n) {
          if (m.editNow) {
            storeEdit++;
          }
          if (storeEdit == goodsLen) {
            editLength++;
          }
        })
      });

      if (storeLenth == editLength && storeLenth > 0) {
        return true;
      }
      return false;

    };

    // 全选
    this.selectAll = function (flag) {
      var storeId = this.getStoreId();
      var _self = this;
      angular.forEach(storeId, function (v, k) {
        _self.selectStore(v, flag);
      });
    };


    // 选中所有商铺产品
    this.selectStore = function (storeId, flag) {
      var storeItems = this.cartItems[storeId];

      flag == null ? (flag = storeItems[0].seller.selected) : (flag = !flag);

      angular.forEach(storeItems, function (v, k) {
          if (flag) {
            v.selected = false;
            v.seller.selected = false;
          } else {
            v.selected = true;
            v.seller.selected = true
          }
      });
    };

    // 确认订单
    this.checkoutNow = function () {
      var checkArray = {},
        goodsIdList = [],
        productIdList = [],
        quantityList = [],
        defaultAddressId = xgAddress.getDefault().address_id || 0;

      angular.forEach(this.cartItems, function (v, k) {
        angular.forEach(v, function (m) {
          if (m.selected == true && m.is_valid == 1) {
            goodsIdList.push(m.cart.goods_id);
            productIdList.push(m.cart.product_id);
            quantityList.push(m.cart.quantity);
          }
        })
      });



      checkArray.goods_id_list = goodsIdList.join(',');
      checkArray.product_id_list = productIdList.join(',');
      checkArray.quantity_list = quantityList.join(',');
      //return checkArray;
      //$state.go('app.orderCheck',{params: checkArray});
      //console.log('#/app/order/check/'+checkArray.goods_id_list +'/'+checkArray.product_id_list+'/'+checkArray.quantity_list);

      if(checkArray.goods_id_list !== '' || checkArray.product_id_list !== '' || checkArray.quantity_list !== ''){
        $location.path('/order/check/' + checkArray.goods_id_list + '/' + checkArray.product_id_list + '/' + checkArray.quantity_list + '/' + defaultAddressId);
      }

    }
  })

  .filter("displaySale", function() {
    return function(input,comma) {
      if (isNaN(parseFloat(input))) return "";
      comma = (typeof comma==='undefined') ? "." : ",";
      input = Math.round(parseFloat(input)*100)/100;
      var d = input.toString().split(".");
      if (d.length===1) return input+comma+"00";
      if (d[1].length<2) return input+"0";
      return input;
    }
  })



  .filter("formatPrice", function() {
    return function(price, digits, thoSeperator, decSeperator, bdisplayprice) {
      var i;
      digits = (typeof digits === "undefined") ? 2 : digits;
      bdisplayprice = (typeof bdisplayprice === "undefined") ? true : bdisplayprice;
      thoSeperator = (typeof thoSeperator === "undefined") ? "." : thoSeperator;
      decSeperator = (typeof decSeperator === "undefined") ? "," : decSeperator;
      price = price.toString();
      var _temp = price.split(".");
      var dig = (typeof _temp[1] === "undefined") ? "00" : _temp[1];
      if (bdisplayprice && parseInt(dig,10)===0) {
        dig = "-";
      } else {
        dig = dig.toString();
        if (dig.length > digits) {
          dig = (Math.round(parseFloat("0." + dig) * Math.pow(10, digits))).toString();
        }
        for (i = dig.length; i < digits; i++) {
          dig += "0";
        }
      }
      var num = _temp[0];
      var s = "",
        ii = 0;
      for (i = num.length - 1; i > -1; i--) {
        s = ((ii++ % 3 === 2) ? ((i > 0) ? thoSeperator : "") : "") + num.substr(i, 1) + s;
      }
      return s + decSeperator + dig;
    }
  });
