$(function(){

	
	  socket.on('users', function (users) {
	    

	    for(var i = 0 ; i < users.length ; i++){
	    	if (users[i] == $("meta[name=username]").attr("content")) continue;
	    	var media = $("<div/>");
	    	media.addClass("media media-msg");
	    	media.html('<div class="media media-msg"><div class="media-body"><h4 class="media-header">用户<b>'+
	    		users[i]
	    		+'</b>加入房间</h4></div></div>');

	    	
	    	$('#chat .message-receive').append(media);
	    }
	  });


	// 媒体沟通
	$("#media").delegate('.btn', 'click', function(){
		var id = this.getAttribute("data-id");
		//获取点击了的按钮
		var curentBtn = $("#media .active");
		if (curentBtn.length && curentBtn.data('id') == id) {
			return;
		}else if (curentBtn.length) {
			curentBtn.removeClass('active');
		}
		
		if(id == "volume"){
			allowVolume(this);
		}else if(id == "video"){
			allowVideo(this);
		};

		$(this).addClass('active');
	});


	$("#settingBtn").click(function(){
		$('#settingModal').modal('show');
		$(this).addClass('active');
	});

	$("#chatBtn").click(changeChat);

	$('#settingModal').on('hidden.bs.modal', function (e) {
		var curentBtn = $("#settingBtn");
		curentBtn.removeClass('active');

	});


});

function changeChat(ev){
	var chat = $("#chat");
	var blackboard = $("#blackboard");
	var $this = $(this);
	if ($this.hasClass('active')) {
		$this.removeClass('active');
		blackboard.addClass("col-lg-12");
		blackboard.removeClass("col-lg-9");
		chat.addClass("hidden");
	}else {
		$this.addClass('active');
		blackboard.removeClass("col-lg-12");
		blackboard.addClass("col-lg-9");
		chat.removeClass("hidden");
	};
}