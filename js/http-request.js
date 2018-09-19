var sendPostReq = function(obj_request, successCallBack, errorCallBack, completeCallback) {
if (obj_request.headerpresent === true){
  $.ajax({
    url: obj_request.url,
    contentType: "application/json",
    type: 'POST',
    data: obj_request.body_data,
    'beforeSend': function (request) {
      for( var k=0; k<obj_request.headername.length; k++){
       // console.log(obj_request.headername[k]);
       // console.log(obj_request.headervalue[k]);
        request.setRequestHeader(obj_request.headername[k], obj_request.headervalue[k]);
      }
    },
    headers: { 'Authorization': obj_request.auth_header  },
    start_time: new Date().getTime(),
    success: function(response, status, xhr) { 
      if (typeof successCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        successCallBack(response, status, obj_request, xhr, resp_time);
        console.log("POST XHR request was a success with custom headers");
      }
    },
    error: function(xhr, status, error) {
      if (typeof errorCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        errorCallBack(xhr, status, error, obj_request, resp_time);
        console.log("Recieved an error while executing POST XHR request with custom headers");
      }
    },
    complete: function (xhr, status) {
      if (typeof completeCallback != 'undefined') {
        completeCallback(status);
        console.log("complete callback sent with custom headers");
      }
    }
  });
}
else {
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

}

var sendPutReq = function(obj_request, successCallBack, errorCallBack, completeCallback) {
if (obj_request.headerpresent === true){
  $.ajax({
    url: obj_request.url,
    contentType: "application/json",
    type: 'PUT',
    data: obj_request.body_data,
    'beforeSend': function (request) {
      for( var k=0; k<obj_request.headername.length; k++){
        //console.log(obj_request.headername[k]);
        //console.log(obj_request.headervalue[k]);
        request.setRequestHeader(obj_request.headername[k], obj_request.headervalue[k]);
      }
    },
    headers: { 'Authorization': obj_request.auth_header  },
    start_time: new Date().getTime(),
    success: function(response, status, xhr) { 
      if (typeof successCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        successCallBack(response, status, obj_request, xhr, resp_time);
        console.log("PUT XHR request was a success with custom headers");
      }
    },
    error: function(xhr, status, error) {
      if (typeof errorCallBack != 'undefined') {
        var resp_time = new Date().getTime() - this.start_time;
        errorCallBack(xhr, status, error, obj_request, resp_time);
        console.log("Recieved an error while executing PUT XHR request with custom headers");
      }
    },
    complete: function (xhr, status) {
      if (typeof completeCallback != 'undefined') {
        completeCallback(status);
        console.log("complete callback sent with custom headers");
      }
    }
  });
}
else {
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


}

var sendGetReq = function(obj_request, successCallBack, errorCallBack, completeCallback) {
  if(obj_request.headerpresent === true){
      $.ajax({
        url: obj_request.url,
        type: 'GET',
        contentType: "application/json",
        'beforeSend': function (request) {
          for( var k=0; k<obj_request.headername.length; k++){
            //console.log(obj_request.headername[k]);
            // console.log(obj_request.headervalue[k]);
            request.setRequestHeader(obj_request.headername[k], obj_request.headervalue[k]);
          }
        },
        headers: { 'Authorization': obj_request.auth_header },
        start_time: new Date().getTime(),
        success: function(response, status, xhr) { 
          if (typeof successCallBack != 'undefined') {
            var resp_time = new Date().getTime() - this.start_time;
            successCallBack(response, status, obj_request, xhr, resp_time);
            console.log("GET XHR request with custom content type was a success");
          }
        },
        error: function(xhr, status, error) {
          if (typeof errorCallBack != 'undefined') {
            var resp_time = new Date().getTime() - this.start_time;
            errorCallBack(xhr, status, error, obj_request, resp_time);
            console.log("Recieved an error while executing GET XHR request with custom content type");
          }
        },
        complete: function (xhr, status) {
          if (typeof completeCallback != 'undefined') {
            completeCallback(status);
            console.log("complete callback get sent with custom content type");
          }
        }
      });
  }

  else {
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

}

var sendDeleteReq = function(obj_request, successCallBack, errorCallBack, completeCallback) {

  if(obj_request.headerpresent === true){
    $.ajax({
      url: obj_request.url,
      type: 'DELETE',
      'beforeSend': function (request) {
        for( var k=0; k<obj_request.headername.length; k++){
          //console.log(obj_request.headername[k]);
          //console.log(obj_request.headervalue[k]);
          request.setRequestHeader(obj_request.headername[k], obj_request.headervalue[k]);
        }
      },
      headers: { 'Authorization': obj_request.auth_header },
      start_time: new Date().getTime(),
      success: function(response, status, xhr) { 
        if (typeof successCallBack != 'undefined') {
          var resp_time = new Date().getTime() - this.start_time;
          successCallBack(response, status, obj_request, xhr, resp_time);
          console.log("DELETE XHR request was a success with custom headers");
        }
      },
      error: function(xhr, status, error) {
        if (typeof errorCallBack != 'undefined') {
          var resp_time = new Date().getTime() - this.start_time;
          errorCallBack(xhr, status, error, obj_request, resp_time);
          console.log("Recieved an error while executing DELETE XHR request with custom headers");
        }
      },
      complete: function (xhr, status) {
        if (typeof completeCallback != 'undefined') {
          completeCallback(status);
          console.log("complete callback sent with custom headers");
        }
      }
    });
  }
  else {
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

}
