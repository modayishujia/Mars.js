/**
 * Perm.js JavaScript Inheritance
 * By D.Wang http://t.qq.com/igaves
 * MIT Licensed
 * 
 * @warnning 子类不会执行父类的构造函数。请用this._super('initialize');调用
 */
var Class = (function(){
	var _slice = [].slice;
	
	function create(property){
		//property为类属性列表，initialize为构造函数。
		if(!property.initialize){
			property.initialize = function(){};
		}
		//构造类。
		var _class = function(){
			//console.log(this.__uninitialize);
			if(!this.__uninitialize && typeof this.initialize == 'function'){
				return this.initialize.apply(this,arguments);
			}
		};
		var args = [];
		//取property后面的参数列表，用来apply
		args = _slice.call(arguments,1);
		
		var key=null,parent_property = null;
		//父类的构造函数
		//如果父类存在，是继承状态
		if(typeof args[0] == 'function'){
			//
			//如果弗雷中
			//
			var parent = args[0];
			parent.prototype.__uninitialize = true;
			parent_property = new parent();//不执行initialize
			parent.prototype.__uninitialize = false;
			//父类的prototype赋值。
			_class.prototype = parent_property;
			_class.prototype._super = parent.prototype;
			
			args = args.slice(1);
		}
		//继承1.0
		/*for(key in property){
			var current_fn = property[key];
			if(parent_property && typeof _class.prototype._super[key] == 'function'){
				_class.prototype[key] = (function(k,v){
					return function(){
						var tmp  =this._super;
						this._super = tmp[k];
						var result = v.apply(this,arguments);
						this._super = tmp;
						return result;
					};
				})(key,current_fn);
			}else{
				_class.prototype[key] = property[key];
			}
		}*/
		
		add_methods(_class,property);
		
		//mixin
		for ( var i = 0; i < args.length; i++) {
			var arg = args[i];
			if(typeof arg == 'object'){
				for(key in arg){
					//警告，这里放不下太多的重名方法，以第一次为准。
					if(typeof _class.prototype[key] == 'undefined'){
						_class.prototype[key] = arg[key];
					}
				}
			}
		}

		_class.prototype.constructor = _class;
		
		return _class;
	}
	
	/**
	 * @desc 给某个类添加方法.我在写Mars._的时候，发现需要根据条件重写_each方法，是后续写入，所以，把这个方法提出来
	 * 
	 */
	function add_methods(target,properties){
		for(var key in properties){
			var property = properties[key];
			add_method(target,key,property);
		}
	}
	function add_method(_class,key,current_fn){
		if(_class.prototype._super && typeof _class.prototype._super[key] == 'function'){
			_class.prototype[key] = (function(k,v){
				return function(){
					var tmp  =this._super;
					this._super = tmp[k];
					var result = v.apply(this,arguments);
					this._super = tmp;
					return result;
				};
			})(key,current_fn);
		}else{
			_class.prototype[key] = current_fn;
		}
	}
	
	/**
	 * 单例
	 */
	function instance(className){
		if(typeof className == 'string'){
			className =eval(className);
		}
		if(typeof className ==='undefined') throw 'illegal class name';
		
		if(typeof className._instance === 'undefined'){
			className._instance = new className();
		}
		
		return className._instance;
	}
	
	function extend(class_name){
		var args = [].slice.call(arguments,1);
		for(var property in args){
			var static_property = args[property];
			for(var key in static_property){
				class_name[key] = static_property[key];
			}
		}
		return class_name;
	}
	
	return {
		/**
		 *创建新类，可继承
		 *@param {object} property -类方法，包括initilize构造函数
		 *@param {function} parent -父类，继承对象
		 *@example
		 *  //parentClass-<1>
		 *var Persion = Class.create({
		 *	initialize:function(name){
		 *		this.name = name;
		 *	},
		 *	getName:function(){
		 *		return this.name;
		 *	}
		 *});
		 *  //parentClass-<2>
		 *var Person = function(name){
		 * this.name = name;
		 *}
		 *Person.prototype.getName = function(){
		 *	return this.name;
		 *}
		 *  //inherit<1> 继承构造类。
		 *var Man=Class.create({
		 *	initilize:function(name,age){
		 *		this.parent();
		 *		this.parentClass.initilize.call(this,arguments);
		 *		this.age = age;
		 *	},
		 *	getAge:function(){
		 *		return this.age;
		 *	}
		 *},Person);
		 *  //inherit<2-1> 继承传统类第一种方式
		 *var Man1 = Class.create({
		 *	getAge:function(){
		 *		return this.age;
		 *	}
		 *},Person);
		 *  //inherit<2-2> 继承传统类第二种方式
 		 *var Man2 = Class.create({
 		 *	initilize:function(name,age){
 		 *		this.parent();
 		 *		this.age = age;
 		 *	},
		 *	getAge:function(){
		 *		return this.age;
		 *	}
		 *},Person);
		 *
		 *var Man3 = Class.create({
		 *	initialize:function(){
		 *	
		 *	}
		 *},EventUtil,ENumberable);
		 */
		create:create,
		add_method:add_method,
		add_methods:add_methods,
		/**
		 * 单例
		 * @param {class}
		 * @example 
		 * Class.instance(Service);
		 */
		instance:instance,
		/**
		 * 扩展静态方法
		 * @param {function/Class} -className/ModuleName/Object
		 * @param {object} -staticProperty -静态属性
		 * @example
		 * Class.extend(Dom,{
		 * 	create:function(nodeName){
		 * 		reutrn document.createElement(nodeName);
		 * }
		 * })
		 */
		extend:extend
	};
})();




 /*
  * Perm.js JavaScript Inheritance
  * By D.Wang http://t.qq.com/igaves
  * MIT Licensed
  */
var Mars = {modules:{}};
Class.extend(Mars,(function(){
	//获取module,设置module
	function _module(module_name,module_property){
		if(typeof module_property == 'undefined'){
			return Mars.modules[module_name];
		}
		if(Mars.modules[module_name]){
			throw 'module already defined';
		}
		Mars.modules[module_name] = module_property;
		
		return Mars;
	};
	/**
	 * 懒人循环
	 */
	function _each_for_normal(target){
		var render = Class.create({
			initialize:function(target){
				this.m = target;
			},
			each:function(iterator,context){
				try{
					this._each(iterator,context);
				}catch(e){
					if(e != 'break') throw e;
				}
				return this.m;
			}
		},Mars.module('enumberable'));
		//根据类型给不同的循环方式。
		var _each = target instanceof Array?function(iterator,context){
			for ( var i = 0; i < this.m.length; i++) {
				iterator.call(context,this.m[i],i);
			}
		}:function(iterator,context){
			for ( var key in this.m) {
				iterator.call(context,this.m[key],key);
			}
		};
		
		//添加_each方法
		Class.add_method(render,'_each',_each);
		
		return new render(target);
	}
	
	function each(target,iterator,context){
		return _each_for_normal(target).each(iterator,context).m;
	}
	//生成随机字符串
	function random_string(length) {
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
	    if(!this.__random_list){
	    	this.__random_list = {};
	    }
	    if (! length) {
	        length = 8;
	    }
	    
	    var str = '';
	    for (var i = 0; i < length; i++) {
	        str += chars[Math.floor(Math.random() * chars.length)];
	    }
	    if(this.__random_list[str]>-1){
	    	return random_string(length);
	    }
	    this.__random_list[str] = 1;
	    return str;
	}
	
	//深度复制
	function _deep_copy_object(source){
		var target = {};
		for(var key in source){
			var item =source[key];
			if(typeof item =='object'){
				if(typeof item.slice=='function'){
					target[key] = arguments.callee(item);	
				}else{
					target[key] = _deep_copy_array(item);
				}
			}else{
				target[key] = source[key];
			}
		}
		return target;
	}
	function _deep_copy_array(source){
		var target = [];
		for(var i=0;i<source.length;i++){
			var v = source[i];
			if(typeof v == 'object'){
				if(typeof item.slice == 'function'){
					target[i] = arguments.callee(item);
				}else{
					target[i] = _deep_copy_array(item);
				}
			}else{
				target[i] = v;
			}	
		}
		return target;
	}
	function deep_copy(source){
		if(typeof source == 'object'){
			if(source instanceof Array){
				return _deep_copy_object(source);
			}else{
				return _deep_copy_array(source);
			}
		}
		return source;
	}
	
	//可用函数代理
	function proxy(fn,context){
		if(fn.__proxy){
			return fn.__proxy;
		}
		var _proxy = function(){
			return fn.apply(context,arguments);
		};
		fn.__proxy = _proxy;
		
		return _proxy;
	}
	
	return {
		/**
		 * Mars.m("enumberable");
		 * Mars.m("enumberable",{...});
		 */
		module:_module,
		/**
		 * Mars._([1,2,3,4]).each(function(item,index)){
		 * 
		 * },context);
		 * Mars._({key:v,k:value}).each(function(item,key)){
		 * 	
		 * },context);
	
		 */
		_:_each_for_normal,
		/**
		 * @
		 * Mars.each([1,2,3,4],function(item,index){
		 * 	 
		 * },context);
		 * Mars.each({key:v,k:value},function(item,key){
		 * 
		 * },context);
		 * Mars.
		 */
		each:each,
		//生成随机字符串。
		random_string:random_string,
		//深度复制
		deep_copy:deep_copy,
		proxy:proxy,
		
	};
})());

//@import utils/class.js
//@import utils/modules.js

//@import enumberable.js
//@import observer.js
//import modules.js
Mars.module("enumberable",(function(){
	/**
	 * 循环
	 */
	function each(iterator,context){
		try{
			this._each(iterator,context);
		}catch(e){
			if(e != 'break') throw e;
		}
		return this;
	}
	function collect(iterator,context){
		var r = [];
		this.each(function(value,key){
			r.push(iterator.call(context,value,key));
		});
		return r;
	}
	return{
		each:each,
		collect:collect,
		map:collect
	};
})());

//import modules.js
/**
 * @module observer
 * 
 * 默认异步通知。如需要同步，那么设置对象_notify_sync = true;
 * @function notify(notice,data,sync)
 * @function add_observer()
 * @function remove_observer()
 * @alias 
 * 	notify=trigger
 * 	add_observer=bind
 *  remove_observer=unbind
 */
Mars.module("observer",(function(){
	function __init_observer(){
		if(!this.__publish_handler){
			/**
			 * 
			 * {
			 * 'say':[
			 * 			handler
			 * 		 ]
			 * }
			 * 
			 */
			this.__publish_handler = {};
			this.__published = {};
		}
	}
	/**
	 * @param notice{string} -消息头
	 * @param data{object} -消息
	 * @param sync{boolean} -是否异步。
	 */
	function notify(notice,data,sync){
		this.__init_observer();
		
		var self=this;
		if(!sync && !this._notify_sync){
			setTimeout(function(){
				self.notify(notice, data,true);
			},0);
			return;
		}
		var functions = this.__publish_handler[notice];
		
		Mars._(functions).each(function(lambda){
			//为了防止多处修改，把数据复制一下。
			var _data = Mars.deep_copy(data);
			lambda(_data);
		});
		//暂存一份。
		setTimeout(function(){
			self.__published[notice] = Mars.deep_copy(data);
		},1);
		return this;
	}
	//取消监听
	function remove_observer(notice,handler){
		this.__init_observer();
		
		if(typeof handler == 'undefined'){
			this.__publish_handler[notice] = [];
			return;
		}
		var handlers = this.__publish_handler[notice];
		Mars._(handlers).each(function(fn,index){
			if(fn === handler){
				this.__publish_handler[notice].splice(index,1);
				throw 'break';
			}
		},this);
		
		return this;
	}
	//开始监听
	function add_observer(notice,handler,use_history){
		this.__init_observer();
		//如果允许使用历史数据，那么执行过的，立刻执行回调。
		if(use_history && this.__published[notice]){
			handler(this.__published[notice]);
			return;
		}
		this.__publish_handler[notice] = this.__publish_handler[notice]||[];
		this.__publish_handler[notice].push(handler);
		
		return this;
	}
	
	return {
		__init_observer:__init_observer,
		notify:notify,
		add_observer:add_observer,
		remove_observer:remove_observer,
		bind:add_observer,
		unbind:remove_observer,
		trigger:notify,
		on:add_observer,
		off:remove_observer
	};
})());
