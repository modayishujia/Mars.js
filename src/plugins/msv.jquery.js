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
	//[items/click/todo_handler,m/a.say/click/handler]
	/**
	 * 自动set,get
	 */
	_:function(key,value){
		if(typeof value == 'undefined' && typeof key == 'string'){
			return this[key];
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
	set:function(key,value){
		if(typeof value == 'string'){
			value = $(value);
		}
		if(typeof this[key] !='undefined'){
			throw 'already defined key in '+this.__class_name;
		}
		this[key] = value;
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
			property.__class_name = name;
			
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