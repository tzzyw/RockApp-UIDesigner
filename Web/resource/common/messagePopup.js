/**//*
*    消息构造
*/
function CLASS_MSN_MESSAGE(id, width, height, caption, title, message,action) {
    this.id = id;
    this.title = title;
    this.caption = caption;
    this.message = message;   
    this.action = action;
    this.width = width ? width : 200;
    this.height = height ? height : 120;
    this.timeout = 600;
    this.speed = 20;
    this.step = 1;
    this.right = screen.width - 1;
    this.bottom = screen.height;
    this.left = this.right - this.width;
    this.top = this.bottom - this.height;
    this.timer = 0;
    this.pause = false;
    this.close = false;
    this.autoHide = false;    
}

/**//*
*    隐藏消息方法
*/
CLASS_MSN_MESSAGE.prototype.hide = function () {
    if (this.onunload()) {

        var offset = this.height > this.bottom - this.top ? this.height : this.bottom - this.top;
        var me = this;

        if (this.timer > 0) {
            window.clearInterval(me.timer);
        }

        var fun = function () {
            if (me.pause == false || me.close) {
                var x = me.left;
                var y = 0;
                var width = me.width;
                var height = 0;
                if (me.offset > 0) {
                    height = me.offset;
                }

                y = me.bottom - height;

                if (y >= me.bottom) {
                    window.clearInterval(me.timer);
                    me.Pop.style.display = "none";
                } else {
                    me.offset = me.offset - me.step;
                }
                me.Pop.style.left = x + "px";
                me.Pop.style.top = y + "px";
                // me.Pop.show(x,y,width,height);
            }
        }

        this.timer = window.setInterval(fun, this.speed)
    }
}

/**//*
*    消息卸载事件，可以重写
*/
CLASS_MSN_MESSAGE.prototype.onunload = function () {
    return true;
}
/**//*
*    消息命令事件，要实现自己的连接，请重写它
*
*/
CLASS_MSN_MESSAGE.prototype.oncommand = function () {
    //this.close = true;
    //addtab('/app/view/MotorForRepair.html', "待修电机提醒列表");
    this.action('/app/view/MotorForRepair.html', "待修电机提醒列表");
    this.hide();
    //window.open("http://www.jz21.net");

}
/**//*
*    消息显示方法
*/
CLASS_MSN_MESSAGE.prototype.show = function () {

    var oPopup = document.createElement("div");
    oPopup.setAttribute("id", "messagePop");
    this.Pop = document.body.appendChild(oPopup);

    var w = this.width;
    var h = this.height;

    var str = '<table style="border-top: #ffffff 1px solid; border-right: #ffffff 1px solid; width: 100%; background-color: #cfdef4" cellspacing="0" cellpadding="0" border="0">';
    str += '<tr>';
    str += '<td style="font-size: 12px;color: #0f2c8c;width:30px;height:24px"></td>';
    str += '<td style="padding-left: 4px; font-weight: normal; font-size: 12px; color: #1f336b; padding-top: 4px;vertical-align:central;width:100%">' + this.caption + '</td>';
    str += '<td style="padding-right: 2px; padding-top: 2px; vertical-align: central;text-align:right; width:19px">';
    str += '<span title="关闭" style="font-weight: bold; font-size: 12px; cursor:pointer ; color: red; margin-right: 4px" id="btSysClose">×</span>';
    str += '</td>';
    str += '</tr>';
    str += '<tr>';
    str += '<td style="padding-right: 1px;padding-bottom: 1px;height:' + (h - 28) + 'px; vertical-align:top" colspan="3">';
    str += '<div style="border-top: #728eb8 1px solid; font-size: 12px; width: 100%; color: #ff0000;">' + this.title + '</div>';
    str += '<div style="word-break: break-all;text-align:left"><a href="#" id="btCommand"><font color=#1f336b>' + this.message + '</font></a></div>';
    str += '</td>';
    str += '</tr>';
    str += '</table>';

    oPopup.innerHTML = str;
    this.offset = 0;
    var me = this;

    var fun = function () {
        var x = me.left;
        var y = 0;
        var width = me.width;
        var height = me.height;

        if (me.offset > me.height) {
            height = me.height;
        } else {
            height = me.offset;
        }
        y = me.bottom - me.offset;
        if (y <= me.top) {
            me.timeout--;
            if (me.timeout == 0) {
                window.clearInterval(me.timer);
                if (me.autoHide) {
                    me.hide();
                }
            }
        } else {
            me.offset = me.offset + me.step;
        }
        $("#messagePop").css("position", "absolute");
        //me.Pop.style.position = "absolute"
        $("#messagePop").css("left", me.left + "px");
        $("#messagePop").css("top", me.top + "px");
        $("#messagePop").css("visibility", "visible");
        //me.Pop.style.left = me.left + "px";
        //me.Pop.style.top = me.top + "px";
        //me.Pop.style.visibility = 'visible';
        // me.Pop.show(x,y,width,height);

    }

    this.timer = window.setInterval(fun, this.speed);

    var btClose = document.getElementById("btSysClose");

    btClose.onclick = function () {
        me.close = true;
        me.hide();
    }

    var btCommand = document.getElementById("btCommand");
    btCommand.onclick = function () {
        me.oncommand();
    }
    // var ommand = oPopup.document.getElementById("ommand");
    //  ommand.onclick = function(){
    //   //this.close = true;
    //me.hide();
    //window.open(ommand.href);
    //}
}
/**//*
** 设置速度方法
**/
CLASS_MSN_MESSAGE.prototype.speed = function (s) {
    var t = 20;
    try {
        t = praseInt(s);
    } catch (e) { }
    this.speed = t;
}
/**//*
** 设置步长方法
**/
CLASS_MSN_MESSAGE.prototype.step = function (s) {
    var t = 1;
    try {
        t = praseInt(s);
    } catch (e) { }
    this.step = t;
}

CLASS_MSN_MESSAGE.prototype.rect = function (left, right, top, bottom) {
    try {
        this.left = left != null ? left : this.right - this.width;
        this.right = right != null ? right : this.left + this.width;
        this.bottom = bottom != null ? (bottom > document.documentElement.clientHeight ? document.documentElement.clientHeight : bottom) : document.documentElement.clientHeight;
        this.top = top != null ? top : this.bottom - this.height;
    } catch (e) { }
}

//调用入口
function ShowMessage(messageBody,addtab) {

    var MSG1 = new CLASS_MSN_MESSAGE("Msg", 250, 100, "消息提示：", "当前存在30日内需要检修的电机", messageBody, addtab);
    MSG1.rect(null, null, null, screen.height);
    //MSG1.speed = 10;
    //MSG1.step = 2;
    MSG1.show();
}