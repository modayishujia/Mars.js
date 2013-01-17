(function(){
	/**
	 * 数据列表
	 * $("#data-list").DataList({
	 * 	'data':data,
	 * 	 initializer:function(item,data){}
	 * });
	 * 
	 * 
	 * 
	 * 
	 */
	var _property = {
			initialize:function(args){
				if(this.data('data-list')){
					return this;
				}
				//标记已经初始化过
				this.data('data-list',1);
				
				for(var key in args){
					this[key] = args[key];
				}
				
//				缓存位置
				this._cache_holder = $("<div></div>");
				if(!this.tpl){
					var node = this.children().first();
					this.tpl = node.clone();
					node.remove();
				}
				if(typeof this.tpl == 'string'){
					this.tpl = $(this.tpl);
				}
				this.items = [];
				this.all_items = [];
				
				return this;
			},
			initializer:function(item,data){
				var _html = item.html();
				for(var key in data){
					_html = _html.replace(new RegExp('\{'+key+'\}','g'),data[key]);
				}
				item.html(_html);
			},
			set_initializer:function(handler){
				this.initializer = handler;
				
				return this;
			},
			set_data:function(data){
				this._cache_holder.html('');
				var offset = this.all_items.length - data.length;
//				console.log(offset);
				while(offset>0){
					this._remove_item($(this.all_items[this.all_items.length-offset]));
					offset--;
				}
				
				for ( var i = 0; i < data.length; i++) {
					var item = $(this.all_items[i]);
					if(typeof item == 'undefined' || item.length==0){
						item = this._add_item();
					}
					
					item.removeAttr("status");
					
					this.initializer(item,data[i]);
				}
				this.html(this.html()+this._cache_holder.html());
				this._reset_items();
				
				return this;
			},
			_reset_items:function(){
				this.all_items = this.children();
				this.items = this.all_items.filter("[status!=remove]");
				return this;
			},
//			隐藏某个渲染器
			_remove_item:function(item){
				item.hide().attr("status",'remove');
//				console.log(item);
				return item;
			},
//			添加节点
			_add_item:function(){
				var node = this.tpl.clone();
				node.appendTo(this._cache_holder);
				return node;
			},
			destory:function(){
				this.removeData("data-list");
			}
	};
	
	$.fn.Datalist = function(args){
		for(var key in _property){
			this[key] = _property[key];
		}
		this.initialize(args);
		return this;
	};
})();