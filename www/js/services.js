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
    .service('xgCart', function (xgApi,$state,$location,xgAddress) {
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
        this.getStoreId = function(){
            var storeId = [];
            angular.forEach(this.cartItems,function(v,k){
                storeId.push(k);
            });
            return storeId;
        };

        // 获取店铺商品总数
        this.getItems = function (storeId) {
            var storeItems = this.cartItems[storeId],
                goods_total = 0;
            angular.forEach(storeItems, function (v, k) {
                goods_total += parseInt(v.cart.quantity);
            });
            return goods_total;
        };

        // 获取店铺总价
        this.getStoreTotal = function (storeId) {
            var storeItems = this.cartItems[storeId],
                total = 0;
            angular.forEach(storeItems, function (v, k) {
                total += v.goods.sell_price * v.cart.quantity;
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
            var checkout = {total: 0,selected:0};
            angular.forEach(this.cartItems, function (v, k) {
                checkout[k] = {'total':0,'selected':0};
                angular.forEach(v, function (m, n) {
                    checkout[k].total +=1;
                    if (m.selected == true) {
                        checkout[k].selected+=1;
                        checkout['selected']+=1;
                        checkout.total += m.cart.quantity* m.goods.sell_price;
                    }
                });
            });
            return checkout;
        };

        // 判断店铺是否是全编辑状态
        this.getStoreAllState = function(){
            var storeLenth = Object.keys(this.cartItems).length,
                editLength = 0;

            angular.forEach(this.cartItems,function(v,k){
                var storeEdit = 0,goodsLen = v.length;
                angular.forEach(v,function(m,n){
                    if(m.editNow){
                        storeEdit++;
                    }
                    if(storeEdit == goodsLen){
                        editLength++;
                    }
                })
            });

            if(storeLenth == editLength && storeLenth > 0){
               return true;
            }
            return false;

        };

        // 全选
        this.selectAll = function(flag){
            var storeId = this.getStoreId();
            var _self = this;
            angular.forEach(storeId,function(v,k){
                _self.selectStore(v,flag);
            });
        };


        // 选中所有商铺产品
        this.selectStore = function(storeId,flag){
            var storeItems= this.cartItems[storeId];

            flag == null ? (flag = storeItems[0].seller.selected) : (flag = !flag);

            angular.forEach(storeItems,function(v,k){
                if(flag){
                    v.selected = false;
                    v.seller.selected = false;
                }else{
                    v.selected = true;
                    v.seller.selected = true
                }
            });
        };

        // 确认订单
        this.checkoutNow = function(){
            var checkArray = {},
                goodsIdList = [],
                productIdList =[],
                quantityList=[],
                defaultAddressId = xgAddress.getDefault().address_id || 0;

            angular.forEach(this.cartItems,function(v,k){
                angular.forEach(v,function(m){
                    if(m.selected == true){
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

            $location.path('/order/check/'+checkArray.goods_id_list +'/'+checkArray.product_id_list+'/'+checkArray.quantity_list+'/'+defaultAddressId);
        }
    })

    .service('xgAddress', function(xgApi){

        this.init = function(addressList) {
            angular.forEach(addressList, function (v, k) {
                v.choosed = false;
            });
            this.addressList = addressList;
        };

        this.default = function(id){
            angular.forEach(this.addressList,function(v,k){
                if(v.id == id){
                    v.default = 1;
                }
                v.default = 0;
            });
        };

        this.getDefault = function(id){
            var defAddress = null;
            angular.forEach(this.addressList,function(v,k){
                if(id==null && v.default == 1){
                    defAddress = v;
                }
                if(v.address_id == id){
                    defAddress = v;
                }
            });
            return defAddress;
        };


        this.choose = function(id){
            angular.forEach(this.addressList,function(v,k){
                if(v.id == id){
                    v.choosed = true;
                }
                v.choosed = 0;
            })
        };

    });
