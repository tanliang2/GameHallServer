export default [
  ["adminLogin", 'user/adminlogin'],
  ["onLogin", {post:'user/onlogin'}],
  ["addUser", 'user/adduser'],
  ["getUser", 'user/getuser'],
  ["getRecordData", 'user/getrecorddata'],
  ["getUserById", 'user/getuserbyid'],
  ["alterUserData", 'user/alteruserdata'],
  ["addManager", 'user/addmanager'],
  ["resetManagerPass", 'user/resetmanagerpass'],
  ["notifyWxLogin", 'user/notifywxlogin'],
  ["getWxUserData", 'user/getwxuserdata'],
  ["getOnlineCount", 'plat/getonlinecount'],
  ["getOnlineCountList", 'plat/getonlinecountlist'],
  ["getOnlineUserList", 'plat/getonlineuserlist'],
  ["getRegistUserList", 'plat/getregistuserlist'],
  ["getRoomDataList", 'plat/getroomdatalist'],
  ["getUserPayRecord", 'plat/getuserpayrecord'],
  ["setRoomCard", 'socketio/setusermahjong'],
  ["getPlayback",'playback/getplayback'],
  ["addBot",'socketio/addbot'],
  ["wxOauthLogin","user/wxoauthlogin"],
  ["klgOauthLogin","user/klgoauthlogin"],
  ["getSignature","weixin/getsignature"],

  [/^changelog/, 'index/changelog'],
  [/^doc(?:\/([\d\.\x]+))?\/search$/i, "doc/search?version=:1"],
  [/^doc(?:\/([\d\.\x]+))?\/single$/i, "doc/single?version=:1"],
  [/^doc(?:\/([\d\.\x]+))?(?:\/(.*))?$/i, "doc/index?doc=:2&version=:1"]
];