
var test;
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      ladeBill = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,LadeBill";
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
        

        $("#combomaterialSearch").empty();
        $("#combomaterialSearch").append("<option value='-1'>请选择产品</option>")
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

        //处理初始化加载数据
        getDataList();

    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("billingTimeBegin", null, "结算日期");
    toolBar.addInput("input1", null, "", 35);
    toolBar.addText("years", null, "年");
    toolBar.addInput("input2", null, "", 35);
    toolBar.addText("months", null, "月");   
    toolBar.addText("material", null, "产品");
    toolBar.addInput("txtmateriaSearch", null, "", 0);
    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                getDataList();
                break;
        }
    });


    toolBar.getInput("input1").id = "input1";
    $("#input1").css("display", "none");
    $("#input1").after("<select id='year' style=\"width:60px\"></select>");
    toolBar.getInput("input2").id = "input2";
    $("#input2").css("display", "none");
    $("#input2").after("<select id='month' style=\"width:50px\"></select>");
    toolBar.getInput("txtmateriaSearch").id = "txtmateriaSearch";
    $("#txtmateriaSearch").css("display", "none");
    $("#txtmateriaSearch").after("<select id='combomaterialSearch' style=\"width:120px\"></select>");
    //$("#txtproductName").after("<select id='comboproduct' style=\"width:180px\"></select>");

    //初始化提货单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("序号,产品名称,客户名称,结算单价,年合同量,月销售量,月销售额,年销售量,年销售额");
    listGrid.setInitWidths("40,120,190,90,90,90,90,90,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro");
    //listGrid.attachFooter("序号,,查看明细,计量情况,客户名称,产品名称,挂牌单价,计划提货数量,实际提货数量,车船号,提货日期,到站名称,状态");   
    listGrid.enableColSpan(true);
    listGrid.init();

    function getDataList() {       
        sqlStr = "select [Material].[MaterialID], [Customer].[CustomerID], [Price], sum([NetWeight]) as 月销售量, sum([Amount]) 月销售额 from [Statement] join [Customer] on [Statement].[CustomerID] = [Customer].[CustomerID] join [Material] on [Statement].[MaterialID] = [Material].[MaterialID] where [State] = '已审核' ";
        sqlStr += " and [Statement].[SettleTime] between " + getDateBetweenString($("#year").val(), $("#month").val(), "月度");

        if ($("#combomaterialSearch").val() != "-1") {
            sqlStr += " and [LadeBill].[MaterialID] = " + $("#combomaterialSearch").val();
        }
        sqlStr += " group by [Material].[MaterialID], [Customer].[CustomerID], [Price] order by [Material].[MaterialID], [Customer].[CustomerID], [Price]";

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
                    //var planquantity = 0;
                    //var plantotal = 0;
                    //var actquantity = 0;
                    //var acttotal = 0;
                    //var settotal = 0;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(i+1);
                        listdata.data[0] = 0;
                        //获取产品名称
                        ISystemService.getObjectProperty.objName = "Material";
                        ISystemService.getObjectProperty.property = "MaterialName";
                        ISystemService.getObjectProperty.ojbID = parseInt(rowResult[0].value,10);
                        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                        if (ISystemService.getObjectProperty.success) {
                            (function (e) {
                                listdata.data[1] = e.value;
                            }(ISystemService.getObjectProperty.resultValue));
                        }
                        //获取客户名称
                        ISystemService.getObjectProperty.objName = "Customer";
                        ISystemService.getObjectProperty.property = "CustomerName";
                        ISystemService.getObjectProperty.ojbID = parseInt(rowResult[0].value, 10);
                        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                        if (ISystemService.getObjectProperty.success) {
                            (function (e) {
                                listdata.data[2] = e.value;
                            }(ISystemService.getObjectProperty.resultValue));
                        }
                        //结算单价
                        listdata.data[3] = rowResult[2].value;
                        //年合同量
                        ISystemService.executeScalar.sqlString = "select sum(Quantity) from Contract  where Contract.MaterialID = " + rowResult[0].value + " and Contract.CustomerID = " + rowResult[1].value + " and ContractType = '销售' and Closed = '0' and State = '已审核' and SignDate between " + getDateBetweenString($("#year").val(), $("#month").val(), "年度");
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                listdata.data[4] = e.value;
                            }(ISystemService.executeScalar.resultValue));
                        }                       
                        //月销售量 
                        listdata.data[5] = rowResult[3].value;
                        //月销售额
                        listdata.data[6] = rowResult[4].value;
                        //年销售量
                        ISystemService.executeScalar.sqlString = "select sum(NetWeight) from [Statement]  where [Statement].[MaterialID] = " + rowResult[0].value + " and [Statement].[CustomerID] = " + rowResult[1].value + " and [SettleTime] between " + getDateBetweenString($("#year").val(), $("#month").val(), "年度");
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                listdata.data[7] = e.value;
                            }(ISystemService.executeScalar.resultValue));
                        }
                        //年销售额
                        ISystemService.executeScalar.sqlString = "select sum(Amount) from [Statement]  where [Statement].[MaterialID] = " + rowResult[0].value + " and [Statement].[CustomerID] = " + rowResult[1].value + " and [SettleTime] between " + getDateBetweenString($("#year").val(), $("#month").val(), "年度");
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                listdata.data[8] = e.value;
                            }(ISystemService.executeScalar.resultValue));
                        }
                        dictDataList.rows.push(listdata);
                    }
                   
                    listGrid.parse(dictDataList, "json");
                    //listGrid.setColspan("footer", 2, 2);
                }
            }(ISystemService.execQuery.resultValue));
        }
    }

    function getDateBetweenString(year, month, type) {
        var tempDate = null;
        var endDate = null;
        var tempTime = null;
        switch (type) {
            case "月度":
                tempDate = new Date(year, parseInt(month,10), 1);
                break;
            case "季度":
                tempDate = new Date(year, parseInt(month, 10) + 2, 1);
                break;
            case "半年":
                tempDate = new Date(year, parseInt(month, 10) + 5, 1);
                break;
            case "年度":
                tempDate = new Date(year, parseInt(month, 10) + 11, 1);
                break;
            default:
        }
        tempTime = tempDate.getTime() - 1;
        endDate = new Date(tempTime);
        return "'" + year + "-" + month + "-" + "1' and '" + endDate.getFullYear() + "-" + (endDate.getMonth() + 1) + "-" + endDate.getDate() + " " + endDate.getHours() + ":" + endDate.getMinutes() + ":" + endDate.getSeconds() + "'";  //2014-10-10 00:00:00.000
    }  

    test = function () {
        alert("asd");
    }

})