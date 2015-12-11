// Trigger event from popup file.

// INTERFACE WITH NATIVE MESSAGING

// STEP 1 SIGN <- main.js . goSign
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "sign":
            sign();
            sendResponse();
		break;
    }
    return true;
});


// send a message to the content script for DOM manipulation
// STEP 2 SIGN
var sign = function() {

	chrome.tabs.getSelected(null, function(tab){
		// STEP 3 SIGN -> content.js . onMessage.addListener
	    chrome.tabs.sendMessage(tab.id, {type: "sign"},function(response){
			getCertificate();
    	});
	});
}

// STEP 4 SIGN
function getCertificate() {
	op = 'getCertificate';
	connect()
	message =  "{\"operation\":\"getCertificate\"}";
  	sendNativeMessage(message)
}

// STEP 6 SIGN -> content.js . onMessage.addListener
var postGetCertificate = function(appThumbprint, appCertb64, appSubject, appKeySize) {

	chrome.tabs.getSelected(null, function(tab){
	    chrome.tabs.sendMessage(tab.id, {type: "postGetCertificate",
	    thumbprint: appThumbprint, certb64: appCertb64,
	    subject: appSubject, keySize: appKeySize},function(response){
		// STEP 8 SIGN
		// ----  handling Load Signature - BEGIN
		var alg = 'sha1';
		if(response.keySize >= 2048){
				alg = 'sha256';
		}
			loadSignature(response.certb64, response.thumbprint, alg, response.loadSignatureUrl);
		// ---  handling Load Signature - END

    	});
	});
}

var postSign = function(message){
		// STEP 12 SIGN

		chrome.tabs.getSelected(null, function(tab){
			chrome.tabs.sendMessage(tab.id, {type: "postSign",
			status: message.status,
			message: message.message,
			sign: message.sign
			},function(responseMsg){
				console.log("postSign response");
				console.log(JSON.stringify(responseMsg));

				createEnvelope(responseMsg.createEnvelopeUrl_value,
				responseMsg.certb64_value,
				responseMsg.signed_attr_value,
				responseMsg.hash_alg_value,
				responseMsg.time_value,
				responseMsg.hash_value,
				responseMsg.sign_value
				);
			});
		});
}

var postIsActive = function(appStatus) {

	if(appStatus != 0){
		chrome.tabs.getSelected(null, function(tab){
			chrome.tabs.sendMessage(tab.id, {type: "postIsActive",
			status: appStatus},function(response){

			});
		});
	}
}


function postLoadSignature(hash_value, time_value, sa_value, hash_alg_value){
	chrome.tabs.getSelected(null, function(tab){
				chrome.tabs.sendMessage(tab.id, {type: "postLoadSignature",
				hash: hash_value,
				time: time_value,
				signed_attr: sa_value,
				hash_alg: hash_alg_value
				},function(response){

				});
		});
}


function postCreateEnvelope(signedContent, isOk){
	chrome.tabs.getSelected(null, function(tab){
				chrome.tabs.sendMessage(tab.id, {type: "postCreateEnvelope",
				signedContent_value: signedContent,
				isOk_value: isOk
				},function(response){

				});
		});
}

var cnt = 0;
var loadIcon = function() {
	chrome.tabs.getSelected(null, function(tab){
	    chrome.tabs.sendMessage(tab.id, {type: "loadIcon"},function(response){
				if(response == 'loadIcon'){
					chrome.pageAction.show(tab.id);
					isActive();
				} else {
					chrome.pageAction.hide(tab.id);
				}
			cnt = cnt +1;
    	});
	});
}



function isActive() {
	op = 'isActive';
	connect()
	message =  "{\"operation\":\"isActive\"}";
  	sendNativeMessage(message)
}

// NATIVE MESSAGING//////////////////

var port = null;
var op = "";

var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}

function appendMessage(text) {
  console.log(text);
}

function sendNativeMessage(message) {
  port.postMessage(message);
  appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}

function connect() {
  var hostName = "bluecrystal.signer";
  appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
  port = chrome.runtime.connectNative(hostName);
  port.onMessage.addListener(onNativeMessage);
  port.onDisconnect.addListener(onDisconnected);
}

function onDisconnected() {

  appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  port = null;
}


function connectAndSend(message) {
  connect()
  sendNativeMessage(message)
}

function onNativeMessage(message) {
	if(op == 'getCertificate'){
		// STEP 5 SIGN
		postGetCertificate(message.thumbprint, message.certb64, message.subject, message.keySize);
	} else if(op == 'sign'){
		// STEP 11 SIGN
		postSign(message);
	} else {
		postIsActive(message.status);
	}
}

//--- LOAD ICON ----

// STEP 1 ICON -???
chrome.tabs.onUpdated.addListener(function(id, info, tab){
	loadIcon();
});




// util funcs

function loadSignature(certificate, thumbprint, hashAlg, loadSignatureUrl)
{
	// STEP 9 SIGN
	$.ajax({
        type: 'GET',
        url: loadSignatureUrl,
        data: { cert: certificate,
        	alg: hashAlg},
        success: function (data) {
            hash_value =  data.hash_value;
            time_value = data.time_value;
            sa_value = data.sa_value;

            postLoadSignature(hash_value, time_value, sa_value, hashAlg);
            signContent(thumbprint, hashAlg, sa_value);

            <!-- End Sign -->

	        },
            error: function (error) {
                alert('error: ' + eval(error));
            }
     });

}

function createEnvelope(createEnvelopeUrl, certificate, payload, hashAlg, time_value, hash_value, sign)
{
	<!-- STEP 5: CREATE ENV -->
	$.ajax({
		 type: 'GET',
	        url: createEnvelopeUrl,
	        data: {
	        	hash_value: hash_value,
	        	time_value: time_value,
	        	sa_value: payload,
	        	signed_value: sign,
	        	cert: certificate,
	        	alg: hashAlg
	        },
	        success: function (data) {
	        	var json = $.parseJSON(data);
	        	var signedContent = json.signedContent;
	        	var isOk = json.isOk;
	        	var certB64 =  json.certB64;
	        	var certSubject =  json.certSubject;
	        	if(isOk){
	        		 postCreateEnvelope(signedContent, isOk);
	        	 } else {
	        		 alert('Assinatura inválida');
	        	 }
	        },
            error: function (error) {
                alert('error: ' + eval(error));
            }

		});


}

function signContent(thumbprint, alg, sa_b64) {

// STEP 10 SIGN
	op = 'sign';

	 var sign_type = 0;
	 if(alg === 'sha256'){
		 sign_type = 2;
	 }
	connect();

	var message = { "operation" : "sign",
					"thumbprint" : thumbprint,
					"sign_type" : sign_type,
					"sa_b64" : sa_b64
	};
	console.log(JSON.stringify(message));

  	sendNativeMessage(message);
}
