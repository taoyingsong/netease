"use strict"
/**
 *1.关闭顶部通知条 
 */
var initTipNotice = function() {
	var cookies = getCookies();
	var value = hex_md5('true');

	//通知条是否显示的判断
	var tipNotice = document.querySelector('.m-tip');
	
	if(cookies.NETEASE_TIP_NOTICE !== value) {
		tipNotice.style.display = 'block';
	}

	//关于关注状态的判断
	if(cookies.loginSuc) {
		document.querySelector('.m-top .left .payattention').style.display = 'none';
		document.querySelector('.m-top .left .attentioned').style.display = 'inline';
	}



	//点击隐藏
	addEvent(document.querySelector('.m-tip .right'), 'click', function() {
		tipNotice.style.display = 'none';
		var time = new Date();
		var expiresDays = 30;
		time.setTime(time.getTime() + expiresDays * 24 * 3600 * 1000);

		//cookie是由服务器设置的，所以需要部署上去,本地不行
		setCookie('NETEASE_TIP_NOTICE', value, time);
	});
}



/**
 * 2.关注“网易教育产品部”/登录
 */
var initTopAttention = function() {
	var cookies = getCookies();
	var loginForm = document.querySelector('.m-login');



	//点击关注时判断是否弹出登陆框
	addEvent(document.querySelector('.m-top .left .payattention'), 'click', function() {
		if(!cookies.loginSuc) {
			loginForm.style.display = 'block';
		}
	});



	//监听登陆框关闭动作
	addEvent(document.querySelector('.m-login .close'), 'click', function() {
		loginForm.style.display = 'none';
	});



	//验证登陆框提交的数据
	var form = document.forms.loginForm;



	addEvent(document.querySelector('.m-login .login-btn'), 'click', function() {
		var usernm = document.getElementById('username');
		var pswd = document.getElementById('password');
		if(usernm.value.length < 6 || pswd.value.length < 6) {
			usernm.style.cssText = "border: 1px solid red;";
			pswd.style.cssText = "border: 1px solid red;";
			return ;
		}
		var userName = hex_md5(usernm.value);
		var password = hex_md5(pswd.value);
		// var userName = hex_md5("studyOnline");
		// var password = hex_md5("study.163.com");
		pswd.value = password;

		//验证账号、密码
		ajax({
			url: 'http://study.163.com/webDev/login.htm',
			data: {
				userName: userName,
				password: password
			},
			type: 'GET',
			asyn: true,			
			success: function(data) {
				var MATCH_SUCCESS = '1';
				var MATCH_FAIL = '0';
				if(data === MATCH_SUCCESS) {
					usernm.style.cssText = "border: 2px solid #f1f1f1; border-width: 2px 0 0 2px";
					pswd.style.cssText = "border: 2px solid #f1f1f1; border-width: 2px 0 0 2px";
					document.querySelector('.m-login').style.display = 'none';
					setCookie('loginSuc', hex_md5(MATCH_SUCCESS), new Date(new Date().getMilliseconds() + 60 * 365 * 24 * 60 * 60 * 1000))

					//调用关注API
					ajax({
						url: 'http://study.163.com/webDev/attention.htm',
						data: null,
						type: 'GET',
						asyn: true,
						success: function(data){
							var FOLLOW_SUCCESS = '1';
							if(data === FOLLOW_SUCCESS){
								setCookie('followSuc', hex_md5(FOLLOW_SUCCESS), new Date(new Date().getMilliseconds() + 60 * 365 * 24 * 60 * 60 * 1000));
								document.querySelector('.m-top .left .payattention').style.display = 'none';
								document.querySelector('.m-top .left .attentioned').style.display = 'inline';
							}
						},
						error: function(data){
							console.log("调用关注接口API（http://study.163.com/webDev/attention.htm）发生错误！" + data);
						}
					});
				}
			},
			error: function(data){
				usernm.style.cssText = "border: 1px solid red;";
				pswd.style.cssText = "border: 1px solid red;";
				console.log("调用登录接口API（http://study.163.com/webDev/login.htm）发生错误！" + data);
			}
		});
	});
}




/**
 * 3.图片轮播
 * 思路：
 * 1、渐变动画
 * 		animation(originIndex, targetIndex);
 * 		结束条件：originIndex-Opacity = 0
 * 		5000ms 100次，originIndex的透明度0-1，targetIndex透明度渐1-0
 * 2、初始自动触发
 * 		setTimeOut(function(), );
 * 3、点击上一步触发、点击下一步触发、点击圆点触发
 * 		点击过程正在进行动画不作处理
 * 		否则触发动画
 * 3、鼠标移入移除停止和重新触发
 * 		clearTimeOut(id);
 * 4、屏幕大小适应
 * 		宽屏：图片宽高显示
 * 		窄屏：屏幕比例显示
 */
var initSlide = function() {

	//每张图片停留时间
	var autoInterval = 5000;

	//切换图片总渐变时间
	var time = 500;

	//切换图片渐变一次时间
	var interval = 100;
	var timer;
	var index = 1;
	var animated = false;
	var imgAmount = 3;
	var mSlide = document.querySelector('.m-slide');
	var list = document.querySelector('.m-slide .list');
	var imgList = list.querySelectorAll('img');
	var buttons = document.querySelectorAll('.m-slide .buttons span');
	var prev = document.getElementById('prev');
	var next = document.getElementById('next');
	


	//渐变核心函数
	function animate(originIndex, targetIndex) {
		if(originIndex == targetIndex) {
	        return;
	    }
		animated = true;

		//每次渐变变动的透明度值 
		var intervalOpacity = Number((1 / (time / interval)).toFixed(2));
		var origin = imgList[originIndex - 1];
		var target = imgList[targetIndex - 1];
		var go = function() {
			// var origin = imgList[originIndex - 1];
			// var target = imgList[targetIndex - 1];
			var originOpacity = Number(Number(getOpacity(origin)).toFixed(2));
			var targetOpacity = Number(Number(getOpacity(target)).toFixed(2));
	        if (originOpacity > 0) {
	            if(target.style.opacity === '') {
	            	chgOpacity(target, 0);
	            } 

	            //继续切换
	            chgOpacity(origin, (originOpacity - intervalOpacity));
	            chgOpacity(target, (targetOpacity + intervalOpacity));
	            setTimeout(go, interval);
	        }
	        else {
	            chgOpacity(origin, 0);
	            chgOpacity(target, 1);
	            animated = false;
	        }
		}
		go();
	}



	addEvent(next, 'click', function() {
	    if (animated) {
	        return;
	    } 
	    var originIndex;
	    var targetIndex;
	    if (index == imgAmount) {
	        originIndex = imgAmount;
	        targetIndex = 1;
	    }
	    else {
	        originIndex = index;
	        targetIndex = originIndex + 1;
	    }
	    animate(originIndex, targetIndex);
	    index = targetIndex;
	    showButton(); 
	});



	addEvent(prev, 'click', function() {
	    if (animated) {
	        return;
	    }
	    var originIndex;
	    var targetIndex;
	    if (index == 1) {
	        originIndex = 1;
	        targetIndex = imgAmount;
	    }
	    else {
	        originIndex = index;
	        targetIndex = originIndex - 1;
	    }
	    animate(originIndex, targetIndex); 
	    index = targetIndex;
	    showButton(); 
	});



	//轮播上圆点的展现
	function showButton() {
	    for (var i = 0; i < buttons.length ; i++) {
	        if(buttons[i].className == 'on'){
	            buttons[i].className = '';
	            break;
	        }
	    }
	    buttons[index - 1].className = 'on';
	}

	//轮播中的圆点添加事件
	for(var i = 0; i < buttons.length; i++) {
		addEvent(buttons[i], 'click', function(event){
			event = event || window.event;
			var target = event.target || event.srcElement;
			if(animated || target.className == 'on' ) {
				return ;
			}
	        var targetIndex = parseInt(target.getAttribute('index')); 
	        animate(index, targetIndex);
	        index = targetIndex;
	        showButton();
		});
	}



	function play() {
	   timer = setTimeout(function () {
	        next.click();
	        play();
	   }, autoInterval);
	}



	function stop() {
	    clearTimeout(timer);
	}

	//初始化
	play(); 
	mSlide.onmouseover = stop;
	mSlide.onmouseout = play;



	//尺寸随屏幕放缩
	var autoChangeSlide = function() {
		var mSlideNode = document.querySelector(".m-slide");  //轮播DIV
		var mSlideImg = mSlideNode.querySelector("img");  //轮播图片
		var screenWidth = document.body.scrollWidth;
		var imgNaturalWidth = getNaturalWidth(mSlideImg);
		if(!imgNaturalWidth) {
			imgNaturalWidth = 1652;
		}
		var imgNaturalHeight = getNaturalHeight(mSlideImg);
		if(!imgNaturalHeight) {
			imgNaturalHeight = 460;
		}
		if(screenWidth > imgNaturalWidth) {
			mSlideNode.style.width = imgNaturalWidth + "px";
			mSlideNode.style.height = imgNaturalHeight + "px";
		}
		else {
			mSlideNode.style.width = "100%";
			mSlideNode.style.height = Math.ceil(screenWidth / (imgNaturalWidth / imgNaturalHeight)) + "px";
		}
	}
	window.onresize = autoChangeSlide;
	autoChangeSlide();
}



 /**
 * 5.左侧内容区tab切换
 * 6.查看课程详情
 * 		0、监听屏幕大小，初始化数据和分页代码
 * 		2、点击页码获取数据并展示
 * 		3、点击tab重新初始化数据和分页代码
 * 		4、点击页码获取数据并展示
 */
var initCourseList = function() {
	var productDesignType = '10';
	var productLangType = '20';
	var pageNo = '1';
	var smallPageSize = '15';
	var initCosNodeWidth = 752;

	//切换tab后进行样式调整及接口调用
	var productDesignBtn = document.querySelector('.courses .product-design');
	var programLangBtn = document.querySelector('.courses .program-lang');
	var designBtnHandler1 = function() {
		productDesignBtn.style.cssText = 'background-color: #39a030; color: #fff;';
	}
	var designBtnHandler2 = function() {
		productDesignBtn.style.cssText = 'background-color: #fff; color: #000;';
	}
	var langBtnHandler1 = function() {
		programLangBtn.style.cssText = 'background-color: #39a030; color: #fff;';
	}
	var langBtnHandler2 = function() {
		programLangBtn.style.cssText = 'background-color: #fff; color: #000;';
	}



	addEvent(document.querySelector('.courses .product-design'), 'click', function() {
		productDesignBtn.style.cssText = 'background-color: #39a030; color: #fff;';
		programLangBtn.style.cssText = 'background-color: #fff; color: #000;';
		addClass(productDesignBtn, 'selected');
		removeClass(programLangBtn, 'selected');
		addEvent(programLangBtn, 'mouseover', langBtnHandler1);
		addEvent(programLangBtn, 'mouseout', langBtnHandler2);
		delEvent(productDesignBtn, 'mouseover', designBtnHandler1);
		delEvent(productDesignBtn, 'mouseout', designBtnHandler2);
		if(coursesNodeWidth > initCosNodeWidth) {
			courseSelect(productDesignType);
		}
		else {
			courseSelect(productDesignType, pageNo, smallPageSize);
		}
	});



	addEvent(document.querySelector('.courses .program-lang'), 'click', function() { 
		productDesignBtn.style.cssText = 'background-color: #fff; color: #000;';
		programLangBtn.style.cssText = 'background-color: #39a030; color: #fff;';
		addClass(programLangBtn, 'selected');
		removeClass(productDesignBtn, 'selected');
		addEvent(productDesignBtn, 'mouseover', designBtnHandler1);
		addEvent(productDesignBtn, 'mouseout', designBtnHandler2);
		delEvent(programLangBtn, 'mouseover', langBtnHandler1);
		delEvent(programLangBtn, 'mouseout', langBtnHandler2);
		courseSelect(productLangType);
		if(coursesNodeWidth > initCosNodeWidth) {
			courseSelect(productLangType);
		}
		else {
			courseSelect(productLangType, pageNo, smallPageSize);
		}
	});
	var coursesNode = document.querySelector('.courses-left-part');
	var coursesNodeWidth = coursesNode.clientWidth;

	//初始化展示数据
	addClass(productDesignBtn, 'selected');
	removeClass(programLangBtn, 'selected');
	if(coursesNodeWidth > initCosNodeWidth) {
		courseSelect(productDesignType);
	}
	else {
		courseSelect(productDesignType, pageNo, smallPageSize);
	}



	//屏幕自适应展示数据
	var autoChangeScreen = function() {
		coursesNodeWidth = coursesNode.clientWidth;
		if(coursesNodeWidth <= initCosNodeWidth) {
			if(hasClass(productDesignBtn, 'selected')) {
				courseSelect(productDesignType, pageNo, smallPageSize);
			}
			else {
				courseSelect(productLangType, pageNo, smallPageSize);	
			}
		}
		else {
			if(hasClass(productDesignBtn, 'selected')) {
				courseSelect(productDesignType);
			}
			else {
				courseSelect(productLangType);	
			}
		}
	}
	window.onresize = autoChangeScreen;
}

	/**
	 * 内容区每页数据展示接口，参数必须为字符串
	 * @param  {[type]} courseType [课程类型]
	 * @param  {[type]} pageNo     [页码]
	 * @param  {[type]} pageSize   [每页大小]
	 * @return {[type]}            [description]
	 */
	var courseSelect = function(courseType, pageNo, pageSize) {

		//获取容器
		var details = document.querySelector('.details');

		//获取展示数据类型
		// courseType = courseType + '';
		if(!courseType) {
			courseType = '10';
		}
		// pageNo = pageNo + '';
		if(!pageNo) {
			pageNo = '1';
		}
		// pageSize = pageSize + '';
		if(!pageSize) {
			pageSize = '20';
		}

		//获取展示类型数据
		ajax({
			url: 'http://study.163.com/webDev/couresByCategory.htm',
			data: {
				pageNo: pageNo,
				psize: pageSize,
				type: courseType
			},
			type: 'GET',
			asyn: false,
			success: function(data) {

				//向容器中填充数据
				var dataJSON = JSON.parse(data);
				details.innerHTML = '';

				// dataJSON.list.forEach(handler);ie8不兼容
				for(var i = 0; i < dataJSON.list.length; i++) {
						var value = dataJSON.list[i];
						handler(value);
				}



				function handler(value) {

					//创建课程节点
					var item = document.createElement('div');
					item.setAttribute('class', 'item');
					item.setAttribute('data-id', value.id);
					item.setAttribute('data-name', value.name);
					item.setAttribute('data-middle-photo-url', value.middlePhotoUrl);
					item.setAttribute('data-provider', value.provider);
					item.setAttribute('data-learner-count', value.learnerCount);
					item.setAttribute('data-price', value.price);
					item.setAttribute('data-category-name', value.categoryName);
					item.setAttribute('data-description', value.description);

					//向课程节点中填充内容
					item.innerHTML +=   '<a href="#">\
										       <div class="up">\
										 	      <img src="' + value.middlePhotoUrl
									  	        + '">\
										       </div>\
										       <div class="down">\
										           <p class="name">' + value.name
											    + '</p>\
											 	   <p class="provider">' + value.provider
											    + '</p>\
											 	   <p class="learner"><span class="learner-count">' + value.learnerCount
											    + '</span></p>\
												   <p class="price">¥ ' + value.price
											    + '</p>\
										       </div>\
										  </a>';
					var hoverDetail = document.querySelector('.courses-hover');



					//对课程节点绑定mousein事件,注意:没用innerHTML方式向容器中添加课程div，这里绑定的事件不会在下次追加时失效
					xb.addEvent(item, 'mouseenter', function() {
						var OFFSET = 9;
						var data = dataset(item);

						//上左
						var img = document.querySelector('.courses-hover img');
						img.src = data.middlePhotoUrl;

						//上右
						var name = document.querySelector('.courses-hover h2');
						name.innerText = data.name;
						var	learnerCount = document.querySelector('.courses-hover .learner-count'); 	
						learnerCount.innerText = data.learnerCount;
						var provider = document.querySelector('.courses-hover .provider');
						provider.innerText = data.provider;
						var categoryName = document.querySelector('.courses-hover .data-category-name');
						categoryName = data.categoryName;

						//下
						var description = document.querySelector('.courses-hover .description');	
						description.innerText = data.description;

						//获取元素相对dom左边和上边的距离
						var itemLeft = item.offsetLeft;
						var itemTop = item.offsetTop;

						//设置悬浮元素的位置
						hoverDetail.style.left = itemLeft - OFFSET + 'px';
						hoverDetail.style.top = itemTop - OFFSET + 'px';	
						hoverDetail.style.display = 'block';
					});



					//对课程的悬浮节点绑定mouseout事件
					xb.addEvent(hoverDetail, 'mouseleave', function() {
						hoverDetail.style.display = 'none';
					});



					details.appendChild(item);
				}
				initPager(pageNo, pageSize, dataJSON.totalPage, courseType);
			},
			error: function(data) {
				console.log("http://study.163.com/webDev/couresByCategory.htm 调用出错！" + data);	
			}
		});
		
	}

/**
 * 分页模块封装
 * @param  {[type]} pageNo     [页码]
 * @param  {[type]} pageSize   [每页展示数据量,必须为字符串]
 * @param  {[type]} pageCount  [总页数]
 * @param  {[type]} courseType [课程类型,必须为字符串]
 * @return {[type]}            [description]
 */
var initPager = function(pageNo, pageSize, pageCount, courseType) {
	pageNo = Number(pageNo);
	if(!pageNo) {
		pageNo = 1;
	}
	if(!pageSize) {
		pageSize = '20';
	}
	pageCount = Number(pageCount);
	if(!pageCount) {
		pageCount = 1;
	}
	if(!courseType) {
		courseType = '10';
	}
	var text = '';
	var pager = document.createElement('div');
	pager.className = 'pager';
	if(pageCount !== 0) {
		if(pageNo > pageCount) {
			pageNo = pageCount;
		}
		if(pageNo < 1) {
			pageNo = 1;
		}

		//上一页处理
		if(pageNo == 1) {
			// text += '<a href="javascript:void(0);" class="filpper disabled">上一页</a>';
			text += '<a href="javascript:void(0);" class="filpper disabled"></a>';
		}
		else {
			// text += '<a href="javascript:void(0);" class="filpper" data-index="' + (pageNo - 1)  + '">上一页</a>';
			text += '<a href="javascript:void(0);" class="filpper" data-index="' + (pageNo - 1)  + '"></a>';
		}

		//如果前面页数过多,显示"..."
		var start = 1;
		if(pageNo > 4) {
			start = pageNo - 1;
			text += '<a href="javascript:void(0);" class="page_no" data-index="1">1</a>';
			text += '<a href="javascript:void(0);" class="page_no" data-index="2">2</a>';
			text += '<span>&hellip;</span>';
		}

		//显示当前页附近的页
		var end = pageNo + 1;
		if(end > pageCount) {
			end = pageCount;
		}
		for(var i = start; i <= end; i++) {

			//当前页号不需要设置链接
			if(pageNo == i) {
				text += '<a href="javascript:void(0);" class="page_no current" data-index="' + i + '">' + i + '</a>';
			}
			else {
				text += '<a href="javascript:void(0);" class="page_no" data-index="' + i + '">' + i + '</a>';
			}
		}

		//如果后面页数过多,显示"..."
		if(end < pageCount -2) {
			text += '<span>&hellip;</span>';
		}
		if(end < pageCount -1) {
			text += '<a href="javascript:void(0);" class="page_no" data-index="' + (pageCount -1) + '">' + (pageCount - 1) + '</a>';
		}
		if(end < pageCount) {
			text += '<a href="javascript:void(0);" class="page_no" data-index="' + pageCount + '">' + pageCount + '</a>';
		}

		//下一页处理
		if(pageNo == pageCount) {
			// text += '<a href="javascript:void(0);" class="filpper disabled">下一页</a>';
			text += '<a href="javascript:void(0);" class="filpper next disabled"></a>';
		}
		else {
			// text += '<a href="javascript:void(0);" class="filpper" data-index="' + (pageNo + 1) + '">下一页</a>';
			// //ie8不支持last-child选择器这里用了next类名
			text += '<a href="javascript:void(0);" class="filpper next" data-index="' + (pageNo + 1) + '"></a>';
		}
	}
	pager.innerHTML = text;
	addEvent(pager, 'click', function(event) {
		event = event || window.event;
		var target = event.target || event.srcElement;
		if(target.tagName == 'A') {
			var data = dataset(target);
			if(!!data.index) {
				courseSelect(courseType, String(data.index), pageSize);
			}
		}
	});
	var mPager = document.querySelector('.m-pager');
	mPager.innerHTML = '';
	mPager.appendChild(pager);
}


/**
 *7.右侧“机构介绍”中的视频介绍 
 */
var initVideo = function() {
	var videoModule = document.querySelector('.m-video');
	var videoNode = document.querySelector('.m-video video');
	var videoCoverImg = document.querySelector('.courses .agency img');

	//鼠标事件修改视频图片透明度
	xb.addEvent(document.querySelector('.courses .mask img'), 'mouseenter', function() {
		videoCoverImg.style.cssText = "opacity: 1; filter:alpha(opacity=100);";
	});	
	xb.addEvent(document.querySelector('.courses .mask img'), 'mouseleave', function() {
		videoCoverImg.style.cssText = "opacity: .6; filter:alpha(opacity=60);";
	});

	//绑定视频窗口关闭事件
	addEvent(document.querySelector('.m-video .close'), 'click', function() {
		videoNode.pause();
		videoModule.style.display = 'none';
	});

	//绑定视频窗口打开事件
	addEvent(document.querySelector('.courses .mask img'), 'click', function(){
		videoModule.style.display = 'block';
		videoNode.currentTime = 0;
		videoNode.play();
	});
}



/**
 * 8、最热排行中数据的获取及填充
 */
var initHotRank = function() {

	//获取数据容器
	var ul = document.querySelector('.hot-container');
	ul.innerHTML = '';

	//ajax获取数据
	ajax({
		url: 'http://study.163.com/webDev/hotcouresByCategory.htm',
		data: null,
		type: 'GET',
		asyn: true,
		success: function(data) {
			var dataJSON = JSON.parse(data);

			// dataJSON.forEach(handler);ie8不兼容
			for(var i = 0; i < dataJSON.length; i++) {
				handler(dataJSON[i]);
			}
			function handler(value) {

				//创建li
				var li = document.createElement('li');
				li.className = 'clearfix';

				//创建li左边div并追加入li
				var leftDiv = document.createElement('div');
				leftDiv.className = 'img';
				var img = document.createElement('img');
				img.src = value.smallPhotoUrl;
				leftDiv.appendChild(img);
				li.appendChild(leftDiv);

				//创建li右边div并追入li
				var rightDiv = document.createElement('div');
				rightDiv.className = 'text';
				var p = document.createElement('p');
				p.innerText = value.name;
				rightDiv.appendChild(p);
				var div = document.createElement('div');
				div.innerText = value.learnerCount;
				rightDiv.appendChild(div);
				li.appendChild(rightDiv);

				//li追加如容器ul
				ul.appendChild(li);
			}
		},
		error: function(data) {
			console.log("http://study.163.com/webDev/hotcouresByCategory.htm调用出错：" + data);
		}
	});

	/**
	 * 最热排行动画
	 * @param  {[type]} ele  		 [参与动画的对象]
	 * @param  {[type]} attr 		 [参与动画的对象属性]
	 * @param  {[type]} startValue 	 [属性的起始值]
	 * @param  {[type]} targetValue  [属性的目标值]
	 * @return {[type]}     		 [description]
	 */
	var hotAnimation = function(ele, attr, startValue, targetValue) {
		var step = function() {
			var opacity = 1;
			var stemOpacity = opacity / 100;
			var fullOpacity = 0;
			var lastChild = ele.lastChild;
			lastChild.style.cssText = 'opacity: 0; filter:alpha(opacity=0);';
			ele.insertBefore(lastChild, ele.firstChild);
			var go = function() {
				fullOpacity += stemOpacity;
				if(fullOpacity < 1) {
					lastChild.style.cssText = 'opacity: ' + fullOpacity + '; filter:alpha(opacity=' + (fullOpacity * 100) + ');';
				}
				else {
					lastChild.style.cssText = 'opacity: 1; filter:alpha(opacity=100);';
					clearInterval(disInterValID);
				}
			}
			var disInterValID = setInterval(go, 5);	
		}
		var intervalID = setInterval(step, 5000);
	}
	var hotContainer = document.querySelector('.hot-container');
	hotAnimation(hotContainer, 'top', 0);
}



var initScroll = function() {

	//浏览器判断
	var Sys = {}; 
	var ua = navigator.userAgent.toLowerCase(); 
	var s; 
	(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] : 
	(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] : 
	(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] : 
	(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] : 
	(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0; 
	if(Sys.chrome) {
		var type = 'mousewheel';
		if(type === 'mousewheel' && document.mozHidden !== undefined) {
		   type = 'DOMMouseScroll';
		}
		addEvent(document.querySelector('.m-container'), type, function(event) {
			event = event || window.event;
			event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
			addEvent(window.document.body, type, function(event) {
				event.preventDefault();
			});	
		    scrollPane('m-container', 'hot-container', 'line', 100);
		});
	}



	//鼠标进入退出hot滚轮区滑动条效果
	xb.addEvent(document.querySelector('.m-container'), 'mouseenter', function() {
		document.querySelector('.line').style.display = 'block';
	});
	xb.addEvent(document.querySelector('.m-container'), 'mouseleave', function() {
		document.querySelector('.line').style.display = 'none';
		addEvent(window.document.body, type, function(event) {
			if(event && event.preventDefault) {
				window.event.returnValue = true;
			}
		});	
	});



	//滚动时执行方法
	function scrollPane(wpClassName, contClassName, barClassName, scrollSpeed) {
	    var container = document.querySelector('.' + wpClassName);
		var line = document.querySelector('.' + barClassName);
		var cont = document.querySelector('.' + contClassName);

	    var containerCStyle = computedStyle(container);
	    var contCStyle = computedStyle(cont);
	    var barCStyle = computedStyle(line);
	    var containerHeight = parseInt(containerCStyle.height.split('p')[0]);
	    var barHeight = parseInt(barCStyle.height.split('p')[0]);
	    var contHeight = parseInt(contCStyle.height.split('p')[0]) + 20;

	    var contSpeed = countContStep(containerHeight, contHeight, barHeight, scrollSpeed);
	    var LineStep = event.delta > 0 ? scrollSpeed : -scrollSpeed;
	    var contStep = event.delta > 0 ? -contSpeed : contSpeed;

	    var lineTop = parseFloat(barCStyle.top.split('p')[0]);
	    var contTop = parseFloat(contCStyle.top.split('p')[0]);

	    if (event.delta < 0) {
	        if (lineTop - LineStep >= (containerHeight - barHeight)) {
	            lineTop = (containerHeight - barHeight);
	            contTop = -(contHeight - containerHeight);
	        }
	        else {
	            lineTop = lineTop - LineStep;
	            contTop = contTop - contStep;
	        }
	    }
	    else {
	        if (lineTop - LineStep <= 0) {
	            lineTop = 0;
	            contTop = 0;
	        }
	        else {
	            lineTop = lineTop - LineStep;
	            contTop = contTop - contStep;
	        }
	    }
	    // line.style.top = lineTop + 'px'还不知道为啥不起作用
	    // cont.style.top = contTop + 'px';
	    line.style.cssText = 'top:'+ lineTop + 'px';
	    cont.style.cssText = 'top:' + contTop + 'px';
	    document.querySelector('.line').style.display = 'block';
	    function countContStep(containerHeight, contHeight, barHeight, speed) {
	        
	        //speed即为滚动条滚动一次滚动的距离,和scrollSpeed是一样的
	        return (contHeight - containerHeight) / ((containerHeight - barHeight) / speed)
	    }
	}
}