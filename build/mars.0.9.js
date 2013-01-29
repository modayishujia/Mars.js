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
		 * var hash = Mars._({key:v,k:value});
		 * hash.find_index(1)
		 * hash.remove(2);
		 * hash.each(function(item,key)){
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
		proxy:proxy
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







Class.extend(Mars,(function(){
	
var Base = {};
/*
 * 很勉强的实现了一个伪的Rest支持。后续等有后台支持了再说。
 * Perm.set('todo.model',{
 * 	url:'http://baidu.com',
 * 	_attr:'id name age',
	initialize:function(args){
		this._super(args);
	}
  });
  var Todo = Perm.get("todo.model");
  var todo = new Todo({});
  
  before.
*/
Base.model = Class.create({
	__attr:{},
	primary:'id',
	url:null,
	initialize:function(args){
		Class.extend(this.__attr,args);
	},
	save:function(){
		var type = Mars.REQUEST_TYPE.add;
		var url = this._get_request_url("add");
		if(this.__attr[primary]){
			//更新。
			type = Mars.REQUEST_TYPE.update;
			url = this._get_request_url('update');
		}
		
		var args = {
				url:url,
				type:type,
				data:this.__attr
		};
		
		return $.ajax(args);
	},
	attr:function(key,value){
		this.__attr[key] = value;
		return this;
	},
	get:function(){
		
		return $.ajax({
			url:this._get_request_url('get'),
			data:this._get_request_id()
		});
	},
	remove:function(){
		var args = {
				url:this._get_request_url('remove'),
				type:Mars.REQUEST_TYPE.remove,
				data:this._get_request_id()
		};
		return $.ajax(args);
	},
	update:function(attrs){
		if(!attrs){
			attrs = this.__attr;
		}
		return $.ajax({
			url:this._get_request_url("update"),
			type:Mars.REQUEST_TYPE.update,
			data:attrs
		});
	},
	_get_request_id:function(){
		var data = {};
		data[this.primary] = this.__attr[this.primary];
		return data;
	},
	_get_request_url:function(method){
		if(!Mars.support_rest){
			return this.url[method];
		}
		return this.url;
	}
},Mars.module("observer"),Mars.module("enumberable"));

Base.model_static = {
	all:function(args){
		args = this._fix_args(args);
		return $.ajax(args);
	},
	fetch:function(condition,args){
		args = this._fix_args(args);
		args.data = condition;
		return $.ajax(args);
	},
	find:function(condition,args){
		this.fetch(condition, args);
	},
	_fix_args:function(args){
		var url = this.prototype.url;
		if(Mars.support_rest){
			url = url['get'];
		}
		var source = {type:Mars.REQUEST_TYPE.get,url:url};
		Mars._(args).each(function(item,key){
			source[key] = item;
		});
		return source;
	}
};

/**
 * var User = Perm.get('say.model');
 * User.fetch({name:'say','method':'save'})
 * 	.done()
 *  .error()
 *  .always();
 */
//Base.controller = Class.create({
//	
//},Mars.module("observer"));

Base.service = Class.create({
	
},Mars.module("observer"));

//Base.service = Class.create({},Mars.module);
Base.view = Class.create({
	d:{},
	//[items/click/todo_handler,m/a.say/click/handler]
	_e:[],
	/**
	 * 自动set,get
	 */
	_:function(key,value){
		if(typeof value == 'undefined' && typeof key == 'string'){
			return this.d[key];
		}
		
		if(typeof key == 'object'){
			Mars._(key).each(function(selector,index){
				this.set(index,selector);
			},this);
		}else{
			this.d[key] = typeof value == 'string'?$(value):value;
		}
		
		return this;
	},
	add_events:function(rules){
		Mars._(rules).each(this.add,this);
	},
	remove:function(rule){
		this._toggle_event(rule,true);
	},
	_toggle_event:function(rule,off){
		var method = off?'off':'on';
		var arr = item.split('/');
		if(arr.length==3){
			this._(arr[0])[method](arr[1],Mars.proxy(this[arr[2]],this));
		}else{
			this._[arr[0]][method](arr[1],arr[2],Mars.proxy(this[arr[2]],this));
		}
	},
	/**
	 *target/event/handler
	 *parent/delegate/event/handler
	 */
	add:function(rule){
		this._toggle_event(rule);
	}
},Mars.module("observer"));

/**
 * @example
 * Perm.set('now.view',{},modules);
 * Perm.set('now.controller',{
 * 	initialize:function(){
 * 
 * 	},
 *  load_data:function(){
 *  	var Todo = Perm.get('todo.model');
 *  	var todo = new Todo({title:'',content:''});
 *  	todo.save();
 *  }
 * },modules);
 * Perm.set('now.model',{},modules);
 * 直接运行某个规则，带参数。
 * Perm.run('now.view/say',message);
 * 添加访问规则
 * Perm.add_rules([
 * 	say.view/data:saved/say.controller/saved_handler',
 * 'todo.controller/slider:reset/say.view
 * ]);
 * 
 * Perm.hash_support();
 * Perm.add_hash_rules({
 * 'default':function(){
 * 		window.location.hash ='home';
 * 		Perm.run('todo.controller/load:data');
 * 	},
 * '([\w]+)\-(\d)':function(params){
 * 		Perm.run("todo.view/set_current_time",params[0],params[1]);
 * 		window.location.hash = ?
 * 		history.pushState = ?
 * 
 * 		目前hash支持没有测试太多。如果有合适项目，可以测测看。
 * 	}
 * });
 */
var _mars_msv = {
		initialize:function(){
			this._is_running=true;
			//初始化所有view
			this._instance_all();
			//执行注册的默认函数。
			this.run();
		},
		//存储
		_view:{},
		__view:{},
		_service:{},
		__service:{},
//		_controller:{},
//		__controller:{},
		_model:{},
		
		_is_running:false,
		
		//事件规则。
		rules:[],
		hash_rules:{},
		_hash_support:false,
		support_rest:false,
		//默认执行的函数。
		_default:[],
		REQUEST_TYPE:{
			'remove':'post',
			'get':'get',
			'update':'post',
			'add':'post'
		},
		//设置新的对象
		set:function(name,property,module){
			var modules = [].slice.call(arguments,2)||[],
				names = name.split("."),class_name=names[0],class_base=names[1],
				_class = Class.create(property,Base[class_base],modules);
			
			this['_'+class_base][class_name] = _class;
			//如果是model,那么扩展静态方法。
			if(class_base == 'model'){
				Class.extend(_class,Base.model_static);
			}
			
			//如果是domready状态，view自动实例化。否则等待最后实例化。controller随时实例化。
			if(this._is_running){
				Mars._(this.rules).each(function(rule){
					this._run_rule(rule);
				},this);
			}
			
			//model不执行实例化。
			if(class_base =='controller' || class_base == 'service' ||(class_base == 'view' && this._is_running)){
				this['__'+class_base][class_name] = Class.instance(_class);
			}
			
			return this.get(name,true);
		},
		//ready后，初始化所有view
		_instance_all:function(){
			Mars._(this._view).each(function(value,key){
				this.__view[key] = Class.instance(value);
			},this);
		},
		//获取某个实例，如果model,那就是对象。
		/**
		 * @param name{string} -名称
		 * @param object{boolean} -是否返回对象/实例
		 */
		get:function(name,object){
			var names = name.split("."),class_name=names[0],class_base=names[1];
			
			var prefix = (class_base!='model' && !object)?'__':"_";
			
			return this[prefix+class_base][class_name];
		},
		//普通rule.相互监听的规则。
		add_rules:function(rules){
			Mars._(rules).each(function(rule){
				this._add_rule(rule);
			},this);
			
			return this;
		},
		add_rule:function(rule){
			this.rules.push(rule);
			
			if(this._is_running){
				this._run_rule(rule);
			}
		},
		//解除绑定
		destory_rule:function(rule){
			if(this._is_running){
				this._run_rule(rule,true);
			}else{
				throw 'error[can not remove observer before running Mars.destory_rule]';
			}
		},
		/**
		 * 解析规则为绑定规则。
		 * @private
		 * @param rule
		 * @example
		 * _run_rule('todo.view/event:type/todo.controller/event_handler');
		 * _run_rule('todo.view/event:type/todo.controller');//event_handler:type_handler
		 */
		_run_rule:function(rule,destory){
			var arr = rule.split('/');
			if(this._is_running){
				var event_target = this.get(arr[0]),
					recive_target = this.get(arr[2]);
				//如果没有处理函数，自动用后续配对的来处理。
				if(arr.length == 3){
					var notice_type = arr[1].replace(':','_');
					if(typeof recive_target[notice_type] == 'function'){
						arr.push(notice_type);
					}else{
						arr.push(notice_type+'_handler');
					}
				}
				
				if(typeof recive_target[arr[3]] != 'function'){
					throw 'undefined handler_function+['+arr[3]+'] at '+arr[2];
				}
				
				var method = destory?'remove_observer':'add_observer';
				//判断是否为_handler
				event_target[method](arr[1],Mars.proxy(recive_target[arr[3]],recive_target));
			}else{
				throw 'error[run before dom ready:Mars._run_rule.]';
			}
			
			return this;
		},
		/**
		 * 函数调用指南。
		 * @param call_rule
		 *say.controller/load_data;
		 */
		_call:function(call_rule){
			var args = call_rule.split('/');
			this.get(args[0])[args[1]].apply(this.get(args[0]),[].slice.call(arguments,1));
		},
		//执行某个默认函数。
		run:function(rule){
			if(this._is_running){
				if(rule){
					this._call.apply(this,arguments);
					return;
				}else{
					Mars._(this.rules).each(function(v){
						this._run_rule(v);
					},this);
					Mars._(this._default).each(function(v){
						this._call.apply(this,v);
					},this);
				}
			}else{
				if(rule){
					this._default.push(arguments);
				}else{
					throw 'error[undefined rule to run Mars.run]';
				}
			}
		},
		/**
		 * 是否支持rest
		 */
		rest_support:function(){
			this.support_rest = true;
			this.REQUEST_TYPE.remove='delete';
			this.REQUEST_TYPE.update = 'put';
		}
};

return _mars_msv;
})());

//主要运行函数
(function(){
	$(document).ready(function(){
		Mars.initialize();
	});
})();
