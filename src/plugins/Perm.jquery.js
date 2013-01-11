var Perm = (function(){
	
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
		var type = Perm.REQUEST_TYPE.add;
		var url = this._get_request_url("add");
		if(this.__attr[primary]){
			//更新。
			type = Perm.REQUEST_TYPE.update;
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
				type:Perm.REQUEST_TYPE.remove,
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
			type:Perm.REQUEST_TYPE.update,
			data:attrs
		});
	},
	_get_request_id:function(){
		var data = {};
		data[this.primary] = this.__attr[this.primary];
		return data;
	},
	_get_request_url:function(method){
		if(!Perm.support_rest){
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
		if(Perm.support_rest){
			url = url['get'];
		}
		var source = {type:Perm.REQUEST_TYPE.get,url:url};
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
Base.controller = Class.create({
	
},Mars.module("observer"));

Base.service = Class.create({
	
},Mars.module("observer"));

//Base.service = Class.create({},Mars.module);
Base.view = Class.create({
	d:{},
	//[items/click/todo_handler,m/a.say/click/handler]
	_e:[],
	set:function(key,value){
		if(typeof key == 'object'){
			Mars._(key).each(function(selector,index){
				this.set(index,selector);
			},this);
		}else{
			this.d[key] = typeof value == 'string'?$(value):value;
		}
		
		return this;
	},
	get:function(key){
		return this.d[key];
	},
	initialize:function(){
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
			this.d[arr[0]][method](arr[1],Mars.proxy(this[arr[2]],this));
		}else{
			this.d[arr[0]][method](arr[1],arr[2],Mars.proxy(this[arr[2]],this));
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
var Perm = {
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
		_controller:{},
		__controller:{},
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
			'add':'post',
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
				throw 'error[can not remove observer before running Perm.destory_rule]';
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
					arr.push(notice_type+'_handler');
				}
				var method = destory?'remove_observer':'add_observer';
				event_target[method](arr[1],Mars.proxy(recive_target[arr[3]],recive_target));
			}else{
				throw 'error[run before dom ready:Perm._run_rule.]';
			}
			
			return this;
		},
		/**
		 * 函数调用指南。
		 * @param call_rule
		 *say.controller/load_data;
		 */
		_call:function(call_rule){
			var args = call_rule.split('/'),_class=this.get(args[0]),_caller = args[1];
			return _class[_caller](Array.prototype.slice.call(arguments,1));
		},
		//执行某个默认函数。
		run:function(rule){
			if(this._is_running){
				if(rule){
					this._call.apply(this,arguments);
					return;
				}else{
					Mars._(this._default).each(function(v){
						this._call.apply(this,v);
					},this);
				}
			}else{
				if(rule){
					this._default.push(arguments);
				}else{
					throw 'error[undefined rule to run Perm.run]';
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
		},
		/**
		 * 需要插件支持。默认不开放。
		 * 如果需要开放，那么需要Perm.hash_support();
		 * 如果hash_support(popstate),那么就坚挺了popstate.
		 * @returns
		 */
		hash_support:function(popstate){
			
			try{
				if(popstate){
					this._hash_support = 'popstate';
					window.addEventListener("popstate",Mars.proxy(this._hash_changed,this));
				}else{
					this._hash_support = 'hash';
					$(window).on('hashchange',Mars.proxy(this._hash_changed,this));
				}
			}catch(e){
				throw e+'[hash_support error]';
			}
		},
		_hash_changed:function(e){

			var is_match = false;
			Mars._(this.hash_rules).each(function(handler,key){
				if(key == 'default') throw 'continue';
				
				var pattern=new RegExp(key,'i'),
					result = pattern.exec(window.location.href),
					params = result.slice(1);
				if(params){
					is_match = true;
					this.hash_rules[key](params);
					throw 'break';
				}
			},this);
			
			//如果没有匹配。。那么就默认。
			if(!is_match){
				this.hash_rules['default']();
			}
		},
		//添加默认的hash规则。
		add_hash_rule:function(rule,handler){
			if(typeof rule == 'object'){
				this.add_hash_rules(rule);
				return;
			}
			
			this.hash_rules[rule] = handler;
		},
		//批量添加hash_rule
		add_hash_rules:function(rules){
			
			Mars._(rules).each(function(handler,rule){
				this.add_hash_rule(rule,handler);
			},this);
			
			return this;
		},
		/**
		 *{
		 *'\w[1-9]\?:function(params){
		 *	Perm.run('todo.controller/load_data',date,cate);
		 *},
		 *'default':function(){
		 *	window.location.hash='home';
		 *}
		 */
		_run_hash_rule:function(rule){
			var lambda = this.hash_rules[rule];
			if(lambda){
				this.hash_rules[rule]();
			}else{
				throw 'error[not defined-'+rule+'-for hash]';
			}
		}
};

return Perm;
})();

//主要运行函数
(function(){
	$(document).ready(function(){
		Perm.initialize();
	});
})();