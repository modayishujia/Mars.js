TestCase("test_module_enumberable",{
	setUp:function(){
		
	},
	tearDown:function(){
		
	},
	'test_mars.each_array':function(){
		var a = '';
		Mars._([1,2,3]).each(function(item,index){
			a+=item*2;
		});
		assertEquals('246',a);
	},
	'test_mars.each_object':function(){
		var a = '';
		Mars._({a:1,b:2,c:3}).each(function(item,key){
			a+=key;
		});
		assertEquals('abc',a);
	},
	'test_mars.collect_array':function(){
		
		var a = Mars._([1,2,3]).collect(function(item,index){
			return item*2;
		});
		assertEquals([2,4,6],a);
	},
	'test_mars.each.array':function(){
		var E = {
			sum:0,
			say:function(item,index){
				this.sum+=item;
			}	
		};
		Mars.each([1,2,3],E.say,E);
		assertEquals(E.sum,6);
	},
	'test_mars.each.object':function(){
		var E = {
			sum:'',
			say:function(item,key){
				this.sum+=key;
			}	
		};
		Mars.each({a:1,b:2,c:3},E.say,E);
		assertEquals(E.sum,'abc');
	}
});