TestCase("test_class",{
	setUp:function(){
		//class1
		var Person = Class.create({
			initialize:function(name,age){
				this.name = name;
				this.age = age;
			},
			say:function(message){
				return this.name;
			},
		});
		this.Person = Person;
		//class2
		var Man = Class.create({
			initialize:function(name,age,sexy){
				this._super(name,age);
				this.sexy = sexy;
			},
			say:function(){
				return this.sexy+this._super();
			}
		},Person);
		this.Man = Man;
		//基础创建
		this.wd = new Man('wangdong',12,'male');
	},
	tearDown:function(){
		
	},
	'test_class_create':function(){
		assertFunction(this.Person);
	},
	'test_class_inherit':function(){
		assertFunction(this.Man);
	},
	'test_subclass_instance':function(){
		assertInstanceOf(this.Man,this.wd);
	},
	'test_super_instance':function(){
		assertInstanceOf(this.Person,this.wd);
	},
	'test_instance':function(){
		assertInstanceOf(this.Man,this.wd);
	},
	'test_super_initialize':function(){
		assertEquals('wangdong',this.wd.name);
	},
	'test_super_super_exec':function(){
		assertEquals('male',this.wd.sexy);
	},
	'test_super_fn':function(){
		assertEquals("malewangdong",this.wd.say());
	},
	'test_sub_super_property':function(){
		assertEquals(this.wd.name,'wangdong');
	}
});