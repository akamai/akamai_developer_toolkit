var getApiEndPoint = function(name, obj_params) {
  switch(name) {
    case "purge-url":
      return '/ccu/v3/' + obj_params.updatetype + '/url/' + obj_params.network; 
    case "purge-cpcode":
      return '/ccu/v3/' + obj_params.updatetype + '/cpcode/' + obj_params.network; 
    case "purge-tag":
      return '/ccu/v3/' + obj_params.updatetype + '/tag/' + obj_params.network; 
    case "debug-translate-errorcode":
      return '/diagnostic-tools/v2/errors/' + obj_params.errorcode + "/translated-error";
    case "debug-fetchlog-by-ip":
      return '/diagnostic-tools/v2/ip-addresses/' + obj_params.ipaddr + "/log-lines" + obj_params.querystring;
    default:
      return '';
  }
}
