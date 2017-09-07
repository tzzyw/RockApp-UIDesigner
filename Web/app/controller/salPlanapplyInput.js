
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      contract = null,
    printImg = "/resource/dhtmlx/codebase/imgs/toolbar_icon/print.gif^打印",
    editItem = $("#editItem"),
    dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
  
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Contract";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        getDataList();

    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("createDateBegin", null, "创建日期");
    toolBar.addInput("begincreateDate", null, "", 75);
    toolBar.addText("创建日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 75);
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);
    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                getDataList();
                break;
        }
    });

    //初始化销售合同列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("序号,,客户名称,产品名称,原计划量,审批数量");
    listGrid.setInitWidths("40,0,200,150,80,*");
    listGrid.setColAlign("center,center,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        alert("尚未设定查看明细弹窗!");
    });
    //listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
    //    if (cIndex == 2) {
    //        window.open("ContractPrint.html?id=" + rowID);
    //    }
    //});
    listGrid.init();

    function getDataList() {
        sqlStr = "select CustomerPlanApplyID, Customer.CustomerName, Material.MaterialName, CustomerPlanQuantity.Quantity, CustomerPlanApply.Quantity, '' as 录入计划量 from CustomerPlanApply join CustomerPlanQuantity on CustomerPlanApply.CustomerPlanQuantityID = CustomerPlanQuantity.CustomerPlanQuantityID join Customer on CustomerPlanQuantity.CustomerID = Customer.CustomerID join Material on CustomerPlanQuantity.MaterialID = Material.MaterialID where CustomerPlanApply.[State] = '已审核' ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);

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