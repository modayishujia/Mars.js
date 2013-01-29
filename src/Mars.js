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