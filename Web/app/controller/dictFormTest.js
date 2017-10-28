
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid, customerPopTarget,
      purchasePlan = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,PurchasePlan,Carrier,Customer";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                var date = new Date(serverDate.replace('-', '/'));
                var beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';

                toolBar.setValue("begincreateDate", beginDate);


                toolBar.setValue("endcreateDate", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        //初始化实体参照及查询项	




        $("#combocarrier").empty();




        $("#combocarrierSearch").append("<option value='-1'>请选择运输单位</option>");




        sqlStr = "SELECT [CarrierID],[CarrierName] FROM [Carrier] order by CarrierName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combocarrier").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>");




                        $("#combocarrierSearch").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>");




                    }
                }
            }(ISystemService.execQuery.resultValue));
        }







        //初始化通用参照



        $("#comboladePlace").empty();



        $("#comboladePlaceSearch").append("<option value='-1'>请选择提货地点</option>");





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
                        $("#comboladePlace").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>");



                        $("#comboladePlaceSearch").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>");





                    }
                }
            }(ISystemService.execQuery.resultValue));
        }











        customerComplete("");

        //处理初始化加载数据

        getDataList();

        //绑定控件失去焦点验证方法
        //PurchasePlanClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("purchasePlanName", null, "采购计划名称");
    toolBar.addInput("txtpurchasePlanNameSearch", null, "", 100);


    toolBar.addText("createDateBegin", null, "创建日期");
    toolBar.addInput("begincreateDate", null, "", 75);
    toolBar.addText("创建日期End", null, "-");
    toolBar.addInput("endcreateDate", null, "", 75);


    toolBar.addInput("txtladePlaceSearch", null);


    toolBar.addInput("txtcarrierSearch", null);


    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 100);


    toolBar.addText("forLeader", null, "领导特供");
    toolBar.addInput("txtforLeaderSearch", null, "", 100);


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
                getDataList();
                break;
            case "add":
                editState = "add";
                $("#formTitle").text("添加采购计划");

                $("#txtpurchasePlanName").val("");


                $("#txtcreateDate").val();


                $("#comboladePlace").get(0).selectedIndex = 0;

                $("#combocarrier").get(0).selectedIndex = 0;

                $("#txtcustomer").val("");
                $("#txtcustomerID").val("");


                $("#txtagent").val("");


                $("#txtmanager").val("");


                $("#chkforLeader").prop("checked", false);

                $("#txtcomment").val("");


                purchasePlan = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑采购计划");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "PurchasePlan";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                purchasePlan = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        $("#txtpurchasePlanName").val(purchasePlan.purchasePlanName);


                        $("#txtcreateDate").val(purchasePlan.createDate.split(' ')[0]);


                        rock.setSelectItem("comboladePlace", purchasePlan.ladePlace, "text");


                        rock.setSelectItem("combocarrier", purchasePlan.carrierID, "value");


                        $("#txtcustomerID").val(purchasePlan.customerID);
                        ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + purchasePlan.customerID;
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                $("#txtcustomer").val(e.value);
                            }(ISystemService.executeScalar.resultValue));
                        }


                        $("#txtagent").val(purchasePlan.agent);


                        $("#txtmanager").val(purchasePlan.manager);


                        $("#chkforLeader").prop("checked", purchasePlan.forLeader);

                        $("#txtcomment").val(purchasePlan.comment);


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
                        ISystemService.deleteDynObjectByID.structName = "PurchasePlan";
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




    toolBar.getInput("txtladePlaceSearch").id = "txtladePlaceSearch";
    $("#txtladePlaceSearch").css("display", "none");
    $("#txtladePlaceSearch").after("<select id='comboladePlaceSearch' style=\"width:100px\"></select>");


    toolBar.getInput("txtcarrierSearch").id = "txtcarrierSearch";
    $("#txtcarrierSearch").css("display", "none");
    $("#txtcarrierSearch").after("<select id='combocarrierSearch' style=\"width:100px\"></select>");



    toolBar.getInput("txtforLeaderSearch").id = "txtforLeaderSearch";
    $("#txtforLeaderSearch").css("display", "none");
    $("#txtforLeaderSearch").after("<select id='comboforLeaderSearch' style=\"width:100px\"><option value='-1'>请选择</option><option value='1'>是</option><option value='0'>否</option></select>");







    toolBar.getInput("txtcustomerSearch").id = "txtcustomerSearch";



    //初始化采购计划列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");

    listGrid.setHeader("选择,,采购计划名称,创建日期,提货地点,运输单位,客户,提报人,领导特供,状态,备注");
    listGrid.setInitWidths("40,0,100,80,80,120,120,50,60,60,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑采购计划");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "PurchasePlan";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                purchasePlan = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtpurchasePlanName").val(purchasePlan.purchasePlanName);


        $("#txtcreateDate").val(purchasePlan.createDate.split(' ')[0]);


        rock.setSelectItem("comboladePlace", purchasePlan.ladePlace, "text");


        rock.setSelectItem("combocarrier", purchasePlan.carrierID, "value");


        $("#txtcustomerID").val(purchasePlan.customerID);
        ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + purchasePlan.customerID;
        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        var warehouseName = null;
        if (ISystemService.executeScalar.success) {
            (function (e) {
                $("#txtcustomer").val(e.value);
            }(ISystemService.executeScalar.resultValue));
        }


        $("#txtagent").val(purchasePlan.agent);


        $("#txtmanager").val(purchasePlan.manager);


        $("#chkforLeader").prop("checked", purchasePlan.forLeader);

        $("#txtcomment").val(purchasePlan.comment);


        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(250);
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

    tableString = '<table style="width: 98%"><tr> <td class="label2">采购计划名称</td><td class="inputtd2"><input id="txtpurchasePlanName" class="smallInput" type="text" /></td><td class="label2">创建日期</td><td class="inputtd2"><input id="txtcreateDate" class="smallInput" type="text" /></td></tr><tr> <td class="label2">提货地点</td><td class="inputtd2"><select id="comboladePlace" class="combo" /></td><td class="label2">运输单位</td><td class="inputtd2"><select id="combocarrier" class="combo" /></td></tr><tr> <td class="label2">客户</td><td class="inputtd2"><input id="txtcustomer" class="smallInput" type="text" /><input id="txtcustomerID" type="hidden" /></td><td class="label2">提报人</td><td class="inputtd2"><input id="txtagent" class="smallInput" type="text" /></td></tr><tr> <td class="label2">负责人</td><td class="inputtd2"><input id="txtmanager" class="smallInput" type="text" /></td><td class="label2">领导特供</td><td class="inputtd2" style="text-align:left"><input id="chkforLeader" style="margin-left:25px" type="checkbox" /></td></tr><tr> <td class="label2">备注</td><td class="inputtd2"><input id="txtcomment" class="smallInput" type="text" /></td><td class="label2"></td><td class="inputtd2"></td></tr></table>';
    editItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {
        //处理数据验证





        if (!$("#txtcustomerID").validate("required", "客户")) {
            return false;
        }



        if (!$("#txtcreateDate").validate("date", "创建日期")) {
            return false;
        }

        if (purchasePlan == null) {
            purchasePlan = PurchasePlanClass.createInstance();
            ISystemService.getNextID.typeName = "PurchasePlan";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    purchasePlan.purchasePlanID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        //if (!purchasePlan.ValidateValue()) {
        //    return;
        //}       

        purchasePlan.purchasePlanName = $("#txtpurchasePlanName").val();


        purchasePlan.createDate = $("#txtcreateDate").val();

        purchasePlan.ladePlace = $("#comboladePlace").val();

        purchasePlan.carrierID = $("#combocarrier").val();

        purchasePlan.customerID = $("#txtcustomerID").val();


        if ($.trim($("#txtagent").val()) != '') {
            purchasePlan.agent = $("#txtagent").val();
        }
        else {
            purchasePlan.agent = null;
        }


        if ($.trim($("#txtmanager").val()) != '') {
            purchasePlan.manager = $("#txtmanager").val();
        }
        else {
            purchasePlan.manager = null;
        }


        purchasePlan.forLeader = $("#chkforLeader").prop("checked");

        if ($.trim($("#txtcomment").val()) != '') {
            purchasePlan.comment = $("#txtcomment").val();
        }
        else {
            purchasePlan.comment = null;
        }


        if (editState == "add") {
            ISystemService.addDynObject.dynObject = purchasePlan;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(purchasePlan.purchasePlanID);
                    dictData.data.push(0);
                    dictData.data.push(purchasePlan.purchasePlanID);

                    dictData.data.push($("#txtpurchasePlanName").val());

                    dictData.data.push($("#txtcreateDate").val());

                    dictData.data.push($("#comboladePlace").find("option:selected").text());

                    dictData.data.push($("#combocarrier").find("option:selected").text());

                    dictData.data.push($("#txtcustomer").val());

                    dictData.data.push($("#txtagent").val());

                    dictData.data.push(($("#chkforLeader").prop("checked")) ? "是" : "否");

                    dictData.data.push($("#txtstate").val());

                    dictData.data.push($("#txtcomment").val());

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = purchasePlan;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == purchasePlan.purchasePlanID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtpurchasePlanName").val();

                            dictDataList.rows[i].data[3] = $("#txtcreateDate").val();

                            dictDataList.rows[i].data[4] = $("#comboladePlace").find("option:selected").text();

                            dictDataList.rows[i].data[5] = $("#combocarrier").find("option:selected").text();

                            dictDataList.rows[i].data[6] = $("#txtcustomer").val();

                            dictDataList.rows[i].data[7] = $("#txtagent").val();

                            dictDataList.rows[i].data[8] = ($("#chkforLeader").prop("checked")) ? "是" : "否";

                            dictDataList.rows[i].data[9] = $("#txtstate").val();

                            dictDataList.rows[i].data[10] = $("#txtcomment").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("采购计划修改成功!");
        }







        refreshToolBarState();
    });

    //加载弹窗Div

    $(document.body).append('<div id="customerPop" style="width: 260px; height: 400px; position: absolute; background-color: White;display: none;z-index:9"><div id="customerQuickGrid" style="width: 260px; height: 400px; float: left; border: 1px solid #E3E3E3;"></div></div>');







    var customerDataList = new rock.JsonList();
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

        //判定在什么位置上面
        if (customerPopTarget == "txtcustomer") {
            $("#txtcustomerID").val(rowID)
            $("#txtcustomer").val(customerQuickGrid.cells(rowID, 2).getValue())
        }
        else {
            $("#txtcustomerSearch").val(customerQuickGrid.cells(rowID, 2).getValue());
        }

        hidecustomerPop();
    });
    customerQuickGrid.init();
    customerQuickGrid.detachHeader(0);
    customerPop = $("#customerPop")

    $('#txtcustomer').focus(function (e) {
        customerPopTarget = "txtcustomer";
        showcustomerPop($("#txtcustomer").offset().top, $("#txtcustomer").offset().left);
    });

    $('#txtcustomerSearch').focus(function (e) {
        customerPopTarget = "txtcustomerSearch";
        showcustomerPop($("#txtcustomerSearch").offset().top, $("#txtcustomerSearch").offset().left);
    });


    function showcustomerPop(top, left) {
        customerPop.css({ top: top + 22, left: left }).show();
        //判断记录条数如果少于10条就重新加载
        if (customerDataList.rows.length < 10) {
            customerComplete("");
        }
    }

    function hidecustomerPop() {
        customerPop.css({ top: 200, left: -1300 }).hide();
    }
    hidecustomerPop();



    $("#txtcustomerSearch").keyup(function () {
        customerComplete($("#txtcustomerSearch").val());
    });

    $("#txtcustomer").keyup(function () {
        customerComplete($("#txtcustomer").val());
    });

    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 14 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where [CustomerName] like  '%" + searchCode + "%' or [SearchCode] like  '%" + searchCode + "%'";
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


    $('#mainPage').mousedown(function (e) {








        if (e.srcElement.id != "txtcustomer") {
            hidecustomerPop();
        }

    });


    function getDataList() {


        if ($.trim(toolBar.getValue("begincreateDate")) == "") {
            alert("起始创建日期不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("begincreateDate"), "-")) {
            alert("起始创建日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }
        if ($.trim(toolBar.getValue("endcreateDate")) == "") {
            alert("截止创建日期不能为空！");
            return;
        }
        if (!rock.chkdate(toolBar.getValue("endcreateDate"), "-")) {
            alert("截止创建日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }






        sqlStr = "select [PurchasePlan].[PurchasePlanID], [PurchasePlan].[purchasePlanName], convert(nvarchar(10),[PurchasePlan].[createDate],120) as createDate, [PurchasePlan].[ladePlace], [Carrier].[CarrierName], [Customer].[CustomerName], [PurchasePlan].[agent], CASE [PurchasePlan].[forLeader] WHEN '1' THEN '是' WHEN '0' THEN '否' END, [PurchasePlan].[state], [PurchasePlan].[comment] from [PurchasePlan] join [Carrier] on [PurchasePlan].[carrierID] = [Carrier].[carrierID] join [Customer] on [PurchasePlan].[customerID] = [Customer].[customerID] ";

        if (toolBar.getValue("txtpurchasePlanNameSearch") != "") {
            sqlStr += " and [PurchasePlan].[purchasePlanName] like '%" + toolBar.getValue("txtpurchasePlanNameSearch") + "%'";
        }



        sqlStr += " and [PurchasePlan].[createDate] between '" + toolBar.getValue("begincreateDate") + " 0:0:0' AND '" + toolBar.getValue("endcreateDate") + " 23:59:59' ";


        if ($("#comboladePlaceSearch").val() != "-1") {
            sqlStr += " and [PurchasePlan].[ladePlace] = '" + $("#comboladePlaceSearch").val() + "'";
        }



        if ($("#combocarrierSearch").val() != "-1") {
            sqlStr += " and [Carrier].[CarrierID] = " + $("#combocarrierSearch").val();
        }



        if (toolBar.getValue("txtcustomerSearch") != "") {
            sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
        }


        if ($("#comboforLeaderSearch").val() != "-1") {
            sqlStr += " and [PurchasePlan].[forLeader] = '" + $("#comboforLeaderSearch").val() + "'";
        }


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

    dateboxArray.push(toolBar.getInput("begincreateDate"));

    dateboxArray.push(toolBar.getInput("endcreateDate"));

    dateboxArray.push("txtcreateDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})