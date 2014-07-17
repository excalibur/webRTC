var socket = io();
var localStream;
var iceServer = {
    "iceServers": [{
        "url": "stun:stun.l.google.com:19302"
    }]
};
var peerConnection, localStream;


// 根据输入的名字来确定谁是提供方  谁是接收方	
$(function(){
		var name = document.getElementById('name');
		var btn = document.getElementById("submit");

	  	btn.addEventListener("click",function(){


	  		peerConnection = new RTCPeerConnection(iceServer,{optional: [{RtpDataChannels: true}]});
			
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


	
 	navigator.getUserMedia({video: true,audio: true},
          function(stream) {

          	localStream = stream;
          	// var video = document.createElement("video");
          	// attachMediaStream(video, stream);

          	// document.body.appendChild(video);
          	// video.play();

            peerConnection.addStream(localStream);
			
			peerConnection.createOffer(createOffer, function(err) {
              // Handle create offer error.
              console.log("createOffer error");
          }, {
              mandatory: {  // Media constrains.
                  OfferToReceiveAudio: true,
                  OfferToReceiveVideo: true
              }
          });

          },
          function(error) {
            console.log("Video capture error: ", error.code);
          });
      
peerConnection.onicecandidate = onIceCandidate;
	
}


function other(){
	trace("用户连接");
	
	
 	
 	peerConnection.onaddstream = function(event){
 		trace("接收到流");
 	};
	peerConnection.onicecandidate = onIceCandidate;
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
	// var msgString = JSON.stringify(message);
	// trace(msgString);
	socket.emit('candidate', message);
}

 socket.on('candidate', function(msg){
    console.log('接受到房间信息');
    
    if (!peerConnection) {
    	return;
    };
    

    if (msg.type == "candidate") {
    	console.log("candidate");
    	peerConnection.addIceCandidate(new RTCIceCandidate(msg.candidate));
    }else if (msg.type == "offer"){
    	console.log("offer");
    	peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    	peerConnection.createAnswer(createAnswer,function(err) {
         // Failed to set description. Handle error. 
         console.log("createAnswer error");
         console.log(err);
     },{
        mandatory: { // Media constrains.
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    });
    }else if(msg.type == "answer"){
			console.log("answer");
    }

  });

function createOffer(desc){
	console.log(desc);
	peerConnection.setLocalDescription(desc,function(){
		socket.emit('candidate', desc);
	}, function(err) {
              // Handle create offer error.
               console.log("error");
          });

}


function createAnswer(desc){
	console.log("createAnswer");
	peerConnection.setLocalDescription(desc,function(){
		socket.emit('candidate', desc);
	}, function(err) {
              // Handle create offer error.
              console.log("error");
          });
	
	
}