const enkey = '1655959604103034488113670823001292669092';
const possible_keys = [enkey,
  "piez-im-simple",
  "piez-im-advanced",
  "piez-a2",
  "piez-ro-simple",
  "piez-ro-advanced",
  "piez-3pm",
  "piez-off"
];

function a(obj) {
  if (jQuery.isEmptyObject(obj)) {
    return false;
  } else {
    try {
      var str = JSON.stringify(obj)
      var encrypted = CryptoJS.AES.encrypt(str, enkey);
    } catch (err) {
      console.log(err);
      return false;
    }
    return encrypted.toString();
  }
}

function b(enstr) {
  if (enstr == undefined || enstr == null || enstr == '') {
    return false;
  } else {
    for(var y=0; y < possible_keys.length; y++) {
      var de_result = pleaseDecrypt(enstr, possible_keys[y]);
      if (typeof de_result == "object") {
        return de_result;
      }
    }
    return false;
  }
}

function pleaseDecrypt(encrypted_str, possible_key) {
  try {
    var decrypted = CryptoJS.AES.decrypt(encrypted_str, possible_key);
    var str = decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    // console.log("Trying different key " + possible_key);
    console.log(err);
    return false;
  }
  return JSON.parse(str);
}