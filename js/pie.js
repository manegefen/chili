;(function () {
	/** 私有变量 **/
	/**
	 * [扇形默认参数]
	 * @type {Object} [x：扇形的 x 坐标； y：扇形的 y 坐标； r：扇形的半径； angle：扇形的角度； rotate：扇形初始角度]
	 */
	var sector_defaults = {
		x : 0,
		y : 0,
		r : 0,
		angle : 0,
		rotate : 0
	};

	/** 私有对象 **/

	/**
	 * [Svg 对象]
	 */
	var Svg = function () {
		this.ns = 'http://www.w3.org/2000/svg';
		this.xmlns = 'http://www.w3.org/2000/xmlns/';
		this.xlink = 'http://www.w3.org/1999/xlink';
		this.svgjs = 'http://svgjs.com/svgjs';
		did = {};
	};
	/**
	 * [创建svg元素id]
	 * @param  {[string]} name [元素名]
	 * @return {[string]}      [id]
	 */
	Svg.prototype.eid = function (name) {
		var str;
		var flag = false;
		for (var key in did) {
			if (name === key) {
				did[key]++;
				str = 'MySvg' + name.toString() + did[key];
				flag = true;
				break;
			}
			flag = false;
		}
		if (! flag) {
			console.log('ok');
			did[name.toString()] = 0;
			console.log(did);
			str = 'MySvg' + name.toString() + did[name];
		}
		console.log(str);
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
		var key = 'MySvg' + name.toString();
		var arr = {};
		for (var k in did) {
			if (k !== key) {
				arr[k] = did[k];
			}
		}
		did = arr;
	}
	/**
	 * [获取did数组]
	 * @return {[Array]} [did数组]
	 */
	Svg.prototype.getDid = function () {
		return did;
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
	var Colors = function () {
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
	Colors.prototype.nextColor = function () {
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
	Colors.prototype.randomColor = function () {
		//return ("#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6)).toUpperCase();
		var str = '';
		for (var i = 0; i < 6; i++) {
			//str += ('0' + randomInt(2, 14).toString(16)).slice(-2).toUpperCase();
			str += randomInt(2, 14).toString(16).toUpperCase();
		}
		return '#' + str;
	};

	/**
	 * [Sector 对象构造函数]
	 * @param  {[Object]} args
	 * [p1：扇形的圆心； p2：扇面弧形的第一个点； p3：扇面弧形的第二个点； r：扇形的半径； angle：扇形的角度； rotate：扇形的旋转角度； path_d：path元素的d参数； color：扇形的颜色； stroke：扇形边框颜色； stroke_width：扇形边框宽度]
	 */

	var Sector = function (args) {
		this.attribute = {
			p1 : {
				x : 0,
				y : 0
			}, // 扇形的圆心
			p2 : {
				x : 0,
				y : 0
			}, // 扇面弧形的第一个点
			p3 : {
				x : 0,
				y : 0
			}, // 扇面弧形的第二个点
			r : 0, // 扇形的半径
			angle : 0, // 扇形的角度
			rotate : 0, // 扇形的旋转角度
			path_d : '', // path元素的d参数
			color : 'black', // 扇形的颜色
			stroke : 'black', // 扇形边框颜色
			stroke_width : '0' // 扇形边框宽度
		};
		this.svg = canvas.create('path'); // svg对象
		this.setAttr(args);
	};
	/**
	 * [获取扇形的属性]
	 * @return {[Object]}
	 * [p1：扇形的圆心； p2：扇面弧形的第一个点； p3：扇面弧形的第二个点； r：扇形的半径； angle：扇形的角度； rotate：扇形的旋转角度； path_d：path元素的d参数； color：扇形的颜色； stroke：扇形边框颜色； stroke_width：扇形边框宽度]
	 */
	Sector.prototype.getAttr = function () {
		return this.attribute;
	};
	/**
	 * [设置扇形的参数]
	 */
	Sector.prototype.setAttr = function (settings) {
		var opt = settings || {};
		var defaults = {
			x : this.attribute.p1.x,
			y : this.attribute.p1.y,
			r : this.attribute.r,
			angle : this.attribute.angle,
			rotate : this.attribute.rotate,
			color : this.attribute.color,
			stroke : this.attribute.stroke,
			stroke_width : this.attribute.stroke_width
		};
		var options = extend({}, defaults, opt);
		var pathArgs = sector_getPathArguments(options);
		var pathStr = sector_getPathString(pathArgs);
		var attr = {
			p1 : pathArgs.p1,
			p2 : pathArgs.p2,
			p3 : pathArgs.p3,
			r : options.r,
			angle : options.angle,
			rotate : options.rotate,
			path_d : pathStr,
			color : options.color,
			stroke : options.stroke,
			stroke_width : options.stroke_width,
		};
		extend(this.attribute, attr);
		this.svg.setAttribute('d', this.attribute.path_d);
		this.svg.setAttribute('fill', this.attribute.color);
		this.svg.setAttribute('stroke', this.attribute.stroke);
		this.svg.setAttribute('stroke-width', this.attribute.stroke_width);
	};
	/**
	 * [获取扇形的HTML字符串]
	 * @return {[string]} [扇形的HTML字符串]
	 */
	Sector.prototype.getHtml = function () {
		return this.svg.outerHTML;
	};

	/**
	 * [Pie 对象]
	 * @param  {[Array]} args [饼图的实际数据数组]
	 */
	var Pie = function (args) {
		this.data;
		this.number;
		this.angles;
		this.rotates;
		this.sectors;
		this.attribute = {
			x : 200,
			y : 200,
			r : 200,
			rotate : 0
		};
		did = 0;
		var arg = args || [];
		this.init(arg);
	};
	/**
	 * [Pie 初始化]
	 * @param  {[Array]} args [饼图的实际数据数组[key : value]]
	 */
	Pie.prototype.init = function (args) {
		var settings = {};
		var i;
		var col = new Colors();
		var shape = [];
		var fillColor;
		var str;

		this.data = [];
		this.angles  = [];
		this.rotates = [];
		this.sectors = [];
		this.number = 0;
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
			fillColor = col.nextColor();
			settings = {
				x : this.attribute.x,
				y : this.attribute.y,
				r : this.attribute.r,
				angle : this.angles[i],
				rotate : this.rotates[i],
				color : fillColor,
				stroke : fillColor,
				stroke_width : 1
			};
			shape[i] = new Sector(settings);
		}
		console.log(canvas.getDid());
		this.sectors = shape;
	};
	/**
	 * [设置饼图的属性]
	 * @param {[Object]} settings
	 * [description]
	 */
	Pie.prototype.setAttr = function(settings) {
		// body...
	};
	/**
	 * [获取饼图Svg的HTML字符串]
	 * @return {[String]} [饼图Svg的HTML字符串]
	 */
	Pie.prototype.getHtml = function () {
		var str = '';
		for (var i = 0; i < this.sectors.length; i++) {
			str += this.sectors[i].getHtml();
		}
		return str;
	};

	/**私有函数**/

	/**
	 * [扩展对象]
	 * @return {Object} [返回扩展的对象]
	 */
	function extend() {
		var options = arguments[0] || {};
		for (var i = 1; i < arguments.length; i++) {
			var args = arguments[i] || {};
			for (var key in args) {
				options[key] = args[key];
			}
		}
		return options;
	};

	/**
	 * [获取扇形path的参数]
	 * @param  {[Object]} opt
	 * [x：扇形的 x 坐标； y：扇形的 y 坐标； r：扇形的半径； angle：扇形的角度； rotate：扇形初始角度]
	 *
	 * @return {[Object]]}
	 * [p1：扇形的圆心坐标； p2：扇形的第二点坐标； p3：扇形的第三点坐标； r：扇形的半径； flag1：弧线绘制方向； flag2：弧线圆心方向]
	 */
	function sector_getPathArguments(opt) {
		var settings = extend({}, sector_defaults, opt);
		var p1 = {
			x : settings.x,
			y : settings.y
		};
		var p2 = {
			x : p1.x + Math.round(settings.r * Math.cos(Math.PI / 180 * settings.rotate)),
			y : p1.y + Math.round(settings.r * Math.sin(Math.PI / 180 * settings.rotate) * (-1))
		};
		var p3 = {
			x : p1.x + Math.round(settings.r * Math.cos(Math.PI / 180 * (settings.rotate + settings.angle))),
			y : p1.y + Math.round(settings.r * Math.sin(Math.PI / 180 * (settings.rotate + settings.angle)) * (-1))
		};
		var fl1 = fl2 = 0;
		if ((Math.abs(settings.angle) > 180)) {
			fl1 = 1;
		}
		if (settings.angle < 0) {
			fl2 = 1;
		}
		var args = {
			p1 : {
				x : p1.x,
				y : p1.y
			},
			p2 : {
				x : p2.x,
				y : p2.y
			},
			p3 : {
				x : p3.x,
				y : p3.y
			},
			r : settings.r,
			flag1 : fl1,
			flag2 : fl2
		};
		return args;
	}

	/**
	 * [获取扇形path的d参数]
	 * @param  {[Object]} args
	 * [x：扇形的 x 坐标； y：扇形的 y 坐标； r：扇形的半径； angle：扇形的角度； rotate：扇形初始角度]
	 *
	 * @return {[string]}
	 * [返回扇形path的d参数]
	 */
	function sector_getPathString(args) {
		var str = 'M' + args.p1.x + ',' + args.p1.y + ' L' + args.p2.x + ',' + args.p2.y + ' A' + args.r + ',' + args.r + ' 0 ' + args.flag1 + ',' + args.flag2 + ' ' + args.p3.x + ',' + args.p3.y + ' Z';
		if ((args.p2.x === args.p3.x) && (args.p2.y === args.p3.y)) {
			str = 'M' + (args.p1.x + args.r) + ',' + args.p1.y + ' A' + args.r + ',' + args.r + ' 0 0,0 ' + (args.p1.x - args.r) + ',' + args.p1.y;
			str += ' A' + args.r + ',' + args.r + ' 0 0,0 ' + (args.p1.x + args.r) + ',' + args.p1.y;
		}
		return str;
	};

	/**
	 * [获取饼图中每一个扇形的角度]
	 * @param  {[Array]} array 	[饼图的实际值数组]
	 *
	 * @return {[Array]} 		[返回饼图中每一个扇形的角度]
	 */
	function pie_getAngleArray(array) {
		var numbers = [];
		var angles = [];
		var sum = 0;
		var i,
		j;

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
	function pie_getRotateArray(angles, rotate) {
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
	/**
	 * [获取一个范围内随机的整数，]
	 * @param  {[Int]} min [最小整数]
	 * @param  {[Int]} max [最大整数]
	 * @return {[Int]}     [随机整数]
	 */
	function randomInt(min, max) {
		return Math.floor(Math.random() * max + min);
	};

	test = function () {

		var t = {a:1};
		var pie = new Pie(t);
		var svg1 = document.getElementById('svg1');
		svg1.innerHTML = pie.getHtml();

	}

})();
