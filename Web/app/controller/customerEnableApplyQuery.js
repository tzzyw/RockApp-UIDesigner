
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
        sqlStr = "SELECT [CustomerID],[CustomerName] FROM [Customer] order by CustomerName";
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
        }
    });



    //初始化客户启用申请列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("序号,,客户名称,申请日期,业务员,状态,启用原因");
    listGrid.setInitWidths("40,0,200,80,55,55,*");
    listGrid.setColAlign("center,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getauditHistoryList(rowID);
    });
    listGrid.init();

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



    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginapplyDate"));

    dateboxArray.push(toolBar.getInput("endapplyDate"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})