// 'use strict';
// import Base from './base.js';
// var crypto = require('crypto');
// var moment = require("moment");
// var xml2js = require('xml2js');
// var request = require('request');
// var parseString = require('xml2js').parseString;
// export default class extends Base {
//     init(http) {
//         super.init(http);
//         this.http.header("Access-Control-Allow-Origin", "*");
//         this.http.header("Access-Control-Allow-Headers", "X-Requested-With");
//         this.http.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
//         this.http.header("X-Powered-By", ' 3.2.1')
//         this.http.header("Content-Type", "application/json;charset=utf-8");
//     }

//     /**
//  * 生成随机字符串
//  */
//     getRandomString(length) {
//         var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
//         var res = "";
//         for (var i = 0; i < length; i++) {
//             var id = Math.ceil(Math.random() * 35);
//             res += chars[id];
//         }
//         return res.toLowerCase();
//     }

//     /**
//  * 获取微信支付签名
//  * @param params 参数
//  * @param key key
//  * @returns {string}
//  */
//     signWeiXinPay(params, key) {
//         console.log(params);
//         console.log(key);
//         var stringA = "appid=" + params.appid + "&" +
//             "body=" + params.body + "&" +
//             "mch_id=" + params.mch_id + "&" +
//             "nonce_str=" + params.nonce_str + "&" +
//             "notify_url=" + params.notify_url + "&" +
//             "out_trade_no=" + params.out_trade_no + "&" +
//             "spbill_create_ip=" + params.spbill_create_ip + "&" +
//             "time_start=" + params.time_start + "&" +
//             "total_fee=" + params.total_fee + "&" +
//             "trade_type=" + params.trade_type + "&" +
//             "key=" + key;
//         console.log(stringA);
//         // stringA = (new Buffer(stringA)).toString("binary");
//         console.log(stringA);
//         var md5sum = crypto.createHash('md5');
//         md5sum.update(stringA);
//         var sign = md5sum.digest('hex').toUpperCase();
//         console.log(sign);
//         return sign;
//     }

//     /**
//  * 微信支付
//  * @param params 参数
//  * @param callback 回调
//  */
//     weChatPay(params, callback) {
//         //console.log(params);
//         //统一下单
//         var wxParam =
//             {
//                 appid: params.appid,
//                 mch_id: params.mch_id,
//                 nonce_str: getRandomString(32),
//                 body: params.body,
//                 out_trade_no: params.out_trade_no,
//                 total_fee: params.total_fee,
//                 spbill_create_ip: params.spbill_create_ip,
//                 notify_url: params.notify_url,
//                 trade_type: 'APP',
//                 sign: "",
//                 time_start: moment(new Date()).format("YYYYMMDDHHMMSS")
//             };

//         wxParam.sign = signWeiXinPay(wxParam, params.key);
//         //console.log(wxParam);
//         var builder = new xml2js.Builder();
//         var xmlwxParam = builder.buildObject(wxParam);
//         //console.log(xmlwxParam);
//         var requestOptions = {
//             url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
//             headers: {
//                 'Content-Type': 'text/xml',
//                 'charset': 'UTF-8'
//             },
//             method: 'post',
//             body: xmlwxParam
//         };

//         request(requestOptions, function (error, response, body) {
//             if (!error) {
//                 parseString(body, function (err, result) {
//                     if (!err) {
//                         //console.log(result);
//                         var realResult = result["xml"];
//                         //console.log(realResult["return_code"][0]);
//                         var returnCode = realResult["return_code"][0];
//                         if (returnCode === "SUCCESS") {
//                             var prepay_id = realResult["prepay_id"][0];
//                             var returnParam =
//                                 {
//                                     appid: wxParam.appid,
//                                     noncestr: getRandomString(32),
//                                     package: 'Sign=WXPay',
//                                     partnerid: wxParam.mch_id,
//                                     prepayid: prepay_id,
//                                     timestamp: parseInt(new Date().getTime() / 1000).toString()
//                                 };
//                             returnParam.sign = signWeiXinPayReturn(returnParam, params.key);
//                             if (parseInt(params.payDeviceType) === payManager.payDeviceType.android) {
//                                 console.log("安卓");
//                                 var tempParam = returnParam;
//                                 returnParam =
//                                     {
//                                         appId: tempParam.appid,
//                                         nonceStr: tempParam.noncestr,
//                                         packageValue: tempParam.package,
//                                         partnerId: tempParam.partnerid,
//                                         prepayId: tempParam.prepayid,
//                                         timeStamp: tempParam.timestamp,
//                                         sign: tempParam.sign
//                                     }
//                             }
//                             console.log("return");
//                             console.log(returnParam);
//                             callback(null, returnParam);
//                         }
//                         else {
//                             //console.log("失败!");
//                             var errorMessage = "调用微信支付统一下单接口时错误:" + realResult["return_msg"][0];
//                             var errorCode = returnCode;
//                             var wxError = new Error(errorMessage, errorCode);
//                             wxError.status = errorCode;
//                             callback(wxError, {});
//                         }
//                     }
//                     else {
//                         callback(err, {});
//                     }
//                 })
//             }
//             else {
//                 callback(error, {});
//             }
//         });
//     };
// }