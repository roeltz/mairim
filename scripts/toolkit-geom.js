var geom = {};

geom.distance = function(point1, point2) {
	return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

geom.middle = function(point1, point2) {
	return new geom.Point(point1.x + (point2.x - point1.x) / 2, point1.y + (point2.y - point1.y) / 2);
};

geom.slope = function(point1, point2) {
	return (point2.y - point1.y) / (point2.x - point1.x);
};

geom.inverseSlope = function(slope) {
	return -1 / slope;
};

geom.Point = function(x, y) {
	this.x = x;
	this.y = y;
};

geom.CubicBezier = (function(){
	function B1(t) { return t*t*t }
	function B2(t) { return 3*t*t*(1-t) }
	function B3(t) { return 3*t*(1-t)*(1-t) }
	function B4(t) { return (1-t)*(1-t)*(1-t) }
	
	return function(point1, point2, point3, point4) {
	
		this.getPoint = function(t) {
			t = 1 - t;
			var x = point1.x * B1(t) + point2.x * B2(t) + point3.x * B3(t) + point4.x * B4(t);
			var y = point1.y * B1(t) + point2.y * B2(t) + point3.y * B3(t) + point4.y * B4(t);
			return new geom.Point(x, y);
		};
	};
})();
