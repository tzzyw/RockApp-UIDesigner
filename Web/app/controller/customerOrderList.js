
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      customerOrder = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,CustomerOrder";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';
                toolBar.setValue("beginorderDate", beginDate);
                toolBar.setValue("endorderDate", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        //处理初始化加载数据
        getDataList();
        //初始化通用参照
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("orderDateBegin", null, "提货日期");
    toolBar.addInput("beginorderDate", null, "", 75);
    toolBar.addText("提货日期End", null, "-");
    toolBar.addInput("endorderDate", null, "", 75);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("modify", null, "处理意见");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                getDataList();
                break;           
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑处理意见");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "CustomerOrder";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                customerOrder = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }
                        $("#txtopinion").val(customerOrder.feedback);
                        showEditForm();
                    }
                    else {
                        alert("请仅选择一条要修改的行!");
                    }
                }
                else {
                    alert("请选择要修改的行!");
                }
                break;
        }
    });

    //初始化客户订单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,客户名称,产品名称,订单数量,单价(元/吨),提货车辆,产品流向,订单日期,提货日期,处理意见");
    listGrid.setInitWidths("40,0,200,120,80,100,150,80,80,100,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑处理意见");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "CustomerOrder";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                customerOrder = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }
        $("#txtopinion").val(customerOrder.feedback);
        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(135);
    editForm.width(450);
    editForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;

        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                editForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    editForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideEditForm();
    function hideEditForm() {
        editForm.css({ top: 200, left: -1300 }).hide();
        editForm.css("visibility", "visible");
    }
    function showEditForm() {
        editForm.css({ top: 100, left: 180 }).show();
    }
    //取消
    $("#btn_Cancle").click(function () {
        hideEditForm();
    });
    //关闭
    $("#img_Close").click(function () {
        hideEditForm();
    });

    //保存
    $("#btn_Save").click(function () {
        customerOrder.feedback = $("#txtopinion").val();
        ISystemService.modifyDynObject.dynObject = customerOrder;
        rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
        if (ISystemService.modifyDynObject.success) {
            (function (e) {
                for (var i = 0; i < dictDataList.rows.length; i++) {
                    if (dictDataList.rows[i].id == customerOrder.customerOrderID) {
                        dictDataList.rows[i].data[10] = $("#txtopinion").val();
                    }
                }
            }(ISystemService.modifyDynObject.resultValue));
        }
        listGrid.clearAll();
        listGrid.parse(dictDataList, "json");
        hideEditForm();
        alert("客户订单修改成功!");

        refreshToolBarState();
    });

    function getDataList() {
        if ($.trim(toolBar.getValue("beginorderDate")) == "") {
            alert("起始订单日期不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("beginorderDate"), "-")) {
            alert("起始订单日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }
        if ($.trim(toolBar.getValue("endorderDate")) == "") {
            alert("截止订单日期不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("endorderDate"), "-")) {
            alert("截止订单日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }
        sqlStr = "select [CustomerOrder].[CustomerOrderID], [Customer].[CustomerName], [Material].[MaterialName], [CustomerOrder].[quantity],isnull(Price,0) as Price, [CustomerOrder].[vehicleNum], [CustomerOrder].[destination], convert(nvarchar(10),[CustomerOrder].[orderDate],120) as orderDate, convert(nvarchar(10),[CustomerOrder].[deliveryDate],120) as deliveryDate, [CustomerOrder].[feedback] from [CustomerOrder] join [Customer] on [CustomerOrder].[CustomerID] = [Customer].[CustomerID] join [Material] on [CustomerOrder].[materialID] = [Material].[materialID] ";

        sqlStr += " and [CustomerOrder].[DeliveryDate] between '" + toolBar.getValue("beginorderDate") + " 0:0:0' AND '" + toolBar.getValue("endorderDate") + " 23:59:59' ";

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }

    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("modify");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("modify");
            }
            else {
                toolBar.enableItem("modify");
            }
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginorderDate"));

    dateboxArray.push(toolBar.getInput("endorderDate"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})