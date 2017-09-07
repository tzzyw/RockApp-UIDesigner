
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      measure = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Measure";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("begincreateTime", beginDate);


                toolBar.setValue("endcreateTime", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }
        //处理初始化加载数据

        sqlStr = "select top 100 [Measure].[MeasureID], [Material].[MaterialName], [Customer].[CustomerName], [Measure].[heavyOperator], convert(nvarchar(10),[Measure].[createTime],120) as createTime, [Measure].[vehicleNum], [Measure].[gross], [Measure].[tare], [Measure].[netWeight], [Measure].[TareTime], [Measure].[platform], [Measure].[deliveryTank], [Measure].[comment] from [Measure] join [Material] on [Measure].[materialID] = [Material].[materialID] join [Customer] on [Measure].[customerID] = [Customer].[customerID] ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }


       

    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("createTimeBegin", null, "提货日期");
    toolBar.addInput("begincreateTime", null, "", 75);
    toolBar.addText("创建时间End", null, "-");
    toolBar.addInput("endcreateTime", null, "", 75);
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);
    toolBar.addButtonSelect("combomaterialSearch", null, "物料", [], null, null, true, true, 15, "select")
    toolBar.addText("vehicleNum", null, "车号");
    toolBar.addInput("txtvehicleNumSearch", null, "", 100);
    toolBar.addText("measureUnit", null, "计量单位");
    toolBar.addInput("txtmeasureUnitSearch", null, "", 100);
    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                if ($.trim(toolBar.getValue("begincreateTime")) == "") {
                    alert("起始创建时间不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("begincreateTime"), "-")) {
                    alert("起始创建时间格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endcreateTime")) == "") {
                    alert("截止创建时间不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endcreateTime"), "-")) {
                    alert("截止创建时间格式不正确,正确格式为 2010-10-10！");
                    return false;
                }

                sqlStr = "select [Measure].[MeasureID], [Material].[MaterialName], [Customer].[CustomerName], [Measure].[heavyOperator], convert(nvarchar(10),[Measure].[createTime],120) as createTime, [Measure].[vehicleNum], [Measure].[planQuantity], [Measure].[gross], [Measure].[tare], [Measure].[netWeight],[Measure].[TareTime], [Measure].[platform], [Measure].[deliveryTank], [Measure].[comment] from [Measure] join [Material] on [Measure].[materialID] = [Material].[materialID] join [Customer] on [Measure].[customerID] = [Customer].[customerID]";


                sqlStr += " and [Measure].[createTime] between '" + toolBar.getValue("begincreateTime") + " 0:0:0' AND '" + toolBar.getValue("endcreateTime") + " 23:59:59' ";


                if (toolBar.getValue("txtcustomerSearch") != "") {
                    sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
                }


                if (toolBar.getItemText("combomaterialSearch") != "物料") {
                    sqlStr += " and [Material].[MaterialName] = '" + toolBar.getItemText("combomaterialSearch") + "'";
                }

                if (toolBar.getValue("txtvehicleNumSearch") != "") {
                    sqlStr += " and [Measure].[vehicleNum] like '%" + toolBar.getValue("txtvehicleNumSearch") + "%'";
                }

                if (toolBar.getValue("txtmeasureUnitSearch") != "") {
                    sqlStr += " and [Measure].[measureUnit] like '%" + toolBar.getValue("txtmeasureUnitSearch") + "%'";
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


    //初始化计量单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("序号,,物料名称,客户名称,重车司磅员,创建时间,车号,毛重,皮重,净重,皮重时间,站台,状态,备注");
    listGrid.setInitWidths("40,0,90,120,90,110,80,80,80,80,110,100,80,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        alert("尚未设定查看明细弹窗!");
    });
    listGrid.init();




    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("begincreateTime"));

    dateboxArray.push(toolBar.getInput("endcreateTime"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})