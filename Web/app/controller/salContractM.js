var closeUpload = null;
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, dictDataList, sqlStr, serverDate, dhxLayout, divUploadLayout, uploadFile, documentToolBar, documentGrid, auditHistoryGrid,
      contract = null,
	  pictureDataList = [],
	  documentDataList = new rock.JsonList(),
      dictDataList = new rock.JsonList(),
      auditHistoryDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Contract,Customer,Material,IBusinessService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
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

        //处理初始化加载数据
        sqlStr = "select top 100 [Contract].[ContractID], [Contract].[contractNum], [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity], [Contract].[State], case closed when '0' then '否' when '1' then '是' end  , [Contract].[Causes] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[ContractType] = '销售' and [Contract].[Agent] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }       

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
    tabbar.addTab("document", "附件", 80, 1);
    tabbar.addTab("history", "合同审批历史", 100, 2);

    tabbar.tabs("document").setActive();
    tabbar.tabs("document").attachObject("documentDiv");
    tabbar.tabs("history").attachObject("auditHistoryDiv");

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);
    toolBar.addText("createDateBegin", null, "创建日期");
    toolBar.addInput("begincreateDate", null, "", 65);
    toolBar.addText("创建日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 65);
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

                sqlStr = "select [Contract].[ContractID], [Contract].[contractNum], [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity], [Contract].[State],case closed when '0' then '否' when '1' then '是' end, [Contract].[Causes] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[ContractType] = '销售' and [Contract].[Agent] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";

                if (toolBar.getValue("txtcustomerSearch") != "") {
                    sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
                }

                sqlStr += " and [Contract].[createDate] between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' ";

                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList);
                        getUploadDocument();
                    }(ISystemService.execQuery.resultValue));
                }
                break;          
        }
    });



    //初始化销售合同列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,合同编号,客户名称,签定日期,产品名称,产品单价,合同数量,状态,是否关闭,合同事由");
    listGrid.setInitWidths("40,0,80,150,80,100,80,80,60,65,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,center,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
      
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshDocumentToolBarState();
        return true;
    });
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getUploadDocument(rowID);
        getauditHistoryList(rowID);
        return true;
    });
    listGrid.init();

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
                divUploadLayout.cells("a").attachURL("../view/UploadFile.html?objectID=" + objectID + "&objectType=销售合同");
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

    refreshDocumentToolBarState();

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
            ISystemService.execQuery.sqlString = "select [WorkflowActivityInstanceID], [Comment],[Opinion],[Handler],[Result],[EndTime] from [WorkflowActivityInstance] where [ObjType] = 'Contract' and [ObjID] = " + rowID;
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
        getUploadDocument(listGrid.getCheckedRows(0));
        hideUploadFile();
    });

    function getUploadDocument(rowID) {
        documentGrid.clearAll();
        documentDataList.rows = [];
        if (rowID) {
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
    }

    closeUpload = function () {
        hideUploadFile();
        if (tabbar.getActiveTab() == "picture") {
            getUploadPicture(listGrid.getCheckedRows(0));
        }
        else if (tabbar.getActiveTab() == "document") {
            getUploadDocument(listGrid.getCheckedRows(0));
        }
    }
    //文档上传界面关闭按钮
    $("#uploadFile_Close").click(closeUpload);


    //文档上传按钮状态控制
    function refreshDocumentToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var state = null;
        var rowids = checked.split(',');
        if (checked == "") {
            documentToolBar.disableItem("upload");
            documentToolBar.disableItem("delete");
        }
        else {
            if (rowids.length == 1) {
                state = listGrid.cells(checked, 8).getValue();
                documentToolBar.enableItem("upload");
                //判断附件是否选中
                var docchecked = documentGrid.getCheckedRows(0);
                if (docchecked == "") {
                    documentToolBar.disableItem("delete");
                }
                else {
                    documentToolBar.enableItem("delete");
                }
            }
            else {
                documentToolBar.disableItem("upload");
                documentToolBar.disableItem("delete");
            }
        }
    }
    
    ////文档上传按钮状态控制
    //function refreshDocumentToolBarState() {
    //    var checked = listGrid.getCheckedRows(0);
    //    var rowids = checked.split(',');
    //    if (checked == "") {
    //        documentToolBar.disableItem("upload");
    //        documentToolBar.disableItem("delete");
    //    }
    //    else {
    //        if (rowids.length != 1) {
    //            documentToolBar.disableItem("upload");
    //        }
    //        else {
    //            documentToolBar.enableItem("upload");
    //        }
    //    }       
    //} 

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("begincreateDate"));

    dateboxArray.push(toolBar.getInput("endcreateDate"));

    dateboxArray.push("txtcreateDate");

    dateboxArray.push("txteffectiveDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})