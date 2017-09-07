
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, year, month, endyear, endmonth, vehiclePop, vehicleQuickGrid,
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

                year = date.getFullYear();
                month = date.getMonth() + 1;
                enddate = new Date(date.setMonth(date.getMonth() + 1));
                endyear = enddate.getFullYear();
                endmonth = enddate.getMonth() + 1;
                toolBar.setValue("beginorderDate", beginDate);
                toolBar.setValue("endorderDate", serverDate);

            }(ISystemService.getServerDate.resultValue));
        }

        //初始化实体参照及查询项
        $("#combomaterial").empty();
        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] where [Available] = '1' and [ForSale] = '1' and [MaterialID] in (select [MaterialID] from [CustomerPlanQuantity] where [CustomerID] =" +  $.cookie('CustomerID') + " and (([Year]='" + year + "' and [Month]='" + month + "') or ([Year]='" +endyear + "' and [Month]='" + endmonth + "'))) ";
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
      
        //处理初始化加载数据
        getDataList();     

        //初始化通用参照
              
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("orderDateBegin", null, "订单日期");
    toolBar.addInput("beginorderDate", null, "", 75);
    toolBar.addText("订单日期End", null, "-");
    toolBar.addInput("endorderDate", null, "", 75);
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
                $("#formTitle").text("添加客户订单");
                $("#combomaterial").get(0).selectedIndex = 0;
                $("#combomaterialGrade").get(0).selectedIndex = 0;
                $("#txtmaterialLevel").val(customerOrder.materialLevel);
                $("#txtdeliveryDate").val(serverDate);
                $("#txtorderDate").val(serverDate);
                $("#txtquantity").val("");
                $("#txtvehicleNum").val("");
                $("#txtprice").val("");
                $("#txtdestination").val("");
                getMaterialGrade();
                customerOrder = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑客户订单");
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

                        rock.setSelectItem("combomaterial", customerOrder.materialID, "value");
                        getMaterialGrade();
                        rock.setSelectItem("combomaterialGrade", customerOrder.materialLevel, "text");

                        $("#txtdeliveryDate").val(customerOrder.deliveryDate.split(' ')[0]);

                        $("#txtorderDate").val(customerOrder.orderDate.split(' ')[0]);

                        $("#txtquantity").val(customerOrder.quantity);

                        $("#txtvehicleNum").val(customerOrder.vehicleNum);

                        $("#txtprice").val(customerOrder.price);

                        $("#txtdestination").val(customerOrder.destination);

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
                        ISystemService.deleteDynObjectByID.structName = "CustomerOrder";
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

    //初始化客户订单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,订单数量,单价,提货车辆,物料名称,订单日期,提货日期,产品流向,反馈结果");
    listGrid.setInitWidths("40,0,80,70,150,90,80,80,100,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑客户订单");
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
        rock.setSelectItem("combomaterial", customerOrder.materialID, "value");
        getMaterialGrade();
        rock.setSelectItem("combomaterialGrade", customerOrder.materialLevel, "text");

        $("#txtdeliveryDate").val(customerOrder.deliveryDate.split(' ')[0]);

        $("#txtorderDate").val(customerOrder.orderDate.split(' ')[0]);

        $("#txtquantity").val(customerOrder.quantity);

        $("#txtvehicleNum").val(customerOrder.vehicleNum);

        $("#txtprice").val(customerOrder.price);

        $("#txtdestination").val(customerOrder.destination);

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

    //保存
    $("#btn_Save").click(function () {
        if (!$("#txtdeliveryDate").validate("date", "提货日期")) {
            return false;
        }

        if (!$("#txtquantity").validate("number", "计划提货数量")) {
            return false;
        }
        if (!$("#txtvehicleNum").validate("required", "车号或船号")) {
            return false;
        }

        if (customerOrder == null) {
            customerOrder = CustomerOrderClass.createInstance();
            ISystemService.getNextID.typeName = "CustomerOrder";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerOrder.customerOrderID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }       
        customerOrder.materialID = $("#combomaterial").val();
        customerOrder.customerID = parseInt($.cookie('CustomerID'),10);

        if ($.trim($("#combomaterialGrade").val()) != '') {
            customerOrder.materialLevel = $("#combomaterialGrade").val();
        }
        else {
            customerOrder.materialLevel = null;
        }

        if ($.trim($("#txtdeliveryDate").val()) != '') {
            customerOrder.deliveryDate = $("#txtdeliveryDate").val();
        }
        else {
            customerOrder.deliveryDate = null;
        }

        if ($.trim($("#txtorderDate").val()) != '') {
            customerOrder.orderDate = $("#txtorderDate").val();
        }
        else {
            customerOrder.orderDate = null;
        }

        if ($.trim($("#txtquantity").val()) != '') {
            customerOrder.quantity = $("#txtquantity").val();
        }
        else {
            customerOrder.quantity = null;
        }


        if ($.trim($("#txtvehicleNum").val()) != '') {
            customerOrder.vehicleNum = $("#txtvehicleNum").val();
        }
        else {
            customerOrder.vehicleNum = null;
        }


        if ($.trim($("#txtprice").val()) != '') {
            customerOrder.price = $("#txtprice").val();
        }
        else {
            customerOrder.price = null;
        }


        if ($.trim($("#txtdestination").val()) != '') {
            customerOrder.destination = $("#txtdestination").val();
        }
        else {
            customerOrder.destination = null;
        }


        if (editState == "add") {
            ISystemService.addDynObject.dynObject = customerOrder;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(customerOrder.customerOrderID);
                    dictData.data.push(0);
                    dictData.data.push(customerOrder.customerOrderID);

                    dictData.data.push($("#txtquantity").val());

                    dictData.data.push($("#txtprice").val());

                    dictData.data.push($("#txtvehicleNum").val());
                    dictData.data.push($("#combomaterial").find("option:selected").text());
                    dictData.data.push($("#txtorderDate").val());

                    dictData.data.push($("#txtdeliveryDate").val());

                    dictData.data.push($("#txtdestination").val());

                    //dictData.data.push($("#txtfeedback").val());

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = customerOrder;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == customerOrder.customerOrderID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtquantity").val();

                            dictDataList.rows[i].data[3] = $("#txtprice").val();

                            dictDataList.rows[i].data[4] = $("#txtvehicleNum").val();

                            dictDataList.rows[i].data[5] = $("#combomaterial").find("option:selected").text();

                            dictDataList.rows[i].data[6] = $("#txtorderDate").val();

                            dictDataList.rows[i].data[7] = $("#txtdeliveryDate").val();

                            dictDataList.rows[i].data[8] = $("#txtdestination").val();

                            //dictDataList.rows[i].data[9] = $("#txtfeedback").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("客户订单修改成功!");
        }


        refreshToolBarState();
    });


    $('#editForm').mousedown(function (e) {

       
        if (e.srcElement.id != "txtvehicleNum") {
            hidevehiclePop();
        }
    });

    //车辆选择
    vehicleQuickGrid = new dhtmlXGridObject("vehicleQuickGrid");
    vehicleQuickGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    vehicleQuickGrid.setSkin("dhx_skyblue");
    vehicleQuickGrid.setHeader("序号,,车牌号,运输单位名称,载货类别,额定载重量");
    vehicleQuickGrid.setInitWidths("40,0,130,200,200,*");
    vehicleQuickGrid.setColAlign("center,left,left,left,left,left");
    vehicleQuickGrid.setColSorting("na,na,str,str,str,str");
    vehicleQuickGrid.setColTypes("cntr,ro,ro,ro,ro,ro");
    vehicleQuickGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        $("#txtvehicleNum").val(vehicleQuickGrid.cells(rowID, 2).getValue());
        hidevehiclePop();
    });
    vehicleQuickGrid.init();
    //vehicleQuickGrid.detachHeader(0);
    vehiclePop = $("#vehiclePop")
    $('#txtvehicleNum').focus(function (e) {
        if (!rock.chkdate($("#txtdeliveryDate").val(), "-")) {
            alert("提货日期格式不正确,请先选择提货日期再选择车辆！");
            return false;
        }
        vehicleComplete("");
        showvehiclePop();
    });

    function showvehiclePop() {
        var top = $("#txtvehicleNum").offset().top;
        var left = $("#txtvehicleNum").offset().left;
        vehiclePop.css({ top: top + 22, left: left }).show();
    }

    function hidevehiclePop() {
        vehiclePop.css({ top: 200, left: -1300 }).hide();
    }
    hidevehiclePop();

    $("#txtvehicleNum").keyup(function () {
        vehicleComplete($("#txtvehicleNum").val());
    });
    var vehicleDataList = new rock.JsonList();

    function vehicleComplete(searchCode) {
        //select top 10 承运车辆ID, 承运车辆编码,运输单位名称,车牌号, 载货类别, CAST(额定载重量 AS numeric) AS 额定载重量 from 承运车辆 where 到期日期 >= convert(varchar(8),getdate(),112) and 结束有效时间 >= convert(varchar(8),getdate(),112) and 车牌号 like '%" + this.txtVehicleNumber.Text.Trim() + "%'
        ISystemService.execQuery.sqlString = "select top 10 [Vehicle].[VehicleID], [Vehicle].[VehicleNum],[Carrier].[CarrierName],[Cargo], CAST(ApprovedLoad AS numeric) AS ApprovedLoad from [Vehicle] join [Carrier] on [Vehicle].[CarrierID] = [Vehicle].[CarrierID] and [Vehicle].[ExpiryDate] >= convert(varchar(8),getdate(),112) and [Vehicle].[ExpiryDate] >= '" + $("#txtdeliveryDate").val() + "' and [VehicleNum] like  '%" + $("#txtvehicleNum").val() + "%' ";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, vehicleQuickGrid, vehicleDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }



    $('#combomaterial').change(getMaterialGrade);

    function getMaterialGrade() {
        if ($("#combomaterial").val() != null) {
            sqlStr = "Select [ProductGradeName] from [ProductGrade] where [ProductID] = " + $("#combomaterial").val();
            ISystemService.execQuery.sqlString = sqlStr;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                $("#combomaterialGrade").empty();
                (function (e) {
                    if (e != null) {
                        var rows = e.rows;
                        var rowLength = rows.length;
                        for (var i = 0; i < rowLength; i++) {
                            var rowResult = rows[i].values;
                            $("#combomaterialGrade").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>")
                        }
                    }
                }(ISystemService.execQuery.resultValue));
            }

            //获取挂牌价
            ISystemService.executeScalar.sqlString = "select [Price] from [ProductPrice]  where [MaterialID] = " + $("#combomaterial").val();
            rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
            var warehouseName = null;
            if (ISystemService.executeScalar.success) {
                (function (e) {
                    $("#txtprice").val(e.value);
                }(ISystemService.executeScalar.resultValue));
            }
        }
    }

        function getDataList(){
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
        sqlStr = "select [CustomerOrder].[CustomerOrderID], [CustomerOrder].[quantity], [CustomerOrder].[price], [CustomerOrder].[vehicleNum], [Material].[MaterialName], convert(nvarchar(10),[CustomerOrder].[orderDate],120) as orderDate, convert(nvarchar(10),[CustomerOrder].[deliveryDate],120) as deliveryDate, [CustomerOrder].[destination], [CustomerOrder].[feedback] from [CustomerOrder] join [Material] on [CustomerOrder].[materialID] = [Material].[materialID] and [CustomerOrder].[CustomerID] = " + $.cookie('CustomerID');

        sqlStr += " and [CustomerOrder].[orderDate] between '" + toolBar.getValue("beginorderDate") + " 0:0:0' AND '" + toolBar.getValue("endorderDate") + " 23:59:59' ";

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

    dateboxArray.push(toolBar.getInput("beginorderDate"));

    dateboxArray.push(toolBar.getInput("endorderDate"));

    dateboxArray.push("txtdeliveryDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})