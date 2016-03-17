### Mobile 请求 H5

#### 支付成功

mobile 请求格式, 无返回

```
target : MobileToH5Request
method : paymentSuccess
params : {
    order_status : xxxx
}
```

#### 支付失败, 无返回

mobile 请求格式

```
target : MobileToH5Request
method : paymentFailure
params : {
    order_str : "xxxxxx",
    pay_type : 100001,
    order_status : xxxx
}
```

