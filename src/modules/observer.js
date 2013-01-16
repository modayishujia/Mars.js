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






