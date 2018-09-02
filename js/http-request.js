var sendPostReq = function(obj_request, successCallBack, errorCallBack, completeCallback) {
  $.ajax({
    url: obj_request.url,
    contentType: "application/json",
    type: 'POST',
    data: obj_request.body_data,
    headers: { 'Authorization': obj_request.auth_header  },
    success: function(response, status, xhr) { 
      if (typeof successCallBack != 'undefined') {
        successCallBack(response, status, obj_request);
        console.log("success post sent");
      }
    },
    error: function(xhr, status, error) {
      if (typeof errorCallBack != 'undefined') {
        errorCallBack(xhr, status, error, obj_request);
        console.log("error post sent");
      }
    },
    complete: function (xhr, status) {
      if (typeof completeCallback != 'undefined') {
        completeCallback(status);
        console.log("complete callback sent");
      }
    }
  });
}

var sendGetReq = function(obj_request, successCallBack, errorCallBack, completeCallback) {
  $.ajax({
    url: obj_request.url,
    type: 'GET',
    dataType: "json",
    headers: { 'Authorization': obj_request.auth_header },
    success: function(response, status, xhr) { 
      if (typeof successCallBack != 'undefined') {
        successCallBack(response, status, obj_request);
        console.log("success get sent");
      }
    },
    error: function(xhr, status, error) {
      if (typeof errorCallBack != 'undefined') {
        errorCallBack(xhr, status, error, obj_request);
        console.log("error get sent");
      }
    },
    complete: function (xhr, status) {
      if (typeof completeCallback != 'undefined') {
        completeCallback(status);
        console.log("complete callback get sent");
      }
    }
  });
}

var sendDeleteReq = function(obj_request, successCallBack, errorCallBack, completeCallback) {
  $.ajax({
    url: obj_request.url,
    type: 'DELETE',
    headers: { 'Authorization': obj_request.auth_header },
    success: function(response, status, xhr) { 
      if (typeof successCallBack != 'undefined') {
        successCallBack(response, status, obj_request);
        console.log("success post sent");
      }
    },
    error: function(xhr, status, error) {
      if (typeof errorCallBack != 'undefined') {
        errorCallBack(xhr, status, error, obj_request);
        console.log("error post sent");
      }
    },
    complete: function (xhr, status) {
      if (typeof completeCallback != 'undefined') {
        completeCallback(status);
        console.log("complete callback sent");
      }
    }
  });
}
