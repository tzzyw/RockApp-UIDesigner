﻿
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, masterGrid, detailGrid, sqlStr, tabbar, workflowHistoryGrid, documentGrid, pictureDataView,
	pictureDataList = [],
	viewImg = "/resource/dhtmlx/codebase/imgs/own/view.png",
    masterDataList = new rock.JsonList(),
    detailDataList = new rock.JsonList(),
	documentDataList = new rock.JsonList(),
	workflowHistoryDataList = new rock.JsonList();
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn";
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

        //处理初始化加载数据

        sqlStr = "select top 200 [MotorMaintenanceRecord].[MotorMaintenanceRecordID], [MotorMaintenanceRecord].[weituodanwei], [MotorMaintenanceRecord].[motorNumber], [MotorMaintenanceRecord].[motorModelNum], [MotorMaintenanceRecord].[motorMaintenanceRecordName], [MotorMaintenanceRecord].[equipmentName], [MotorMaintenanceRecord].[gongzuolinghao], [MotorMaintenanceRecord].[xiangmufuzeren], [MotorMaintenanceRecord].[state], [Department].[DepartmentName], [MotorMaintenanceRecord].[MaintenanceType] from [MotorMaintenanceRecord] join [Department] on [MotorMaintenanceRecord].[departmentID] = [Department].[departmentID]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToBillViewGrid(e, masterGrid, masterDataList, viewImg);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项


        //初始化通用参照






    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("masterDiv");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("b").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("detailDiv", "委托单明细", 80, 1);
    tabbar.addTab("document", "文档", 80, 2);
    tabbar.addTab("picture", "图片", 80, 3);
    tabbar.addTab("workflowHistoryDiv", "流程处理信息", 80, 4);



    tabbar.tabs("detailDiv").setActive();
    tabbar.tabs("detailDiv").attachObject("detailDiv");
    tabbar.tabs("workflowHistoryDiv").attachObject("workflowHistoryDiv");
    tabbar.tabs("document").attachObject("documentDiv");
    tabbar.tabs("picture").attachObject("pictureDiv");


    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("createDateBegin", null, "创建日期");
    toolBar.addInput("begincreateDate", null, "", 75);
    toolBar.addText("创建日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 75);



    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);

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


                sqlStr = "select [MotorMaintenanceRecord].[MotorMaintenanceRecordID], [MotorMaintenanceRecord].[weituodanwei], [MotorMaintenanceRecord].[motorNumber], [MotorMaintenanceRecord].[motorModelNum], [MotorMaintenanceRecord].[motorMaintenanceRecordName], [MotorMaintenanceRecord].[equipmentName], [MotorMaintenanceRecord].[gongzuolinghao], [MotorMaintenanceRecord].[xiangmufuzeren], [MotorMaintenanceRecord].[state], [Department].[DepartmentName], [MotorMaintenanceRecord].[MaintenanceType] from [MotorMaintenanceRecord] join [Department] on [MotorMaintenanceRecord].[departmentID] = [Department].[departmentID]";

                sqlStr += " where [MotorMaintenanceRecord].[createDate] between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' ";



                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToBillViewGrid(e, masterGrid, masterDataList, viewImg);
                    }(ISystemService.execQuery.resultValue));
                }
                break;

        }
    });



    //初始化主表列表
    masterGrid = new dhtmlXGridObject("masterGrid");
    masterGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    masterGrid.setSkin("dhx_skyblue");


    masterGrid.setHeader("序号,,查看,委托单位,电机位号,电机型号,项目名称,选择设备,工作令号,项目负责人,状态,检修班组,检修方式");
    masterGrid.setInitWidths("40,0,40,68,68,68,116,68,68,80,90,68,*");
    masterGrid.setColAlign("center,left,center,left,left,left,left,left,left,left,left,left,left");
    masterGrid.setColSorting("na,na,na,str,str,str,str,str,str,str,str,str,str");
    masterGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    masterGrid.enableDistributedParsing(true, 20);
    masterGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getDetail(rowID);
        getAttachmentFileList(rowID);
        getUploadDocument(rowID);
        getUploadPicture(rowID);
        getMaintenanceTypeList(rowID);
        getWorkflowActivityInstanceList(rowID);
        if (cIndex == 2) {
            alert("请导航到查看明细页面!");
        }
    });
    masterGrid.init();


    //初始化明细表表列表
    detailGrid = new dhtmlXGridObject("detailGrid");
    detailGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    detailGrid.setSkin("dhx_skyblue");


    detailGrid.setHeader("序号,,部门名称,备注");
    detailGrid.setInitWidths("40,0,100,*");
    detailGrid.setColAlign("center,left,left,left");
    detailGrid.setColSorting("na,na,str,str");
    detailGrid.setColTypes("cntr,ro,ro,ro");
    detailGrid.enableDistributedParsing(true, 20);
    detailGrid.init();

    //初始化流程处理信息列表
    workflowHistoryGrid = new dhtmlXGridObject("workflowHistoryGrid");
    workflowHistoryGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    workflowHistoryGrid.setSkin("dhx_skyblue");
    workflowHistoryGrid.setHeader("序号,,节点名称,执行时间,执行者,审批意见");
    workflowHistoryGrid.setInitWidths("40,0,200,120,100,*");
    workflowHistoryGrid.setColAlign("center,left,left,left,left,left");
    workflowHistoryGrid.setColSorting("na,na,str,str,str,str");
    workflowHistoryGrid.setColTypes("cntr,ro,ro,ro,ro,ro");
    workflowHistoryGrid.enableDistributedParsing(true, 20);
    workflowHistoryGrid.init();


    //初始上传文档列表
    documentGrid = new dhtmlXGridObject("documentGrid");
    documentGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    documentGrid.setSkin("dhx_skyblue");
    documentGrid.setHeader("序号,,文档名称,文档类型,上传时间,文档格式,上传人,");
    documentGrid.setInitWidths("45,0,*,100,120,100,80,0");
    documentGrid.setColAlign("center,left,left,left,left,left,left,left");
    documentGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
    documentGrid.setColSorting("cntr,na,str,str,str,str,str,na");
    documentGrid.enableDistributedParsing(true, 20);
    documentGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        if (documentGrid.cells(rowID, 5).getValue() == '.txt') {
            var winname = window.open("\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
            winname.document.execCommand('Saveas', false, "\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
            winname.close();
        } else {
            window.location.href = "\\Upload\\" + documentGrid.cells(rowID, 7).getValue();
        }
    });
    documentGrid.init();

    pictureDataView = new dhtmlXDataView({
        container: "pictureDataView",
        type: {
            template: "<img src='#filePath#' style='width:200px ;height:135px'> </img><br/>#fileName#",
            height: 140,
            width: 200
        }
    });
    //单击选中取消
    pictureDataView.attachEvent("onItemDblClick", function (id, ev, html) {
        window.open(pictureDataView.get(id).filePath);
        return true;
    });











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
    function getWorkflowHistoryList(masterID) {
        ISystemService.execQuery.sqlString = "SELECT [WorkflowActivityInstanceID],[WorkflowActivityInstanceName],[EndTime],[Handler],[Opinion],convert(nvarchar(10),[EndTime],120) FROM [WorkflowActivityInstance] where [State] <> '正在执行' and ObjID = " + masterID;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, workflowHistoryGrid, workflowHistoryDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }

    //获取上传文档列表
    function getUploadDocument(rowID) {
        documentGrid.clearAll();
        documentDataList.rows = [];
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[FileType],[UploadTime],[FileFormat],[Uploader],[ServerFileName] FROM [UploadFile] where [FileType] = '文档' and ObjectType ='检修资料' and [ObjectID] = " + rowID + "  order by UploadTime desc";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var colLength = e.columns.length;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(rowResult[0].value);
                        listdata.data[0] = 0;
                        for (var j = 0; j < colLength; j++) {
                            listdata.data[j + 1] = rowResult[j].value;
                        }
                        documentDataList.rows.push(listdata);
                    }
                    documentGrid.parse(documentDataList, "json");
                }
            }(ISystemService.execQuery.resultValue));
        }
    }
    //获取上传图片缩略图
    function getUploadPicture(rowID) {
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[ServerFileName] FROM [UploadFile] where [FileType] ='图片' and ObjectType ='检修资料' and [ObjectID] = " + rowID + " order by UploadTime desc";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    pictureDataView.clearAll();
                    pictureDataList = [];
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(rowResult[0].value);
                        listdata.fileName = rowResult[1].value.split('.')[0];
                        listdata.filePath = "\\Upload\\" + rowResult[2].value;

                        pictureDataList.push(listdata);
                    }
                    pictureDataView.parse(pictureDataList, "json");
                }
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