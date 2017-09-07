$(function () {
    //初始化系统通用对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Role";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        var tabbar, dhxLayout, roleForm, userForm, editState, roleEditState, roleToolBar, roleGrid, userToolBar, userGrid, selectRoleRowID,
            roleGrid, actionToolBar, actionGrid, actionForm, toolbarActionChoose,
            actionTree = new dhtmlXTreeObject("actionGroup", "100%", "100%", 0),
            currentTab = "roleUser",
            actionWaitGrid = new dhtmlXGridObject('actionWaitGrid'),
            roleDataList = new rock.JsonList(),
            userDataList = new rock.JsonList(),
            userWaitDataList = new rock.JsonList(),
            roleActionDataList = new rock.JsonList(),
            actionDataList = new rock.JsonList(),
            actionWaitDataList = new rock.JsonList(),
            menuItemList = new rock.RockList(),
            actiongroupList = new rock.RockList();
        //构造Tab页
        tabbar = new dhtmlXTabBar({
            parent: "tabcontainer",
            skin: 'dhx_skyblue',
            tabs: [
            { id: "roleUser", text: "角色用户", active: true },
            { id: "roleAction", text: "功能授权" }
            ]
        });
        tabbar.attachEvent("onSelect", function (id, last_id) {
            //关闭所有弹窗
            hideActionForm();
            hideRoleForm();
            hideUserForm();
            currentTab = id;
            return true;
        });
        //组织管理界面布局
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2U");
        dhxLayout.cells("a").hideHeader();
        dhxLayout.cells("b").hideHeader();
        dhxLayout.cells("a").setWidth(460);

        //角色用户关联组织树初始化
        roleUserLayout = new dhtmlXLayoutObject("organizationRoleUser", "1C");
        roleUserLayout.cells("a").hideHeader();

        //角色功能权限配置
        actionLayout = new dhtmlXLayoutObject("actionManage", "1C");
        actionLayout.cells("a").hideHeader();

        //初始化Tab页内容
        tabbar.tabs("roleUser").attachObject("roleUserTab");
        tabbar.tabs("roleAction").attachObject("actionAuth");
        dhxLayout.cells("b").attachObject('tabcontainer');
        //======================================================角色用户Tab内容========================================
        //初始化角色列表工具栏
        roleToolBar = new dhtmlXToolbarObject("roleToolBar");
        roleToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        roleToolBar.setSkin("dhx_skyblue");
        roleToolBar.addButton("add", 0, "添加", "add.png", "addDisabled.png");
        roleToolBar.addButton("modify", 2, "修改", "edit.png", "editDisabled.png");
        roleToolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
        roleToolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "add":
                    roleEditState = "add";
                    $("#roleFormTitle").text("新建角色");
                    showRoleForm();
                    $("#roleName").val("");
                    ISystemService.getNextID.typeName = 'Role';
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            $("#roleID").val(e.value);
                        }(ISystemService.getNextID.resultValue))
                    }
                    break;
                case "modify":
                    var checked = roleGrid.getCheckedRows(0);
                    if (checked != "") {
                        if (checked.indexOf(',') == -1) {
                            var dictDataID = roleGrid.cells(checked, 1).getValue();
                            for (var i = 0; i < roleDataList.rows.length; i++) {
                                if (roleDataList.rows[i].id.toString() === dictDataID.toString()) {
                                    $("#roleID").val(roleDataList.rows[i].data[1]);
                                    $("#roleName").val(roleDataList.rows[i].data[2]);
                                    roleEditState = "modify";
                                    break;
                                }
                            }
                            $("#roleFormTitle").text("编辑角色");
                            showRoleForm();
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
                    var checked = roleGrid.getCheckedRows(0);
                    if (confirm("您确定要删除选定的角色吗?")) {
                        var rowids = checked.split(',');
                        //角色是否和功能存在关联，如果存在则不允许删除
                        var roleActionRelateExist = false;
                        for (var i = 0; i < rowids.length; i++) {
                            sqlStr = "SELECT [RoleID] FROM [RoleAction] where RoleID =" + rowids[i];
                            ISystemService.execQuery.sqlString = sqlStr;
                            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                            if (ISystemService.execQuery.success) {
                                (function (e) {
                                    if (e != null) {
                                        if (e.rows.length > 0) {
                                            roleActionRelateExist = true;
                                        }
                                    }
                                }(ISystemService.execQuery.resultValue));
                            }
                            if (roleActionRelateExist) {
                                alert("该角色和功能存在关联关系，不能删除！");
                                return;
                            }
                        }
                        //角色是否和用户存在关联，如果存在则不允许删除
                        var userRoleRelateExist = false;
                        for (var i = 0; i < rowids.length; i++) {
                            sqlStr = "SELECT [UserID],[RoleID] FROM [UserRole] where RoleID =" + rowids[i];
                            ISystemService.execQuery.sqlString = sqlStr;
                            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                            if (ISystemService.execQuery.success) {
                                (function (e) {
                                    if (e != null) {
                                        if (e.rows.length > 0) {
                                            userRoleRelateExist = true;
                                        }
                                    }
                                }(ISystemService.execQuery.resultValue));
                            }
                            if (userRoleRelateExist) {
                                alert("该角色和用户存在关联关系，不能删除！");
                                return;
                            }
                        }
                        for (var i = 0; i < rowids.length; i++) {
                            //删除角色
                            ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                            ISystemService.deleteDynObjectByID.structName = "Role";
                            rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                            if (ISystemService.deleteDynObjectByID.success) {
                                (function (e) {
                                    for (var k = 0; k < roleDataList.rows.length; k++) {
                                        if (roleDataList.rows[k].id == rowids[i]) {
                                            roleDataList.rows.splice(k, 1);
                                            roleGrid.deleteRow(rowids[i]);
                                            break;
                                        }
                                    }
                                }(ISystemService.deleteDynObjectByID.resultValue));
                            }
                        }
                        alert("删除成功！");
                    }
                    break;
            }
        });

        //角色列表
        roleGrid = new dhtmlXGridObject('roleGrid');
        roleGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        roleGrid.setSkin("dhx_skyblue");
        roleGrid.setHeader("选择,,角色名称");
        roleGrid.setInitWidths("45,0,*");
        roleGrid.setColAlign("center,left,left");
        roleGrid.setColTypes("ch,ro,ro");
        roleGrid.attachEvent("onRowSelect", roleRowSelect);
        //单击选中取消
        roleGrid.attachEvent("onCheck", function (rowID, cIndex) {
            refreshRoleToolBarState();
            refreshRemoveRoleUserToolBarState();
            return true;
        });
        roleGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
            for (var i = 0; i < roleDataList.rows.length; i++) {
                if (roleDataList.rows[i].id.toString() === rowID.toString()) {
                    $("#roleID").val(roleDataList.rows[i].data[1]);
                    $("#roleName").val(roleDataList.rows[i].data[2]);
                    roleEditState = "modify";
                    $("#roleFormTitle").text("编辑角色");
                    showRoleForm();
                    break;
                }
            }
        });
        roleGrid.init();
        dhxLayout.cells("a").attachObject("roleOperate");

        //初始化用户列表工具栏
        userToolBar = new dhtmlXToolbarObject("userToolBar");
        userToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        userToolBar.setSkin("dhx_skyblue");
        userToolBar.addButton("add", 0, "添加", "add.png", "addDisabled.png");
        userToolBar.addButton("remove", 2, "移除", "delete.png", "deleteDisabled.png");
        userToolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "add":
                    $("#userName").val("");
                    showUserForm();
                    refreshRoleUserToolBarState();
                    break;
                case "remove":
                    var checked = userGrid.getCheckedRows(0);
                    var rowids = checked.split(',');
                    for (var i = 0; i < rowids.length; i++) {
                        //循环处理选中的项
                        var sqlStr = "delete from UserRole where UserID = " + rowids[i] + " and RoleID = " + selectRoleRowID;
                        ISystemService.excuteNoneReturnQuery.sqlString = sqlStr;
                        rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);
                        if (ISystemService.excuteNoneReturnQuery.success) {
                            (function (e) {
                                for (var k = 0; k < userDataList.rows.length; k++) {
                                    if (userDataList.rows[k].id == rowids[i]) {
                                        userDataList.rows.splice(k, 1);
                                        userGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(ISystemService.excuteNoneReturnQuery.resultValue));
                        }
                    }
                    break;
            }
        });

        //用户列表
        userGrid = new dhtmlXGridObject('userGrid');
        userGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        userGrid.setSkin("dhx_skyblue");
        userGrid.setHeader("选择,,用户名称,显示名称");
        userGrid.setInitWidths("45,0,150,*");
        userGrid.setColAlign("center,left,left,left");
        userGrid.setColTypes("ch,ro,ro,ro");
        //单击选中取消
        userGrid.attachEvent("onCheck", function (rowID, cIndex) {
            refreshRemoveRoleUserToolBarState();
            return true;
        });
        userGrid.init();
        roleUserLayout.cells("a").attachObject("userOperate");

        //待关联用户列表
        userWaitGrid = new dhtmlXGridObject('userFormGrid');
        userWaitGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        userWaitGrid.setSkin("dhx_skyblue");
        userWaitGrid.setHeader("选择,,用户名称,显示名称");
        userWaitGrid.setInitWidths("45,0,150,*");
        userWaitGrid.setColAlign("center,left,left,left");
        userWaitGrid.setColTypes("ch,ro,ro,ro");
        userWaitGrid.attachEvent("onCheck", function (rowID, cIndex) {
            refreshRoleUserToolBarState();
            return true;
        });
        userWaitGrid.init();

        ISystemService.execQuery.sqlString = "SELECT [RoleID],[RoleName] FROM [Role]";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                roleDataList.rows = [];
                roleGrid.clearAll();
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    listdata.data[1] = rowResult[0].value;
                    listdata.data[2] = rowResult[1].value;
                    roleDataList.rows.push(listdata);
                }
                roleGrid.parse(roleDataList, "json");
            }(ISystemService.execQuery.resultValue));
        }

        //autocomplete快速搜索处理
        $("#userName").keyup(function () {
            autoComplete($("#userName").val());
        });

        function autoComplete(userNameKeys) {
            var InfoArray = new Array();
            ISystemService.execQuery.sqlString = "SELECT [UserID],[UserName],[TrueName] FROM [User] where UserName like '%" + userNameKeys + "%' and UserID not in (SELECT [UserID] FROM [UserRole] where RoleID=" + roleGrid.getSelectedRowId() + ")";
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    var rows = e.rows;
                    userWaitDataList.rows = [];
                    userWaitGrid.clearAll();
                    for (var i = 0; i < rows.length; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(rowResult[0].value);
                        listdata.data[0] = 0;
                        listdata.data[1] = rowResult[0].value;
                        listdata.data[2] = rowResult[1].value;
                        listdata.data[3] = rowResult[2].value;
                        userWaitDataList.rows.push(listdata);
                    }
                    userWaitGrid.parse(userWaitDataList, "json");
                }(ISystemService.execQuery.resultValue));
            }
        }

        ISystemService.execQuery.sqlString = "SELECT top 20 [UserID],[UserName],[TrueName] FROM [User] ";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                userWaitDataList.rows = [];
                userWaitGrid.clearAll();
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    listdata.data[1] = rowResult[0].value;
                    listdata.data[2] = rowResult[1].value;
                    listdata.data[3] = rowResult[2].value;
                    userWaitDataList.rows.push(listdata);
                }
                userWaitGrid.parse(userWaitDataList, "json");
            }(ISystemService.execQuery.resultValue));
        }

        //角色窗口操作
        roleForm = $("#roleForm");
        roleForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    roleForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        roleForm.mouseup(function () {
            $(document).unbind("mousemove");
        });
        hideRoleForm();
        function hideRoleForm() {
            roleForm.css({ top: 200, left: -1300 }).hide();
            roleForm.css("visibility", "visible");
        }
        function showRoleForm() {
            roleForm.css({ top: 100, left: 180 }).show();
        }

        //保存
        $("#role_Save").click(function () {
            var role = null;
            var isSameNameExist = false;
            if (roleEditState == "add") {
                role = RoleClass.createInstance();
            }
            else {
                ISystemService.getDynObjectByID.dynObjectID = $("#roleID").val();
                ISystemService.getDynObjectByID.structName = "Role";
                rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                if (ISystemService.getDynObjectByID.success) {
                    (function (e) {
                        role = e;
                    }(ISystemService.getDynObjectByID.resultValue));
                }
                else {
                    return;
                }
            }
            var roleName = $("#roleName").val();
            if (roleName == '') {
                alert('角色名称不能为空!');
                return false;
            }
            if (roleEditState == "add") {
                //根据用户名获取用户ID
                var referSql = "select [RoleID] from [Role] where RoleName='" + roleName + "'";
                ISystemService.execQuery.sqlString = referSql;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var rowLength = rows.length;
                            if (rows.length > 0) {
                                isSameNameExist = true;
                            }
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }
            else {

                //根据用户名获取用户ID
                var referSql = "select [RoleID] from [Role] where RoleName='" + roleName + "'";
                ISystemService.execQuery.sqlString = referSql;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var rowLength = rows.length;
                            if (rowLength > 0) {
                                var rowResult = rows[0].values;
                                if (rowResult[0].value != $("#roleID").val()) {
                                    isSameNameExist = true;
                                }
                            }
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }
            if (isSameNameExist) {
                alert("角色名称不能重复，请检查！");
                return;
            }
            role.roleID = $("#roleID").val();
            role.roleName = roleName;

            if (roleEditState == "add") {
                ISystemService.addDynObject.dynObject = role;
                rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                if (ISystemService.addDynObject.success) {
                    (function (e) {
                        //更新角色列表
                        var dictData = new rock.JsonData(role.roleID);
                        dictData.data.push(0);
                        dictData.data.push(role.roleID);
                        dictData.data.push(role.roleName);
                        roleDataList.rows.push(dictData);
                        roleGrid.clearAll();
                        roleGrid.parse(roleDataList, "json");
                        hideRoleForm();
                        alert("添加角色成功！");
                    }(ISystemService.addDynObject.resultValue));
                }
            }
            else {
                ISystemService.modifyDynObject.dynObject = role;
                rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                if (ISystemService.modifyDynObject.success) {
                    (function (e) {
                        for (var i = 0; i < roleDataList.rows.length; i++) {
                            if (roleDataList.rows[i].id.toString() == role.roleID) {
                                roleDataList.rows[i].data[0] = 0;
                                roleDataList.rows[i].data[1] = role.roleID;
                                roleDataList.rows[i].data[2] = role.roleName;
                            }
                        }
                    }(ISystemService.modifyDynObject.resultValue));
                }
                roleGrid.clearAll();
                roleGrid.parse(roleDataList, "json");
                hideRoleForm();
            }
        });
        //取消
        $("#role_Cancle").click(function () {
            hideRoleForm();
        });
        //关闭
        $("#role_Close").click(function () {
            hideRoleForm();
        });
        //用户窗口操作
        userForm = $("#userForm");
        userForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    userForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        userForm.mouseup(function () {
            $(document).unbind("mousemove");
        });
        hideUserForm();
        function hideUserForm() {
            userForm.css({ top: 200, left: -1300 }).hide();
            userForm.css("visibility", "visible");
        }
        function showUserForm() {
            userForm.css({ top: 50, left: 180 }).show();
        }
        //保存
        $("#user_Save").click(function () {
            var checked = userWaitGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            for (var i = 0; i < rowids.length; i++) {
                //循环处理选中的项
                var sqlStr = "insert into UserRole(UserID,RoleID) values(" + rowids[i] + "," + selectRoleRowID + ")"; //此处以后要写到中间层
                ISystemService.excuteNoneReturnQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);
                if (ISystemService.excuteNoneReturnQuery.success) {
                    (function (e) {
                        for (var k = 0; k < userWaitDataList.rows.length; k++) {
                            if (userWaitDataList.rows[k].id == rowids[i]) {
                                userDataList.rows.push(userWaitDataList.rows[k]);
                                userWaitDataList.rows.splice(k, 1);
                                userWaitGrid.deleteRow(rowids[i]);
                                break;
                            }
                        }
                    }(ISystemService.excuteNoneReturnQuery.resultValue));
                }
            }
            userGrid.clearAll();
            userGrid.parse(userDataList, "json");
            hideUserForm();
        });
        //取消
        $("#user_Cancle").click(function () {
            hideUserForm();
        });
        //关闭
        $("#user_Close").click(function () {
            hideUserForm();
        });
        //角色列表选中事件
        function roleRowSelect(rowId, cellIndex) {
            selectRoleRowID = rowId;
            ISystemService.execQuery.sqlString = "SELECT a.[UserID],a.[UserName],a.[TrueName] FROM [User] a inner join [UserRole] b on(b.RoleID=" + rowId + " and a.UserID=b.UserID)";
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    var rows = e.rows;
                    userDataList.rows = [];
                    userGrid.clearAll();
                    for (var i = 0; i < rows.length; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(rowResult[0].value);
                        listdata.data[0] = 0;
                        listdata.data[1] = rowResult[0].value;
                        listdata.data[2] = rowResult[1].value;
                        listdata.data[3] = rowResult[2].value;
                        userDataList.rows.push(listdata);
                    }
                    userGrid.parse(userDataList, "json");
                }(ISystemService.execQuery.resultValue));
            }

            var sqlStr = "SELECT [ActionID],[ActionName] FROM [Action] where ActionID in (SELECT [ActionID] FROM [RoleAction] where RoleID=" + rowId + ")";
            ISystemService.execQuery.sqlString = sqlStr;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    if (e != null) {
                        var rows = e.rows;
                        var length = rows.length;
                        actionDataList.rows = [];
                        actionGrid.clearAll();
                        for (var i = 0; i < length; i++) {
                            var rowResult = rows[i].values;
                            var actionData = new rock.JsonData(rowResult[0].value);
                            actionData.data[1] = rowResult[0].value;
                            actionData.data[2] = rowResult[1].value;
                            actionDataList.rows.push(actionData);
                        }
                        actionGrid.parse(actionDataList, "json");
                    }
                }(ISystemService.execQuery.resultValue));
                initActionTree();
            }
            refreshRemoveRoleUserToolBarState();
            refreshRoleActionToolBarState();
        }

        //====================================角色权限配置Tab页面=================================================
        //初始化用户列表工具栏
        actionToolBar = new dhtmlXToolbarObject("actionToolBar");
        actionToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        actionToolBar.setSkin("dhx_skyblue");
        actionToolBar.addButton("add", 0, "添加", "add.png", "addDisabled.png");
        actionToolBar.addButton("remove", 1, "移除", "delete.png", "deleteDisabled.png");
        actionToolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "add":
                    if (roleGrid.getSelectedRowId()) {
                        showActionForm();
                        initActionTree();
                        refreshActionAuthToolBarState();
                    }
                    else {
                        alert("请先选中要授权的角色再选择功能组!");
                        return;
                    }

                    break;
                case "remove":
                    var checked = actionGrid.getCheckedRows(0);
                    var rowids = checked.split(',');
                    for (var i = 0; i < rowids.length; i++) {
                        //循环处理选中的项
                        var sqlStr = "delete from RoleAction where ActionID = " + rowids[i] + " and RoleID = " + roleGrid.getSelectedRowId();
                        ISystemService.excuteNoneReturnQuery.sqlString = sqlStr;
                        rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);
                        if (ISystemService.excuteNoneReturnQuery.success) {
                            (function (e) {
                                for (var k = 0; k < actionDataList.rows.length; k++) {
                                    if (actionDataList.rows[k].id == rowids[i]) {
                                        actionDataList.rows.splice(k, 1);
                                        actionGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(ISystemService.excuteNoneReturnQuery.resultValue));
                        }
                    }
                    break;
            }
        });
        //功能权限配置界面功能列表
        actionGrid = new dhtmlXGridObject('actionGrid');
        actionGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        actionGrid.setSkin("dhx_skyblue");
        actionGrid.setHeader("选择,,功能名称");
        actionGrid.setInitWidths("45,0,*");
        actionGrid.setColAlign("center,left,left");
        actionGrid.setColTypes("ch,ro,ro");
        //单击选中取消
        actionGrid.attachEvent("onCheck", function (rowID, cIndex) {
            refreshRoleActionToolBarState();
            return true;
        });
        actionGrid.init();
        actionLayout.cells("a").attachObject("actionOperate");

        //功能树
        actionTree.setImagePath("/resource/dhtmlx/codebase/imgs/csh_bluefolders/");
        actionTree.setStdImages("folderClosed.gif", "folderOpen.gif", "folderClosed.gif");
        actionTree.attachEvent("onSelect", actionTreeSelect);
        //待关联功能列表
        actionWaitGrid.setImagePath("/resource/dhtmlx/codebase/imgs//");
        actionWaitGrid.setHeader("选择,,功能名称");
        actionWaitGrid.setInitWidths("45,0,*");
        actionWaitGrid.setColAlign("center,left,left");
        actionWaitGrid.setSkin("dhx_skyblue");
        actionWaitGrid.setColTypes("ch,ro,ro");
        //单击选中取消
        actionWaitGrid.attachEvent("onCheck", function (rowID, cIndex) {
            refreshActionAuthToolBarState();
            return true;
        });
        actionWaitGrid.init();

        function initActionTree() {
            if (actionTree.hasChildren(1) > 0) {
                actionTree.deleteChildItems(0)
            }
            //获取一级功能组列表        
            ISystemService.execQuery.sqlString = "select ActionGroupID, ActionGroupName from ActionGroup where ParentID is null ";
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    var rows = e.rows;
                    for (var i = 0; i < rows.length; i++) {
                        var rowResult = rows[i].values;
                        actionTree.insertNewChild(0, rowResult[0].value, rowResult[1].value);
                    }
                    actionTree.selectItem(1, true, false);
                }(ISystemService.execQuery.resultValue));
            }
            else {
                return;
            }
        }
        toolbarActionChoose = new dhtmlXToolbarObject("toolbarActionChoose");
        toolbarActionChoose.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
        toolbarActionChoose.setSkin("dhx_skyblue");
        toolbarActionChoose.addButton("save", 0, "保存", "save.png", "saveDisabled.png");
        toolbarActionChoose.attachEvent("onClick", function (id) {
            var checked = actionWaitGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            for (var i = 0; i < rowids.length; i++) {
                //循环处理选中的项
                var sqlStr = "insert into RoleAction(RoleID,ActionID) values(" + roleGrid.getSelectedRowId() + "," + rowids[i] + ")"; //此处以后要写到中间层
                ISystemService.excuteNoneReturnQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);
                if (ISystemService.excuteNoneReturnQuery.success) {
                    (function (e) {
                        for (var k = 0; k < actionWaitDataList.rows.length; k++) {
                            if (actionWaitDataList.rows[k].id == rowids[i]) {
                                actionDataList.rows.push(actionWaitDataList.rows[k]);
                                actionWaitDataList.rows.splice(k, 1);
                                actionWaitGrid.deleteRow(rowids[i]);
                                break;
                            }
                        }
                    }(ISystemService.excuteNoneReturnQuery.resultValue));
                }
            }
            actionGrid.clearAll();
            actionGrid.parse(actionDataList, "json");
            //hideActionForm();
        });
        //用户窗口操作
        actionForm = $("#actionForm");
        actionForm.mousedown(function (e) {
            iDiffX = e.pageX - $(this).offset().left;
            iDiffY = e.pageY - $(this).offset().top;
            if (iDiffY < 30) {
                $(document).mousemove(function (e) {
                    actionForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                });
            }
        });
        actionForm.mouseup(function () {
            $(document).unbind("mousemove");
        });
        hideActionForm();
        function hideActionForm() {
            actionForm.css({ top: 200, left: -1300 }).hide();
            actionForm.css("visibility", "visible");
        }
        function showActionForm() {
            actionForm.css({ top: 50, left: 180 }).show();
        }
        //取消
        $("#anction_Close").click(function () {
            hideActionForm();
        });
        function actionTreeSelect(itemid) {
            //判断是否有选中的角色
            if (roleGrid.getSelectedRowId()) {
                //获取actiongroup子节点并填充
                if (!actionTree.hasChildren(itemid)) {
                    var sqlStr = "select ActionGroupID, ActionGroupName, Grades, ParentID from ActionGroup where ParentID = " + itemid;
                    ISystemService.execQuery.sqlString = sqlStr;
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
                                    actionTree.insertNewChild(itemid, rowResult[0].value, rowResult[1].value);
                                }
                            }
                        }(ISystemService.execQuery.resultValue));
                    }
                }
                //获取当前角色在当前功能组中已授权的列表
                var roleSelectedActionID = [];
                var sqlStr = "select ActionID from RoleAction where RoleID = " + roleGrid.getSelectedRowId();
                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var length = rows.length;
                            for (var i = 0; i < length; i++) {
                                var rowResult = rows[i].values;
                                roleSelectedActionID.push(rowResult[0].value);
                            }
                        }
                    }(ISystemService.execQuery.resultValue));
                }

                //处理功能列表
                actionWaitDataList.rows = [];
                var sqlStr = "SELECT [ActionID],[ActionName] FROM [Action] where ActionGroupID=" + itemid + " and ActionID not in (SELECT [ActionID] FROM [RoleAction] where RoleID =" + roleGrid.getSelectedRowId() + ")";
                //var sqlStr = "select ActionID, ActionName from Action where ActionGroupID = " + itemid;
                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var length = rows.length;
                            for (var i = 0; i < length; i++) {
                                var rowResult = rows[i].values;

                                var actionData = new rock.JsonData(rowResult[0].value);
                                actionData.data[0] = 1;
                                actionData.data[1] = rowResult[0].value;
                                actionData.data[2] = rowResult[1].value;
                                actionWaitDataList.rows.push(actionData);
                            }
                            actionWaitGrid.clearAll();
                            actionWaitGrid.parse(actionWaitDataList, "json");
                        }
                    }(ISystemService.execQuery.resultValue));
                    refreshActionAuthToolBarState();
                }
            }
            else {
                alert("请先选中要授权的角色再选择功能组!");
                return;
            }
        }

        refreshRoleToolBarState();
        refreshRemoveRoleUserToolBarState();
        refreshRoleActionToolBarState();
        //添加角色按钮状态控制
        function addRoleEnabled() {
            return true;
        }
        //修改角色按钮状态控制
        function modifyRoleEnabled() {
            var checked = roleGrid.getCheckedRows(0);
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
        //删除角色按钮状态控制
        function deleteRoleEnabled() {
            var checked = roleGrid.getCheckedRows(0);
            if (checked == "") {
                return false;
            }
            else {
                return true;
            }
        }
        //角色管理工具栏按钮状态控制
        function refreshRoleToolBarState() {
            if (addRoleEnabled()) {
                roleToolBar.enableItem("add");
            }
            else {
                roleToolBar.disableItem("add");
            }
            if (modifyRoleEnabled()) {
                roleToolBar.enableItem("modify");
            }
            else {
                roleToolBar.disableItem("modify");
            }
            if (deleteRoleEnabled()) {
                roleToolBar.enableItem("delete");
            }
            else {
                roleToolBar.disableItem("delete");
            }
        }


        //添加用户状态控制
        function addRoleUserEnabled() {
            if (roleGrid.getSelectedRowId()) {
                return true;
            }
            else {
                return false;
            }
        }
        //移除用户按钮状态控制
        function removeRoleUserEnabled() {
            var checked = userGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            if (checked == "") { return false; }
            else {
                return true;
            }
        }
        //保存用户按钮状态控制
        function saveRoleUserEnabled() {
            var checked = userWaitGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            if (checked == "") { return false; }
            else {
                return true;
            }
        }
        //角色用户关联工具栏按钮状态控制
        function refreshRoleUserToolBarState() {
            if (saveRoleUserEnabled()) {
                $("#user_Save").removeAttr("disabled");
            }
            else {
                $("#user_Save").attr("disabled", true);
            }
        }
        //角色用户移除关联功能工具栏按钮状态控制
        function refreshRemoveRoleUserToolBarState() {
            if (addRoleUserEnabled()) {
                userToolBar.enableItem("add");
            }
            else {
                userToolBar.disableItem("add");
            }

            if (removeRoleUserEnabled()) {
                userToolBar.enableItem("remove");
            }
            else {
                userToolBar.disableItem("remove");
            }

        }

        //添加功能按钮状态控制
        function addRoleActionEnabled() {
            if (roleGrid.getSelectedRowId()) {
                return true;
            }
            else {
                return false;
            }
        }
        //移除功能按钮状态控制
        function removeRoleActionEnabled() {
            var checked = actionGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            if (checked == "") { return false; }
            else {
                return true;
            }
        }
        //保存功能按钮状态控制
        function saveRoleActionEnabled() {
            var checked = actionWaitGrid.getCheckedRows(0);
            var rowids = checked.split(',');
            if (checked == "") { return false; }
            else {
                return true;
            }
        }
        //功能授权工具栏按钮状态控制
        function refreshActionAuthToolBarState() {
            if (saveRoleActionEnabled()) {
                toolbarActionChoose.enableItem("save");
            }
            else {
                toolbarActionChoose.disableItem("save");
            }
        }
        //角色功能工具栏按钮状态控制
        function refreshRoleActionToolBarState() {
            if (addRoleActionEnabled()) {
                actionToolBar.enableItem("add");
            }
            else {
                actionToolBar.disableItem("add");
            }

            if (removeRoleActionEnabled()) {
                actionToolBar.enableItem("remove");
            }
            else {
                actionToolBar.disableItem("remove");
            }

        }
    });
})