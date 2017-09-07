$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr,
          dictForm = null,
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,DictForm,QueryItem,FormItem,DataGrid,GridColumn,ToolBarButton,ToolBar,IUIDesignService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //加载字典表单列表
        sqlStr = "SELECT top 100 [DictFormID],[DictFormName],[ModelType],[ReferTypes],[ColumnCount],[Comment] FROM [DictForm]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        DictFormClass.validateBind();      
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/");
    toolBar.addText("字典页面名称", null, "字典页面名称");
    toolBar.addInput("txtDictFormSearch", null, "", 100);
    toolBar.addButton("query", null, "查询");
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("4", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("5", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.addSeparator("6", null);
    toolBar.addButton("formdesigner", null, "字典模型设计");

    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                if (toolBar.getValue("txtDictFormSearch") != "") {
                    sqlStr = " SELECT [DictFormID],[DictFormName],[ModelType],[ReferTypes],[ColumnCount],[Comment] FROM [DictForm] where DictFormName like '%" + toolBar.getValue("txtDictFormSearch") + "%'";
                }
                else {
                    sqlStr = "SELECT top 100 [DictFormID],[DictFormName],[ModelType],[ReferTypes],[ColumnCount],[Comment] FROM [DictForm]";
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
                $("#formTitle").text("添加字典页面");
                $("#txtdictFormName").val("");
                $("#txtmodelType").val("");
                $("#txtmodelTypeName").val("");
                $("#txtreferTypes").val("");
                $("#txtcolumnCount").val("");
                $("#txtcomment").val("");
                dictForm = null;
                showEditForm();
                break;
            case "modify":               
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        IUIDesignService.getDictFormByID.dictFormID = dictDataID;
                        rock.AjaxRequest(IUIDesignService.getDictFormByID, rock.exceptionFun);
                        if (IUIDesignService.getDictFormByID.success) {
                            (function (e) {
                                dictForm = e;
                            }(IUIDesignService.getDictFormByID.resultValue));
                        }
                        else {
                            return;
                        }
                        $("#txtdictFormName").val(dictForm.dictFormName);
                        $("#txtmodelType").val(dictForm.modelType);
                        $("#txtmodelTypeName").val(dictForm.modelTypeName);
                        $("#txtreferTypes").val(dictForm.referTypes);
                        $("#txtcolumnCount").val(dictForm.columnCount);
                        $("#txtcomment").val(dictForm.comment);
                        editState = "modify";
                        $("#formTitle").text("编辑字典页面");
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
                        ISystemService.deleteDynObjectByID.structName = "DictForm";
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
            case "formdesigner":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        window.open("DictFormDesigner.html?model=" + listGrid.cells(checked, 3).getValue() + "&id=" + listGrid.cells(checked, 1).getValue(), "DictPageModelDesigner", "'fullscreen=yes ,top=20,left=30,toolBar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no"); //第二个参数:window1表示新打开的窗体name是window1,如果多次用这个名称打开多个窗体,则最终只会打开一个窗体,保留最后一个窗体的url
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
    listGrid.setHeader("选择,,字典页面名称,类型名称,相关对象名称,编辑窗列数,备注");
    listGrid.setInitWidths("45,0,200,100,100,150,*");
    listGrid.setColAlign("center,left,left,left,left,left,left");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro");
    listGrid.setColSorting("na,na,str,str,str,str,str");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        IUIDesignService.getDictFormByID.dictFormID = rowID;
        rock.AjaxRequest(IUIDesignService.getDictFormByID, rock.exceptionFun);
        if (IUIDesignService.getDictFormByID.success) {
            (function (e) {
                dictForm = e;
            }(IUIDesignService.getDictFormByID.resultValue));
        }
        else {
            return;
        }
        $("#txtdictFormName").val(dictForm.dictFormName);
        $("#txtmodelType").val(dictForm.modelType);
        $("#txtmodelTypeName").val(dictForm.modelTypeName);
        $("#txtreferTypes").val(dictForm.referTypes);
        $("#txtcolumnCount").val(dictForm.columnCount);
        $("#txtcomment").val(dictForm.comment);
        editState = "modify";
        $("#formTitle").text("编辑字典页面");
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
        if (dictForm == null) {
            dictForm = DictFormClass.createInstance();
            ISystemService.getNextID.typeName = 'DictForm';
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    dictForm.dictFormID = e.value;
                    dictForm.itemType = "DictForm";
                }(ISystemService.getNextID.resultValue))
            }
        } 
        if (!dictForm.ValidateValue()) {
            return false;
        }       
     
        if (parseInt($("#txtcolumnCount").val(), 10) > 2) {
            alert("目前编辑窗列数不支持大于2!");
            return false;
        }

        dictForm.dictFormName = $("#txtdictFormName").val();
        dictForm.modelType = $("#txtmodelType").val();
        dictForm.modelTypeName = $("#txtmodelTypeName").val();
        dictForm.columnCount = $("#txtcolumnCount").val();        
        if ($.trim($("#txtreferTypes").val()) != '') {
            dictForm.referTypes = $("#txtreferTypes").val();
        }
        else {
            dictForm.referTypes = null;
        }
        if ($.trim($("#txtcomment").val()) != '') {
            dictForm.comment = $("#txtcomment").val();
        }
        else {
            dictForm.comment = null;
        }

        //添加工具条
        var toolBar = ToolBarClass.createInstance();
        toolBar.toolBarID = 1;
        toolBar.toolBarName = "工具条";
        toolBar.itemType = "ToolBar";
        dictForm.toolBar = toolBar;
        dictForm.toolBar.toolBarButtons = new rock.RockList();
        //添加新增按钮
        var toolBarButtonAdd = ToolBarButtonClass.createInstance();
        toolBarButtonAdd.toolBarButtonID = 1;
        toolBarButtonAdd.toolBarButtonName = "add";
        toolBarButtonAdd.toolBarButtonDisplayName = "新增";
        toolBarButtonAdd.itemType = "ToolBarButton";
        dictForm.toolBar.toolBarButtons.add(toolBarButtonAdd);
        //添加修改按钮
        var toolBarButtonModify = ToolBarButtonClass.createInstance();
        toolBarButtonModify.toolBarButtonID = 2;
        toolBarButtonModify.toolBarButtonName = "modify";
        toolBarButtonModify.toolBarButtonDisplayName = "修改";
        toolBarButtonModify.itemType = "ToolBarButton";
        dictForm.toolBar.toolBarButtons.add(toolBarButtonModify);
        //添加删除按钮
        var toolBarButtonModify = ToolBarButtonClass.createInstance();
        toolBarButtonModify.toolBarButtonID = 3;
        toolBarButtonModify.toolBarButtonName = "delete";
        toolBarButtonModify.toolBarButtonDisplayName = "删除";
        toolBarButtonModify.itemType = "ToolBarButton";
        dictForm.toolBar.toolBarButtons.add(toolBarButtonModify);

        //查询条件集合
        dictForm.queryItems = new rock.RockList();
        dictForm.formItems = new rock.RockList();

        //数据列表表格
        var dataGrid = DataGridClass.createInstance();
        dataGrid.dataGridID = 1;
        dataGrid.dataGridName = "数据列表项";
        dataGrid.gridColumns = new rock.RockList();
        dictForm.dataGrid = dataGrid;

        if (editState == "add") {
            IUIDesignService.addDictForm.dictForm = dictForm;
            rock.AjaxRequest(IUIDesignService.addDictForm, rock.exceptionFun);
            if (IUIDesignService.addDictForm.success) {
                (function (e) {
                    var dictData = new rock.JsonData(dictForm.dictFormID);
                    dictData.data.push(0);
                    dictData.data.push(dictForm.dictFormID);
                    dictData.data.push(dictForm.dictFormName);
                    dictData.data.push(dictForm.modelType);
                    dictData.data.push(dictForm.referTypes);
                    dictData.data.push(dictForm.columnCount);
                    dictData.data.push(dictForm.comment);

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(IUIDesignService.addDictForm.resultValue));
            }
        }
        else {
            IUIDesignService.modifyDictForm.dictForm = dictForm;
            rock.AjaxRequest(IUIDesignService.modifyDictForm, rock.exceptionFun);
            if (IUIDesignService.modifyDictForm.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id.toString() == dictForm.dictFormID) {
                            dictDataList.rows[i].data[0] = 0;
                            dictDataList.rows[i].data[2] = dictForm.dictFormName;
                            dictDataList.rows[i].data[3] = dictForm.modelType;
                            dictDataList.rows[i].data[4] = dictForm.referTypes;
                            dictDataList.rows[i].data[5] = dictForm.columnCount;
                            dictDataList.rows[i].data[6] = dictForm.comment;
                        }
                    }
                }(IUIDesignService.modifyDictForm.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("字典页面模型修改成功!");
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