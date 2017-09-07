
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, tabbar, workflowHistoryGrid,
		customerEnableApply = null,
		editItem = $("#editItem"),
		dictDataList = new rock.JsonList(),
		auditHistoryDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,CustomerEnableApply,IBusinessService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("beginapplyDate", beginDate);


                toolBar.setValue("endapplyDate", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }


        //处理初始化加载数据
        sqlStr = "select top 100 [CustomerEnableApply].[CustomerEnableApplyID], [Customer].[CustomerName], convert(nvarchar(10),[CustomerEnableApply].[applyDate],120) as applyDate, [CustomerEnableApply].[Applicant], [CustomerEnableApply].[State], [CustomerEnableApply].[enableReason] from [CustomerEnableApply] join [Customer] on [CustomerEnableApply].[customerID] = [Customer].[customerID] ";
        sqlStr += " and [CustomerEnableApply].[applyDate] between '" + toolBar.getValue("beginapplyDate") + " 0:0:0' AND '" + toolBar.getValue("endapplyDate") + " 23:59:59' ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项



        $("#combocustomer").empty();
        sqlStr = "SELECT [CustomerID],[CustomerName] FROM [Customer] where Available = '0' and ForSale = '1' order by CustomerName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combocustomer").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }
     
        //绑定控件失去焦点验证方法
        //CustomerEnableApplyClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();

    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("dictDiv");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("b").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();  
    tabbar.addTab("auditHistoryDiv", "审批历史信息", 80, 1);

    tabbar.tabs("auditHistoryDiv").setActive();
    tabbar.tabs("auditHistoryDiv").attachObject("auditHistoryDiv");

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("applyDateBegin", null, "申请日期");
    toolBar.addInput("beginapplyDate", null, "", 75);
    toolBar.addText("申请日期End", null, "-");
    toolBar.addInput("endapplyDate", null, "", 75);


    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("sepModify", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.addSeparator("sepCommit", null);
    toolBar.addButton("commit", null, "提交");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":

                if ($.trim(toolBar.getValue("beginapplyDate")) == "") {
                    alert("起始申请日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("beginapplyDate"), "-")) {
                    alert("起始申请日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endapplyDate")) == "") {
                    alert("截止申请日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endapplyDate"), "-")) {
                    alert("截止申请日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                sqlStr = "select [CustomerEnableApply].[CustomerEnableApplyID], [Customer].[CustomerName], convert(nvarchar(10),[CustomerEnableApply].[applyDate],120) as applyDate, [CustomerEnableApply].[applicant], [CustomerEnableApply].[State], [CustomerEnableApply].[enableReason] from [CustomerEnableApply] join [Customer] on [CustomerEnableApply].[customerID] = [Customer].[customerID]";
                sqlStr += " and [CustomerEnableApply].[applyDate] between '" + toolBar.getValue("beginapplyDate") + " 0:0:0' AND '" + toolBar.getValue("endapplyDate") + " 23:59:59' ";

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
                $("#formTitle").text("添加客户启用申请");
                $("#txtapplicant").val(decodeURIComponent($.cookie('userTrueName')));
                $("#combocustomer").get(0).selectedIndex = 0;
                $("#txtapplyDate").val(serverDate);
                $("#txtcomment").val("");
                $("#txtenableReason").val("");
                customerEnableApply = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑客户启用申请");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "CustomerEnableApply";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                customerEnableApply = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        $("#txtapplicant").val(customerEnableApply.applicant);
                        rock.setSelectItem("combocustomer", customerEnableApply.customerID, "value");
                        $("#txtapplyDate").val(customerEnableApply.applyDate.split(' ')[0]);
                        $("#txtcomment").val(customerEnableApply.comment);
                        $("#txtenableReason").val(customerEnableApply.enableReason);
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
                        ISystemService.deleteDynObjectByID.structName = "CustomerEnableApply";
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
            case "commit":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        IBusinessService.submitCustomerEnableApply.customerEnableApplyID = checked;
                        rock.AjaxRequest(IBusinessService.submitCustomerEnableApply, rock.exceptionFun);
                        if (IBusinessService.submitCustomerEnableApply.success) {
                            (function (e) {
                                sqlStr = "select top 100 [CustomerEnableApply].[CustomerEnableApplyID], [Customer].[CustomerName], convert(nvarchar(10),[CustomerEnableApply].[applyDate],120) as applyDate, [CustomerEnableApply].[Applicant], [CustomerEnableApply].[State], [CustomerEnableApply].[enableReason] from [CustomerEnableApply] join [Customer] on [CustomerEnableApply].[customerID] = [Customer].[customerID] ";
                                sqlStr += " and [CustomerEnableApply].[applyDate] between '" + toolBar.getValue("beginapplyDate") + " 0:0:0' AND '" + toolBar.getValue("endapplyDate") + " 23:59:59' ";
                                ISystemService.execQuery.sqlString = sqlStr;
                                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                                if (ISystemService.execQuery.success) {
                                    (function (e) {
                                        rock.tableToListGrid(e, listGrid, dictDataList);
                                    }(ISystemService.execQuery.resultValue));
                                }
                                refreshToolBarState();
                            }(IBusinessService.submitCustomerEnableApply.resultValue))
                        }                       
                    }
                    else {
                        alert("请仅选择一条要提交的行!");
                    }
                }
                else {
                    alert("请选择要提交的行!");
                }                
                break;

        }
    });



    //初始化客户启用申请列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,客户名称,申请日期,业务员,状态,启用原因");
    listGrid.setInitWidths("40,0,200,80,55,55,*");
    listGrid.setColAlign("center,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        var state = listGrid.cells(rowID, 5).getValue();
        if (state == "已创建") {
            editState = "modify";
            $("#formTitle").text("编辑客户启用申请");
            ISystemService.getDynObjectByID.dynObjectID = rowID;
            ISystemService.getDynObjectByID.structName = "CustomerEnableApply";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    customerEnableApply = e;
                }(ISystemService.getDynObjectByID.resultValue));
            }
            else {
                return;
            }

            $("#txtapplicant").val(customerEnableApply.applicant);
            rock.setSelectItem("combocustomer", customerEnableApply.customerID, "value");
            $("#txtapplyDate").val(customerEnableApply.applyDate.split(' ')[0]);
            $("#txtcomment").val(customerEnableApply.comment);
            $("#txtenableReason").val(customerEnableApply.enableReason);
            showEditForm();
        }
       
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getauditHistoryList(rowID); 
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    //editForm.height(200);
    editForm.width(650);
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

    //tableString = '';
    //editItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {
        if (customerEnableApply == null) {
            customerEnableApply = CustomerEnableApplyClass.createInstance();
            ISystemService.getNextID.typeName = "CustomerEnableApply";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerEnableApply.customerEnableApplyID = e.value;
                    customerEnableApply.state = "已创建";
                    customerEnableApply.needLeadership = false;
                    customerEnableApply.needCompany = false;
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!customerEnableApply.ValidateValue()) {
            return;
        }

        if ($.trim($("#txtapplicant").val()) != '') {
            customerEnableApply.applicant = $("#txtapplicant").val();
        }
        else {
            customerEnableApply.applicant = null;
        }

        customerEnableApply.customerID = $("#combocustomer").val();

        if ($.trim($("#txtapplyDate").val()) != '') {
            customerEnableApply.applyDate = $("#txtapplyDate").val();
        }
        else {
            customerEnableApply.applyDate = null;
        }

        if ($.trim($("#txtcomment").val()) != '') {
            customerEnableApply.comment = $("#txtcomment").val();
        }
        else {
            customerEnableApply.comment = null;
        }

        if ($.trim($("#txtenableReason").val()) != '') {
            customerEnableApply.enableReason = $("#txtenableReason").val();
        }
        else {
            customerEnableApply.enableReason = null;
        }

        if (editState == "add") {
            ISystemService.addDynObject.dynObject = customerEnableApply;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(customerEnableApply.customerEnableApplyID);
                    dictData.data.push(0);
                    dictData.data.push(customerEnableApply.customerEnableApplyID);

                    dictData.data.push($("#combocustomer").find("option:selected").text());
                    dictData.data.push($("#txtapplyDate").val());
                    dictData.data.push($("#txtapplicant").val());
                    dictData.data.push("已创建");
                    dictData.data.push($("#txtenableReason").val());

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = customerEnableApply;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == customerEnableApply.customerEnableApplyID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#combocustomer").find("option:selected").text();
                            dictDataList.rows[i].data[3] = $("#txtapplyDate").val();
                            dictDataList.rows[i].data[4] = $("#txtapplicant").val();
                            dictDataList.rows[i].data[6] = $("#txtenableReason").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("客户启用申请修改成功!");
        }


        refreshToolBarState();
    });


    //初始化流程处理信息列表
    auditHistoryGrid = new dhtmlXGridObject("auditHistoryGrid");
    auditHistoryGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    auditHistoryGrid.setSkin("dhx_skyblue");
    auditHistoryGrid.setHeader("序号,,审批部门,审批意见,审批人,审批结果,审批时间");
    auditHistoryGrid.setInitWidths("40,0,100,100,100,100,*");
    auditHistoryGrid.setColAlign("center,left,left,left,left,left,left");
    auditHistoryGrid.setColSorting("na,na,str,str,str,str,str");
    auditHistoryGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro");
    auditHistoryGrid.enableDistributedParsing(true, 20);
    auditHistoryGrid.init();
  

    //加载流程处理信息数据
    function getauditHistoryList(rowID) {
        if (rowID) {
            ISystemService.execQuery.sqlString = "select [WorkflowActivityInstanceID], [Comment],[Opinion],[Handler],[Result],[EndTime] from [WorkflowActivityInstance] where [ObjType] = 'CustomerEnableApply' and [ObjID] = " + rowID;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, auditHistoryGrid, auditHistoryDataList)
                }(ISystemService.execQuery.resultValue));
            }
        }
        else {
            auditHistoryGrid.clearAll();
        }
    }

    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("modify");
            toolBar.disableItem("delete");
            toolBar.disableItem("commit");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("modify");
                toolBar.disableItem("commit");
            }
            else {
                var state = listGrid.cells(checked, 5).getValue();
                switch (state) {
                    case "已创建":
                        toolBar.enableItem("modify");
                        toolBar.enableItem("delete");
                        toolBar.enableItem("commit");
                        break;                   
                    default:
                        toolBar.disableItem("delete");
                        toolBar.disableItem("commit");
                        toolBar.disableItem("modify");
                }                
            }           
        }
    }



    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginapplyDate"));

    dateboxArray.push(toolBar.getInput("endapplyDate"));

    dateboxArray.push("txtapplyDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})