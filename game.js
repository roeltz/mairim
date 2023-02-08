function P(x, y) {
	return new geom.Point(x, y);
}

function Player(delta) {
	var self = this;
	var $self = $(this);
	var $e = $('<div class="mairim falling"><div class="sprite"></div></div>');
	var $s = $e.find(".sprite");
	var jtid;
	var mtid;
	var jumping = true;
	var moving = true;
	var x = 0;

	this.$e = $e;
	
	this.jump = function(d, callback) {
		if (jumping) return;
		else jumping = true;
		
		clearTimeout(jtid);
		$e
			.addClass("jumping")
			.on("animationend webkitAnimationEnd", function(){
				jumping = false;
				$e.removeClass("jumping");
			});
	};
	
	this.move = function(d, callback) {
		var x1 = x + d * delta;
		var ev = $.Event("beforemove", {x: x, x1: x1, x2: x1 + $e.width()});
		$self.trigger(ev);
		
		if (ev.isDefaultPrevented() || moving) return;
		else moving = true;
		
		clearTimeout(mtid);
		
		x += d * delta;
		$e.css("left", x).removeClass("moving-left moving-right");
		
		if (d < 0)
			$e.addClass("moving-left");
		else
			$e.addClass("moving-right");
			
		$e.one("transitionend webkitTransitionEnd", function(){
			moving = false;
			clearTimeout(mtid);
			if (callback) callback();
			mtid = setTimeout(function(){
				$e.removeClass("moving-left moving-right");
			}, 200);
		});
	};
	
	$e.one("animationend webkitAnimationEnd", function(){
		$e.removeClass("falling");
		jumping = false;
		moving = false;
	});
}

function Stage(player, input, threshold) {
	var self = this;
	var $self = $(this);
	var $e = $('<div class="stage"><div class="wrapper"></div><div class="transitable"></div></div>');
	var $t = $e.find(".transitable");
	var delta = 0;
	var moves = 0;
	this.$e = $e;
	
	$t.append(player.$e);
	
	function movePlayer(d) {
		delta = d;
		player.move(d, function(){
			if (delta == d) movePlayer(d);
		});
	}
	
	function stopPlayer() {
		delta = 0;
	}
	
	function count() {
		if (++moves > threshold)
			$self.trigger("enoughmoves");
	}
	
	this.suspend = function() {
		$e.addClass("suspended");
		input.setActive(false);
	};

	function jump() {
		player.jump(150);
		count();
	}

	function goLeft(){
		movePlayer(-1);
		count();
	}

	function goRight(){
		movePlayer(1);
		count();
	}
	
	input.keydown("Space", jump);
	$e.on("tap", jump);

	input.keydown("Left", goLeft);
	$e.on("swipeleft", function(){
		goLeft();
		setTimeout(stopPlayer, 100);
	});

	input.keydown("Right", goRight);
	$e.on("swiperight", function(){
		goRight();
		setTimeout(stopPlayer, 100);
	});

	input.keyup("Left", stopPlayer);
	input.keyup("Right", stopPlayer);
	
	$(player).on("beforemove", function(e){
		if (e.x1 < 0 || e.x2 > $e.width())
			e.preventDefault();
	});
}

var $congrats = $("#congratulations");
var mairim = new Player(100);
var input = new kb.KeystrokeContext(window);
var stage = new Stage(mairim, input, 50);

$(stage).on("enoughmoves", function(){
	stage.suspend();
	
	(function step($msgs){
		if ($msgs.length) {
			$msgs.eq(0).addClass("active");
			setTimeout(function(){
				$msgs.eq(0)
					.addClass("dismissed")
					.one("animationend webkitAnimationEnd", function(){
						step($msgs.slice(1));
					});
			}, $msgs.eq(0).data("time") * 1000);
		}
	})($congrats.show().find("> div"));
});

input.keydown("End", function(){
	$(stage).trigger("enoughmoves");
});

document.body.appendChild(stage.$e[0]);
