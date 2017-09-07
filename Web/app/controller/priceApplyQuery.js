
$(function () {
    //初始化系统通用变量
    var tabbar, toolBar, dhxLayout, masterGrid, detailGrid, sqlStr,
	editImg = "/resource/dhtmlx/codebase/imgs/edit.gif",
    disEditImg = "/resource/dhtmlx/codebase/imgs/own/edit.png",
    masterDataList = new rock.JsonList(),
    detailDataList = new rock.JsonList(),
    auditHistoryDataList = new rock.JsonList();
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

        //处理初始化加载数据
        sqlStr = "select top 100 [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply]";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToBillGrid(e, masterGrid, masterDataList, 3, editImg, disEditImg);
            }(ISystemService.execQuery.resultValue));
        }
    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("masterDiv");
    dhxLayout.cells("a").hideHeader();
    //dhxLayout.cells("b").attachObject("detailDiv");
    dhxLayout.cells("b").setHeight(280);
    dhxLayout.cells("b").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("detail", "产品调价申请明细", 100, 1);
    tabbar.addTab("history", "产品调价审批历史", 100, 2);

    tabbar.tabs("detail").setActive();
    tabbar.tabs("detail").attachObject("detailDiv");
    tabbar.tabs("history").attachObject("auditHistoryDiv");


    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("createDateBegin", null, "申请日期");
    toolBar.addInput("begincreateDate", null, "", 75);
    toolBar.addText("申请日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 75);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":

                if ($.trim(toolBar.getValue("begincreateDate")) == "") {
                    alert("起始申请日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("begincreateDate"), "-")) {
                    alert("起始申请日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endcreateDate")) == "") {
                    alert("截止申请日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endcreateDate"), "-")) {
                    alert("截止申请日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }


                sqlStr = "select [PriceApply].[PriceApplyID], [PriceApply].[priceApplyNum], [PriceApply].[productName], convert(nvarchar(10),[PriceApply].[createDate],120) as createDate, case [PriceApply].[Over50] when '1' then '是' else '否' end, [PriceApply].[state] from [PriceApply]";

                sqlStr += " where [PriceApply].[createDate] between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' ";



                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToBillGrid(e, masterGrid, masterDataList, 3, editImg, disEditImg);
                    }(ISystemService.execQuery.resultValue));
                }
                break;
        }
    });



    //初始化主表列表
    masterGrid = new dhtmlXGridObject("masterGrid");
    masterGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    masterGrid.setSkin("dhx_skyblue");
    masterGrid.setHeader("序号,,,申请单编号,产品名称,创建日期,累计幅度大于50元,状态");
    masterGrid.setInitWidths("40,0,0,100,100,80,120,*");
    masterGrid.setColAlign("center,left,center,left,left,left,left,left");
    masterGrid.setColSorting("na,na,na,str,str,str,str,str");
    masterGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro");
    masterGrid.enableDistributedParsing(true, 20);
    masterGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getDetail(rowID);
        getauditHistoryList(rowID);
    });
    masterGrid.init();

    //初始化明细表表列表
    detailGrid = new dhtmlXGridObject("detailGrid");
    detailGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    detailGrid.setSkin("dhx_skyblue");


    detailGrid.setHeader("序号,,价格类别,调整前价格,申请调整价格,价格调整幅度");
    detailGrid.setInitWidths("40,0,80,100,100,*");
    detailGrid.setColAlign("center,left,left,left,left,left");
    detailGrid.setColSorting("na,na,str,str,str,str");
    detailGrid.setColTypes("cntr,ro,ro,ro,ro,ro");
    detailGrid.enableDistributedParsing(true, 20);
    detailGrid.init();

    //初始化流程处理信息列表
    auditHistoryGrid = new dhtmlXGridObject("auditHistoryGrid");
    auditHistoryGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    auditHistoryGrid.setSkin("dhx_skyblue");
    auditHistoryGrid.setHeader("序号,,审批部门,审批意见,审批人,审批结果,审批时间");
    auditHistoryGrid.setInitWidths("40,0,100,100,100,100,*");
    auditHistoryGrid.setColAlign("center,left,left,left,left,left,left");
    auditHistoryGrid.setColSorting("na,na,str,str,str,str,str");
    auditHistoryGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro");
    auditHistoryGrid.enableDistributedParsing(true, 20);
    auditHistoryGrid.init();


    //加载明细数据
    function getDetail(masterID) {
        ISystemService.execQuery.sqlString = "select [PriceApplyDetal].[PriceApplyDetalID], [PriceApplyDetal].[priceCategory], [PriceApplyDetal].[beforePrice], [PriceApplyDetal].[applyPrice], [PriceApplyDetal].[priceRange] from [PriceApplyDetal] where [PriceApplyDetal].[PriceApplyID] = " + masterID;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, detailGrid, detailDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }

    //加载流程处理信息数据
    function getauditHistoryList(rowID) {
        if (rowID) {
            ISystemService.execQuery.sqlString = "select [WorkflowActivityInstanceID], [Comment],[Opinion],[Handler],[Result],[EndTime] from [WorkflowActivityInstance] where [ObjType] = 'PriceApply' and [ObjID] = " + rowID;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, auditHistoryGrid, auditHistoryDataList)
                }(ISystemService.execQuery.resultValue));
            }
        }
        else {
            auditHistoryGrid.clearAll();
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("begincreateDate"));

    dateboxArray.push(toolBar.getInput("endcreateDate"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})