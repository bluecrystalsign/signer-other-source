// JS ATTACHED TO THE POPUP PAGE

function goSign() {
	        chrome.extension.sendMessage(
				{type: "sign"},function(reponse){
	    	});
}
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('sign-button').addEventListener(
      'click', goSign);
});





