
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
        //处理初始化加载数据
        sqlStr = "select top 100 [LadeBill].[LadeBillID], [Customer].[CustomerName], [Material].[MaterialName], case when [LadeBill].[ContractID] > 0 then Convert(decimal(18,2),[LadeBill].[ContractPrice]) else Convert(decimal(18,2),[LadeBill].[quotedPrice]) end, Convert(decimal(18,2),[LadeBill].[planQuantity]), Convert(decimal(18,2),[LadeBill].[actualQuantity]), convert(nvarchar(10),[LadeBill].[BillingTime],120), convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate, [LadeBill].[destination], [LadeBill].[state] from [LadeBill] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] and [LadeBill].[Closed] = '1' and [LadeBill].[Agent] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";
        if ($('#kp').attr('checked')) {
            sqlStr += " and [LadeBill].[billingTime] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";
        }
        else {
            sqlStr += " and [LadeBill].[ladeDate] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";
        }

        fill(sqlStr);


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


    toolBar.addButtonSelect("combomaterialSearch", null, "产品", [], null, null, true, true, 15, "select")


    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":

                if ($.trim(toolBar.getValue("beginbillingTime")) == "") {
                    alert("起始开票日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("beginbillingTime"), "-")) {
                    alert("起始开票日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endbillingTime")) == "") {
                    alert("截止开票日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endbillingTime"), "-")) {
                    alert("截止开票日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }

                sqlStr = "select [LadeBill].[LadeBillID], [Customer].[CustomerName], [Material].[MaterialName], case when [LadeBill].[ContractID] > 0 then Convert(decimal(18,2),[LadeBill].[ContractPrice]) else Convert(decimal(18,2),[LadeBill].[quotedPrice]) end, Convert(decimal(18,2),[LadeBill].[planQuantity]), Convert(decimal(18,2),[LadeBill].[actualQuantity]), [LadeBill].[plateNumber], convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate, [LadeBill].[destination], [LadeBill].[state] from [LadeBill] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] and [LadeBill].[Closed] = '1' and [LadeBill].[Agent] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";
                if ($('#kp').attr('checked')) {
                    sqlStr += " and [LadeBill].[billingTime] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";
                }
                else {
                    sqlStr += " and [LadeBill].[ladeDate] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";
                }

                if (toolBar.getItemText("combomaterialSearch") != "产品") {
                    sqlStr += " and [Material].[MaterialName] = '" + toolBar.getItemText("combomaterialSearch") + "'";
                }

                fill(sqlStr);
                break;
        }
    });


    toolBar.getInput("input1").id = "input1";
    $("#input1").css("display", "none");
    $("#input1").after("<input id='kp' type='radio' name='sex' checked='checked'/>创建日期<input id='th' type='radio' name='sex' style='margin-left:5px;margin-top:3px'/>提货日期");


    //初始化提货单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("序号,,打开,客户名称,产品名称,单价,计划量,实际量,开票日期,提货日期,到站名称,状态");
    listGrid.setInitWidths("40,0,40,190,120,80,70,70,80,80,150,*");
    listGrid.setColAlign("center,left,center,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,na,na,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,link,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    //listGrid.attachFooter("序号,,查看明细,计量情况,客户名称,产品名称,挂牌单价,计划提货数量,实际提货数量,车船号,提货日期,到站名称,状态");   
    listGrid.enableColSpan(true);

    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        //alert("尚未设定查看明细弹窗!");
    });
    listGrid.init();

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginbillingTime"));

    dateboxArray.push(toolBar.getInput("endbillingTime"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

    function fill(sqlStr) {
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
                        listdata.data[2] = "打开^javascript:test();^_self";


                        if (rowResult[4].value) {
                            planquantity += parseFloat(rowResult[4].value);
                        }
                        if (rowResult[5].value) {
                            actquantity += parseFloat(rowResult[5].value);
                        }

                        for (var j = 1; j < colLength; j++) {
                            listdata.data[j + 2] = rowResult[j].value;
                        }
                        dictDataList.rows.push(listdata);
                    }
                    listdata = new rock.JsonData("footer");
                    listdata.data[0] = 0;
                    listdata.data[1] = "0";
                    listdata.data[2] = "数量合计： ";
                    listdata.data[3] = "";
                    listdata.data[4] = "";
                    listdata.data[5] = "";
                    listdata.data[6] = Number(planquantity).toFixed(2).toString();
                    if (actquantity > 0) {
                        listdata.data[7] = Number(actquantity).toFixed(3).toString();
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