'use strict';

import Base from './base.js';
var crypto = require('crypto');
var https = require("https");
var iconv = require("iconv-lite");
var request = require('request');
var querystring = require('querystring');
var access_token = "";
var refresh_token = "";
var scope = "";
var secret = "91fa83197f3979ed7f17f1a5e245acef";
var appid = "wx37e99724e3bfb8c4";

var klgappid = "5fbb0a1228c6a6cf680cadab7f892928";
var klgappkey = "6nqmH?kTcCsJ9h3KrCP";

export default class extends Base {
    init(http) {
        super.init(http);
        this.http.header("Access-Control-Allow-Origin", "*");
        this.http.header("Access-Control-Allow-Headers", "X-Requested-With");
        this.http.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        this.http.header("X-Powered-By", ' 3.2.1')
        this.http.header("Content-Type", "application/json;charset=utf-8");
    }

    //管理员登录 
    async adminloginAction() {
        let uname = this.post("uname");
        let password = this.post("password");
        var resData = {};
        resData.action = "adminLogin";
        var data = await this.model("home/manager").findManager(uname);
        if (data && data.uname) {
            if (data.password == password) {
                resData.status = 0;
                resData.data = {};
                resData.data.name = data.uname;
                resData.msg = "登录成功";
            } else {
                resData.status = 1;
                resData.msg = "密码错误";
            }
        } else {
            resData.status = 2;
            resData.msg = "用户不存在";
        }
        return this.json(resData);
    }
    //玩家登录
    async onloginAction() {
        let uname = this.post("uname");
        let password = this.post("password");
        var resData = {};
        resData.action = "onLogin";
        if (this.controller('home/socketio').getSocketByUname(uname) != null) {
            resData.status = 3;
            resData.msg = "该用户已经登录！";
            return this.json(resData);
        }
        var data = await this.model("user").findUser(uname);
        if (data && data.uname) {
            // var hasher = crypto.createHash("md5");
            // hasher.update(data.password);
            // var hashmsg = hasher.digest('hex');//hashmsg为加密之后的数据
            if (data.password == password) {
                resData.status = 0;
                resData.data = data.userData;
                resData.data.uname = data.uname;
                resData.msg = "登录成功";
                var roomcfg = this.config("roomcfg");
                resData.roomcfg = roomcfg;
                this.controller('home/socketio').addUser(resData.data);
            } else {
                resData.status = 1;
                resData.msg = "密码错误";
            }
        } else {
            resData.status = 2;
            resData.msg = "用户不存在";
        }
        //   this.setCorsHeader();
        return this.json(resData);
    }
    //注册
    async adduserAction() {
        let uname = this.post("uname");
        let password = this.post("password");
        var resData = {};
        resData.action = "addUser";
        var data = await this.model("user").findUser(uname);
        if (data && data.uname) {
            resData.status = 1;
            resData.msg = "用户已存在";
            return this.json(resData);
        } else {
            try {
                await this.model("user").addUser(uname, password);
            } catch (err) {
                resData.status = 2;
                resData.msg = "注册失败";
                return this.json(resData);
            }
            resData.status = 0;
            resData.msg = "注册成功";
            this.controller('home/socketio').addRegistUser(uname);
            return this.json(resData);
        }
    }
    //根据用户名获取用户
    async getuserAction() {
        let uname = this.post("uname");
        var resData = {};
        resData.action = "getUser";
        var data = await this.model("user").findUser(uname);
        if (data && data.uname) {
            resData.status = 0;
            resData.data = data.userData;
            resData.data.uname = data.uname;
            var roomcfg = this.config("roomcfg");
            resData.roomcfg = roomcfg;
            resData.msg = "登录成功";
        } else {
            resData.status = 2;
            resData.msg = "用户不存在";
        }
        return this.json(resData);
    }
    //获取战绩记录
    async getrecorddataAction() {
        var uid = this.post("uid");
        var resData = {};
        resData.action = "getRecordData";
        var data = await this.model("user").getRecordData(uid);
        if (data) {
            resData.recordData = data;
            resData.status = 0;
        } else {
            resData.status = 1;//未找到数据
        }
        return this.json(resData);
    }
    //根据用户id获取用户
    async getuserbyidAction() {
        var uid = this.post("uid");
        var resData = {};
        resData.action = "getUserById";
        var data = await this.model("user").findUserById(uid);
        if (data && data.uname) {
            resData.status = 0;
            resData.data = data.userData;
            resData.msg = "获取用户信息成功";
        } else {
            resData.status = 1;
            resData.msg = "用户不存在";
        }
        return this.json(resData);
    }
    //后台修改用户信息
    async alteruserdataAction() {
        var response = this.post();
        var resData = {};
        resData.action = "getUserById";
        var data = await this.model("user").alterUserData(response.uname, response.nickName, response.password, response.roomCard, response.currency);
        if (data.status == 0) {
            var userlist = this.controller('home/socketio').getOnlineUserList();
            if (userlist[response.uname]) {
                userlist[response.uname].name = response.nickName;
                userlist[response.uname].roomcard = response.roomCard;
            }
            var regesitUserList = this.controller('home/socketio').getRegistUserList();
            if (regesitUserList[response.uname]) {
                regesitUserList[response.uname].name = response.nickName;
                regesitUserList[response.uname].roomcard = response.roomCard;
            }
        }
        resData.data = data;
        return this.json(resData);
    }
    //添加管理员
    async addmanagerAction() {
        let uname = this.post("uname");
        let password = this.post("password");
        var resData = {};
        var udata = await this.model("home/manager").findManager(uname);
        if (udata && udata.uname) {
            resData.status = 1;
            resData.msg = "用户已存在";
            return this.json(resData);
        } else {
            var result = await this.model("home/manager").addManager(uname, password);
            if (result) {
                resData.status = 0;
                resData.msg = "注册成功";
            } else {
                resData.status = 2;
                resData.msg = "注册失败";
            }
            return this.json(resData);
        }
    }
    //重置管理员密码
    async resetmanagerpassAction() {
        let uname = this.post("uname");
        let password = this.post("password");
        var resData = {};
        var data = await this.model("home/manager").resetManagerPass(uname, password);
        resData.msg = (data == 0) ? "重置成功!" : "重置失败!";
        resData.status = data;
        return this.json(resData);
    }
    //微信登录回调
    async notifywxloginAction() {
        var userData = this.post();
        var resData = {};
        var data = await this.model("user").findUser(userData.openid);
        if (data && data.uname) {
            //更新微信用户数据
            this.model("user").updateWxUserData(userData)
        } else {
            //添加微信用户到数据库
            this.model("user").addWxUser(userData);
        }
        resData.msg = "回调处理成功";
        return this.json(resData);
    }
    //玩家登录
    async getwxuserdataAction() {
        var openid = this.post("openid");
        var resData = {};
        resData.action = "getWxUserData";
        var data = await this.model("user").findUser(openid);
        if (data && data.uname) {
            resData.status = 0;
            resData.data = data.userData;
            resData.data.uname = data.uname;
            var roomcfg = this.config("roomcfg");
            resData.roomcfg = roomcfg;
            resData.msg = "登录成功";
            this.controller('home/socketio').addUser(resData.data);
        } else {
            resData.status = 2;
            resData.msg = "用户不存在";
        }
        return this.json(resData);
    }
    //微信授权登录请求
    async wxoauthloginAction() {
        var code = this.post("code");
        var that = this;
        var url = "";
        var resData = {};
        if (refresh_token != "") {
            //url = "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=" + appid + "&grant_type=refresh_token&refresh_token=" + refresh_token;
            url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appid + "&secret=" + secret + "&code=" + code + "&grant_type=authorization_code";
        } else {
            url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + appid + "&secret=" + secret + "&code=" + code + "&grant_type=authorization_code";
        }
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
                if (resJson.errcode) {
                    resData.action = "wxOauthLogin";
                    resData.status = 1;
                    resData.errcode = resJson.errcode;
                    req.end();
                    return that.json(resData);
                }
                refresh_token = resJson.refresh_token;
                access_token = resJson.access_token;
                scope = resJson.scope;
                var openid = resJson.openid;
                //  console.log(result);
                that.getWxUserInfo(access_token, openid, function (returndata) {
                    req.end();
                    return that.json(returndata);
                })
            });
        }).on("error", function (err) {
            console.log(err.stack);
            resData.action = "wxOauthLogin";
            resData.status = 1;
            return that.json(resData);
        });
    }
    async getWxUserInfo(access_token, openid, callback) {
        var url1 = "https://api.weixin.qq.com/sns/userinfo?access_token=" + access_token + "&openid=" + openid + "&lang=zh_CN "
        var that = this;
        var resData = {};
        var req = https.get(url1, function (res1) {
            var datas1 = [];
            var size1 = 0;
            res1.on('data', function (data1) {
                datas1.push(data1);
                size1 += data1.length;
                //process.stdout.write(data);  
            });
            res1.on("end", async function () {
                var buff1 = Buffer.concat(datas1, size1);
                var result1 = iconv.decode(buff1, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring 
                console.log(result1);
                var resJson1 = JSON.parse(result1);
                if (resJson1.errcode) {
                    resData.action = "wxOauthLogin";
                    resData.status = 1;
                    resData.errcode = resJson1.errcode;
                    callback(resData);
                    req.end();
                    return;
                }
                var udata = await that.model("user").findUser(openid);
                if (udata && udata.uname) {
                    //更新微信用户数据
                    await that.model("user").updateWxUserData(resJson1)
                } else {
                    //添加微信用户到数据库
                    await that.model("user").addWxUser(resJson1);
                }
                udata = await that.model("user").findUser(openid);
                resData.action = "wxOauthLogin";
                resData.status = 0;
                resData.data = udata.userData;
                resData.data.uname = udata.uname;
                var roomcfg = that.config("roomcfg");
                resData.roomcfg = roomcfg;
                resData.msg = "登录成功";
                that.controller('home/socketio').addUser(resData.data);
                req.end();
                callback(resData);
                return;
            });
        }).on("error", function (err) {
            console.log(err.stack);
            resData.action = "wxOauthLogin";
            resData.status = 1;
            req.end();
            callback(resData);
            return;
        })
    }
    //恐龙谷登录
    async klgoauthloginAction() {
        var token = this.post("token");
        var that = this;
        var resData = {};
        resData.action = "klgOauthLogin";
        var urlParams = {};
        urlParams.app_id = klgappid;
        urlParams.timestamp = Math.floor(new Date().getTime() / 1000).toString();
        urlParams.token = token;
        var sign = this.signklgLogin(urlParams);
        var url = "http://api.klgwl.com/merchant/user/getUserInfo&sign=" + sign + "&timestamp=" + urlParams.timestamp + "&app_id=" + klgappid + "&token=" + urlParams.token;
        var requestOptions = {
            url: url,
            headers: {
                'Content-Type': 'application/json',
                'charset': 'UTF-8'
            },
            method: 'post',
            body: JSON.stringify(urlParams)
        };
        request(requestOptions, async function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log(body);
                var resBody = JSON.parse(body);
                if (resBody.result == 1 && resBody.data) {
                    var klgudata = resBody.data;
                    var udata = await that.model("user").findUser(klgudata.open_id);
                    if (udata && udata.uname) {
                        //更新恐龙谷用户数据
                        await that.model("user").updateKlgUserData(klgudata)
                    } else {
                        //添加恐龙谷用户到数据库
                        await that.model("user").addKlgUser(klgudata);
                    }
                    udata = await that.model("user").findUser(klgudata.open_id);
                    resData.status = 0;
                    resData.data = udata.userData;
                    resData.data.uname = udata.uname;
                    var roomcfg = that.config("roomcfg");
                    resData.roomcfg = roomcfg;
                    resData.msg = "登录成功";
                    that.controller('home/socketio').addUser(resData.data);
                    return that.json(resData);
                } else {
                    var errData = JSON.parse(body);
                    resData.status = 1;
                    resData.msg = errData.error.msg;
                    return that.json(resData);
                }
            } else {
                console.log('request is error', error);
                resData.status = 0;
                resData.err = error;
                return that.json(resData);
            }
        })
    }

    /**
    * 获取恐龙谷签名
    * @param params 参数
    * @returns {string}
    */
    signklgLogin(params) {
        var stringA = "app_id=" + params.app_id + "&" +
            "timestamp=" + params.timestamp + "&" +
            "token=" + params.token;
        stringA += "@";
        stringA += klgappkey;
        console.log(stringA);
        var md5sum = crypto.createHash('md5');
        md5sum.update(stringA);
        var sign = md5sum.digest('hex');
        console.log(sign);
        return sign;
    }
}