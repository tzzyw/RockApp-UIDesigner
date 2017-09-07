
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      measure = null,
      printImg = "/resource/dhtmlx/codebase/imgs/toolbar_icon/print.gif^打印",
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,ICommonService,IBusinessService,DataTable,DataRow,DataColumn,Measure";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //站台选择
        ICommonService.userInDepart.userID = $.cookie('userID');
        ICommonService.userInDepart.departID = 5;
        rock.AjaxRequest(ICommonService.userInDepart, rock.exceptionFun);
        if (ICommonService.userInDepart.success) {
            (function (e) {
                if (e.value) {
                    $("#txtplatName").val("己烷站台");
                    platName = "己烷站台";
                }
            }(ICommonService.userInDepart.resultValue));
        }
        ICommonService.userInDepart.userID = $.cookie('userID');
        ICommonService.userInDepart.departID = 7;
        rock.AjaxRequest(ICommonService.userInDepart, rock.exceptionFun);
        if (ICommonService.userInDepart.success) {
            (function (e) {
                if (e.value) {
                    $("#txtplatName").val("1-丁烯站台");
                    platName = "1-丁烯站台";
                }
            }(ICommonService.userInDepart.resultValue));
        }

        //getVehicle();       

        platName = "己烷站台";

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
        $("#btn_Save").attr("disabled", true);
        //初始化实体参照及查询项
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
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] where ForSale = '1' order by MaterialName";
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

        customerComplete("");

        getDataList();

        //绑定控件失去焦点验证方法
        //MeasureClass.validateBind();
        //初始化工具栏状态
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("tareTimeBegin", null, "开票日期");
    toolBar.addInput("begintareTime", null, "", 55);
    toolBar.addText("开票日期End", null, "-");
    toolBar.addInput("endtareTime", null, "", 55);
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);
    toolBar.addButtonSelect("combomaterialSearch", null, "物料", [], null, null, true, true, 15, "select")
    toolBar.addText("vehicleNum", null, "车号");
    toolBar.addInput("txtvehicleNumSearch", null, "", 50);
    toolBar.addButton("query", null, "查询");    
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                hideEditForm();
                if ($.trim(toolBar.getValue("begintareTime")) == "") {
                    alert("起始开票日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("begintareTime"), "-")) {
                    alert("起始开票日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endtareTime")) == "") {
                    alert("截止开票日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endtareTime"), "-")) {
                    alert("截止开票日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }

                getDataList();
                break;
        }
    });

    toolBar.getInput("txtcustomerSearch").id = "txtcustomerSearch";

    //初始化计量单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("序号,,打印,计量单编号,客户名称,物料名称,计量时间,车船号,数量,经办人");
    listGrid.setInitWidths("40,0,40,110,200,150,70,120,60,*");
    listGrid.setColAlign("center,center,center,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,img,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        window.open("NoWeightPrint.html?id=" + rowID + "&act=Reprint");
        return true;
    });
    listGrid.init();

   
    function getDataList() {
        sqlStr = "select [Measure].[MeasureID], [Measure].[measureNum], [Customer].[CustomerName], [Material].[MaterialName], [Measure].[GrossTime], [Measure].[vehicleNum], [Measure].[NetWeight], [Measure].[HeavyOperator] from [Measure] join [Customer] on [Measure].[customerID] = [Customer].[customerID] join [Material] on [Measure].[materialID] = [Material].[materialID] join LadeBill on Measure.LadeBillID = LadeBill.LadeBillID and Measure.MeasureType='销售非称重' and Measure.Closed='0' ";

        sqlStr += " and [LadeBill].[LadeDate] between '" + toolBar.getValue("begintareTime") + " 0:0:0' AND '" + toolBar.getValue("endtareTime") + " 23:59:59' ";

        if (toolBar.getValue("txtcustomerSearch") != "") {
            sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
        }

        if (toolBar.getItemText("combomaterialSearch") != "物料") {
            sqlStr += " and [Material].[MaterialName] = '" + toolBar.getItemText("combomaterialSearch") + "'";
        }

        if (toolBar.getValue("txtvehicleNumSearch") != "") {
            sqlStr += " and [Measure].[vehicleNum] like '%" + toolBar.getValue("txtvehicleNumSearch") + "%'";
        }

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToBillGrid(e, listGrid, dictDataList, 3, printImg, printImg);
                //rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }


    //加载弹窗Div

    $(document.body).append('<div id="customerPop" style="width: 260px; height: 400px; position: absolute; background-color: White;display: none;z-index:9"><div id="customerQuickGrid" style="width: 260px; height: 400px; float: left; border: 1px solid #E3E3E3;"></div></div>');
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
    $('#txtcustomerSearch').focus(function (e) {
        showcustomerPop();
    });

    function showcustomerPop() {
        var top = $("#txtcustomerSearch").offset().top;
        var left = $("#txtcustomerSearch").offset().left;
        customerPop.css({ top: top + 22, left: left }).show();
    }

    function hidecustomerPop() {
        customerPop.css({ top: 200, left: -1300 }).hide();
    }
    hidecustomerPop();

    $("#txtcustomerSearch").keyup(function () {
        customerComplete($("#txtcustomerSearch").val());
    });
    var customerDataList = new rock.JsonList();
    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 20 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where [CustomerName] like  '%" + $("#txtcustomerSearch").val() + "%' or [SearchCode] like  '%" + $("#txtcustomerSearch").val() + "%'";
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
})