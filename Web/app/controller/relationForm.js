$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr,
          relationForm = null,
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,RelationForm,FormItem,GridColumn,IUIDesignService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //加载关联实体表单列表
        sqlStr = "SELECT top 100 [RelationFormID],[RelationFormName],[RelationType],[MasterType],[SlaveType],[MasterTypeName],[SlaveTypeName],[ColumnCount],[Comment] FROM [RelationForm]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        RelationFormClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/");
    toolBar.addText("关联实体页面名称", null, "关联实体页面名称");
    toolBar.addInput("txtRelationFormSearch", null, "", 100);
    toolBar.addButton("query", null, "查询");
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("4", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("5", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.addSeparator("6", null);
    toolBar.addButton("formdesigner", null, "关联实体模型设计");

    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                if (toolBar.getValue("txtRelationFormSearch") != "") {
                    sqlStr = " SELECT [RelationFormID],[RelationFormName],[RelationType],[MasterType],[SlaveType],[MasterTypeName],[SlaveTypeName],[ColumnCount],[Comment] FROM [RelationForm] where RelationFormName like '%" + toolBar.getValue("txtRelationFormSearch") + "%'";
                }
                else {
                    sqlStr = "SELECT top 100 [RelationFormID],[RelationFormName],[RelationType],[MasterType],[SlaveType],[MasterTypeName],[SlaveTypeName],[ColumnCount],[Comment] FROM [RelationForm]";
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
                $("#formTitle").text("添加关联实体页面");
                $("#txtrelationFormName").val("");
                $("#txtrelationType").val("");
                $("#txtmasterType").val("");
                $("#txtslaveType").val("");
                $("#txtmasterTypeName").val("");
                $("#txtslaveTypeName").val("");
                $("#txtcolumnCount").val("");
                $("#txtcomment").val("");
                relationForm = null;
                showEditForm();
                break;
            case "modify":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        IUIDesignService.getRelationFormByID.relationFormID = dictDataID;
                        rock.AjaxRequest(IUIDesignService.getRelationFormByID, rock.exceptionFun);
                        if (IUIDesignService.getRelationFormByID.success) {
                            (function (e) {
                                relationForm = e;
                            }(IUIDesignService.getRelationFormByID.resultValue));
                        }
                        else {
                            return;
                        }
                        $("#txtrelationFormName").val(relationForm.relationFormName);
                        $("#txtrelationType").val(relationForm.relationType);
                        $("#txtmasterType").val(relationForm.masterType);
                        $("#txtslaveType").val(relationForm.slaveType);
                        $("#txtmasterTypeName").val(relationForm.masterTypeName);
                        $("#txtslaveTypeName").val(relationForm.slaveTypeName);
                        $("#txtcolumnCount").val(relationForm.columnCount);
                        $("#txtcomment").val(relationForm.comment);
                        editState = "modify";
                        $("#formTitle").text("编辑关联实体页面");
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
                        ISystemService.deleteDynObjectByID.structName = "RelationForm";
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
                        window.open("RelationFormDesigner.html?id=" + listGrid.cells(checked, 1).getValue() + "&RType=" + listGrid.cells(checked, 3).getValue() + "&MType=" + listGrid.cells(checked, 4).getValue() + "&SType=" + listGrid.cells(checked, 5).getValue(), "RelationFormDesigner", "'fullscreen=yes ,top=20,left=30,toolBar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no"); //第二个参数:window1表示新打开的窗体name是window1,如果多次用这个名称打开多个窗体,则最终只会打开一个窗体,保留最后一个窗体的url
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
    listGrid = new dhtmlXGridObject("gridlist");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,关联实体页面名称,关联实体类型,主实体类型,从实体类型,主实体名称,从实体名称,主实体编辑窗列数,备注");
    listGrid.setInitWidths("45,0,200,100,100,100,100,100,120,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        IUIDesignService.getRelationFormByID.relationFormID = rowID;
        rock.AjaxRequest(IUIDesignService.getRelationFormByID, rock.exceptionFun);
        if (IUIDesignService.getRelationFormByID.success) {
            (function (e) {
                relationForm = e;
            }(IUIDesignService.getRelationFormByID.resultValue));
        }
        else {
            return;
        }
        $("#txtrelationFormName").val(relationForm.relationFormName);
        $("#txtmasterType").val(relationForm.masterType);
        $("#txtslaveType").val(relationForm.slaveType);
        $("#txtmasterTypeName").val(relationForm.masterTypeName);
        $("#txtslaveTypeName").val(relationForm.slaveTypeName);
        $("#txtrelationType").val(relationForm.relationType);
        $("#txtcolumnCount").val(relationForm.columnCount);
        $("#txtcomment").val(relationForm.comment);
        editState = "modify";
        $("#formTitle").text("编辑关联实体页面");
        showEditForm();
    });
    listGrid.setPagingSkin("toolBar", "dhx_skyblue");
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
        if (relationForm == null) {
            relationForm = RelationFormClass.createInstance();
            ISystemService.getNextID.typeName = 'RelationForm';
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    relationForm.relationFormID = e.value;                    
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!relationForm.ValidateValue()) {
            return false;
        }

        if (parseInt($("#txtcolumnCount").val(), 10) > 2) {
            alert("目前编辑窗列数不支持大于2!");
            return false;
        }

        relationForm.relationFormName = $("#txtrelationFormName").val();
        relationForm.relationType = $("#txtrelationType").val();
        relationForm.masterType = $("#txtmasterType").val();
        relationForm.slaveType = $("#txtslaveType").val();
        relationForm.masterTypeName = $("#txtmasterTypeName").val();
        relationForm.slaveTypeName = $("#txtslaveTypeName").val();
        relationForm.columnCount = $("#txtcolumnCount").val();
        if ($.trim($("#txtcomment").val()) != '') {
            relationForm.comment = $("#txtcomment").val();
        }
        else {
            relationForm.comment = null;
        }
        
        //主实体表单项集合
        relationForm.masterFormItems = new rock.RockList();
        relationForm.masterGridColumns = new rock.RockList();

        //从实体表格列集合 
        relationForm.slaveGridColumns = new rock.RockList();

        //从实体待选表格列集合        
        relationForm.slaveWaitGridColumns = new rock.RockList();     

        if (editState == "add") {
            IUIDesignService.addRelationForm.relationForm = relationForm;
            rock.AjaxRequest(IUIDesignService.addRelationForm, rock.exceptionFun);
            if (IUIDesignService.addRelationForm.success) {
                (function (e) {
                    var dictData = new rock.JsonData(relationForm.relationFormID);
                    dictData.data.push(0);
                    dictData.data.push(relationForm.relationFormID);
                    dictData.data.push(relationForm.relationFormName);
                    dictData.data.push(relationForm.relationType);
                    dictData.data.push(relationForm.masterType);
                    dictData.data.push(relationForm.slaveType);
                    dictData.data.push(relationForm.masterTypeName);
                    dictData.data.push(relationForm.slaveTypeName);
                    dictData.data.push(relationForm.columnCount);
                    dictData.data.push(relationForm.comment);

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(IUIDesignService.addRelationForm.resultValue));
            }
        }
        else {
            IUIDesignService.modifyRelationForm.relationForm = relationForm;
            rock.AjaxRequest(IUIDesignService.modifyRelationForm, rock.exceptionFun);
            if (IUIDesignService.modifyRelationForm.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id.toString() == relationForm.relationFormID) {
                            dictDataList.rows[i].data[0] = 0;
                            dictDataList.rows[i].data[2] = relationForm.relationFormName;
                            dictDataList.rows[i].data[3] = relationForm.relationType;
                            dictDataList.rows[i].data[4] = relationForm.masterType;
                            dictDataList.rows[i].data[5] = relationForm.slaveType;
                            dictDataList.rows[i].data[6] = relationForm.masterTypeName;
                            dictDataList.rows[i].data[7] = relationForm.slaveTypeName;
                            dictDataList.rows[i].data[8] = relationForm.columnCount;
                            dictDataList.rows[i].data[9] = relationForm.comment;
                        }
                    }
                }(IUIDesignService.modifyRelationForm.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("关联实体页面模型修改成功!");
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