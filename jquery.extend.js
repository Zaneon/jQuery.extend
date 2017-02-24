'use strict';

// jQuery.Extend - Constant
$.extend({

	// 连调对象
	dtd: $.Deferred(),

	// 环境信息
	ua: navigator.userAgent.toLowerCase(),

	// 根
	root: location.protocol + '//' + location.host + '/',

	// 路由
	path: location.pathname.replace(/\.([a-zA-Z])+$/, '').match(/(\w|\-|\.)+/g) || [],

	// 参数
	params: (function( param ){

		return (function( result ){

			if( param ){

				$.each( param.split('&'), function(i, p){

					return (function( p ){

						result[ p[0].substr(0, p[0].length - 1) ] = p[1] || '';

					})( p.match(/[\w\%\/\-\{\}]+(=)?/g) );

					/*
					return function( p ){

						result[ p[0] ] = p[1] || '';

					}( p.split('=') );
					*/

				});

			}

			return result;

		})( {} );

	})( location.search.substr(1) ),

	// 事件集
	evt: (function( evts, json ){

		$.each( evts, function(i, e){

			json[ e ] = e;

		});

		json.touch = navigator.userAgent.toLowerCase().indexOf('mobile') == -1 ? json.click : ( json.touchstart || 'touchstart' );

		return json;
	})(
		(
			'blur focus focusin focusout load resize scroll unload click dblclick ' +
			'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
			'touchstart touchmove touchend touchcancel ' +
			'change select submit keydown keypress keyup error contextmenu'
		).split(' '),

		{}
	),

	// 对象集
	dom: {
		window:   $(window),
		document: $(window.document),
		body:     $(window.document.body),
		head:     $('head'),
		html:     $('html, body')
	}

	// Constant End
});


/* !!
 * Constant Monitor
 * ** *** **** ***** **** *** ** *
 */
$.monitor = function( type, obj ){

	var
		// 预置结果
		result = false,
		// 检测
		exp = function( reg ){
			return new RegExp( reg ).exec( $.ua );
		},
		detect = function( obj, type ){
			if( obj === null ){
				return obj === type;
			}
			if( ~$.inArray(type, ['json', JSON]) ){
				return $.isPlainObject( obj );
			}
			return ~$.inArray( type, [String, Number, Boolean, Array, Object, Date, Function]) ? obj.constructor === type : $.type( obj ) === type;
		};

	if( obj !== undefined ){
		return detect( obj, type );
	}

	if( type ){

		// 神快捷: 微信
		if( type == 'weixin' ){
			result = exp('micromessenger');

			// 使用微信JS.API校验
			if( !result ){

				try{
					// 非微信运行不能
					wx.checkJsApi({
						jsApiList: ['ready'],
						success: function( res ){
							$.isWeixin = !!res;
						}
					});
				}
				catch(e){
					// console.log(e);
				}

			}

			return !!result;
		}

		// 快捷
		if( ~$.inArray( type, 'iphone,ipad,mac,android,windows mobile'.split(',') ) ){
			result = exp( type );
		}
		else{

			result = exp('mobile') || exp('applewebkit');

			if( type != 'mobile' ){

				// 移动设备
				if( result ){

					// Ios || Android
					switch( type ){
						case 'ie':
							result = exp('msie');
							break;
						case 'firefox':
							result = exp('mercury') || exp('firefox');
							break;
						case 'chrome':
							result = exp('crios') || exp('chrome') || exp('gecko');
							break;
						case 'safari':
							result = exp('safari');
							break;
						case 'opera':
							result = exp('opios') || exp('opr');
							break;
					}

				}
				// 电脑设备
				else{

					switch( type ){
						case 'ie':
							result = exp('msie');
							break;
						case 'firefox':
							result = exp('firefox');
							break;
						case 'chrome':
							result = exp('chrome') && !exp('opr');
							break;
						case 'safari':
							result = exp('safari') && !exp('chrome');
							break;
						case 'opera':
							result = exp('opr');
							break;
					}

				}

			}

		}

		return !!result;
	}

	return $.monitor('iphone') ? 'ios' : ( $.monitor('android') ? 'android' : 'other' );
};

/* !!
 * Constant Network
 * ** *** **** ***** **** *** ** *
 */
$.net = function( mode ){

	return (function( connection, types ){

		if( mode ){
			switch( mode ){
				case 'online':
					return navigator.onLine;
					break;
				default:
					return mode === $.net();
					break;
			}
		}

		return (function( band ){

			if( band === 0 ){
				mode = types[6];
			}
			else if( band > 10 ){
				mode = types[2];
			}
			else if( band > 2 ){
				mode = types[4];
			}
			else if( band > 0 ){
				mode = types[3];
			}
			else{
				mode = types[0];
			}

			return mode;

		})
		( connection.bandwidth );

	})
	(
		navigator.connection || navigator.mozConnection || navigator.webkitConnection || { type: 'unknown' },

		'unknown ethernet wifi 2g 3g 4g none'.split(' ')
	);

};


/* !!
 * Time Format
 * ** *** **** ***** **** *** ** *
 */
$.extend({
	timeFormat: function( time, fmt ){
		var rule = {
	        'M+': time.getMonth() + 1, //月份
	        'd+': time.getDate(), //日
	        'h+': time.getHours(), //小时
	        'm+': time.getMinutes(), //分
	        's+': time.getSeconds(), //秒
	        'q+': Math.floor((time.getMonth() + 3) / 3), //季度
	        'S': time.getMilliseconds() //毫秒
	    };
	    if( /(y+)/.test(fmt) ){
			fmt = fmt.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length));
		}
	    for(var k in rule){
	    	if( new RegExp('(' + k + ')').test(fmt) ){
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (rule[k]) : (('00' + rule[k]).substr(('' + rule[k]).length)));
			}
		}
	    return fmt;
	}
});

$.extend({

	// 类型判断: String
	isString: function( obj ){
		return obj === undefined ? false : $.monitor( String, obj );
	},

	// 类型判断: Number
	isNumber: function( obj ){
		return obj === undefined ? false : $.monitor( Number, obj );
	},

	// 类型判断: Boolean
	isBoolean: function( obj ){
		return obj === undefined ? false : $.monitor( Boolean, obj );
	},

	// 类型判断: Array
	isArray: function( obj ){
		return obj === undefined ? false : $.monitor( Array, obj );
	},

	// 类型判断: Object
	isObject: function( obj ){
		return obj === undefined ? false : $.monitor( Object, obj );
	},

	// 类型判断: Function
	isFunction: function( obj ){
		return obj === undefined ? false : $.monitor( Function, obj );
	},

	// 类型判断: Json
	isJson: function( obj ){
		return obj === undefined ? false : $.monitor( JSON, obj );
	},

	// 类型判断: Undefined
	isUndefined: function( obj ){
		return obj === undefined;
	},

	// 类型判断: Date
	isDate: function( obj ){
		if( obj !== undefined && $.monitor( Date, obj ) ){
			return !~String(obj).indexOf('Invalid Date');
		}
		return false;
	},

	// 环境判断: Iphone
	isIphone: $.monitor('iphone'),

	// 环境判断: Ipad
	isIpad: $.monitor('ipad'),

	// 环境判断: Mac
	isMac: $.monitor('mac'),

	// 环境判断: Android
	isAndroid: $.monitor('android'),

	// 环境判断: Win Phone
	isWinphone: $.monitor('windows mobile'),

	// 环境判断: 移动设备
	isMobile: $.monitor('mobile'),

	// 浏览器判断: Internet Explorer
	isMsie: $.monitor('ie'),

	// 浏览器判断: Firefox
	isFirefox: $.monitor('firefox'),

	// 浏览器判断: Chrome
	isChrome: $.monitor('chrome'),

	// 浏览器判断: Safari
	isSafari: $.monitor('safari'),

	// 浏览器判断: Opera
	isOpera: $.monitor('opera'),

	// 环境判断: 微信
	isWeixin: $.monitor('weixin')

	// Constant Monitor End
});


$.extend({
// jQuery.Extend - Begin

/* !!
 * Data: Array Object
 * Callback: Function
 * ----- ----- -----
 */
recursion: function( data, callback, final ){
	if( data.length ){
		callback( data.shift() );
		return $.recursion( data, callback );
	}
	if( final ){
		final();
	}
},

/* !!
 * Data: Array Object
 * Comparision: Value Of Comparison
 * ----- ----- -----
 */
unique: function( data, comparison ){

    return (function( result ){

	    $.each( data, function( index, value ){

	        if( comparison !== undefined ){

	            if( comparison === value ){

	                if( !~$.inArray( comparison, result ) ){

	                    return result.push( value );

	                }

	                return;

	            }

	            return result.push( value );

	        }

	        if( !~$.inArray( value, result ) ){

	            return result.push( value );

	        }

	    });

	    return result;

    })
    ([]);
}

// jQuery.Extend - End
});


$.extend({
// jQuery.Extend - Begin

/* !!
 * Default: $.console( params[] );
 * Mobile: $.console( params[], 'mobile' );
 * ----- ----- -----
 */
console: function(){

	return (function( options, foreach, box ){

		if( !options.length ){

			return console.log('(nothing to output)');

		}

		switch( options[ options.length - 1 ].constructor === String ? options.pop() : undefined ){

			case 'default':

				foreach( options, function( index, option ){

					switch( option.constructor ){

						case Object:

							console.dir( option );

							break;

						case Array:

							console.dir( option );

							break;

						default:

							console.log( option );

							break;

					}

				});

				if( $.box ){

					$.box.clear();

					$.box.close();

				}

				break;

			default:

				box.clear();

				box.show();

				foreach( options, function( index, option ){

					box.info( index, option );

				});

				break;

		}

		return options;

	})
	(
		Array.prototype.slice.call( arguments ),

		function( data, callback, i ){

			for( i in data ){

				callback( i, data[i] );

			}

		},

		(function( code, pre, close ){

			$.box = $.box || (function( css, sheet ){

				css( code, sheet('code') );

				css( pre, sheet('pre') );

				css( close, sheet('close') );

				close.innerHTML = '♪';

				close.addEventListener('click', function(){

					code.style.display = 'none';

				}, false);

				code.appendChild( close );

				code.appendChild( pre );

				document.body.appendChild( code );

				return {

					clear: function(){

						pre.innerHTML = '';

					},

					info: function( index, info ){

						pre.innerHTML += (index + ':') + JSON.stringify(info)

										.replace(/\{|\}|\[|\]/g, function( word ){

											return '\n' + word + '\n';

										})

										.replace(/,/g, ',\n') + '\n';

					},

					show: function(){

						code.style.display = 'block';

					},

					close: function(){

						close.click();

					}

				};

			})
			(

				function( element, sheet ){

					return (function( cssText, name ){

						for( name in sheet ){

							cssText += name.replace(/[A-Z]/g, function( word ){

								return '-' + word.toLowerCase();

							}) + ':' + sheet[name] + ';';

						}

						element.style.cssText = cssText;

						return element;

					})('');

				},

				function( mode ){

					switch( mode ){

						case 'code':

							return {

								top: '5%',

								left: '5%',

								right: '5%',

								bottom: '5%',

								zIndex: '2147483647',

								position: 'fixed',

								padding: '2%',

								borderRadius: '3px',

								overflow: 'auto',

								border: '1px solid dimgray',

								backgroundColor: 'rgba(0, 0, 0, .5)'

							};

						case 'pre':

							return {

								color: 'white',

								border: 'none',

								backgroundColor: 'transparent'

							};

						case 'close':

							return {

								width: '20px',

								height: '20px',

								lineHeight: '1',

								marginTop: '20px',

								marginRight: '20px',

								fontSize: '20px',

								top: '5%',

								right: '5%',

								position: 'fixed',

								textAlign: 'center',

								color: 'white',

								cursor: 'pointer'

							};

					}

					return {};

				}

			);

			return $.box;

		})(

			document.createElement('code'),

			document.createElement('pre'),

			document.createElement('i')

		)

	);

},

/* !!
 * debug: debug
 * mode: mobile
 * ----- ----- -----
 */
log: function( debug, mode ){

	debug = debug || 'debug', mode = mode || 'mobile';

	switch( debug ){
		case 'debug':
			window.onerror = function( msg, url, line ){
				$.console( {
					msg: msg,
					url: url,
					line: line
				}, mode );
				return true;
			}
			break;
	}
},

/* !!
 * rule: reg
 * callback: function
 * ----- ----- -----
 */
rewrite: function( pattern, callback ){

	return (function( cache, callback ){

		( location.pathname ).replace( new RegExp( pattern ), function( word ){

			cache.push( word );

			return word;

		});

		if( cache.length ){

			return callback.apply( this, cache );

		}

	})( [], callback || $.noop );

},

/* !!
 * target: Element
 * time: stream
 * hand: function
 * ----- ----- -----
 */
longTouch: function( target, hand, time ){

	return (function( target, time, can, out ){

		target

			.on('touchstart', function(){

				if( can ){

					can = false;

					out = setTimeout(function(){

						can = true;

						clearTimeout( out );

					}, time);

				}

			})

			.on('touchend', function(){

				if( can ){

					$.isFunction( hand ) ? hand( target ) : alert( hand );

				}

				can = true;

				clearTimeout( out );

			});

	})( $( target || document ), time > 0 ? time : 1000, true, 0 );

},

/* !!
 * target: Element
 * count: Number
 * time: Stream
 * hand: Function
 * ----- ----- -----
 */
fastTouch: function( target, count, hand, time ){

	target = $( target || document ),

	count  = count > 0 ? count : 1,

	time   = time > 0 ? time : 300;

	var measure = 0, run = 0, out = 0;

	var

	init  = function(){

		measure = count;

		run = time;

	},

	clean = function( hand ){

		clearInterval( out );

		measure = 0;

		run = 0;

		out = 0;

		if( hand ){

			hand( target );

		}

	};

	target

		.on('touchstart', function( e ){

			if( out ){

				measure--;

				if( measure > 0 ){

					run = time;

					return;

				}

				clean( hand );

			}

			else{

				init();

				out = setInterval(function(){

					if( run > 0 ){

						run -= 15;

					}

					else{

						clean();

					}

				}, 15);

			}

		});

},

/* !!
 * Read: $.cookie( @name:String );
 * Write: $.cookie( @name:String, @value:String, @time:MS );
 * Delete: $.cookie( @name:String, null );
 * ----- ----- -----
 */
cookie: function( name, value, time ){

	return (function( cookies, name, value, time, mode, date, transform ){

		if( name ){

			if( mode ){

				document.cookie = name + '=' + cookies[ name ] + '; ' + date( -1 ) + ';path=/';

				return $.cookie();

			}

			if( value ){

				document.cookie = name + '=' + value + '; ' + date( time ) + ';path=/';

				return $.cookie();

			}

			return cookies[ name ];

		}
		return cookies;

	})
	(

		function( cookies, result ){
			$.each( cookies.split(';'), function( index, cookie ){

				if( cookie ){

					(function( cookie ){

						result[ cookie[1] ] = cookie[2];

					})( /(\w+)=(.*)/.exec( $.trim(cookie) ) );

				}

			});
			return result;

		}
		( window.document.cookie || '', {} ),

		// Name
		name || '',

		// Value
		value || undefined,

		// Time
		( time > 1000 ? time : 0 ),

		// Mode
		( value === null ),

		// Date
		function( time ){

			return time ? (function( date ){

				return date.setTime( date.getTime() + time ), 'expires=' + date.toGMTString();

			})
			( new Date() ) : '';

		},

		// Transform
		function( cookies ){

			return (function( result ){

				$.each( cookies, function( name, value ){

					result += name + '=' + value + ';';

				});
				return result;

			})
			('');

		}

	);

},

/* !!
 * Storage Control
 * ----- ----- -----
 */
storage: {

	// 缓存器
	cache: {},

	// 数据封印
	seal: function( data ){

		if( $.isJson ){
			data = JSON.stringify( data );
		}

		return data;

	},

	// 解除封印
	dispel: function( data ){

		try{
			data = JSON.parse( data );
		}
		catch( e ){}

		return data;
	},

	// 设值
	set: function(){

		var data = {};

		if( !arguments.length ){
			return data;
		}

		// Get Data
		if( $.isJson( arguments[0] ) ){
			data = arguments[0]
		}
		else{
			data[ arguments[0] ] = arguments[1];
		}

		$.each( data, function( key, value ){
			// To Cache
			$.storage.cache[ key ] = value;
			// Set Item
			window.localStorage.setItem( key, $.storage.seal( value ) );
		});

	},

	// 获取
	get: function(){

		if( !arguments.length ){
			return undefined;
		}

		if( arguments.length === 1 ){
			return $.storage.dispel( window.localStorage.getItem( arguments[0] ) );
		}

		var data = {};

		$.each( arguments, function( index, key ){
			// Get Item
			data[ key ] = $.storage.dispel( window.localStorage.getItem( key ) );
		});

		return data;
	},

	// 删除
	del: function(){

		if( !arguments.length ){
			return undefined;
		}

		$.each( arguments, function( index, key ){
			// Get Item
			window.localStorage.removeItem( key );
		});

	}

},

/* !!
 * Fetch
 * ----- ----- -----
 */
fetch: function( element, selector, check ){

	return (function( filter, closest, exe ){

		if( filter.length ){

			return exe( filter, check );

		}

		if( closest.length ){

			return exe( closest, check );

		}

		return $( element );

	})

	(
		$( element ).filter( selector ),

		$( element ).closest( selector ),

		function( result, check ){

			return check ? !!result.length : result;

		}
	);

},

/* !!
 * @url: String
 * @mode: default | top | parent | self | blank | new
 * ----- ----- -----
 */
link: function( url, target, method ){

	return url ? (function( judge ){

		target = target === undefined ? 'self' : target;

		if( target in judge.direct ){

			return judge.direct[ target ].location.href = url;

		}

		if( ~$.inArray( target, judge.stair ) ){

			return (function( form ){

				form.submit().empty();

				return true;

			})

			( $('<form action="' + url + '" method="' + ( ~$.inArray( method, judge.method ) ? method : 'get' ) + '" target="_' + target + '"></form>') );

		}

		return false;

	})
	(
		{
			method: 'get post put delete'.split(' '),

			direct: {

				top: window.top,

				parent: window.parent,

				self: window

			},

			stair: 'blank new'.split(' ')
		}

	) : undefined;

},

/* !!
 * Href Jump
 * ----- ----- -----
 */
href: function( options ){

	// 参数容错
	options = $.extend( $.isJson( options ) ? options : {}, {
		//
	});

	// 事件代理
	$(document).on( options.event || 'click', options.selector || '*[href]', function( event ){

		console.log( event );

	});
},

/* !!
* Form Control
* ----- ----- -----
*/
form: function( form, options ){
	// 参数容错
	form = $( form ), options = options || {};
		// 配置
		return (function( evolution, hand ){
			var listener = function( event ){
				return hand(
					// 事件
					event,
					// 参数
					evolution( form.serializeArray() ),
					// 属性
					$.extend( form.data(), {
						action: form.attr('action'),
						method: form.attr('method') || 'get'
					})
				);

			}
			form.off('submit', listener).on('submit', listener);
		})
		(
			// Evolution Data
			function( data ){
				var json = {};
				$.each( data, function( index, one ){
					json[ one.name ] = one.value;
				});
				return json;
			},
			// Event Hand
			function( event, data, attr ){

				if( ( $.isFunction( options.valid ) ? options.valid( form, data, attr ) : options.valid ) !== false ){

					// 穿越变量
					var cross = {};

					$.ajax({
						// 路径
						url: attr.action,
						// 类型
						type: attr.method,
						// 参数
						data: data,
						// 成功
						success: options.success,
						// 失败
						error: options.error
					});

				}

				return false;
			}
		);
	},
/* !!
 * History Control
 * ----- ----- -----
 */
historyControl: function( options ){

	// 参数容错
	options = $.extend( $.isJson( options ) ? options : {}, {
		// 链接
		go: function( page, can ){
			// 是否后退
			can = can === undefined ? true : false;
			// History控制
			history[ can ? 'pushState' : 'replaceState' ]( history.state ? { page: page } : null, page, '/#/' + page );
			// 刷新
			location.replace('/#/' + page);
		},
		// 控制函数
		pop: function(){
		// 注入函数
			if( $.popChannel ){
				$.popChannel( history.state );
			}
		},
		// 初始化
		init: function( origin, callback ){
			callback( history.pushState({ page: origin }, origin, null) );
		}
	});

	// 初始化
	options.init( options.origin || 'index', function(){
		// 赋值
		$.go = options.go;
		// 监听状态事件
		window.addEventListener('popstate', options.pop);
	});
},

/* !!
 * @count: String
 * @time: MS
 * @def: Boolean
 * @callback: Function
 * ----- ----- -----
 */
timeout: function( options ){

	// 快捷
	if( $.isFunction( options ) ){
		// 数据
		options = { callback: options };
	}

	// 参数容错
	options          = options || {},

	// 回调函数
	options.callback = options.callback || $.noop,

	// 时间间隔
	options.time     = options.time || 100,

	// 计数器更替量
	options.result   = options.time,

	// 初始化执行
	options.def      = $.type(options.def) === 'boolean' ? options.def : false,

	// 计数器
	options.count    = Math.abs( options.count || 1 ),

	// 计时器对象
	options.timeout,

	// 执行动作
	options.action   = function(){

		// 计数器依据
		if( options.count ){

			options.timeout = setTimeout(function(){

				// 回调函数内可返回result, 如为数字, 则可更替计数器当前值
				options.result = options.callback( options );

				// 如result为数字, 则更替计数器
				if( $.isNumeric( options.result ) ){
					options.count = options.result;
				}

				// 递减次数
				--options.count, clearTimeout( options.timeout ), options.action();

			}, options.time);

			return;
		}

		// 清除计时器
		clearTimeout( options.timeout );
	};

	// 初始化执行
	if( options.def ){
		options.callback( options );
	}

	// 执行动作
	options.action();

	return this;

},

/* !!
 * 指令器：Command
 * ----- ----- -----
 */
command: function( options ){
	// 全局标记
	$.action = $.action || {};
	// 参数容错
	options = $.extend( options || {}, {
		// 事件
		event: ['ready', 'click', 'mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave', 'focusin', 'focusout', 'keypress', 'keydown', 'keyup', 'change', 'submit', 'init'],
		// 代理
		agent: {
			DOMNodeInserted: 'ready',
			DOMNodeRemoved: 'destroy'
		},
		// 对象重置器
		fetch: function( dom, type ){
			// 参数容错
			dom = $(dom), type = '[data-' + type + ']';
			// Filter & Closest
			var domFilter = dom.filter( type ), domClosest = dom.closest( type );
			// 返回
			return domFilter.length ? dom : ( domClosest.length ? domClosest : dom );
		},
		// 集成器
		collect: function( direct ){
			// 返回数据结构
			return {
				// 方法
				hand: direct ? options.evolution( direct ) : $.noop,
				// 参数
				param: direct ? options.purify( direct ) : {}
			};
		},
		// 净化[方法]
		evolution: function( direct ){
			// 解构
			var hand = direct.match(/^\w+/);
			// 检测
			return $.action[ hand ] || $.noop;
		},
		// 净化[参数]
		purify: function( direct ){
			// 解构
			var param = direct.match(/\((.*)?\)/);

			if( param ){
				// Json
				try{
					param = eval( param.shift() );
				}
				// String
				catch(e){
					param = param[1];
				}
			}
			// 参数容错
			return param || {};
		},
		// 动作
		action: function( event ){

			// 对象
			var element = $( options.agent[ event.type ] ? this : options.fetch( event.target, event.type ) );
			// 属性
			var attr = element.data();
			// 事件名
			var fns = 'before execute after';
			// 句柄, 参数
			var hand = {}, param = {};
			// 传播
			var propagate = true;

			// Refresh Agent
			event.type = options.agent[ event.type ] || event.type;

			// 数据解构
			$.recursion( fns.split(' '), function( fn ){
				// 骨头
				var bone = options.collect( attr[ fn === 'execute' ? event.type : fn ] );
				// 方法集成
				hand[ fn ] = bone.hand;
				// 参数集成
				param[ fn ] = bone.param;
			});

			/* 注释：
			 * Hand Process: before -> execute -> after
			 * If any one ( return false ), Then stop running ..!
			 * ------
			 */
			// Hand.Before
			if( hand.before.apply( this, [element, param.before, event] ) !== false ){
				// Propagate
				propagate = hand.execute.apply( this, [element, param.execute, event] );
				// Hand.Execute
				if( propagate !== false ){
					// Hand.After
					hand.after.apply( this, [element, param.after, event] );
				};
			}

			return propagate;
		}
	});

	// 全局代理
	$.dom.document
		// 指令
		.on( options.event.join(' '), options.action );
	// 指令
	$.each( options.agent, function( event, agent ){
		// 代理
		$.dom.document.on( event, '[data-' + agent + ']', options.action);
	});

},

/* !!
 * Template Engineer
 * ----- ----- -----
 */
render: function( tree, data ){

	return (function( tree ){

		tree = tree.replace(/%(\w|\.)+%/g, function( word, result ){

			result = data;

			$.recursion( word.replace(/%/g, '').split('.'), function( level ){

				result = result[ level ];

			});

			return word.length ? result : word;

		});

		return tree;

	})
	( tree.prop('outerHTML') );

},

/* !!
 * Compile HTML
 * ----- ----- -----
 */
compile: function( text, mode ){
	return mode ? text.replace(/</g, '&lt;').replace(/>/g, '&gt;') : text.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
},

/* !!
 * Template EJS
 * ----- ----- -----
 */
template: function( element, data, callback, mode ){

	try{
		(function( html, data, callback ){
			callback( element.html( ejs.render( html, data ) ), data );
		})
		(
			$.compile( element.html() ),
			data.it || { it: data },
			callback || $.noop
		);
	}
	catch (e) {
		console.log(e);
	}

},

/* !!
 *
 * ----- ----- -----
 */
popup: function( options ){

	// 参数容错
	options             = options           || {},
	// 于容器内
	options.container   = options.container || undefined,
	// 可视区域
	options.screen      = {},
	// 可视区域, x坐标
	options.screen.x    = options.container ? options.container.width()  : $.dom.window.width(),
	// 可视区域, y坐标
	options.screen.y    = options.container ? options.container.height() : $.dom.window.height(),
	// 方向
	options.coor        = options.coor      || {},
	// 方向, x坐标
	options.coor.x      = options.coor.x    || 'center',
	// 方向, y坐标
	options.coor.y      = options.coor.y    || 'center',
	// 尺寸
	options.size        = $.isString( options.size ) ? eval('(' + options.size + ')') : ( options.size || {} ),
	// 尺寸, x坐标
	options.size.w      = options.size.w    || options.screen.x * .8,
	// 尺寸, y坐标
	options.size.h      = options.size.h    || options.screen.y * .6,
	// 标题
	options.title       = options.title     || false,
	// 内容
	options.content     = options.content   || '',
	// 模式: default | fade | top | left | right | bottom
	options.mode        = options.mode      || 'default',
	// 速度: slow | normal | fast | number
	options.speed       = $.isNumeric( options.speed ) ? options.speed : 300,
	// 提交方法: 如submit参数为function, 则显示submit按钮
	options.submit      = $.isFunction( options.submit ) ? options.submit : false,
	// 取消按钮: 布尔
	options.cancel      = $.isBoolean( options.cancel )  ? options.cancel : true,
	// 遮罩层: 布尔
	options.mask        = $.isBoolean( options.mask )    ? options.mask   : true,
	// 回调(特殊): 用于替换submit方法
	options.callback    = options.callback  || options.submit || $.noop,
	// 回调: 打开前
	options.beforeOpen  = $.isFunction( options.beforeOpen )  ? options.beforeOpen  : $.noop,
	// 回调: 打开后
	options.afterOpen   = $.isFunction( options.afterOpen )   ? options.afterOpen   : $.noop,
	// 回调: 关闭前
	options.beforeClose = $.isFunction( options.beforeClose ) ? options.beforeClose : $.noop,
	// 回调: 关闭后
	options.afterClose  = $.isFunction( options.afterClose )  ? options.afterClose  : $.noop,
	// 对象集容错
	options.element     = options.element   || {},
	// 对象集
	options.element     = {
  		// 弹出层
		popup:   $('<div></div>').addClass('pop').addClass('fixed z-max'),
		// 遮罩
		mask:    $('<div></div>').addClass('pop-mask').addClass('screen-max z-max').css('zIndex', '1247483584'),
		// 标题
		title:   $('<div></div>').addClass('pop-title').html( options.title ),
		// 内容
		content: $('<div></div>').addClass('pop-content').html( options.content ),
		// 按钮集
		menus:   $('<div></div>').addClass('pop-menu'),
		// 提交按钮
		submit:  $('<button type="submit">' + ($.isString(options.element.submit) ? options.element.submit : '确定') + '</button>'),
		// 取消按钮
		cancel:  $('<button type="button">' + ($.isString(options.element.cancel) ? options.element.cancel : '取消') + '</button>')
	},
	// 中心点
	options.center = {
		x: options.screen.x / 2,
		y: options.screen.y / 2
	},
	// 移动目标点
	options.move = {
		x: options.center.x - options.size.w / 2,
		y: options.center.y - options.size.h / 2
	},
	// 初始css标记
	options.css = {},
	// 对象存储
	options.it = this,

	// 诞生啦: 置入
	options.born = function(){

		$.dom.body.append( options.element.popup );

		if( options.mask ){
			$.dom.body.append( options.element.mask );
		}
	},
	// 死亡啦: 销毁
	options.destroy = function(){
		options.element.mask.remove(), options.element.popup.remove();
	},
	// 参数
	options.it.options = options,
	// API: 打开
	options.it.open = function(){

		// 回调函数 -- 打开前
		options.beforeOpen( options );

		// 置入
		options.born();

		// 预留, 模式
		switch( options.mode ){
			case 'fade':
				break;
			case 'top':
				break;
			case 'left':
				break;
			case 'right':
				break;
			case 'bottom':
				break;
			default:
				options.element.popup.show();
				break;
		}

		// css动画
		options.element.popup
			.animate(
				{
					// top: options.move.y,
					// left: options.move.x,
					opacity: 1
				},
				options.speed,
				function(){

					// 绑定移除事件
					options.element.cancel.on( $.evt.click, options.it.close );

					// 绑定提交事件
					options.element.submit.on( $.evt.click, function(e){
						options.callback( options );
					});
				}
			);

		// 移除事件拓展
		options.element.mask.on( $.evt.click, options.it.close );

		// 回调函数 -- 打开后
		options.afterOpen( options );
	},
	// API: 关闭
	options.it.close = function(){

		// 回调函数 -- 关闭前
		options.beforeClose( options );

		// css归位
		options.element.popup.animate( options.css, options.speed, function(){

			// 销毁
			options.destroy();

			// 回调函数 -- 关闭后
			options.afterClose( options );
		});
	},
	// API: 初始化(重置)
	options.it.init = function(){

		if( options.cancel ){
			options.element.cancel.appendTo( options.element.menus );
		}
		if( options.submit ){
			options.element.submit.appendTo( options.element.menus );
		}

		// 结构整理
		options.element.popup
			.append( options.title ? options.element.title : '' )
			.append( options.element.content )
			.append( options.element.menus );

		// 初始化css
		options.css = {
			// left:   options.move.x,
			// top:    options.move.y,
			width:  options.size.w
			// height: options.size.h
		};

		// 初始化css, 模式
		switch( options.mode ){
			case 'fade':
				options.css.opacity = 0;
				break;
			case 'top':
				options.css.top = 0 - options.size.h;
				break;
			case 'left':
				options.css.left = 0 - options.size.w;
				break;
			case 'right':
				options.css.left = options.screen.x;
				break;
			case 'bottom':
				options.css.top = options.screen.y;
				break;
			default:
				options.element.popup.hide();
				break;
		}

		// 补丁 - 内容高度
		(function( distance ){

			// options.element.content.height( options.size.h - ( options.title ? 56 : 0 ) - ( 48 + distance * 2 ) );

			options.element.menus.css({
				paddingTop: distance,
				paddingBottom: distance
			});

		})( options.size.w * 0.05 );

		if( options.cancel === false ){
			options.element.submit.width('100%');
		}

		// 初始css, 打开弹出层, 放出接口
		return options.element.popup.css( options.css ), options.it.open(), options.it;
	};

	// 执行初始化
	return options.it.init();

},

// 渲染Popup
renderPopup: function( elements ){

	$.each(elements, function(i, element){

		var

		data = $.dataget( element ),

		option = {
			event: data.event || $.evt.click
		};

		data.mode = data.mode || data.popup;

		data.submit = window[ data.submit ] || undefined;

		$(element).on( option.event, function(){

			$.popup( data );

		});

	});

},

// 提示
trace: function( message, time, callback ){

	callback = $.isFunction( time ) ? time : ( callback || $.noop );

	return function( message, time, popup ){

		window.popup = popup = $.popup({

			content: '<div>' + message + '</div>',

			// cancel: false,

			// mask: true,

			// mode: top,

			speed: 0,

			element: {

				cancel: '关闭'

			},

			size: {
				w: $.dom.window.width() * 0.8, h: 240
			},

			beforeOpen: function( options ){

				options.element.popup.addClass('trace');

			},

			afterOpen: function(){

				if( time !== undefined ){

					$.timeout({

						time: time,

						callback: function(){

							popup.close();

						}

					});

				}

			},

			afterClose: function(){

				callback();

			}

		});

	}( message || '', time > 0 ? time : undefined );

}

// jQuery.Extend - Ending
});
