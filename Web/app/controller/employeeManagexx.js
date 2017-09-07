$(function () {
    //初始化系统通用变量
    var dhxLayout, departmentForm, employeeForm, editState, departmentToolBar, employee, departmentGrid, userToolBar, userGrid, selectDepartmentID,
            departmentUserLayout,
            departmentDataList = new rock.JsonList(),
            userDataList = new rock.JsonList(),
            userWaitDataList = new rock.JsonList();
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Department,UserDepartment,Employee";
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

    //部门列表
    departmentGrid = new dhtmlXGridObject('departmentGrid');
    departmentGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    departmentGrid.setSkin("dhx_skyblue");
    departmentGrid.setHeader("选择,,部门名称");
    departmentGrid.setInitWidths("45,0,*");
    departmentGrid.setColAlign("center,left,left");
    departmentGrid.setColTypes("cntr,ro,ro");
    departmentGrid.attachEvent("onRowSelect", departmentRowSelect);
    //单击选中取消
    departmentGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshRemoveDepartmentUserToolBarState();
        return true;
    });
    departmentGrid.init();

    //初始化用户列表工具栏
    userToolBar = new dhtmlXToolbarObject("userToolBar");
    userToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    userToolBar.setSkin("dhx_skyblue");
    userToolBar.addButton("add", 0, "添加", "add.png", "addDisabled.png");
    userToolBar.addButton("modify", 1, "修改", "edit.png", "editDisabled.png");
    userToolBar.addButton("remove", 2, "移除", "delete.png", "deleteDisabled.png");
    userToolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "add":
                editState = "add";
                employee = EmployeeClass.createInstance();
                ISystemService.getNextID.typeName = 'Employee';
                rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                if (ISystemService.getNextID.success) {
                    (function (e) {
                        employee.employeeID = e.value;
                    }(ISystemService.getNextID.resultValue))
                }
                $("#txtEmployeeName").val("");
                showUserForm();
                refreshRemoveDepartmentUserToolBarState();
                break;
            case "modify":
                editState = "modify";
                ISystemService.getDynObjectByID.dynObjectID = userGrid.getCheckedRows(0);
                ISystemService.getDynObjectByID.structName = "Employee";
                rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                if (ISystemService.getDynObjectByID.success) {
                    (function (e) {
                        employee = e;
                    }(ISystemService.getDynObjectByID.resultValue));
                }
                $("#txtEmployeeName").val(employee.employeeName);
                showUserForm();
                refreshRemoveDepartmentUserToolBarState();
                break;
            case "remove":
                var checked = userGrid.getCheckedRows(0);
                var rowids = checked.split(',');
                for (var i = 0; i < rowids.length; i++) {
                    //循环处理选中的项
                    ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                    ISystemService.deleteDynObjectByID.structName = "Employee";
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
                departmentRowSelect(selectDepartmentID);

                break;
        }
    });

    //用户列表
    userGrid = new dhtmlXGridObject('userGrid');
    userGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    userGrid.setSkin("dhx_skyblue");
    userGrid.setHeader("选择,,用户姓名");
    userGrid.setInitWidths("45,0,*");
    userGrid.setColAlign("center,left,left");
    userGrid.setColTypes("ch,ro,ro");
    //单击选中取消
    userGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshRemoveDepartmentUserToolBarState();
        return true;
    });
    userGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "Employee";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                employee = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        $("#txtEmployeeName").val(employee.employeeName);
        showUserForm();
        refreshRemoveDepartmentUserToolBarState();
    });
    userGrid.init();

    //用户窗口操作
    employeeForm = $("#employeeForm");
    employeeForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                employeeForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    employeeForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideUserForm();
    function hideUserForm() {
        employeeForm.css({ top: 200, left: -1300 }).hide();
        employeeForm.css("visibility", "visible");
    }
    function showUserForm() {
        employeeForm.css({ top: 50, left: 180 }).show();
    }
    //保存
    $("#employee_Save").click(function () {
        var isSameNameExist = false;

        if (editState == "add") {
            //根据用户名获取用户ID
            var referSql = "select [EmployeeID] from [Employee] where EmployeeName='" + $("#txtEmployeeName").val() + "' and DepartmentID = " + selectDepartmentID;
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
            var referSql = "select [DepartmentID] from [Department] where DepartmentName='" + $("#txtEmployeeName").val() + "' and DepartmentID = " + selectDepartmentID;
            ISystemService.execQuery.sqlString = referSql;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    if (e != null) {
                        var rows = e.rows;
                        var rowLength = rows.length;
                        if (rowLength > 0) {
                            var rowResult = rows[0].values;
                            if (rowResult[0].value != employee.employeeID) {
                                isSameNameExist = true;
                            }
                        }
                    }
                }(ISystemService.execQuery.resultValue));
            }
        }
        if (isSameNameExist) {
            alert("同一部门下员工姓名不能重复，请检查！");
            return;
        }
        employee.departmentID = selectDepartmentID;
        employee.employeeName = $("#txtEmployeeName").val();
        if (editState == "add") {
            ISystemService.addDynObject.dynObject = employee;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    departmentRowSelect(selectDepartmentID);
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = employee;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    departmentRowSelect(selectDepartmentID);
                }(ISystemService.modifyDynObject.resultValue));
            }
        }
        hideUserForm();
    });
    //取消
    $("#employee_Cancle").click(function () {
        hideUserForm();
    });
    //关闭
    $("#employee_Close").click(function () {
        hideUserForm();
    });
    //部门列表选中事件
    function departmentRowSelect(rowId, cellIndex) {
        selectDepartmentID = rowId;
        ISystemService.execQuery.sqlString = "SELECT a.[EmployeeID],a.[EmployeeName] FROM [Employee] a inner join [Department] b on(b.DepartmentID=a.DepartmentID) where a.DepartmentID=" + rowId;
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
                    userDataList.rows.push(listdata);
                }
                userGrid.parse(userDataList, "json");
            }(ISystemService.execQuery.resultValue));
        }
        refreshRemoveDepartmentUserToolBarState();
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
        if (checked != "" && rowids.length == 1) {
            userToolBar.enableItem("modify");
        }
        else {
            userToolBar.disableItem("modify");
        }
    }
})