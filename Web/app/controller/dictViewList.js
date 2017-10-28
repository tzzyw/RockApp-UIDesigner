
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      purchasePlan = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,PurchasePlan";
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

        //初始化实体参照及查询项	




        $("#combocarrierSearch").append("<option value='-1'>请选择运输单位</option>");
        sqlStr = "SELECT [CarrierID],[CarrierName] FROM [Carrier] order by CarrierName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combocarrierSearch").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>");
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }


        $("#combocustomerSearch").append("<option value='-1'>请选择客户</option>");
        sqlStr = "SELECT [CustomerID],[CustomerName] FROM [Customer] order by CustomerName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combocustomerSearch").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>");
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }



        //初始化通用参照



        $("#comboladePlaceSearch").append("<option value='-1'>请选择提货地点</option>");
        sqlStr = "SELECT [ReferName] FROM [Refer] where [ReferType] = '提货地点'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#comboladePlaceSearch").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>");
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }








        customerComplete("");


        getDataList();

    });
    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("purchasePlanName", null, "采购计划名称");
    toolBar.addInput("txtpurchasePlanNameSearch", null, "", 100);


    toolBar.addText("createDateBegin", null, "创建日期");
    toolBar.addInput("begincreateDate", null, "", 75);
    toolBar.addText("创建日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 75);


    toolBar.addInput("txtladePlaceSearch", null);


    toolBar.addInput("txtcarrierSearch", null);


    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);


    toolBar.addText("forLeader", null, "领导特供");
    toolBar.addInput("txtforLeaderSearch", null, "", 100);


    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        getDataList();
    });



    toolBar.getInput("txtladePlaceSearch").id = "txtladePlaceSearch";
    $("#txtladePlaceSearch").css("display", "none");
    $("#txtladePlaceSearch").after("<select id='comboladePlaceSearch' style=\"width:100px\"></select>");


    toolBar.getInput("txtcarrierSearch").id = "txtcarrierSearch";
    $("#txtcarrierSearch").css("display", "none");
    $("#txtcarrierSearch").after("<select id='combocarrierSearch' style=\"width:100px\"></select>");


    toolBar.getInput("txtcustomerSearch").id = "txtcustomerSearch";


    toolBar.getInput("txtforLeaderSearch").id = "txtforLeaderSearch";
    $("#txtforLeaderSearch").css("display", "none");
    $("#txtforLeaderSearch").after("<select id='comboforLeaderSearch' style=\"width:100px\"><option value='-1'>请选择</option><option value='1'>是</option><option value='0'>否</option></select>");


    //初始化采购计划列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("序号,,采购计划名称,创建日期,提货地点,运输单位,客户,提报人,领导特供,状态,备注");
    listGrid.setInitWidths("40,0,100,80,80,120,120,50,60,60,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        alert("尚未设定查看明细弹窗!");
    });
    listGrid.init();

    //加载弹窗Div

    $(document.body).append('<div id="customerPop" style="width: 260px; height: 400px; position: absolute; background-color: White;display: none;z-index:9"><div id="customerQuickGrid" style="width: 260px; height: 400px; float: left; border: 1px solid #E3E3E3;"></div></div>');




    var customerDataList = new rock.JsonList();
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
        $("#txtcustomerSearch").val(customerQuickGrid.cells(rowID, 2).getValue());
        hidecustomerPop();
    });
    customerQuickGrid.init();
    customerQuickGrid.detachHeader(0);
    customerPop = $("#customerPop")
    $('#txtcustomerSearch').focus(function (e) {
        showcustomerPop($("#txtcustomerSearch").offset().top, $("#txtcustomerSearch").offset().left);
    });

    function showcustomerPop(top, left) {
        customerPop.css({ top: top + 22, left: left }).show();
        //判断记录条数如果少于10条就重新加载
        if (customerDataList.rows.length < 10) {
            customerComplete("");
        }
    }

    function hidecustomerPop() {
        customerPop.css({ top: 200, left: -1300 }).hide();
    }
    hidecustomerPop();

    $("#txtcustomerSearch").keyup(function () {
        customerComplete($("#txtcustomerSearch").val());
    });

    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 14 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where [CustomerName] like  '%" + searchCode + "%' or [SearchCode] like  '%" + searchCode + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerQuickGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }


    $('#mainPage').mousedown(function (e) {








        if (e.srcElement.id != "txtcustomerSearch") {
            hidecustomerPop();
        }

    });

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






        sqlStr = "select [PurchasePlan].[PurchasePlanID], [PurchasePlan].[purchasePlanName], convert(nvarchar(10),[PurchasePlan].[createDate],120) as createDate, [PurchasePlan].[ladePlace], [Carrier].[CarrierName], [Customer].[CustomerName], [PurchasePlan].[agent], CASE [PurchasePlan].[forLeader] WHEN '1' THEN '是' WHEN '0' THEN '否' END, [PurchasePlan].[state], [PurchasePlan].[comment] from [PurchasePlan] join [Carrier] on [PurchasePlan].[carrierID] = [Carrier].[carrierID] join [Customer] on [PurchasePlan].[customerID] = [Customer].[customerID] ";

        if (toolBar.getValue("txtpurchasePlanNameSearch") != "") {
            sqlStr += " and [PurchasePlan].[purchasePlanName] like '%" + toolBar.getValue("txtpurchasePlanNameSearch") + "%'";
        }



        sqlStr += " and [PurchasePlan].[createDate] between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' ";


        if ($("#comboladePlaceSearch").val() != "-1") {
            sqlStr += " and [PurchasePlan].[ladePlace] = '" + $("#comboladePlaceSearch").val() + "'";
        }



        if ($("#combocarrierSearch").val() != "-1") {
            sqlStr += " and [Carrier].[CarrierID] = " + $("#combocarrierSearch").val();
        }



        if (toolBar.getValue("txtcustomerSearch") != "") {
            sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
        }


        if ($("#comboforLeaderSearch").val() != "-1") {
            sqlStr += " and [PurchasePlan].[forLeader] = '" + $("#comboforLeaderSearch").val() + "'";
        }


        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("begincreateDate"));

    dateboxArray.push(toolBar.getInput("endcreateDate"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})