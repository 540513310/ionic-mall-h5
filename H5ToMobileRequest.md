### 入口地址

收货地址
http://app.test.com/#/app/address/list?entry=address

我的订单
http://app.test.com/#/app/order/list?entry=order

我的购物车
http://app.test.com/#/app/shopping/cart?entry=cart

商品
http://app.test.com/#/app/product/6?entry=goods


### H5 请求 Mobile

#### 支付

h5 请求格式

```
target : H5ToMobileRequest
method : payment
params : {
    order_str : "xxxx",
    pay_type : 100001
}
```

#### 请求用户 Session ID

h5 请求格式

```
target : H5ToMobileRequest
method : getSessionId
params : {
    msg : {
        // msg 当客户端用户未登录时，mobile 反向通知 h5 时，原样返回
    }
}
```

mobile 返回格式

```
{
    session_id : 'xxxxxxxxxxxxx'
}
```

#### 返回移动端

```
target : H5ToMobileRequest
method : returnMobile
params : {
    entry : "address", // 返回入口标识
    ...
}
```


#### 弹出分享视图

```
target : H5ToMobileRequest
method : popupShareView
params : {
}
```
