
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid, checktype,
        statement = null,
        ladeBill = null,
        customerDataList = new rock.JsonList(),
        dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,LadeBill,Statement,IBusinessService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("beginbillingTime", beginDate);


                toolBar.setValue("endbillingTime", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        $("#combomaterialSearch").empty();
        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] join [ProductMarketing] on [MaterialID] = [ProductID] and [Available] = '1' and [ForSale] = '1' ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combomaterialSearch").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }
        $("#txtcustomerID").val("");
        customerComplete("");
        clearPage();
        getDataList();
        refreshToolBarState();
        //初始化工具栏状态
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("settletime", null, "结算日期");
    toolBar.addInput("beginbillingTime", null, "", 60);
    toolBar.addText("开票日期End", null, "-");
    toolBar.addInput("endbillingTime", null, "", 60);
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 120);
    toolBar.addText("material", null, "产品");
    toolBar.addInput("txtmateriaSearch", null, "", 0);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepwaiver", null);
    toolBar.addButton("waiver", null, "弃审");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                getDataList();
                break;
            case "waiver":
                var checked = listGrid.getCheckedRows(0);
                var rowids = checked.split(',');
                if (confirm("您确定弃审选定的结算单吗?")) {
                    for (var i = 0; i < rowids.length; i++) {

                        IBusinessService.waiverSettle.statementID = rowids[i];
                        rock.AjaxRequest(IBusinessService.waiverSettle, rock.exceptionFun);
                        if (!IBusinessService.waiverSettle.success) {
                            alert("弃审结算单出错!");
                            return;
                        }
                    }
                    getDataList();
                    refreshToolBarState();
                    alert("您所选择的结算单已经弃审完成!");
                }
                break;
        }
    });

    toolBar.getInput("txtcustomerSearch").id = "txtcustomerSearch";
    toolBar.getInput("txtmateriaSearch").id = "txtmateriaSearch";
    $("#txtmateriaSearch").css("display", "none");
    $("#txtmateriaSearch").after("<select id='combomaterialSearch' style=\"width:120px\"></select>");
    //初始化提货单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,客户名称,产品名称,提货单编号,结算数量,结算单价,结算金额,结算日期,经办人,状态");
    listGrid.setInitWidths("40,0,200,130,120,80,80,80,90,100,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    customerQuickGrid = new dhtmlXGridObject("customerQuickGrid");
    customerQuickGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    customerQuickGrid.setSkin("dhx_skyblue");
    customerQuickGrid.setHeader("序号,,客户编码,类别,客户名称");
    customerQuickGrid.setInitWidths("40,0,70,40,*");
    customerQuickGrid.setColAlign("center,left,left,left,left");
    customerQuickGrid.setColTypes("cntr,ro,ro,ro,ro");
    customerQuickGrid.setColSorting("na,na,str,str,str");
    customerQuickGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        clearPage();
        $("#txtcustomerID").val(rowID);
        $("#txtcustomerSearch").val(customerQuickGrid.cells(rowID, 4).getValue());
        hidecustomerPop();
    });
    customerQuickGrid.init();
    customerQuickGrid.detachHeader(0);

    customerPop = $("#customerPop");
    var mark = true;

    $('#txtcustomerSearch').mousedown(function (e) {
        if (mark) {
            ISystemService.execQuery.sqlString = "select top 15  [CustomerID], [CustomerCode], [Category], [CustomerName] from [Customer]";
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, customerQuickGrid, customerDataList);
                }(ISystemService.execQuery.resultValue));
            }
            mark = false;
        }
        showcustomerPop();
    });

    $("#txtcustomerSearch").keyup(function () {
        customerComplete($("#txtcustomerSearch").val());
    });

    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 15 [CustomerID], [CustomerCode], [Category], [CustomerName] from [Customer] where CustomerName like  '%" + searchCode + "%' or [SearchCode] like  '%" + searchCode + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerQuickGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }

    function showcustomerPop() {
        var top = $("#txtcustomerSearch").offset().top;
        var left = $("#txtcustomerSearch").offset().left;
        customerPop.css({ top: top + 22, left: left }).show();
    }
    function hidecustomerPop() {
        customerPop.css({ top: 200, left: -1300 }).hide();
    }
    $('#mainPage').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomerSearch") {
            hidecustomerPop();
        }
    });

    hidecustomerPop();
    function clearPage() {
        $("#txtcustomerID").val("");
        $("#txtcustomerSearch").val("");
    }

    function getDataList() {

        if ($.trim(toolBar.getValue("beginbillingTime")) == "") {
            alert("起始日期不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("beginbillingTime"), "-")) {
            alert("起始日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }
        if ($.trim(toolBar.getValue("endbillingTime")) == "") {
            alert("截止日期不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("endbillingTime"), "-")) {
            alert("截止日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        sqlStr = "select [Statement].[StatementID], [Customer].[CustomerName], [Material].[MaterialName] + [LadeBill].[MaterialLevel],[LadeBill].[LadeBillNum], [Statement].[NetWeight], [Statement].[Price], [Statement].[Amount], convert(nvarchar(10),SettleTime,120), [Statement].[Agent], [Statement].[state] from [LadeBill] join [Statement] on [Statement].[LadeBillID] = [LadeBill].[LadeBillID] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] and [Statement].[state] ='已审核' ";
        if ($("#txtcustomerSearch").val() != "") {
            sqlStr += " and [LadeBill].[CustomerID] = " + $("#txtcustomerID").val();
        }
        sqlStr += " and [LadeBill].[MaterialID] = " + $("#combomaterialSearch").val();
        sqlStr += " and [Statement].[SettleTime] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                //rock.tableToListGrid(e, listGrid, dictDataList);
                listGrid.clearAll();
                dictDataList.rows = [];
                var rows = e.rows;
                var colLength = e.columns.length;
                var rowLength = rows.length;
                var quantity = 0;
                var amount = 0;
                for (var i = 0; i < rowLength; i++) {
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    listdata.data[1] = rowResult[0].value;
                    if (rowResult[4].value) {
                        quantity += parseFloat(rowResult[4].value);
                    }
                    if (rowResult[6].value) {
                        amount += parseFloat(rowResult[6].value);
                    }

                    for (var j = 1; j < colLength; j++) {
                        listdata.data[j + 1] = rowResult[j].value;
                    }
                    dictDataList.rows.push(listdata);
                }
                listdata = new rock.JsonData("footer");
                listdata.data[0] = 0;
                listdata.data[1] = "0";
                listdata.data[2] = "合    计：";
                listdata.data[3] = "";
                listdata.data[4] = "";
                listdata.data[5] = Number(quantity).toFixed(3).toString();
                listdata.data[7] = Number(amount).toFixed(2).toString();

                dictDataList.rows.push(listdata);
                listGrid.parse(dictDataList, "json");
                listGrid.setColspan("footer", 2, 2);
            }(ISystemService.execQuery.resultValue));
        }
    }

    $('#masterDiv').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomerSearch") {
            hidecustomerPop();
        }

    });

    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("waiver");
        }
        else {
            toolBar.enableItem("waiver");
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginbillingTime"));

    dateboxArray.push(toolBar.getInput("endbillingTime"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})