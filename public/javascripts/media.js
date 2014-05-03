// 初始化

var localStream;
var faith;
var other;
var username = $("meta[name=username]").attr("content");
var sdpConstraints = {
  'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true
  }
};





function allowVolume(e){
    console.log('allowVolume');
    call();
}

function allowVideo(e){
    console.log('allowVideo');

   start();
}


// 处理流
function gotStream(stream) {
  trace('Received local stream');
  var localVideo = document.createElement("video");
  localVideo.autoplay = true;

  // 
  attachMediaStream(localVideo, stream);
  
  document.getElementById('videos').appendChild(localVideo);
  localStream = stream;
}


function gotRemoteStream(e) {
  var remoteVideo = document.createElement("video");
  remoteVideo.autoplay = true;
 document.getElementById('videos').appendChild(remoteVideo);
  // Call the polyfill wrapper to attach the media stream to this element.
  attachMediaStream(remoteVideo, e.stream);

 
  trace('pc2 received remote stream');
}


function start(){
     // 打开自己的摄像头和麦克风
    getUserMedia({
      audio: true,
      video: true
    }, gotStream,
    function (e) {
      alert('getUserMedia() error: ' + e.name);
    });
}


function call(){
    trace('Starting call');

    var startTime = performance.now();

    var videoTracks = localStream.getVideoTracks();
    var audioTracks = localStream.getAudioTracks();
    if (videoTracks.length > 0)
        trace('Using video device: ' + videoTracks[0].label);
    if (audioTracks.length > 0)
        trace('Using audio device: ' + audioTracks[0].label);

    var servers = null;

    faith = new RTCPeerConnection(servers);
    trace('Created local peer connection object faith');
    faith.onicecandidate = function(e) { onIceCandidate(faith, e) };

    other = new RTCPeerConnection(servers);
    trace('Created remote peer connection object other');

    other.onicecandidate = function(e){ onIceCandidate(other, e) };

    faith.oniceconnectionstatechange = function(e) { onIceStateChange(faith, e) };
    other.oniceconnectionstatechange = function(e) { onIceStateChange(other, e) };

    other.onaddstream = gotRemoteStream;

    faith.addStream(localStream);
    trace('Added local stream to faith');

    trace('faith createOffer start');
    faith.createOffer(onCreateOfferSuccess, onCreateSessionDescriptionError);

}


function onCreateOfferSuccess(desc) {
  trace('Offer from faith\n' + desc.sdp);

  trace('faith setLocalDescription start');
  faith.setLocalDescription(desc, function() { onSetLocalSuccess(faith); });

  trace('other setRemoteDescription start');
  other.setRemoteDescription(desc, function() { onSetRemoteSuccess(other); });

  trace('other createAnswer start');
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  other.createAnswer(onCreateAnswerSuccess, onCreateSessionDescriptionError,
                   sdpConstraints);
}


function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}


function onCreateAnswerSuccess(desc) {
  trace('Answer from other:\n' + desc.sdp);

  trace('other setLocalDescription start');
  other.setLocalDescription(desc, function() { onSetLocalSuccess(other); });

  trace('pc1 setRemoteDescription start');
  faith.setRemoteDescription(desc, function() { onSetRemoteSuccess(faith); });
}

function onSetLocalSuccess(pc) {
  trace(' setLocalDescription complete');
}

function onSetRemoteSuccess(pc) {
  trace(' setRemoteDescription complete');
}

function onIceCandidate(pc, event) {
  if (event.candidate) {

    other.addIceCandidate(new RTCIceCandidate(event.candidate),
        function() { onAddIceCandidateSuccess(pc) },
        function(err) { onAddIceCandidateError(pc, err); });
    trace(' ICE candidate: \n' + event.candidate.candidate);
  }
}


function onAddIceCandidateSuccess(pc) {
  trace(' addIceCandidate success');
}

function onAddIceCandidateError(pc, error) {
  trace(' failed to add ICE Candidate: ' + error.toString());
}

function onIceStateChange(pc, event) {
  if (pc) {
    trace(' ICE state: ' + pc.iceConnectionState);
  }
}
