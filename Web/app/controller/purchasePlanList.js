
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, masterGrid, detailGrid, sqlStr,
	editImg = "/resource/dhtmlx/codebase/imgs/edit.gif",
    disEditImg = "/resource/dhtmlx/codebase/imgs/own/edit.png",
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

                toolBar.setValue("beginapplyDate", beginDate);


                toolBar.setValue("endapplyDate", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        //处理初始化加载数据

        sqlStr = "select top 100 [PurchasePlan].[PurchasePlanID], [PurchasePlan].[purchasePlanCode], [PurchasePlan].[purchasePlanName], convert(nvarchar(10),[PurchasePlan].[applyDate],120) as applyDate, [PurchasePlan].[handler], [PurchasePlan].[state], [PurchasePlan].[comment] from [PurchasePlan]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToBillGrid(e, masterGrid, masterDataList, 4, editImg, disEditImg);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项



        //初始化通用参照







    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("masterDiv");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("b").attachObject("detailDiv");
    dhxLayout.cells("b").hideHeader();

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("applyDateBegin", null, "提报日期");
    toolBar.addInput("beginapplyDate", null, "", 75);
    toolBar.addText("提报日期End", null, "-");
    toolBar.addInput("endapplyDate", null, "", 75);


    toolBar.addText("handler", null, "提报人");
    toolBar.addInput("txthandlerSearch", null, "", 100);



    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);

    toolBar.addButton("add", null, "新增");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":

                if ($.trim(toolBar.getValue("beginapplyDate")) == "") {
                    alert("起始提报日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("beginapplyDate"), "-")) {
                    alert("起始提报日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endapplyDate")) == "") {
                    alert("截止提报日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endapplyDate"), "-")) {
                    alert("截止提报日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }



                sqlStr = "select [PurchasePlan].[PurchasePlanID], [PurchasePlan].[purchasePlanCode], [PurchasePlan].[purchasePlanName], convert(nvarchar(10),[PurchasePlan].[applyDate],120) as applyDate, [PurchasePlan].[handler], [PurchasePlan].[state], [PurchasePlan].[comment] from [PurchasePlan]";

                sqlStr += " where [PurchasePlan].[applyDate] between '" + toolBar.getValue("beginapplyDate") + " 0:0:0' AND '" + toolBar.getValue("endapplyDate") + " 23:59:59' ";



                if (toolBar.getValue("txthandlerSearch") != "") {
                    sqlStr += " and [PurchasePlan].[handler] like '%" + toolBar.getValue("txthandlerSearch") + "%'";
                }



                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToBillGrid(e, masterGrid, masterDataList, 4, editImg, disEditImg);
                    }(ISystemService.execQuery.resultValue));
                }
                break;
            case "add":
                window.parent.openBillManage(null, "PurchasePlanSubmission", "采购计划维护");
                break;

        }
    });




    //初始化主表列表
    masterGrid = new dhtmlXGridObject("masterGrid");
    masterGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    masterGrid.setSkin("dhx_skyblue");


    masterGrid.setHeader("序号,,修改,采购计划编码,计划名称,提报日期,提报人,状态,备注");
    masterGrid.setInitWidths("40,0,40,100,100,80,60,60,*");
    masterGrid.setColAlign("center,left,center,left,left,left,left,left,left");
    masterGrid.setColSorting("na,na,na,str,str,str,str,str,str");
    masterGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro,ro");
    masterGrid.enableDistributedParsing(true, 20);
    masterGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getDetail(rowID);
        if (cIndex == 2) {
            window.parent.openBillManage(rowID, "PurchasePlanSubmission", "采购计划维护");
        }
    });
    masterGrid.init();


    //初始化明细表表列表
    detailGrid = new dhtmlXGridObject("detailGrid");
    detailGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    detailGrid.setSkin("dhx_skyblue");


    detailGrid.setHeader("序号,,物料名称,物料等级,备注,数量,备注");
    detailGrid.setInitWidths("40,0,100,80,100,40,*");
    detailGrid.setColAlign("center,left,left,left,left,left,left");
    detailGrid.setColSorting("na,na,str,str,str,str,str");
    detailGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro");
    detailGrid.enableDistributedParsing(true, 20);
    detailGrid.init();










    //加载明细数据    


    function getDetail(masterID) {
        ISystemService.execQuery.sqlString = "select [PurchasePlanDetail].[PurchasePlanDetailID], [Material].[materialName], [Material].[materialLevel], [Material].[comment], [PurchasePlanDetail].[quantity], [PurchasePlanDetail].[DetailComment] from [PurchasePlanDetail] join [Material] on [PurchasePlanDetail].[MaterialID] = [Material].[MaterialID] and [PurchasePlanDetail].[PurchasePlanID] = " + masterID;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, detailGrid, detailDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginapplyDate"));

    dateboxArray.push(toolBar.getInput("endapplyDate"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})