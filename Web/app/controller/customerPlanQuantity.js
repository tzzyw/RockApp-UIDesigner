
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid,
      customerPlanQuantity = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,CustomerPlanQuantity,Customer,Material,IBusinessService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;

                //初始化日期选择年份
                var year = parseInt(serverDate.substr(0, 4), 10);
                for (var i = 0; i < 4; i++) {
                    $("#comboyear").append("<option value='" + (year - i +1) + "'>" + (year - i +1 ) + "</option>");
                }
                $("#comboyear").get(0).selectedIndex = 0;

                for (var i = 0; i < 5; i++) {
                    $("#yearSearch").append("<option value='" + (year - i) + "'>" + (year - i) + "</option>");
                }
                for (var i = 1; i < 13; i++) {
                    $("#monthSearch").append("<option value='" + i + "'>" + i + "</option>");
                }

                $("#monthSearch").val(parseInt(serverDate.substr(5, 2), 10));

            }(ISystemService.getServerDate.resultValue));
        }

      

        ////初始化实体参照及查询项
        //sqlStr = "SELECT [CustomerID],[CustomerName] FROM [Customer] order by CustomerName";
        //ISystemService.execQuery.sqlString = sqlStr;
        //rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        //if (ISystemService.execQuery.success) {
        //    (function (e) {
        //        if (e != null) {
        //            var rows = e.rows;
        //            var rowLength = rows.length;
        //            for (var i = 0; i < rowLength; i++) {
        //                var rowResult = rows[i].values;
        //            }
        //        }
        //    }(ISystemService.execQuery.resultValue));
        //}


        $("#combomaterial").empty();
        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] where ForSale = '1' order by MaterialName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                toolBar.addListOption("comboproductSearch", "产品", 1, "button", "产品")
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combomaterial").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                        //toolBar.addListOption("combomaterialSearch", rowResult[0].value, i + 2, "button", rowResult[1].value)
                        $("#comboproductSearch").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>");
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        customerComplete("");

        //处理初始化加载数据
        getDataList();

        //绑定控件失去焦点验证方法
        //CustomerPlanQuantityClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 90);
    // toolBar.addButtonSelect("comboproductSearch", null, "产品", [], null, null, true, true, 15, "select")
    toolBar.addText("productName", null, "产品");
    toolBar.addInput("txtproductSearch", null, "", 100);
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
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                getDataList();
                break;
            case "add":
                editState = "add";
                $("#formTitle").text("添加客户计划销量");
                $("#txtcustomer").val("");
                $("#txtcustomerID").val("");
                $("#combomaterial").get(0).selectedIndex = 0;
                $("#comboyear").val("");
                $("#combomonth").val("");
                $("#txtquantity").val("");
                $("#txtuplimited").val("");
                $("#txtcurrentLevel").val("");                
                $("#txtcreateDate").val(serverDate);
                customerPlanQuantity = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑客户计划销量");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
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
                        ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + customerPlanQuantity.customerID;
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                $("#txtcustomer").val(e.value);
                            }(ISystemService.executeScalar.resultValue));
                        }

                        rock.setSelectItem("combomaterial", customerPlanQuantity.materialID, "value");
                        rock.setSelectItem("comboyear", customerPlanQuantity.year, "value");
                        rock.setSelectItem("combomonth", customerPlanQuantity.month, "value");              

                        $("#txtquantity").val(customerPlanQuantity.quantity);
                        $("#txtuplimited").val(customerPlanQuantity.uplimited);
                        $("#txtcurrentLevel").val(customerPlanQuantity.currentLevel);                        
                        $("#txtcreateDate").val(customerPlanQuantity.createDate.split(' ')[0]);
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
                        ISystemService.deleteDynObjectByID.structName = "CustomerPlanQuantity";
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

    toolBar.getInput("txtproductSearch").id = "txtproductSearch";
    $("#txtproductSearch").css("display", "none");
    $("#txtproductSearch").after("<select id='comboproductSearch' style=\"width:180px\"></select>");

    toolBar.getInput("txtyearSearch").id = "txtyearSearch";
    $("#txtyearSearch").css("display", "none");
    $("#txtyearSearch").after("<select id='yearSearch' style=\"width:60px\"></select>");
    toolBar.getInput("txtmonthSearch").id = "txtmonthSearch";
    $("#txtmonthSearch").css("display", "none");
    $("#txtmonthSearch").after("<select id='monthSearch' style=\"width:50px\"></select>");

    //初始化客户计划销量列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,客户名称,产品名称,计划销售量,计划浮动上限,计划浮动上限一级,计划浮动上限二级,当前级别,年份,月份");
    listGrid.setInitWidths("40,0,120,120,80,100,120,120,80,40,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑客户计划销量");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
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
        ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + customerPlanQuantity.customerID;
        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
        var warehouseName = null;
        if (ISystemService.executeScalar.success) {
            (function (e) {
                $("#txtcustomer").val(e.value);
            }(ISystemService.executeScalar.resultValue));
        }

        rock.setSelectItem("combomaterial", customerPlanQuantity.materialID, "value");
        rock.setSelectItem("comboyear", customerPlanQuantity.year, "value");
        rock.setSelectItem("combomonth", customerPlanQuantity.month, "value");      
        $("#txtquantity").val(customerPlanQuantity.quantity);
        $("#txtuplimited").val(customerPlanQuantity.uplimited);
        $("#txtcreateDate").val(customerPlanQuantity.createDate.split(' ')[0]);
        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(190);
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

    //处理编辑项

    //tableString = '';
    //editItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {
        if ($.trim($("#txtcustomerID").val()) == '') {
            alert("客户不可以为空!");
            return;
        }
        if ($.trim($("#txtquantity").val()) == '') {
            alert("计划销量不可以为空!");
            return;
        }

        if (!rock.chknum($("#txtquantity").val())) {
            alert('计划销量输入格式错误');
            return;
        }

        if ($.trim($("#txtuplimited").val()) == '') {
            alert("计划浮动上限不可以为空!");
            return;
        }        

        if (!rock.chknum($("#txtuplimited").val())) {
            alert('计划浮动上限输入格式错误');
            return;
        }

        if (!rock.chkdate($("#txtcreateDate").val(), "-")) {
            alert("创建日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        var exist = false;
        IBusinessService.customerPlanQuantityExist.customerID = $("#txtcustomerID").val();
        IBusinessService.customerPlanQuantityExist.materialID = $("#combomaterial").val();
        IBusinessService.customerPlanQuantityExist.year = $("#comboyear").val();
        IBusinessService.customerPlanQuantityExist.month = $("#combomonth").val();
        rock.AjaxRequest(IBusinessService.customerPlanQuantityExist, rock.exceptionFun);
        if (IBusinessService.customerPlanQuantityExist.success) {
            (function (e) {
                exist = e.value;
            }(IBusinessService.customerPlanQuantityExist.resultValue))
        }

        if (exist) {
            alert("当前客户的产品销售计划已经存在请检查!");
            return;
        }

        if (customerPlanQuantity == null) {
            customerPlanQuantity = CustomerPlanQuantityClass.createInstance();
            ISystemService.getNextID.typeName = "CustomerPlanQuantity";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerPlanQuantity.customerPlanQuantityID = e.value;
                    customerPlanQuantity.currentLevel = 0;
                    $("#txtcurrentLevel").val("0");
                }(ISystemService.getNextID.resultValue))
            }
        }
        //if (!customerPlanQuantity.ValidateValue()) {
        //    return;
        //}
        
        if ($.trim($("#txtcustomerID").val()) != '') {
            customerPlanQuantity.customerID = $("#txtcustomerID").val();
        }
        else {
            customerPlanQuantity.customerID = null;
        }

        customerPlanQuantity.materialID = $("#combomaterial").val();       
        customerPlanQuantity.year = $("#comboyear").val();
        customerPlanQuantity.month = $("#combomonth").val();
        customerPlanQuantity.quantity = $("#txtquantity").val();
        customerPlanQuantity.uplimited = $("#txtuplimited").val();
        if ($.trim($("#txtcreateDate").val()) != '') {
            customerPlanQuantity.createDate = $("#txtcreateDate").val();
        }
        else {
            customerPlanQuantity.createDate = null;
        }

        if (editState == "add") {
            ISystemService.addDynObject.dynObject = customerPlanQuantity;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(customerPlanQuantity.customerPlanQuantityID);
                    dictData.data.push(0);
                    dictData.data.push(customerPlanQuantity.customerPlanQuantityID);
                    dictData.data.push($("#txtcustomer").val());
                    dictData.data.push($("#combomaterial").find("option:selected").text());
                    dictData.data.push($("#txtquantity").val());
                    dictData.data.push($("#txtuplimited").val());
                    dictData.data.push($("#txtuplimited1").val());
                    dictData.data.push($("#txtupLimited2").val());
                    dictData.data.push($("#txtcurrentLevel").val());
                    dictData.data.push($("#comboyear").val());
                    dictData.data.push($("#combomonth").val());
                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = customerPlanQuantity;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == customerPlanQuantity.customerPlanQuantityID) {
                            dictDataList.rows[i].data[0] = 0;
                            dictDataList.rows[i].data[2] = $("#txtcustomer").val();
                            dictDataList.rows[i].data[3] = $("#combomaterial").find("option:selected").text();
                            dictDataList.rows[i].data[4] = $("#txtquantity").val();
                            dictDataList.rows[i].data[5] = $("#txtuplimited").val();
                            dictDataList.rows[i].data[6] = $("#txtuplimited1").val();
                            dictDataList.rows[i].data[7] = $("#txtupLimited2").val();
                            dictDataList.rows[i].data[8] = $("#txtcurrentLevel").val();
                            dictDataList.rows[i].data[9] = $("#comboyear").val();
                            dictDataList.rows[i].data[10] = $("#combomonth").val();
                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("客户计划销量修改成功!");
        }
        
        refreshToolBarState();
    });

    //加载弹窗Div

    //$(document.body).append('');

    
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
        ISystemService.execQuery.sqlString = "select top 14 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where Available = '1' and ForSale = '1' and [CustomerName] like  '%" + $("#txtcustomer").val() + "%' or [SearchCode] like  '%" + $("#txtcustomer").val() + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerQuickGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }

    //$(document.body).mousedown(function (e) {
    //    if (e.srcElement.id == "") {
    //        if (e.srcElement.id != "txtcustomer") {
    //            hidecustomerPop();
    //        }
    //    }      

    //});

    $('#editForm').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomer") {
            hidecustomerPop();
        }

    });

    function getDataList() {
        sqlStr = "select [CustomerPlanQuantity].[CustomerPlanQuantityID], [Customer].[CustomerName], [Material].[MaterialName], [CustomerPlanQuantity].[quantity], [CustomerPlanQuantity].[uplimited], [CustomerPlanQuantity].[uplimited1], [CustomerPlanQuantity].[upLimited2], [CustomerPlanQuantity].[currentLevel], [CustomerPlanQuantity].[year], [CustomerPlanQuantity].[month] from [CustomerPlanQuantity] join [Customer] on [CustomerPlanQuantity].[customerID] = [Customer].[customerID] join [Material] on [CustomerPlanQuantity].[materialID] = [Material].[materialID]";
        sqlStr += " and [CustomerPlanQuantity].[year] = " + $("#yearSearch").val();
        sqlStr += " and [CustomerPlanQuantity].[month] = " + $("#monthSearch").val();
        if (toolBar.getValue("txtcustomerSearch") != "") {
            sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
        }

        if ($("#comboproduct").find("option:selected").text() != "产品") {
            sqlStr += " and [Material].[MaterialName] = '" + $("#comboproduct").find("option:selected").text() + "'";
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

    dateboxArray.push("txtcreateDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})