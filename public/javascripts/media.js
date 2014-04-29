// // 初始话
// var rtcMultiConnection = new RTCMultiConnection();

// // 默认开启数据传输
// rtcMultiConnection.session = { data: true };


// rtcMultiConnection.sdpConstraints.mandatory = {
//     OfferToReceiveAudio: true,
//     OfferToReceiveVideo: true
// };

// // 自定义签名
// rtcMultiConnection.openSignalingChannel = function(config){
// 	// 获取通信地址
// 	console.log("openSignalingChannel");
// 	config.channel = config.channel || this.channel;
// 	console.log(config.channel);
// }
// rtcMultiConnection.onopen = function(e) {
// 	console.log("onopen");
// }
// function allowVolume(e){
// 	console.log('allowVolume');
// }
// function allowVideo(e){
// 	console.log('allowVideo');
// 	Room.session = {
// 		audio: true, 
// 		video: true
// 	}
// 	rtcMultiConnection.captureUserMedia(function(stream) {
//         var streamid = rtcMultiConnection.token();
//         rtcMultiConnection.customStreams[streamid] = stream;

//         rtcMultiConnection.sendMessage({
//             hasCamera: true,
//             streamid: streamid,
//             session: Room.session 
//         });
//     }, Room.session);
// }

 var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);


var RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
var RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
var PeerConnection = (window.PeerConnection ||
                    window.webkitPeerConnection00 || 
                    window.webkitRTCPeerConnection || 
                    window.mozRTCPeerConnection);

//使用Google的stun服务器
var iceServer = {
    "iceServers": [{
        "url": "stun:stun.anyfirewall.com:3478"
    }]
};

//创建PeerConnection实例
var pc = new PeerConnection(iceServer);

// 连接socket.io
// 
var socket = io.connect('http://localhost:80');

//发送ICE候选到其他客户端
pc.onicecandidate = function(event){
	console.log("onicecandidate");
    socket.emit("icecandidate",{
        "event": "__ice_candidate",
        "data": {
            "candidate": event.candidate
        }
    });
};

//如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
pc.onaddstream = function(event){
	console.log("onaddstream");
    var video = document.createElement("video");
    video.autoplay = true;
    video.src = URL.createObjectURL(event.stream);
    $("#videos").append(video);
};

//处理到来的信令
socket.on("message",function(json){
	console.log("message");
	console.log(json.data.candidate);
	if( json.event === "__ice_candidate" ){
		if(json.data.candidate == null){
			return;
		}
        pc.addIceCandidate(new RTCIceCandidate(json.data.candidate));
    } else {
        pc.setRemoteDescription(new RTCSessionDescription(json.data.sdp));
    }
});
 //发送offer和answer的函数，发送本地session描述
function sendOfferFn(desc){
	console.log("sendOfferFn");
	console.log(desc);
    pc.setLocalDescription(desc);

    socket.emit("sendOffer",{ 
        "event": "__offer",
        "data": {
            "sdp": desc
        }
    });
};

function sendAnswerFn(desc){
	console.log("sendAnswerFn");
            pc.setLocalDescription(desc);
            socket.emit("message",{ 
                "event": "__answer",
                "data": {
                    "sdp": desc
                }
            });
};

/** video: 是否接受视频流
* audio：是否接受音频流
* MinWidth: 视频流的最小宽度
* MaxWidth：视频流的最大宽度
* MinHeight：视频流的最小高度
* MaxHiehgt：视频流的最大高度
* MinAspectRatio：视频流的最小宽高比
* MaxAspectRatio：视频流的最大宽高比
* MinFramerate：视频流的最小帧速率
* MaxFramerate：视频流的最大帧速率
 */
    getUserMedia.call(navigator, {
        video: true,
        audio: true
    }, function(stream) {
        var video = document.createElement('video');
        video.src = window.URL.createObjectURL(stream);
        video.autoplay = true;
        $("#videos").append(video);
        //向PeerConnection中加入需要发送的流
	    pc.addStream(stream);
	    //如果是发送方则发送一个offer信令，否则发送一个answer信令
	    if($("meta[name=username]").attr("content") == "faith"){
	        pc.createOffer(sendOfferFn);
	    } else {
	        pc.createAnswer(sendAnswerFn);
	    }
    }, function(e) {
        console.log('Reeeejected!', e);
    });

