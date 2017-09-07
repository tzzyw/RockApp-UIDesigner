
$(function () {
    //初始化系统通用变量
    var toolBar, tabbar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      customerPlanApply = null,
      customerPlanQuantity = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList(),
      auditHistoryDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,CustomerPlanQuantity,CustomerPlanApply,Customer,Material,IBusinessService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;

                //初始化日期选择年份
                var year = parseInt(serverDate.substr(0, 4), 10);
                for (var i = 0; i < 4; i++) {
                    $("#comboyearSearch").append("<option value='" + (year - i + 1) + "'>" + (year - i + 1) + "</option>");
                }
                $("#comboyearSearch").get(0).selectedIndex = 1;

            }(ISystemService.getServerDate.resultValue));
        }

        for (var i = 1; i < 13; i++) {
            $("#combomonthSearch").append("<option value='" + i + "'>" + i + "</option>");
        }
        //处理初始化加载数据

        sqlStr = "select top 100 [CustomerPlanApply].[CustomerPlanApplyID], [Customer].[CustomerName], [Material].[MaterialName], [CustomerPlanQuantity].[quantity], [CustomerPlanApply].[Quantity], convert(nvarchar(10),[CustomerPlanApply].[CreateDate],120), [CustomerPlanApply].[Salesman], [CustomerPlanApply].[State], [CustomerPlanApply].[Reason] from [CustomerPlanApply] join [CustomerPlanQuantity] on [CustomerPlanApply].[CustomerPlanQuantityID] = [CustomerPlanQuantity].[CustomerPlanQuantityID] join [Customer] on [CustomerPlanQuantity].[customerID] = [Customer].[customerID] join [Material] on [CustomerPlanQuantity].[materialID] = [Material].[materialID] and [CustomerPlanApply].[Salesman] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }

        $("#combomaterial").empty();
        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] where ForSale = '1' order by MaterialName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                toolBar.addListOption("combomaterialSearch", "产品", 1, "button", "产品")
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combomaterial").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                        toolBar.addListOption("combomaterialSearch", rowResult[0].value, i + 2, "button", rowResult[1].value)
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

      

        $("#txtcustomerID").val("");
        $("#txtcustomer").val("");
        customerComplete("");

        //绑定控件失去焦点验证方法
        //CustomerPlanQuantityClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").attachObject("dictDiv");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("b").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("auditHistoryDiv", "审批历史信息", 80, 1);

    tabbar.tabs("auditHistoryDiv").setActive();
    tabbar.tabs("auditHistoryDiv").attachObject("auditHistoryDiv");

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 90);
    toolBar.addButtonSelect("combomaterialSearch", null, "产品", [], null, null, true, true, 15, "select")
    toolBar.addText("year", null, "年份");
    toolBar.addInput("txtyearSearch", null, "", 50);
    toolBar.addText("month", null, "月份");
    toolBar.addInput("txtmonthSearch", null, "", 30);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("sepModify", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.addSeparator("sepCommit", null);
    toolBar.addButton("commit", null, "提交");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                sqlStr = "select [CustomerPlanApply].[CustomerPlanApplyID], [Customer].[CustomerName], [Material].[MaterialName], [CustomerPlanQuantity].[quantity], [CustomerPlanApply].[Quantity], convert(nvarchar(10),[CustomerPlanApply].[CreateDate],120), [CustomerPlanApply].[Salesman], [CustomerPlanApply].[State], [CustomerPlanApply].[Reason] from [CustomerPlanApply] join [CustomerPlanQuantity] on [CustomerPlanApply].[CustomerPlanQuantityID] = [CustomerPlanQuantity].[CustomerPlanQuantityID] join [Customer] on [CustomerPlanQuantity].[customerID] = [Customer].[customerID] join [Material] on [CustomerPlanQuantity].[materialID] = [Material].[materialID] and [CustomerPlanApply].[Salesman] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";

                if (toolBar.getValue("txtcustomerSearch") != "") {
                    sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
                }

                if (toolBar.getItemText("combomaterialSearch") != "产品") {
                    sqlStr += " and [Material].[MaterialName] = '" + toolBar.getItemText("combomaterialSearch") + "'";
                }

                if (toolBar.getValue("txtyearSearch") != "") {
                    sqlStr += " and [CustomerPlanQuantity].[year] = '" + toolBar.getValue("txtyearSearch") + "'";
                }

                if (toolBar.getValue("txtmonthSearch") != "") {
                    sqlStr += " and [CustomerPlanQuantity].[month] = '" + toolBar.getValue("txtmonthSearch") + "'";
                }

                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList)
                    }(ISystemService.execQuery.resultValue));
                }
                break;
            case "add":
                $("#formTitle").text("添加客户计划调整申请");
                editState = "add";
                $("#formTitle").text("添加客户计划调整申请");
                $("#txtcustomerID").val("");
                $("#txtcustomer").val("");
                $("#txtquantity").val("");
                $("#txtquantity1").val("");
                $("#txtreason").val("");
                $("#txtcomment").val("");

                $("#txtsalesman").val(decodeURIComponent($.cookie('userTrueName')));
                $("#txtcreateDate").val(serverDate);
                customerPlanQuantity = null;
                customerPlanApply = null;
                showEditForm();

                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑客户计划调整申请");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        var state = listGrid.cells(rowID, 8).getValue();

                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "CustomerPlanApply";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                customerPlanApply = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        ISystemService.getDynObjectByID.dynObjectID = customerPlanApply.customerPlanQuantityID;
                        ISystemService.getDynObjectByID.structName = "CustomerPlanQuantity";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                customerPlanQuantity = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        $("#txtcustomerID").val(customerPlanQuantity.customerID);
                        $("#txtcustomer").val(listGrid.cells(rowID, 2).getValue());

                        rock.setSelectItem("combomaterial", customerPlanQuantity.materialID, "value");
                        rock.setSelectItem("comboyear", customerPlanQuantity.year, "value");
                        rock.setSelectItem("combomonth", customerPlanQuantity.month, "value");
                        $("#txtcomment").val(customerPlanApply.comment);
                        $("#txtquantity").val(customerPlanQuantity.quantity);
                        $("#txtquantity1").val(customerPlanApply.quantity);
                        $("#txtsalesman").val(customerPlanApply.salesman);
                        $("#txtreason").val(customerPlanApply.reason);
                        $("#txtcreateDate").val(customerPlanApply.createDate.split(' ')[0]);
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
            case "delete":
                var checked = listGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的记录吗?")) {
                    var rowids = checked.split(',');
                    for (var i = 0; i < rowids.length; i++) {
                        ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                        ISystemService.deleteDynObjectByID.structName = "CustomerPlanApply";
                        rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                        if (ISystemService.deleteDynObjectByID.success) {
                            (function (e) {
                                for (var j = 0; j < dictDataList.rows.length; j++) {
                                    if (dictDataList.rows[j].id == rowids[i]) {
                                        dictDataList.rows.splice(j, 1);
                                        listGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(ISystemService.deleteDynObjectByID.resultValue));
                        }
                    }
                    refreshToolBarState();
                }
                break;
            case "commit":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        IBusinessService.submitCustomerPlanApply.customerPlanApplyID = checked;
                        rock.AjaxRequest(IBusinessService.submitCustomerPlanApply, rock.exceptionFun);
                        if (IBusinessService.submitCustomerPlanApply.success) {
                            (function (e) {
                                sqlStr = "select top 100 [CustomerPlanApply].[CustomerPlanApplyID], [Customer].[CustomerName], [Material].[MaterialName], [CustomerPlanQuantity].[quantity], [CustomerPlanApply].[Quantity], [CustomerPlanApply].[CreateDate], [CustomerPlanApply].[Salesman], [CustomerPlanApply].[State], [CustomerPlanApply].[Reason] from [CustomerPlanApply] join [CustomerPlanQuantity] on [CustomerPlanApply].[CustomerPlanQuantityID] = [CustomerPlanQuantity].[CustomerPlanQuantityID] join [Customer] on [CustomerPlanQuantity].[customerID] = [Customer].[customerID] join [Material] on [CustomerPlanQuantity].[materialID] = [Material].[materialID] and [CustomerPlanApply].[Salesman] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";
                                ISystemService.execQuery.sqlString = sqlStr;
                                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                                if (ISystemService.execQuery.success) {
                                    (function (e) {
                                        rock.tableToListGrid(e, listGrid, dictDataList);
                                    }(ISystemService.execQuery.resultValue));
                                }
                                refreshToolBarState();
                            }(IBusinessService.submitCustomerPlanApply.resultValue))
                        }
                    }
                    else {
                        alert("请仅选择一条要提交的行!");
                    }
                }
                else {
                    alert("请选择要提交的行!");
                }
                break;
        }
    });

    toolBar.getInput("txtyearSearch").id = "txtyearSearch";
    $("#txtyearSearch").css("display", "none");
    $("#txtyearSearch").after("<select id='comboyearSearch' style=\"width:60px\"></select>");

    toolBar.getInput("txtmonthSearch").id = "txtmonthSearch";
    $("#txtmonthSearch").css("display", "none");
    $("#txtmonthSearch").after("<select id='combomonthSearch' style=\"width:50px\"></select>");

    //初始化客户计划调整申请列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,客户名称,产品名称,原计划量,调整计划量,申请日期,经办人,状态,调整原因 ");
    listGrid.setInitWidths("40,0,200,120,80,100,80,60,60,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑客户计划调整申请");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "CustomerPlanApply";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                customerPlanApply = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        ISystemService.getDynObjectByID.dynObjectID = customerPlanApply.customerPlanQuantityID;
        ISystemService.getDynObjectByID.structName = "CustomerPlanQuantity";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                customerPlanQuantity = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtcustomerID").val(customerPlanQuantity.customerID);
        $("#txtcustomer").val(listGrid.cells(rowID, 2).getValue());

        rock.setSelectItem("combomaterial", customerPlanQuantity.materialID, "value");
        rock.setSelectItem("comboyear", customerPlanQuantity.year, "value");
        rock.setSelectItem("combomonth", customerPlanQuantity.month, "value");
        $("#txtcomment").val(customerPlanApply.comment);
        $("#txtquantity").val(customerPlanQuantity.quantity);
        $("#txtquantity1").val(customerPlanApply.quantity);
        $("#txtsalesman").val(customerPlanApply.salesman);
        $("#txtreason").val(customerPlanApply.reason);
        $("#txtcreateDate").val(customerPlanApply.createDate.split(' ')[0]);
        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getauditHistoryList(rowID);
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(350);
    editForm.width(570);
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
        if ($.trim($("#txtcustomerID").val()) == '') {
            alert("客户不可以为空!");
            return;
        }
        if ($.trim($("#txtquantity").val()) == '') {
            alert("原计划销量不可以为空!");
            return;
        }

        if ($.trim($("#txtquantity1").val()) == '') {
            alert("调整计划量不可以为空!");
            return;
        }

        if (!rock.chknum($("#txtquantity1").val())) {
            alert('调整计划量输入格式错误');
            return;
        }

        if (!rock.chkdate($("#txtcreateDate").val(), "-")) {
            alert("创建日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if ($.trim($("#txtreason").val()) == '') {
            alert("调整原因不可以为空!");
            return;
        }

        if (editState == "add") {
            customerPlanApply = CustomerPlanApplyClass.createInstance();
            ISystemService.getNextID.typeName = "CustomerPlanApply";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerPlanApply.customerPlanApplyID = e.value;
                    customerPlanApply.level = "0";
                }(ISystemService.getNextID.resultValue))
            }
        }

        customerPlanApply.customerID = $("#txtcustomerID").val();
        customerPlanApply.customerPlanQuantityID = customerPlanQuantity.customerPlanQuantityID;
        customerPlanApply.quantity = $("#txtquantity1").val();
        customerPlanApply.reason = $("#txtreason").val();
        customerPlanApply.salesman = $("#txtsalesman").val();
        customerPlanApply.createDate = $("#txtcreateDate").val();
        customerPlanApply.comment = $("#txtcomment").val();
        customerPlanApply.state = "已创建";


        if (editState == "add") {
            ISystemService.addDynObject.dynObject = customerPlanApply;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(customerPlanApply.customerPlanApplyID);
                    dictData.data.push(0);
                    dictData.data.push(customerPlanApply.customerPlanApplyID);
                    dictData.data.push($("#txtcustomer").val());
                    dictData.data.push($("#combomaterial").find("option:selected").text());
                    dictData.data.push($("#txtquantity").val());
                    dictData.data.push($("#txtquantity1").val());
                    dictData.data.push($("#txtcreateDate").val());
                    dictData.data.push($("#txtsalesman").val());
                    dictData.data.push("已创建");
                    dictData.data.push($("#txtreason").val());
                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                    alert("客户计划调整申请添加成功!");
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = customerPlanApply;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == customerPlanApply.customerPlanApplyID) {
                            dictDataList.rows[i].data[0] = 0;
                            dictDataList.rows[i].data[2] = $("#txtcustomer").val();
                            dictDataList.rows[i].data[3] = $("#combomaterial").find("option:selected").text();
                            dictDataList.rows[i].data[4] = $("#txtquantity").val();
                            dictDataList.rows[i].data[5] = $("#txtquantity1").val();
                            dictDataList.rows[i].data[6] = $("#txtcreateDate").val();
                            dictDataList.rows[i].data[7] = $("#txtsalesman").val();
                            dictDataList.rows[i].data[9] = $("#txtreason").val();
                        }
                    }
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                    alert("客户计划调整申请修改成功!");
                }(ISystemService.modifyDynObject.resultValue));
            }
        }
        refreshToolBarState();
    });

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


    //加载流程处理信息数据
    function getauditHistoryList(rowID) {
        if (rowID) {
            ISystemService.execQuery.sqlString = "select [WorkflowActivityInstanceID], [Comment],[Opinion],[Handler],[Result],[EndTime] from [WorkflowActivityInstance] where [ObjType] = 'CustomerPlanApply' and [ObjID] = " + rowID;
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
        IBusinessService.getCustomerPlanQuantity.customerID = rowID;
        IBusinessService.getCustomerPlanQuantity.materialID = $("#combomaterial").val();
        IBusinessService.getCustomerPlanQuantity.year = $("#comboyear").val();
        IBusinessService.getCustomerPlanQuantity.month = $("#combomonth").val();
        rock.AjaxRequest(IBusinessService.getCustomerPlanQuantity, rock.exceptionFun);
        if (IBusinessService.getCustomerPlanQuantity.success) {
            (function (e) {
                customerPlanQuantity = e;
                fillCustomerPlanQuantity(customerPlanQuantity);
            }(IBusinessService.getCustomerPlanQuantity.resultValue))
        }
        hidecustomerPop();
    });
    customerQuickGrid.init();
    customerQuickGrid.detachHeader(0);
    customerPop = $("#customerPop")
    $('#txtcustomer').focus(function (e) {
        showcustomerPop();
    });

    function showcustomerPop() {
        var top = $("#txtcustomer").offset().top;
        var left = $("#txtcustomer").offset().left;
        customerPop.css({ top: top + 22, left: left }).show();
    }

    function hidecustomerPop() {
        customerPop.css({ top: 200, left: -1300 }).hide();
    }
    hidecustomerPop();

    $("#txtcustomer").keyup(function () {
        customerComplete($("#txtcustomer").val());
    });
    var customerDataList = new rock.JsonList();
    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 14 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where Available = '1' and ForSale = '1' and [CustomerName] like  '%" + $("#txtcustomer").val() + "%' or [SearchCode] like  '%" + $("#txtcustomer").val() + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerQuickGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }


    $('#editForm').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomer") {
            hidecustomerPop();
        }

    });

    $('#combomaterial').change(function () {
        getCustomerPlanQuantity();

    })

    $('#comboyear').change(function () {
        getCustomerPlanQuantity();

    })

    $('#combomonth').change(function () {
        getCustomerPlanQuantity();

    })

    function getCustomerPlanQuantity() {
        if ($("#txtcustomerID").val() != "" && $("#txtcustomer").val() != "") {
            IBusinessService.getCustomerPlanQuantity.customerID = $("#txtcustomerID").val();
            IBusinessService.getCustomerPlanQuantity.materialID = $("#combomaterial").val();
            IBusinessService.getCustomerPlanQuantity.year = $("#comboyear").val();
            IBusinessService.getCustomerPlanQuantity.month = $("#combomonth").val();
            rock.AjaxRequest(IBusinessService.getCustomerPlanQuantity, rock.exceptionFun);
            if (IBusinessService.getCustomerPlanQuantity.success) {
                (function (e) {
                    customerPlanQuantity = e;
                    fillCustomerPlanQuantity(customerPlanQuantity);
                }(IBusinessService.getCustomerPlanQuantity.resultValue))
            }
        }
    }

    function fillCustomerPlanQuantity(customerPlanQuantity) {
        if (customerPlanQuantity != null) {
            //判断客户计划调整申请是否存在
            var exist = false;
            IBusinessService.customerPlanApplyExist.customerPlanQuantityID = customerPlanQuantity.customerPlanQuantityID;
            rock.AjaxRequest(IBusinessService.customerPlanApplyExist, rock.exceptionFun);
            if (IBusinessService.customerPlanApplyExist.success) {
                (function (e) {
                    exist = e.value;
                }(IBusinessService.customerPlanApplyExist.resultValue))
            }

            if (exist) {
                IBusinessService.getCustomerPlanApplyByCustomerPlanQuantityID.customerPlanQuantityID = customerPlanQuantity.customerPlanQuantityID;
                rock.AjaxRequest(IBusinessService.getCustomerPlanApplyByCustomerPlanQuantityID, rock.exceptionFun);
                if (IBusinessService.getCustomerPlanApplyByCustomerPlanQuantityID.success) {
                    (function (e) {
                        customerPlanApply = e;
                        $("#txtcomment").val(customerPlanApply.comment);
                        $("#txtquantity1").val(customerPlanApply.quantity);
                        $("#txtsalesman").val(customerPlanApply.salesman);
                        $("#txtreason").val(customerPlanApply.reason);
                        $("#txtcreateDate").val(customerPlanApply.createDate.split(' ')[0]);
                        $("#formTitle").text("编辑客户计划调整申请");
                        editState = "modify";
                    }(IBusinessService.getCustomerPlanApplyByCustomerPlanQuantityID.resultValue));
                }
                else {
                    return;
                }
            }
            else {
                $("#txtquantity").val("");
                $("#txtreason").val("");
                $("#txtquantity1").val("");
                $("#txtcomment").val("");
            }
            $("#txtquantity").val(customerPlanQuantity.quantity);
        }
        else {
            $("#txtquantity").val("");
            $("#txtreason").val("");
            $("#txtquantity1").val("");
            $("#txtcomment").val("");
        }
    }

    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("modify");
            toolBar.disableItem("delete");
            toolBar.disableItem("commit");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("modify");
                toolBar.disableItem("commit");
            }
            else {
                var state = listGrid.cells(checked, 8).getValue();
                switch (state) {
                    case "已创建":
                        toolBar.enableItem("modify");
                        toolBar.enableItem("delete");
                        toolBar.enableItem("commit");
                        break;
                    default:
                        toolBar.disableItem("delete");
                        toolBar.disableItem("commit");
                        toolBar.disableItem("modify");
                }
            }
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push("txtcreateDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})