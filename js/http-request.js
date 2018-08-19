var sendPostReq = function(obj_request, successCallBack, errorCallBack, completeCallback) {
  $.ajax({
    url: obj_request.baseurl,
    contentType: "application/json",
    type: 'POST',
    data: obj_request.body_data,
    headers: { 'Authorization': obj_request.auth_header },
    success: function(response, status, xhr) { 
      if (typeof successCallBack != 'undefined') {
        successCallBack(response, status, obj_request);
      }
    },
    error: function(xhr, status, error) {
      if (typeof errorCallBack != 'undefined') {
        errorCallBack(xhr, status, error, obj_request);
      }
    },
    complete: function (xhr, status) {
      if (typeof completeCallback != 'undefined') {
        completeCallback(status);
      }
    }
  });
} 
