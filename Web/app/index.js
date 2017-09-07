var openBillRecordManage = null;
//var test = null;
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
            menuList = new rock.RockList(),
        authObj = {};
    authObj.userRoleList = [];
    authObj.userActionList = [];
    authObj.secondMenu = {};
    authObj.secondMenu.thirdMenu = {};
    var jsTypes = "ISystemService,ICommonService,DataTable,DataRow,DataColumn,User,Department";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //获取用户所属部门集合
        ICommonService.getUserDepartments.userID = 1;
        rock.AjaxRequest(ICommonService.getUserDepartments, rock.exceptionFun);
        if (ICommonService.getUserDepartments.success) {
            (function (e) {
                var ss = e;

            }(ICommonService.getUserDepartments.resultValue));
        }

        //获取用户未读消息
        ICommonService.getUserMessage.userID = 1;
        rock.AjaxRequest(ICommonService.getUserMessage, rock.exceptionFun);
        if (ICommonService.getUserMessage.success) {
            (function (e) {
                var ss = e;

            }(ICommonService.getUserMessage.resultValue));
        }

        var openMenuID = null;
        //获取用户所在角色集合
        ISystemService.getUserRoles.userID = rock.userInfo.userID;
        ISystemService.getUserRoles.success = false;
        rock.AjaxRequest(ISystemService.getUserRoles, rock.exceptionFun);
        if (ISystemService.getUserRoles.success) {
            (function (e) {
                var rows = e.rows;
                for (var i = 0, length = rows.length; i < length; i++) {
                    rowResult = rows[i].values;
                    authObj.userRoleList.push(rowResult[0].value);
                }
            }(ISystemService.getUserRoles.resultValue));
        }
        else {
            alert("获取用户所在角色集合出错,请检查!");
            return;
        }

        //获取用户角色所有功能集合
        for (var i = 0; i < authObj.userRoleList.length; i++) {
            //获取用户所在角色ActionID列表
            ISystemService.getUserRoleActions.roleID = authObj.userRoleList[i];
            ISystemService.getUserRoleActions.success = false;
            rock.AjaxRequest(ISystemService.getUserRoleActions, rock.exceptionFun);
            if (ISystemService.getUserRoleActions.success) {
                (function (e) {
                    var rows = e.rows;
                    for (var i = 0, length = rows.length; i < length; i++) {
                        rowResult = rows[i].values;
                        authObj.userActionList.push(rowResult[0].value);
                    }
                }(ISystemService.getUserRoleActions.resultValue));
            }
            else {
                alert("获取用户所有功能集合出错,请检查!");
                return;
            }
        }
        generateLoginLog();

        //获取所有菜单集合
        rock.AjaxRequest(ISystemService.getMenus, rock.exceptionFun);
        if (ISystemService.getMenus.success) {
            (function (e) {
                var rows = e.rows;
                for (var i = 0, length = rows.length; i < length; i++) {
                    var rowResult = rows[i].values;
                    var menuObj = {};
                    if (rowResult[0].value == 2 || rowResult[5].value == 2 || rowResult[5].value == 3 || rowResult[5].value == 4) {
                        menuObj.menuID = rowResult[0].value;
                        menuObj.menuName = rowResult[1].value;
                        menuObj.commandText = rowResult[2].value;
                        menuObj.actionID = rowResult[3].value;
                        menuObj.displayOrder = rowResult[4].value;
                        menuObj.parentID = rowResult[5].value;
                        menuList.add(menuObj);
                    }
                }
            }(ISystemService.getMenus.resultValue));
        }
        else {
            alert("获取所有菜单集合出错,请关闭浏览器,重新打开程序!");
            return;
        }

        //获取一级菜单列表
        for (var i = 0; i < menuList.length; i++) {
            if (menuList.item(i).parentID == "") {
                topMenuList.add(menuList.item(i));
            }
        }

        //生成一级菜单
        topMenuStr = "<ul style=\"height: 22px;margin-top:15px\">";
        for (var i = 0; i < topMenuList.length; i++) {
            topMenuStr += "<li id='" + menuList.item(i).menuID + "' class='mode' style='width:75px'>" + menuList.item(i).menuName + "</li>";
            //定义一级菜单ID的数组 
            var menuID = menuList.item(i).menuID;
            authObj.secondMenu[menuID] = [];
            //加载二级菜单
            for (var j = 0; j < menuList.length; j++) {
                if (menuList.item(j).parentID == menuID) {
                    authObj.secondMenu[menuID].push({ MenuID: menuList.item(j).menuID, MenuName: menuList.item(j).menuName });
                    secondMenuList.add(menuList.item(j));
                }
            }
            //加载三级菜单
            for (var k = 0; k < secondMenuList.length; k++) {
                authObj.secondMenu.thirdMenu[secondMenuList.item(k).menuID] = [];
                for (var j = 0; j < menuList.length; j++) {
                    if (menuList.item(j).parentID == secondMenuList.item(k).menuID) {
                        authObj.secondMenu.thirdMenu[secondMenuList.item(k).menuID].push({ MenuID: menuList.item(j).menuID, MenuName: menuList.item(j).menuName, CommandText: menuList.item(j).commandText, ActionID: menuList.item(j).actionID });
                    }
                }
            }

            if (i == 0) {
                openMenuID = menuID;
            }
        }

        topMenuStr += "</ul>";
        $("#topmenu").html(topMenuStr);

        $("#topmenu ul li").hover(function () {
            if ($(this).css("color") == "rgb(255, 255, 255)") {
                $(this).css({ "color": "#BCDBF8", "cursor": "pointer" });
            }
        }, function () {
            if ($(this).attr("current") != "current") {
                $(this).css({ "color": "", "color": "#ffffff" });
            }
        })

        $("#topmenu ul li").live("click", function () {
            $("#topmenu ul li").css("color", "#ffffff");
            $("#topmenu ul li").attr("current", "");

            $(this).css("color", "#BCDBF8");
            $(this).attr("current", "current");

            tabSelect($(this).get(0).id);
        });

        $("#topmenu ul li:first").css("color", "#BCDBF8");
        $("#topmenu ul li:first").attr("current", "current");
        tabSelect(openMenuID);


        ////判断是否有到期的检修电机
        ////获取服务器当前日期+30天
        //ISystemService.getDiffDateString.dateDiff = 30;
        //rock.AjaxRequest(ISystemService.getDiffDateString, rock.exceptionFun);
        //if (ISystemService.getDiffDateString.success) {
        //    (function (e) {
        //        serverDiffDate = e.value;
        //    }(ISystemService.getDiffDateString.resultValue));
        //}
        //ISystemService.executeScalar.sqlString = "select count(*) from [Motor] where [NextDate] < '" + serverDiffDate + "'";
        //rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        //var warehouseName = null;
        //if (ISystemService.executeScalar.success) {
        //    (function (e) {
        //        var count = e.value;
        //        if (parseInt(count, 10) > 0) {
        //            var result = confirm('当前存在30日内需要检修的电机是否查看！');
        //            if (result) {
        //                addTab('/app/view/MotorForRepair.html', "待修电机提醒列表");
        //            }
        //        }
        //    }(ISystemService.executeScalar.resultValue));
        //}
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

    //tab页被选择时强制刷新页面(暂时关闭)
    //dhxTabbar.attachEvent("onSelect", function (id, last_id) {
    //    //any custom code
    //    //if (id == "/app/view/MotorMaintenanceRecordList.html" || id == "/app/view/ResetWorkflow.html" || id == "/app/view/ReceiveMaintenance.html" || id == "/app/view/MaintenanceOutsourcing.html" || id == "/app/view/CompleteMotorMaintenanceRecord.html" || id == "/app/view/UploadAttachment.html" || id == "/app/view/InspectorConfirm.html" || id == "/app/view/ConfirmQualified.html" || id == "/app/view/ExamineMotorMaintenanceRecord.html" || id == "/app/view/CompleteMotorMaintenanceRecordFX.html") {
    //    //    dhxTabbar.cells(id).reloadURL();
    //    //} 
    //    if (test) {
    //        test();
    //    }
    //    return true;
    //});

    //扩展rock对象加入userInfo信息
    rock.userInfo = {
        userID: $.cookie('userID'),
        userName: decodeURIComponent($.cookie('userName')),
        userTrueName: decodeURIComponent($.cookie('userTrueName')),
    };
    if (rock.userInfo.userID === "" || rock.userInfo.userID === null || rock.userInfo.userID === undefined) {
        //此处未考虑Cookies过期时间是固定值的因素//
        alert("登陆已超时请重新登陆!");
        window.location.href = '/login.html';
    }

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
        tabID = "";
        for (var i = 0, length = authObj.secondMenu[menuID].length; i < length; i++) {
            var leftMenuStr = "";
            curSecondMenuID = authObj.secondMenu[menuID][i].MenuID;
            for (var j = 0, count = authObj.secondMenu.thirdMenu[curSecondMenuID].length; j < count; j++) {
                var thridMenu = authObj.secondMenu.thirdMenu[curSecondMenuID][j];
                var strClick = "";
                if (rock.userInfo.userName == "admin") {
                    strClick = " href='#' class='gray'";
                    tabID = "/app/view/" + thridMenu.CommandText;
                    tabTitle = thridMenu.MenuName;
                    accordID = curSecondMenuID;
                }
                else {
                    //判断用户是否具有菜单所具有的功能ID的权限
                    for (var k = 0; k < authObj.userActionList.length; k++) {
                        if (authObj.userActionList[k] == thridMenu.ActionID) {
                            strClick = " href='#' class='gray'";
                            if (tabID == "") {
                                tabID = "/app/view/" + thridMenu.CommandText;
                                tabTitle = thridMenu.MenuName;
                                accordID = curSecondMenuID;
                            }
                            break;
                        }
                    }
                }
                if ((i == 0) && (j == 0)) {
                    openTabID = tabID;
                    openTitle = tabTitle;
                    openAccordID = accordID;
                }
                if (strClick) {
                    leftMenuStr += "<table cellspacing='0'cellpadding='0'width='100%'border='0'><tr><td width='5%' class='dblue'></td><td class='dblue' width='95%'height='25'align='left'valign='bottom'><img src='/resource/dhtmlx/codebase/imgs/own/menuItemChild.png'/>&nbsp;<a id='/app/view/" + thridMenu.CommandText + "' title='" + thridMenu.MenuName + "' " + strClick;
                    leftMenuStr += "style='vertical-align:bottom'>" + thridMenu.MenuName + "</a></td></tr><tr><td width='5%'></td></tr></table>";
                }
                else {
                    leftMenuStr += "<table cellspacing='0'cellpadding='0'width='100%'border='0'><tr><td width='5%' class='dblue'></td><td class='dblue' width='95%'height='23'align='left'valign='bottom'><img src='/resource/dhtmlx/codebase/imgs/own/menuItemChild.png'/>&nbsp;<lable id='' title='" + thridMenu.MenuName + "' " + strClick;
                    leftMenuStr += "style='vertical-align:bottom'>" + thridMenu.MenuName + "</lable></td></tr><tr><td width='5%'></td></tr></table>";
                }
            }
            if (leftMenuStr != "") {
                var item = dhxAccord.addItem(authObj.secondMenu[menuID][i].MenuID, authObj.secondMenu[menuID][i].MenuName);
                dhxAccord.cells(authObj.secondMenu[menuID][i].MenuID).setIcon("/resource/dhtmlx/codebase/imgs/own/menuItemParent.png");
                item.attachHTMLString(leftMenuStr);
            }
        }
        if (openAccordID != "") {
            addTab(openTabID, openTitle);
        }
    }

    $(".dblue a").live("click", function () {
        addTab($(this).get(0).id, $(this).get(0).title);
    });
    $("#imgLogo").click(function () {
        //window.location.href = "/HomePage.html";
    });

    //生成用户名和注销按钮        
    function generateLoginLog() {
        //var departmentName = "";
        ////获取当前登录人数
        //ISystemService.execQuery.sqlString = "SELECT a.[ReferName] FROM [Refer] a inner join DepartmentUser b on (a.ReferID=b.DepartmentID) inner join [User] c on (b.UserID =c.UserID) where c.UserID=" + decodeURIComponent($.cookie('userID'));
        //rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        //if (ISystemService.execQuery.success) {
        //    (function (e) {
        //        var rows = e.rows;
        //        if (rows.length != 0) {
        //            departmentName = rows[0].values[0].value;
        //        }
        //    }(ISystemService.execQuery.resultValue));
        //}
        //var loginlog = "<table border='0' align='center' style='font-size:12pt;color: white;height:55px;float:right'><tr><td  valign='middle' align='center'><font style='color:white;'>" + departmentName + "</font>&nbsp;</td><td  valign='middle' align='center'><font style='color:white;'></font>&nbsp;</td></tr><tr><td  valign='middle' align='center'><img src='/resource/dhtmlx/codebase/imgs/own/user.png' height='14'><font style='color:white;'>" + decodeURIComponent($.cookie('userTrueName')) + "</font>&nbsp;<img id='imgPopOutUserMenu' src='/resource/dhtmlx/codebase/imgs/own/downArrow.png' style='cursor:pointer;' height='7px' width='14px'/>&nbsp;&nbsp;&nbsp;</td><td valign='middle' align='center'><img src='/resource/dhtmlx/codebase/imgs/own/logout.png' height='14px'/><a id='logout' class='gray';' style='color: white;font-size:12pt;cursor:pointer'>注  销</a>&nbsp;</td></tr></table>";

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
                //ISystemService.updateUserState.userID = $.cookie('userID');
                //ISystemService.updateUserState.state = '离线';
                //rock.AjaxRequest(ISystemService.updateUserState, rock.exceptionFun);
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

    //打开单据维护页面通用方法(MotorMaintenanceRecord)
    openBillRecordManage = function (billID, pageName, tabTitle) {
        addTab('/app/view/' + pageName + '.html?ID=' + billID, tabTitle);
    }
    //打开单据维护页面通用方法(MotorMaintenanceReport)
    openBillManage = function (billID, pageName, tabTitle) {
        addTab('/app/view/' + pageName + '.html?ID=' + billID, tabTitle);
    }
    //打开单据维护页面通用方法(两个参数)
    openMotorMaintenanceRecordManage = function (billID, actionType, pageName, tabTitle) {
        addTab('/app/view/' + pageName + '.html?motorMaintenanceReportID=' + billID + "&actionType=" + actionType, tabTitle);
    }
    //打开单据维护页面通用方法
    openElectricalRecordManage = function (billID, pageName, tabTitle) {
        addTab('/app/view/' + pageName + '.html?electricalRecordID=' + billID, tabTitle);
    }

    openNewPage = function (objID, pageName, tabTitle) {
        addTab('/app/view/' + pageName + '.html?ID=' + objID, tabTitle);
    }
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

