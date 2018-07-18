function getTimeStampInUtc() {
  obj_date = new Date();
  year = obj_date.getUTCFullYear();
  month = obj_date.getUTCMonth() + 1;
  date = obj_date.getUTCDate();
  hours = obj_date.getUTCHours();
  minutes = obj_date.getUTCMinutes();
  seconds = obj_date.getUTCSeconds();
  temp_arr = [year, month, date, hours, minutes, seconds]
  for (i = 0; i < temp_arr.length; i++) {
    if (temp_arr[i] < 10) {
      temp_arr[i] = '0' + temp_arr[i];
    }
  }
  return temp_arr[0] + temp_arr[1] + temp_arr[2] + 'T' + temp_arr[3] + ':' + temp_arr[4] + ':' + temp_arr[5] + '+0000';
}

function authHeaderValueWithOutSignature(apiTokens, timestamp) {
  var without_signature = 'EG1-HMAC-SHA256 client_token=' + apiTokens['clienttoken'] + ';';
  without_signature += 'access_token=' + apiTokens['accesstoken'] + ';';
  without_signature += 'timestamp=' + timestamp + ';';
  without_signature += 'nonce=0ffd2fa-cede-43ea-befc-c5b6ea33f32b;';
  return without_signature;
}

function dataToSign(apiTokens, without_signature, timestamp, body, method) {
  var parser = document.createElement('a');
  parser.href = apiTokens['baseurl'];
  arr_t = [method, parser.protocol.replace(":", ""), parser.hostname, parser.pathname + parser.search].join('\t');
  var hash_body_in_base64 = "";
  if (body != "") {hash_body_in_base64 = CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(body));}
  data_to_sign = arr_t + '\t\t' + hash_body_in_base64 + '\t' + without_signature;
  return data_to_sign;
}

function postBody(arr_objects) {
  post_data = { 'objects': new Array() };
  for(var i=0; i < arr_objects.length; i++) {
    post_data['objects'].push(arr_objects[i]);
  }
  return JSON.stringify(post_data);
}

function authorizationHeader(ingredient) {
  var method = ingredient.method;
  var tokens = ingredient.tokens;
  var body = (method == 'POST') ? ingredient.body : "";
  var timestamp = getTimeStampInUtc();
  var auth_header_without_signature = authHeaderValueWithOutSignature(tokens, timestamp);
  var data_to_sign = dataToSign(tokens, auth_header_without_signature, timestamp, body, method);
  var signing_key_hash_in_base64 = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp, tokens['secret']));
  var signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(data_to_sign, signing_key_hash_in_base64));
  return authorization_header = auth_header_without_signature + 'signature=' + signature;
}

