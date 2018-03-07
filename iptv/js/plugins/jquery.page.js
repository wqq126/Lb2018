//分页插件
/**
 * 2017-09-05
 * @author by zhangwei
 */
 
(function($){
	
	function Page(container,fn,args,style){
		//存参数
		var container=this.container=container||null;
		if(this.container.constructor!=jQuery){
			throw('page插件第一个参数错误，请录入jQuery对象');
		}
		this.fn=fn||function(){};
		if(typeof(this.fn)!="function"){
			throw('page插件第二个参数错误，请录入函数类型对象');
		}
		//存 args里的属性
		var args=this.args=$.extend({
			pageCount:10,//总页码,默认10
			current:1,//当前页码,默认1
			showPrev:true,//是否显示上一页按钮
			showNext:true,//是否显示下一页按钮
			showTurn:true,//是否显示跳转,默认显示
			showSumNum:true,//是否显示总页码
			showNear:2,//显示当前页码前多少页和后多少页，默认2
			pageSwap:true,//是否同意调剂,默认是。调剂会最大数量显示页码。例如当前页码之前无页码可以显示。则会增加之后的页码。
			//align:'left'//对齐方式。默认右对齐.可选：left,right
		},args||{});
		
		var width=this.width=parseInt(this.container.css('width'))||parseInt(this.container.parent().css('width'));
		var height=this.height=20;//parseInt(this.obj.css('height'));
		
		var style=this.style=$.extend({
			"fontSize":12,//字体大小
			"width":width,//页码盒子总宽度
			"height":height,//页码总高度，默认20px
			"pagesMargin":2,//每个页码或按钮之间的间隔
			"paddL":0,//左边留白
			"paddR":0,//右边留白
			"borderColor":"#428bca",//边线颜色
			"currentColor":"#ed601b",//当前页码的字体颜色
			"disableColor":"#bfbfbf",//不可点击按钮的字体颜色
			"disableBackColor":"#f2f2f2",//不可点击按钮的背景色
			"prevNextWidth":48,//上页下页的宽度
			"pagecountWidth":48,//共计多少页的宽度
			"trunWidth":110//跳转模块宽度
		},style||{});
		
		if(!style.pageWidth)style.pageWidth=(function(){
				var sumWidth=style.width-(style.prevNextWidth+2+style.pagesMargin)*(Number(args.showPrev)+Number(args.showNext))-(style.pagecountWidth+style.pagesMargin)*Number(args.showSumNum)-(style.trunWidth+style.pagesMargin)*Number(args.showTurn);
				var sumLength=args.showNear*2+5;
				return parseInt(sumWidth/sumLength)-style.pagesMargin;
			})();//每个页码的宽度。默认按最大摆放量计算	

		//设置容器样式
		this.container.css({'pading-left':style.paddL+'px','pading-right':style.paddR+'px','content':'','display':'block','clear':'both'});
		//建立自己的容器
		this.container.html('<div></div>');
		this.obj=this.container.children();
		this.obj.css({'content':'','display':'block','clear':'both','float':args.align});
		//初始化
		this.init();
	}
	
	Page.prototype.init=function(){
		this.fillHtml();
		this.bindEvent();
	}
	
	//填充DOM
	Page.prototype.fillHtml=function(){
		var args=this.args;
		var obj=this.obj;
		if(args.current>args.pageCount||args.current<1)return;
		obj.empty();
				
		//上一页
		if(args.showPrev){
			if(args.current > 1){
				obj.append('<a href="javascript:;" class="prevPage">◀</a>');
			}else{
				obj.remove('.prevPage');
				obj.append('<span class="disabled">◀</span>');
			}
		}
		//中间页码
		if(args.current != 1){
			obj.append('<a href="javascript:;" class="tcdNumber">'+1+'</a>');
		}else{
			obj.append('<span class="current">'+1+'</span>');
		}
		
		if(args.current > args.showNear+2){
			obj.append('<span class="hiding">...</span>');
		}
		
		var start = args.current>args.showNear+2?args.current-args.showNear:2,end = args.current+args.showNear>=args.pageCount?args.pageCount-1:args.current+args.showNear;
		
		if(args.pageSwap){
			var dstart=args.current-args.showNear-2;
			var dend=args.pageCount-1-args.current-args.showNear;
			if(dstart<1&&dend>1){
				end+=Math.min(dend,Math.abs(dstart-1));
			}else if(dstart>1&&dend<1){
				start-=Math.min(dstart,Math.abs(dend-1));
			}
		}
		
		for (;start <= end; start++) {
			if(start != args.current){
				obj.append('<a href="javascript:;" class="tcdNumber">'+ start +'</a>');
			}else{
				obj.append('<span class="current">'+ start +'</span>');
			}
		}
		
		if(args.current + 1 + args.showNear < args.pageCount){
			obj.append('<span class="hiding">...</span>');
		}
		
		if(args.current != args.pageCount&&args.pageCount!=1){
			obj.append('<a href="javascript:;" class="tcdNumber">'+args.pageCount+'</a>');
		}else if(args.current== args.pageCount&&args.pageCount!=1){
			obj.append('<span class="current">'+args.pageCount+'</span>');
		}
		//下一页
		if(args.showNext){
			if(args.current== args.pageCount||args.pageCount==1){
				obj.remove('.nextPage');
				obj.append('<span class="disabled">▶</span>');
			}else{
				obj.append('<a href="javascript:;" class="nextPage">▶</a>');
			}
		}
		
		if(args.showSumNum){
			obj.append('<span class="pagecount">共'+args.pageCount+'页</span>');
		}
		//跳转页码
		if(args.showTurn){
			obj.append('<span class="countYe">跳转到<input type="text" maxlength='+args.pageCount.toString().length+'>页<a href="javascript:;" class="turndown">GO</a></span>');
		}
		this.setStyle();
		this.fn&&this.fn(args.current);
	};
	//添加样式
	Page.prototype.setStyle=function(){
		var s=this.style;
		var marLR=s.pagesMargin;
		
		this.obj.children().css({'float':'left','margin-left':marLR+'px','text-align':'center'});
		
		this.obj.find('a').css({'text-decoration':'none','border':'1px solid '+s.borderColor});
	
		this.obj.find('a.prevPage').css({'border-radius': '4px','color':'#4C4C4C','width':s.prevNextWidth,'font-size':s.fontSize+'px','height':s.height+'px','line-height':s.height+'px'});
		this.obj.find('a.nextPage').css({'border-radius': '4px','color':'#4C4C4C','width':s.prevNextWidth,'font-size':s.fontSize+'px','height':s.height+'px','line-height':s.height+'px'});
	
		this.obj.find('a.turndown').css({'border-radius': '4px','color':'#6d6d6d','margin-left':'5px','display':'inline-block','width':'36px','height':'34px','line-height':'34px'});
		
		this.obj.find('span.current').css({'border-radius': '4px','font-size':'20px','display':'inline-block','height':s.height+'px','line-height':s.height+'px','color':'#ffffff','vertical-align':'middle','width':s.pageWidth-3+'px','background':'#4077bc'});
		
		this.obj.find('span.disabled').css({'border-radius': '4px','display':'inline-block','height':s.height+'px','line-height':s.height+'px','color':s.disableColor,'background':s.disableBackColor,'border':'1px solid '+s.borderColor,'vertical-align':'middle','font-size':s.fontSize+'px','width':s.prevNextWidth+'px'});
		
		this.obj.find('span.pagecount').css({'border-radius': '4px','width':s.pagecountWidth+'px','font-size':s.fontSize+'px','color':'#999','height':s.height+'px','line-height':s.height+'px'});
		
		this.obj.find('span.countYe').css({'color':'#6d6d6d','border-radius': '4px','color':'#4C4C4C','width':s.trunWidth+'px',});

		this.obj.find('input').css({'font-size':'18px','text-align':'center','border-radius': '4px','outline':'none','border':'1px solid #ddd','height':'32px','line-height':s.height-2+'px','width':'54px',margin: '0 5px'});
		
		
		this.obj.find('.tcdNumber').css({'border-radius': '4px','font-size':'20px','color':'#6d6d6d','width':s.pageWidth-3+'px','height':s.height+'px','line-height':s.height+'px'});
		this.obj.find('.hiding').css({'width':s.pageWidth+'px','height':s.height+'px'});
		
		
	};
	
	
	//绑定事件
	Page.prototype.bindEvent=function(){
		var obj=this.obj;
		var _this=this;
		
			obj.off("click");
			obj.on("click","a.tcdNumber",function(){
				_this.args.current = parseInt($(this).text());
				_this.fillHtml();
			});
			//上一页
			obj.on("click","a.prevPage",function(){
				_this.args.current = parseInt(obj.children("span.current").text())-1;
				_this.fillHtml();
			});
			//下一页
			obj.on("click","a.nextPage",function(){
				_this.args.current = parseInt(obj.children("span.current").text())+1;
				_this.fillHtml();
			});
			//跳转
			obj.on("click","a.turndown",function(){
				var page = _this.args.current = Number(obj.children("span.countYe").children('input').val());
				if(page>_this.args.pageCount){
					var txt = "页码输入有误";
					window.wxc.xcConfirm(txt, 'warning');
					return;
				}
				if(isNaN(page)){
					var txt = "页码输入有误";
					window.wxc.xcConfirm(txt, 'warning');
					return;
				}
				_this.fillHtml();
			});
		}
		
	//绑定成jQuery插件
	$.fn.createPage=function(fn,args,style){
		var _this=this;
		new Page(_this,fn,args,style);
		return this;
	}
})(jQuery);

