$(function () {
    //初始化系统通用对象    
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Menu";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //页面对象声明
        var curNodeID, editState,
        curResourceNodeID = 0,
        menuList = new rock.RockList(),
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2U"),
        menu = new dhtmlXMenuObject(),
        tree = dhxLayout.cells("a").attachTree(),
        resourceTree = new dhtmlXTreeObject("resoucegroup", "100%", "100%", 0),
        mygrid = new dhtmlXGridObject('resouce');

        //页面对象初始化
        //dhxLayout.setImagePath("/resource/dhtmlx/codebase/imgs/");
        dhxLayout.cells("a").setWidth(300);
        dhxLayout.cells("a").hideHeader();
        dhxLayout.cells("b").hideHeader();

        menu.setIconsPath("/resource/dhtmlx/codebase/imgs");
        menu.renderAsContextMenu();
        menu.addNewChild(menu.topId, 0, "add", "添加同级菜单项", false);
        menu.addNewChild(menu.topId, 1, "addchild", "添加下级菜单项", false);
        menu.addNewChild(menu.topId, 2, "delete", "删除当前菜单项", false);
        menu.attachEvent("onClick", function (itemId) {
            switch (itemId) {
                case "add":
                    tree.selectItem(curNodeID, false);
                    editState = "add";
                    var parentMenuID = tree.getParentId(curNodeID);
                    var parentMenu = null;
                    $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                    $("#txtSelectResource").val("");
                    $("#menuid").val("");
                    $("#txtMenuName").val("");
                    $("#txtCommandText").val("");
                    $("#actionid").val("");
                    $("#displayorder").val("");
                    $("#grades").val("");
                    $("#parentid").val("");

                    //获取新ID 
                    ISystemService.getNextID.typeName = "Menu";
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            $("#menuid").val(e.value);
                        }(ISystemService.getNextID.resultValue));
                    }
                    else {
                        return;
                    }

                    if (parentMenuID > 0) {
                        //获取父节点的menu对象
                        ISystemService.getDynObjectByID.dynObjectID = parentMenuID;
                        ISystemService.getDynObjectByID.structName = "Menu";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                parentMenu = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        //获取顺序号                        
                        ISystemService.execQuery.sqlString = "select MAX(DisplayOrder) from Menu where ParentID = " + parentMenuID;
                        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                        if (ISystemService.execQuery.success) {
                            (function (e) {
                                var rows = e.rows;
                                var rowResult = rows[0].values;
                                if (rowResult[0].value == "") {
                                    $("#displayorder").val(1);
                                }
                                else {
                                    $("#displayorder").val(parseInt(rowResult[0].value, 10) + 1);
                                }
                                $("#grades").val(parseInt(parentMenu.grades, 10) + 1);
                                $("#parentid").val(parentMenu.menuID);
                            }(ISystemService.execQuery.resultValue));
                        }
                    }
                    else {
                        //获取一级节点顺序号                       
                        ISystemService.execQuery.sqlString = "select MAX(DisplayOrder) from Menu where ParentID is null";
                        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                        if (ISystemService.execQuery.success) {
                            (function (e) {
                                var rows = e.rows;
                                var rowResult = rows[0].values;
                                $("#displayorder").val(parseInt(rowResult[0].value, 10) + 1);
                                $("#grades").val(1);
                                //暂时让菜单ID 默认为1
                            }(ISystemService.execQuery.resultValue));
                        }
                    }
                    break;
                case "addchild":
                    $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                    tree.selectItem(curNodeID, false);
                    editState = "add";
                    var parentMenuID = curNodeID;
                    $("#txtSelectResource").val("");
                    $("#menuid").val("");
                    $("#txtMenuName").val("");
                    $("#txtCommandText").val("");
                    $("#actionid").val("");
                    $("#displayorder").val("");
                    $("#grades").val("");
                    $("#parentid").val("");
                    //获取新ID 
                    ISystemService.getNextID.typeName = "Menu";
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            $("#menuid").val(e.value);
                        }(ISystemService.getNextID.resultValue));
                    }
                    else {
                        return;
                    }

                    if (parentMenuID > 0) {
                        //获取父节点的menu对象
                        ISystemService.getDynObjectByID.dynObjectID = parentMenuID;
                        ISystemService.getDynObjectByID.structName = "Menu";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                parentMenu = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        //获取顺序号                        
                        ISystemService.execQuery.sqlString = "select MAX(DisplayOrder) from Menu where ParentID = " + parentMenuID;
                        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                        if (ISystemService.execQuery.success) {
                            (function (e) {
                                var rows = e.rows;
                                var rowResult = rows[0].values;
                                if (rowResult[0].value == "") {
                                    $("#displayorder").val(1);
                                }
                                else {
                                    $("#displayorder").val(parseInt(rowResult[0].value, 10) + 1);
                                }
                                $("#grades").val(parseInt(parentMenu.grades, 10) + 1);
                                $("#parentid").val(parentMenu.menuID);
                            }(ISystemService.execQuery.resultValue));
                        }
                    }
                    else {
                        //获取一级节点顺序号                       
                        ISystemService.execQuery.sqlString = "select MAX(DisplayOrder) from Menu where ParentID is null";
                        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                        if (ISystemService.execQuery.success) {
                            (function (e) {
                                var rows = e.rows;
                                var rowResult = rows[0].values;
                                $("#displayorder").val(parseInt(rowResult[0].value, 10) + 1);
                                $("#grades").val(1);
                            }(ISystemService.execQuery.resultValue));
                        }
                    }
                    break;
                case "delete":
                    deletecur(curNodeID);
                    tree.selectItem(tree.getParentId(curNodeID), false);
                    $("#txtSelectResource").val("");
                    $("#menuid").val("");
                    $("#txtMenuName").val("");
                    $("#txtCommandText").val("");
                    $("#actionid").val("");
                    $("#displayorder").val("");
                    $("#grades").val("");
                    $("#parentid").val("");
                    $('#btn_Save').attr('disabled', "true"); // 禁用保存按钮
                    break;
            }
        });

        tree.setImagePath("/resource/dhtmlx/codebase/imgs/csh_bluefolders/");
        tree.enableTreeLines(true);
        tree.setStdImages("leaf.png", "folderOpen.png", "leaf.png");
        tree.attachEvent("onSelect", treeSelect);
        tree.enableContextMenu(menu);
        tree.attachEvent("onBeforeContextMenu", function (itemId) {
            curNodeID = itemId;
            if (tree.hasChildren(itemId)) {
                menu.showItem('add');
                menu.showItem('addchild');
                menu.hideItem('delete');
            }
            else {
                menu.showItem('add');
                menu.showItem('addchild');
                menu.showItem('delete');
            };
            return true;
        });
        //添加应用程序根节点
        tree.insertNewChild(0, -1, "扬子热电厂仪表设备管理");
        $("#btn_Save").click(function () {
            //验证部分
            var menuID = $("#menuid").val();
            var menuName = $("#txtMenuName").val();
            var actionID = $("#actionid").val();
            var displayOrder = $("#displayorder").val();
            var grades = $("#grades").val();
            var parentID = $("#parentid").val();

            if (!rock.chknum(menuID)) {
                alert('菜单项ID输入格式错误');
                return false;
            }

            if (menuName == '') {
                alert('菜单项名称不能为空!');
                return false;
            }

            if (!rock.chknum(actionID)) {
                alert('请选择菜单项的功能');
                return false;
            }

            if (!rock.chknum(grades)) {
                alert('菜单项级次输入格式错误');
                return false;
            }

            if (!rock.chknum(parentID)) {
                parentID = null;
            }

            var menu = null;

            if (editState == "add") {
                menu = MenuClass.createInstance();
            }
            else {
                ISystemService.getDynObjectByID.dynObjectID = menuID;
                ISystemService.getDynObjectByID.structName = "Menu";
                rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                if (ISystemService.getDynObjectByID.success) {
                    (function (e) {
                        menu = e;
                    }(ISystemService.getDynObjectByID.resultValue));
                }
                else {
                    return;
                }
            }

            menu.menuID = menuID;
            menu.menuName = menuName;
            menu.hiddenNoRight = $("#hiddennoright").val();
            menu.actionID = actionID;
            menu.displayOrder = displayOrder;
            menu.commandText = encodeURI($("#txtCommandText").val());
            menu.grades = $("#grades").val();
            menu.parentID = parentID;

            if (editState == "add") {
                ISystemService.addDynObject.dynObject = menu;
                rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                if (ISystemService.addDynObject.success) {
                    (function (e) {
                        //在树上添加
                        $('#btn_Save').attr('disabled', "true"); // 禁用保存按钮
                        var menuForList = {};
                        menuForList.menuID = menuID;
                        menuForList.menuName = menuName;
                        menuForList.commandText = menu.commandText;
                        menuForList.hiddenNoRight = menu.hiddenNoRight;
                        menuForList.grades = menu.grades;
                        menuForList.displayOrder = displayOrder;
                        menuForList.parentID = parentID;
                        menuForList.actionID = actionID;
                        menuList.add(menuForList);
                        if (parentID == null) {
                            tree.insertNewChild(0, menuID, menuName);
                        }
                        else {
                            tree.insertNewChild(parentID, menuID, menuName);
                        }
                        tree.selectItem(menuID, false);
                    }());
                }
            }
            else {
                ISystemService.modifyDynObject.dynObject = menu;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                    (function (e) {
                        //在树上添加
                        $('#btn_Save').attr('disabled', "true"); // 禁用保存按钮
                        for (var i = 0, length = menuList.length; i < length; i++) {
                            if (menuList[i].menuID == menuID) {
                                menuList[i].menuName = menuName;
                                menuList[i].commandText = menu.commandText;
                                menuList[i].hiddenNoRight = menu.hiddenNoRight;
                                menuList[i].grades = menu.grades;
                                menuList[i].displayOrder = displayOrder;
                                menuList[i].parentID = parentID;
                                menuList[i].actionID = actionID;
                                tree.setItemText(menuID, menuName);
                                break;
                            }
                        }
                    }());
                }
            }
        });
        dhxLayout.cells("b").attachObject("formData");

        resourceTree.setImagePath("/resource/dhtmlx/codebase/imgs/csh_bluefolders/");
        resourceTree.setStdImages("leaf.png", "folderOpen.png", "leaf.png");
        resourceTree.attachEvent("onSelect", resourceTreeSelect);

        mygrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        mygrid.setHeader("功能流水号,功能名称");
        mygrid.setInitWidths("100,*");
        mygrid.setColAlign("center,left");
        mygrid.setSkin("dhx_skyblue");
        mygrid.setColSorting("int,str");
        mygrid.setColTypes("ro,ro");
        mygrid.enableDistributedParsing(true, 20);
        mygrid.attachEvent("onRowDblClicked", function (rId, cInd) {
            mygrid.forEachCell(rId, function (c, cn) {
                if (cn == 1) {
                    $("#actionid").val(rId);
                    $("#txtSelectResource").val(c.getValue());
                }
            });
            refer.hide();
        });
        mygrid.init();

        //获取一级菜单列表        
        ISystemService.execQuery.sqlString = "select MenuID, MenuName, CommandText, HiddenNoRight,Grades,DisplayOrder,ActionID from Menu where ParentID is null order by DisplayOrder";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var menu = {};
                    menu.menuID = rowResult[0].value;
                    menu.menuName = rowResult[1].value;
                    menu.commandText = rowResult[2].value;
                    menu.hiddenNoRight = rowResult[3].value;
                    menu.grades = rowResult[4].value;
                    menu.displayOrder = rowResult[5].value;
                    menu.parentID = null;
                    menu.actionID = rowResult[6].value;
                    menuList.add(menu);
                    tree.insertNewChild(-1, menu.menuID, menu.menuName);
                }
            }(ISystemService.execQuery.resultValue));
        }
        else {
            return;
        }

        //获取一级功能组列表        
        ISystemService.execQuery.sqlString = "select ActionGroupID, ActionGroupName from ActionGroup where ParentID is null ";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    resourceTree.insertNewChild(curResourceNodeID, rowResult[0].value, rowResult[1].value);
                }
            }(ISystemService.execQuery.resultValue));
        }
        else {
            return;
        }

        //处理参照服务
        var refer = $("#refer");
        refer.hide();
        objW = refer.width();
        objH = refer.height();
        $("#txtSelectResource").click(function (e) {
            var selfX = objW + e.pageX;
            var selfY = objH + e.pageY;
            var bodyW = document.documentElement.clientWidth + document.documentElement.scrollLeft;
            var bodyH = document.documentElement.clientHeight + document.documentElement.scrollTop;
            if (selfX > bodyW && selfY > bodyH) {
                $("#refer").css({ top: (bodyH - objH - 30), left: (bodyW - objW - 200) }).show();
            } else if (selfY > bodyH) {
                $("#refer").css({ top: (bodyH - objH - 30), left: e.pageX - 200 }).show();
            } else if (selfX > bodyW) {
                $("#refer").css({ top: e.pageY - 30, left: (bodyW - objW - 200) }).show();
            } else {
                $("#refer").css({ top: e.pageY - 30, left: e.pageX - 200 }).show();
            }
        });

        $("#btnClose").click(function (e) {
            refer.hide();
        });

        function treeSelect(itemid) {
            //当前结点id
            curNodeID = itemid;
            for (var i = 0; i < menuList.length; i++) {
                if (menuList[i].menuID.toString() === itemid.toString()) {
                    var actionID = menuList[i].actionID;
                    $("#menuid").val(menuList[i].menuID);
                    $("#actionid").val(actionID);
                    $("#txtMenuName").val(menuList[i].menuName);
                    $("#txtCommandText").val(decodeURI(menuList[i].commandText));
                    $("#hiddennoright").val(menuList[i].hiddenNoRight);
                    $("#grades").val(menuList[i].grades);
                    $("#displayorder").val(menuList[i].displayOrder);
                    $("#parentid").val(menuList[i].parentID);
                    //权限功能名称
                    ISystemService.executeScalar.sqlString = " select [ActionName] from [Action] where [ActionID] = " + actionID;
                    rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                    if (ISystemService.execQuery.success) {
                        (function (e) {
                            $("#txtSelectResource").val(e.resultValue.value);
                            $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                            editState = "modify";
                        }(ISystemService.executeScalar));
                    }
                    else {
                        return;
                    }
                }
            }

            //获取menu子节点并填充
            if (!tree.hasChildren(itemid)) {
                ISystemService.execQuery.sqlString = "select MenuID, MenuName, CommandText, HiddenNoRight,Grades,DisplayOrder,ParentID,ActionID from Menu where ParentID = " + itemid + " order by DisplayOrder";
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        var rows = e.rows;
                        for (var i = 0; i < rows.length; i++) {
                            var rowResult = rows[i].values;
                            var menu = {};
                            menu.menuID = rowResult[0].value;
                            menu.menuName = rowResult[1].value;
                            menu.commandText = rowResult[2].value;
                            menu.hiddenNoRight = rowResult[3].value;
                            menu.grades = rowResult[4].value;
                            menu.displayOrder = rowResult[5].value;
                            menu.parentID = rowResult[6].value;
                            menu.actionID = rowResult[7].value;
                            menuList.add(menu);
                            tree.insertNewChild(curNodeID, rowResult[0].value, rowResult[1].value);
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }
        }

        function deletecur(itemid) {
            //先判断menulist中是否存在menu对象
            for (var i = 0, length = menuList.length; i < length; i++) {
                if (menuList[i].menuID == itemid) {
                    ISystemService.deleteDynObjectByID.dynObjectID = itemid;
                    ISystemService.deleteDynObjectByID.structName = "Menu";
                    rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                    if (ISystemService.deleteDynObjectByID.success) {
                        tree.deleteItem(itemid, true);
                    }
                    break;
                }
            }
        }

        function resourceTreeSelect(itemid) {
            //当前结点id
            curResourceNodeID = itemid;
            if (!resourceTree.hasChildren(itemid)) {
                //获取一级功能组列表                
                ISystemService.execQuery.sqlString = "select ActionGroupID, ActionGroupName from ActionGroup where ParentID = " + itemid;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        var rows = e.rows;
                        for (var i = 0; i < rows.length; i++) {
                            var rowResult = rows[i].values;
                            resourceTree.insertNewChild(curResourceNodeID, rowResult[0].value, rowResult[1].value);
                        }
                    }(ISystemService.execQuery.resultValue));
                }
                else {
                    return;
                }
            }

            //获取Resource并填充grid
            ISystemService.execQuery.sqlString = "select ActionID, ActionName from Action where ActionGroupID = " + itemid;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    var rows = e.rows;
                    if (rows.length > 0) {
                        resourceList = new rock.JsonList();
                        for (var i = 0; i < rows.length; i++) {
                            var rowResult = rows[i].values;
                            var listdata = new rock.JsonData(rowResult[0].value);
                            listdata.data[0] = rowResult[0].value;
                            listdata.data[1] = rowResult[1].value;
                            resourceList.rows.push(listdata);
                        }
                        mygrid.clearAll();
                        mygrid.parse(resourceList, "json");
                    }
                    else {
                        mygrid.clearAll();
                    }
                }(ISystemService.execQuery.resultValue));
            }
        }
    });
})


