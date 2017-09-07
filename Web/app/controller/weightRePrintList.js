
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      measure = null,
      printImg = "/resource/dhtmlx/codebase/imgs/toolbar_icon/print.gif^打印",
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

                toolBar.setValue("begintareTime", beginDate);
                toolBar.setValue("endtareTime", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }
        //处理初始化加载数据
        sqlStr = "select top 100 [Measure].[MeasureID], [Customer].[CustomerName], [Material].[MaterialName], [Measure].[grossTime], [Measure].[vehicleNum], [Measure].[netWeight] from [Measure] join [Customer] on [Measure].[customerID] = [Customer].[customerID] join [Material] on [Measure].[materialID] = [Material].[materialID] ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToBillGrid(e, listGrid, dictDataList, 3, printImg, printImg);
            }(ISystemService.execQuery.resultValue));
        }

        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] order by MaterialName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                toolBar.addListOption("combomaterialSearch", "物料", 1, "button", "物料")
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        toolBar.addListOption("combomaterialSearch", rowResult[0].value, i + 2, "button", rowResult[1].value)
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("tareTimeBegin", null, "皮重时间");
    toolBar.addInput("begintareTime", null, "", 75);
    toolBar.addText("皮重时间End", null, "-");
    toolBar.addInput("endtareTime", null, "", 75);
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);
    toolBar.addButtonSelect("combomaterialSearch", null, "物料", [], null, null, true, true, 15, "select")
    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                if ($.trim(toolBar.getValue("begintareTime")) == "") {
                    alert("起始皮重时间不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("begintareTime"), "-")) {
                    alert("起始皮重时间格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endtareTime")) == "") {
                    alert("截止皮重时间不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endtareTime"), "-")) {
                    alert("截止皮重时间格式不正确,正确格式为 2010-10-10！");
                    return false;
                }

                sqlStr = "select [Measure].[MeasureID], [Customer].[CustomerName], [Material].[MaterialName], [Measure].[grossTime], [Measure].[vehicleNum], [Measure].[netWeight] from [Measure] join [Customer] on [Measure].[customerID] = [Customer].[customerID] join [Material] on [Measure].[materialID] = [Material].[materialID]";

                sqlStr += " and [Measure].[tareTime] between '" + toolBar.getValue("begintareTime") + " 0:0:0' AND '" + toolBar.getValue("endtareTime") + " 23:59:59' ";


                if (toolBar.getValue("txtcustomerSearch") != "") {
                    sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
                }


                if (toolBar.getItemText("combomaterialSearch") != "物料") {
                    sqlStr += " and [Material].[MaterialName] = '" + toolBar.getItemText("combomaterialSearch") + "'";
                }

                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToBillGrid(e, listGrid, dictDataList, 3, printImg, printImg);
                    }(ISystemService.execQuery.resultValue));
                }
                break;

        }
    });


    //初始化计量单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("序号,,打印,客户名称,产品名称,毛重时间,车号,净重");
    listGrid.setInitWidths("40,0,40,200,150,120,120,*");
    listGrid.setColAlign("center,left,center,left,left,left,left,left");
    listGrid.setColSorting("na,na,na,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro");
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        window.open("weightPrint.html?id=" + rowID + "&act=Reprint");
        return true;
    });
    listGrid.init();


    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("begintareTime"));

    dateboxArray.push(toolBar.getInput("endtareTime"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})