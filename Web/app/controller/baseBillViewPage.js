
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, masterGrid, detailGrid, sqlStr, serverDate, customerPop, customerQuickGrid
    viewImg = "/resource/dhtmlx/codebase/imgs/own/view.png",
    masterDataList = new rock.JsonList(),
    detailDataList = new rock.JsonList();
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                var serverDate = e.value;
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

        //处理初始化加载数据

        getDataList();


    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("masterDiv");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("b").attachObject("detailDiv");
    dhxLayout.cells("b").hideHeader();

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("createDateBegin", null, "创建日期");
    toolBar.addInput("begincreateDate", null, "", 75);
    toolBar.addText("创建日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 75);


    toolBar.addText("purchasePlanName", null, "采购计划名称");
    toolBar.addInput("txtpurchasePlanNameSearch", null, "", 100);


    toolBar.addInput("txtladePlaceSearch", null);


    toolBar.addInput("txtcarrierSearch", null);


    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);


    toolBar.addText("forLeader", null, "领导特供");
    toolBar.addInput("txtforLeaderSearch", null, "", 100);



    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);

    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":
                getDataList();
                break;

        }
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


    //初始化主表列表
    masterGrid = new dhtmlXGridObject("masterGrid");
    masterGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    masterGrid.setSkin("dhx_skyblue");


    masterGrid.setHeader("序号,,查看,采购计划名称,创建日期,提货地点,运输单位,客户,状态,领导特供,备注");
    masterGrid.setInitWidths("40,0,40,100,80,80,120,120,60,60,*");
    masterGrid.setColAlign("center,left,center,left,left,left,left,left,left,left,left");
    masterGrid.setColSorting("na,na,na,str,str,str,str,str,str,str,str");
    masterGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro,ro,ro,ro");
    masterGrid.enableDistributedParsing(true, 20);
    masterGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getDetail(rowID);
        if (cIndex == 2) {
            alert("请导航到查看明细页面!");
        }
    });
    masterGrid.init();

    //初始化明细表表列表
    detailGrid = new dhtmlXGridObject("detailGrid");
    detailGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    detailGrid.setSkin("dhx_skyblue");

    detailGrid.setHeader("序号,,物料名称,规格型号,计划数量,付款方式,生产厂商,需求日期,是否快速采购,备注");
    detailGrid.setInitWidths("40,0,100,150,80,80,120,80,80,*");
    detailGrid.setColAlign("center,left,left,left,left,left,left,left,left,left");
    detailGrid.setColSorting("na,na,str,str,str,str,str,str,str,str");
    detailGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    detailGrid.enableDistributedParsing(true, 20);
    detailGrid.init();

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



    $('#masterDiv').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomerSearch") {
            hidecustomerPop();
        }
    });

    //加载主表数据列表	
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

        sqlStr = "select [PurchasePlan].[PurchasePlanID], [PurchasePlan].[purchasePlanName], convert(nvarchar(10),[PurchasePlan].[createDate],120) as createDate, [PurchasePlan].[ladePlace], [Carrier].[CarrierName], [Customer].[CustomerName], [PurchasePlan].[state], CASE [PurchasePlan].[forLeader] WHEN '1' THEN '是' WHEN '0' THEN '否' END, [PurchasePlan].[comment] from [PurchasePlan] join [Carrier] on [PurchasePlan].[carrierID] = [Carrier].[carrierID] join [Customer] on [PurchasePlan].[customerID] = [Customer].[customerID]";

        sqlStr += " where [PurchasePlan].[createDate] between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' ";



        if (toolBar.getValue("txtpurchasePlanNameSearch") != "") {
            sqlStr += " and [PurchasePlan].[purchasePlanName] like '%" + toolBar.getValue("txtpurchasePlanNameSearch") + "%'";
        }



        if ($("#comboladePlaceSearch").val() != "-1") {
            sqlStr += " and [PurchasePlan].[ladePlace] = '" + $("#comboladePlaceSearch").val() + "'";
        }




        if ($("#combocarrierSearch").val() != "-1") {
            sqlStr += " and [Carrier].[CarrierName] = " + $("#combocarrierSearch").val();
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
                rock.tableToBillViewGrid(e, masterGrid, masterDataList, viewImg);
            }(ISystemService.execQuery.resultValue));
        }
    }
    //加载明细数据 
    function getDetail(masterID) {
        ISystemService.execQuery.sqlString = "select [PurchasePlanDetail].[PurchasePlanDetailID], [Material].[materialName], [Material].[specification], [PurchasePlanDetail].[quantity], [PurchasePlanDetail].[payment], [Producer].[ProducerName], convert(nvarchar(10),[PurchasePlanDetail].[demandDate],120) as demandDate, CASE [PurchasePlanDetail].[isQuick] WHEN '1' THEN '是' WHEN '0' THEN '否' END, [PurchasePlanDetail].[comment] from [PurchasePlanDetail] join [Material] on [PurchasePlanDetail].[MaterialID] = [Material].[MaterialID] join [Producer] on [PurchasePlanDetail].[producerID] = [Producer].[producerID] and [PurchasePlanDetail].[PurchasePlanID] = " + masterID;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, detailGrid, detailDataList)
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