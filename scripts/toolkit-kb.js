var kb = {};

kb.KEYS = {
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	SHIFT: 16,
	CTRL: 17,
	ALT: 18,
	PAUSE: 19,
	CAPSLOCK: 20,
	ESC: 27,
	SPACE: 32,
	END: 35,
	HOME: 36,
	PREV_PAGE: 33,
	NEXT_PAGE: 34,
	ARROW_LEFT: 37,
	ARROW_UP: 38,
	ARROW_RIGHT: 39,
	ARROW_DOWN: 40,
	INSERT: 45,
	SUPR: 46,
	CONTEXT_MENU: 93,
	NUMPAD_0: 96,
	NUMPAD_1: 97,
	NUMPAD_2: 98,
	NUMPAD_3: 99,
	NUMPAD_4: 100,
	NUMPAD_5: 101,
	NUMPAD_6: 102,
	NUMPAD_7: 103,
	NUMPAD_8: 104,
	NUMPAD_8: 105,
	NUMPAD_MULTIPLICATION: 106,
	NUMPAD_PLUS: 107,
	NUMPAD_MINUS: 109,
	NUMPAD_DOT: 110,
	NUMPAD_DIVISION: 111,
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123
};

kb.KeystrokeContext = (function() {
	var inited = false;
	var $channel = $({});
	var modifierKeys = [kb.KEYS.SHIFT, kb.KEYS.CTRL, kb.KEYS.ALT];
	
	function handle(e){
		if (e.target.nodeName == "INPUT" || e.target.nodeName == "TEXTAREA") return;
		e.pattern = getPattern(e);
		$channel.trigger(e);
	}
	
	function init() {
		inited = true;
		$(window).on("keydown keyup keypress", handle);
	}
	
	function getPattern(e) {
		var pattern = [];
		
		if (e.ctrlKey)
			pattern.push("Ctrl");

		if (e.altKey)
			pattern.push("Alt");
		
		if (e.shiftKey)
			pattern.push("Shift");

		switch(e.which) {
			case kb.KEYS.SPACE:
				pattern.push("Space");
				break;
			case kb.KEYS.HOME:
				pattern.push("Home");
				break;
			case kb.KEYS.END:
				pattern.push("End");
				break;
			case kb.KEYS.ARROW_LEFT:
				pattern.push("Left");
				break;
			case kb.KEYS.ARROW_UP:
				pattern.push("Up");
				break;
			case kb.KEYS.ARROW_RIGHT:
				pattern.push("Right");
				break;
			case kb.KEYS.ARROW_DOWN:
				pattern.push("Down");
				break;
			default:	
				if (modifierKeys.indexOf(e.which) == -1)
					pattern.push(String.fromCharCode(e.which));
		}
		return e.type + ":" + pattern.join("+");
	}
	
	return function(element) {
		if (!inited) init();

		var context = this;
		var connections = {};
		var keystrokes = {};
		var inhibitions = [];
		var isActive = true;
		var isStandalone = true;
		
		function handleKey(e){
			if (context.fire(e.type, e.pattern, e.target))
				e.preventDefault();
		}
		
		this.fire = function(type, pattern, target) {
			if (!isActive) return;
			
			var matched = false;

			if (pattern in keystrokes) {
				keystrokes[pattern].call(context);
				matched = true;
			} else {
				for(var i in connections) {
					if (!inhibitions.contains(i) && connections[i].fire(pattern)) {
						matched = true;
						break;
					}
				}
			}
			
			if (matched && (!element || !target || $.contains(element, target) || element === target)) {
				$(this).trigger(new jQuery.Event("keystroke", {pattern: pattern}));
				return true;
			}
		};
		
		this.keydown = function(pattern, callback) {
			keystrokes["keydown:" + pattern] = callback;
		};

		this.keypress = function(pattern, callback) {
			keystrokes["keypress:" + pattern] = callback;
		};

		this.keyup = function(pattern, callback) {
			keystrokes["keyup:" + pattern] = callback;
		};
		
		this.setActive = function(active) {
			isActive = active;
		};
		
		this.setStandalone = function(standalone) {
			if (isStandalone = standalone)
				$channel
					.bind("keydown keyup keypress", handleKey);
			else
				$channel
					.unbind("keydown keyup keypress", handleKey);
		};
		
		this.connect = function(id, keystrokeContext) {
			connections[id] = keystrokeContext;
			keystrokeContext.setStandalone(false);
		};
		
		this.setConnectionActive = function(id, set) {
			if (set)
				inhibitions.remove(id);
			else
				inhibitions.uniquepush(id);
		};

		this.setActive(true);
		this.setStandalone(true);
	};
})();