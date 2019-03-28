if (typeof Yukon == 'undefined') {
    Yukon = {};
}
/* 
  服务器config.json
  Bus: "http://116.62.162.194:6200/message"
  ApsPost:"https://api.imclouds.com.cn/"
*/
Yukon.Url = {
  Bus: '',
  Config:'/static/config.json',
  /*发布使用*/
  /*Config:'/manage/static/config.json' */
};
Yukon.Action = {
  GetJsonData: '/ApiGeneral/GetJsonData',
  SetJsonData: '/ApiGeneral/SetJsonData',
  Import: '/ApiGeneral/Import',
  Export: '/ApiGeneral/Export',
  Login:'/ApiGeneral/Login'
}
Yukon.ServiceName={
   Tenant:'Tenant',
   JobBooking:'JobBooking',
   Workflow:'Workflow',
   WMS:'WMS',
   APS:'APS',
   Sale:'Sale',
   Message:'Message',
   Agent:'Agent',
   Log:'Log',
};
Yukon.Route = {
  Login: "login",         
  Index: "index",
  Lock:  "lock"    
};