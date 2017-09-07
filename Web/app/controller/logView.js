$(function () {
    //加载JS脚本库域服务和对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //页面对象声明
        var toolBar, dhxLayout, logGrid, serverDate, beginDate, 
        logDataList = new rock.JsonList(),
        selectedRowId = null,
        newdt = null,
        repnewdt = null,
        serialnumberDataList = new rock.JsonList();

        //初始化参数页面工具条
        toolBar = new dhtmlXToolbarObject("toobar");
        toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/");
        toolBar.addText("起始日期", null, "起止日期");
        toolBar.addInput("beginDate", null, "", 75);
        toolBar.addText("截止日期", null, "-");
        toolBar.addInput("endDate", null, "", 75);
        toolBar.addText("用户名", null, "用户名");
        toolBar.addInput("OperaterName", null, "", 75);
        toolBar.addButton("query", null, "", "search.gif", "search.gif");
        toolBar.addButton("start", 0, "启动工作流测试");
        toolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "query":
                    if ($.trim(toolBar.getValue("beginDate")) == "") {
                        alert("起始日期不能为空！");
                        return;
                    }
                    if ($.trim(toolBar.getValue("endDate")) == "") {
                        alert("截止日期不能为空！");
                        return;
                    }
                    if (!rock.chkdate(toolBar.getValue("beginDate"), "-")) {
                        alert("起始日期格式不正确,正确格式为 2010-10-10！");
                        return false;
                    }
                    if (!rock.chkdate(toolBar.getValue("endDate"), "-")) {
                        alert("截止日期格式不正确,正确格式为 2010-10-10！");
                        return false;
                    }

                    newdt = new Date(Number(toolBar.getValue("endDate").split("-")[0]), Number(toolBar.getValue("endDate").split("-")[1]) - 1, Number(toolBar.getValue("endDate").split("-")[2]));
                    newdt.setDate(newdt.getDate() + 1)
                    repnewdt = newdt.getFullYear() + "-" + (newdt.getMonth() + 1) + "-" + newdt.getDate();

                    sqlStr = "SELECT LogID, OperaterName,OperateTime from [Log] where OperateTime BETWEEN '" + toolBar.getValue("beginDate") + "' AND '" + repnewdt  + "'";
                    
                    if (toolBar.getValue("OperaterName") != "") {
                        sqlStr += " and OperaterName like  '%" + toolBar.getValue("OperaterName") + "%'";
                    }
                    
                    ISystemService.execQuery.sqlString = sqlStr + " order by OperateTime";
                    rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                    if (ISystemService.execQuery.success) {
                        (function (e) {
                            var rows = e.rows;
                            logDataList.rows = [];
                            logGrid.clearAll();
                            for (var i = 0; i < rows.length; i++) {
                                var rowResult = rows[i].values;
                                var listdata = new rock.JsonData(rowResult[0].value);
                                listdata.data[0] = 0;
                                listdata.data[1] = rowResult[0].value;
                                listdata.data[2] = rowResult[1].value;
                                listdata.data[3] = rowResult[2].value;
                                logDataList.rows.push(listdata);
                            }
                            logGrid.parse(logDataList, "json");
                        }(ISystemService.execQuery.resultValue));
                    }
                    break;
                case "start":
                    var equistr = [];
                    equistr[0] = "LogID^1";
                    equistr[1] = "TableName^Log";
                    equistr[2] = "TableKey^1";
                    equistr[3] = "Actor^1";
                    equistr[4] = "Command^" + "PositionManage.html?id=3";
                    //PositionManage.html?id=@LogID@
                    ISystemService.startWorkflow.workflowID = 3;
                    ISystemService.startWorkflow.userID = $.cookie('userID');
                    ISystemService.startWorkflow.exchangeParamLists = equistr;
                    rock.AjaxRequest(ISystemService.startWorkflow, rock.exceptionFun);
                    break;
            }
        });

        //获取服务器当前日期
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';
                toolBar.setValue("beginDate", beginDate);
                toolBar.setValue("endDate", serverDate);
            }(ISystemService.getServerDate.resultValue));
        }
        //初始化采购计划表格
        logGrid = new dhtmlXGridObject('logGrid');
        logGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        logGrid.setHeader("序号,,用户名,登录时间,");
        logGrid.setInitWidths("40,0,120,190,*");
        logGrid.setColAlign("center,center,center,left,left");
        logGrid.setSkin("dhx_skyblue");
        logGrid.setColSorting("na,na,str,str,str");
        logGrid.setColTypes("cntr,ro,ro,ro,ro");
        logGrid.enableDistributedParsing(true, 20);        
        logGrid.init();

        newdt = new Date(Number(serverDate.split("-")[0]), Number(serverDate.split("-")[1]) - 1, Number(serverDate.split("-")[2]));
        newdt.setDate(newdt.getDate() + 1)
        repnewdt = newdt.getFullYear() + "-" + (newdt.getMonth() + 1) + "-" + newdt.getDate();

        ISystemService.execQuery.sqlString = "SELECT LogID, OperaterName,OperateTime from [Log] where OperateTime BETWEEN '" + beginDate + "' AND '" + repnewdt + "' order by OperateTime";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                logDataList.rows = [];
                logGrid.clearAll();
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    listdata.data[1] = rowResult[0].value;                  
                    listdata.data[2] = rowResult[1].value;
                    listdata.data[3] = rowResult[2].value;                    
                    logDataList.rows.push(listdata);
                }
                logGrid.parse(logDataList, "json");
            }(ISystemService.execQuery.resultValue));
        }      

        //日期控件测试
        var dateboxArray = [];
        dateboxArray.push(toolBar.getInput("beginDate"));
        dateboxArray.push(toolBar.getInput("endDate"));
        myCalendar = new dhtmlXCalendarObject(dateboxArray);
        myCalendar.loadUserLanguage('cn');
    });
})
