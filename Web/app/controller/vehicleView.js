
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, dictDataList, sqlStr, serverDate, dhxLayout, pictureDataView, uploadFile, documentGrid,
      vehicle = null,
	  editItem = $("#editItem"),
	  pictureDataList = [],
	  documentDataList = new rock.JsonList(),
      vehicleID = decodeURI($.getUrlParam("ID")),
    dictDataList = new rock.JsonList();

    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Vehicle,Carrier";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据
        ISystemService.getDynObjectByID.dynObjectID = vehicleID;
        ISystemService.getDynObjectByID.structName = "Vehicle";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                vehicle = e;
                $("#txtvehicleNum").val(vehicle.vehicleNum);

                ISystemService.getObjectProperty.objName = "Carrier";
                ISystemService.getObjectProperty.property = "CarrierName";
                ISystemService.getObjectProperty.ojbID = vehicle.carrierID;
                rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                if (ISystemService.getObjectProperty.success) {
                    (function (e) {
                        $("#txtbocarrier").val(e.value);
                    }(ISystemService.getObjectProperty.resultValue));
                }

                $("#txtapprovedLoad").val(vehicle.approvedLoad);

                $("#txtcargo").val(vehicle.cargo);
                $("#txtheadTransportDate").val(vehicle.headTransportDate.split(' ')[0]);

                $("#txtheadDrivingDate").val(vehicle.headDrivingDate.split(' ')[0]);

                $("#txttrailerTransportDate").val(vehicle.trailerTransportDate.split(' ')[0]);

                $("#txttrailerDrivingDate").val(vehicle.trailerDrivingDate.split(' ')[0]);
                $("#txtcontainerCheckDate").val(vehicle.containerCheckDate.split(' ')[0]);

                $("#txtyangziTransportDate").val(vehicle.yangziTransportDate.split(' ')[0]);
                $("#txtpoliceDate").val(vehicle.policeDate.split(' ')[0]);
                $("#txtrecommend").val(vehicle.recommend);
                $("#txtauditOpinion").val(vehicle.auditOpinion);
                $("#txtauditDepart").val(vehicle.auditDepart);
                $("#txtauditor").val(vehicle.auditor);
                $("#txtissueDate").val(vehicle.issueDate.split(' ')[0]);
                $("#txtcomment").val(vehicle.comment);

                getUploadDocument(vehicleID);
                getUploadPicture(vehicleID);


            }(ISystemService.getDynObjectByID.resultValue));
        }

    });
    //界面布局
    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("a").attachObject("mainPage");
    dhxLayout.cells("b").setHeight(280);
    dhxLayout.cells("b").hideHeader();


    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("document", "文档", 80, 1);
    tabbar.addTab("picture", "图片", 80, 1);

    tabbar.tabs("document").setActive();
    tabbar.tabs("document").attachObject("documentDiv");
    tabbar.tabs("picture").attachObject("pictureDiv");


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
        window.open("\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
        //if (documentGrid.cells(rowID, 5).getValue() == '.txt') {
        //    var winname = window.open("\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
        //    winname.document.execCommand('Saveas', false, "\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
        //    winname.close();
        //} else {
        //    window.location.href = "\\Upload\\" + documentGrid.cells(rowID, 7).getValue();
        //}
    });
    //单击选中取消
    documentGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshDocumentToolBarState();
        return true;
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


    function getUploadPicture(rowID) {
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[ServerFileName] FROM [UploadFile] where [FileType] ='图片' and [ObjectID] = " + rowID + " order by UploadTime desc";
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
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[FileType],[UploadTime],[FileFormat],[Uploader],[ServerFileName] FROM [UploadFile] where [FileType] = '文档' and [ObjectID] = " + rowID + "  order by UploadTime desc";
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
})