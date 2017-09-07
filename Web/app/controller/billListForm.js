$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr,
          billListForm = null,
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,BillListForm,QueryItem,DataGrid,GridColumn,IUIDesignService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //加载单据列表表单列表
        sqlStr = "SELECT top 200 [BillListFormID],[BillListFormName],[MasterType],[DetailType],[ReferTypes],[BillName],[DetailMainReferType],[DetailMainReferName],[Comment] FROM [BillListForm]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        BillListFormClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/");
    toolBar.addText("单据列表页面名称", null, "单据列表页面名称");
    toolBar.addInput("txtBillListFormSearch", null, "", 100);
    toolBar.addButton("query", null, "查询");
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("4", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("5", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.addSeparator("6", null);
    toolBar.addButton("formdesigner", null, "单据列表模型设计");

    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                if (toolBar.getValue("txtBillListFormSearch") != "") {
                    sqlStr = " SELECT [BillListFormID],[BillListFormName],[MasterType],[DetailType],[ReferTypes],[BillName],[DetailMainReferType],[DetailMainReferName],[Comment] FROM [BillListForm] where BillListFormName like '%" + toolBar.getValue("txtBillListFormSearch") + "%'";
                }
                else {
                    sqlStr = "SELECT top 100 [BillListFormID],[BillListFormName],[MasterType],[DetailType],[ReferTypes],[BillName],[DetailMainReferType],[DetailMainReferName],[Comment] FROM [BillListForm]";
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
                $("#formTitle").text("添加单据列表页面");
                $("#txtbillListFormName").val("");
                $("#txtmasterType").val("");
                $("#txtdetailType").val("");
                $("#txtreferTypes").val("");
                $("#txtbillName").val("");
                $("#txtdetailMainReferType").val("");
                $("#txtdetailMainReferName").val("");                
                $("#txtcomment").val("");
                billListForm = null;
                showEditForm();
                break;
            case "modify":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        IUIDesignService.getBillListFormByID.billListFormID = dictDataID;
                        rock.AjaxRequest(IUIDesignService.getBillListFormByID, rock.exceptionFun);
                        if (IUIDesignService.getBillListFormByID.success) {
                            (function (e) {
                                billListForm = e;
                            }(IUIDesignService.getBillListFormByID.resultValue));
                        }
                        else {
                            return;
                        }
                        $("#txtbillListFormName").val(billListForm.billListFormName);
                        $("#txtmasterType").val(billListForm.masterType);
                        $("#txtdetailType").val(billListForm.detailType);
                        $("#txtreferTypes").val(billListForm.referTypes);
                        $("#txtbillName").val(billListForm.billName);
                        $("#txtdetailMainReferType").val(billListForm.detailMainReferType);
                        $("#txtdetailMainReferName").val(billListForm.detailMainReferName);
                        $("#txtcomment").val(billListForm.comment);
                        editState = "modify";
                        $("#formTitle").text("编辑单据列表页面");
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
                        ISystemService.deleteDynObjectByID.structName = "BillListForm";
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
                        window.open("BillListFormDesigner.html?id=" + listGrid.cells(checked, 1).getValue() + "&MType=" + listGrid.cells(checked, 3).getValue() + "&DType=" + listGrid.cells(checked, 4).getValue() + "&RType=" + listGrid.cells(checked, 7).getValue(), "BillListFormDesigner", "'fullscreen=yes ,top=20,left=30,toolBar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no"); //第二个参数:window1表示新打开的窗体name是window1,如果多次用这个名称打开多个窗体,则最终只会打开一个窗体,保留最后一个窗体的url
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
    listGrid.setHeader("选择,,单据列表页面名称,主表类型,明细表类型,相关对象名称,单据名称,明细主参照类型,明细主参照名称,备注");
    listGrid.setInitWidths("45,0,200,100,100,150,100,150,150,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        IUIDesignService.getBillListFormByID.billListFormID = rowID;
        rock.AjaxRequest(IUIDesignService.getBillListFormByID, rock.exceptionFun);
        if (IUIDesignService.getBillListFormByID.success) {
            (function (e) {
                billListForm = e;
            }(IUIDesignService.getBillListFormByID.resultValue));
        }
        else {
            return;
        }
        $("#txtbillListFormName").val(billListForm.billListFormName);
        $("#txtmasterType").val(billListForm.masterType);
        $("#txtdetailType").val(billListForm.detailType);
        $("#txtreferTypes").val(billListForm.referTypes);
        $("#txtbillName").val(billListForm.billName);
        $("#txtdetailMainReferType").val(billListForm.detailMainReferType);
        $("#txtdetailMainReferName").val(billListForm.detailMainReferName);
        $("#txtcomment").val(billListForm.comment);
        editState = "modify";
        $("#formTitle").text("编辑单据列表页面");
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
        if (billListForm == null) {
            billListForm = BillListFormClass.createInstance();
            ISystemService.getNextID.typeName = 'BillListForm';
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    billListForm.billListFormID = e.value;
                    billListForm.itemType = "BillListForm";
                }(ISystemService.getNextID.resultValue))
            }
        }
         if (!billListForm.ValidateValue()) {
            return false;
        }

        if (parseInt($("#txtbillName").val(), 10) > 2) {
            alert("目前编辑窗列数不支持大于2!");
            return false;
        }

        billListForm.billListFormName = $("#txtbillListFormName").val();
        billListForm.masterType = $("#txtmasterType").val();
        billListForm.detailType = $("#txtdetailType").val();
        billListForm.billName = $("#txtbillName").val();
        billListForm.detailMainReferType = $("#txtdetailMainReferType").val();
        billListForm.detailMainReferName = $("#txtdetailMainReferName").val();
        if ($.trim($("#txtreferTypes").val()) != '') {
            billListForm.referTypes = $("#txtreferTypes").val();
        }
        else {
            billListForm.referTypes = null;
        }
        if ($.trim($("#txtcomment").val()) != '') {
            billListForm.comment = $("#txtcomment").val();
        }
        else {
            billListForm.comment = null;
        }



        //查询条件集合
        billListForm.queryItems = new rock.RockList();

        //主表格 
        var dataGrid = DataGridClass.createInstance();
        dataGrid.dataGridID = 1;
        dataGrid.dataGridName = "主表格";
        dataGrid.gridColumns = new rock.RockList();
        billListForm.masterGrid = dataGrid;

        //明细表格 
        dataGrid = DataGridClass.createInstance();
        dataGrid.dataGridID = 1;
        dataGrid.dataGridName = "明细表格";
        dataGrid.gridColumns = new rock.RockList();
        billListForm.detailGrid = dataGrid;

        //明细主参照表格
        dataGrid = DataGridClass.createInstance();
        dataGrid.dataGridID = 1;
        dataGrid.dataGridName = "明细主参照表格";
        dataGrid.gridColumns = new rock.RockList();
        billListForm.detailMainReferGrid = dataGrid;

        ////明细主参照快查匹配列集合
        //billListForm.detailMainReferMatchColumns = new rock.RockList();

        if (editState == "add") {
            IUIDesignService.addBillListForm.billListForm = billListForm;
            rock.AjaxRequest(IUIDesignService.addBillListForm, rock.exceptionFun);
            if (IUIDesignService.addBillListForm.success) {
                (function (e) {
                    var dictData = new rock.JsonData(billListForm.billListFormID);
                    dictData.data.push(0);
                    dictData.data.push(billListForm.billListFormID);
                    dictData.data.push(billListForm.billListFormName);
                    dictData.data.push(billListForm.masterType);
                    dictData.data.push(billListForm.detailType);
                    dictData.data.push(billListForm.referTypes);
                    dictData.data.push(billListForm.billName);
                    dictData.data.push(billListForm.detailMainReferType);
                    dictData.data.push(billListForm.detailMainReferName);
                    dictData.data.push(billListForm.comment);

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(IUIDesignService.addBillListForm.resultValue));
            }
        }
        else {
            IUIDesignService.modifyBillListForm.billListForm = billListForm;
            rock.AjaxRequest(IUIDesignService.modifyBillListForm, rock.exceptionFun);
            if (IUIDesignService.modifyBillListForm.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id.toString() == billListForm.billListFormID) {
                            dictDataList.rows[i].data[0] = 0;
                            dictDataList.rows[i].data[2] = billListForm.billListFormName;
                            dictDataList.rows[i].data[3] = billListForm.masterType;
                            dictDataList.rows[i].data[4] = billListForm.detailType;
                            dictDataList.rows[i].data[5] = billListForm.referTypes;
                            dictDataList.rows[i].data[6] = billListForm.billName;
                            dictDataList.rows[i].data[7] = billListForm.detailMainReferType;
                            dictDataList.rows[i].data[8] = billListForm.detailMainReferName;
                            dictDataList.rows[i].data[9] = billListForm.comment;
                        }
                    }
                }(IUIDesignService.modifyBillListForm.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("单据列表页面模型修改成功!");
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