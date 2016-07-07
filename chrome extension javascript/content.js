// INTERFACE WITH ORIGINAL WEB PAGE
// JS CAN ACCESS THE PAGE, BUT NOT THE OTHER WAY AROUND

chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {

		var status = document.querySelector("#bluc_status");
		var error_code = document.querySelector("#bluc_error_code");
		var error_message = document.querySelector("#bluc_error_message");
		var thumbprint = document.querySelector("#bluc_thumbprint");
		var subject = document.querySelector("#bluc_subject");
		var key_size = document.querySelector("#bluc_key_size");
		var certb64 = document.querySelector("#bluc_certb64");
		var loadIcon = document.querySelector("#bluc_load_icon");
		var loadExtension = document.querySelector("#bluc_load_extension");
		

		//if(loadIcon == null || loadIcon.innerHTML === false) {
//		} else {
		if(loadIcon.innerHTML === 'true') {
			switch(message.type) {
				// STEP 3 SIGN
				case "sign":
					status.innerHTML= 'getCertificate';
					
					var changeEvent = document.createEvent("HTMLEvents");
					changeEvent.initEvent("change", true, true);
					status.dispatchEvent(changeEvent);

					sendResponse();
				break;
				// STEP 7 SIGN
				case "postGetCertificate":
					status.innerHTML= 'postGetCertificate';
					thumbprint.innerHTML= message.thumbprint;
					subject.innerHTML= message.subject;
					key_size.innerHTML= message.keySize;
					certb64.innerHTML= message.certb64;



					var changeEvent = document.createEvent("HTMLEvents");
					changeEvent.initEvent("change", true, true);
					certb64.dispatchEvent(changeEvent);

					var loadSignatureUrlSpan = document.querySelector("#bluc_load_signature_url");
					var loadSignatureUrl = loadSignatureUrlSpan.innerHTML;

					sendResponse({ "loadSignatureUrl" : loadSignatureUrl,
					"certb64" : message.certb64,
					"thumbprint" : message.thumbprint,
					"keySize" : message.keySize

						});
				break;
				case "postLoadSignature":
					var hash = document.querySelector("#bluc_hash");
					hash.innerHTML = message.hash;
					var time = document.querySelector("#bluc_time");
					time.innerHTML = message.time;
					var signed_attr = document.querySelector("#bluc_signed_attr");
					signed_attr.innerHTML = message.signed_attr;
					var hash_alg = document.querySelector("#bluc_hash_alg");
					hash_alg.innerHTML = message.hash_alg;





					var changeEvent = document.createEvent("HTMLEvents");
					changeEvent.initEvent("change", true, true);
					signed_attr.dispatchEvent(changeEvent);

					sendResponse();
				break;

				case "postIsActive":
					status.innerHTML= 'postIsActive';
					error_code.innerHTML= message.status;
					error_message.innerHTML= message.message;
					var changeEvent = document.createEvent("HTMLEvents");
					changeEvent.initEvent("change", true, true);
					if(message.status != 0){
						loadIcon.innerHTML = 'false'
						error_code.dispatchEvent(changeEvent);
					} else {
						bluc_load_native.dispatchEvent(changeEvent);						
					}

					sendResponse();
				break;
				case "loadIcon":
					status.innerHTML= 'loadIcon';

					var changeEvent = document.createEvent("HTMLEvents");
					changeEvent.initEvent("change", true, true);
					loadExtension.dispatchEvent(changeEvent);


					sendResponse('loadIcon');
				break;
				case "postSign":
					// STEP 13 SIGN
					console.log(JSON.stringify(message));
					if(message.status == 0){

						var createEnvelopeUrlSpan = document.querySelector("#bluc_create_envelope_url");
						var createEnvelopeUrl = createEnvelopeUrlSpan.innerHTML;
						var signed_attr = document.querySelector("#bluc_signed_attr");
						var hash_alg = document.querySelector("#bluc_hash_alg");
						var time = document.querySelector("#bluc_time");
						var hash = document.querySelector("#bluc_hash");

						var responseMsg = {
							createEnvelopeUrl_value : createEnvelopeUrl,
							certb64_value : certb64.innerHTML,
							signed_attr_value : signed_attr.innerHTML,
							hash_alg_value : hash_alg.innerHTML,
							time_value : time.innerHTML,
							hash_value : hash.innerHTML,
							sign_value : message.sign
						};
						sendResponse(responseMsg);
					} else {
						alert("houve um erro na execução da assinatura. Status= "+message.status);
					}
				break;

				case "postCreateEnvelope":

					status.innerHTML= 'postCreateEnvelope';
					error_code.innerHTML= '1';
					error_message.innerHTML= 'problema na assinatura';
					var signedEnvelope = document.querySelector("#bluc_signed_envelope");

					if(message.isOk_value){
						signedEnvelope.innerHTML = message.signedContent_value;
						error_code.innerHTML= 0;
						error_message.innerHTML= "Assinatura gerada com sucesso.";

						var changeEvent = document.createEvent("HTMLEvents");
						changeEvent.initEvent("change", true, true);
						signedEnvelope.dispatchEvent(changeEvent);
					} else {
						var changeEvent = document.createEvent("HTMLEvents");
						changeEvent.initEvent("change", true, true);
						error_code.dispatchEvent(changeEvent);

					}



					sendResponse();
				break;
			}
		}
});



