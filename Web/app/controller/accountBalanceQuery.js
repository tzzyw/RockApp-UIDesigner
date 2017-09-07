
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, masterpanel, cashRecordGrid, sqlStr, ladeBillGrid, customerForm,
      customer = null,
      masterDataList = new rock.JsonList(),
      cashRecordDataList = new rock.JsonList(),
     customerDataList = new rock.JsonList(),
    ladeBillDataList = new rock.JsonList();
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Customer";
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

        ////处理初始化加载数据

        //sqlStr = "select top 100 [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply] ";
        //ISystemService.execQuery.sqlString = sqlStr;
        //rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        //if (ISystemService.execQuery.success) {
        //    (function (e) {
        //        rock.tableToBillGrid(e, masterGrid, masterDataList, 3, printImg, printImg);
        //    }(ISystemService.execQuery.resultValue));
        //}
        //初始化实体参照及查询项


        //初始化通用参照



    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("masterDiv");
    dhxLayout.cells("a").hideHeader();
    //dhxLayout.cells("b").attachObject("detailDiv");
    dhxLayout.cells("b").setHeight(580);
    dhxLayout.cells("b").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("cashRecord", "客户账户余额变动历史列表", 160, 1);
    tabbar.addTab("history", "冻结余额提货单明细", 120, 2);

    tabbar.tabs("cashRecord").setActive();
    tabbar.tabs("cashRecord").attachObject("cashRecordDiv");
    tabbar.tabs("history").attachObject("ladeBillDiv");


    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("createDateBegin", null, "记录日期");
    toolBar.addInput("begincreateDate", null, "", 60);
    toolBar.addText("申请日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 60);
    toolBar.addText("customer", null, "选择客户");
    toolBar.addInput("txtcustomerSearch", null, "", 150);

    toolBar.getInput("txtcustomerSearch").id = "txtcustomerSearch";



    //初始化收款记录历史列表
    cashRecordGrid = new dhtmlXGridObject("cashRecordGrid");
    cashRecordGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    cashRecordGrid.setSkin("dhx_skyblue");
    cashRecordGrid.setHeader("序号,,变更日期,收款金额,结算金额,结存金额,经办人,相关单据ID,备注");
    cashRecordGrid.setInitWidths("40,0,75,80,80,80,60,80,*");
    cashRecordGrid.setColAlign("center,left,left,left,left,left,left,left,left");
    cashRecordGrid.setColSorting("na,na,str,str,str,str,str,str,str");
    cashRecordGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro");
    cashRecordGrid.enableDistributedParsing(true, 20);
    cashRecordGrid.init();


    //初始化流程处理信息列表
    ladeBillGrid = new dhtmlXGridObject("ladeBillGrid");
    ladeBillGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    ladeBillGrid.setSkin("dhx_skyblue");
    ladeBillGrid.setHeader("序号,,提货单编码,产品名称,提货日期,提货量,总金额,经办人");
    ladeBillGrid.setInitWidths("40,0,120,100,80,80,80,*");
    ladeBillGrid.setColAlign("center,left,left,left,left,left,left,left");
    ladeBillGrid.setColSorting("na,na,str,str,str,str,str,str");
    ladeBillGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro");
    ladeBillGrid.enableDistributedParsing(true, 20);
    ladeBillGrid.init();

    //初始化客户选择表格
    customerGrid = new dhtmlXGridObject('customerGrid');
    customerGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    customerGrid.setSkin("dhx_skyblue");
    customerGrid.setHeader("序号,,客户编码,类别,客户名称");
    customerGrid.setInitWidths("40,0,70,40,*");
    customerGrid.setColAlign("center,left,left,left,left");
    customerGrid.setColTypes("cntr,ro,ro,ro,ro");
    customerGrid.setColSorting("na,na,str,str,str");
    customerGrid.enableDistributedParsing(true, 20);
    customerGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "Customer";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                customer = e;
                $("#txtcustomerSearch").val(customer.customerName);
                $("#txtcustomerID").val(customer.customerID);
                if (customer.currentBalance) {
                    $("#txtcurrenteBalance").val(customer.currentBalance);
                }
                else {
                    $("#txtcurrenteBalance").val("0");
                }
                hidcustomerForm();

                if ($.trim(toolBar.getValue("begincreateDate")) == "") {
                    alert("起始记录日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("begincreateDate"), "-")) {
                    alert("起始记录日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endcreateDate")) == "") {
                    alert("截止记录日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endcreateDate"), "-")) {
                    alert("截止记录日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                getcashRecor(customer.customerID);
                getladeBillList(customer.customerID);
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

    });
    customerGrid.init();

    customerForm = $("#customerForm");
    var mark = true;
    $('#txtcustomerSearch').mousedown(function (e) {
        if (mark) {
            ISystemService.execQuery.sqlString = "select top 15  [CustomerID], [CustomerCode], [Category], [CustomerName] from [Customer]";
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, customerGrid, customerDataList);
                }(ISystemService.execQuery.resultValue));
            }
            mark = false;
        }
        showcustomerForm();
    });

    $("#txtcustomerSearch").keyup(function () {
        customerComplete($("#txtcustomerSearch").val());
    });

    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 15 [CustomerID], [CustomerCode], [Category], [CustomerName] from [Customer] where CustomerName like  '%" + searchCode + "%' or [SearchCode] like  '%" + searchCode + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }

    function showcustomerForm() {
        var top = $("#txtcustomerSearch").offset().top;
        var left = $("#txtcustomerSearch").offset().left;
        customerForm.css({ top: top + 22, left: left }).show();
    }
    function hidcustomerForm() {
        customerForm.css({ top: 200, left: -1300 }).hide();
    }
    $('#masterDiv').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomerSearch") {
            hidcustomerForm();
        }
    });

    hidcustomerForm();

    //加载明细数据    


    function getcashRecor(customerID) {
        // 序号,,变更日期,收款金额,结算金额,结存金额,经办人,相关单据ID,备注");
        ISystemService.execQuery.sqlString = "select CashRecordID, convert(nvarchar(10),ChangeDate,120), ReceiveQuantity, PayQuantity, Balance, Agent, case when ReceivecashID > 0 then ReceivecashID else  SalCheckoutID end, Comment from CashRecord where CustomerID = " + customerID + " and ChangeDate between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' ";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, cashRecordGrid, cashRecordDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }

    //加载流程处理信息数据
    function getladeBillList(customerID) {
        var Sql = "select LadeBillID, LadeBillNum, Material.MaterialName, convert(nvarchar(10),LadeDate,120), PlanQuantity, PlanTotal, Agent from LadeBill, Material where LadeBill.MaterialID = Material.MaterialID and LadeBill.Closed = '0' and LadeBill.State in ('已创建', '已提交') and LadeBill.CustomerID = " + customerID;
        Sql += " union select LadeBillID, LadeBillNum, Material.MaterialName, convert(nvarchar(10),LadeDate,120),ActualQuantity, ActualTotal, Agent from LadeBill, Material where LadeBill.MaterialID = Material.MaterialID and LadeBill.Closed = '0' and LadeBill.State in ('已确认', '已结算') and LadeBill.CustomerID = " + customerID;

        ISystemService.execQuery.sqlString = Sql;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                //rock.tableToListGrid(e, ladeBillGrid, ladeBillDataList)
                ladeBillGrid.clearAll();
                ladeBillDataList.rows = [];
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
                    if (rowResult[5].value) {
                        amount += parseFloat(rowResult[5].value);
                    }

                    for (var j = 1; j < colLength; j++) {
                        listdata.data[j + 1] = rowResult[j].value;
                    }
                    ladeBillDataList.rows.push(listdata);
                }
                listdata = new rock.JsonData("footer");
                listdata.data[0] = 0;
                listdata.data[1] = "0";
                listdata.data[2] = "合计： ";
                listdata.data[3] = "";
                listdata.data[4] = "";
                listdata.data[5] = Number(quantity).toFixed(2).toString();
                listdata.data[6] = Number(amount).toFixed(3).toString();

                ladeBillDataList.rows.push(listdata);
                ladeBillGrid.parse(ladeBillDataList, "json");
                ladeBillGrid.setColspan("footer", 2, 2);
                $("#txtfreezeBalance").val(amount);
                $("#txtavailableBalance").val(customer.currentBalance - amount);
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