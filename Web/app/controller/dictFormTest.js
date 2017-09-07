
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      ladeBill = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,LadeBill,Customer,Material,Contract,Measure,CustomerPlanApply,PlanSale";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [LadeBill].[LadeBillID], [LadeBill].[ladeBillNum], [Material].[MaterialName], [LadeBill].[materialLevel], [Customer].[CustomerName], convert(nvarchar(10),[LadeBill].[billingTime],120) as billingTime, convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate, [LadeBill].[ladenPlace], [LadeBill].[plateNumber], [LadeBill].[destination], [LadeBill].[packing], [LadeBill].[shipType], [LadeBill].[planQuantity], [LadeBill].[actualQuantity], [LadeBill].[quotedPrice], [LadeBill].[contractPrice], [LadeBill].[pipePrice], [LadeBill].[planTotal], [LadeBill].[actualTotal], [LadeBill].[settleTotal], [LadeBill].[measure], [LadeBill].[agent], [LadeBill].[picker] from [LadeBill] join [Material] on [LadeBill].[materialID] = [Material].[materialID] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项



        $("#combomaterial").empty();
        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] order by MaterialName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {



                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combomaterial").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")



                    }
                }
            }(ISystemService.execQuery.resultValue));
        }



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






        //初始化通用参照








        $("#comboladenPlace").empty();
        sqlStr = "SELECT [ReferName] FROM [Refer] where [ReferType] = '提货地点'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {



                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#comboladenPlace").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>")



                    }
                }
            }(ISystemService.execQuery.resultValue));
        }








        customerComplete("");


        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("beginbillingTime", beginDate);


                toolBar.setValue("endbillingTime", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        //绑定控件失去焦点验证方法
        //LadeBillClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("billingTimeBegin", null, "开票日期");
    toolBar.addInput("beginbillingTime", null, "", 75);
    toolBar.addText("开票日期End", null, "-");
    toolBar.addInput("endbillingTime", null, "", 75);


    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);


    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("sepModify", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":

                if ($.trim(toolBar.getValue("beginbillingTime")) == "") {
                    alert("起始开票日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("beginbillingTime"), "-")) {
                    alert("起始开票日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }
                if ($.trim(toolBar.getValue("endbillingTime")) == "") {
                    alert("截止开票日期不能为空！");
                    return;
                }
                if (!rock.chkdate(toolBar.getValue("endbillingTime"), "-")) {
                    alert("截止开票日期格式不正确,正确格式为 2010-10-10！");
                    return false;
                }



                sqlStr = "select [LadeBill].[LadeBillID], [LadeBill].[ladeBillNum], [Material].[MaterialName], [LadeBill].[materialLevel], [Customer].[CustomerName], convert(nvarchar(10),[LadeBill].[billingTime],120) as billingTime, convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate, [LadeBill].[ladenPlace], [LadeBill].[plateNumber], [LadeBill].[destination], [LadeBill].[packing], [LadeBill].[shipType], [LadeBill].[planQuantity], [LadeBill].[actualQuantity], [LadeBill].[quotedPrice], [LadeBill].[contractPrice], [LadeBill].[pipePrice], [LadeBill].[planTotal], [LadeBill].[actualTotal], [LadeBill].[settleTotal], [LadeBill].[measure], [LadeBill].[agent], [LadeBill].[picker] from [LadeBill] join [Material] on [LadeBill].[materialID] = [Material].[materialID] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID]";

                sqlStr += " and [LadeBill].[billingTime] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";


                if (toolBar.getValue("txtcustomerSearch") != "") {
                    sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
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
                $("#formTitle").text("添加提货单");

                $("#txtladeBillNum").val("");


                $("#combomaterial").get(0).selectedIndex = 0;

                $("#txtmaterialLevel").val("");


                $("#txtcustomer").val("");
                $("#txtcustomerID").val("");


                $("#txtcontractID").val("");


                $("#txtcontractNum").val("");


                $("#txtbillingTime").val(serverDate);

                $("#comboladenPlace").get(0).selectedIndex = 0;


                ladeBill = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑提货单");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "LadeBill";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                ladeBill = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }


                        $("#txtladeBillNum").val(ladeBill.ladeBillNum);


                        rock.setSelectItem("combomaterial", ladeBill.materialID, "value");


                        $("#txtmaterialLevel").val(ladeBill.materialLevel);


                        $("#txtcustomerID").val(ladeBill.customerID);
                        ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + ladeBill.customerID;
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                $("#txtcustomer").val(e.value);
                            }(ISystemService.executeScalar.resultValue));
                        }


                        $("#txtcontractID").val(ladeBill.contractID);


                        $("#txtcontractNum").val(ladeBill.contractNum);


                        $("#txtbillingTime").val(ladeBill.billingTime.split(' ')[0]);

                        rock.setSelectItem("comboladenPlace", ladeBill.ladenPlace, "text");


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
                        ISystemService.deleteDynObjectByID.structName = "LadeBill";
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

        }
    });




    //初始化提货单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,销售提货编号,产品名称,产品等级,客户名称,开票日期,提货日期,提货地点,车船号,到站名称,包装方式,运输方式,计划提货数量,实际提货数量,挂牌单价,合同单价,管输单价,计划量总金额,实际量总金额,结算总金额,计量单位,经办人,提货人");
    listGrid.setInitWidths("40,0,100,100,80,100,80,80,100,100,80,80,80,100,100,80,80,80,100,100,100,80,60,60");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑提货单");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "LadeBill";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                ladeBill = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtladeBillNum").val(ladeBill.ladeBillNum);


        rock.setSelectItem("combomaterial", ladeBill.materialID, "value");


        $("#txtmaterialLevel").val(ladeBill.materialLevel);


        $("#txtcustomerID").val(ladeBill.customerID);
        ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + ladeBill.customerID;
        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        var warehouseName = null;
        if (ISystemService.executeScalar.success) {
            (function (e) {
                $("#txtcustomer").val(e.value);
            }(ISystemService.executeScalar.resultValue));
        }


        $("#txtcontractID").val(ladeBill.contractID);


        $("#txtcontractNum").val(ladeBill.contractNum);


        $("#txtbillingTime").val(ladeBill.billingTime.split(' ')[0]);

        rock.setSelectItem("comboladenPlace", ladeBill.ladenPlace, "text");


        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(225);
    editForm.width(650);
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

    tableString = '<table style="width: 98%"><tr> <td class="label2">销售提货编号</td><td class="inputtd2"><input id="txtladeBillNum" class="smallInput" type="text" /></td><td class="label2">产品</td><td class="inputtd2"><select id="combomaterial" class="combo" /></td></tr><tr> <td class="label2">产品等级</td><td class="inputtd2"><input id="txtmaterialLevel" class="smallInput" type="text" /></td><td class="label2">客户</td><td class="inputtd2"><input id="txtcustomer" class="smallInput" type="text" /><input id="txtcustomerID" type="hidden" /></td></tr><tr> <td class="label2">销售合同ID</td><td class="inputtd2"><input id="txtcontractID" class="smallInput" type="text" /></td><td class="label2">合同号</td><td class="inputtd2"><input id="txtcontractNum" class="smallInput" type="text" /></td></tr><tr> <td class="label2">开票日期</td><td class="inputtd2"><input id="txtbillingTime" class="smallInput" type="text" /></td><td class="label2">提货地点</td><td class="inputtd2"><select id="comboladenPlace" class="combo" /></td></tr></table>';
    editItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {
        if (ladeBill == null) {
            ladeBill = LadeBillClass.createInstance();
            ISystemService.getNextID.typeName = "LadeBill";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    ladeBill.ladeBillID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!ladeBill.ValidateValue()) {
            return;
        }

        ladeBill.ladeBillNum = $("#txtladeBillNum").val();


        ladeBill.materialID = $("#combomaterial").val();


        if ($.trim($("#txtmaterialLevel").val()) != '') {
            ladeBill.materialLevel = $("#txtmaterialLevel").val();
        }
        else {
            ladeBill.materialLevel = null;
        }


        if ($.trim($("#txtcustomerID").val()) != '') {
            ladeBill.customerID = $("#txtcustomerID").val();
        }
        else {
            ladeBill.customerID = null;
        }


        if ($.trim($("#txtcontractID").val()) != '') {
            ladeBill.contractID = $("#txtcontractID").val();
        }
        else {
            ladeBill.contractID = null;
        }


        if ($.trim($("#txtcontractNum").val()) != '') {
            ladeBill.contractNum = $("#txtcontractNum").val();
        }
        else {
            ladeBill.contractNum = null;
        }


        if ($.trim($("#txtbillingTime").val()) != '') {
            ladeBill.billingTime = $("#txtbillingTime").val();
        }
        else {
            ladeBill.billingTime = null;
        }

        if ($.trim($("#txtladenPlace").val()) != '') {
            ladeBill.ladenPlace = $("#txtladenPlace").val();
        }
        else {
            ladeBill.ladenPlace = null;
        }



        if (editState == "add") {
            ISystemService.addDynObject.dynObject = ladeBill;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(ladeBill.ladeBillID);
                    dictData.data.push(0);
                    dictData.data.push(ladeBill.ladeBillID);

                    dictData.data.push($("#txtladeBillNum").val());

                    dictData.data.push($("#combomaterial").find("option:selected").text());

                    dictData.data.push($("#txtmaterialLevel").val());

                    dictData.data.push($("#txtcustomer").val());

                    dictData.data.push($("#txtbillingTime").val());

                    dictData.data.push($("#txtladeDate").val());

                    dictData.data.push($("#comboladenPlace").find("option:selected").text());

                    dictData.data.push($("#txtplateNumber").val());

                    dictData.data.push($("#txtdestination").val());

                    dictData.data.push($("#txtpacking").val());

                    dictData.data.push($("#comboshipType").find("option:selected").text());

                    dictData.data.push($("#txtplanQuantity").val());

                    dictData.data.push($("#txtactualQuantity").val());

                    dictData.data.push($("#txtquotedPrice").val());

                    dictData.data.push($("#txtcontractPrice").val());

                    dictData.data.push($("#txtpipePrice").val());

                    dictData.data.push($("#txtplanTotal").val());

                    dictData.data.push($("#txtactualTotal").val());

                    dictData.data.push($("#txtsettleTotal").val());

                    dictData.data.push($("#txtmeasure").val());

                    dictData.data.push($("#txtagent").val());

                    dictData.data.push($("#txtpicker").val());

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = ladeBill;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == ladeBill.ladeBillID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtladeBillNum").val();

                            dictDataList.rows[i].data[3] = $("#combomaterial").find("option:selected").text();

                            dictDataList.rows[i].data[4] = $("#txtmaterialLevel").val();

                            dictDataList.rows[i].data[5] = $("#txtcustomer").val();

                            dictDataList.rows[i].data[6] = $("#txtbillingTime").val();

                            dictDataList.rows[i].data[7] = $("#txtladeDate").val();

                            dictDataList.rows[i].data[8] = $("#comboladenPlace").find("option:selected").text();

                            dictDataList.rows[i].data[9] = $("#txtplateNumber").val();

                            dictDataList.rows[i].data[10] = $("#txtdestination").val();

                            dictDataList.rows[i].data[11] = $("#txtpacking").val();

                            dictDataList.rows[i].data[12] = $("#comboshipType").find("option:selected").text();

                            dictDataList.rows[i].data[13] = $("#txtplanQuantity").val();

                            dictDataList.rows[i].data[14] = $("#txtactualQuantity").val();

                            dictDataList.rows[i].data[15] = $("#txtquotedPrice").val();

                            dictDataList.rows[i].data[16] = $("#txtcontractPrice").val();

                            dictDataList.rows[i].data[17] = $("#txtpipePrice").val();

                            dictDataList.rows[i].data[18] = $("#txtplanTotal").val();

                            dictDataList.rows[i].data[19] = $("#txtactualTotal").val();

                            dictDataList.rows[i].data[20] = $("#txtsettleTotal").val();

                            dictDataList.rows[i].data[21] = $("#txtmeasure").val();

                            dictDataList.rows[i].data[22] = $("#txtagent").val();

                            dictDataList.rows[i].data[23] = $("#txtpicker").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("提货单修改成功!");
        }



        refreshToolBarState();
    });

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
        ISystemService.execQuery.sqlString = "select top 20 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where [CustomerName] like  '%" + $("#txtcustomer").val() + "%' or [SearchCode] like  '%" + $("#txtcustomer").val() + "%'";
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


    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("modify");
            toolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("modify");
            }
            else {
                toolBar.enableItem("modify");
            }
            toolBar.enableItem("delete");
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginbillingTime"));

    dateboxArray.push(toolBar.getInput("endbillingTime"));

    dateboxArray.push("txtbillingTime");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})