;(function () {
	Chart = new Object();
	/** 私有函数 **/
	var divElement;		// div对象
	var svgElement;		// svg对象

	/**
	 * [获取一个范围内随机的整数，]
	 * @param  {[Int]} min [最小整数]
	 * @param  {[Int]} max [最大整数]
	 * @return {[Int]}     [随机整数]
	 */
	var randomInt = function (min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	};

	/**
	 * [扩展对象]
	 * @return {Object} [返回扩展的对象]
	 */
	var extend = function () {
		var options = arguments[0] || {};
		for (var i = 1; i < arguments.length; i++) {
			var args = arguments[i] || {};
			for (var key in args) {
				options[key] = args[key];
			}
		}
		return options;
	};

	var getPointOnCircle = function (x, y, r, a) {
		return {
			x : x + Math.round(r * Math.cos(Math.PI / 180 * a)),
			y : y + Math.round(r * Math.sin(Math.PI / 180 * a) * (-1))
		};
	};

	/**
	 * [获取扇形path的参数]
	 * @param  {[Object]} opt
	 * [x：扇形的 x 坐标； y：扇形的 y 坐标； r：扇形的半径； r1：扇形的内弧半径； angle：扇形的角度； rotate：扇形初始角度]
	 *
	 * @return {[Object]]}
	 * [p1：扇形的圆心坐标； p2：扇形的第二点坐标； p3：扇形的第三点坐标； p2_1：扇形内弧的第一个点坐标； p3_1：扇形内弧的第二个点坐标； r：扇形的半径； r1：扇形的内弧半径； flag1：弧线绘制方向； flag2：弧线圆心方向]
	 */
	var sector_getPathArguments = function (opt) {
		var sector_defaults = {
			x : 0,
			y : 0,
			r : 0,
			r1 : 0,
			angle : 0,
			rotate : 0
		};
		var settings = extend({}, sector_defaults, opt);

		var fl1 = fl2 = 0;
		if (Math.abs(settings.angle) > 180) {
			fl1 = 1;
		}
		if (settings.angle < 0) {
			fl2 = 1;
		}
		var args = {
			p1 : {x : settings.x, y : settings.y},
			p2 : getPointOnCircle(settings.x, settings.y, settings.r, settings.rotate),
			p3 : getPointOnCircle(settings.x, settings.y, settings.r, (settings.rotate + settings.angle)),
			p2_1 : getPointOnCircle(settings.x, settings.y, settings.r1, settings.rotate),
			p3_1 : getPointOnCircle(settings.x, settings.y, settings.r1, (settings.rotate + settings.angle)),
			r : settings.r,
			r1 : settings.r1,
			flag1 : fl1,
			flag2 : fl2
		};

		return args;
	}

	/**
	 * [获取扇形path的d参数]
	 * @param  {[Object]} args
	 * [p1：扇形的圆心坐标； p2：扇形的第二点坐标； p3：扇形的第三点坐标； p2_1：扇形内弧的第一个点坐标； p3_1：扇形内弧的第二个点坐标； r：扇形的半径； r1：扇形的内弧半径； flag1：弧线绘制方向； flag2：弧线圆心方向]
	 *
	 * @return {[string]}
	 * [返回扇形path的d参数]
	 */
	var sector_getPathString = function (args) {
		var str = '';
		if ((args.p2.x === args.p3.x) && (args.p2.y === args.p3.y)) {
			str =  'M' + (args.p1.x + args.r1) + ',' + args.p1.y;
			str += ' L' + (args.p1.x + args.r) + ',' + args.p1.y;
			str += ' A' + args.r + ',' + args.r + ' 0 0,0 ' + (args.p1.x - args.r) + ',' + args.p1.y;
			str += ' L' + (args.p1.x - args.r1) + ',' + args.p1.y;
			str += ' A' + args.r1 + ',' + args.r1 + ' 0 0,1 ' + (args.p1.x + args.r1) + ',' + args.p1.y;
			str += ' A' + args.r1 + ',' + args.r1 + ' 0 0,1 ' + (args.p1.x - args.r1) + ',' + args.p1.y;
			str += ' L' + (args.p1.x - args.r) + ',' + args.p1.y;
			str += ' A' + args.r + ',' + args.r + ' 0 0,0 ' + (args.p1.x + args.r) + ',' + args.p1.y;
		} else {
			var flag2;
			(args.flag2 == 0) ? flag2='1':flag2='0';

			str =  'M' + args.p2_1.x + ',' + args.p2_1.y;
			str += ' L' + args.p2.x + ',' + args.p2.y;
			str += ' A' + args.r + ',' + args.r + ' 0 ' + args.flag1 + ',' + args.flag2 + ' ' + args.p3.x + ',' + args.p3.y;
			str += ' L' + args.p3_1.x + ',' + args.p3_1.y;
			str += ' A' + args.r1 +',' + args.r1 + ' 0 ' + args.flag1 + ',' + flag2 + args.p2_1.x + ',' + args.p2_1.y;
		}
		return str;
	};

	/**
	 * [获取饼图中每一个扇形的角度]
	 * @param  {[Array]} array 	[饼图的实际值数组]
	 *
	 * @return {[Array]} 		[返回饼图中每一个扇形的角度]
	 */
	var pie_getAngleArray = function (array) {
		var numbers = [];
		var angles = [];
		var sum = 0;
		var i, j;

		for (i = 0; i < array.length; i++) {
			if (!isNaN(array[i])) {
				numbers.push(array[i]);
				sum += array[i];
			}
		}
		if (sum == 0) {
			return [];
		}
		if (numbers.length == 1) {
			angles[0] = 360;
		} else {
			for (i = 0; i < numbers.length; i++) {
			angles.push(Math.round(numbers[i] / sum * 360));
			}
		}
		
		sum = 0;
		for (i = 0; i < angles.length; i++) {
			sum += angles[i];
		}
		j = 0;
		for (i = 0; i < (Math.abs(sum - 360) * 10); i++) {
			if ((sum - 360) > 0) {
				angles[j] -= 0.1;
			}
			if ((sum - 360) < 0) {
				angles[j] += 0.1;
			}
			j++;
			if (j >= angles.length) {
				j = 0;
			}
		}
		return angles;
	};

	/**
	 * [获取饼图中每一个扇形的旋转角度]
	 * @param  {[Array]} 	angles 	[饼图中每一个扇形的角度]
	 * @param  {[Number]} 	rotate 	[饼图中第一个扇形的旋转角度]
	 * @return {[Array]}        	[返回饼图中每一个扇形的旋转角度]
	 */
	var pie_getRotateArray = function (angles, rotate) {
		var ro = rotate || 0;
		var ros = [];
		var init = 0;

		ros[0] = ro;
		for (var i = 1; i < angles.length; i++) {
			init += angles[i - 1];
			ros.push(init + ro);
		}
		return ros;
	};
	

	/** 私有对象 **/

	/**
	 * [Svg 对象]
	 */
	Svg = function () {
		this.ns = 'http://www.w3.org/2000/svg';
		this.xmlns = 'http://www.w3.org/2000/xmlns/';
		this.xlink = 'http://www.w3.org/1999/xlink';
		this.svgjs = 'http://svgjs.com/svgjs';
		this.did = {};
	};
	/**
	 * [创建svg元素id]
	 * @param  {[string]} name [元素名]
	 * @return {[string]}      [id]
	 */
	Svg.prototype.eid = function (name) {
		var str;
		var flag = false;
		for (var key in this.did) {
			if (name === key) {
				this.did[key]++;
				str = 'MySvg' + name.toString() + this.did[key];
				flag = true;
				break;
			}
			flag = false;
		}
		if (! flag) {
			this.did[name] = 0;
			str = 'MySvg' + name.toString() + this.did[name];
		}
		return str;
	};
	/**
	 * [清空did数组]
	 * @return {[void]} [无返回值]
	 */
	Svg.prototype.clearDid = function () {
		did = {};
	};
	/**
	 * [删除did数组中的某一个值]
	 * @param  {[string]} name [要删除的值的key]
	 * @return {[Array]}      [删除后剩下的数组]
	 */
	Svg.prototype.removeKeyByDid = function (name) {
		(function (obj, key) {
			return delete obj[key];
		})(this.did, name);
	};
	/**
	 * [获取did数组]
	 * @return {[Array]} [did数组]
	 */
	Svg.prototype.getDid = function () {
		return this.did;
	};
	/**
	 * [创建Svg元素]
	 * @param  {[string]} tagName [Svg元素标签]
	 * @return {[Svg元素]}        [Svg元素]
	 */
	Svg.prototype.create = function (tagName) {
		var element = document.createElementNS(this.ns, tagName);
		element.setAttribute('id', this.eid(tagName));
		if (element instanceof window.SVGSVGElement) {
			element.setAttribute('height', '100%');
			element.setAttribute('width', '100%');
		}
		return element;
	};

	Svg.prototype.isSvg = function (element) {
		return element && element.nodeType === 1 && (element instanceof window.SVGElement);
	};
	
	Svg.prototype.isSvgSvg = function (element) {
		return element && element.nodeType === 1 && (element instanceof window.SVGSVGElement);
	};
	Svg.prototype.isSvgPath = function (element) {
		return element && element.nodeType === 1 && (element instanceof window.SVGPathElement);
	};

	/**
	 * [canvas 画布]
	 * @type {Svg}
	 */
	var canvas = new Svg();

	/**
	 * [Colors 对象]
	 */
	Chart.Colors = function () {
		cols = [
			'#3DA9E7', '#A6E22E', '#F92672', '#FD9420', '#E6DB74',
			'#5B9BD5', '#ED7D31', '#A5A5A5', '#FFC000', '#4472C4',
			'#70AD47', '#255E91', '#9E480E', '#636363', '#997300',
			'#264478', '#43682B', '#7CAFDD', '#F1975A', '#B7B7B7',
			'#FFCD33', '#698ED0', '#8CC168', '#327DC2', '#D26012',
			'#7B7B7B', '#CC9A00', '#335AA1', '#5A8A39', '#9DC3E6',
			'#F4B183', '#C9C9C9', '#FFD966', '#8FAADC', '#A9D18E'
		];
		this.index = 0;
	};
	/**
	 * [获取预定颜色集合中当前指针指向的颜色，并将指针指向下一个颜色，如果指针指超出颜色集合长度则返回指向第一个颜色]
	 * @return {string} [返回16进制颜色字符串]
	 */
	Chart.Colors.prototype.nextColor = function () {
		var col = cols[this.index];
		this.index++;
		if (this.index >= cols.length) {
			this.index = 0;
		}
		return col;
	};
	/**
	 * [获取随机16进制颜色字符串]
	 * @return {string} [返回随机16进制颜色字符串]
	 */
	Chart.Colors.prototype.randomColor = function () {
		//return ("#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6)).toUpperCase();
		var str = '';
		for (var i = 0; i < 3; i++) {
			//str += ('0' + randomInt(2, 14).toString(16)).slice(-2).toUpperCase();
			str += randomInt(55, 200).toString(16).toUpperCase();
		}
		return '#' + str;
	};
	/**
	 * [16进制颜色编码转RGB]
	 * @param  {[String]} hex [16进制颜色编码]
	 * @return {[Array]}     [RGB数组]
	 */
	Chart.Colors.prototype.hexToRgb = function (hex) {
		var r = parseInt('0x' + hex.slice(1,3));
		var g = parseInt('0x' + hex.slice(3,5));
		var b = parseInt('0x' + hex.slice(5,7));
		return [r, g, b];
	};
	/**
	 * [RGB转16进制颜色编码]
	 * @param  {[Array]} arr [RGB数组]
	 * @return {[String]}     [16进制颜色编码字符串]
	 */
	Chart.Colors.prototype.rgbToHex = function (arr) {
		var hex = '';
		for (var i=0; i<arr.length; i++) {
			hex += ('0' + arr[i].toString(16)).slice(-2).toUpperCase();
		}
		return '#' + hex;
	};
	/**
	 * [获取高亮颜色编码]
	 * @param  {[String || Array]} color [当前颜色编码，可以是16进制编码，也可以使RGB数组编码]
	 * @return {[String || Array]}       [返回高亮颜色编码]
	 */
	Chart.Colors.prototype.lightColor = function (color) {
		var temp = arguments[1] || 30;
		if (temp >= 50) {
			temp = 50;
		}
		if (typeof color === 'string') {
			var rgb = this.hexToRgb(color);
			for (var i=0; i<rgb.length; i++) {
				rgb[i] += temp;
			}
			return this.rgbToHex(rgb);
		}
		if (color instanceof Array) {
			var col = color;
			for (var i=0; i<color.length; i++) {
				col[i] += temp;
			}
			return col;
		}
	};
	/**
	 * [获取暗黑颜色编码]
	 * @param  {[String || Array]} color [当前颜色编码，可以是16进制编码，也可以使RGB数组编码]
	 * @return {[String || Array]}       [返回暗黑颜色编码]
	 */
	Chart.Colors.prototype.drakColor = function (color) {
		var temp = arguments[1] || 30;
		if (temp >= 50) {
			temp = 50;
		}
		if (typeof color === 'string') {
			var rgb = this.hexToRgb(color);
			for (var i=0; i<rgb.length; i++) {
				rgb[i] -= temp;
			}
			return this.rgbToHex(rgb);
		}
		if (color instanceof Array) {
			var col = color;
			for (var i=0; i<color.length; i++) {
				col[i] -= temp;
			}
			return col;
		}
	}

	/**
	 * [Sector 对象构造函数]
	 * @param  {[Object]} args
	 * [x：扇形的圆心 x 坐标； y：扇形的圆形 y 坐标； r：扇形的半径； r1：扇形的内弧半径； angle：扇形的角度； rotate：扇形的旋转角度； color：扇形的颜色； stroke：扇形边框颜色； stroke_width：扇形边框宽度]
	 */
	
	Chart.Sector = function (args) {
		this.attribute = {
			p1 : {							// 扇形的圆心
				x : 0,
				y : 0
			},
			p2 : {							// 扇面弧形的第一个点
				x : 0,
				y : 0
			},
			p3 : {							// 扇面弧形的第二个点
				x : 0,
				y : 0
			}, 
			r 				: 0, 			// 扇形的半径
			r1				: 0,			// 扇形的内弧半径
			angle 			: 0, 			// 扇形的角度
			rotate 			: 0, 			// 扇形的旋转角度
			path_d 			: '', 			// path元素的d参数
			color 			: 'black', 		// 扇形的颜色
			stroke 			: 'black', 		// 扇形边框颜色
			stroke_width 	: '0' 			// 扇形边框宽度
		};
		this.svg = canvas.create('path');	// svg对象
		this.setAttr(args);
		//this.svg.addEventListener('click', this.click, false);

	};
	/**
	 * [获取扇形的属性]
	 * @return {[Object]}
	 * [p1：扇形的圆心； p2：扇面弧形的第一个点； p3：扇面弧形的第二个点； r：扇形的半径； angle：扇形的角度； rotate：扇形的旋转角度； path_d：path元素的d参数； color：扇形的颜色； stroke：扇形边框颜色； stroke_width：扇形边框宽度]
	 */
	Chart.Sector.prototype.getAttr = function () {
		return this.attribute;
	};
	/**
	 * [设置扇形的参数]
	 * @param {[Object]} settings
	 * [x：扇形的圆心 x 坐标； y：扇形的圆形 y 坐标； r：扇形的半径； r1：扇形的内弧半径； angle：扇形的角度； rotate：扇形的旋转角度； color：扇形的颜色； stroke：扇形边框颜色； stroke_width：扇形边框宽度]
	 */
	Chart.Sector.prototype.setAttr = function (settings) {
		var opt = settings || {};
		var defaults = {
			x 				: this.attribute.p1.x,
			y 				: this.attribute.p1.y,
			r 				: this.attribute.r,
			r1 				: this.attribute.r1,
			angle 			: this.attribute.angle,
			rotate 			: this.attribute.rotate,
			color 			: this.attribute.color,
			stroke 			: this.attribute.stroke,
			stroke_width 	: this.attribute.stroke_width
		};
		var options = extend({}, defaults, opt);
		var pathArgs = sector_getPathArguments(options);
		var pathStr = sector_getPathString(pathArgs);
		var attr = {
			p1 				: pathArgs.p1,
			p2 				: pathArgs.p2,
			p3 				: pathArgs.p3,
			r 				: options.r,
			r1 				: options.r1,
			angle 			: options.angle,
			rotate 			: options.rotate,
			path_d 			: pathStr,
			color 			: options.color,
			stroke 			: options.stroke,
			stroke_width 	: options.stroke_width
		};
		extend(this.attribute, attr);
		this.svg.setAttribute('d', this.attribute.path_d);
		this.svg.setAttribute('fill', this.attribute.color);
		this.svg.setAttribute('stroke', this.attribute.stroke);
		this.svg.setAttribute('stroke-width', this.attribute.stroke_width);
	};
	/**
	 * [绘制扇形]
	 */
	Chart.Sector.prototype.draw = function() {
		svgElement.appendChild(this.svg);

		//this.svg = document.getElementById(this.svg.id);
	};

	/**
	 * [Pie 对象]
	 * @param  {[Array]} args [饼图的实际数据数组[key : value]]
	 */
	Chart.Pie = function (args) {
		this.id;						// 饼图的id
		this.data;						// 饼图的实际数据数组[key : value]
		this.number;					// 饼图扇形数量
		this.angles;					// 每个扇形的角度
		this.rotates;					// 每个扇形的旋转角度
		this.sectors;					// 扇形对象组
		this.text1;
		this.text2;
		this.rect;
		this.attribute = {
			x 				: 200,		// 饼图圆心 y 坐标
			y 				: 200,		// 饼图圆心 x 坐标
			r 				: 200,		// 饼图的半径
			r1				: 0,		// 饼图内圆半径
			rotate 			: 0,		// 饼图初始偏移角度
			randomColor 	: false,	// 是否采用随机色方案
			stroke 			: '#FFF',	// 边框颜色
			stroke_width 	: 2,		// 边框宽度
			unit 	 		: 'piece'	// 饼图的单位
		};
		var arg = args || [];
		this.init(arg);
	};
	/**
	 * [Pie 初始化]
	 * @param  {[Array]} args [饼图的实际数据数组[key : value]]
	 */
	Chart.Pie.prototype.init = function (args) {
		var settings = {};
		var col      = new Chart.Colors();
		var shape    = [];
		var i;
		var fillColor;
		var idStr;

		this.id      = canvas.eid('pie');
		this.data    = [];
		this.angles  = [];
		this.rotates = [];
		this.sectors = [];
		this.text1   = [];
		this.text2   = [];
		this.rect    = [];
		this.number  = 0;

		for (var key in args) {
			if (! isNaN(args[key])) {
				this.data[key] = args[key];
				shape.push(args[key]);
				this.number++;
			}
		}
		this.angles = pie_getAngleArray(shape);
		shape = [];
		this.rotates = pie_getRotateArray(this.angles, this.attribute.rotate);
		for (i = 0; i < this.number; i++) {
			idStr = this.id;
			if (this.attribute.randomColor) {
				fillColor = col.randomColor();
			} else {
				fillColor = col.nextColor();
			}
			settings = {
				x 				: this.attribute.x,
				y 				: this.attribute.y,
				r 				: this.attribute.r,
				r1 				: this.attribute.r1,
				angle 			: this.angles[i],
				rotate 			: this.rotates[i],
				color 			: fillColor,
				stroke 			: this.attribute.stroke,
				stroke_width 	: this.attribute.stroke_width
			};
			shape[i] = new Chart.Sector(settings);
			idStr    += '_' + shape[i].svg.id;
			shape[i].svg.setAttribute('id', idStr);
		}
		this.sectors = shape;
	};
	/**
	 * [设置饼图的属性]
	 * @param {[Object]} settings
	 * [x：饼图圆心的 x 坐标； y：饼图圆心的 y 坐标； r：饼图的半径； r1：扇形的内弧半径； rotate：饼图初始旋转角度； randomColor：是否使用随机颜色（true：使用，false：不使用）； unit：单位； stroke：边框颜色； stroke_width：边框宽度]
	 */
	Chart.Pie.prototype.setAttr = function(settings) {
		var col = new Chart.Colors();
		extend(this.attribute, settings);
		this.rotates = pie_getRotateArray(this.angles, this.attribute.rotate);
		for (var i=0; i < this.sectors.length; i++) {
			options = {
				x 				: this.attribute.x,
				y 				: this.attribute.y,
				r 				: this.attribute.r,
				r1 				: this.attribute.r1,
				angle 			: this.angles[i],
				rotate 			: this.rotates[i],
				stroke 			: this.attribute.stroke,
				stroke_width 	: this.attribute.stroke_width
			}
			if (this.attribute.randomColor) {
				var c = col.randomColor();
				options.color = c;
			}
			this.sectors[i].setAttr(options);
		}
	};
	Chart.Pie.prototype.getText = function () {
		var keys = [];
		var values = [];
		var y0 = 0;
		var i = 0;
		var x = this.sectors[0].attribute.p1.x + this.sectors[0].attribute.r + 100;
		var y = this.sectors[0].attribute.p1.y - this.sectors[0].attribute.r;
		for (var k in this.data) {
			keys[i] = k;
			values[i] = this.data[k];

			this.rect[i] = canvas.create('rect');

			this.rect[i].setAttribute('id', this.id + '_' + this.rect[i].getAttribute('id'));
			this.rect[i].setAttribute('x', x);
			this.rect[i].setAttribute('y', y + y0);
			this.rect[i].setAttribute('height', 20);
			this.rect[i].setAttribute('width', 20);
			this.rect[i].setAttribute('fill', this.sectors[i].attribute.color);
			svgElement.appendChild(this.rect[i]);

			this.text1[i] = canvas.create('text');
			this.text1[i].setAttribute('id', this.id + '_' + this.text1[i].getAttribute('id'));
			this.text1[i].setAttribute('x', x + 30);
			this.text1[i].setAttribute('y', y + y0 + 15);
			this.text1[i].innerHTML = keys[i] + ':' + values[i] + ' ' + this.attribute.unit;

			svgElement.appendChild(this.text1[i]);
			y0 += 30;
			i++;
		}

	};
	Chart.Pie.prototype.getSectId = function() {
		var id = [];
		for (var i=0; i<this.number; i++) {
			id[i] = this.sectors[i].svg.id;
		}
		return id;
	};
	Chart.Pie.prototype.getText1Id = function() {
		var id = [];
		for (var i=0; i<this.number; i++) {
			id[i] = this.text1[i].id;
		}
		return id;
	};
	Chart.Pie.prototype.getText2Id = function() {
		var id = [];
		for (var i=0; i<this.number; i++) {
			id[i] = this.text2[i].id;
		}
		return id;
	};
	Chart.Pie.prototype.getRectId = function() {
		var id = [];
		for (var i=0; i<this.number; i++) {
			id[i] = this.rect[i].id;
		}
		return id;
	};
	/**
	 * [绘制饼图]
	 */
	Chart.Pie.prototype.draw = function() {
		for (var i=0; i < this.sectors.length; i++) {
			this.sectors[i].draw();
		}
	};

	/** 公共对象  **/

	/**
	 * [Canvas 对象]
	 * @param {[DOM]} element [div对象]
	 * @param {[Object]} options [画布的大小]
	 */
	Chart.Canvas = function(element) {
		this.did = 0;
		this.div = divElement = element;
		svgElement = new Svg();
		svgElement = svgElement.create('svg');
		divElement.innerHTML = svgElement.outerHTML;
		this.svg = svgElement = document.getElementById(svgElement.id);
	};
	/**
	 * [创建svg的id]
	 * @return {[string]} [id]
	 */
	Chart.Canvas.prototype.eid = function () {
		var id = 'MySvg' + this.did;
		this.did++;
		return id;
	};
	/**
	 * [获取div对象]
	 * @return {[DOM]} [div对象]
	 */
	Chart.Canvas.prototype.getDiv = function () {
		divElement = this.div;
		return divElement;
	};
	/**
	 * [获取svg对象]
	 * @return {[type]} [svg对象]
	 */
	Chart.Canvas.prototype.getSvg = function () {
		svgElement = this.svg;
		return svgElement;
	};

})();
