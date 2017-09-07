var openBillRecordManage = null;
$(function () {
    self.moveTo(0, 0);
    self.resizeTo(screen.availWidth, screen.availHeight);
    var dhxLayout, userRoleList, topMenuStr, rowResult, dhxAccord, dhxTabbar, myPop, serverDiffDate,
            tabID = "",
            tabTitle = "",
            accordID = "",
            isMenuLoad = false,
            isSystemAdmin = false,//是否是系统管理员
            organizationDataList = new rock.JsonList(),
            changePasswordForm = $("#changePasswordForm"),
            topMenuList = new rock.RockList(),
            secondMenuList = new rock.RockList(),
            menuList = new rock.RockList();
    //    authObj = {};
    //authObj.userRoleList = [];
    //authObj.userActionList = [];
    //authObj.secondMenu = {};
    //authObj.secondMenu.thirdMenu = {};
    var jsTypes = "ISystemService,ICommonService,DataTable,DataRow,DataColumn,User,Department";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        var openMenuID = null;
        generateLoginLog();
    });

    //页面初始化
    dhxLayout = new dhtmlXLayoutObject(document.body, "3T", "dhx_skyblue");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("a").setHeight(55);
    dhxLayout.cells("a").fixSize(false, true);
    dhxLayout.cells("a").attachObject("divMain");
    dhxLayout.cells("b").setCollapsedText("<img src='/resource/dhtmlx/codebase/imgs/own/1.gif' width='18px' border='0'>");
    dhxLayout.cells("b").setWidth(200);
    dhxLayout.cells("b").setText("");
    dhxLayout.cells("c").setText("");

    dhxTabbar = dhxLayout.cells("c").attachTabbar();
    dhxTabbar.setSkin("dhx_skyblue");
    dhxTabbar.enableTabCloseButton(true);

    //扩展rock对象加入userInfo信息
    //rock.userInfo = {
    //    userID: $.cookie('userID'),
    //    userName: decodeURIComponent($.cookie('userName')),
    //    userTrueName: decodeURIComponent($.cookie('userTrueName')),
    //};
    //if (rock.userInfo.userID === "" || rock.userInfo.userID === null || rock.userInfo.userID === undefined) {
    //    //此处未考虑Cookies过期时间是固定值的因素//
    //    alert("登陆已超时请重新登陆!");
    //    window.location.href = '/login.html';
    //}
    tabSelect(0);
    // 模块tab切换
    function tabSelect(id) {
        dhxTabbar.clearAll();
        createLeftMenu(id);
    }

    function createLeftMenu(menuID) {
        if (dhxAccord != null) {
            dhxAccord.unload();
            dhxAccord = null;
        }
        dhxAccord = dhxLayout.cells("b").attachAccordion();
        dhxAccord.setSkin("dhx_skyblue");
        var curSecondMenuID, openTabID, openTitle, openAccordID;
        var leftMenuStr = "";
        var strClick = "";
        //客户自助服务
        var item = dhxAccord.addItem('1', "客户自助服务");
        //提货单验证查询
        leftMenuStr += "<table cellspacing='0'cellpadding='0'width='100%'border='0'><tr><td width='5%' class='dblue'></td><td class='dblue' width='95%'height='25'align='left'valign='bottom'><img src='/resource/dhtmlx/codebase/imgs/own/menuItemChild.png'/>&nbsp;<a id='/app/view/CustomerLadeBillCheck.html' title='提货单验证查询'";
        leftMenuStr += "style='vertical-align:bottom'>提货单验证查询</a></td></tr><tr><td width='5%'></td></tr></table>";
        dhxAccord.cells('1').setIcon("/resource/dhtmlx/codebase/imgs/own/menuItemParent.png");
        item.attachHTMLString(leftMenuStr);

        //提货情况查询
        leftMenuStr += "<table cellspacing='0'cellpadding='0'width='100%'border='0'><tr><td width='5%' class='dblue'></td><td class='dblue' width='95%'height='25'align='left'valign='bottom'><img src='/resource/dhtmlx/codebase/imgs/own/menuItemChild.png'/>&nbsp;<a id='/app/view/CustomerLadeBillQuery.html' title='提货情况查询'";
        leftMenuStr += "style='vertical-align:bottom'>提货情况查询</a></td></tr><tr><td width='5%'></td></tr></table>";
        dhxAccord.cells('1').setIcon("/resource/dhtmlx/codebase/imgs/own/menuItemParent.png");
        item.attachHTMLString(leftMenuStr);

        //客户余额查询
        leftMenuStr += "<table cellspacing='0'cellpadding='0'width='100%'border='0'><tr><td width='5%' class='dblue'></td><td class='dblue' width='95%'height='25'align='left'valign='bottom'><img src='/resource/dhtmlx/codebase/imgs/own/menuItemChild.png'/>&nbsp;<a id='/app/view/CustomerBalanceQuery.html' title='客户余额查询'";
        leftMenuStr += "style='vertical-align:bottom'>客户余额查询</a></td></tr><tr><td width='5%'></td></tr></table>";
        dhxAccord.cells('1').setIcon("/resource/dhtmlx/codebase/imgs/own/menuItemParent.png");
        item.attachHTMLString(leftMenuStr);

        //客户自助订单
        leftMenuStr += "<table cellspacing='0'cellpadding='0'width='100%'border='0'><tr><td width='5%' class='dblue'></td><td class='dblue' width='95%'height='25'align='left'valign='bottom'><img src='/resource/dhtmlx/codebase/imgs/own/menuItemChild.png'/>&nbsp;<a id='/app/view/CustomerOrder.html' title='客户自助订单'";
        leftMenuStr += "style='vertical-align:bottom'>客户自助订单</a></td></tr><tr><td width='5%'></td></tr></table>";
        dhxAccord.cells('1').setIcon("/resource/dhtmlx/codebase/imgs/own/menuItemParent.png");
        item.attachHTMLString(leftMenuStr);

        //可用运输车辆
        leftMenuStr += "<table cellspacing='0'cellpadding='0'width='100%'border='0'><tr><td width='5%' class='dblue'></td><td class='dblue' width='95%'height='25'align='left'valign='bottom'><img src='/resource/dhtmlx/codebase/imgs/own/menuItemChild.png'/>&nbsp;<a id='/app/view/VehicleList.html' title='可用运输车辆'";
        leftMenuStr += "style='vertical-align:bottom'>可用运输车辆</a></td></tr><tr><td width='5%'></td></tr></table>";
        dhxAccord.cells('1').setIcon("/resource/dhtmlx/codebase/imgs/own/menuItemParent.png");
        item.attachHTMLString(leftMenuStr);

        //修改IC卡密码
        leftMenuStr += "<table cellspacing='0'cellpadding='0'width='100%'border='0'><tr><td width='5%' class='dblue'></td><td class='dblue' width='95%'height='25'align='left'valign='bottom'><img src='/resource/dhtmlx/codebase/imgs/own/menuItemChild.png'/>&nbsp;<a id='/app/view/ChangeICCardPassword.html' title='修改IC卡密码'";
        leftMenuStr += "style='vertical-align:bottom'>修改IC卡密码</a></td></tr><tr><td width='5%'></td></tr></table>";
        dhxAccord.cells('1').setIcon("/resource/dhtmlx/codebase/imgs/own/menuItemParent.png");
        item.attachHTMLString(leftMenuStr);
    }

    $(".dblue a").live("click", function () {
        addTab($(this).get(0).id, $(this).get(0).title);
    });
    $("#imgLogo").click(function () {
    });

    //生成用户名和注销按钮        
    function generateLoginLog() {
        var loginlog = "<table border='0' align=\"center\" style='font-size:12pt;color: white;height:55px;float:right'><tr><td  valign='middle' align='center'><img src='/resource/dhtmlx/codebase/imgs/own/user.png' height='14'><font style='color:white;'>" + decodeURIComponent($.cookie('userTrueName')) + "</font>&nbsp;<img id='imgPopOutUserMenu' src='/resource/dhtmlx/codebase/imgs/own/downArrow.png' style='cursor:pointer;' height='7px' width='14px'/>&nbsp;&nbsp;&nbsp;</td><td valign='middle' align='center'><img src='/resource/dhtmlx/codebase/imgs/own/logout.png' height='14px'/><a id='logout' class='gray';' style=\"color: white;font-size:12pt;cursor:pointer\">注  销</a>&nbsp;</td></tr></table>";
        $("#loginlog").html(loginlog);
        $("#imgPopOutUserMenu").on("click", function () {
            if (!myPop) {
                myPop = new dhtmlXPopup({ skin: "dhx_skyblue" });
                myPop.attachObject("divUserMenu");
            }
            if (myPop.isVisible()) {
                myPop.hide();
            } else {
                var x = window.dhx4.absLeft($(this).get(0));
                var y = window.dhx4.absTop($(this).get(0));
                var w = $(this).get(0).offsetWidth;
                var h = $(this).get(0).offsetHeight;
                myPop.show(x, y, w, h);
            }
        });
        $("#logout").on("click", function () {
            if (window.confirm("确认要退出系统吗？", "注销系统")) {
                var exp = new Date();
                exp.setTime(exp.getTime() - 1);
                document.cookie = "userID=;expires=" + exp.toGMTString();
                window.location.href = '/Login.html';
            }
        });
        //修改密码
        $("#linkChangePassword").on("click", function () {
            $("#roleName").val(rock.userInfo.userName);
            showEditForm();
            myPop.hide();
        });
    }
    //修改密码窗口拖动
    changePasswordForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                changePasswordForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    changePasswordForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideEditForm();
    function hideEditForm() {
        $("#changePasswordForm").css("display", "none");
    }
    function showEditForm() {
        $("#changePasswordForm").css("display", "block");
    }

    //确定修改密码
    $("#btnOK").click(function () {
        var user;//当前用户
        var userName = $("#roleName").val();
        var oldPassword = $("#oldPassword").val();
        var newPassword = $("#newPassword").val();
        var newPasswodAgain = $("#newPasswordAgain").val();
        if (oldPassword == '') {
            alert('原密码不能为空');
            return false;
        }
        if (newPassword.length < 6) {
            alert('新密码不能少于6位');
            return false;
        }
        if (newPasswodAgain == '') {
            alert('重复密码不能为空');
            return false;
        }
        if (newPassword != newPasswodAgain) {
            alert('两次密码输入不一致');
            return false;
        }

        ISystemService.getDynObjectByID.dynObjectID = rock.userInfo.userID;
        ISystemService.getDynObjectByID.structName = "User";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                if (e != null) {
                    user = e;
                }
                else {
                    alert("从服务器端获取的User对象为空,请检查!");
                }
            }(ISystemService.getDynObjectByID.resultValue));
        }

        if (user.password == hex_md5(oldPassword).toUpperCase()) {
            user.password = hex_md5(newPassword).toUpperCase();
            ISystemService.modifyDynObject.dynObject = user;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            alert("修改密码成功，请重新登录！");
            window.location.href = '/Login.html';
        }
        else {
            alert("原密码不正确,请检查!");
            return false;
        }
    });
    //取消
    $("#btnCancle").click(function () {
        hideEditForm();
    });
    //关闭
    $("#close").click(function () {
        hideEditForm();
    });

    function addTab(id, value) {
        if (id == "") {
            return false;
        }
        if (!dhxTabbar) {
            var valCou = value.length;
            switch (valCou) {
                case 0:
                    valCou = 50;
                    break;
                case 1:
                    valCou = 50;
                    break;
                case 2:
                    valCou = 50;
                    break;
                case 3:
                    valCou = 50;
                    break
                case 4:
                    valCou = 95;
                    break;
                case 5:
                    valCou = 105;
                    break;
                case 6:
                    valCou = 115;
                    break;
                default:
                    valCou = valCou * 19;
                    break;
            }


            dhxTabbar.addTab(id, value, valCou + "px");
            dhxTabbar.cells(id).attachURL(id);  //+ ".htm"
            dhxTabbar.tabs(id).setActive();
            //调整宽高，显示出底部和右侧边框
            var divWidth = $(".dhx_tabcontent_zone").width();
            var divHeight = $(".dhx_tabcontent_zone").height();
            $(".dhx_tabcontent_zone").css("height", divHeight - 2 + "px");
            $(".dhx_tabcontent_zone").css("width", divWidth - 2 + "px");
        }
        else {
            if (dhxTabbar.cells(id)) {
                dhxTabbar.tabs(id).setActive();
            }
            else {
                var valCou = value.length;
                switch (valCou) {
                    case 0:
                        valCou = 50;
                        break;
                    case 1:
                        valCou = 50;
                        break;
                    case 2:
                        valCou = 50;
                        break;
                    case 3:
                        valCou = 50;
                        break
                    case 4:
                        valCou = 95;
                        break;
                    case 5:
                        valCou = 105;
                        break;
                    case 6:
                        valCou = 115;
                        break;
                    default:
                        valCou = valCou * 19;
                        break;
                }
                dhxTabbar.addTab(id, value, valCou + "px");
                dhxTabbar.cells(id).attachURL(id); //+ ".htm"
                dhxTabbar.tabs(id).setActive();
                //dhxTabbar.setTabActive(id);
                //调整宽高，显示出底部和右侧边框
                var divWidth = $(".dhx_tabcontent_zone").width();
                var divHeight = $(".dhx_tabcontent_zone").height();
                $(".dhx_tabcontent_zone").css("height", divHeight - 2 + "px");
                $(".dhx_tabcontent_zone").css("width", divWidth - 2 + "px");
            }
        }
    }
    window.onbeforeunload = function () {
        //ISystemService.updateUserState.userID = $.cookie('userID');
        //ISystemService.updateUserState.state = '离线';
        //rock.AjaxRequest(ISystemService.updateUserState, rock.exceptionFun);
        //if (ISystemService.updateUserState.success) {
        //    (function (e) {
        //    }(ISystemService.updateUserState.resultValue))
        //}
    }
})

