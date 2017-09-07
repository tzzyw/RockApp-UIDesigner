
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, tabbar, workflowHistoryGrid, documentGrid, pictureDataView,
		pictureDataList = [],
		user = null,
		editItem = $("#editItem"),
		dictDataList = new rock.JsonList(),
		documentDataList = new rock.JsonList(),
		workflowHistoryDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,User";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [User].[UserID], [User].[userName], [User].[trueName] from [User] where 1=1  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }


    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("dictDiv");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("b").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("document", "文档", 80, 1);
    tabbar.addTab("picture", "图片", 80, 2);
    tabbar.addTab("workflowHistoryDiv", "流程处理信息", 80, 3);

    tabbar.tabs("workflowHistoryDiv").setActive();
    tabbar.tabs("workflowHistoryDiv").attachObject("workflowHistoryDiv");
    tabbar.tabs("document").attachObject("documentDiv");
    tabbar.tabs("picture").attachObject("pictureDiv");

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("userName", null, "用户名称");
    toolBar.addInput("txtuserNameSearch", null, "", 100);


    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":


                sqlStr = "select [User].[UserID], [User].[userName], [User].[trueName] from [User] where 1=1 ";

                if (toolBar.getValue("txtuserNameSearch") != "") {
                    sqlStr += " and [User].[userName] like '%" + toolBar.getValue("txtuserNameSearch") + "%'";
                }



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



    //初始化用户列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("序号,,用户名,显示名");
    listGrid.setInitWidths("40,0,50,*");
    listGrid.setColAlign("center,left,left,left");
    listGrid.setColSorting("na,na,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getWorkflowHistoryList(rowID);
        getUploadDocument(rowID);
        getUploadPicture(rowID);
    });
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        alert("尚未设定查看明细弹窗!");
    });
    listGrid.init();

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

    //加载流程处理信息数据
    function getWorkflowHistoryList(masterID) {
        ISystemService.execQuery.sqlString = "SELECT [WorkflowActivityInstanceID],[WorkflowActivityInstanceName],[EndTime],[Handler],[Opinion] FROM [WorkflowActivityInstance] where [State] <> '正在执行' and ObjID = " + masterID;
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
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[FileType],[UploadTime],[FileFormat],[Uploader],[ServerFileName] FROM [UploadFile] where [FileType] = '文档' and [ObjectType] ='User' and [ObjectID] = " + rowID + "  order by UploadTime desc";
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
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[ServerFileName] FROM [UploadFile] where [FileType] ='图片' and [ObjectType] ='User' and [ObjectID] = " + rowID + " order by UploadTime desc";
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




})