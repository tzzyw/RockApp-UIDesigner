$(function () {
    //初始化系统通用变量
    var dhxLayout, departmentForm, userForm, editState, departmentEditState, departmentToolBar, departmentGrid, userToolBar, userGrid, selectDepartmentID,
            departmentUserLayout,
            departmentDataList = new rock.JsonList(),
            userDataList = new rock.JsonList(),
            userWaitDataList = new rock.JsonList();
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Department,UserDepartment";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        ISystemService.execQuery.sqlString = "SELECT [DepartmentID],[DepartmentName] FROM [Department]";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                departmentDataList.rows = [];
                departmentGrid.clearAll();
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    listdata.data[1] = rowResult[0].value;
                    listdata.data[2] = rowResult[1].value;
                    departmentDataList.rows.push(listdata);
                }
                departmentGrid.parse(departmentDataList, "json");
            }(ISystemService.execQuery.resultValue));
        }      

        //ISystemService.execQuery.sqlString = "SELECT top 20 [UserID],[UserName],[TrueName] FROM [User] ";
        //rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        //if (ISystemService.execQuery.success) {
        //    (function (e) {
        //        var rows = e.rows;
        //        userWaitDataList.rows = [];
        //        userWaitGrid.clearAll();
        //        for (var i = 0; i < rows.length; i++) {
        //            var rowResult = rows[i].values;
        //            var listdata = new rock.JsonData(rowResult[0].value);
        //            listdata.data[0] = 0;
        //            listdata.data[1] = rowResult[0].value;
        //            listdata.data[2] = rowResult[1].value;
        //            listdata.data[3] = rowResult[2].value;
        //            userWaitDataList.rows.push(listdata);
        //        }
        //        userWaitGrid.parse(userWaitDataList, "json");
        //    }(ISystemService.execQuery.resultValue));
        //}    

        refreshDepartmentToolBarState();
        refreshRemoveDepartmentUserToolBarState();
       
    });

    //界面布局
    dhxLayout = new dhtmlXLayoutObject("mainbody", "2U");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("b").hideHeader();
    dhxLayout.cells("a").setWidth(420);
    dhxLayout.cells("a").attachObject("departmentOperate");
    dhxLayout.cells("b").attachObject('userOperate');

    //初始化部门列表工具栏
    departmentToolBar = new dhtmlXToolbarObject("departmentToolBar");
    departmentToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    departmentToolBar.setSkin("dhx_skyblue");
    departmentToolBar.addButton("add", 0, "添加", "add.png", "addDisabled.png");
    departmentToolBar.addButton("modify", 2, "修改", "edit.png", "editDisabled.png");
    departmentToolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
    departmentToolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "add":
                departmentEditState = "add";
                $("#departmentFormTitle").text("新建部门");
                showDepartmentForm();
                $("#txtdepartmentName").val("");
                ISystemService.getNextID.typeName = 'Department';
                rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                if (ISystemService.getNextID.success) {
                    (function (e) {
                        $("#departmentID").val(e.value);
                    }(ISystemService.getNextID.resultValue))
                }
                break;
            case "modify":
                var checked = departmentGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = departmentGrid.cells(checked, 1).getValue();
                        for (var i = 0; i < departmentDataList.rows.length; i++) {
                            if (departmentDataList.rows[i].id.toString() === dictDataID.toString()) {
                                $("#departmentID").val(departmentDataList.rows[i].data[1]);
                                $("#txtdepartmentName").val(departmentDataList.rows[i].data[2]);
                                departmentEditState = "modify";
                                break;
                            }
                        }
                        $("#departmentFormTitle").text("编辑部门");
                        showDepartmentForm();
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
                var checked = departmentGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的部门吗?")) {
                    var rowids = checked.split(',');
                    //部门是否和用户存在关联，如果存在则不允许删除
                    var userDepartmentRelateExist = false;
                    for (var i = 0; i < rowids.length; i++) {
                        sqlStr = "SELECT [UserID],[DepartmentID] FROM [UserDepartment] where DepartmentID =" + rowids[i];
                        ISystemService.execQuery.sqlString = sqlStr;
                        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                        if (ISystemService.execQuery.success) {
                            (function (e) {
                                if (e != null) {
                                    if (e.rows.length > 0) {
                                        userDepartmentRelateExist = true;
                                    }
                                }
                            }(ISystemService.execQuery.resultValue));
                        }
                        if (userDepartmentRelateExist) {
                            alert("该部门和用户存在关联关系，不能删除！");
                            return;
                        }
                    }
                    for (var i = 0; i < rowids.length; i++) {
                        //删除部门
                        ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                        ISystemService.deleteDynObjectByID.structName = "Department";
                        rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                        if (ISystemService.deleteDynObjectByID.success) {
                            (function (e) {
                                for (var k = 0; k < departmentDataList.rows.length; k++) {
                                    if (departmentDataList.rows[k].id == rowids[i]) {
                                        departmentDataList.rows.splice(k, 1);
                                        departmentGrid.deleteRow(rowids[i]);
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

    //部门列表
    departmentGrid = new dhtmlXGridObject('departmentGrid');
    departmentGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    departmentGrid.setSkin("dhx_skyblue");
    departmentGrid.setHeader("选择,,部门名称");
    departmentGrid.setInitWidths("45,0,*");
    departmentGrid.setColAlign("center,left,left");
    departmentGrid.setColTypes("ch,ro,ro");
    departmentGrid.attachEvent("onRowSelect", departmentRowSelect);
    //单击选中取消
    departmentGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshDepartmentToolBarState();
        refreshRemoveDepartmentUserToolBarState();
        return true;
    });
    departmentGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        for (var i = 0; i < departmentDataList.rows.length; i++) {
            if (departmentDataList.rows[i].id.toString() === rowID.toString()) {
                $("#departmentID").val(departmentDataList.rows[i].data[1]);
                $("#txtdepartmentName").val(departmentDataList.rows[i].data[2]);
                departmentEditState = "modify";
                $("#departmentFormTitle").text("编辑部门");
                showDepartmentForm();
                break;
            }
        }
    });
    departmentGrid.init();

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
                refreshRemoveDepartmentUserToolBarState();
                break;
            case "remove":
                var checked = userGrid.getCheckedRows(0);
                var rowids = checked.split(',');
                for (var i = 0; i < rowids.length; i++) {
                    //循环处理选中的项
                    var sqlStr = "delete from UserDepartment where UserID = " + rowids[i] + " and DepartmentID = " + selectDepartmentID;
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
        refreshRemoveDepartmentUserToolBarState();
        return true;
    });
    userGrid.init();

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

    //autocomplete快速搜索处理
    $("#userName").keyup(function () {
        autoComplete($("#userName").val());
    });

    function autoComplete(userNameKeys) {
        var InfoArray = new Array();
        ISystemService.execQuery.sqlString = "SELECT [UserID],[UserName],[TrueName] FROM [User] where UserName like '%" + userNameKeys + "%' and UserID not in (SELECT [UserID] FROM [UserDepartment] where DepartmentID=" + departmentGrid.getSelectedRowId() + ")";
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

    //部门窗口操作
    departmentForm = $("#departmentForm");
    departmentForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                departmentForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    departmentForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hidedepartmentForm();
    function hidedepartmentForm() {
        departmentForm.css({ top: 200, left: -1300 }).hide();
        departmentForm.css("visibility", "visible");
    }
    function showDepartmentForm() {
        departmentForm.css({ top: 100, left: 180 }).show();
    }

    //保存
    $("#department_Save").click(function () {
        var department = null;
        var isSameNameExist = false;
        if (departmentEditState == "add") {
            department = DepartmentClass.createInstance();
        }
        else {
            ISystemService.getDynObjectByID.dynObjectID = $("#departmentID").val();
            ISystemService.getDynObjectByID.structName = "Department";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    department = e;
                }(ISystemService.getDynObjectByID.resultValue));
            }
            else {
                return;
            }
        }
        var departmentName = $("#txtdepartmentName").val();
        if (departmentName == '') {
            alert('部门名称不能为空!');
            return false;
        }
        if (departmentEditState == "add") {
            //根据用户名获取用户ID
            var referSql = "select [DepartmentID] from [Department] where DepartmentName='" + departmentName + "'";
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
            var referSql = "select [DepartmentID] from [Department] where DepartmentName='" + departmentName + "'";
            ISystemService.execQuery.sqlString = referSql;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    if (e != null) {
                        var rows = e.rows;
                        var rowLength = rows.length;
                        if (rowLength > 0) {
                            var rowResult = rows[0].values;
                            if (rowResult[0].value != $("#departmentID").val()) {
                                isSameNameExist = true;
                            }
                        }
                    }
                }(ISystemService.execQuery.resultValue));
            }
        }
        if (isSameNameExist) {
            alert("部门名称不能重复，请检查！");
            return;
        }
        department.departmentID = $("#departmentID").val();
        department.departmentName = departmentName;

        if (departmentEditState == "add") {
            ISystemService.addDynObject.dynObject = department;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    //更新部门列表
                    var dictData = new rock.JsonData(department.departmentID);
                    dictData.data.push(0);
                    dictData.data.push(department.departmentID);
                    dictData.data.push(department.departmentName);
                    departmentDataList.rows.push(dictData);
                    departmentGrid.clearAll();
                    departmentGrid.parse(departmentDataList, "json");
                    hidedepartmentForm();
                    alert("添加部门成功！");
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = department;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < departmentDataList.rows.length; i++) {
                        if (departmentDataList.rows[i].id.toString() == department.departmentID) {
                            departmentDataList.rows[i].data[0] = 0;
                            departmentDataList.rows[i].data[1] = department.departmentID;
                            departmentDataList.rows[i].data[2] = department.departmentName;
                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            departmentGrid.clearAll();
            departmentGrid.parse(departmentDataList, "json");
            hidedepartmentForm();
        }
    });
    //取消
    $("#department_Cancle").click(function () {
        hidedepartmentForm();
    });
    //关闭
    $("#department_Close").click(function () {
        hidedepartmentForm();
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
            var userDepartment = UserDepartmentClass.createInstance();
            userDepartment.userID = rowids[i];
            userDepartment.departmentID = selectDepartmentID;

            ISystemService.addDynObject.dynObject = userDepartment;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);

            if (ISystemService.addDynObject.success) {
                (function (e) {
                    for (var k = 0; k < userWaitDataList.rows.length; k++) {
                        if (userWaitDataList.rows[k].id == rowids[i]) {
                            userDataList.rows.push(userWaitDataList.rows[k]);
                            userWaitDataList.rows.splice(k, 1);
                            userWaitGrid.deleteRow(rowids[i]);
                            break;
                        }
                    }
                }(ISystemService.addDynObject.resultValue));
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
    //部门列表选中事件
    function departmentRowSelect(rowId, cellIndex) {
        selectDepartmentID = rowId;
        ISystemService.execQuery.sqlString = "SELECT a.[UserID],a.[UserName],a.[TrueName] FROM [User] a inner join [UserDepartment] b on(b.DepartmentID=" + rowId + " and a.UserID=b.UserID)";
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

        refreshRemoveDepartmentUserToolBarState();
    }

    //部门管理工具栏按钮状态控制
    function refreshDepartmentToolBarState() {
        var checked = departmentGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            departmentToolBar.disableItem("modify");
            departmentToolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                departmentToolBar.disableItem("modify");
            }
            else {
                departmentToolBar.enableItem("modify");
            }
            departmentToolBar.enableItem("delete");
        }
    }

    //部门用户关联工具栏按钮状态控制
    function refreshRoleUserToolBarState() {
        var checked = userWaitGrid.getCheckedRows(0);
        var rowids = checked.split(',');

        if (checked == "") {
            $("#user_Save").attr("disabled", true);
        }
        else {
            $("#user_Save").removeAttr("disabled");
        }
    }
    //部门用户移除关联功能工具栏按钮状态控制
    function refreshRemoveDepartmentUserToolBarState() {
        if (selectDepartmentID) {
            userToolBar.enableItem("add");
        }
        else {
            userToolBar.disableItem("add");
        }

        var checked = userGrid.getCheckedRows(0);
        var rowids = checked.split(',');

        if (checked == "") {
            userToolBar.disableItem("remove");
        }
        else {
            userToolBar.enableItem("remove");
        }
    }
})