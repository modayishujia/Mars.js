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
