var sendPostReq = function(obj_request, successCallBack, errorCallBack, completeCallback) {
  $.ajax({
    url: obj_request.url,
    contentType: "application/json",
    type: 'POST',
    data: obj_request.body_data,
    headers: { 'Authorization': obj_request.auth_header  },
    start_time: new Date().getTime(),
    success: function(response, status, xhr) { 
      if (typeof successCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        successCallBack(response, status, obj_request, xhr, resp_time);
        console.log("POST XHR request was a success");
      }
    },
    error: function(xhr, status, error) {
      if (typeof errorCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        errorCallBack(xhr, status, error, obj_request, resp_time);
        console.log("Recieved an error while executing POST XHR request");
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

var sendPutReq = function(obj_request, successCallBack, errorCallBack, completeCallback) {
  $.ajax({
    url: obj_request.url,
    contentType: "application/json",
    type: 'PUT',
    data: obj_request.body_data,
    headers: { 'Authorization': obj_request.auth_header  },
    start_time: new Date().getTime(),
    success: function(response, status, xhr) { 
      if (typeof successCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        successCallBack(response, status, obj_request, xhr, resp_time);
        console.log("PUT XHR request was a success");
      }
    },
    error: function(xhr, status, error) {
      if (typeof errorCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        errorCallBack(xhr, status, error, obj_request, resp_time);
        console.log("Recieved an error while executing PUT XHR request");
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
    start_time: new Date().getTime(),
    success: function(response, status, xhr) { 
      if (typeof successCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        successCallBack(response, status, obj_request, xhr, resp_time);
        console.log("GET XHR request was a success");
       // console.log(resp_time);
      }
    },
    error: function(xhr, status, error) {
      if (typeof errorCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        errorCallBack(xhr, status, error, obj_request, resp_time);
        console.log("Recieved an error while executing GET XHR request");
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
    start_time: new Date().getTime(),
    success: function(response, status, xhr) { 
      if (typeof successCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        successCallBack(response, status, obj_request, xhr, resp_time);
        console.log("DELETE XHR request was a success");
      }
    },
    error: function(xhr, status, error) {
      if (typeof errorCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        errorCallBack(xhr, status, error, obj_request, resp_time);
        console.log("Recieved an error while executing DELETE XHR request");
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
