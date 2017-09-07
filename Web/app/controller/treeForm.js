$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, treeDataList, sqlStr,
          treeForm = null,
      treeDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,TreeForm,FormItem,DataGrid,GridColumn,IUIDesignService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //加载树表单列表
        sqlStr = "SELECT top 100 [TreeFormID],[TreeFormName],[ModelType],[ReferTypes],[ColumnCount],[Comment] FROM [TreeForm]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, treeDataList);
            }(ISystemService.execQuery.resultValue));
        }
        TreeFormClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/");
    toolBar.addText("树页面名称", null, "树页面名称");
    toolBar.addInput("txtTreeFormSearch", null, "", 100);
    toolBar.addButton("query", null, "查询");
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("4", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("5", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.addSeparator("6", null);
    toolBar.addButton("formdesigner", null, "树模型设计");

    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                if (toolBar.getValue("txtTreeFormSearch") != "") {
                    sqlStr = " SELECT [TreeFormID],[TreeFormName],[ModelType],[ReferTypes],[ColumnCount],[Comment] FROM [TreeForm] where TreeFormName like '%" + toolBar.getValue("txtTreeFormSearch") + "%'";
                }
                else {
                    sqlStr = "SELECT top 100 [TreeFormID],[TreeFormName],[ModelType],[ReferTypes],[ColumnCount],[Comment] FROM [TreeForm]";
                }

                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, treeDataList)
                    }(ISystemService.execQuery.resultValue));
                }
                break;
            case "add":
                editState = "add";
                $("#formTitle").text("添加树页面");
                $("#txttreeFormName").val("");
                $("#txtmodelType").val("");
                $("#txtmodelTypeName").val("");
                $("#txtreferTypes").val("");
                $("#txtcolumnCount").val("");
                $("#txtcomment").val("");
                treeForm = null;
                showEditForm();
                break;
            case "modify":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var treeDataID = listGrid.cells(checked, 1).getValue();
                        IUIDesignService.getTreeFormByID.treeFormID = treeDataID;
                        rock.AjaxRequest(IUIDesignService.getTreeFormByID, rock.exceptionFun);
                        if (IUIDesignService.getTreeFormByID.success) {
                            (function (e) {
                                treeForm = e;
                            }(IUIDesignService.getTreeFormByID.resultValue));
                        }
                        else {
                            return;
                        }
                        $("#txttreeFormName").val(treeForm.treeFormName);
                        $("#txtmodelType").val(treeForm.modelType);
                        $("#txtmodelTypeName").val(treeForm.modelTypeName);
                        $("#txtreferTypes").val(treeForm.referTypes);
                        $("#txtcolumnCount").val(treeForm.columnCount);
                        $("#txtcomment").val(treeForm.comment);
                        editState = "modify";
                        $("#formTitle").text("编辑树页面");
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
                        ISystemService.deleteDynObjectByID.structName = "TreeForm";
                        rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                        if (ISystemService.deleteDynObjectByID.success) {
                            (function (e) {
                                for (var j = 0; j < treeDataList.rows.length; j++) {
                                    if (treeDataList.rows[j].id == rowids[i]) {
                                        treeDataList.rows.splice(j, 1);
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
            case "formdesigner":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        window.open("TreeFormDesigner.html?model=" + listGrid.cells(checked, 3).getValue() + "&id=" + listGrid.cells(checked, 1).getValue(), "DictPageModelDesigner", "'fullscreen=yes ,top=20,left=30,toolBar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no"); //第二个参数:window1表示新打开的窗体name是window1,如果多次用这个名称打开多个窗体,则最终只会打开一个窗体,保留最后一个窗体的url
                    }
                    else {
                        alert("请仅选择一条要修改的行!");
                    }
                }
                else {
                    alert("请选择要修改的行!");
                }
                break
        }
    });

    //初始化物料列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,树页面名称,类型名称,相关参照名称,编辑窗列数,备注");
    listGrid.setInitWidths("45,0,200,100,100,150,*");
    listGrid.setColAlign("center,left,left,left,left,left,left");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro");
    listGrid.setColSorting("na,na,str,str,str,str,str");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        IUIDesignService.getTreeFormByID.treeFormID = rowID;
        rock.AjaxRequest(IUIDesignService.getTreeFormByID, rock.exceptionFun);
        if (IUIDesignService.getTreeFormByID.success) {
            (function (e) {
                treeForm = e;
            }(IUIDesignService.getTreeFormByID.resultValue));
        }
        else {
            return;
        }
        $("#txttreeFormName").val(treeForm.treeFormName);
        $("#txtmodelType").val(treeForm.modelType);
        $("#txtmodelTypeName").val(treeForm.modelTypeName);
        $("#txtreferTypes").val(treeForm.referTypes);
        $("#txtcolumnCount").val(treeForm.columnCount);
        $("#txtcomment").val(treeForm.comment);
        editState = "modify";
        $("#formTitle").text("编辑树页面");
        showEditForm();
    });
    //单击选中取消
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");
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

    //保存
    $("#btn_Save").click(function () {
        if (treeForm == null) {
            treeForm = TreeFormClass.createInstance();
            ISystemService.getNextID.typeName = 'TreeForm';
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    treeForm.treeFormID = e.value;
                    treeForm.itemType = "TreeForm";
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!treeForm.ValidateValue()) {
            return false;
        }

        if (parseInt($("#txtcolumnCount").val(), 10) > 2) {
            alert("目前编辑窗列数不支持大于2!");
            return false;
        }

        treeForm.treeFormName = $("#txttreeFormName").val();
        treeForm.modelType = $("#txtmodelType").val();
        treeForm.modelTypeName = $("#txtmodelTypeName").val();
        treeForm.columnCount = $("#txtcolumnCount").val();
        if ($.trim($("#txtreferTypes").val()) != '') {
            treeForm.referTypes = $("#txtreferTypes").val();
        }
        else {
            treeForm.referTypes = null;
        }
        if ($.trim($("#txtcomment").val()) != '') {
            treeForm.comment = $("#txtcomment").val();
        }
        else {
            treeForm.comment = null;
        }       

        treeForm.formItems = new rock.RockList();

        //数据列表表格
        var dataGrid = DataGridClass.createInstance();
        dataGrid.dataGridID = 1;
        dataGrid.dataGridName = "数据列表项";
        dataGrid.gridColumns = new rock.RockList();
        treeForm.dataGrid = dataGrid;

        if (editState == "add") {
            IUIDesignService.addTreeForm.treeForm = treeForm;
            rock.AjaxRequest(IUIDesignService.addTreeForm, rock.exceptionFun);
            if (IUIDesignService.addTreeForm.success) {
                (function (e) {
                    var treeData = new rock.JsonData(treeForm.treeFormID);
                    treeData.data.push(0);
                    treeData.data.push(treeForm.treeFormID);
                    treeData.data.push(treeForm.treeFormName);
                    treeData.data.push(treeForm.modelType);
                    treeData.data.push(treeForm.referTypes);
                    treeData.data.push(treeForm.columnCount);
                    treeData.data.push(treeForm.comment);

                    treeDataList.rows.push(treeData);
                    listGrid.clearAll();
                    listGrid.parse(treeDataList, "json");
                    hideEditForm();
                }(IUIDesignService.addTreeForm.resultValue));
            }
        }
        else {
            IUIDesignService.modifyTreeForm.treeForm = treeForm;
            rock.AjaxRequest(IUIDesignService.modifyTreeForm, rock.exceptionFun);
            if (IUIDesignService.modifyTreeForm.success) {
                (function (e) {
                    for (var i = 0; i < treeDataList.rows.length; i++) {
                        if (treeDataList.rows[i].id.toString() == treeForm.treeFormID) {
                            treeDataList.rows[i].data[0] = 0;
                            treeDataList.rows[i].data[2] = treeForm.treeFormName;
                            treeDataList.rows[i].data[3] = treeForm.modelType;
                            treeDataList.rows[i].data[4] = treeForm.referTypes;
                            treeDataList.rows[i].data[5] = treeForm.columnCount;
                            treeDataList.rows[i].data[6] = treeForm.comment;
                        }
                    }
                }(IUIDesignService.modifyTreeForm.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(treeDataList, "json");
            hideEditForm();
            alert("树页面模型修改成功!");
        }
        refreshToolBarState();
    });

    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("modify");
            toolBar.disableItem("delete");
            toolBar.disableItem("formdesigner");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("modify");
                toolBar.disableItem("formdesigner");
            }
            else {
                toolBar.enableItem("modify");
                toolBar.enableItem("formdesigner");
            }
            toolBar.enableItem("delete");
        }
    }
})