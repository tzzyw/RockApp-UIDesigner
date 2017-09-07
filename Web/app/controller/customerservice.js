
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      customerService = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,CustomerService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [CustomerService].[CustomerServiceID], [CustomerService].[customerName], [CustomerService].[serviceType], [CustomerService].[contacts], [CustomerService].[telphone], convert(nvarchar(10),[CustomerService].[registerDate],120) as registerDate, [CustomerService].[feedback], [CustomerService].[disposalInstructions] from [CustomerService] where 1=1  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }      

        //初始化通用参照
        $("#combodisposal").empty();
        sqlStr = "SELECT [ReferName] FROM [Refer] where [ReferType] = '处理意见'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combodisposal").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        $("#comboserviceType").empty();
        sqlStr = "SELECT [ReferName] FROM [Refer] where [ReferType] = '服务类型'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#comboserviceType").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("beginregisterDate", beginDate);
                toolBar.setValue("endregisterDate", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        //绑定控件失去焦点验证方法
        //CustomerServiceClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("registerDateBegin", null, "登记日期");
    toolBar.addInput("beginregisterDate", null, "", 75);
    toolBar.addText("登记日期End", null, "-");
    toolBar.addInput("endregisterDate", null, "", 75);
    toolBar.addText("customerName", null, "客户名称");
    toolBar.addInput("txtcustomerNameSearch", null, "", 100);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("sepModify", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.addSeparator("sepprint", null);
    toolBar.addButton("print", null, "打印");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                if ($.trim(toolBar.getValue("beginregisterDate")) == "") {
                    alert("起始登记日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("beginregisterDate"), "-")) {
                    alert("起始登记日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endregisterDate")) == "") {
                    alert("截止登记日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endregisterDate"), "-")) {
                    alert("截止登记日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }

                sqlStr = "select [CustomerService].[CustomerServiceID], [CustomerService].[customerName], [CustomerService].[serviceType], [CustomerService].[contacts], [CustomerService].[telphone], convert(nvarchar(10),[CustomerService].[registerDate],120) as registerDate, [CustomerService].[feedback], [CustomerService].[disposalInstructions] from [CustomerService] where 1=1 ";
                sqlStr += " and [CustomerService].[registerDate] between '" + toolBar.getValue("beginregisterDate") + " 0:0:0' AND '" + toolBar.getValue("endregisterDate") + " 23:59:59' ";

                if (toolBar.getValue("txtcustomerNameSearch") != "") {
                    sqlStr += " and [CustomerService].[customerName] like '%" + toolBar.getValue("txtcustomerNameSearch") + "%'";
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
                editState = "add";
                $("#formTitle").text("添加产品售后服务");
                $("#txtcustomerServiceNum").val("");
                $("#combodisposal").get(0).selectedIndex = 0;
                $("#txtcustomerName").val("");
                $("#txttelphone").val("");
                $("#txtcontacts").val("");
                $("#comboserviceType").get(0).selectedIndex = 0;
                $("#txtregisterDate").val(serverDate);
                $("#txtfeedback").val("");
                $("#txtdisposalInstructions").val("");
                customerService = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑产品售后服务");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "CustomerService";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                customerService = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        $("#txtcustomerServiceNum").val(customerService.customerServiceNum);
                        rock.setSelectItem("combodisposal", customerService.disposal, "text");
                        $("#txtcustomerName").val(customerService.customerName);
                        $("#txttelphone").val(customerService.telphone);
                        $("#txtcontacts").val(customerService.contacts);
                        rock.setSelectItem("comboserviceType", customerService.serviceType, "text");
                        $("#txtregisterDate").val(customerService.registerDate.split(' ')[0]);
                        $("#txtfeedback").val(customerService.feedback);
                        $("#txtdisposalInstructions").val(customerService.disposalInstructions);
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
                        ISystemService.deleteDynObjectByID.structName = "CustomerService";
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
            case "print":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        window.open("CustomerservicePrint.html?ID=" + checked);
                    }
                    else {
                        alert("请仅选择一条要打印的行!");
                    }
                }               
                break;
        }
    });
    
    //初始化产品售后服务列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,客户名称,服务类型,联系人,联系电话,登记日期,客户反映,处置说明");
    listGrid.setInitWidths("40,0,120,80,60,100,80,250,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑产品售后服务");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "CustomerService";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                customerService = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtcustomerServiceNum").val(customerService.customerServiceNum);
        rock.setSelectItem("combodisposal", customerService.disposal, "text");
        $("#txtcustomerName").val(customerService.customerName);
        $("#txttelphone").val(customerService.telphone);
        $("#txtcontacts").val(customerService.contacts);
        rock.setSelectItem("comboserviceType", customerService.serviceType, "text");
        $("#txtregisterDate").val(customerService.registerDate.split(' ')[0]);
        $("#txtfeedback").val(customerService.feedback);
        $("#txtdisposalInstructions").val(customerService.disposalInstructions);
        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    //editForm.height(250);
    //editForm.width(650);
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

    //处理编辑项

    //tableString = '';
    //editItem.html(tableString);

    //保存
    $("#btn_Save").click(function () {
        if (customerService == null) {
            customerService = CustomerServiceClass.createInstance();
            ISystemService.getNextID.typeName = "CustomerService";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerService.customerServiceID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!customerService.ValidateValue()) {
            return;
        }

        if ($.trim($("#txtcustomerServiceNum").val()) != '') {
            customerService.customerServiceNum = $("#txtcustomerServiceNum").val();
        }
        else {
            customerService.customerServiceNum = null;
        }

        if ($.trim($("#txtdisposal").val()) != '') {
            customerService.disposal = $("#txtdisposal").val();
        }
        else {
            customerService.disposal = null;
        }

        if ($.trim($("#txtcustomerName").val()) != '') {
            customerService.customerName = $("#txtcustomerName").val();
        }
        else {
            customerService.customerName = null;
        }

        if ($.trim($("#txttelphone").val()) != '') {
            customerService.telphone = $("#txttelphone").val();
        }
        else {
            customerService.telphone = null;
        }

        if ($.trim($("#txtcontacts").val()) != '') {
            customerService.contacts = $("#txtcontacts").val();
        }
        else {
            customerService.contacts = null;
        }

        if ($.trim($("#txtserviceType").val()) != '') {
            customerService.serviceType = $("#txtserviceType").val();
        }
        else {
            customerService.serviceType = null;
        }

        if ($.trim($("#txtregisterDate").val()) != '') {
            customerService.registerDate = $("#txtregisterDate").val();
        }
        else {
            customerService.registerDate = null;
        }
        if ($.trim($("#txtfeedback").val()) != '') {
            customerService.feedback = $("#txtfeedback").val();
        }
        else {
            customerService.feedback = null;
        }

        if ($.trim($("#txtdisposalInstructions").val()) != '') {
            customerService.disposalInstructions = $("#txtdisposalInstructions").val();
        }
        else {
            customerService.disposalInstructions = null;
        }

        if (editState == "add") {
            ISystemService.addDynObject.dynObject = customerService;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(customerService.customerServiceID);
                    dictData.data.push(0);
                    dictData.data.push(customerService.customerServiceID);
                    dictData.data.push($("#txtcustomerName").val());
                    dictData.data.push($("#comboserviceType").find("option:selected").text());
                    dictData.data.push($("#txtcontacts").val());
                    dictData.data.push($("#txttelphone").val());
                    dictData.data.push($("#txtregisterDate").val());
                    dictData.data.push($("#txtfeedback").val());
                    dictData.data.push($("#txtdisposalInstructions").val());
                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = customerService;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == customerService.customerServiceID) {
                            dictDataList.rows[i].data[0] = 0;
                            dictDataList.rows[i].data[2] = $("#txtcustomerName").val();
                            dictDataList.rows[i].data[3] = $("#comboserviceType").find("option:selected").text();
                            dictDataList.rows[i].data[4] = $("#txtcontacts").val();
                            dictDataList.rows[i].data[5] = $("#txttelphone").val();
                            dictDataList.rows[i].data[6] = $("#txtregisterDate").val();
                            dictDataList.rows[i].data[7] = $("#txtfeedback").val();
                            dictDataList.rows[i].data[8] = $("#txtdisposalInstructions").val();
                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("产品售后服务修改成功!");
        }

        refreshToolBarState();
    });
 
    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("modify");
            toolBar.disableItem("delete");
            toolBar.disableItem("print");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("modify");
                toolBar.disableItem("print");
            }
            else {
                toolBar.enableItem("modify");
                toolBar.enableItem("print");
            }
            toolBar.enableItem("delete");
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginregisterDate"));

    dateboxArray.push(toolBar.getInput("endregisterDate"));

    dateboxArray.push("txtregisterDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})