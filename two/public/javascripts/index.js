var socket = io();
var localStream, sendChannel;
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

    var msg = document.getElementById("msg");
    var send = document.getElementById("send");

    var file = document.getElementById("file");
    var sendFile = document.getElementById("sendFile");

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

      send.addEventListener("click",function(){

        console.log("==========send=========");
        sendChannel.send(msg.value);

      });

      sendFile.addEventListener("click",function(){

        console.log("==========send file=========");
       var reader = new window.FileReader();
        reader.readAsDataURL(file.files[0]);
        reader.onload = onReadAsDataURL;

      });
});
var chunkLength = 10000;
function onReadAsDataURL(event, text) {
    var data = {}; // data object to transmit over data channel

    if (event) text = event.target.result; // on first invocation

    if (text.length > chunkLength) {
        data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
    } else {
        data.message = text;
        data.last = true;
    }
    console.log(data);
    sendChannel.send(JSON.stringify(data)); // use JSON.stringify for chrome!

    var remainingDataURL = text.slice(data.message.length);
    if (remainingDataURL.length) setTimeout(function () {
        onReadAsDataURL(null, remainingDataURL); // continue transmitting
    }, 10)
}

function saveToDisk(fileUrl, fileName) {
    var save = document.createElement('a');
    save.href = fileUrl;
    save.target = '_blank';
    save.download = fileName || fileUrl;

    var event = document.createEvent('Event');
    event.initEvent('click', true, true);

    save.dispatchEvent(event);
    (window.URL || window.webkitURL).revokeObjectURL(save.href);
}

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
	sendChannel = peerConnection.createDataChannel("sendDataChannel", {reliable: false});

  sendChannel.onopen = handleSendChannelStateChange;

  sendChannel.onclose = handleSendChannelStateChange;
}


function other(){
	trace("用户连接");
	
	
 	
 	peerConnection.onaddstream = function(event){
 		trace("接收到流");
   
    localStream = event.stream;
    var video = document.createElement("video");
    attachMediaStream(video, localStream);
    document.body.appendChild(video);
    video.autoplay = true;
 	};
	peerConnection.onicecandidate = onIceCandidate;

  peerConnection.ondatachannel = gotReceiveChannel;


  
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
  console.log(message);
	socket.emit('candidate', message);
}

 socket.on('candidate', function(msg){
    console.log('接受到房间信息');
    console.log(msg);
    if (!peerConnection) {
    	return;
    };
    

    if (msg.type == "candidate") {
    	console.log("candidate");
    	peerConnection.addIceCandidate(new RTCIceCandidate({
        sdpMLineIndex: msg.label,
        candidate: msg.candidate
    }));
    }else if (msg.type == "offer"){
    	console.log("offer");
    	peerConnection.setRemoteDescription(new RTCSessionDescription(msg));

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
      peerConnection.setRemoteDescription(new RTCSessionDescription(msg));

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


function handleSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  trace('Send channel state is: ' + readyState);
  if (readyState == "open") {

  } else {

  }
}


function gotReceiveChannel(event) {
  trace('Receive Channel Callback');
  sendChannel = event.channel;
  sendChannel.onmessage = handleMessage;
  sendChannel.onopen = handleReceiveChannelStateChange;
  sendChannel.onclose = handleReceiveChannelStateChange;
}

var arrayToStoreChunks = [];
function handleMessage(event) {
  trace('Received message: ' + event.data);
  console.log(event);
  var messages = document.getElementById("messages");
  // var li = document.createElement("li");
  // li.innerHTML = event.data;
  // messages.appendChild(li);
  // alert(event.data);
  var data = JSON.parse(event.data);

    arrayToStoreChunks.push(data.message); // pushing chunks in array

    if (data.last) {
        saveToDisk(arrayToStoreChunks.join(''), 'fake fileName');
        arrayToStoreChunks = []; // resetting array
    }
}

function handleReceiveChannelStateChange() {
  var readyState = sendChannel.readyState;
  trace('Receive channel state is: ' + readyState);
}
