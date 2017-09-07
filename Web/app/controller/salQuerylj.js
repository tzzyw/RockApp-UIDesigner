
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
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';
                toolBar.setValue("beginbillingTime", beginDate);
                toolBar.setValue("endbillingTime", serverDate);
            }(ISystemService.getServerDate.resultValue));
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
    toolBar.addText("billingTimeBegin", null, "提货单日期");
    toolBar.addInput("beginbillingTime", null, "", 75);
    toolBar.addText("开票日期End", null, "-");
    toolBar.addInput("endbillingTime", null, "", 75);
    toolBar.addInput("input1", null, "");
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);
    //toolBar.addButtonSelect("combomaterialSearch", null, "产品", [], null, null, true, true, 15, "select")
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
    $("#input1").after("<input id='kp' type='radio' name='sex' checked='checked'/>创建日期<input id='th' type='radio' name='sex' style='margin-left:5px;margin-top:3px'/>提货日期");
    toolBar.getInput("txtmateriaSearch").id = "txtmateriaSearch";
    $("#txtmateriaSearch").css("display", "none");
    $("#txtmateriaSearch").after("<select id='combomaterialSearch' style=\"width:120px\"></select>");
    //$("#txtproductName").after("<select id='comboproduct' style=\"width:180px\"></select>");

    //初始化提货单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("序号,,产品名称,客户名称,累计开票量,开票金额,累计提货量,提货金额,结算金额");
    listGrid.setInitWidths("40,0,120,190,90,70,90,70,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro");
    //listGrid.attachFooter("序号,,查看明细,计量情况,客户名称,产品名称,挂牌单价,计划提货数量,实际提货数量,车船号,提货日期,到站名称,状态");   
    listGrid.enableColSpan(true);   
    listGrid.init();

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginbillingTime"));

    dateboxArray.push(toolBar.getInput("endbillingTime"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

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
        //                                                                                             sum(计划提货数量) as 累计开票量,                        sum(计划量总金额) as 累计开票金额,                  sum(实际提货数量) as 累计提货量,                        sum(实际量总金额) as 累计提货金额,  (select sum(结算金额) from 结算单 where 销售提货ID = 销售提货ID) as 累计结算金额 from 销售提货 join 客户 on 销售提货.客户ID = 客户.客户ID join 物料 on 销售提货.物料ID = 物料.物料ID where 销售提货.是否关闭 = '0' ";
        sqlStr = "select [LadeBill].[LadeBillID], [Material].[MaterialName], [Customer].[CustomerName], sum(Convert(decimal(18,2),[LadeBill].[planQuantity])), sum(Convert(decimal(18,2),[LadeBill].[PlanTotal])), sum(Convert(decimal(18,2),[LadeBill].[actualQuantity])), sum(Convert(decimal(18,2),[LadeBill].[ActualTotal])), (select sum(Amount) from [Statement] where LadeBillID = LadeBillID) as settotal from [LadeBill] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] and LadeBill.Closed = '0'";
        if ($('#kp').attr('checked')) {
            sqlStr += " and [LadeBill].[billingTime] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";
        }
        else {
            sqlStr += " and [LadeBill].[ladeDate] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";
        }

        if ($("#combomaterialSearch").val() != "-1") {
            sqlStr += " and [LadeBill].[MaterialID] = " + $("#combomaterialSearch").val();
        }

        sqlStr += " group by [LadeBill].[LadeBillID], [Material].[MaterialName], [Customer].[CustomerName] order by [Material].[MaterialName], [Customer].[CustomerName] ";

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
                    var plantotal = 0;
                    var actquantity = 0;
                    var acttotal = 0;
                    var settotal = 0;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(rowResult[0].value);
                        listdata.data[0] = 0;
                        listdata.data[1] = rowResult[0].value;

                        if (rowResult[3].value) {
                            planquantity += parseFloat(rowResult[3].value);
                        }
                        if (rowResult[4].value) {
                            plantotal += parseFloat(rowResult[4].value);
                        }
                        if (rowResult[5].value) {
                            actquantity += parseFloat(rowResult[5].value);
                        }
                        if (rowResult[6].value) {
                            acttotal += parseFloat(rowResult[6].value);
                        }
                        if (rowResult[7].value) {
                            settotal += parseFloat(rowResult[7].value);
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
                    listdata.data[4] = rock.formatCurrency(planquantity);
                    listdata.data[5] = rock.formatCurrency(plantotal);
                    if (actquantity > 0) {
                        listdata.data[6] = rock.formatCurrency(actquantity);
                    }
                    if (acttotal > 0) {
                        listdata.data[7] = rock.formatCurrency(acttotal);
                    }

                    if (settotal > 0) {
                        listdata.data[8] = rock.formatCurrency(settotal);
                    }

                    dictDataList.rows.push(listdata);
                    listGrid.parse(dictDataList, "json");
                    listGrid.setColspan("footer", 2, 2);
                }
            }(ISystemService.execQuery.resultValue));
        }
    }   

    test = function () {
        alert("asd");
    }

})