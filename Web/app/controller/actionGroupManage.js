$(function () {
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,ActionGroup";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //页面对象声明
        var curNodeID
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2U"),
        tree = dhxLayout.cells("a").attachTree(),
        actiongroupList = new rock.RockList,
        state = null;

        dhxLayout.cells("a").setWidth(300);
        dhxLayout.cells("a").hideHeader();
        dhxLayout.cells("b").hideHeader();

        menu = new dhtmlXMenuObject();
        menu.setIconsPath("/resource/dhtmlx/codebase/imgs");
        menu.renderAsContextMenu();
        menu.addNewChild(menu.topId, 0, "add", "添加同级功能组项", false);
        menu.addNewChild(menu.topId, 1, "addchild", "添加下级功能组项", false);
        menu.addNewChild(menu.topId, 2, "delete", "删除当前功能组项", false);
        menu.attachEvent("onClick", function (itemId) {
            var parentId = tree.getParentId(curNodeID);
            switch (itemId) {
                case "add":
                    state = "add";
                    $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                    $("#txtActionGroupID").val("");
                    $("#txtActionGroupName").val("");                   
                    //获取新ID 
                    ISystemService.getNextID.typeName = "ActionGroup";
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            $("#txtActionGroupID").val(e.value);
                        }(ISystemService.getNextID.resultValue));
                    }
                    else {
                        return;
                    }
                    //从actiongroupList中找到参照ActionGroup确定下面的信息    
                    for (var i = 0; i < actiongroupList.length; i++) {
                        actiongroup = actiongroupList[i];
                        if (actiongroup.actionGroupID == curNodeID) {
                            $("#grades").val(actiongroup.grades);
                            $("#parentid").val(actiongroup.parentID);
                        }
                    }
                    $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                    tree.selectItem(curNodeID, false);
                    break;
                case "addchild":
                    state = "add";
                    $("#txtActionGroupName").val("");
                    //获取新ID   
                    ISystemService.getNextID.typeName = "ActionGroup";
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            $("#txtActionGroupID").val(e.value);
                        }(ISystemService.getNextID.resultValue));
                    }
                    else {
                        return;
                    }
                    //从actiongroupList中找到参照ActionGroup确定下面的信息 
                    for (var i = 0; i < actiongroupList.length; i++) {
                        actiongroup = actiongroupList[i];
                        if (actiongroup.actionGroupID == curNodeID) {
                            $("#grades").val(parseInt(actiongroup.grades, 10) + 1);
                            $("#parentid").val(actiongroup.actionGroupID);
                        }
                    }
                    $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                    tree.selectItem(curNodeID, false);
                    break;
                case "delete":
                    state = "delete";
                    deletecur(curNodeID);
                    if (parentId > 0) {
                        tree.selectItem(parentId, false);
                    }
                    break;
            }
        });

        tree.setImagePath("/resource/dhtmlx/codebase/imgs/csh_bluefolders/");
        tree.enableTreeLines(true);
        tree.setStdImages("leaf.png", "folderOpen.png", "leaf.png");
        tree.attachEvent("onSelect", treeSelect);
        tree.enableContextMenu(menu);
        tree.attachEvent("onBeforeContextMenu", function (itemId) {
            //当前结点id
            curNodeID = itemId;
            var hsachild = false;
            //获取actiongroup子节点并填充
            if (!tree.hasChildren(itemId)) {
                ISystemService.execQuery.sqlString = "select ActionGroupID, ActionGroupName, Grades, ParentID from ActionGroup where ParentID = " + itemId;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var length = rows.length;
                            if (length > 0) {
                                hsachild = true;
                            }
                            for (var i = 0; i < length; i++) {
                                var rowResult = rows[i].values;
                                var actiongroup = {};
                                actiongroup.actionGroupID = rowResult[0].value;
                                actiongroup.actionGroupName = rowResult[1].value;
                                actiongroup.grades = rowResult[3].value;
                                actiongroup.parentID = rowResult[4].value;

                                actiongroupList.add(actiongroup);
                                tree.insertNewChild(curNodeID, actiongroup.actionGroupID, actiongroup.actionGroupName);
                            }
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }
            if (hsachild) {

                return false;
            }
            else {
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
                if (tree.getLevel(itemId) == 1) {
                    menu.hideItem('add');
                }
                return true;
            }
        });

        $("#btn_Save").click(function () {
            //验证部分                
            var actionGroupID = $("#txtActionGroupID").val();
            var actionGroupName = $("#txtActionGroupName").val();
            var grades = $("#grades").val();
            var parentID = $("#parentid").val();

            if (!rock.chknum(actionGroupID)) {
                alert('功能组ID输入格式错误');
                return false;
            }

            if (actionGroupName == '') {
                alert('功能组名称不能为空!');
                return false;
            }

            if (!rock.chknum(grades)) {
                alert('功能组级次输入格式错误');
                return false;
            }

            if (!rock.chknum(parentID)) {
                parentID = null;
            }

            var actionGroup = ActionGroupClass.createInstance();
            actionGroup.actionGroupID = actionGroupID;
            actionGroup.actionGroupName = actionGroupName;
            actionGroup.grades = grades;
            actionGroup.parentID = parentID;

            if (state == "add") {
                ISystemService.addDynObject.dynObject = actionGroup;
                rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                if (ISystemService.addDynObject.success) {
                    (function (e) {
                        $('#btn_Save').attr('disabled', "true"); // 禁用保存按钮
                        //在树上添加
                        var actiongroup = {};
                        actiongroup.actionGroupID = actionGroupID;
                        actiongroup.actionGroupName = actionGroupName;
                        actiongroup.grades = grades;
                        actiongroup.parentID = parentID;

                        actiongroupList.add(actiongroup);
                        actiongroupList.add(actiongroup);
                        if (actiongroup.parentID == "") {
                            tree.insertNewChild(0, actiongroup.actionGroupID, actiongroup.actionGroupName);
                        }
                        else {
                            tree.insertNewChild(actiongroup.parentID, actiongroup.actionGroupID, actiongroup.actionGroupName);
                        }
                        tree.selectItem(actiongroup.actionGroupID, false);
                        state = null;
                    }(ISystemService.addDynObject.resultValue));
                }
            }
            else {
                ISystemService.modifyDynObject.dynObject = actionGroup;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                    (function (e) {
                        $('#btn_Save').attr('disabled', "true"); // 禁用保存按钮
                        state = null;
                        for (var i = 0; i < actiongroupList.length; i++) {
                            actiongroup = actiongroupList[i];
                            var localID = actiongroup.actionGroupID;
                            if (localID == curNodeID) {
                                actiongroup.actionGroupName = actionGroupName;
                                tree.setItemText(localID, actionGroupName);
                            }

                        }
                    }(ISystemService.modifyDynObject.resultValue));
                }
            }
        });
       

        dhxLayout.cells("b").attachObject("formData");

        //获取一级功能组列表
        ISystemService.execQuery.sqlString = "select ActionGroupID, ActionGroupName, Grades, ParentID from ActionGroup where ParentID is null ";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    for (var i = 0; i < rows.length; i++) {
                        var rowResult = rows[i].values;

                        var actiongroup = {};
                        actiongroup.actionGroupID = rowResult[0].value;
                        actiongroup.actionGroupName = rowResult[1].value;
                        actiongroup.grades = rowResult[2].value;
                        actiongroup.parentID = rowResult[3].value;                       
                        actiongroupList.add(actiongroup);
                        tree.insertNewChild(0, actiongroup.actionGroupID, actiongroup.actionGroupName);
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        function treeSelect(itemId) {
            //当前结点id
            curNodeID = itemId;
            //获取actiongroup子节点并填充
            if (!tree.hasChildren(itemId)) {
                ISystemService.execQuery.sqlString = "select ActionGroupID, ActionGroupName, Grades, ParentID from ActionGroup where ParentID = " + itemId;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var length = rows.length;
                            for (var i = 0; i < length; i++) {
                                var rowResult = rows[i].values;

                                var actiongroup = {};
                                actiongroup.actionGroupID = rowResult[0].value;
                                actiongroup.actionGroupName = rowResult[1].value;
                                actiongroup.grades = rowResult[2].value;
                                actiongroup.parentID = rowResult[3].value;                              

                                actiongroupList.add(actiongroup);
                                tree.insertNewChild(curNodeID, actiongroup.actionGroupID, actiongroup.actionGroupName);
                            }
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }

            switch (state) {
                case "delete":
                    $('#btn_Save').attr('disabled', "true"); // 禁用保存按钮
                    break;
                case "add":
                    $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                    break;
                default:
                    state = "modify";
                    var hased = false;
                    for (var i = 0; i < actiongroupList.length; i++) {
                        actiongroup = actiongroupList[i];
                        if (actiongroup.actionGroupID == itemId) {
                            $("#txtActionGroupID").val(actiongroup.actionGroupID);
                            $("#txtActionGroupName").val(actiongroup.actionGroupName);
                            $("#grades").val(actiongroup.grades);
                            $("#parentid").val(actiongroup.parentID);
                            $('#btn_Save').removeAttr("disabled"); // 启用保存按钮
                            hased = true;
                        }
                    }
                    if (!hased) {
                        alert("应用程序逻辑出错,列表中不存在当前选中的对象!");
                    }
                    break;
            }
        }

        function deletecur(itemId) {
            //先判断menulist中是否存在menu对象
            state = null;
            for (var i = 0; i < actiongroupList.length; i++) {
                actiongroup = actiongroupList[i];
                if (actiongroup.actionGroupID == curNodeID) {
                    ISystemService.deleteDynObjectByID.dynObjectID = curNodeID;
                    ISystemService.deleteDynObjectByID.structName = "ActionGroup";
                    rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                    if (ISystemService.deleteDynObjectByID.success) {
                        tree.deleteItem(curNodeID, true);
                    }
                }
            }
        }

    });
})

