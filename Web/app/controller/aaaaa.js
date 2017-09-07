
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      measure = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Measure";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [Measure].[MeasureID], [Measure].[measureNum], [Material].[MaterialName], [Customer].[CustomerName], [Measure].[planQuantity], [Measure].[shiper], [Measure].[vehicleNum], [Measure].[platform], [Measure].[agent], [Measure].[comment] from [Measure] join [Material] on [Measure].[materialID] = [Material].[materialID] join [Customer] on [Measure].[customerID] = [Customer].[customerID] ";
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
















        customerComplete("");


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

        //绑定控件失去焦点验证方法
        //MeasureClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("createTimeBegin", null, "创建时间");
    toolBar.addInput("begincreateTime", null, "", 75);
    toolBar.addText("创建时间End", null, "-");
    toolBar.addInput("endcreateTime", null, "", 75);


    toolBar.addText("vehicleNum", null, "车号");
    toolBar.addInput("txtvehicleNumSearch", null, "", 100);


    toolBar.addText("platform", null, "站台");
    toolBar.addInput("txtplatformSearch", null, "", 100);


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




                sqlStr = "select [Measure].[MeasureID], [Measure].[measureNum], [Material].[MaterialName], [Customer].[CustomerName], [Measure].[planQuantity], [Measure].[shiper], [Measure].[vehicleNum], [Measure].[platform], [Measure].[agent], [Measure].[comment] from [Measure] join [Material] on [Measure].[materialID] = [Material].[materialID] join [Customer] on [Measure].[customerID] = [Customer].[customerID]";

                sqlStr += " and [Measure].[createTime] between '" + toolBar.getValue("begincreateTime") + " 0:0:0' AND '" + toolBar.getValue("endcreateTime") + " 23:59:59' ";


                if (toolBar.getValue("txtvehicleNumSearch") != "") {
                    sqlStr += " and [Measure].[vehicleNum] like '%" + toolBar.getValue("txtvehicleNumSearch") + "%'";
                }



                if (toolBar.getValue("txtplatformSearch") != "") {
                    sqlStr += " and [Measure].[platform] like '%" + toolBar.getValue("txtplatformSearch") + "%'";
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
                $("#formTitle").text("添加计量单");

                $("#txtmeasureNum").val("");


                $("#combomaterial").get(0).selectedIndex = 0;

                $("#txtcustomer").val("");
                $("#txtcustomerID").val("");


                $("#txtplanQuantity").val("");


                $("#txtvehicleNum").val("");


                $("#txtshiper").val("");


                $("#txtplatform").val("");


                $("#txtagent").val("");


                $("#txtcomment").val("");



                measure = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑计量单");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "Measure";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                measure = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }


                        $("#txtmeasureNum").val(measure.measureNum);


                        rock.setSelectItem("combomaterial", measure.materialID, "value");


                        $("#txtcustomerID").val(measure.customerID);
                        ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + measure.customerID;
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                $("#txtcustomer").val(e.value);
                            }(ISystemService.executeScalar.resultValue));
                        }


                        $("#txtplanQuantity").val(measure.planQuantity);


                        $("#txtvehicleNum").val(measure.vehicleNum);


                        $("#txtshiper").val(measure.shiper);


                        $("#txtplatform").val(measure.platform);


                        $("#txtagent").val(measure.agent);


                        $("#txtcomment").val(measure.comment);


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
                        ISystemService.deleteDynObjectByID.structName = "Measure";
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





    //初始化计量单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,计量单编号,物料名称,客户名称,计划数量,运输单位,车号,站台,制单人,备注");
    listGrid.setInitWidths("40,0,100,90,120,80,100,80,100,60,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑计量单");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "Measure";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                measure = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtmeasureNum").val(measure.measureNum);


        rock.setSelectItem("combomaterial", measure.materialID, "value");


        $("#txtcustomerID").val(measure.customerID);
        ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + measure.customerID;
        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        var warehouseName = null;
        if (ISystemService.executeScalar.success) {
            (function (e) {
                $("#txtcustomer").val(e.value);
            }(ISystemService.executeScalar.resultValue));
        }


        $("#txtplanQuantity").val(measure.planQuantity);


        $("#txtvehicleNum").val(measure.vehicleNum);


        $("#txtshiper").val(measure.shiper);


        $("#txtplatform").val(measure.platform);


        $("#txtagent").val(measure.agent);


        $("#txtcomment").val(measure.comment);


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

    tableString = '<table style="width: 98%"><tr> <td class="label2">计量单编号</td><td class="inputtd2"><input id="txtmeasureNum" class="smallInput" type="text" /></td><td class="label2">物料</td><td class="inputtd2"><select id="combomaterial" class="combo" /></td></tr><tr> <td class="label2">客户</td><td class="inputtd2"><input id="txtcustomer" class="smallInput" type="text" /><input id="txtcustomerID" type="hidden" /></td><td class="label2">计划数量</td><td class="inputtd2"><input id="txtplanQuantity" class="smallInput" type="text" /></td></tr><tr> <td class="label2">车号</td><td class="inputtd2"><input id="txtvehicleNum" class="smallInput" type="text" /></td><td class="label2">运输单位</td><td class="inputtd2"><input id="txtshiper" class="smallInput" type="text" /></td></tr><tr> <td class="label2">站台</td><td class="inputtd2"><input id="txtplatform" class="smallInput" type="text" /></td><td class="label2">制单人</td><td class="inputtd2"><input id="txtagent" class="smallInput" type="text" /></td></tr><tr> <td class="label2">备注</td><td class="inputtd2"><input id="txtcomment" class="smallInput" type="text" /></td><td class="label2"></td><td class="inputtd2"></td></tr></table>';
    editItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {
        if (measure == null) {
            measure = MeasureClass.createInstance();
            ISystemService.getNextID.typeName = "Measure";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    measure.measureID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!measure.ValidateValue()) {
            return;
        }

        measure.measureNum = $("#txtmeasureNum").val();


        measure.materialID = $("#combomaterial").val();


        if ($.trim($("#txtcustomerID").val()) != '') {
            measure.customerID = $("#txtcustomerID").val();
        }
        else {
            measure.customerID = null;
        }


        if ($.trim($("#txtplanQuantity").val()) != '') {
            measure.planQuantity = $("#txtplanQuantity").val();
        }
        else {
            measure.planQuantity = null;
        }


        if ($.trim($("#txtvehicleNum").val()) != '') {
            measure.vehicleNum = $("#txtvehicleNum").val();
        }
        else {
            measure.vehicleNum = null;
        }


        if ($.trim($("#txtshiper").val()) != '') {
            measure.shiper = $("#txtshiper").val();
        }
        else {
            measure.shiper = null;
        }


        if ($.trim($("#txtplatform").val()) != '') {
            measure.platform = $("#txtplatform").val();
        }
        else {
            measure.platform = null;
        }


        if ($.trim($("#txtagent").val()) != '') {
            measure.agent = $("#txtagent").val();
        }
        else {
            measure.agent = null;
        }


        if ($.trim($("#txtcomment").val()) != '') {
            measure.comment = $("#txtcomment").val();
        }
        else {
            measure.comment = null;
        }


        if (editState == "add") {
            ISystemService.addDynObject.dynObject = measure;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(measure.measureID);
                    dictData.data.push(0);
                    dictData.data.push(measure.measureID);

                    dictData.data.push($("#txtmeasureNum").val());

                    dictData.data.push($("#combomaterial").find("option:selected").text());

                    dictData.data.push($("#txtcustomer").val());

                    dictData.data.push($("#txtplanQuantity").val());

                    dictData.data.push($("#txtshiper").val());

                    dictData.data.push($("#txtvehicleNum").val());

                    dictData.data.push($("#txtplatform").val());

                    dictData.data.push($("#txtagent").val());

                    dictData.data.push($("#txtcomment").val());

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = measure;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == measure.measureID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtmeasureNum").val();

                            dictDataList.rows[i].data[3] = $("#combomaterial").find("option:selected").text();

                            dictDataList.rows[i].data[4] = $("#txtcustomer").val();

                            dictDataList.rows[i].data[5] = $("#txtplanQuantity").val();

                            dictDataList.rows[i].data[6] = $("#txtshiper").val();

                            dictDataList.rows[i].data[7] = $("#txtvehicleNum").val();

                            dictDataList.rows[i].data[8] = $("#txtplatform").val();

                            dictDataList.rows[i].data[9] = $("#txtagent").val();

                            dictDataList.rows[i].data[10] = $("#txtcomment").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("计量单修改成功!");
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

    dateboxArray.push(toolBar.getInput("begincreateTime"));

    dateboxArray.push(toolBar.getInput("endcreateTime"));

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})