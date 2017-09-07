
$(function () {
    //初始化系统通用变量
    var dhxLayout, masterForm, slaveForm, masterEditState, masterToolBar, masterGrid, slaveToolBar, slaveGrid, slaveWaitGrid, selectedMasterID, serverDate, sqlStr,
	department = null,
	masterEditItem = $("#masterEditItem"),
	slaveSearchKeyItem = $("#slaveSearchKeyItem"),
	masterDataList = new rock.JsonList(),
	slaveDataList = new rock.JsonList(),
	slaveWaitDataList = new rock.JsonList();
    $("#relationTitle").html("关联用户");
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,UserDepartment,Department,User";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //获取服务器当前日期
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
            }(ISystemService.getServerDate.resultValue));
        }

        //初始化主实体参照



        //初始化主实体通用参照




        //填充实体弹窗参照树


        //填充通用弹窗参照树



        //加载主实体数据

        sqlStr = "select [Department].[DepartmentID], [Department].[departmentName], [Department].[comment] from [Department] where 1=1  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, masterGrid, masterDataList);
            }(ISystemService.execQuery.resultValue));
        }

        //加载从实体等待数据

        sqlStr = "select [User].[UserID], [User].[userName], [User].[trueName] from [User] where 1=1  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, slaveWaitGrid, slaveWaitDataList);
            }(ISystemService.execQuery.resultValue));
        }

        //页面按钮状态处理
        refreshMasterToolBarState();
        refreshRemoveSlaveToolBarState();
    });

    //界面布局
    dhxLayout = new dhtmlXLayoutObject("mainbody", "2U");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("b").hideHeader();
    dhxLayout.cells("a").setWidth(420);
    dhxLayout.cells("a").attachObject("masterOperate");
    dhxLayout.cells("b").attachObject('slaveOperate');

    //初始化主实体工具栏
    masterToolBar = new dhtmlXToolbarObject("masterToolBar");
    masterToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    masterToolBar.setSkin("dhx_skyblue");
    masterToolBar.addButton("add", 0, "添加", "add.png", "addDisabled.png");
    masterToolBar.addButton("modify", 2, "修改", "edit.png", "editDisabled.png");
    masterToolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
    masterToolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "add":
                masterEditState = "add";
                $("#masterFormTitle").text("添加部门");


                $("#txtdepartmentName").val("");


                $("#txtcomment").val("");


                department = null;
                showMasterForm();
                break;
            case "modify":
                masterEditState = "modify";
                $("#masterFormTitle").text("编辑部门");
                var checked = masterGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
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


                        $("#txtdepartmentName").val(department.departmentName);


                        $("#txtcomment").val(department.comment);


                        showMasterForm();
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
                var checked = masterGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的部门吗?")) {
                    var rowids = checked.split(',');
                    //部门是否和用户存在关联，如果存在则不允许删除
                    var relationExist = false;
                    for (var i = 0; i < rowids.length; i++) {
                        sqlStr = "SELECT COUNT(*) FROM [UserDepartment] where DepartmentID =" + rowids[i];
                        ISystemService.execQuery.sqlString = sqlStr;
                        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                        if (ISystemService.execQuery.success) {
                            (function (e) {
                                if (e != null) {
                                    if (e.rows.length > 0) {
                                        relationExist = true;
                                    }
                                }
                            }(ISystemService.execQuery.resultValue));
                        }
                        if (relationExist) {
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
                                for (var k = 0; k < masterDataList.rows.length; k++) {
                                    if (masterDataList.rows[k].id == rowids[i]) {
                                        masterDataList.rows.splice(k, 1);
                                        masterGrid.deleteRow(rowids[i]);
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

    //主实体列表
    masterGrid = new dhtmlXGridObject('masterGrid');
    masterGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    masterGrid.setSkin("dhx_skyblue");

    masterGrid.setHeader("选择,,部门名称,备注");
    masterGrid.setInitWidths("40,0,100,*");
    masterGrid.setColAlign("center,left,left,left");
    masterGrid.setColSorting("na,na,str,str");
    masterGrid.setColTypes("ch,ro,ro,ro");
    masterGrid.enableDistributedParsing(true, 20);
    masterGrid.attachEvent("onRowSelect", masterRowSelect);
    //单击选中取消
    masterGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshMasterToolBarState();
        refreshRemoveSlaveToolBarState();
        return true;
    });
    masterGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        masterEditState = "modify";
        $("#masterFormTitle").text("编辑部门");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
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

        $("#txtdepartmentName").val(department.departmentName);

        showMasterForm();

    });
    masterGrid.init();

    //初始化从实体工具栏
    slaveToolBar = new dhtmlXToolbarObject("slaveToolBar");
    slaveToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    slaveToolBar.setSkin("dhx_skyblue");
    slaveToolBar.addButton("add", 0, "添加", "add.png", "addDisabled.png");
    slaveToolBar.addButton("remove", 2, "移除", "delete.png", "deleteDisabled.png");
    slaveToolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "add":
                $("#userName").val("");
                showSlaveForm();
                refreshRemoveSlaveToolBarState();
                break;
            case "remove":
                var checked = slaveGrid.getCheckedRows(0);
                var rowids = checked.split(',');
                for (var i = 0; i < rowids.length; i++) {
                    //循环处理选中的项
                    var sqlStr = "delete from [UserDepartment] where [UserID] = " + rowids[i] + " and [DepartmentID] = " + selectedMasterID;
                    ISystemService.excuteNoneReturnQuery.sqlString = sqlStr;
                    rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);
                    if (ISystemService.excuteNoneReturnQuery.success) {
                        (function (e) {
                            for (var k = 0; k < slaveDataList.rows.length; k++) {
                                if (slaveDataList.rows[k].id == rowids[i]) {
                                    slaveDataList.rows.splice(k, 1);
                                    slaveGrid.deleteRow(rowids[i]);
                                    break;
                                }
                            }
                        }(ISystemService.excuteNoneReturnQuery.resultValue));
                    }
                }
                break;
        }
    });

    //从实体列表
    slaveGrid = new dhtmlXGridObject('slaveGrid');
    slaveGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    slaveGrid.setSkin("dhx_skyblue");

    slaveGrid.setHeader("选择,,用户名,显示名");
    slaveGrid.setInitWidths("40,0,50,*");
    slaveGrid.setColAlign("center,left,left,left");
    slaveGrid.setColSorting("na,na,str,str");
    slaveGrid.setColTypes("ch,ro,ro,ro");
    slaveGrid.enableDistributedParsing(true, 20);
    //单击选中取消
    slaveGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshRemoveSlaveToolBarState();
        return true;
    });
    slaveGrid.init();


    //待关联从实体列表
    slaveWaitGrid = new dhtmlXGridObject('slaveWaitGrid');
    slaveWaitGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    slaveWaitGrid.setSkin("dhx_skyblue");

    slaveWaitGrid.setHeader("选择,,用户名,显示名");
    slaveWaitGrid.setInitWidths("40,0,50,*");
    slaveWaitGrid.setColAlign("center,left,left,left");
    slaveWaitGrid.setColSorting("na,na,str,str");
    slaveWaitGrid.setColTypes("ch,ro,ro,ro");
    slaveWaitGrid.enableDistributedParsing(true, 20);
    slaveWaitGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshRelationToolBarState();
        return true;
    });
    slaveWaitGrid.init();

    //主实体窗口操作
    masterForm = $("#masterForm");

    masterForm.height(175);
    masterForm.width(450);
    masterForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                masterForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    masterForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hidemasterForm();
    function hidemasterForm() {
        masterForm.css({ top: 200, left: -1300 }).hide();
        masterForm.css("visibility", "visible");
    }
    function showMasterForm() {
        masterForm.css({ top: 100, left: 180 }).show();
    }
    //取消
    $("#master_Cancle").click(function () {
        hidemasterForm();
    });
    //关闭
    $("#master_Close").click(function () {
        hidemasterForm();
    });

    //保存主实体
    $("#master_Save").click(function () {
        if (department == null) {
            department = DepartmentClass.createInstance();
            ISystemService.getNextID.typeName = "Department";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    department.departmentID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!department.ValidateValue()) {
            return;
        }


        if ($.trim($("#txtdepartmentName").val()) != '') {
            department.departmentName = $("#txtdepartmentName").val();
        }
        else {
            department.departmentName = null;
        }


        if ($.trim($("#txtcomment").val()) != '') {
            department.comment = $("#txtcomment").val();
        }
        else {
            department.comment = null;
        }


        if (masterEditState == "add") {
            ISystemService.addDynObject.dynObject = department;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(department.departmentID);
                    dictData.data.push(0);
                    dictData.data.push(department.departmentID);

                    dictData.data.push($("#txtdepartmentName").val());

                    dictData.data.push($("#txtcomment").val());

                    masterDataList.rows.push(dictData);
                    masterGrid.clearAll();
                    masterGrid.parse(masterDataList, "json");
                    hidemasterForm();
                    alert("添加部门成功！");
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = department;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < masterDataList.rows.length; i++) {
                        if (masterDataList.rows[i].id == department.departmentID) {
                            masterDataList.rows[i].data[0] = 0;

                            masterDataList.rows[i].data[2] = $("#txtdepartmentName").val();

                            masterDataList.rows[i].data[3] = $("#txtcomment").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            masterGrid.clearAll();
            masterGrid.parse(masterDataList, "json");
            hideEditForm();
            alert("部门修改成功!");
        }
    });

    //从实体窗口操作
    slaveForm = $("#slaveForm");
    slaveForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                slaveForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    slaveForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideSlaveForm();
    function hideSlaveForm() {
        slaveForm.css({ top: 200, left: -1300 }).hide();
        slaveForm.css("visibility", "visible");
    }
    function showSlaveForm() {
        slaveForm.css({ top: 50, left: 180 }).show();
    }
    //取消
    $("#slave_Cancle").click(function () {
        hideSlaveForm();
    });
    //关闭
    $("#slave_Close").click(function () {
        hideSlaveForm();
    });
    //保存实体关联
    $("#slave_Save").click(function () {
        var checked = slaveWaitGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        for (var i = 0; i < rowids.length; i++) {
            //循环处理选中的项
            var userDepartment = UserDepartmentClass.createInstance();
            userDepartment.userID = rowids[i];
            userDepartment.departmentID = selectedMasterID;

            ISystemService.addDynObject.dynObject = userDepartment;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);

            if (ISystemService.addDynObject.success) {
                (function (e) {
                    for (var k = 0; k < slaveWaitDataList.rows.length; k++) {
                        if (slaveWaitDataList.rows[k].id == rowids[i]) {
                            slaveDataList.rows.push(slaveWaitDataList.rows[k]);
                            slaveWaitDataList.rows.splice(k, 1);
                            slaveWaitGrid.deleteRow(rowids[i]);
                            break;
                        }
                    }
                }(ISystemService.addDynObject.resultValue));
            }
        }
        slaveGrid.clearAll();
        slaveGrid.parse(slaveDataList, "json");
        hideSlaveForm();
    });
    //处理主实体编辑项

    tableString = '<table style="width: 98%"><tr> <td class="label">部门名称</td><td class="inputtd"><input id="txtdepartmentName" class="smallInput" type="text" /></td></tr><tr> <td class="label">备注</td><td class="inputtd"><input id="txtcomment" class="smallInput" type="text" /></td></tr></table>';
    slaveSearchKeyTableString = '<table style="width: 100%"><tr><td class="label">用户名称</td><td class="inputtd"><input id="txtuserName" class="smallInput" type="text" /></td></tr></table>';
    masterEditItem.html(tableString);
    slaveSearchKeyItem.html(slaveSearchKeyTableString);

    //主实体列表选中事件
    function masterRowSelect(rowId, cellIndex) {
        selectedMasterID = rowId;

        ISystemService.execQuery.sqlString = "select [User].[UserID], [User].[userName], [User].[trueName] from [User] join [UserDepartment] on [UserDepartment].[UserID] = [User].[UserID] and [UserDepartment].[DepartmentID] = " + rowId;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, slaveGrid, slaveDataList);
            }(ISystemService.execQuery.resultValue));
        }
        refreshRemoveSlaveToolBarState();
    }

    //从实体autocomplete快速搜索处理
    $("#txtuserName").keyup(function () {
        autoComplete($("#txtuserName").val());
    });

    function autoComplete(slaveNameKeys) {
        ISystemService.execQuery.sqlString = "select top 20 [User].[UserID], [User].[userName], [User].[trueName] from [User] WHERE [User].[UserName] like '%" + $("#txtuserName").val() + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, slaveWaitGrid, slaveWaitDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }

    //主实体管理工具栏按钮状态控制
    function refreshMasterToolBarState() {
        var checked = masterGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            masterToolBar.disableItem("modify");
            masterToolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                masterToolBar.disableItem("modify");
            }
            else {
                masterToolBar.enableItem("modify");
            }
            masterToolBar.enableItem("delete");
        }
    }
    //关联工具栏按钮状态控制
    function refreshRelationToolBarState() {
        var checked = slaveWaitGrid.getCheckedRows(0);
        var rowids = checked.split(',');

        if (checked == "") {
            $("#slave_Save").attr("disabled", true);
        }
        else {
            $("#slave_Save").removeAttr("disabled");
        }
    }

    //移除关联功能工具栏按钮状态控制
    function refreshRemoveSlaveToolBarState() {
        if (selectedMasterID) {
            slaveToolBar.enableItem("add");
        }
        else {
            slaveToolBar.disableItem("add");
        }

        var checked = slaveGrid.getCheckedRows(0);
        var rowids = checked.split(',');

        if (checked == "") {
            slaveToolBar.disableItem("remove");
        }
        else {
            slaveToolBar.enableItem("remove");
        }
    }


    //初始化实体弹窗树

    //初始化通用参照弹窗树

    //表单快查弹窗


    //处理点击显示关闭弹窗事件
    $('#mainbody').mousedown(function (e) {

    });


})