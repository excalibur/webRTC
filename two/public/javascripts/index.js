var socket = io();
var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
var pc_constraints = {"optional": [{"DtlsSrtpKeyAgreement": true}]};

var peerConnection, localStream;


// 根据输入的名字来确定谁是提供方  谁是接收方	
$(function(){
		var name = document.getElementById('name');
		var btn = document.getElementById("submit");

	  	btn.addEventListener("click",function(){
	  		// 提供方
	  		if (name.value == "faith") {
					server();
	  		}else{
	  				other();
	  		}
	  		btn.disabled = true;	
  		});
});


function server(){
	trace("服务器启动");


  peerConnection = new RTCPeerConnection({
      // iceServers are used to bypass firewalls
      // which might block our connection from user to user
      iceServers: [
          {url: 'stun:stun.l.google.com:19302'}
      ]
  },{optional: [{RtpDataChannels: true}]});

	
	
    peerConnection.onicecandidate = onIceCandidate;
	peerConnection.createOffer(getLocalDescription, descriptionError);;

}


function other(){
	trace("用户连接");

  peerConnection = new RTCPeerConnection({
      // iceServers are used to bypass firewalls
      // which might block our connection from user to user
      iceServers: [
          {url: 'stun:stun.l.google.com:19302'}
      ]
  },{optional: [{RtpDataChannels: true}]});
}


function onIceCandidate(event) {
	trace("onIceCandidate");
	if (event.candidate) {
		sendMessage({type: 'candidate',                        
			label: event.candidate.sdpMLineIndex,                     
			id: event.candidate.sdpMid,                        
			candidate: event.candidate.candidate});
	} else {
		trace("End of candidates.");
	}
}


function sendMessage(message) {
	trace("======sendMessage==========");
	var msgString = JSON.stringify(message);
	trace(msgString);
	socket.emit('candidate', msgString);
}

 socket.on('candidate', function(msg){
    console.log('message: ' + msg);

    if (peerConnection) {
    	return;
    };
    

  });

 function getLocalDescription(desc) {
    //local peer set local description
    peerConnection.setLocalDescription(desc);
    trace("Remote peer get offer from local peer. \n" + desc.sdp);
    //remote peer set remote description
    peerRemoteConnection.setRemoteDescription(desc);
 
    peerRemoteConnection.createAnswer(getRemoteDescription, descriptionError);
}
 