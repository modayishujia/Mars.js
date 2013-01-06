TestCase("test_module_observer",{
	setUp:function(){
		var Man = Class.create({
			initialize:function(){
				this.message ='';
				this.say_count = 0;
			},
			say:function(){
				this.notify('say',this.say_count++,true);
			},
			note:function(message){
				this.message = message;
			}
		},Mars.module("observer"));
		
		var Woman = Class.create({
			initialize:function(){
				this._notify_sync = true;
			},
			say:function(){
				this.notify('say',"woman");
			},
			note:function(message){
				this.message = message;
			}
		},Mars.module("observer"));
		
		this.man = new Man();
		this.woman = new Woman();
		
		this.woman.add_observer('say',Mars.proxy(this.man.note,this.man));
		this.woman.say();
	},
	tearDown:function(){
	},
	'test_notify':function(){
		assertEquals('woman',this.man.message);
	},
	'test_remove_observer':function(){
		this.man.add_observer('say',Mars.proxy(this.woman.note,this.woman));
		this.man.say();
		this.man.say();
		this.man.say();
		this.man.remove_observer('say',Mars.proxy(this.woman.note,this.woman));
		this.man.say();
		assertEquals(2,this.woman.message);
	}
});