angular.module('xgStore.services')

  .service('xgOrder', function (xgApi,$ionicLoading,$timeout) {
    // 订单数据集合
    this.ordersList = [];

    this.initOrderList = function () {
      this.ordersList = [
        {
          tabName: '全部',
          list: [],       //Tab订单数组
          badge: 0,       // Tab的badge数
          current: 1,     // Tab的当前页数
          more: true      // 获取更多
        },
        {
          tabName: '待付款',
          list: [],       //Tab订单数组
          badge: 0,       // Tab的badge数
          current: 1,     // Tab的当前页数
          more: true      // 获取更多
        },
        {
          tabName: '待发货',
          list: [],       //Tab订单数组
          badge: 0,       // Tab的badge数
          current: 1,     // Tab的当前页数
          more: true     // 获取更多
        },
        {
          tabName: '待收货',
          list: [],       //Tab订单数组
          badge: 0,       // Tab的badge数
          current: 1,     // Tab的当前页数
          more: true      // 获取更多
        },
        {
          tabName: '交易完成',
          list: [],       //Tab订单数组
          badge: 0,       // Tab的badge数
          current: 1,     // Tab的当前页数
          more: true      // 获取更多
        }
      ];
    }

    this.init = function (data, params) {
      if (params.init) {
        this.initOrderList();
      }
      var ordersGroup = this.ordersList;
      var tabIndex = params.order_tab? params.order_tab : 0;

      ordersGroup[1].badge = data.wait_pay_count;
      ordersGroup[2].badge = data.wait_send_goods_count;
      ordersGroup[3].badge = data.wait_receive_goods_count;


      // 返回长度小于20不再加载更多
      //if(data.order_list.length <20){
      //  ordersGroup[tabIndex].more = false;
      //  return;
      //}

      angular.forEach(data.order_list, function(order, order_key){
        order.total_goods_num = 0;
        order.total_goods_price = 0;
        angular.forEach(order.order_goods_list, function (goods, goods_key) {
          goods.goods_array = angular.fromJson(goods.goods_array);
          order.total_goods_num += goods.goods_nums;
          order.total_goods_price += goods.real_price * goods.goods_nums;
        });
      });

      ordersGroup[tabIndex].list = ordersGroup[tabIndex].list.concat(data.order_list);
      ordersGroup[tabIndex].current = params.page ? params.page + 1 : 1;

      if (data.order_list.length < 20) {
        $timeout(function(){
          ordersGroup[tabIndex].more = false;
        },1500);
      }

      this.ordersList = ordersGroup;
    };

    /*
     * 获取订单列表
     * params{
     *  order_tab: 0,
     *  page : 1
     * }
     * */
    this.getOrderList = function (params) {
      var _self = this;
      xgApi.requestApi("/api/order/rows", params)
        .then(function (result) {
          // 订单数组长度为0
          if (result.order_list.length < 20) {
            _self.ordersList[params.order_tab].more = false;
          }
          _self.init(result, params);
        })
    };

    this.cancel = function(order_id,tabOn){
      var _self = this;
      xgApi.requestApi("/api/order/cancel", {order_id: order_id}).then(function (result) {
        var tabIndex = tabOn ? tabOn : 0;
        // 当在tab2取消订单时
        if(tabIndex == 1){
          angular.forEach(_self.ordersList[0].list,function(v,k){
            if(v.id == order_id){
              v.status = 3;
              v.status_tag = '交易关闭';
            }
          });
          angular.forEach(_self.ordersList[1].list,function(v,k){
            if(v.id == order_id){
              _self.ordersList[1].list.splice(k,1);
              _self.ordersList[1].badge = _self.ordersList[1].badge -1 ;
            }
          });
        }else if(tabIndex == 0){
          angular.forEach(_self.ordersList[0].list,function(v,k){
            if(v.id == order_id ){
              v.status = 3;
              v.status_tag = '交易关闭';
              _self.ordersList[1].badge = _self.ordersList[1].badge -1 ;
            }
          });
          angular.forEach(_self.ordersList[1].list,function(v,k){
            if(v.id == order_id ){
              _self.ordersList[1].list.splice(k,1);
            }
          });
        }

        $ionicLoading.show({template: result.msg, noBackdrop: true, duration: 1000})
      }, function (message) {
        $ionicLoading.show({template: message, noBackdrop: true, duration: 1000})
      });
    }

    this.remove = function(order_id){
      var _self = this;
      xgApi.requestApi("/api/order/delete", {order_id: order_id}).then(function (result) {
        //var i = NaN;
        //angular.forEach(_self.ordersList[0].list,function(v,k){
        //  if(v.id == order_id){
        //    i = k;
        //  }
        //});
        //if(i !== NaN){
        //  _self.ordersList[0].list.splice(i,1);
        //}
        $ionicLoading.show({template: result.msg, noBackdrop: true, duration: 1000})
      }, function (message) {
        $ionicLoading.show({template: message, noBackdrop: true, duration: 1000})
      });
    }
  });
