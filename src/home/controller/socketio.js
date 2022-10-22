'use strict';

import Base from './base.js';
import roomModel from './../game/roommodel';
import roomuserManager from './../game/roomusermanager';
var eventDispatcher = require("./eventdispatcher");
var upgradelogic = require("./../logic/upgradelogic");

var socketList = {};
var roomList = {}; //所有房间列表
var roomCount = 10;
var userCount = 0;
var userList = {};
var onlineCountList = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0 }; //每天各个整点在线用户数
var lastLoginTime = null;
var regesitUser = {}; //注册用户
var regesitUserList = {};//注册用户详细数据

export default class extends Base {
  init(http) {
    super.init(http);
    this.http.header("Access-Control-Allow-Origin", "*");
    this.http.header("Access-Control-Allow-Headers", "X-Requested-With");
    this.http.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    this.http.header("X-Powered-By", ' 3.2.1')
    this.http.header("Content-Type", "application/json;charset=utf-8");
    upgradelogic.socketioProxy = this;
  }
  openAction(self) {
  //  this.http.io.set('heartbeat timeout', 15000);
    var socket = self.http.socket;
    //初始化socket
    socket.on("initSocket", function (uid, uname) {
      socket.emit("getip", socket.handshake.address.substr(7));
      socketList[uname] = socket;
    })
    //断线自动重连
    socket.on("onReconect", function (uid) {
       // socket.emit("notInRoom");
    })
   
    //断开连接
    socket.on("disconnect", function () {
      if (userCount > 0) userCount--;
      for (var k in socketList) {
        if (socketList[k] == socket) {
          delete socketList[k];
          delete userList[k];
          break;
        }
      }
    })
  }

  //添加在线用户
  addUser(udata) {
    userList[udata.uname] = udata;
    userCount++;
    var now = new Date();
    var dateStr = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
    if (regesitUser[dateStr] && (regesitUser[dateStr].indexOf(udata.uname) != -1)) {
      regesitUserList[udata.uname] = udata;
    }
    if (lastLoginTime != null) {
      if (now.getDate() != lastLoginTime.getDate()) {
        onlineCountList = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0, 21: 0, 22: 0, 23: 0 };
        var hours = now.getHours();
        onlineCountList[hours] = userCount;
      } else {
        var lastHours = lastLoginTime.getHours();
        var nowHours = now.getHours();
        for (var i = lastHours + 1; i < nowHours; i++) {
          onlineCountList[i] = onlineCountList[lastHours];
        }
        if (onlineCountList[nowHours] == 0)
          onlineCountList[nowHours] = userCount;
      }
    } else {
      onlineCountList[now.getHours()] = userCount;
    }
    lastLoginTime = now;
  }

  //添加注册用户
  addRegistUser(user) {
    var now = new Date();
    var dateStr = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
    if (!regesitUser[dateStr]) regesitUser[dateStr] = [];
    regesitUser[dateStr].push(user);
  }

   //获取当前在线人数
  getOnlineNumber() {
    var res = {};
    var now = new Date();
    var dateStr = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
    res.regestCount = (!regesitUser[dateStr]) ? 0 : regesitUser[dateStr].length;
    res.userCount = userCount;
    res.roomCount = 0;
    return res;
  }
  //获取房间列表
  getRoomList() {
    return roomList;
  }
  
  //获取在线列表
  getOnlineCountList() {
    return onlineCountList;
  }
  
  //获取在线用户列表
  getOnlineUserList() {
    return userList;
  }
  //获取今日注册用户
  getRegistUserList() {
    return regesitUserList;
  }
  //获取房间信息列表
  getRoomDataList() {
    
  }

  //获取socket
  getSocketByUname(uname) {
    return socketList[uname];
  }
  //移除socket
  removeSocket(socket) {
    for (var k in socketList) {
      if (socketList[k] == socket) {
        delete socketList[k];
        break;
      }
    }
  }
}