
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, dhxLayout, pictureToolBar, pictureDataView, divUploadLayout, uploadFile, documentToolBar,
        documentGrid, detailGrid, workflowActivityInstanceGrid, maintenanceTypeGrid, processControlForm, currentMaintenanceRecordID, attachmentGrid,
      motorMaintenanceRecord = null,
	  editItem = $("#editItem"),
	  pictureDataList = [],
	  documentDataList = new rock.JsonList(),
      attachmentDataList = new rock.JsonList(),
      workflowActivityInstanceDataList = new rock.JsonList(),
      maintenanceTypeDataList = new rock.JsonList(),
      detailDataList = new rock.JsonList(),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,MotorMaintenanceRecord,IMotorMaintenanceService,DepartmentDetail";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据
        sqlStr = "select top 100 [MotorMaintenanceRecord].[MotorMaintenanceRecordID],WorkflowToDoList.WorkflowToDoListID, [MotorMaintenanceRecord].[weituodanwei], [MotorMaintenanceRecord].[motorNumber], [MotorMaintenanceRecord].[motorModelNum], [MotorMaintenanceRecord].[motorMaintenanceRecordName], [MotorMaintenanceRecord].[equipmentName], [MotorMaintenanceRecord].[gongzuolinghao], [MotorMaintenanceRecord].[xiangmufuzeren], [MotorMaintenanceRecord].[state], [MotorMaintenanceRecord].[waiWeiState], [Department].[DepartmentName], [MotorMaintenanceRecord].[MaintenanceType] from [MotorMaintenanceRecord] join [Department] on [MotorMaintenanceRecord].[departmentID] = [Department].[departmentID] inner join WorkflowToDoList on (MotorMaintenanceRecord.MotorMaintenanceRecordID=WorkflowToDoList.ObjID) where MotorMaintenanceRecord.State='外委状态已确认' and WaiWeiZiXiu = '自修' and WaiWeiState = '确认需要外委' ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项
        //初始化通用参照
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';
                toolBar.setValue("begincreateDate", beginDate);
                toolBar.setValue("endcreateDate", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        //绑定控件失去焦点验证方法
        //MotorMaintenanceRecordClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });
    //界面布局
    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("a").attachObject("mainPage");
    dhxLayout.cells("b").setHeight(280);
    dhxLayout.cells("b").hideHeader();

    //上传文档布局页面
    divUploadLayout = new dhtmlXLayoutObject("divUpload", "1C");
    divUploadLayout.cells("a").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("detailDiv", "辅修班组", 80, 1);   
    tabbar.addTab("attachment", "施工方案/作业指导书", 180, 2);
   

    tabbar.addTab("document", "检修报告文档", 80, 3);
    tabbar.addTab("picture", "检修报告图片", 80, 4);
    tabbar.addTab("maintenanceType", "检修报告列表", 80, 5);
    tabbar.addTab("workflowActivityInstance", "流程处理信息", 80, 6);

    tabbar.tabs("detailDiv").setActive();
    tabbar.tabs("detailDiv").attachObject("detailDiv");
    tabbar.tabs("workflowActivityInstance").attachObject("workflowActivityInstanceDiv");
    tabbar.tabs("attachment").attachObject("attachmentDiv");
    tabbar.tabs("maintenanceType").attachObject("maintenanceTypeDiv");
    tabbar.tabs("document").attachObject("documentDiv");
    tabbar.tabs("picture").attachObject("pictureDiv");


    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("createDateBegin", null, "创建日期");
    toolBar.addInput("begincreateDate", null, "", 75);
    toolBar.addText("创建日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 75);
    toolBar.addButton("viewProcessControl", null, "查看流程控制卡");
    toolBar.addSeparator("sepQuery", null);
    //toolBar.addButton("viewRecord", null, "查看检修报告");
    //toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("submit", null, "提交");
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
                sqlStr = "select [MotorMaintenanceRecord].[MotorMaintenanceRecordID],WorkflowToDoList.WorkflowToDoListID, [MotorMaintenanceRecord].[weituodanwei], [MotorMaintenanceRecord].[motorNumber], [MotorMaintenanceRecord].[motorModelNum], [MotorMaintenanceRecord].[motorMaintenanceRecordName], [MotorMaintenanceRecord].[equipmentName], [MotorMaintenanceRecord].[gongzuolinghao], [MotorMaintenanceRecord].[xiangmufuzeren], [MotorMaintenanceRecord].[state], [MotorMaintenanceRecord].[waiWeiState], [Department].[DepartmentName], [MotorMaintenanceRecord].[MaintenanceType] from [MotorMaintenanceRecord] join [Department] on [MotorMaintenanceRecord].[departmentID] = [Department].[departmentID] inner join WorkflowToDoList on (MotorMaintenanceRecord.MotorMaintenanceRecordID=WorkflowToDoList.ObjID) where MotorMaintenanceRecord.State='外委状态已确认' and WaiWeiZiXiu = '自修' and WaiWeiState = '确认需要外委' ";
                sqlStr += " and [MotorMaintenanceRecord].[createDate] between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' ";
                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList)
                    }(ISystemService.execQuery.resultValue));
                }
                break;
            case "submit":
                var checked = listGrid.getCheckedRows(0);
                var rowids = checked.split(',');
                for (var i = 0; i < rowids.length; i++) {
                    IMotorMaintenanceService.checkMaintenanceRecordState.recordID = rowids[i];
                    IMotorMaintenanceService.checkMaintenanceRecordState.recordType = "MotorMaintenanceRecord";
                    IMotorMaintenanceService.checkMaintenanceRecordState.state = listGrid.cells(rowids[i], 10).getValue();
                    rock.AjaxRequest(IMotorMaintenanceService.checkMaintenanceRecordState, rock.exceptionFun);
                    if (IMotorMaintenanceService.checkMaintenanceRecordState.success) {
                        (function (e) {
                            if (e.value) {
                                var equistr = [];
                                equistr[0] = "Handler^" + decodeURI($.cookie('userTrueName'));
                                equistr[1] = "ObjType^MotorMaintenanceRecord";
                                equistr[2] = "ObjID^" + listGrid.cells(rowids[i], 1).getValue();
                                equistr[3] = "StateField^" + "WaiWeiState";
                                equistr[4] = "StateValue^" + "外委已上传";

                                //接收检修报告，触发工作流书签
                                ISystemService.resumeBookmark.workflowToDoListID = listGrid.cells(listGrid.cells(rowids[i], 1).getValue(), 2).getValue();
                                ISystemService.resumeBookmark.userID = $.cookie('userID');
                                ISystemService.resumeBookmark.exchangeParamLists = equistr;
                                rock.AjaxRequest(ISystemService.resumeBookmark, rock.exceptionFun);
                                if (ISystemService.resumeBookmark.success) {
                                    (function (e) {
                                        //修改检修记录状态
                                        ISystemService.excuteNoneReturnQuery.sqlString = "UPDATE [MotorMaintenanceRecord] SET [State] = '外委资料已上传' WHERE MotorMaintenanceRecordID =" + listGrid.cells(rowids[i], 1).getValue();
                                        rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);

                                        //确认不需要外委时修改流程控制卡第九项检验员字段修改检验员
                                        ISystemService.excuteNoneReturnQuery.sqlString = "UPDATE [ProcessControl] SET [caozuozhe] = '" + decodeURI($.cookie('userTrueName')) + "',cznyr= '" + rock.getCurrentDate() + "' WHERE xuhao =9 and MotorMaintenanceRecordID =" + listGrid.cells(rowids[i], 1).getValue();
                                        rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);

                                    }(ISystemService.resumeBookmark.resultValue));
                                }
                            }
                            else {
                                alert("电气检修流程已发生变化，请检查！");
                                return false;
                            }
                        }(IMotorMaintenanceService.checkMaintenanceRecordState.resultValue));
                    }
                }

                sqlStr = "select top 100 [MotorMaintenanceRecord].[MotorMaintenanceRecordID],WorkflowToDoList.WorkflowToDoListID, [MotorMaintenanceRecord].[weituodanwei], [MotorMaintenanceRecord].[motorNumber], [MotorMaintenanceRecord].[motorModelNum], [MotorMaintenanceRecord].[motorMaintenanceRecordName], [MotorMaintenanceRecord].[equipmentName], [MotorMaintenanceRecord].[gongzuolinghao], [MotorMaintenanceRecord].[xiangmufuzeren], [MotorMaintenanceRecord].[state], [MotorMaintenanceRecord].[waiWeiState], [Department].[DepartmentName], [MotorMaintenanceRecord].[MaintenanceType] from [MotorMaintenanceRecord] join [Department] on [MotorMaintenanceRecord].[departmentID] = [Department].[departmentID] inner join WorkflowToDoList on (MotorMaintenanceRecord.MotorMaintenanceRecordID=WorkflowToDoList.ObjID) where MotorMaintenanceRecord.State='外委状态已确认' and WaiWeiZiXiu = '自修' and WaiWeiState = '确认需要外委' ";
                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList);
                    }(ISystemService.execQuery.resultValue));
                }
                break;
            case "viewRecord":
                var rowID = listGrid.getCheckedRows(0);
                switch (listGrid.cells(rowID, 6).getValue()) {
                    case "电动机检修报告":
                        window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "djjxbg", "电机检修报告");
                        break;
                    case "电机换线检修报告":
                        window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "djhxjxbg", "电机换线检修报告");
                        break;
                    case "扬巴电机检修记录":
                        window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "ybdjjxbg", "扬巴电机检修记录");
                        break;
                    case "高压电机检修报告":
                        window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "gydjjxbg", "高压电机检修报告");
                        break;
                    case "轴瓦检修间隙测量记录表":
                        window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "djzwjxjl", "轴瓦检修间隙测量记录表");
                        break;
                    case "西门子标准电机检修记录":
                        window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "xmzbzdjjxjl", "西门子标准电机检修记录");
                        break;
                    case "西门子电机检测报告":
                        window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "xmzdjjcbg", "西门子电机检测报告");
                        break;
                }
                break;
            case "viewProcessControl":
                currentMaintenanceRecordID = listGrid.getCheckedRows(0);
                initProcessControlForm();
                fillProcessControlForm(currentMaintenanceRecordID);
                showProcessControlForm();
                break;
        }
    });


    //初始化检修资料列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,,委托单位,电机位号,电机型号,项目名称,出厂编号,工作令号,项目负责人,0,0,检修班组,检修方式");
    listGrid.setInitWidths("40,0,0,68,68,150,116,110,68,80,0,0,68,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,na,str,str,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        refreshPictureToolBarState();
        refreshDocumentToolBarState();
        return true;
    });
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getDetail(rowID);
        getWorkflowActivityInstanceList(rowID);
        getMaintenanceTypeList(rowID);
        getAttachmentFileList(rowID);
        getUploadDocument(rowID);
        getUploadPicture(rowID);
        return true;
    });
    listGrid.init();


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

    //初始化检修报告类型列表
    maintenanceTypeGrid = new dhtmlXGridObject("maintenanceTypeGrid");
    maintenanceTypeGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    maintenanceTypeGrid.setSkin("dhx_skyblue");
    maintenanceTypeGrid.setHeader("序号,,查看,检修报告类型");
    maintenanceTypeGrid.setInitWidths("40,0,40,*");
    maintenanceTypeGrid.setColAlign("center,left,center,left");
    maintenanceTypeGrid.setColSorting("na,na,na,str");
    maintenanceTypeGrid.setColTypes("cntr,ro,img,ro");
    //选中事件
    maintenanceTypeGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        if (cIndex == 2) {
            switch (maintenanceTypeGrid.cells(rowID, 3).getValue()) {
                case "电动机检修报告":
                    window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "djjxbg", "电机检修报告");
                    break;
                case "电机换线检修报告":
                    window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "djhxjxbg", "电机换线检修报告");
                    break;
                case "扬巴电机检修记录":
                    window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "ybdjjxbg", "扬巴电机检修记录");
                    break;
                case "高压电机检修报告":
                    window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "gydjjxbg", "高压电机检修报告");
                    break;
                case "轴瓦检修间隙测量记录表":
                    window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "djzwjxjl", "轴瓦检修间隙测量记录表");
                    break;
                case "西门子标准电机检修记录":
                    window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "xmzbzdjjxjl", "西门子标准电机检修记录");
                    break;
                case "西门子电机检测报告":
                    window.parent.openMotorMaintenanceRecordManage(rowID, "查看", "xmzdjjcbg", "西门子电机检测报告");
                    break;
            }
        }
    });
    maintenanceTypeGrid.init();

    //附件列表
    attachmentGrid = new dhtmlXGridObject("attachmentGrid");
    attachmentGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    attachmentGrid.setSkin("dhx_skyblue");
    attachmentGrid.setHeader("选择,,文档名称,文档类型,上传时间,文档格式,上传人,");
    attachmentGrid.setInitWidths("45,0,*,100,100,100,80,0");
    attachmentGrid.setColAlign("center,left,left,left,left,left,left,left");
    attachmentGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
    attachmentGrid.setColSorting("cntr,na,str,str,str,str,str,na");
    attachmentGrid.enableDistributedParsing(true, 20);
    attachmentGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        if (attachmentGrid.cells(rowID, 5).getValue() == '.txt') {
            var winname = window.open("\\Upload\\" + attachmentGrid.cells(rowID, 7).getValue());
            winname.document.execCommand('Saveas', false, "\\Upload\\" + attachmentGrid.cells(rowID, 7).getValue());
            winname.close();
        } else {
            window.location.href = "\\Upload\\" + attachmentGrid.cells(rowID, 7).getValue();
        }
    });
    attachmentGrid.init();

    //初始化上传文档工具栏
    documentToolBar = new dhtmlXToolbarObject("documentToolBar");
    documentToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    documentToolBar.setSkin("dhx_skyblue");
    documentToolBar.addButton("upload", 2, "上传", "add.png", "addDisabled.png");
    documentToolBar.addSeparator("001", 1);
    documentToolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
    documentToolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "upload":
                var objectID = listGrid.getCheckedRows(0);
                divUploadLayout.cells("a").attachURL("../view/UploadFile.html?objectID=" + objectID + "&objectType=MotorMaintenanceRecord");
                showUploadFile();
                break;
            case "delete":
                var checked = documentGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的记录吗?")) {
                    var rowids = checked.split(',');
                    var userRoleRelateExist = false;
                    for (var i = 0; i < rowids.length; i++) {
                        ISystemService.deleteUploadFile.uploadFileID = rowids[i];
                        rock.AjaxRequest(ISystemService.deleteUploadFile, rock.exceptionFun);
                        if (ISystemService.deleteUploadFile.success) {
                            (function (e) {
                                for (var j = 0; j < documentDataList.rows.length; j++) {
                                    if (documentDataList.rows[j].id == rowids[i]) {
                                        documentDataList.rows.splice(j, 1);
                                        documentGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(ISystemService.deleteUploadFile.resultValue));
                        }
                    }
                    refreshDocumentToolBarState();
                }
                break;
        }
    });

    documentGrid = new dhtmlXGridObject("documentGrid");
    documentGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    documentGrid.setSkin("dhx_skyblue");
    documentGrid.setHeader("选择,,文档名称,文档类型,上传时间,文档格式,上传人,");
    documentGrid.setInitWidths("45,0,*,100,100,100,80,0");
    documentGrid.setColAlign("center,left,left,left,left,left,left,left");
    documentGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
    documentGrid.setColSorting("na,na,str,str,str,str,str,na");
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
    //单击选中取消
    documentGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshDocumentToolBarState();
        return true;
    });
    documentGrid.init();

    //初始化上传图片工具栏
    pictureToolBar = new dhtmlXToolbarObject("pictureToolBar")
    pictureToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    pictureToolBar.setSkin("dhx_skyblue");
    pictureToolBar.addButton("upload", 2, "上传", "add.png", "addDisabled.png");
    pictureToolBar.addSeparator("001", 1);
    pictureToolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
    pictureToolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "upload":
                var objectID = listGrid.getCheckedRows(0);
                divUploadLayout.cells("a").attachURL("../view/UploadPicture.html?objectID=" + objectID + "&objectType=MotorMaintenanceRecord");
                showUploadFile();
                break;
            case "delete":
                var checked = pictureDataView.getSelected();
                if (confirm("您确定要删除选定的记录吗?")) {
                    if (typeof (checked) == 'string') {
                        ISystemService.deleteUploadFile.uploadFileID = checked;
                        rock.AjaxRequest(ISystemService.deleteUploadFile, rock.exceptionFun);
                        if (ISystemService.deleteUploadFile.success) {
                            (function (e) {
                                for (var j = 0; j < pictureDataList.length; j++) {
                                    if (pictureDataList[j].id == checked) {
                                        pictureDataList.splice(j, 1);
                                        break;
                                    }
                                }
                            }(ISystemService.deleteUploadFile.resultValue));
                        }
                        pictureDataView.clearAll();
                        pictureDataView.parse(pictureDataList, "json");
                        refreshPictureToolBarState();
                        break;
                    }
                    else if (typeof (checked) == 'object') {
                        for (var i = 0; i < checked.length; i++) {
                            ISystemService.deleteUploadFile.uploadFileID = checked[i];
                            rock.AjaxRequest(ISystemService.deleteUploadFile, rock.exceptionFun);
                            if (ISystemService.deleteUploadFile.success) {
                                (function (e) {
                                    for (var j = 0; j < pictureDataList.length; j++) {
                                        if (pictureDataList[j].id == checked[i]) {
                                            pictureDataList.splice(j, 1);
                                            pictureDataView.move(checked[i], 0);
                                            break;
                                        }
                                    }
                                }(ISystemService.deleteUploadFile.resultValue));
                            }
                        }
                        pictureDataView.clearAll();
                        pictureDataView.parse(pictureDataList, "json");
                        refreshPictureToolBarState();
                        break;
                    }
                }
                break;
        }
    });

    pictureDataView = new dhtmlXDataView({
        container: "pictureDataView",
        type: {
            template: "<img src='#filePath#' style='width:200px ;height:135px'> </img><br/>#fileName#",
            height: 140,
            width: 200
        }
    });
    //单击选中取消
    pictureDataView.attachEvent("onItemClick", function (id, ev, html) {
        pictureToolBar.enableItem("delete");
        return true;
    });
    //单击选中取消
    pictureDataView.attachEvent("onItemDblClick", function (id, ev, html) {
        pictureToolBar.enableItem("delete");
        window.open(pictureDataView.get(id).filePath);
        return true;
    });

    refreshPictureToolBarState();
    refreshDocumentToolBarState();

    //文档上传
    uploadFile = $("#uploadFile");
    uploadFile.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                uploadFile.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    uploadFile.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideUploadFile();
    function hideUploadFile() {
        uploadFile.hide();
        uploadFile.css("visibility", "visible");

    }
    function showUploadFile() {
        uploadFile.css({ top: 20, left: 30 }).show();
    }

    //文档上传界面关闭按钮
    $("#uploadFile_Close").click(function () {
        hideUploadFile();
        if (tabbar.getActiveTab() == "picture") {
            getUploadPicture(listGrid.getCheckedRows(0));
        }
        else if (tabbar.getActiveTab() == "document") {
            getUploadDocument(listGrid.getCheckedRows(0));
        }
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

    //加载检修报告类型数据
    function getMaintenanceTypeList(masterID) {
        maintenanceTypeGrid.clearAll();
        maintenanceTypeDataList.rows = [];
        ISystemService.execQuery.sqlString = "SELECT [MotorMaintenanceReportID],[ReportType] FROM [MotorMaintenanceReport] where MotorMaintenanceRecordID = " + masterID;
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
                        listdata.data[1] = rowResult[0].value;
                        listdata.data[2] = "/resource/dhtmlx/codebase/imgs/search.gif";
                        listdata.data[3] = rowResult[1].value;

                        maintenanceTypeDataList.rows.push(listdata);
                    }
                    maintenanceTypeGrid.parse(maintenanceTypeDataList, "json");
                }
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
    //选中电机检修记录时，更新附件列表
    function getAttachmentFileList(rowID) {
        attachmentGrid.clearAll();
        attachmentDataList.rows = [];
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[FileType],[UploadTime],[FileFormat],[Uploader],[ServerFileName] FROM [UploadFile] where [FileType] = '文档' and [ObjectType] in ('KnowledgeBase','attachment') and [ObjectID] = " + rowID + "  order by UploadTime desc";
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
                        attachmentDataList.rows.push(listdata);
                    }
                    attachmentGrid.parse(attachmentDataList, "json");
                }
            }(ISystemService.execQuery.resultValue));
        }
    }
    function getUploadPicture(rowID) {
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[ServerFileName] FROM [UploadFile] where [FileType] ='图片' and ObjectType ='MotorMaintenanceRecord' and [ObjectID] = " + rowID + " order by UploadTime desc";
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
    function getUploadDocument(rowID) {
        documentGrid.clearAll();
        documentDataList.rows = [];
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[FileType],UploadTime,[FileFormat],[Uploader],[ServerFileName] FROM [UploadFile] where [FileType] = '文档' and ObjectType ='MotorMaintenanceRecord' and [ObjectID] = " + rowID + "  order by UploadTime desc";
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

    //初始化流程控制卡编辑表单
    function initProcessControlForm() {
        for (var i = 0; i < 15; i++) {
            $("#caozuozhe" + (i + 1)).val("");
            $("#cznyr" + (i + 1)).val("");
            $("#jianyanyuan" + (i + 1)).val("");
            $("#jynyr" + (i + 1)).val("");
            $("#beizhu" + (i + 1)).val("");
        }
        $("#sfgzdj").val("否");
        $("#gzxx").val("");
        $("#jxccclzcsfhd").val("");
        $("#jxccclzcsffhd").val("");
        $("#jxccclzjfhd").val("");
        $("#jxccclzjffhd").val("");
        $("#ccfhzcsfhd").val("");
        $("#ccfhzzsffhd").val("");
        $("#ccfhzjfhd").val("");
        $("#ccfhzjffhd").val("");
        $("#kzdla").val("");
        $("#kzdlb").val("");
        $("#kzdlc").val("");
        $("#zdfhdsp").val("");

        $("#zdfhdcz").val("");
        $("#zdfhdzx").val("");
        $("#zdffhdsp").val("");
        $("#zdffhdcz").val("");

        $("#zdffhdzx").val("");
        $("#wdfhd").val("");
        $("#wdffhd").val("");
        $("#bianzhi").val("");
        $("#shenhe").val("");
        $("#pageCount").val("");
        $("#pageIndex").val("");
    }
    //填充流程控制卡编辑表单
    function fillProcessControlForm(motorMaintenanceRecordID) {
        IMotorMaintenanceService.getMotorMaintenanceRecordByID.motorMaintenanceRecordID = motorMaintenanceRecordID;
        rock.AjaxRequest(IMotorMaintenanceService.getMotorMaintenanceRecordByID, rock.exceptionFun);
        if (IMotorMaintenanceService.getMotorMaintenanceRecordByID.success) {
            (function (e) {
                motorMaintenanceRecord = e;
                ISystemService.executeScalar.sqlString = "select DepartmentName from [Department] where [DepartmentID] = " + motorMaintenanceRecord.departmentID;
                rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                var warehouseName = null;
                if (ISystemService.executeScalar.success) {
                    (function (e) {
                        $("#departmentName").val(e.value);
                    }(ISystemService.executeScalar.resultValue));
                }
                $("#sfgzdj").val(motorMaintenanceRecord.sfgzdj);
                $("#gzxx").val(motorMaintenanceRecord.gzxx);
                $("#equipmentName").val(motorMaintenanceRecord.equipmentName);
                $("#dianjiweihao").val(motorMaintenanceRecord.motorNumber);
                $("#gongzuolinghao").val(motorMaintenanceRecord.gongzuolinghao);
                $("#kapianhao").val(motorMaintenanceRecord.kapianhao);
                $("#departmentID").val(motorMaintenanceRecord.departmentID);
                $("#xiangmufuzeren").val(motorMaintenanceRecord.xiangmufuzeren);
                var referSql = "SELECT[ProcessControlID],[xuhao],[gxzylc],[caozuozhe],convert(nvarchar(10),[cznyr],120),[jianyanyuan],convert(nvarchar(10),[jynyr],120),[jxccclzcsfhd],[jxccclzcsffhd],[jxccclzjfhd],[jxccclzjffhd],[kzdla],[kzdlb],[kzdlc],[zdfhdsp],[zdfhdcz],[zdfhdzx],[zdffhdsp],[zdffhdcz],[zdffhdzx],[wdfhd],[wdffhd],[beizhu],[ccfhzcsfhd],[ccfhzzsffhd],[ccfhzjfhd],[ccfhzjffhd],[bianzhi],[shenhe],[pageCount],[pageIndex]FROM[ProcessControl] where [MotorMaintenanceRecordID]=" + motorMaintenanceRecordID + " order by xuhao";
                ISystemService.execQuery.sqlString = referSql;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            if (rows.length == 0) {
                                processControlEditState = "add";
                            }
                            else if (rows.length != 0) {
                                processControlEditState = "modify";
                                for (var i = 0; i < rows.length; i++) {
                                    var rowResult = rows[i].values;
                                    $("#caozuozhe" + (i + 1)).val(rowResult[3].value);
                                    $("#cznyr" + (i + 1)).val(rowResult[4].value);
                                    $("#jianyanyuan" + (i + 1)).val(rowResult[5].value);
                                    $("#jynyr" + (i + 1)).val(rowResult[6].value);
                                    $("#beizhu" + (i + 1)).val(rowResult[22].value);
                                    switch (rowResult[1].value) {
                                        case "8":
                                            $("#jxccclzcsfhd").val(rowResult[7].value);
                                            $("#jxccclzcsffhd").val(rowResult[8].value);
                                            $("#jxccclzjfhd").val(rowResult[9].value);
                                            $("#jxccclzjffhd").val(rowResult[10].value);
                                            break;
                                        case "10":
                                            $("#ccfhzcsfhd").val(rowResult[23].value);
                                            $("#ccfhzzsffhd").val(rowResult[24].value);
                                            $("#ccfhzjfhd").val(rowResult[25].value);
                                            $("#ccfhzjffhd").val(rowResult[26].value);
                                            break;
                                        case "13":
                                            $("#kzdla").val(rowResult[11].value);
                                            $("#kzdlb").val(rowResult[12].value);
                                            $("#kzdlc").val(rowResult[13].value);
                                            $("#zdfhdsp").val(rowResult[14].value);

                                            $("#zdfhdcz").val(rowResult[15].value);
                                            $("#zdfhdzx").val(rowResult[16].value);
                                            $("#zdffhdsp").val(rowResult[17].value);
                                            $("#zdffhdcz").val(rowResult[18].value);

                                            $("#zdffhdzx").val(rowResult[19].value);
                                            $("#wdfhd").val(rowResult[20].value);
                                            $("#wdffhd").val(rowResult[21].value);
                                            break;
                                        case "15":
                                            $("#bianzhi").val(rowResult[27].value);
                                            $("#shenhe").val(rowResult[28].value);
                                            $("#pageCount").val(rowResult[29].value);
                                            $("#pageIndex").val(rowResult[30].value);
                                            break;
                                    }
                                }
                            }
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }(IMotorMaintenanceService.getMotorMaintenanceRecordByID.resultValue));
        }

    }

    processControlForm = $("#processControlForm");
    processControlForm.height(220);
    processControlForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                processControlForm.css({
                    "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY)
                });
            });
        }
    });
    processControlForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideProcessControlForm();
    function hideProcessControlForm() {
        processControlForm.css({
            top: 200, left: -1300
        }).hide();
        processControlForm.css("visibility", "visible");
    }
    function showProcessControlForm() {
        processControlForm.css({ top: 20, left: 180 }).show();
    }
    //关闭
    $("#processControl_Close").click(function () {
        hideProcessControlForm();
    });

    //工具栏提交按钮状态控制
    function submitBtnState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            return false;
        }
        else {
            return true;
        }
    }
    //工具栏查看按钮状态控制
    function viewBtnState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked != "" && rowids.length == 1) {
            return true;
        }
        else {
            return false;
        }
    }
    //工具栏按钮状态控制
    function refreshToolBarState() {
        if (submitBtnState()) {
            toolBar.enableItem("submit");
        }
        else {
            toolBar.disableItem("submit");
        }
        if (viewBtnState()) {
            toolBar.enableItem("viewProcessControl");
            //toolBar.enableItem("viewRecord");
        }
        else {
            toolBar.disableItem("viewProcessControl");
            //toolBar.disableItem("viewRecord");
        }
    }
    //文档上传按钮状态控制
    function refreshDocumentToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            documentToolBar.disableItem("upload");
            documentToolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                documentToolBar.disableItem("upload");
            }
            else {
                documentToolBar.enableItem("upload");
            }
        }
        var checked = documentGrid.getCheckedRows(0);
        if (checked == "") {
            documentToolBar.disableItem("delete");
        }
        else {
            documentToolBar.enableItem("delete");
        }
    }
    //图片上传按钮状态控制
    function refreshPictureToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            pictureToolBar.disableItem("upload");
            pictureToolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                pictureToolBar.disableItem("upload");
            }
            else {
                pictureToolBar.enableItem("upload");
            }
        }

        var checked = pictureDataView.getSelected();
        if (checked == "") {
            pictureToolBar.disableItem("delete");
        }
        else {
            pictureToolBar.enableItem("delete");
        }
    }


    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("begincreateDate"));

    dateboxArray.push(toolBar.getInput("endcreateDate"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})