
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      employee = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Employee,Department";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [Employee].[EmployeeID], [Employee].[employeeName], [Department].[DepartmentName] from [Employee] join [Department] on [Employee].[departmentID] = [Department].[departmentID]  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项



        $("#combodepartment").empty();
        sqlStr = "SELECT [DepartmentID],[DepartmentName] FROM [Department] order by DepartmentName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {


                toolBar.addListOption("combodepartmentSearch", "所属部门", 1, "button", "所属部门")


                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combodepartment").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")


                        toolBar.addListOption("combodepartmentSearch", rowResult[0].value, i + 2, "button", rowResult[1].value)


                    }
                }
            }(ISystemService.execQuery.resultValue));
        }


        //初始化通用参照










        //绑定控件失去焦点验证方法
        //EmployeeClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("employeeName", null, "员工名称");
    toolBar.addInput("txtemployeeNameSearch", null, "", 100);


    toolBar.addButtonSelect("combodepartmentSearch", null, "所属部门", [], null, null, true, true, 15, "select")


    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("sepModify", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.addButton("jiami", null, "加密");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":

                sqlStr = "select [Employee].[EmployeeID], [Employee].[employeeName], [Department].[DepartmentName] from [Employee] join [Department] on [Employee].[departmentID] = [Department].[departmentID] ";

                if (toolBar.getValue("txtemployeeNameSearch") != "") {
                    sqlStr += " and [Employee].[employeeName] like '%" + toolBar.getValue("txtemployeeNameSearch") + "%'";
                }

                if (toolBar.getItemText("combodepartmentSearch") != "所属部门") {
                    sqlStr += " and [Department].[DepartmentName] = '" + toolBar.getItemText("combodepartmentSearch") + "'";
                }

                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList)
                    }(ISystemService.execQuery.resultValue));
                }
                break;
            case "add":
                editState = "add";
                $("#formTitle").text("添加员工");

                $("#txtemployeeName").val("");

                $("#combodepartment").get(0).selectedIndex = 0;

                employee = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑员工");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "Employee";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                employee = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        $("#txtemployeeName").val(employee.employeeName);

                        rock.setSelectItem("combodepartment", employee.departmentID, "value");

                        showEditForm();
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
                var checked = listGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的记录吗?")) {
                    var rowids = checked.split(',');
                    for (var i = 0; i < rowids.length; i++) {
                        ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                        ISystemService.deleteDynObjectByID.structName = "Employee";
                        rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                        if (ISystemService.deleteDynObjectByID.success) {
                            (function (e) {
                                for (var j = 0; j < dictDataList.rows.length; j++) {
                                    if (dictDataList.rows[j].id == rowids[i]) {
                                        dictDataList.rows.splice(j, 1);
                                        listGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(ISystemService.deleteDynObjectByID.resultValue));
                        }
                    }
                    refreshToolBarState();
                }
                break;
            case "jiami":
                ISystemService.execQuery.sqlString = "select [UserID], [Password] from [User]";
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (table) {
                        if (table != null) {
                            dictDataList.rows = [];
                            var rows = table.rows;
                            var colLength = table.columns.length;
                            var rowLength = rows.length;
                            for (var i = 0; i < rowLength; i++) {
                                var rowResult = rows[i].values;
                                var listdata = new rock.JsonData(rowResult[0].value);
                                listdata.data[0] = 0;
                                listdata.data[1] = rowResult[0].value;
                                listdata.data[2] = hex_md5(rowResult[1].value).toUpperCase();
                                dictDataList.rows.push(listdata);
                            }
                            listGrid.parse(dictDataList, "json");
                        }

                    }(ISystemService.execQuery.resultValue));
                }

                for (var j = 0; j < dictDataList.rows.length; j++) {
                    ISystemService.excuteNoneReturnQuery.sqlString = "update [User] set  [Password] = '" +  dictDataList.rows[j].data[2] + "' where [UserID] = " + dictDataList.rows[j].data[1];
                    rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);
                }
                break;

        }
    });




    //初始化员工列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,员工姓名,所属部门");
    listGrid.setInitWidths("40,0,100,*");
    listGrid.setColAlign("center,left,left,left");
    listGrid.setColSorting("na,na,str,str");
    listGrid.setColTypes("ch,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑员工");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "Employee";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                employee = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtemployeeName").val(employee.employeeName);


        rock.setSelectItem("combodepartment", employee.departmentID, "value");


        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(175);
    editForm.width(450);
    editForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;

        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                editForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    editForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideEditForm();
    function hideEditForm() {
        editForm.css({ top: 200, left: -1300 }).hide();
        editForm.css("visibility", "visible");
    }
    function showEditForm() {
        editForm.css({ top: 100, left: 180 }).show();
    }
    //取消
    $("#btn_Cancle").click(function () {
        hideEditForm();
    });
    //关闭
    $("#img_Close").click(function () {
        hideEditForm();
    });

    //处理编辑项

    tableString = '<table style="width: 98%"><tr> <td class="label">员工名称</td><td class="inputtd"><input id="txtemployeeName" class="smallInput" type="text" /></td></tr><tr> <td class="label">所属部门</td><td class="inputtd"><select id="combodepartment" class="combo" /></td></tr></table>';
    editItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {
        if (employee == null) {
            employee = EmployeeClass.createInstance();
            ISystemService.getNextID.typeName = "Employee";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    employee.employeeID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!employee.ValidateValue()) {
            return;
        }

        if ($.trim($("#txtemployeeName").val()) != '') {
            employee.employeeName = $("#txtemployeeName").val();
        }
        else {
            employee.employeeName = null;
        }


        employee.departmentID = $("#combodepartment").val();


        if (editState == "add") {
            ISystemService.addDynObject.dynObject = employee;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(employee.employeeID);
                    dictData.data.push(0);
                    dictData.data.push(employee.employeeID);

                    dictData.data.push($("#txtemployeeName").val());

                    dictData.data.push($("#combodepartment").find("option:selected").text());

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = employee;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == employee.employeeID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtemployeeName").val();

                            dictDataList.rows[i].data[3] = $("#combodepartment").find("option:selected").text();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("员工修改成功!");
        }



        refreshToolBarState();
    });

    //加载弹窗Div









    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("modify");
            toolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("modify");
            }
            else {
                toolBar.enableItem("modify");
            }
            toolBar.enableItem("delete");
        }
    }

})