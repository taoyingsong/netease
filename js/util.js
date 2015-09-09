/**************************************原型扩展*********************************/
/*
实现浏览器兼容版的element.dataset
*/
function dataset(element) {

    //判断当前浏览器是否原生支持dataset属性
    if (element.dataset) {
        return element.dataset;
    }

    //data-*自定义属性以“-”拆分后得到的数组
    //返回的属性对象
    //得到的新的属性名
    var arr = [],
        result = {},
        attrName;

    //获取element元素的所有属性集合
    var attr = element.attributes;
    for (var i = 0; i < attr.length; i++) {

        //获取data-*的自定义属性                  
        if (attr[i].name.slice(0, 5) == "data-") {

            //data-*自定义属性以“-”拆分后得到的数组
            arr = attr[i].name.split("-");

            //从第二个单词开始
            for (var j = 1; j < arr.length; j++) {
                if (j > 1) {

                    //第二个单词开始首字母大写
                    attrName += arr[j].slice(0, 1).toUpperCase() + arr[j].slice(1);
                } else {

                    //第一个单词还是保持小写
                    attrName = arr[j];
                }
            }

            //将属性名和值存入返回对象中                 }
            result[attrName] = attr[i].value;
        }
    }
    return result;
}


/**
 * innerText原型方法扩展
 */
(function(){
  if (!('innerText' in document.body)) {
    HTMLElement.prototype._defineGetter_("innerText", function() {
        return this.textContent;
    });
    HTMLElement.prototype._defineSetter_("innerText", function(s) {
        return this.textContent = s;
    });
}
})();


/*************************************** Cookie 操作 ***************************************/
/**
 * 获取本机所有cookie
 * @return {Object} cookie键值对集合
 */
function getCookies() {
    var cookie = {};
    var all = document.cookie;
    if (all === '') return cookie;
    var list = all.split('; ');
    for (var i = 0, len = list.length; i < len; i++) {
      var item = list[i];
      var p = item.indexOf('=');
      var name = item.substring(0, p);
      name = decodeURIComponent(name);
      var value = item.substring(p + 1);
      value = decodeURIComponent(value);
      cookie[name] = value;
    }
    return cookie;
}  

/**
 * 设置cookie
 * @param {String} name    cookie键
 * @param {String} value   cookie值
 * @param {timestamp} expires 失效时间（可选）
 * @param {String} path    作用路径（可选）
 * @param {String} domain  作用域（可选）
 * @param {boolean} secure  使用https时设置为true（可选）
 */
function setCookie(name, value, expires, path, domain, secure) {
  var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
  if (expires)
    cookie += '; expires=' + expires.toGMTString();
  if (path)
    cookie += '; path=' + path;
  if (domain)
    cookie += '; domain=' + domain;
  if (secure)
    cookie += '; secure=' + secure;
  document.cookie = cookie;
}

/**
 * 移除cookie
 * @param  {String} name   cookie键
 * @param  {String} path   cookie值
 */
// function removeCookie(name) {
//   document.cookie = 'name=' + name + '; max-age=0';
// }

/**
 * 移除cookie
 * @param  {String} name   cookie键
 * @param  {String} path   cookie值
 * @param  {String} domain 作用域 
 */
function removeCookie(name, path, domain) {
  document.cookie = 'name=' + name + '; path=' + path + '; domain=' + domain + '; max-age=0';
}
/*************************************** /Cookie 操作 ***************************************/


/*************************************** AJAX 操作 ***************************************/
//创建XMLHttpRequest对象
function createXMLHttpRequest()
{
    var xmlHttpReq;
    if(window.XMLHttpRequest)
    {
        // DOM 2浏览器
        xmlHttpReq = new XMLHttpRequest();
    }
    else if (window.ActiveXObject)
    {
        // IE浏览器
        var versions = [ "MSXML2.XMLHttp.5.0",  "MSXML2.XMLHttp.4.0","MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp","Microsoft.XMLHttp"]; 
　　　　for(var i = 0; i < versions.length; i ) { 
            try{ 
          　    xmlHttpReq = new ActiveXObject(versions[i]); 
                return oXmlHttp; 
          　} catch (oError) { 
          　　　console.log("Can not create XMLHttp Object.");
          　} 
        }
　　} 
　　return xmlHttpReq;
}  

/**
 * 将对象转为参数字符串
 * @param  {Object} data 参数对象
 * @return {String}      参数字符串
 */
function serialize(data) {
  if (!data) return '';
  var pairs = [];
  for (var name in data) {
    if (!data.hasOwnProperty(name)) continue;
    if (typeof data[name] === 'function') continue;
    var value = data[name].toString();
    name = encodeURIComponent(name);
    value = encodeURIComponent(value);
    pairs.push(name + '=' + value);
  }
  return pairs.join('&');
}

/**
 * Ajax封装请求
 * @param  {Object} param 参数对象，支持type,url,data,asyn,success,error
 * @return {[type]}       [description]
 */
function ajax(param){
    var type = param.type;
    var url = param.url;
    var data = param.data;
    var asyn = param.asyn;
    var sucHandler = param.success;
    var errHandler = param.error;
  
    if(type === "GET" && data != null && data != "undefined"){
       url = url + "?" + serialize(data);
    }

    var xmlHttpReq = createXMLHttpRequest();
    xmlHttpReq.open(type, url, asyn);
    xmlHttpReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttpReq.onreadystatechange = function processResponse(){
        if(xmlHttpReq.readyState == 4){
            if(xmlHttpReq.status == 200){
                sucHandler(xmlHttpReq.responseText);
            }else{
                errHandler(xmlHttpReq.responseText);
            }
        }
    };  

    if(type.toUpperCase() === "GET"){
        xmlHttpReq.send();
    }else if(type.toUpperCase() === "POST"){
        xmlHttpReq.send(serialize(data));
    }
}
/*************************************** /AJAX 操作 ***************************************/

/************************** 获取元素原始大小 **************************/
/**
 * 获取图片的原始宽度（兼容IE6/7）
 * @param  {[type]} element 元素对象
 * @return {[type]}            
 */
function getNaturalWidth(element) {
    if(element.naturalWidth){
      return element.naturalWidth;
    }else{
      var img = new Image();
      img.src = element.src;
      return img.width;
    }
}

/**
 * 获取图片的原始高度（兼容IE6/7）
 * @param  {[type]} element 元素对象
 * @return {[type]}            
 */
function getNaturalHeight(element){
    if(element.naturalHeight){
      return element.naturalHeight;
    }else{
      var img = new Image();
      img.src = element.src;
      return img.height;
    }
}
/************************** /获取元素原始大小 **************************/

/****** 事件绑定函数兼容 *******/
/* 
 * 兼容addEventListener方法
 */
var addEvent = document.addEventListener ? 
    function(elem, type, listener, useCapture){
        elem.addEventListener(type, listener, useCapture);
    } :
    function(elem, type, listener, useCapture){
        elem.attachEvent('on' + type, listener);
    };
/**
 * 兼容removeEventListener方法
 */
var delEvent = document.removeEventListener ? 
    function(elem, type, listener, useCapture){
        elem.removeEventListener(type, listener, useCapture);
    } :
    function(elem, type, listener, useCapture){
        elem.detachEvent('on' + type, listener);
   };
/**
 * 兼容dispatchEvent方法
 */
var triggerEvent = function(element, eventType){
    var evtObj;
    if(document.dispatchEvent){
        evtObj = document.createEvent("Event");
        evtObj.initEvent(eventType, true, true);
        element.dispatchEvent(evtObj);
    }else if(document.createEventObject){
        element.fireEvent("on" + eventType);
    }
};
/****** /事件绑定函数兼容 *******/


/****** dataset兼容 *******/
var getDataset = function(element){
    if(element.dataset){
        return element.dataset;
    }else{ 
        var id = element.getAttribute("data-id");
        var name = element.getAttribute("data-name");
        var learnercount = element.getAttribute("data-learnercount");
        var provider = element.getAttribute("data-provider");
        var categoryname = element.getAttribute("data-categoryname");
        var description = element.getAttribute("data-description");
        var middlephotourl = element.getAttribute("data-middlephotourl");
        return {id:id, name:name, learnercount:learnercount, provider:provider, categoryname:categoryname, description:description, middlephotourl:middlephotourl};
    }
};
/****** /dataset兼容（不具有普适性） *******/

/**
 * 设置元素透明度（兼容IE6-8）
 * @param  {[type]} element [description]
 * @param  {[type]} value   [description]
 * @return {[type]}         [description]
 */
var isIE8Browse = navigator.userAgent.toUpperCase().indexOf("IE 8.0") > 0; //是否是IE8浏览器
var chgOpacity = function(element, value){
    if(isIE8Browse){
      // element.style.filter = "Alpha(opacity=" + value*100 + ")";
      element.style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + value*100 + ")";
    }else{
      element.style.opacity = value;
    }
}
/**
 * 获取元素透明度（兼容IE6-8）
 * @param  {[type]} element [description]
 * @return {[type]}         [description]
 */
var getOpacity = function(element){
    if(isIE8Browse){
      var filterAttr = element.style.filter;
      if(filterAttr === ""){
        return 0;
      }
      var opacity = filterAttr.substring(filterAttr.indexOf("=") + 1, filterAttr.lastIndexOf(")"));
      return parseFloat(opacity) / 100;
    }else{
      return element.style.opacity;
    }
}


function hasClass( elements,cName ){  
    return !!elements.className.match( new RegExp( "(\\s|^)" + cName + "(\\s|$)") ); 
};  
function addClass( elements,cName ){  
    if( !hasClass( elements,cName ) ){  
        elements.className += " " + cName;  
    };  
};  
function removeClass( elements,cName ){  
    if( hasClass( elements,cName ) ){  
        elements.className = elements.className.replace( new RegExp( "(\\s|^)" + cName + "(\\s|$)" ), " " );
    };  
};



function computedStyle(element) {
    return window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
}