﻿
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, masterGrid, detailGrid, sqlStr, tabbar, workflowActivityInstanceGrid,
	editImg = "/resource/dhtmlx/codebase/imgs/undo.png",
    disEditImg = "/resource/dhtmlx/codebase/imgs/own/undoSubmitDisabled.png",
    masterDataList = new rock.JsonList(),
    workflowActivityInstanceDataList = new rock.JsonList(),
    detailDataList = new rock.JsonList();
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,IMotorMaintenanceService,MotorMaintenanceRecord,DepartmentDetail";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                var serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("begincreateDate", beginDate);
                toolBar.setValue("endcreateDate", serverDate);
            }(ISystemService.getServerDate.resultValue));
        }

        initDataList();
        //初始化数据列表
        function initDataList() {
            //处理初始化加载数据
            sqlStr = "select top 100 [MotorMaintenanceRecord].[MotorMaintenanceRecordID], [MotorMaintenanceRecord].[weituodanwei], [MotorMaintenanceRecord].[motorNumber], [MotorMaintenanceRecord].[motorModelNum], [MotorMaintenanceRecord].[motorMaintenanceRecordName], [MotorMaintenanceRecord].[equipmentName], [MotorMaintenanceRecord].[gongzuolinghao], [MotorMaintenanceRecord].[xiangmufuzeren], (case when IsSettlement = 1 then '已结算' else [MotorMaintenanceRecord].[state] end), [Department].[DepartmentName],[MotorMaintenanceRecord].[MaintenanceType],MotorMaintenanceRecord.WaiWeiZiXiu from [MotorMaintenanceRecord] join [Department] on [MotorMaintenanceRecord].[departmentID] = [Department].[departmentID] where MotorMaintenanceRecord.State not in ('已创建')";
            ISystemService.execQuery.sqlString = sqlStr;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToBillGridReset(e, masterGrid, masterDataList, 8, editImg, disEditImg);
                }(ISystemService.execQuery.resultValue));
            }
        }
        //初始化实体参照及查询项
        //初始化通用参照
    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("masterDiv");
    dhxLayout.cells("a").hideHeader();
    //dhxLayout.cells("b").attachObject("detailDiv");
    dhxLayout.cells("b").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("detailDiv", "辅修班组", 80, 1);
    tabbar.addTab("workflowActivityInstanceDiv", "流程处理信息", 80, 1);

    tabbar.tabs("detailDiv").setActive();
    tabbar.tabs("detailDiv").attachObject("detailDiv");
    tabbar.tabs("workflowActivityInstanceDiv").attachObject("workflowActivityInstanceDiv");

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("createDateBegin", null, "创建日期");
    toolBar.addInput("begincreateDate", null, "", 75);
    toolBar.addText("创建日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 75);
    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                if ($.trim(toolBar.getValue("begincreateDate")) == "") {
                    alert("起始创建日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("begincreateDate"), "-")) {
                    alert("起始创建日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endcreateDate")) == "") {
                    alert("截止创建日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endcreateDate"), "-")) {
                    alert("截止创建日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                sqlStr = "select [MotorMaintenanceRecord].[MotorMaintenanceRecordID], [MotorMaintenanceRecord].[weituodanwei], [MotorMaintenanceRecord].[motorNumber], [MotorMaintenanceRecord].[motorModelNum], [MotorMaintenanceRecord].[motorMaintenanceRecordName], [MotorMaintenanceRecord].[equipmentName], [MotorMaintenanceRecord].[gongzuolinghao], [MotorMaintenanceRecord].[xiangmufuzeren], (case when IsSettlement = 1 then '已结算' else [MotorMaintenanceRecord].[state] end), [Department].[DepartmentName],[MotorMaintenanceRecord].[MaintenanceType],MotorMaintenanceRecord.WaiWeiZiXiu from [MotorMaintenanceRecord] join [Department] on [MotorMaintenanceRecord].[departmentID] = [Department].[departmentID] where MotorMaintenanceRecord.State not in ('已创建')";
                sqlStr += " and [MotorMaintenanceRecord].[createDate] between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' and MotorMaintenanceRecord.State <>'完成'";
                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToBillGridReset(e, masterGrid, masterDataList, 8, editImg, disEditImg);
                    }(ISystemService.execQuery.resultValue));
                }
                break;

        }
    });

    //初始化主表列表
    masterGrid = new dhtmlXGridObject("masterGrid");
    masterGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    masterGrid.setSkin("dhx_skyblue");
    masterGrid.setHeader("序号,,重置,委托单位,电机位号,电机型号,项目名称,出厂编号,工作令号,项目负责人,状态,检修班组,主要检修内容,");
    masterGrid.setInitWidths("40,0,40,68,68,150,116,110,68,80,90,68,*,0");
    masterGrid.setColAlign("center,left,center,left,left,left,left,left,left,left,left,left,left,left");
    masterGrid.setColSorting("na,na,na,str,str,str,str,str,str,str,str,str,str,str");
    masterGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    masterGrid.enableDistributedParsing(true, 20);
    masterGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getDetail(rowID);
        getWorkflowActivityInstanceList(rowID);
        if (cIndex == 2) {
            if (confirm("确定重置工作流吗？")) {
                if (masterGrid.cells(rowID, 10).getValue() == "完成") {
                    var motorMaintenanceRecord = MotorMaintenanceRecordClass.createInstance();
                    IMotorMaintenanceService.getMotorMaintenanceRecordByID.motorMaintenanceRecordID = rowID;
                    rock.AjaxRequest(IMotorMaintenanceService.getMotorMaintenanceRecordByID, rock.exceptionFun);
                    if (IMotorMaintenanceService.getMotorMaintenanceRecordByID.success) {
                        (function (e) {
                            motorMaintenanceRecord = e;
                        }(IMotorMaintenanceService.getMotorMaintenanceRecordByID.resultValue));
                    }

                    var exchangeParams = [];
                    exchangeParams[0] = "ObjType^MotorMaintenanceRecord";
                    exchangeParams[1] = "ObjID^" + rowID;

                    //启动工作流
                    if (motorMaintenanceRecord.waiWeiZiXiu == "自修") {
                        ISystemService.startWorkflow.workflowID = 2;
                    }
                    else if (motorMaintenanceRecord.waiWeiZiXiu == "外委") {
                        ISystemService.startWorkflow.workflowID = 3;
                    }
                    ISystemService.startWorkflow.userID = $.cookie('userID');
                    ISystemService.startWorkflow.exchangeParamLists = exchangeParams;
                    rock.AjaxRequest(ISystemService.startWorkflow, rock.exceptionFun);

                    //重置工作流以后修改点击检修报告状态字段
                    motorMaintenanceRecord.state = "已分配";
                    motorMaintenanceRecord.waiWeiState = "待确认";
                    IMotorMaintenanceService.modifyMotorMaintenanceRecord.motorMaintenanceRecord = motorMaintenanceRecord;
                    rock.AjaxRequest(IMotorMaintenanceService.modifyMotorMaintenanceRecord, rock.exceptionFun);
                }
                else if (masterGrid.cells(rowID, 10).getValue() == "已结算") {
                    return;
                }
                else {
                    var exchangeParams = [];
                    exchangeParams[0] = "ObjType^MotorMaintenanceRecord";
                    exchangeParams[1] = "ObjID^" + rowID;
                    exchangeParams[2] = "StateField^" + "State";
                    exchangeParams[3] = "StateValue^" + "已创建";
                    exchangeParams[4] = "AdditionalSql^" + "UPDATE [MotorMaintenanceRecord] SET [WaiWeiState] = '待确认' WHERE MotorMaintenanceRecordID = " + rowID;

                    //重置工作流
                    if (masterGrid.cells(rowID, 13).getValue() == "自修") {
                        ISystemService.terminateWorkflow.workflowID = 2;
                    }
                    else if (masterGrid.cells(rowID, 14).getValue() == "外委") {
                        ISystemService.terminateWorkflow.workflowID = 3;
                    }
                    ISystemService.execQuery.sqlString = "SELECT [WorkflowInstanceID] FROM [WorkflowToDoList] where [ObjID] =" + rowID;
                    rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                    if (ISystemService.execQuery.success) {
                        (function (e) {
                            var rows = e.rows;
                            var rowResult = rows[0].values;
                            ISystemService.terminateWorkflow.workflowInstanceID = rowResult[0].value;
                        }(ISystemService.execQuery.resultValue));
                    }
                    ISystemService.terminateWorkflow.userID = $.cookie('userID');
                    ISystemService.terminateWorkflow.exchangeParamLists = exchangeParams;
                    rock.AjaxRequest(ISystemService.terminateWorkflow, rock.exceptionFun);
                }
                //处理初始化加载数据
                sqlStr = "select top 100 [MotorMaintenanceRecord].[MotorMaintenanceRecordID], [MotorMaintenanceRecord].[weituodanwei], [MotorMaintenanceRecord].[motorNumber], [MotorMaintenanceRecord].[motorModelNum], [MotorMaintenanceRecord].[motorMaintenanceRecordName], [MotorMaintenanceRecord].[equipmentName], [MotorMaintenanceRecord].[gongzuolinghao], [MotorMaintenanceRecord].[xiangmufuzeren], (case when IsSettlement = 1 then '已结算' else [MotorMaintenanceRecord].[state] end), [Department].[DepartmentName], [MotorMaintenanceRecord].[MaintenanceType],MotorMaintenanceRecord.WaiWeiZiXiu from [MotorMaintenanceRecord] join [Department] on [MotorMaintenanceRecord].[departmentID] = [Department].[departmentID] where MotorMaintenanceRecord.State not in ('已创建')";
                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToBillGridReset(e, masterGrid, masterDataList, 8, editImg, disEditImg);
                    }(ISystemService.execQuery.resultValue));
                }
            }
        }
    });
    masterGrid.init();

    //初始化明细表表列表
    detailGrid = new dhtmlXGridObject("detailGrid");
    detailGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    detailGrid.setSkin("dhx_skyblue");
    detailGrid.setHeader("序号,,辅修班组,备注");
    detailGrid.setInitWidths("40,0,100,*");
    detailGrid.setColAlign("center,left,left,left");
    detailGrid.setColSorting("na,na,str,str");
    detailGrid.setColTypes("cntr,ro,ro,ro");
    detailGrid.enableDistributedParsing(true, 20);
    detailGrid.init();

    //初始化流程处理信息列表
    workflowActivityInstanceGrid = new dhtmlXGridObject("workflowActivityInstanceGrid");
    workflowActivityInstanceGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    workflowActivityInstanceGrid.setSkin("dhx_skyblue");
    workflowActivityInstanceGrid.setHeader("序号,,活动名称,执行状态,操作者,审批时间,审批意见");
    workflowActivityInstanceGrid.setInitWidths("40,0,200,100,100,90,*");
    workflowActivityInstanceGrid.setColAlign("center,left,left,left,left,left,left");
    workflowActivityInstanceGrid.setColSorting("na,na,str,str,str,str,str");
    workflowActivityInstanceGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro");
    workflowActivityInstanceGrid.enableDistributedParsing(true, 20);
    workflowActivityInstanceGrid.init();

    //加载明细数据    
    function getDetail(masterID) {
        ISystemService.execQuery.sqlString = "select [DepartmentDetail].[DepartmentDetailID], [Department].[departmentName], [Department].[comment] from [DepartmentDetail] join [Department] on [DepartmentDetail].[DepartmentID] = [Department].[DepartmentID] and [DepartmentDetail].[MotorMaintenanceRecordID] = " + masterID;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, detailGrid, detailDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }
    //加载流程处理信息数据
    function getWorkflowActivityInstanceList(masterID) {
        ISystemService.execQuery.sqlString = "SELECT [WorkflowActivityInstanceID],[WorkflowActivityInstanceName],[State],[Handler],convert(nvarchar(10),[EndTime],120),[Opinion] FROM [WorkflowActivityInstance] where ObjID = " + masterID;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, workflowActivityInstanceGrid, workflowActivityInstanceDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }
    //日期控件处理 
    var dateboxArray = [];
    dateboxArray.push(toolBar.getInput("begincreateDate"));
    dateboxArray.push(toolBar.getInput("endcreateDate"));
    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');
})