$(function () {
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //页面初始化
        var dhxLayout, dhxAccord, dhxTabbar, ajaxObj, rowResult,
        tabID = "",
        tabTitle = "",
        accordID = "";//, tabBarHide, userRoleList, topMenuStr, homepageID, integrationQueryID;
        var authObj = {};
        authObj.userRoleList = [];
        authObj.usetActionList = [];
        authObj.secondMenu = {};
        authObj.secondMenu.thirdMenu = {};

        dhxLayout = new dhtmlXLayoutObject(document.body, "2U", 'dhx_web');
        dhxLayout.setImagePath("/resource/dhtmlx/codebase/imgs/");
        dhxLayout.setCollapsedText("a", "<img src='/resource/dhtmlx/codebase/imgs/own/1.gif' width='18px' border='0'>");
        dhxLayout.cells("a").setWidth(200);
        dhxLayout.cells("a").setText("");

        dhxLayout.cells("b").setText("");
        //获取用户所在角色集合
        ISystemService.execQuery.sqlString = "select r.RoleID,r.RoleName from [UserRole] as u inner join [Role] as r on u.RoleID=r.RoleID where  u.UserID=" + $.cookie('userID');
        ISystemService.execQuery.success = false;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                for (var i = 0, length = rows.length; i < length; i++) {
                    rowResult = rows[i].values;
                    authObj.userRoleList.push(rowResult[0].value);
                }
            }(ISystemService.execQuery.resultValue));
        }
        else {
            alert("获取用户所在角色集合出错,请检查!");
            return;
        }

        //获取用户所有功能集合
        for (var i = 0; i < authObj.userRoleList.length; i++) {
            //获取用户所在角色ActionID列表
            ISystemService.execQuery.sqlString = "select ActionID from [RoleAction] where RoleID=" + authObj.userRoleList[i];
            ISystemService.execQuery.success = false;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    var rows = e.rows;
                    for (var i = 0, length = rows.length; i < length; i++) {
                        rowResult = rows[i].values;
                        authObj.usetActionList.push(rowResult[0].value);
                    }

                }(ISystemService.execQuery.resultValue));
            }
            else {
                alert("获取用户所有功能集合出错,请检查!");
                return;
            }
        }

        // 模块tab切换
        function tabSelect(id) {
            if (!authObj.secondMenu[id]) {
                authObj.secondMenu[id] = [];
                //获取二级菜单
                ISystemService.execQuery.sqlString = "select MenuID, MenuName, CommandText from Menu where ParentID = " + id + " order by DisplayOrder";
                ISystemService.execQuery.success = false;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        var rows = e.rows;
                        for (var i = 0, length = rows.length; i < length; i++) {
                            var rowResult = rows[i].values;
                            authObj.secondMenu[id].push({ MenuID: rowResult[0].value, Menuame: rowResult[1].value });
                            authObj.secondMenu.thirdMenu[rowResult[0].value] = [];
                            //var item = dhxAccord.addItem(rowResult[0].value, rowResult[1].value);

                            //获取三级菜单
                            ISystemService.execQuery.sqlString = "select MenuID, MenuName, CommandText,ActionID from Menu where ParentID = " + rowResult[0].value + " order by DisplayOrder";
                            ISystemService.execQuery.success = false;
                            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                            if (ISystemService.execQuery.success) {
                                (function (e, secondMenuID) {
                                    var rows = e.rows;
                                    for (var i = 0, length = rows.length; i < length; i++) {
                                        var rowResult = rows[i].values;
                                        authObj.secondMenu.thirdMenu[secondMenuID].push({ MenuID: rowResult[0].value, MenuName: rowResult[1].value, CommandText: rowResult[2].value, ActionID: rowResult[3].value });
                                    }
                                }(ISystemService.execQuery.resultValue, rowResult[0].value));

                            }
                            else {
                                return;
                            }
                        }

                    }(ISystemService.execQuery.resultValue));
                }
                else {
                    return;
                }
                createLeftMenu(id)
            }
            else {
                createLeftMenu(id)
            }
        }
        function createLeftMenu(menuID) {
            if (dhxAccord != null) {
                dhxAccord.unload();
                dhxAccord = null;
            }
            dhxAccord = dhxLayout.cells("a").attachAccordion();
            dhxAccord.setSkin("dhx_terrace");
            //dhxLayout.cells("b").showHeader();
            var curSecondMenuID;
            for (var i = 0, length = authObj.secondMenu[menuID].length; i < length; i++) {
                var leftMenuStr = "";
                curSecondMenuID = authObj.secondMenu[menuID][i].MenuID;
                for (var j = 0, count = authObj.secondMenu.thirdMenu[curSecondMenuID].length; j < count; j++) {
                    var thridMenu = authObj.secondMenu.thirdMenu[curSecondMenuID][j];
                    var strClick = "";
                    //判断用户是否具有菜单所具有的功能ID的权限
                    for (var k = 0; k < authObj.usetActionList.length; k++) {
                        if (authObj.usetActionList[k] == thridMenu.ActionID) {
                            strClick = " href='#' class='gray'";
                            if (tabID == "") {
                                tabID = thridMenu.CommandText;
                                tabTitle = thridMenu.MenuName;
                                accordID = curSecondMenuID;
                            }
                            break;
                        }
                    }
                    if (strClick) {
                        leftMenuStr += "<table cellspacing='0'cellpadding='0'width='100%'border='0'><tr><td width='5%' class='dblue'></td><td class='dblue' width='95%'height='25'align='left'valign='bottom'><img src='/resource/dhtmlx/codebase/imgs/own/menuItemChild.png'/>&nbsp;<a id='" + thridMenu.CommandText + "' title='" + thridMenu.MenuName + "' " + strClick;
                        leftMenuStr += "style='vertical-align:bottom'>" + thridMenu.MenuName + "</a></td></tr><tr><td width='5%'></td></tr></table>";
                    }
                    //else {
                    //    leftMenuStr += "<table cellspacing='0'cellpadding='0'width='100%'border='0'><tr><td width='5%' class='dblue'></td><td class='dblue' width='95%'height='25'align='left'valign='bottom'><img src='/resource/dhtmlx/codebase/imgs/own/menuItemChild.png'/>&nbsp;<a id='' title='" + thridMenu.MenumName + "' class='grayness'";
                    //}

                }
                if (leftMenuStr != "") {
                    //dhxLayout.cells("a").hideHeader();
                    var item = dhxAccord.addItem(authObj.secondMenu[menuID][i].MenuID, authObj.secondMenu[menuID][i].MenuName);
                    dhxAccord.cells(authObj.secondMenu[menuID][i].MenuID).setIcon("/resource/dhtmlx/codebase/imgs/own/MenuParent.png");
                    item.attachHTMLString(leftMenuStr);
                }
            }
        }

        $(".dblue a").live("click", function () {
            addTab($(this).get(0).id, $(this).get(0).title);
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
                        valCou = 60;
                        break;
                    case 3:
                        valCou = 60;
                        break
                    case 4:
                        valCou = 88;
                        break;
                    case 5:
                        valCou = 105;
                        break;
                    case 6:
                        valCou = 125;
                        break;
                    default:
                        valCou = valCou * 18;
                        break;
                }
                //valCou = (valCou <= 4) ? ((valCou == 1) ? valCou * 50 : valCou * 23) : valCou * 18;
                dhxTabbar = dhxLayout.cells("b").attachTabbar();
                dhxTabbar.setImagePath("/resource/dhtmlx/codebase/imgs/");
                dhxTabbar.setSkin("dhx_terrace");
                dhxTabbar.enableTabCloseButton(true);

                dhxTabbar.addTab(id, value, valCou + "px");
                dhxTabbar.cells(id).attachURL(id);  //+ ".htm"
                dhxTabbar.setTabActive(id);
                //调整宽高，显示出底部和右侧边框
                var divWidth = $(".dhx_tabcontent_zone").width();
                var divHeight = $(".dhx_tabcontent_zone").height();
                $(".dhx_tabcontent_zone").css("height", divHeight - 2 + "px");
                $(".dhx_tabcontent_zone").css("width", divWidth - 2 + "px");

                divWidth = $(".dhx_tabcontent_zone").height();
            }
            else {
                if (dhxTabbar.cells(id)) {
                    dhxTabbar.setTabActive(id);
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
                            valCou = 60;
                            break;
                        case 3:
                            valCou = 60;
                            break
                        case 4:
                            valCou = 88;
                            break;
                        case 5:
                            valCou = 105;
                            break;
                        case 6:
                            valCou = 125;
                            break;
                        default:
                            valCou = valCou * 18;
                            break;
                    }
                    dhxTabbar.addTab(id, value, valCou + "px");
                    dhxTabbar.cells(id).attachURL(id); //+ ".htm"
                    dhxTabbar.setTabActive(id);
                    //调整宽高，显示出底部和右侧边框
                    var divWidth = $(".dhx_tabcontent_zone").width();
                    var divHeight = $(".dhx_tabcontent_zone").height();
                    $(".dhx_tabcontent_zone").css("height", divHeight - 2 + "px");
                    $(".dhx_tabcontent_zone").css("width", divWidth - 2 + "px");
                }
            }
        }
        tabSelect(549);
        //页面默认选中一个页面

        if (accordID != "") {
            dhxAccord.cells(accordID).open();
            addTab(tabID, tabTitle);
        }
        //$("#addApi").live("click", function () {
        //    document.parentWindow.parent.$("#divMenu32").css("background-image", "url(resource/dhtmlx/codebase/imgs/own/homePage.png)");
        //    document.parentWindow.parent.$("#divMenu1").css("background-image", "url(resource/dhtmlx/codebase/imgs/own/workBench1.png)");
        //});


    });
})

