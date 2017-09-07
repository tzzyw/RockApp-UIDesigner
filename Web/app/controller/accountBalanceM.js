
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
                //var date = new Date(serverDate.replace('-', '/'));
                //var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                //toolBar.setValue("beginbillingTime", beginDate);


                //toolBar.setValue("endbillingTime", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        var year = parseInt(serverDate.substr(0, 4), 10);
        for (var i = 0; i < 5; i++) {
            $("#year").append("<option value='" + (year - i) + "'>" + (year - i) + "</option>");
        }
        for (var i = 1; i < 13; i++) {
            $("#month").append("<option value='" + i + "'>" + i + "</option>");
        }
       
        $("#txtcustomerID").val("");
        customerComplete("");
        clearPage();
        getDataList();
        //初始化工具栏状态
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("settletime", null, "选择年月");
    toolBar.addInput("input1", null, "", 35);
    toolBar.addText("years", null, "年");
    toolBar.addInput("input2", null, "", 35);
    toolBar.addText("months", null, "月");
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 180);
    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                getDataList();
                break;
        }
    });

    toolBar.getInput("txtcustomerSearch").id = "txtcustomerSearch";
    toolBar.getInput("input1").id = "input1";
    $("#input1").css("display", "none");
    $("#input1").after("<select id='year' style=\"width:60px\"></select>");
    toolBar.getInput("input2").id = "input2";
    $("#input2").css("display", "none");
    $("#input2").after("<select id='month' style=\"width:50px\"></select>");
    //初始化提货单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue"); //期初余额, 0.0 as 收款金额, 0.0 as 结算金额, 0.0 as 期末余额 
    listGrid.setHeader("序号,,客户名称,期初余额,收款金额,结算金额,期末余额");
    listGrid.setInitWidths("40,0,230,150,150,150,*");
    listGrid.setColAlign("center,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro");
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
        var 本月日期 = getDateBetweenString($("#year").val(), $("#month").val(), "月度");
        var 本月期初日期 = 本月日期.split('&')[0];
        var 本月期末日期 = 本月日期.split('&')[1];
        var 上月日期 = getDateBetweenString($("#year").val(), $("#month").val(), "上月");
        var 上月期初日期 = 上月日期.split('&')[0];
        var 上月期末日期 = 上月日期.split('&')[1];

       
        sqlStr = "select top 20 [customerID], [CustomerName] from [Customer] where [ForSale] = '1' ";
        if ($("#txtcustomerSearch").val() != "") {
            sqlStr += " and [CustomerID] = " + $("#txtcustomerID").val();
        }

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
               
                for (var i = 0; i < rowLength; i++) {
                    var 期初余额 = 0, 收款金额 = 0, 结算金额 = 0, 期末余额 = 0;
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    listdata.data[1] = rowResult[0].value;
                    listdata.data[2] = rowResult[1].value;
                    var count = 0;
                    //计算期初余额
                    ISystemService.executeScalar.sqlString = "select count(*) from [CashRecord] where [ChangeDate] between '" + 上月期初日期 + "' and '" + 上月期末日期 + "' and [CustomerID] = " + rowResult[0].value;
                    rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                    var warehouseName = null;
                    if (ISystemService.executeScalar.success) {
                        (function (e) {
                            count = parseInt(e.value,10);
                        }(ISystemService.executeScalar.resultValue));
                    }

                    if (count > 0) {
                        ISystemService.executeScalar.sqlString = "select [Balance] from [CashRecord] where [CashRecordID] = (select MAX([CashRecordID]) from [CashRecord] where [ChangeDate] between '" + 上月期初日期 + "' and '" + 上月期末日期 + "' and [CustomerID] = " + rowResult[0].value + ")";
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                listdata.data[3] = rock.formatCurrency(e.value); 
                            }(ISystemService.executeScalar.resultValue));
                        }                        
                    }
                    else {
                        ISystemService.executeScalar.sqlString = "select [Balance] from [CashRecord] where  [CashRecordID] = (select MAX([CashRecordID]) from [CashRecord] where  [ChangeDate] < '" + 上月期末日期 + "' and [CustomerID] = " + rowResult[0].value + ")";
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                listdata.data[3] = rock.formatCurrency(e.value);
                            }(ISystemService.executeScalar.resultValue));
                        }
                    }
                    //计算收款金额
                    ISystemService.executeScalar.sqlString = "select ReceiveQuantity from [CashRecord] where [ChangeDate] between '" + 本月期初日期 + "' and '" + 本月期末日期 + "' and [CustomerID] = " + rowResult[0].value;
                    rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                    var warehouseName = null;
                    if (ISystemService.executeScalar.success) {
                        (function (e) {
                            listdata.data[4] = rock.formatCurrency(e.value);
                        }(ISystemService.executeScalar.resultValue));
                    }
                  
                    //计算结算金额
                    ISystemService.executeScalar.sqlString = "select PayQuantity from [CashRecord] where [ChangeDate] between '" + 本月期初日期 + "' and '" + 本月期末日期 + "' and [CustomerID] = " + rowResult[0].value;
                    rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                    var warehouseName = null;
                    if (ISystemService.executeScalar.success) {
                        (function (e) {
                            listdata.data[5] = rock.formatCurrency(e.value);
                        }(ISystemService.executeScalar.resultValue));
                    }

                    //计算期末余额
                    ISystemService.executeScalar.sqlString = "select count(*) from [CashRecord] where [ChangeDate] between '" + 本月期初日期 + "' and '" + 本月期末日期 + "' and [CustomerID] = " + rowResult[0].value;
                    rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                    var warehouseName = null;
                    if (ISystemService.executeScalar.success) {
                        (function (e) {
                            count = parseInt(e.value, 10);
                        }(ISystemService.executeScalar.resultValue));
                    }

                    if (count > 0) {
                        ISystemService.executeScalar.sqlString = "select [Balance] from [CashRecord] where [CashRecordID] = (select MAX([CashRecordID]) from [CashRecord] where [ChangeDate] between '" + 本月期初日期 + "' and '" + 本月期末日期 + "' and [CustomerID] = " + rowResult[0].value + ")";
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                listdata.data[6] = rock.formatCurrency(e.value);
                            }(ISystemService.executeScalar.resultValue));
                        }
                    }
                    else {
                        ISystemService.executeScalar.sqlString = "select [Balance] from [CashRecord] where  [CashRecordID] = (select MAX([CashRecordID]) from [CashRecord] where  [ChangeDate] < '" + 本月期末日期 + "' and [CustomerID] = " + rowResult[0].value + ")";
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                listdata.data[6] = rock.formatCurrency(e.value);
                            }(ISystemService.executeScalar.resultValue));
                        }
                    }

                    dictDataList.rows.push(listdata);
                }

                listGrid.parse(dictDataList, "json");
            }(ISystemService.execQuery.resultValue));
        }
    }

    $('#masterDiv').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomerSearch") {
            hidecustomerPop();
        }

    });

    function getDateBetweenString(year, month, type) {
        var tempDate = null;
        var endDate = null;
        var tempTime = null;
        var result = "";
        switch (type) {
            case "月度":
                tempDate = new Date(year, parseInt(month, 10), 1);
                tempTime = tempDate.getTime() - 1;
                endDate = new Date(tempTime);
                result = year + "-" + month + "-" + "1&" + endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate() + " " + endDate.getHours() + ":" + endDate.getMinutes() + ":" + endDate.getSeconds();  //2014-10-10 00:00:00.000
                break;            
            case "上月":
                if (parseInt(month, 10) > 1) {
                    tempDate = new Date(year, parseInt(month, 10)-1, 1);
                    tempTime = tempDate.getTime() - 1;
                    endDate = new Date(tempTime);
                    result = year + "-" + (parseInt(month, 10) - 1) + "-" + "1&" + endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate() + " " + endDate.getHours() + ":" + endDate.getMinutes() + ":" + endDate.getSeconds();  //2014-10-10 00:00:00.000

                }
                else {
                    tempDate = new Date(year, parseInt(month, 10) -1, 1);
                    tempTime = tempDate.getTime() - 1;
                    endDate = new Date(tempTime);
                    result = (parseInt(year, 10) - 1) + "-12-" + "1&" + endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate() + " " + endDate.getHours() + ":" + endDate.getMinutes() + ":" + endDate.getSeconds();  //2014-10-10 00:00:00.000
                }
                break;
            default:
        }
        return result;
    }
   
})