var sensor,print;
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, dhxLayout, ladeBillDiv, ladeBillGrid,
        documentGrid,  auditHistoryGrid,
      contract = null,
	  editItem = $("#editItem"),
	  pictureDataList = [],
      ladeBillGridDataList = new rock.JsonList(),
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
        getDataList();
    });
    //界面布局
    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("a").attachObject("mainPage");
    dhxLayout.cells("b").setHeight(280);
    dhxLayout.cells("b").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("document", "附件", 80, 1);
    tabbar.addTab("history", "合同审批历史", 100, 2);
    tabbar.addTab("ladebill", "合同执行情况", 100, 3);

    tabbar.tabs("document").setActive();
    tabbar.tabs("document").attachObject("documentDiv");
    tabbar.tabs("history").attachObject("auditHistoryDiv");
    tabbar.tabs("ladebill").attachObject("ladeBillDiv");

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
                getDataList();
                break;
        }
    });


    //初始化销售合同列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("序号,,审批情况,打印,合同编号,客户名称,签定日期,产品名称,产品单价,合同数量,经办人,是否关闭,合同事由");
    listGrid.setInitWidths("40,0,65,40,80,150,80,100,80,80,60,65,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left,center,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,link,link,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑销售合同");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "Contract";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                contract = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtcontractNum").val(contract.contractNum);
        $("#txtpriceType").val(contract.priceType);
        $("#txtpayment").val(contract.payment);
        $("#txtship").val(contract.ship);
        $("#txtcreateDate").val(contract.createDate.split(' ')[0]);
        $("#txteffectiveDate").val(contract.effectiveDate.split(' ')[0]);
        $("#txtcustomerID").val(contract.customerID);
        ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + contract.customerID;
        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        var warehouseName = null;
        if (ISystemService.executeScalar.success) {
            (function (e) {
                $("#txtcustomer").val(e.value);
            }(ISystemService.executeScalar.resultValue));
        }
        $("#txtmaterial").val(listGrid.cells(rowID, 7).getValue());
        //rock.setSelectItem("combomaterial", contract.materialID, "value");
        //getMaterialGrade();
        //rock.setSelectItem("combomaterialGrade", contract.materialGrade, "text");
        $("#txtmaterialGrade").val(contract.materialGrade);
        $("#txtnumber").val(contract.number);
        $("#txtquantity").val(contract.quantity);
        $("#txtprice").val(contract.price);
        $("#txtpipePrice").val(contract.pipePrice);
        $("#txttotal").val(contract.total);
        $("#txtmeasure").val(contract.measure);
        $("#txtagent").val(contract.agent);
        $("#txtcauses").val(contract.causes);
        var state = listGrid.cells(rowID, 8).getValue();
        if (state == "已创建") {
            $("#btn_Save").attr("disabled", false);
        }
        else {
            $("#btn_Save").attr("disabled", true);
        }
        showEditForm();
    });
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getUploadDocument(rowID);
        getauditHistoryList(rowID);
        getladeBillList(rowID);
        return true;
    });
    listGrid.init();
        
    documentGrid = new dhtmlXGridObject("documentGrid");
    documentGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    documentGrid.setSkin("dhx_skyblue");
    documentGrid.setHeader("序号,,文档名称,文档类型,上传时间,文档格式,上传人,");
    documentGrid.setInitWidths("45,0,*,100,120,100,80,0");
    documentGrid.setColAlign("center,left,left,left,left,left,left,left");
    documentGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro");
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
    documentGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(450);
    editForm.width(720);
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
        editForm.css({ top: 80, left: 180 }).show();
    }
    //取消
    $("#btn_Cancle").click(function () {
        hideEditForm();
    });
    //关闭
    $("#img_Close").click(function () {
        hideEditForm();
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


    //初始化提货单列表
    ladeBillGrid = new dhtmlXGridObject("ladeBillGrid");
    ladeBillGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    ladeBillGrid.setSkin("dhx_skyblue");
    ladeBillGrid.setHeader("序号,,客户名称,产品名称,单价,计划量,实际量,车船号,提货日期,到站名称,状态");
    ladeBillGrid.setInitWidths("40,0,190,120,80,70,70,120,80,150,*");
    ladeBillGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    ladeBillGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    ladeBillGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    ladeBillGrid.init();

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

    //加载提货单数据
    function getladeBillList(rowID) {
        if (rowID) {
            ISystemService.execQuery.sqlString = "select [LadeBill].[LadeBillID], [Customer].[CustomerName], [Material].[MaterialName], case when [LadeBill].[ContractID] > 0 then Convert(decimal(18,2),[LadeBill].[ContractPrice]) else Convert(decimal(18,2),[LadeBill].[quotedPrice]) end, Convert(decimal(18,2),[LadeBill].[planQuantity]), Convert(decimal(18,2),[LadeBill].[actualQuantity]), [LadeBill].[plateNumber], convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate, [LadeBill].[destination], [LadeBill].[state] from [LadeBill] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] and [LadeBill].[ContractID] = " + rowID;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, ladeBillGrid, ladeBillGridDataList)
                }(ISystemService.execQuery.resultValue));
            }
        }
        else {
            ladeBillGrid.clearAll();
        }
    }

    function getDataList() {
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

        sqlStr = "select [Contract].[ContractID], [Contract].[contractNum], [Customer].[CustomerName], convert(nvarchar(10),[Contract].[signDate],120) as signDate, [Material].[MaterialName], [Contract].[price], [Contract].[quantity], [Contract].[Agent],case closed when '0' then '否' when '1' then '是' end, [Contract].[Causes] from [Contract] join [Customer] on [Contract].[customerID] = [Customer].[customerID] join [Material] on [Contract].[materialID] = [Material].[materialID] and [Contract].[ContractType] = '销售' and [Contract].[State] not in('会签退回', '分管领导退回', '主管领导退回')";

        if (toolBar.getValue("txtcustomerSearch") != "") {
            sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
        }

        sqlStr += " and [Contract].[createDate] between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' ";

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                //rock.tableToListGrid(e, listGrid, dictDataList);
                if (e != null) {
                    listGrid.clearAll();
                    dictDataList.rows = [];
                    var rows = e.rows;
                    var colLength = e.columns.length;
                    var rowLength = rows.length;
                    var planquantity = 0;
                    var actquantity = 0;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(rowResult[0].value);
                        listdata.data[0] = 0;
                        listdata.data[1] = rowResult[0].value;
                        listdata.data[2] = "审批情况^javascript:sensor(" + rowResult[0].value + ");^_self";
                        listdata.data[3] = "打印^javascript:print(" + rowResult[0].value + ");^_self";
                        for (var j = 1; j < colLength; j++) {
                            listdata.data[j + 3] = rowResult[j].value;
                        }
                        dictDataList.rows.push(listdata);
                    }
                    listGrid.parse(dictDataList, "json");
                    getUploadDocument();
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

    sensor = function (id) {
        window.open("ContractSensorPage.html?id=" + id + "&act=browse");
    }
    print = function (id) {

        window.open("ContractPrint.html?id=" + id);
    }
})