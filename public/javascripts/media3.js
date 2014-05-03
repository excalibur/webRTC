var sessions = { };

// 连接socket.io
var socket = io.connect('http://localhost:80');

// 初始话
var rtcMultiConnection = new RTCMultiConnection();

// 默认开启数据传输
rtcMultiConnection.session = { data: true };


rtcMultiConnection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

// 自定义签名
rtcMultiConnection.openSignalingChannel = function(config){
	// 获取通信地址
	console.log("openSignalingChannel");
	config.channel = config.channel || this.channel;
	console.log(config);

    return  {
            send: function (message) {
                socket.emit("icecandidate",{
                    sender: connection.userid,
                    channel: config.channel,
                    message: message
                });
               
            },
            channel: config.channel 
                };
}
rtcMultiConnection.onopen = function(e) {
	console.log("onopen");
}

rtcMultiConnection.customStreams = { };


rtcMultiConnection.onNewSession = function(session) {
   console.log("onNewSession");
};

rtcMultiConnection.onRequest = function(request) {
    console.log("onRequest");
};

rtcMultiConnection.onCustomMessage = function(message) {
    console.log("onCustomMessage");
};

// 根据流处理如何呈现
rtcMultiConnection.onstream = function(e) {
    console.log("onstream");
    console.log(e);
    // 本地流
    if (e.type == "local") {

    }else{

    }

};


rtcMultiConnection.sendMessage = function(message) {
    console.log("sendMessage");
    console.log(message);
};

rtcMultiConnection.onclose = rtcMultiConnection.onleave = function(event) {
    console.log("onclose");
};

// 获取用户信息
function getUserinfo(blobURL, imageURL) {
    return blobURL ? '<video src="' + blobURL + '" autoplay></vide>' : '<img src="' + imageURL + '">';
}

function allowVolume(e){
	console.log('allowVolume');
}
function allowVideo(e){
	console.log('allowVideo');

    var username = $("meta[name=username]").attr("content");

     rtcMultiConnection.extra = {
        username: username,
        color: "#111111"
    };

    var roomid = rtcMultiConnection.channel;

    console.log(roomid);
	Room.session = {
		audio: true, 
		video: true
	}
	rtcMultiConnection.captureUserMedia(function(stream) {
        var streamid = rtcMultiConnection.token();
        rtcMultiConnection.customStreams[streamid] = stream;

        rtcMultiConnection.sendMessage({
            hasCamera: true,
            streamid: streamid,
            session: Room.session 
        });
    }, Room.session);
}

 