
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, masterGrid, detailGrid, sqlStr, tabbar, pictureToolBar, pictureDataView, divUploadLayout, uploadFile, documentToolBar, documentGrid,
	editImg = "/resource/dhtmlx/codebase/imgs/edit.gif",
    disEditImg = "/resource/dhtmlx/codebase/imgs/own/edit.png",
	pictureDataList = [],
	documentDataList = new rock.JsonList(),
    masterDataList = new rock.JsonList(),
    detailDataList = new rock.JsonList();
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

        sqlStr = "select top 100 [MotorMaintenanceRecord].[MotorMaintenanceRecordID], [MotorMaintenanceRecord].[weituodanwei], [MotorMaintenanceRecord].[motorNumber], [MotorMaintenanceRecord].[motorModelNum], [MotorMaintenanceRecord].[motorMaintenanceRecordName], [MotorMaintenanceRecord].[equipmentName], [MotorMaintenanceRecord].[gongzuolinghao], [MotorMaintenanceRecord].[xiangmufuzeren], [MotorMaintenanceRecord].[state], [Department].[DepartmentName], [MotorMaintenanceRecord].[MaintenanceType] from [MotorMaintenanceRecord] join [Department] on [MotorMaintenanceRecord].[departmentID] = [Department].[departmentID]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToBillGrid(e, masterGrid, masterDataList, 8, editImg, disEditImg);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项


        //初始化通用参照






    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("masterDiv");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("b").hideHeader();

    //上传文档布局页面
    divUploadLayout = new dhtmlXLayoutObject("divUpload", "1C");
    divUploadLayout.cells("a").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("detailDiv", "委托单明细", 80, 1);
    tabbar.addTab("document", "文档", 80, 2);
    tabbar.addTab("picture", "图片", 80, 3);

    tabbar.tabs("detailDiv").setActive();
    tabbar.tabs("detailDiv").attachObject("detailDiv");
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

    toolBar.addButton("add", null, "新增");
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
                        rock.tableToBillGrid(e, masterGrid, masterDataList, 8, editImg, disEditImg);
                    }(ISystemService.execQuery.resultValue));
                }
                break;
            case "add":
                window.parent.openBillManage(null, "MotorMaintenanceRecordManage", "委托单维护");
                break;

        }
    });



    //初始化主表列表
    masterGrid = new dhtmlXGridObject("masterGrid");
    masterGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    masterGrid.setSkin("dhx_skyblue");


    masterGrid.setHeader("序号,,修改,委托单位,电机位号,电机型号,项目名称,选择设备,工作令号,项目负责人,状态,检修班组,主要检修内容");
    masterGrid.setInitWidths("40,0,40,68,68,68,116,68,68,80,90,68,*");
    masterGrid.setColAlign("center,left,center,left,left,left,left,left,left,left,left,left,left");
    masterGrid.setColSorting("na,na,na,str,str,str,str,str,str,str,str,str,str");
    masterGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    masterGrid.enableDistributedParsing(true, 20);
    masterGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getDetail(rowID);
        getUploadDocument(rowID);
        getUploadPicture(rowID);
        if (cIndex == 2) {
            window.parent.openBillManage(rowID, "MotorMaintenanceRecordManage", "委托单维护");
        }
        refreshPictureToolBarState();
        refreshDocumentToolBarState();
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
                var objectID = masterGrid.getSelectedRowId();
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
    documentGrid.setInitWidths("45,0,*,100,120,100,80,0");
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
                var objectID = masterGrid.getSelectedRowId(0);
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
    //双击查看选中
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
            getUploadPicture(masterGrid.getSelectedRowId());
        }
        else if (tabbar.getActiveTab() == "document") {
            getUploadDocument(masterGrid.getSelectedRowId());
        }
    });

    //文档上传按钮状态控制
    function refreshDocumentToolBarState() {
        var selectedId = masterGrid.getSelectedRowId();
        if (selectedId == null) {
            documentToolBar.disableItem("upload");
            documentToolBar.disableItem("delete");
        }
        else {
            documentToolBar.enableItem("upload");
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
        var selectedId = masterGrid.getSelectedRowId();
        if (selectedId == null) {
            pictureToolBar.disableItem("upload");
            pictureToolBar.disableItem("delete");
        }
        else {
            pictureToolBar.enableItem("upload");
        }

        var checked = pictureDataView.getSelected(0);
        if (checked == "") {
            pictureToolBar.disableItem("delete");
        }
        else {
            pictureToolBar.enableItem("delete");
        }
    }










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
    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("begincreateDate"));

    dateboxArray.push(toolBar.getInput("endcreateDate"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})