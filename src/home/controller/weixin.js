'use strict';

import Base from './base.js';
var crypto = require('crypto');
var https = require("https");
var iconv = require("iconv-lite");
var request = require('request');
var querystring = require('querystring');
var secret = "91fa83197f3979ed7f17f1a5e245acef";
var appid = "wx37e99724e3bfb8c4";
var js_ticket = "";
var access_token = "";
var refreshTimer = -1;
export default class extends Base {
    init(http) {
        super.init(http);
        this.http.header("Access-Control-Allow-Origin", "*");
        this.http.header("Access-Control-Allow-Headers", "X-Requested-With");
        this.http.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        this.http.header("X-Powered-By", ' 3.2.1')
        this.http.header("Content-Type", "application/json;charset=utf-8");
    }
    //获取微信验证签名
    async getsignatureAction(){
        var url = this.post("url");
	var urlarr = url.split("?");
        if(urlarr[1].charAt(0) == "r")
        {
            url += "&code=" + this.post("code");
            url += "&state=1"
        }else
        {
            url += "&state=1"
        }
        var resData = {};
        resData.status = 0;
        if(js_ticket != "")
        {
            resData.timestamp = Math.floor(new Date().getTime() / 1000).toString();
            resData.noncestr = this.getRandomString(20);
            resData.signature = this.getSignature(resData.noncestr,js_ticket,resData.timestamp,url);
	    console.log("ticket：" + js_ticket);
	    console.log("timestamp：" + resData.timestamp);
            console.log("noncestr：" + resData.noncestr);
	    console.log("url：" + url);
            console.log("signature：" + resData.signature);
            return this.json(resData);
        }else
        {
            var that = this;
            await this.getAccessToken(function(ticket){
                if(ticket != -1)
                {
                    resData.timestamp = Math.floor(new Date().getTime() / 1000).toString();
                    resData.noncestr = that.getRandomString(20);
                    resData.signature = that.getSignature(resData.noncestr,ticket,resData.timestamp,url);
		    console.log("ticket：" + ticket);
	            console.log("timestamp：" + resData.timestamp);
		    console.log("noncestr：" + resData.noncestr);
		    console.log("url：" + url);
		    console.log("signature：" + resData.signature);
                }else
                {
                    resData.status = 1;
                }
                return that.json(resData);
            })
        }
    }
    //微信access_token获取
    async getAccessToken(callback = null) {
        var that = this;
        var url = "";
        clearTimeout(refreshTimer);
        url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appid + "&secret=" + secret;
        var req = https.get(url, function (res) {
            var datas = [];
            var size = 0;
            res.on('data', function (data) {
                datas.push(data);
                size += data.length;
                //process.stdout.write(data);  
            });
            res.on("end", function () {
                var buff = Buffer.concat(datas, size);
                var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring 
                var resJson = JSON.parse(result);
		console.log("resJson:" + JSON.stringify(resJson));
                if (resJson.access_token) {
                    access_token = resJson.access_token;
                    var expires_in = resJson.expires_in;
                    that.getJsTicket(function (ticket) {
                        callback(ticket);
                    })
                    var timeoutTime = expires_in - 300;
                    refreshTimer = setTimeout(function () {
                        that.getAccessToken();
                    }, timeoutTime * 1000);
                } else {
                    console.log("获取asstoken失败,错误码：" + resJson.errcode);
                    callback(-1);
                }
            });
        }).on("error", function (err) {
            console.log(err.stack);
            callback(-1);
        });
    }
    //获取js_ticket
    async getJsTicket(callback) {
        var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + access_token + "&type=jsapi";
        var that = this;
        var req = https.get(url, function (res) {
            var datas = [];
            var size = 0;
            res.on('data', function (data) {
                datas.push(data);
                size += data.length;
            });
            res.on("end", async function () {
                var buff = Buffer.concat(datas, size);
                var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring 
                console.log(result);
                var resJson = JSON.parse(result);
                if (resJson.ticket) {
                    js_ticket = resJson.ticket;
                    callback(js_ticket);
                } else {
                    console.log("获取jsticket失败,错误码：" + resJson.errcode);
                }
                return;
            });
        }).on("error", function (err) {
            console.log(err.stack);
            return;
        })
    }

    /**
    * 生成随机字符串
    */
    getRandomString(length) {
        var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var res = "";
        for (var i = 0; i < length; i++) {
            var id = Math.ceil(Math.random() * 35);
            res += chars[id];
        }
        return res.toLowerCase();
    }
    //获取签名
    getSignature(noncestr,jsapi_ticket,timestamp,url)
    {
        var signString = "jsapi_ticket=" + jsapi_ticket +
                  "&noncestr=" + noncestr +
                  "&timestamp=" + timestamp +
                  "&url=" + url;
        var sha1sum = crypto.createHash('sha1');
        sha1sum.update(signString);
        var sign = sha1sum.digest('hex');
        console.log(sign);
        return sign;
    }
}