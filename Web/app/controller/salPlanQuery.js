
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      customerPlanQuantity = null,
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,CustomerPlanQuantity,Customer,Material,IBusinessService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;

                //初始化日期选择年份
                var year = parseInt(serverDate.substr(0, 4), 10);
                for (var i = 0; i < 4; i++) {
                    $("#comboyearSearch").append("<option value='" + (year - i + 1) + "'>" + (year - i + 1) + "</option>");
                }
                $("#comboyearSearch").get(0).selectedIndex = 1;

            }(ISystemService.getServerDate.resultValue));
        }

        for (var i = 1; i < 13; i++) {
            $("#combomonthSearch").append("<option value='" + i + "'>" + i + "</option>");
        }

        //处理初始化加载数据

        sqlStr = "select top 100 [CustomerPlanQuantity].[CustomerPlanQuantityID], [Customer].[CustomerName], [Material].[MaterialName], [CustomerPlanQuantity].[quantity], [CustomerPlanQuantity].[uplimited], [CustomerPlanQuantity].[uplimited1], [CustomerPlanQuantity].[upLimited2], [CustomerPlanQuantity].[currentLevel], [CustomerPlanQuantity].[year], [CustomerPlanQuantity].[month] from [CustomerPlanQuantity] join [Customer] on [CustomerPlanQuantity].[customerID] = [Customer].[customerID] join [Material] on [CustomerPlanQuantity].[materialID] = [Material].[materialID] ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
       

        $("#combomaterial").empty();
        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] where ForSale = '1' order by MaterialName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                toolBar.addListOption("combomaterialSearch", "产品", 1, "button", "产品")
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combomaterial").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                        toolBar.addListOption("combomaterialSearch", rowResult[0].value, i + 2, "button", rowResult[1].value)
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }


        customerComplete("");

       
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 90);
    toolBar.addButtonSelect("combomaterialSearch", null, "产品", [], null, null, true, true, 15, "select")
    toolBar.addText("year", null, "年份");
    toolBar.addInput("txtyearSearch", null, "", 50);
    toolBar.addText("month", null, "月份");
    toolBar.addInput("txtmonthSearch", null, "", 30);
    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                sqlStr = "select [CustomerPlanQuantity].[CustomerPlanQuantityID], [Customer].[CustomerName], [Material].[MaterialName], [CustomerPlanQuantity].[quantity], [CustomerPlanQuantity].[uplimited], [CustomerPlanQuantity].[uplimited1], [CustomerPlanQuantity].[upLimited2], [CustomerPlanQuantity].[currentLevel], [CustomerPlanQuantity].[year], [CustomerPlanQuantity].[month] from [CustomerPlanQuantity] join [Customer] on [CustomerPlanQuantity].[customerID] = [Customer].[customerID] join [Material] on [CustomerPlanQuantity].[materialID] = [Material].[materialID]";

                if (toolBar.getValue("txtcustomerSearch") != "") {
                    sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
                }

                if (toolBar.getItemText("combomaterialSearch") != "产品") {
                    sqlStr += " and [Material].[MaterialName] = '" + toolBar.getItemText("combomaterialSearch") + "'";
                }

                if (toolBar.getValue("txtyearSearch") != "") {
                    sqlStr += " and [CustomerPlanQuantity].[year] = '" + toolBar.getValue("txtyearSearch") + "'";
                }

                if (toolBar.getValue("txtmonthSearch") != "") {
                    sqlStr += " and [CustomerPlanQuantity].[month] = '" + toolBar.getValue("txtmonthSearch") + "'";
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

    toolBar.getInput("txtyearSearch").id = "txtyearSearch";
    $("#txtyearSearch").css("display", "none");
    $("#txtyearSearch").after("<select id='comboyearSearch' style=\"width:60px\"></select>");

    toolBar.getInput("txtmonthSearch").id = "txtmonthSearch";
    $("#txtmonthSearch").css("display", "none");
    $("#txtmonthSearch").after("<select id='combomonthSearch' style=\"width:50px\"></select>");

    //初始化客户计划销量列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("序号,,客户名称,产品名称,计划销售量,计划浮动上限,计划浮动上限一级,计划浮动上限二级,当前级别,年份,月份");
    listGrid.setInitWidths("40,0,120,120,80,100,120,120,80,40,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.init();

    customerQuickGrid = new dhtmlXGridObject("customerQuickGrid");
    customerQuickGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    customerQuickGrid.setSkin("dhx_skyblue");
    customerQuickGrid.setHeader(",,");
    customerQuickGrid.setInitWidths("0,0,*");
    customerQuickGrid.setColAlign("center,center,left");
    customerQuickGrid.setColSorting("na,na,str");
    customerQuickGrid.setColTypes("ro,ro,ro");
    customerQuickGrid.enableDistributedParsing(true, 20);
    customerQuickGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        $("#txtcustomerID").val(rowID)
        $("#txtcustomer").val(customerQuickGrid.cells(rowID, 2).getValue())
        hidecustomerPop();
    });
    customerQuickGrid.init();
    customerQuickGrid.detachHeader(0);
    customerPop = $("#customerPop")
    $('#txtcustomer').focus(function (e) {
        showcustomerPop();
    });

    function showcustomerPop() {
        var top = $("#txtcustomer").offset().top;
        var left = $("#txtcustomer").offset().left;
        customerPop.css({ top: top + 22, left: left }).show();
    }

    function hidecustomerPop() {
        customerPop.css({ top: 200, left: -1300 }).hide();
    }
    hidecustomerPop();

    $("#txtcustomer").keyup(function () {
        customerComplete($("#txtcustomer").val());
    });
    var customerDataList = new rock.JsonList();
    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 14 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where Available = '1' and ForSale = '1' and [CustomerName] like  '%" + $("#txtcustomer").val() + "%' or [SearchCode] like  '%" + $("#txtcustomer").val() + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerQuickGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }

})