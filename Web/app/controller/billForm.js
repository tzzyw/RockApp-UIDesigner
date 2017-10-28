$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr,
          billForm = null,
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,BillForm,FormItem,DataGrid,GridColumn,IUIDesignService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //加载单据表单列表
        sqlStr = "SELECT top 200 [BillFormID],[BillFormName],[MasterType],[DetailType],[ReferTypes],[BillName],[DetailMainReferType],[DetailMainReferName],[BizService],[Comment] FROM [BillForm]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        BillFormClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/");
    toolBar.addText("单据页面名称", null, "单据页面名称");
    toolBar.addInput("txtBillFormSearch", null, "", 100);
    toolBar.addButton("query", null, "查询");
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("4", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("5", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.addSeparator("6", null);
    toolBar.addButton("formdesigner", null, "单据模型设计");

    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                if (toolBar.getValue("txtBillFormSearch") != "") {
                    sqlStr = " SELECT [BillFormID],[BillFormName],[MasterType],[DetailType],[ReferTypes],[BillName],[DetailMainReferType],[DetailMainReferName],[BizService],[Comment] FROM [BillForm] where BillFormName like '%" + toolBar.getValue("txtBillFormSearch") + "%'";
                }
                else {
                    sqlStr = "SELECT top 200 [BillFormID],[BillFormName],[MasterType],[DetailType],[ReferTypes],[BillName],[DetailMainReferType],[DetailMainReferName],[BizService],[Comment] FROM [BillForm]";
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
                $("#formTitle").text("添加单据页面");
                $("#txtbillFormName").val("");
                $("#txtmasterType").val("");
                $("#txtdetailType").val("");
                $("#txtreferTypes").val("");
                $("#txtbillName").val("");
                $("#txtdetailMainReferType").val("");
                $("#txtdetailMainReferName").val("");
                $("#txtbizService").val("");
                $("#txtcomment").val("");
                billForm = null;
                showEditForm();
                break;
            case "modify":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        IUIDesignService.getBillFormByID.billFormID = dictDataID;
                        rock.AjaxRequest(IUIDesignService.getBillFormByID, rock.exceptionFun);
                        if (IUIDesignService.getBillFormByID.success) {
                            (function (e) {
                                billForm = e;
                            }(IUIDesignService.getBillFormByID.resultValue));
                        }
                        else {
                            return;
                        }
                        $("#txtbillFormName").val(billForm.billFormName);
                        $("#txtmasterType").val(billForm.masterType);
                        $("#txtdetailType").val(billForm.detailType);
                        $("#txtreferTypes").val(billForm.referTypes);
                        $("#txtbillName").val(billForm.billName);
                        $("#txtdetailMainReferType").val(billForm.detailMainReferType);
                        $("#txtdetailMainReferName").val(billForm.detailMainReferName);
                        $("#txtbizService").val(billForm.bizService);
                        $("#txtcomment").val(billForm.comment);
                        editState = "modify";
                        $("#formTitle").text("编辑单据页面");
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
                        ISystemService.deleteDynObjectByID.structName = "BillForm";
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
                        window.open("BillFormDesigner.html?id=" + listGrid.cells(checked, 1).getValue() + "&MType=" + listGrid.cells(checked, 3).getValue() + "&DType=" + listGrid.cells(checked, 4).getValue() + "&RType=" + listGrid.cells(checked, 7).getValue(), "BillFormDesigner", "'fullscreen=yes ,top=20,left=30,toolBar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,status=no"); //第二个参数:window1表示新打开的窗体name是window1,如果多次用这个名称打开多个窗体,则最终只会打开一个窗体,保留最后一个窗体的url
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
    listGrid.setHeader("选择,,单据页面名称,主表类型,明细表类型,相关对象名称,单据名称,明细主参照类型,明细主参照名称,业务服务名称,备注");
    listGrid.setInitWidths("45,0,200,100,100,150,100,150,150,120,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        IUIDesignService.getBillFormByID.billFormID = rowID;
        rock.AjaxRequest(IUIDesignService.getBillFormByID, rock.exceptionFun);
        if (IUIDesignService.getBillFormByID.success) {
            (function (e) {
                billForm = e;
            }(IUIDesignService.getBillFormByID.resultValue));
        }
        else {
            return;
        }
        $("#txtbillFormName").val(billForm.billFormName);
        $("#txtmasterType").val(billForm.masterType);
        $("#txtdetailType").val(billForm.detailType);
        $("#txtreferTypes").val(billForm.referTypes);
        $("#txtbillName").val(billForm.billName);
        $("#txtdetailMainReferType").val(billForm.detailMainReferType);
        $("#txtdetailMainReferName").val(billForm.detailMainReferName);
        $("#txtbizService").val(billForm.bizService);
        $("#txtcomment").val(billForm.comment);
        editState = "modify";
        $("#formTitle").text("编辑单据页面");
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
        if (billForm == null) {
            billForm = BillFormClass.createInstance();
            ISystemService.getNextID.typeName = 'BillForm';
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    billForm.billFormID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!billForm.ValidateValue()) {
            return false;
        }

        if (parseInt($("#txtbillName").val(), 10) > 2) {
            alert("目前编辑窗列数不支持大于2!");
            return false;
        }

        billForm.billFormName = $("#txtbillFormName").val();
        billForm.masterType = $("#txtmasterType").val();
        billForm.detailType = $("#txtdetailType").val();
        billForm.billName = $("#txtbillName").val();
        billForm.detailMainReferType = $("#txtdetailMainReferType").val();
        billForm.detailMainReferName = $("#txtdetailMainReferName").val();
        billForm.bizService = $("#txtbizService").val();
        if ($.trim($("#txtreferTypes").val()) != '') {
            billForm.referTypes = $("#txtreferTypes").val();
        }
        else {
            billForm.referTypes = null;
        }
        if ($.trim($("#txtcomment").val()) != '') {
            billForm.comment = $("#txtcomment").val();
        }
        else {
            billForm.comment = null;
        }



        //主明细表单项集合
        billForm.masterFormItems = new rock.RockList();
        billForm.detailFormItems = new rock.RockList();

        //明细表格 
        var dataGrid = DataGridClass.createInstance();
        dataGrid.dataGridID = 1;
        dataGrid.dataGridName = "明细部分明细表列";
        dataGrid.gridColumns = new rock.RockList();
        billForm.detailGrid = dataGrid;

        //明细表格主参照列集合        
        billForm.detailGridMainReferColumns = new rock.RockList();

        //明细主参照选择表格
        dataGrid = DataGridClass.createInstance();
        dataGrid.dataGridID = 1;
        dataGrid.dataGridName = "明细主参照选择表格";
        dataGrid.gridColumns = new rock.RockList();
        billForm.detailMainReferGrid = dataGrid;

        //明细主参照快查匹配列集合      
        billForm.detailMainReferFuzzyColumns = new rock.RockList();
        //明细主参照表单项集合
        billForm.detailMainReferFormItems = new rock.RockList();

        if (editState == "add") {
            IUIDesignService.addBillForm.billForm = billForm;
            rock.AjaxRequest(IUIDesignService.addBillForm, rock.exceptionFun);
            if (IUIDesignService.addBillForm.success) {
                (function (e) {
                    var dictData = new rock.JsonData(billForm.billFormID);
                    dictData.data.push(0);
                    dictData.data.push(billForm.billFormID);
                    dictData.data.push(billForm.billFormName);
                    dictData.data.push(billForm.masterType);
                    dictData.data.push(billForm.detailType);
                    dictData.data.push(billForm.referTypes);
                    dictData.data.push(billForm.billName);
                    dictData.data.push(billForm.detailMainReferType);
                    dictData.data.push(billForm.detailMainReferName);
                    dictData.data.push(billForm.bizService);
                    dictData.data.push(billForm.comment);

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(IUIDesignService.addBillForm.resultValue));
            }
        }
        else {
            IUIDesignService.modifyBillForm.billForm = billForm;
            rock.AjaxRequest(IUIDesignService.modifyBillForm, rock.exceptionFun);
            if (IUIDesignService.modifyBillForm.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id.toString() == billForm.billFormID) {
                            dictDataList.rows[i].data[0] = 0;
                            dictDataList.rows[i].data[2] = billForm.billFormName;
                            dictDataList.rows[i].data[3] = billForm.masterType;
                            dictDataList.rows[i].data[4] = billForm.detailType;
                            dictDataList.rows[i].data[5] = billForm.referTypes;
                            dictDataList.rows[i].data[6] = billForm.billName;
                            dictDataList.rows[i].data[7] = billForm.detailMainReferType;
                            dictDataList.rows[i].data[8] = billForm.detailMainReferName;
                            dictDataList.rows[i].data[9] = billForm.bizService;
                            dictDataList.rows[i].data[10] = billForm.comment;
                        }
                    }
                }(IUIDesignService.modifyBillForm.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("单据页面模型修改成功!");
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