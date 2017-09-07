$(function () {
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Action,ActionGroup";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //页面对象声明
        var actionGroupGrid, curNodeID, sqlStr, editActionGroupForm, editActionForm, actionGroupEditState, actionEditState
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2U"),
        tree = dhxLayout.cells("a").attachTree(),
        actionGroupDataList = new rock.JsonList(),
        actionDataList = new rock.JsonList(),       
        actionGroupToolbar = new dhtmlXToolbarObject("actiongroup_toolbar"),
        actionToolbar = new dhtmlXToolbarObject("action_toolbar"),
        tabbar = new dhtmlXTabBar({
            parent: "tabcontainer",
            skin: 'dhx_skyblue',
            tabs: [
                { id: "a1", text: "权限功能组"},
                { id: "a2", text: "权限功能", active: true }
            ]
        }), 
        actionGroupGrid = new dhtmlXGridObject("actiongroup_grid");
        actionGroupGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        actionGroupGrid.setSkin('dhx_skyblue');
        actionGroupGrid.setHeader("选择,,功能组名称");
        actionGroupGrid.setInitWidths("45,0,*");
        actionGroupGrid.setColAlign("center,left,left");
        actionGroupGrid.setColTypes("ch,ro,ro");
        actionGroupGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
            for (var i = 0; i < actionGroupDataList.rows.length; i++) {
                if (actionGroupDataList.rows[i].id.toString() === rowID.toString()) {
                    $("#txtActionGroupID").val(actionGroupDataList.rows[i].data[1]);
                    $("#txtActionGroupName").val(actionGroupDataList.rows[i].data[2]);
                    actionGroupEditState = "modify";
                    $("#editActionGroupFormTitle").text("编辑功能组");
                    showActionGroupEditForm();
                    break;
                }
            }
        });
        //单击选中取消
        actionGroupGrid.attachEvent("onCheck", function (rowID, cIndex) {
            refreshActionGroupToolBarState();
            return true;
        });
        actionGroupGrid.init();

        actionGrid = new dhtmlXGridObject("action_grid");
        actionGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        actionGrid.setSkin('dhx_skyblue');
        actionGrid.setHeader("选择,,功能名称");
        actionGrid.setInitWidths("45,0,*");
        actionGrid.setColAlign("center,left,left");
        actionGrid.setColTypes("ch,ro,ro");
        actionGrid.setColSorting("na,na,str");
        actionGrid.enableDistributedParsing(true, 20);
        actionGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
            for (var i = 0; i < actionDataList.rows.length; i++) {
                if (actionDataList.rows[i].id.toString() === rowID.toString()) {
                    $("#txtActionID").val(actionDataList.rows[i].data[1]);
                    $("#txtActionName").val(actionDataList.rows[i].data[2]);
                    actionEditState = "modify";
                    $("#editActionFormTitle").text("编辑功能");
                    showActionEditForm();
                    break;
                }
            }
        });
        //单击选中取消
        actionGrid.attachEvent("onCheck", function (rowID, cIndex) {
            refreshActionToolBarState();
            return true;
        });
        actionGrid.init();

        dhxLayout.cells("a").setWidth(260);
        dhxLayout.cells("a").hideHeader();
        dhxLayout.cells("b").hideHeader();
        tabbar.tabs("a1").attachObject('actiongroupContainer');
        tabbar.tabs("a2").attachObject('actionContainer');
        tabbar.tabs("a1").setActive();
        dhxLayout.cells("b").attachObject('tabcontainer');   

        tree.setImagePath("/resource/dhtmlx/codebase/imgs/csh_bluefolders/");
        tree.enableTreeLines(true);
        tree.setStdImages("leaf.png", "folderOpen.png", "leaf.png");
        tree.attachEvent("onSelect", treeSelect);

        actionGroupToolbar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        actionGroupToolbar.setSkin("dhx_skyblue");
        actionGroupToolbar.addButton("add", 0, "添加", "add.png", "addDisabled.png");
        actionGroupToolbar.addButton("modify", 2, "修改", "edit.png", "editDisabled.png");
        actionGroupToolbar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
        actionGroupToolbar.attachEvent("onClick", function (id) {
            switch (id) {
                case "add":
                    actionGroupEditState = "add";
                    $("#editActionGroupFormTitle").text("添加功能组");
                    //验证部分                
                    var actionGroupName = $("#txtActionGroupName").val();
                    showActionGroupEditForm();
                    $("#txtActionGroupID").val("");
                    $("#txtActionGroupName").val("");
                    ISystemService.getNextID.typeName = 'ActionGroup';
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            $("#txtActionGroupID").val(e.value);
                        }(ISystemService.getNextID.resultValue))
                    }
                    break
                case "modify":
                    var checked = actionGroupGrid.getCheckedRows(0);
                    if (checked != "") {
                        if (checked.indexOf(',') == -1) {
                            var dictDataID = actionGroupGrid.cells(checked, 1).getValue();
                            for (var i = 0; i < actionGroupDataList.rows.length; i++) {
                                if (actionGroupDataList.rows[i].id.toString() === dictDataID.toString()) {
                                    $("#txtActionGroupID").val(actionGroupDataList.rows[i].data[1]);
                                    $("#txtActionGroupName").val(actionGroupDataList.rows[i].data[2]);
                                    actionGroupEditState = "modify";
                                    break;
                                }
                            }
                            $("#editActionGroupFormTitle").text("编辑功能组");
                            showActionGroupEditForm();
                        }
                        else {
                            alert("请仅选择一条要修改的行!");
                        }
                    }
                    else {
                        alert("请选择要修改的行!");
                    }
                    break;
                case "delete":
                    if (confirm("您确定要删除选定的功能组吗?")) {
                        var checked = actionGroupGrid.getCheckedRows(0);
                        if (checked != "") {
                            var rowids = checked.split(',');
                            for (var i = 0; i < rowids.length; i++) {
                                //循环处理数组中的要删除的项
                                ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                                ISystemService.deleteDynObjectByID.structName = "ActionGroup";
                                rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                                if (ISystemService.deleteDynObjectByID.success) {
                                    (function (e) {
                                        var length = actionGroupDataList.rows.length;
                                        for (var j = 0; j < length; j++) {
                                            if (actionGroupDataList.rows[j].id == rowids[i]) {
                                                actionGroupDataList.rows.splice(j, 1);
                                                actionGroupGrid.deleteRow(rowids[i]);
                                                tree.deleteItem(rowids[i], true);
                                                break;
                                            }
                                        }
                                    }(ISystemService.deleteDynObjectByID.resultValue));
                                }
                            }
                        }
                        else {
                            alert("请选择要删除的行!");
                        }
                        refreshActionGroupToolBarState();
                    }
                    break
                default:
                    alert(id + "-->出错啦,请查找错误原因!");
            }
        });

        actionToolbar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        actionToolbar.setSkin("dhx_skyblue");
        actionToolbar.addButton("add", 0, "添加", "add.png", "addDisabled.png");
        actionToolbar.addButton("modify", 2, "修改", "edit.png", "editDisabled.png");
        actionToolbar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png"); 
        actionToolbar.attachEvent("onClick", function (id) {
            switch (id) {
                case "add":
                    actionEditState = "add";
                    $("#editActionFormTitle").text("添加功能");
                    //验证部分                
                    var actionName = $("#txtActionName").val();
                    showActionEditForm();
                    $("#txtActionID").val("");
                    $("#txtActionName").val("");
                    ISystemService.getNextID.typeName = 'Action';
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            $("#txtActionID").val(e.value);
                        }(ISystemService.getNextID.resultValue))
                    }
                    break
                case "modify":
                    var checked = actionGrid.getCheckedRows(0);
                    if (checked != "") {
                        if (checked.indexOf(',') == -1) {
                            var dictDataID = actionGrid.cells(checked, 1).getValue();
                            for (var i = 0; i < actionDataList.rows.length; i++) {
                                if (actionDataList.rows[i].id.toString() === dictDataID.toString()) {
                                    $("#txtActionID").val(actionDataList.rows[i].data[1]);
                                    $("#txtActionName").val(actionDataList.rows[i].data[2]);
                                    actionEditState = "modify";
                                    break;
                                }
                            }
                            $("#editActionFormTitle").text("编辑功能");
                            showActionEditForm();
                        }
                        else {
                            alert("请仅选择一条要修改的行!");
                        }
                    }
                    else {
                        alert("请选择要修改的行!");
                    }
                    break;
                case "delete":
                    if (confirm("您确定要删除选定的功能吗?")) {
                        var checked = actionGrid.getCheckedRows(0);
                        if (checked != "") {
                            var rowids = checked.split(',');
                            for (var i = 0; i < rowids.length; i++) {
                                //循环处理数组中的要删除的项
                                ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                                ISystemService.deleteDynObjectByID.structName = "Action";
                                rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                                if (ISystemService.deleteDynObjectByID.success) {
                                    (function (e) {
                                        var length = actionDataList.rows.length;
                                        for (var j = 0; j < length; j++) {
                                            if (actionDataList.rows[j].id == rowids[i]) {
                                                actionDataList.rows.splice(j, 1);
                                                actionGrid.deleteRow(rowids[i]);                                               
                                                break;
                                            }
                                        }
                                    }(ISystemService.deleteDynObjectByID.resultValue));
                                }
                            }
                        }
                        else {
                            alert("请选择要删除的行!");
                        }
                        refreshActionToolBarState();
                    }
                    break
                default:
                    alert(id + "-->出错啦,请查找错误原因!");
            }
        });

        //获取一级功能组列表
        ISystemService.execQuery.sqlString = "select ActionGroupID, ActionGroupName from ActionGroup where ParentID is null ";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    for (var i = 0; i < rows.length; i++) {
                        var rowResult = rows[i].values;
                        var actionGroup = {};
                        actionGroup.actionGroupID = rowResult[0].value;
                        actionGroup.actionGroupName = rowResult[1].value;
                        //actionGroupList.add(actionGroup);
                        tree.insertNewChild(0, actionGroup.actionGroupID, actionGroup.actionGroupName);
                    }
                    tree.selectItem(1, true, false);
                }

            }(ISystemService.execQuery.resultValue));
        } 

        function treeSelect(itemId) {
            //当前结点id
            curNodeID = itemId;
            //获取actionGroup子节点并填充
            if (!tree.hasChildren(itemId)) {
                ISystemService.execQuery.sqlString = "select ActionGroupID, ActionGroupName from ActionGroup where ParentID = " + itemId;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var length = rows.length;
                            actionGroupDataList.rows = [];
                            actionGroupGrid.clearAll();                           
                            for (var i = 0; i < length; i++) {
                                var rowResult = rows[i].values;
                                var actionGroup = {};
                                actionGroup.actionGroupID = rowResult[0].value;
                                actionGroup.actionGroupName = rowResult[1].value;
                                //actionGroupList.add(actionGroup);
                                tree.insertNewChild(curNodeID, actionGroup.actionGroupID, actionGroup.actionGroupName);
                                //填充actionGroupGrid
                                var listdata = new rock.JsonData(rowResult[0].value);
                                listdata.data[0] = 0;
                                listdata.data[1] = rowResult[0].value;
                                listdata.data[2] = rowResult[1].value;
                                actionGroupDataList.rows.push(listdata); 
                            }
                            actionGroupGrid.parse(actionGroupDataList, "json");                            
                        }
                    }(ISystemService.execQuery.resultValue));
                }               
            }
            else {
                ISystemService.execQuery.sqlString = "select ActionGroupID, ActionGroupName from ActionGroup where ParentID = " + itemId;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            actionGroupDataList.rows = [];
                            actionGroupGrid.clearAll();
                            var length = rows.length;
                            for (var i = 0; i < length; i++) {
                                var rowResult = rows[i].values;                              
                                //填充actionGroupGrid
                                var listdata = new rock.JsonData(rowResult[0].value);
                                listdata.data[0] = 0;
                                listdata.data[1] = rowResult[0].value;
                                listdata.data[2] = rowResult[1].value;
                                actionGroupDataList.rows.push(listdata);
                            }                            
                            actionGroupGrid.parse(actionGroupDataList, "json");
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }

            //填充所选功能组中的功能列表
            ISystemService.execQuery.sqlString = "select ActionID, ActionName from Action where ActionGroupID = " + itemId;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    if (e != null) {
                        var rows = e.rows;
                        actionDataList.rows = [];
                        actionGrid.clearAll();
                        if (rows.length > 0) {
                            for (var i = 0; i < rows.length; i++) {
                                var rowResult = rows[i].values;
                                var listdata = new rock.JsonData(rowResult[0].value);
                                listdata.data[0] = 0;
                                listdata.data[1] = rowResult[0].value;
                                listdata.data[2] = rowResult[1].value;
                                actionDataList.rows.push(listdata);
                            }
                            actionGrid.parse(actionDataList, "json");
                        }
                    }

                }(ISystemService.execQuery.resultValue));
            }
            refreshActionGroupToolBarState();
            refreshActionToolBarState();
        }
       
        editActionGroupForm = $("#actionGroupEditForm");
        editActionGroupForm.height(220);
        editActionGroupForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    editActionGroupForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        editActionGroupForm.mouseup(function () {
            $(document).unbind("mousemove");
        });

        editActionForm = $("#actionEditForm");
        editActionForm.height(220);
        editActionForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    editActionForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        editActionForm.mouseup(function () {
            $(document).unbind("mousemove");
        });

        //保存功能组
        $("#btnActionGroup_Save").click(function () {
            var actionGroup = null;            
            var actionGroupID = $("#txtActionGroupID").val();
            if (!rock.chknum(actionGroupID)) {
                alert('流水号输入格式错误');
                return false;
            }
            if (actionGroupEditState == "add") {
                actionGroup = ActionGroupClass.createInstance();
                actionGroup.grades = tree.getLevel(curNodeID) + 1;
                actionGroup.parentID = curNodeID;
            }
            else {
                ISystemService.getDynObjectByID.dynObjectID = actionGroupID;
                ISystemService.getDynObjectByID.structName = "ActionGroup";
                rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                if (ISystemService.getDynObjectByID.success) {
                    (function (e) {
                        actionGroup = e;
                    }(ISystemService.getDynObjectByID.resultValue));
                }
                else {
                    return;
                }
            }

            var actionGroupName = $("#txtActionGroupName").val();
            if (actionGroupName == '') {
                alert('功能组名称不能为空!');
                return false;
            }            

            if ($.trim(actionGroupID) != "") {
                actionGroup.actionGroupID = actionGroupID;
            }

            actionGroup.actionGroupName = actionGroupName;

            if (actionGroupEditState == "add") {
               
                ISystemService.addDynObject.dynObject = actionGroup;
                rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                if (ISystemService.addDynObject.success) {
                    (function (e) {
                        var dictData = new rock.JsonData(actionGroupID);
                        dictData.data.push(0);
                        dictData.data.push(actionGroupID);
                        dictData.data.push(actionGroupName);                      
                        actionGroupDataList.rows.push(dictData);
                        actionGroupGrid.clearAll();
                        actionGroupGrid.parse(actionGroupDataList, "json");
                        //添加树上的节点
                        if (actionGroup.parentID == "") {
                            tree.insertNewChild(0, actionGroup.actionGroupID, actionGroup.actionGroupName);
                        }
                        else {
                            tree.insertNewChild(actionGroup.parentID, actionGroup.actionGroupID, actionGroup.actionGroupName);
                        }
                        hideActionGroupEditForm();
                    }(ISystemService.addDynObject.resultValue));
                }
            }
            else {
                ISystemService.modifyDynObject.dynObject = actionGroup;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                    (function (e) {
                        for (var i = 0; i < actionGroupDataList.rows.length; i++) {
                            if (actionGroupDataList.rows[i].id.toString() == actionGroupID) {
                                actionGroupDataList.rows[i].data[0] = 0;
                                actionGroupDataList.rows[i].data[1] = actionGroupID;
                                actionGroupDataList.rows[i].data[2] = actionGroupName;
                                //修改树上节点的内容
                                tree.setItemText(actionGroupID, actionGroupName);
                            }
                        }
                    }(ISystemService.modifyDynObject.resultValue));
                }
                actionGroupGrid.clearAll();
                actionGroupGrid.parse(actionGroupDataList, "json");
                hideActionGroupEditForm();
            }
            refreshActionGroupToolBarState();
        });

        //取消功能组编辑
        $("#btnActionGroup_Cancle").click(function () {
            hideActionGroupEditForm();
        });
        //关闭功能组编辑
        $("#imgActionGroup_Close").click(function () {
            hideActionGroupEditForm();
        });

        //保存功能
        $("#btnAction_Save").click(function () {
            var action = null;
            var actionID = $("#txtActionID").val();
            if (!rock.chknum(actionID)) {
                alert('流水号输入格式错误');
                return false;
            }
            if (actionEditState == "add") {
                action = ActionClass.createInstance();                
                //actionGroup.grades = tree.getLevel(curNodeID) + 1;
                action.actionGroupID = curNodeID;
            }
            else {
                ISystemService.getDynObjectByID.dynObjectID = actionID;
                ISystemService.getDynObjectByID.structName = "Action";
                rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                if (ISystemService.getDynObjectByID.success) {
                    (function (e) {
                        action = e;
                    }(ISystemService.getDynObjectByID.resultValue));
                }
                else {
                    return;
                }
            }

            var actionName = $("#txtActionName").val();
            if (actionName == '') {
                alert('功能名称不能为空!');
                return false;
            }
           
            action.actionID = actionID;
            action.actionName = actionName;

            if (actionEditState == "add") {

                ISystemService.addDynObject.dynObject = action;
                rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                if (ISystemService.addDynObject.success) {
                    (function (e) {
                        var dictData = new rock.JsonData(actionID);
                        dictData.data.push(0);
                        dictData.data.push(actionID);
                        dictData.data.push(actionName);
                        actionDataList.rows.push(dictData);
                        actionGrid.clearAll();
                        actionGrid.parse(actionDataList, "json");
                        hideActionEditForm();
                    }(ISystemService.addDynObject.resultValue));
                }
            }
            else {
                ISystemService.modifyDynObject.dynObject = action;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                    (function (e) {
                        for (var i = 0; i < actionDataList.rows.length; i++) {
                            if (actionDataList.rows[i].id.toString() == actionID) {
                                actionDataList.rows[i].data[0] = 0;
                                actionDataList.rows[i].data[1] = actionID;
                                actionDataList.rows[i].data[2] = actionName;
                                ////修改树上节点的内容
                                //tree.setItemText(actionID, actionName);
                            }
                        }
                    }(ISystemService.modifyDynObject.resultValue));
                }
                actionGrid.clearAll();
                actionGrid.parse(actionDataList, "json");
                hideActionEditForm();
            }
            refreshActionToolBarState();
        });

        //取消功能编辑
        $("#btnAction_Cancle").click(function () {
            hideActionEditForm();
        });
        //关闭功能编辑
        $("#imgAction_Close").click(function () {
            hideActionEditForm();
        });

        //隐藏功能组编辑窗
        function hideActionGroupEditForm() {
            editActionGroupForm.css({ top: 200, left: -1300 }).hide();
            editActionGroupForm.css("visibility", "visible");
        }
        //显示功能组编辑窗
        function showActionGroupEditForm() {
            editActionGroupForm.css({ top: 100, left: 180 }).show();
        }
        //隐藏功能编辑窗
        function hideActionEditForm() {
            editActionForm.css({ top: 200, left: -1300 }).hide();
            editActionForm.css("visibility", "visible");
        }
        //显示功能编辑窗
        function showActionEditForm() {
            editActionForm.css({ top: 100, left: 180 }).show();
        }

        //添加功能组按钮状态控制
        function addActionGroupEnabled() {
            if (curNodeID) {
                return true;
            }
            else {
                return false;
            }
        }

        //修改功能组按钮状态控制
        function modifyActionGroupEnabled() {
            var checked = actionGroupGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            if (checked == "") { return false; }
            else {
                if (rowids.length != 1) {
                    return false;
                }
                else {
                    return true;
                }
            }
        }
        //删除功能组按钮状态控制
        function deleteActionGroupEnabled() {
            var checked = actionGroupGrid.getCheckedRows(0);
            if (checked == "") {
                return false;
            }
            else {
                return true;
            }
        }

        //功能组工具栏按钮状态控制
        function refreshActionGroupToolBarState() {
            if (addActionGroupEnabled()) {
                actionGroupToolbar.enableItem("add");
            }
            else {
                actionGroupToolbar.disableItem("add");
            }

            if (modifyActionGroupEnabled()) {
                actionGroupToolbar.enableItem("modify");
            }
            else {
                actionGroupToolbar.disableItem("modify");
            }
            if (deleteActionGroupEnabled()) {
                actionGroupToolbar.enableItem("delete");
            }
            else {
                actionGroupToolbar.disableItem("delete");
            }
        }

        //添加功能按钮状态控制
        function addActionEnabled() {
            if (curNodeID) {
                return true;
            }
            else {
                return false;
            }
        }

        //修改功能按钮状态控制
        function modifyActionEnabled() {
            var checked = actionGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            if (checked == "") { return false; }
            else {
                if (rowids.length != 1) {
                    return false;
                }
                else {
                    return true;
                }
            }
        }
        //删除功能按钮状态控制
        function deleteActionEnabled() {
            var checked = actionGrid.getCheckedRows(0);
            if (checked == "") {
                return false;
            }
            else {
                return true;
            }
        }

        //功能工具栏按钮状态控制
        function refreshActionToolBarState() {
            if (addActionEnabled()) {
                actionToolbar.enableItem("add");
            }
            else {
                actionToolbar.disableItem("add");
            }

            if (modifyActionEnabled()) {
                actionToolbar.enableItem("modify");
            }
            else {
                actionToolbar.disableItem("modify");
            }
            if (deleteActionEnabled()) {
                actionToolbar.enableItem("delete");
            }
            else {
                actionToolbar.disableItem("delete");
            }
        }

        hideActionGroupEditForm();
        hideActionEditForm();
    });
})