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
    toolBar.addText("billingTimeBegin", null, "开票日期");
    toolBar.addInput("beginbillingTime", null, "", 75);
    toolBar.addText("开票日期End", null, "-");
    toolBar.addInput("endbillingTime", null, "", 75);
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
  
    toolBar.getInput("txtmateriaSearch").id = "txtmateriaSearch";
    $("#txtmateriaSearch").css("display", "none");
    $("#txtmateriaSearch").after("<select id='combomaterialSearch' style=\"width:120px\"></select>");
    //$("#txtproductName").after("<select id='comboproduct' style=\"width:180px\"></select>");

    //初始化提货单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("序号,,产品名称,计划量,实际量,开票日期,提货日期");
    listGrid.setInitWidths("40,0,120,70,70,120,*");
    listGrid.setColAlign("center,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro");
    //listGrid.attachFooter("序号,,查看明细,计量情况,客户名称,产品名称,挂牌单价,计划提货数量,实际提货数量,车船号,提货日期,到站名称,状态");   
    //listGrid.enableColSpan(true);

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

    function getDataList() {
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

        sqlStr = "select [LadeBill].[LadeBillID], [Material].[MaterialName], Convert(decimal(18,2),[LadeBill].[planQuantity]), Convert(decimal(18,2),[LadeBill].[actualQuantity]), convert(nvarchar(10),[LadeBill].[BillingTime],120) as BillingTime, convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate from [LadeBill] join [Material] on [LadeBill].[materialID] = [Material].[materialID] and [LadeBill].[CustomerID] = " + $.cookie('CustomerID');
        sqlStr += " and [LadeBill].[billingTime] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";

        if ($("#combomaterialSearch").val() != "-1") {
            sqlStr += " and [LadeBill].[MaterialID] = " + $("#combomaterialSearch").val();
        }

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
                        listdata.data[2] = rowResult[1].value;

                        //产品名称,计划量,实际量,开票日期,提货日期");

                        if (rowResult[2].value) {
                            planquantity += parseFloat(rowResult[2].value);
                        }
                        if (rowResult[3].value) {
                            actquantity += parseFloat(rowResult[3].value);
                        }
                        listdata.data[3] = rowResult[2].value;
                        listdata.data[4] = rowResult[3].value;
                        listdata.data[5] = rowResult[4].value;
                        listdata.data[6] = rowResult[5].value;
                        //for (var j = 1; j < colLength; j++) {
                        //    listdata.data[j + 3] = rowResult[j].value;
                        //}
                        dictDataList.rows.push(listdata);
                    }
                    listdata = new rock.JsonData("footer");
                    listdata.data[0] = 0;
                    listdata.data[1] = "0";
                    listdata.data[2] = "数量合计： ";
                    listdata.data[3] =  Number(planquantity).toFixed(2).toString();
                    listdata.data[4] =  Number(actquantity).toFixed(3).toString();
                    //listdata.data[5] = "";
                    //listdata.data[6] = "";
                    //listdata.data[7] =
                    //if (actquantity > 0) {
                    //    listdata.data[8] = Number(actquantity).toFixed(3).toString();
                    //}
                    dictDataList.rows.push(listdata);
                    listGrid.parse(dictDataList, "json");                   
                }
            }(ISystemService.execQuery.resultValue));
        }
    }
})