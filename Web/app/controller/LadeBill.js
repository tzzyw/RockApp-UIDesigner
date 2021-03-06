﻿
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, customerPop, customerQuickGrid, vehiclePop, vehicleQuickGrid,
      ladeBill = null,
	  customer = null,
      planSale = null,
      customerPlanQuantity = null,
      ladeBillID = $.getUrlParam("ID")
    dictDataList = new rock.JsonList();

    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,LadeBill,Customer,Material,Measure,CustomerPlanApply,PlanSale,CustomerPlanQuantity,IBusinessService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
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

        //$("#combomaterial").empty();
        //sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] where [Available] = '1' and [ForSale] = '1' and [PersonName] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";
        //ISystemService.execQuery.sqlString = sqlStr;
        //rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        //if (ISystemService.execQuery.success) {
        //    (function (e) {
        //        toolBar.addListOption("combomaterialSearch", "产品", 1, "button", "产品")
        //        if (e != null) {
        //            var rows = e.rows;
        //            var rowLength = rows.length;
        //            for (var i = 0; i < rowLength; i++) {
        //                var rowResult = rows[i].values;
        //                $("#combomaterial").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
        //                toolBar.addListOption("combomaterialSearch", rowResult[0].value, i + 2, "button", rowResult[1].value)
        //            }
        //        }
        //    }(ISystemService.execQuery.resultValue));
        //}

        $("#combomaterialSearch").empty();
        $("#combomaterialSearch").append("<option value='-1'>请选择产品</option>");
        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] join [ProductMarketing] on [MaterialID] = [ProductID] and [Available] = '1' and [ForSale] = '1' and [PersonName] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";
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
                        $("#combomaterialSearch").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
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

        $("#comboshipType").empty();
        sqlStr = "SELECT [ReferName] FROM [Refer] where [ReferType] = '发运方式'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#comboshipType").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }
        customerComplete("");
        vehicleComplete("");
        getMaterialGrade();
        //绑定控件失去焦点验证方法
        //LadeBillClass.validateBind();
        //初始化工具栏状态
        getDataList();
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("billingTimeBegin", null, "开票日期");
    toolBar.addInput("beginbillingTime", null, "", 60);
    toolBar.addText("开票日期End", null, "-");
    toolBar.addInput("endbillingTime", null, "", 60);
    toolBar.addText("customer", null, "客户");
    toolBar.addInput("txtcustomerSearch", null, "", 80);
    //toolBar.addButtonSelect("combomaterialSearch", null, "产品", [], null, null, true, true, 15, "select")
    toolBar.addText("customer", null, "产品");
    toolBar.addInput("txtmateriaSearch", null);
    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("sepModify", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.addSeparator("sepCommit", null);
    toolBar.addButton("commit", null, "提交");
    toolBar.addSeparator("seprepeal", null);
    toolBar.addButton("repeal", null, "撤销");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "query":
                getDataList();
                break;
            case "add":
                editState = "add";
                $("#formTitle").text("添加提货单");
                IBusinessService.getBillNO.objectType = "销售提货";
                rock.AjaxRequest(IBusinessService.getBillNO, rock.exceptionFun);
                if (IBusinessService.getBillNO.success) {
                    (function (e) {
                        $("#txtladeBillNum").val(e.value);
                    }(IBusinessService.getBillNO.resultValue))
                }
                $("#txtbillingTime").val(serverDate);
                $("#txtcontractNum").val("");
                $("#txtcustomer").val("");
                $("#txtcustomerID").val("");
                $("#combomaterial").get(0).selectedIndex = 0;
                $("#combomaterialGrade").get(0).selectedIndex = 0;
                $("#txtpicker").val("");
                $("#txtplanQuantity").val("");
                $("#txtactualQuantity").val("");
                $("#txtquotedPrice").val("");
                $("#txtpipePrice").val("");
                $("#txtplanTotal").val("");
                $("#txtactualTotal").val("");
                $("#txtladeDate").val(serverDate);
                $("#comboladenPlace").get(0).selectedIndex = 0;
                $("#comboshipType").get(0).selectedIndex = 0;
                $("#txtvehicle").val("");
                $("#txtdestination").val("");
                $("#txtpacking").val("");
                //$("#txtplateNumber").val("");
                $("#chkweight").attr("checked", true);
                $("#txtagent").val(decodeURIComponent($.cookie('userTrueName')));
                $("#txtcomment").val("");
                $("#txtsettleTotal").val("");
                $("#txtmeasure").val("");
                $("#txtcarrier").val("");
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
                        $("#txtbillingTime").val(ladeBill.billingTime.split(' ')[0]);
                        $("#txtcontractNum").val(ladeBill.contractNum);
                        $("#txtcustomerID").val(ladeBill.customerID);
                        ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + ladeBill.customerID;
                        rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                        var warehouseName = null;
                        if (ISystemService.executeScalar.success) {
                            (function (e) {
                                $("#txtcustomer").val(e.value);
                            }(ISystemService.executeScalar.resultValue));
                        }
                        rock.setSelectItem("combomaterial", ladeBill.materialID, "value");
                        rock.setSelectItem("combomaterialGrade", ladeBill.materialLevel, "text");
                        $("#txtpicker").val(ladeBill.picker);
                        $("#txtplanQuantity").val(ladeBill.planQuantity);
                        $("#txtactualQuantity").val(ladeBill.actualQuantity);
                        $("#txtquotedPrice").val(ladeBill.quotedPrice);
                        $("#txtpipePrice").val(ladeBill.pipePrice);
                        $("#txtplanTotal").val(ladeBill.planTotal);
                        $("#txtactualTotal").val(ladeBill.actualTotal);
                        $("#txtladeDate").val(ladeBill.ladeDate.split(' ')[0]);
                        rock.setSelectItem("comboladenPlace", ladeBill.ladenPlace, "text");
                        rock.setSelectItem("comboshipType", ladeBill.shipType, "text");
                        $("#txtvehicle").val(ladeBill.plateNumber);
                        $("#txtdestination").val(ladeBill.destination);
                        $("#txtpacking").val(ladeBill.packing);
                        $("#chkweight").attr("checked", ladeBill.weight);
                        $("#txtagent").val(ladeBill.agent);
                        $("#txtcomment").val(ladeBill.comment);
                        $("#txtsettleTotal").val(ladeBill.settleTotal);
                        $("#txtmeasure").val(ladeBill.measure);
                        //获取客户可用余额
                        IBusinessService.getCustomerBalance.customerID = ladeBill.customerID;
                        rock.AjaxRequest(IBusinessService.getCustomerBalance, rock.exceptionFun);
                        if (IBusinessService.getCustomerBalance.success) {
                            (function (e) {
                                $("#txtcustomerBalance").val(e.value);
                            }(IBusinessService.getCustomerBalance.resultValue))
                        }
                        //获取运输单位
                        ISystemService.getObjectProperty.objName = "Measure";
                        ISystemService.getObjectProperty.property = "Shiper";
                        ISystemService.getObjectProperty.ojbID = ladeBill.measureID;
                        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                        if (ISystemService.getObjectProperty.success) {
                            (function (e) {
                                $("#txtcarrier").val(e.value);
                            }(ISystemService.getObjectProperty.resultValue));
                        }
                        //获取净重
                        ISystemService.getObjectProperty.objName = "Measure";
                        ISystemService.getObjectProperty.property = "NetWeight";
                        ISystemService.getObjectProperty.ojbID = ladeBill.measureID;
                        rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
                        if (ISystemService.getObjectProperty.success) {
                            (function (e) {
                                $("#txtnetWeight").val(e.value);
                            }(ISystemService.getObjectProperty.resultValue));
                        }
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
                        IBusinessService.deleteLadeBill.ladeBillID = rowids[i];
                        rock.AjaxRequest(IBusinessService.deleteLadeBill, rock.exceptionFun);
                        if (IBusinessService.deleteLadeBill.success) {
                            (function (e) {
                                for (var j = 0; j < dictDataList.rows.length; j++) {
                                    if (dictDataList.rows[j].id == rowids[i]) {
                                        dictDataList.rows.splice(j, 1);
                                        listGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(IBusinessService.deleteLadeBill.resultValue))
                        }
                    }
                    refreshToolBarState();
                }
                break;
            case "commit":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        IBusinessService.commitLadeBill.ladeBillID = checked;
                        rock.AjaxRequest(IBusinessService.commitLadeBill, rock.exceptionFun);
                        if (IBusinessService.commitLadeBill.success) {
                            (function (e) {
                                for (var i = 0; i < dictDataList.rows.length; i++) {
                                    if (dictDataList.rows[i].id == checked) {

                                        dictDataList.rows[i].data[10] = "已提交";
                                    }
                                }
                                listGrid.clearAll();
                                listGrid.parse(dictDataList, "json");
                                refreshToolBarState();
                                alert("销售提货已提交!");
                            }(IBusinessService.commitLadeBill.resultValue))
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
            case "repeal":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        IBusinessService.repealLadeBill.ladeBillID = checked;
                        rock.AjaxRequest(IBusinessService.repealLadeBill, rock.exceptionFun);
                        if (IBusinessService.repealLadeBill.success) {
                            (function (e) {
                                for (var i = 0; i < dictDataList.rows.length; i++) {
                                    if (dictDataList.rows[i].id == checked) {

                                        dictDataList.rows[i].data[10] = "已创建";
                                    }
                                }
                                listGrid.clearAll();
                                listGrid.parse(dictDataList, "json");
                                refreshToolBarState();
                                alert("销售提货已撤销!");
                            }(IBusinessService.repealLadeBill.resultValue))
                        }
                    }
                    else {
                        alert("请仅选择一条要撤销的行!");
                    }
                }
                else {
                    alert("请选择要撤销的行!");
                }
                break;
        }
    });

    toolBar.getInput("txtmateriaSearch").id = "txtmateriaSearch";
    $("#txtmateriaSearch").css("display", "none");
    $("#txtmateriaSearch").after("<select id='combomaterialSearch' style=\"width:120px\"></select>");

    //初始化提货单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,客户名称,产品名称,挂牌单价,计划提货数量,实际提货数量,车船号,提货日期,到站名称,状态");
    listGrid.setInitWidths("40,0,180,100,80,100,100,120,80,80,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        var state = listGrid.cells(rowID, 10).getValue();
        if (state == "已创建") {
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
            $("#txtbillingTime").val(ladeBill.billingTime.split(' ')[0]);
            $("#txtcontractNum").val(ladeBill.contractNum);
            $("#txtcustomerID").val(ladeBill.customerID);
            ISystemService.executeScalar.sqlString = "select [CustomerName] from [Customer] where [CustomerID] = " + ladeBill.customerID;
            rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
            var warehouseName = null;
            if (ISystemService.executeScalar.success) {
                (function (e) {
                    $("#txtcustomer").val(e.value);
                }(ISystemService.executeScalar.resultValue));
            }

            rock.setSelectItem("combomaterial", ladeBill.materialID, "value");
            rock.setSelectItem("combomaterialGrade", ladeBill.materialGrade, "text");
            $("#txtpicker").val(ladeBill.picker);
            $("#txtplanQuantity").val(ladeBill.planQuantity);
            $("#txtactualQuantity").val(ladeBill.actualQuantity);
            $("#txtquotedPrice").val(ladeBill.quotedPrice);
            $("#txtpipePrice").val(ladeBill.pipePrice);
            $("#txtplanTotal").val(ladeBill.planTotal);
            $("#txtactualTotal").val(ladeBill.actualTotal);
            $("#txtladeDate").val(ladeBill.ladeDate.split(' ')[0]);
            rock.setSelectItem("comboladenPlace", ladeBill.ladenPlace, "text");
            rock.setSelectItem("comboshipType", ladeBill.shipType, "text");
            $("#txtvehicle").val(ladeBill.plateNumber);
            $("#txtdestination").val(ladeBill.destination);
            $("#txtpacking").val(ladeBill.packing);
            $("#chkweight").attr("checked", ladeBill.weight);
            $("#txtagent").val(ladeBill.agent);
            $("#txtcomment").val(ladeBill.comment);
            $("#txtsettleTotal").val(ladeBill.settleTotal);
            $("#txtmeasure").val(ladeBill.measure);
            //获取客户可用余额
            IBusinessService.getCustomerBalance.customerID = ladeBill.customerID;
            rock.AjaxRequest(IBusinessService.getCustomerBalance, rock.exceptionFun);
            if (IBusinessService.getCustomerBalance.success) {
                (function (e) {
                    $("#txtcustomerBalance").val(e.value);
                }(IBusinessService.getCustomerBalance.resultValue))
            }
            //获取运输单位
            ISystemService.getObjectProperty.objName = "Measure";
            ISystemService.getObjectProperty.property = "Shiper";
            ISystemService.getObjectProperty.ojbID = ladeBill.measureID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    $("#txtcarrier").val(e.value);
                }(ISystemService.getObjectProperty.resultValue));
            }
            //获取净重
            ISystemService.getObjectProperty.objName = "Measure";
            ISystemService.getObjectProperty.property = "NetWeight";
            ISystemService.getObjectProperty.ojbID = ladeBill.measureID;
            rock.AjaxRequest(ISystemService.getObjectProperty, rock.exceptionFun);
            if (ISystemService.getObjectProperty.success) {
                (function (e) {
                    $("#txtnetWeight").val(e.value);
                }(ISystemService.getObjectProperty.resultValue));
            }
            showEditForm();
        }

    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(420);
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

    //tableString = '';
    //editItem.html(tableString);

    //保存
    $("#btn_Save").click(function () {
        var 计划提货数量 = 0;
        var 额定载货量 = 0;
        var 单价 = 0;
        var 管输单价 = 0;
        var 总单价 = 0;
        var 计划总金额 = 0;
        var 可用余额 = 0;
        var 计算金额 = 0;

        if (!$("#txtladeBillNum").validate("required", "销售提货编号")) {
            return false;
        }

        if (!$("#txtcustomerID").validate("required", "客户")) {
            return false;
        }

        if (!$("#txtbillingTime").validate("date", "创建日期")) {
            return false;
        }
        if (!$("#txtladeDate").validate("date", "提货日期")) {
            return false;
        }

        //if (!$("#txtquotedPrice").validate("required", "挂牌单价")) {
        //    return false;
        //}

        if (!$("#txtquotedPrice").validate("number", "挂牌单价")) {
            return false;
        }

        if (!$("#txtplanQuantity").validate("number", "计划提货数量")) {
            return false;
        }

        if (!$("#txtplanTotal").validate("number", "计划量总金额")) {
            return false;
        }

        if ($.trim($("#txtpipePrice").val()) != '') {
            if (!rock.chknum($("#txtpipePrice").val())) {
                alert('管输单价输入格式错误');
                $("#txtpipePrice").focus();
                return false;
            }
            管输单价 = parseFloat($("#txtpipePrice").val());
        }

        if (!$("#txtagent").validate("required", "经办人")) {
            return false;
        }
        计划提货数量 = parseFloat($("#txtplanQuantity").val());
        if ($("#chkweight").attr("checked")) {

            if (!$("#txtvehicle").validate("required", "您选择了称重,承运车辆")) {
                return false;
            }

            额定载货量 = parseFloat($("#txtapprovedLoad").val());
            //检查车辆额定载重量
            if ((额定载货量 / 1000) < 计划提货数量) {
                alert("计划提货数量不能超过所选车辆的额定载重量!");
                return;
            }
        }

        //检测提货总金额       
        单价 = parseFloat($("#txtquotedPrice").val());
        总单价 = 管输单价 + 单价;
        计划总金额 = parseFloat($("#txtplanTotal").val());
        可用余额 = parseFloat($("#txtcustomerBalance").val());
        计算金额 = 计划提货数量 * 总单价;

        if (Math.abs(计算金额 - 计划总金额) > 0.003) {
            alert("提货总金额不正确,请检查!");
            return;
        }

        //检验客户余额
        if (editState == "add") {
            if (计划总金额 > 可用余额) {
                alert("当前客户的可用余额不足,不可以提货,请检查!");
                return;
            }
        }
        else {
            IBusinessService.getCurrentBalance.customerID = ladeBill.customerID;
            IBusinessService.getCurrentBalance.ladeBillID = ladeBill.ladeBillID;
            rock.AjaxRequest(IBusinessService.getCurrentBalance, rock.exceptionFun);
            if (IBusinessService.getCurrentBalance.success) {
                (function (e) {
                    可用余额 = parseFloat(e.value);
                }(IBusinessService.getCurrentBalance.resultValue))
            } else {
                alert("获取可用余额出错!");
                return;
            }
            if (计划总金额 > 可用余额) {
                alert("当前客户的可用余额不足,不可以提货,请检查!");
                return;
            }
        }

        //检验客户资质
        var customerQualified = "";
        IBusinessService.customerQualified.customerID = $("#txtcustomerID").val();
        rock.AjaxRequest(IBusinessService.customerQualified, rock.exceptionFun);
        if (IBusinessService.customerQualified.success) {
            (function (e) {
                customerQualified = e.value;
            }(IBusinessService.customerQualified.resultValue))
        }

        if (customerQualified != "") {
            alert("当前客户的资质不具备提货条件,请检查!");
            alert(customerQualified);
            return;
        }

        //检验产品库存计划
        IBusinessService.getPlanSaleByMaterialID.materialID = $("#combomaterial").val();
        rock.AjaxRequest(IBusinessService.getPlanSaleByMaterialID, rock.exceptionFun);
        if (IBusinessService.getPlanSaleByMaterialID.success) {
            (function (e) {
                planSale = e;
            }(IBusinessService.getPlanSaleByMaterialID.resultValue))
        }
        else {
            planSale = null;
        }

        if (planSale != null) {

            var totalQuantity = null;
            IBusinessService.getTotalLadeQuantity.materialID = $("#combomaterial").val();
            rock.AjaxRequest(IBusinessService.getTotalLadeQuantity, rock.exceptionFun);
            if (IBusinessService.getTotalLadeQuantity.success) {
                (function (e) {
                    totalQuantity = parseFloat(e.value);
                }(IBusinessService.getTotalLadeQuantity.resultValue))
            }
            else {
                alert("获取产品累计提货量出错");
                return;
            }

            if ((planSale.quantity - totalQuantity - 计划提货数量) < 0) {
                alert("产品:[" + this.txt产品名称.Text + "]" + "的实际提货数量已经超出了计划提货数量,不能提货,请检查!");
                return;
            }

        }
        else {
            alert("产品:[" + this.txt产品名称.Text + "]的产品计划销售量没有维护,不能提货请检查!");
            return;
        }

        //检验客户产品计划
        IBusinessService.getCustomerPlanQuantity.customerID = $("#txtcustomerID").val();
        IBusinessService.getCustomerPlanQuantity.materialID = $("#combomaterial").val();
        IBusinessService.getCustomerPlanQuantity.year = parseInt($("#txtladeDate").val().split('-')[0]);
        IBusinessService.getCustomerPlanQuantity.month = parseInt($("#txtladeDate").val().split('-')[1]);
        rock.AjaxRequest(IBusinessService.getCustomerPlanQuantity, rock.exceptionFun);
        if (IBusinessService.getCustomerPlanQuantity.success) {
            (function (e) {
                customerPlanQuantity = e;
            }(IBusinessService.getCustomerPlanQuantity.resultValue))
        }

        if (customerPlanQuantity != null) {
            var customerTotalLadeQuantity = null;
            IBusinessService.getCustomerTotalLadeQuantity.customerPlanQuantityID = customerPlanQuantity.customerPlanQuantityID;
            if (ladeBill) {
                IBusinessService.getCustomerTotalLadeQuantity.ladeBillID = ladeBill.ladeBillID;
            }
            else {
                IBusinessService.getCustomerTotalLadeQuantity.ladeBillID = -1;
            }
            rock.AjaxRequest(IBusinessService.getCustomerTotalLadeQuantity, rock.exceptionFun);
            if (IBusinessService.getCustomerTotalLadeQuantity.success) {
                (function (e) {
                    customerTotalLadeQuantity = parseFloat(e.value);
                }(IBusinessService.getCustomerTotalLadeQuantity.resultValue))
            }
            else {
                alert("获取客户产品累计提货量出错");
                return;
            }

            switch (customerPlanQuantity.currentLevel) {
                case 0:
                    if ((customerPlanQuantity.uplimited - customerTotalLadeQuantity - parseFloat($("#txtplanQuantity").val())) < 0) {
                        alert("客户产品:[" + $("#txtmaterial").val() + "]" + "的实际提货数量已经超出了该客户计划销售数量,不能提货,请检查!");
                        return;
                    }
                    break;
                case 1:
                    if ((customerPlanQuantity.uplimited1 - customerTotalLadeQuantity - parseFloat($("#txtplanQuantity").val())) < 0) {
                        alert("客户产品:[" + $("#txtmaterial").val() + "]" + "的实际提货数量已经超出了该客户计划销售数量,不能提货,请检查!");
                        return;
                    }
                    break;
                case 2:
                    if (customerPlanQuantity.uplimited2 - customerTotalLadeQuantity - parseFloat($("#txtplanQuantity").val()) < 0) {
                        alert("客户产品:[" + $("#txtmaterial").val() + "]" + "的实际提货数量已经超出了该客户计划销售数量,不能提货,请检查!");
                        return;
                    }
                    break;
            }
        }
        else {
            var date = $("#txtladeDate").val();

            alert("客户[" + $("#txtcustomer").val() + "]的提货产品:[" + $("#txtmaterial").val() + "]" + "在" + date.split('-')[0] + "年" + date.split('-')[1] + "月,没有销售库存计划,不能提货,请检查!");
            return;
        }


        // 保存数据
        if (ladeBill == null) {
            ladeBill = LadeBillClass.createInstance();
            ISystemService.getNextID.typeName = "LadeBill";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    ladeBill.ladeBillID = e.value;
                    ladeBill.state = "已创建";
                    ladeBill.closed = false;
                }(ISystemService.getNextID.resultValue))
            }
        }

        ladeBill.ladeBillNum = $("#txtladeBillNum").val();
        ladeBill.customerID = $("#txtcustomerID").val();
        ladeBill.materialID = $("#combomaterial").val();
        ladeBill.contractID = -1;
        if ($.trim($("#combomaterialGrade").val()) != '') {
            ladeBill.materialLevel = $("#combomaterialGrade").val();
        }
        else {
            ladeBill.materialLevel = null;
        }

        if ($.trim($("#txtpipePrice").val()) != '') {
            ladeBill.pipePrice = parseFloat($("#txtpipePrice").val());
        }
        else {
            ladeBill.pipePrice = null;
        }

        ladeBill.planQuantity = 计划提货数量;

        if ($.trim($("#txtactualQuantity").val()) != '') {
            ladeBill.actualQuantity = parseFloat($("#txtactualQuantity").val());
        }
        else {
            ladeBill.actualQuantity = null;
        }
        ladeBill.planTotal = 计划总金额;

        if ($.trim($("#txtactualTotal").val()) != '') {
            ladeBill.actualTotal = parseFloat($("#txtactualTotal").val());
        }
        else {
            ladeBill.actualTotal = null;
        }
        if ($.trim($("#txtpacking").val()) != '') {
            ladeBill.packing = $("#txtpacking").val();
        }
        else {
            ladeBill.packing = null;
        }

        //if ($.trim($("#txtcarrier").val()) != '') {
        //    ladeBill.picker = $("#txtcarrier").val();
        //}
        //else {
        //    ladeBill.picker = null;
        //}

        if ($.trim($("#txtvehicle").val()) != '') {
            ladeBill.plateNumber = $("#txtvehicle").val();
        }
        else {
            ladeBill.plateNumber = null;
        }

        if ($.trim($("#txtdestination").val()) != '') {
            ladeBill.destination = $("#txtdestination").val();
        }
        else {
            ladeBill.destination = null;
        }

        ladeBill.measure = "吨";
        ladeBill.billingTime = $("#txtbillingTime").val();
        ladeBill.ladeDate = $("#txtladeDate").val();
        ladeBill.agent = $("#txtagent").val();
        ladeBill.weight = $("#chkweight").attr("checked");
        ladeBill.ladenPlace = $("#comboladenPlace").val();
        if ($.trim($("#txtpicker").val()) != '') {
            ladeBill.picker = $("#txtpicker").val();
        }
        else {
            ladeBill.picker = null;
        }
        ladeBill.shipType = $("#comboshipType").val();
        ladeBill.quotedPrice = 单价;
        if ($.trim($("#txtcomment").val()) != '') {
            ladeBill.comment = $("#txtcomment").val();
        }
        else {
            ladeBill.comment = null;
        }

        if (editState == "add") {
            IBusinessService.addLadeBill.ladeBill = ladeBill;
            IBusinessService.addLadeBill.shiper = $("#txtcarrier").val();
            rock.AjaxRequest(IBusinessService.addLadeBill, rock.exceptionFun);
            if (IBusinessService.addLadeBill.success) {
                (function (e) {
                    var dictData = new rock.JsonData(ladeBill.ladeBillID);
                    dictData.data.push(0);
                    dictData.data.push(ladeBill.ladeBillID);

                    dictData.data.push($("#txtcustomer").val());

                    dictData.data.push($("#combomaterial").find("option:selected").text());

                    dictData.data.push($("#txtcontractPrice").val());

                    dictData.data.push($("#txtplanQuantity").val());

                    dictData.data.push($("#txtactualQuantity").val());

                    dictData.data.push($("#txtvehicle").val());

                    dictData.data.push($("#txtladeDate").val());

                    dictData.data.push($("#txtdestination").val());

                    dictData.data.push(ladeBill.state);

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                    alert("提货单新增成功!");
                }(IBusinessService.addLadeBill.resultValue));
            }
        }
        else {
            IBusinessService.modifyLadeBill.ladeBill = ladeBill;
            IBusinessService.modifyLadeBill.shiper = $("#txtcarrier").val();
            rock.AjaxRequest(IBusinessService.modifyLadeBill, rock.exceptionFun);
            if (IBusinessService.modifyLadeBill.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == ladeBill.ladeBillID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtcustomer").val();

                            dictDataList.rows[i].data[3] = $("#combomaterial").find("option:selected").text();

                            dictDataList.rows[i].data[4] = $("#txtcontractPrice").val();

                            dictDataList.rows[i].data[5] = $("#txtplanQuantity").val();

                            dictDataList.rows[i].data[6] = $("#txtactualQuantity").val();

                            dictDataList.rows[i].data[7] = $("#txtvehicle").val();

                            dictDataList.rows[i].data[8] = $("#txtladeDate").val();

                            dictDataList.rows[i].data[9] = $("#txtdestination").val();

                            dictDataList.rows[i].data[10] = ladeBill.state;

                        }
                    }
                }(IBusinessService.modifyLadeBill.resultValue));
                listGrid.clearAll();
                listGrid.parse(dictDataList, "json");
                hideEditForm();
                alert("提货单修改成功!");
            }
        }
        refreshToolBarState();
    });

    //加载弹窗Div

    //$(document.body).append('<div id="customerPop" style="width: 260px; height: 400px; position: absolute; background-color: White;display: none;z-index:9"><div id="customerQuickGrid" style="width: 260px; height: 400px; float: left; border: 1px solid #E3E3E3;"></div></div>');

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
        //获取客户可用余额
        IBusinessService.getCustomerBalance.customerID = rowID;
        rock.AjaxRequest(IBusinessService.getCustomerBalance, rock.exceptionFun);
        if (IBusinessService.getCustomerBalance.success) {
            (function (e) {
                $("#txtcustomerBalance").val(e.value);
            }(IBusinessService.getCustomerBalance.resultValue))
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
        ISystemService.execQuery.sqlString = "select top 14 [Customer].[CustomerID], [Customer].[CustomerName] from [Customer] where [Available] = '1' and [ForSale] = '1' and [CustomerName] like  '%" + $("#txtcustomer").val() + "%' or [SearchCode] like  '%" + $("#txtcustomer").val() + "%'";
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
        if (e.srcElement.id != "txtvehicle") {
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
        if ($("#chkweight").attr("checked")) {
            $("#txtvehicleID").val(rowID);
            $("#txtvehicle").val(vehicleQuickGrid.cells(rowID, 2).getValue());
            $("#txtcarrier").val(vehicleQuickGrid.cells(rowID, 3).getValue());
            $("#txtapprovedLoad").val(vehicleQuickGrid.cells(rowID, 5).getValue());
            hidevehiclePop();
        }
        else {
            alert("请先选择是否称重后再选择承运车辆!");
            hidevehiclePop();
        }
    });
    vehicleQuickGrid.init();
    //vehicleQuickGrid.detachHeader(0);
    vehiclePop = $("#vehiclePop")
    $('#txtvehicle').focus(function (e) {
        showvehiclePop();
    });

    function showvehiclePop() {
        var top = $("#txtvehicle").offset().top;
        var left = $("#txtvehicle").offset().left;
        vehiclePop.css({ top: top + 22, left: left }).show();
    }

    function hidevehiclePop() {
        vehiclePop.css({ top: 200, left: -1300 }).hide();
    }
    hidevehiclePop();

    $("#txtvehicle").keyup(function () {
        vehicleComplete($("#txtvehicle").val());
    });
    var vehicleDataList = new rock.JsonList();

    function vehicleComplete(searchCode) {
        //select top 10 承运车辆ID, 承运车辆编码,运输单位名称,车牌号, 载货类别, CAST(额定载重量 AS numeric) AS 额定载重量 from 承运车辆 where 到期日期 >= convert(varchar(8),getdate(),112) and 结束有效时间 >= convert(varchar(8),getdate(),112) and 车牌号 like '%" + this.txtVehicleNumber.Text.Trim() + "%'
        ISystemService.execQuery.sqlString = "select top 10 [Vehicle].[VehicleID], [Vehicle].[VehicleNum],[Carrier].[CarrierName],[Cargo], CAST(ApprovedLoad AS numeric) AS ApprovedLoad from [Vehicle] join [Carrier] on [Vehicle].[CarrierID] = [Vehicle].[CarrierID] and [Vehicle].[ExpiryDate] >= convert(varchar(8),getdate(),112) and [VehicleNum] like  '%" + $("#txtvehicle").val() + "%' ";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, vehicleQuickGrid, vehicleDataList);
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
            toolBar.disableItem("commit");
            toolBar.disableItem("repeal");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("modify");
                toolBar.disableItem("delete");
                toolBar.disableItem("commit");
                toolBar.disableItem("repeal");

            }
            else {
                var state = listGrid.cells(checked, 10).getValue();
                switch (state) {
                    case "已创建":
                        toolBar.enableItem("modify");
                        toolBar.enableItem("delete");
                        toolBar.enableItem("commit");
                        toolBar.disableItem("repeal");
                        break;
                    case "已提交":
                        toolBar.disableItem("modify");
                        toolBar.disableItem("delete");
                        toolBar.disableItem("commit");
                        toolBar.enableItem("repeal");
                        break;
                    default:
                        toolBar.disableItem("modify");
                        toolBar.disableItem("delete");
                        toolBar.disableItem("commit");
                        toolBar.disableItem("repeal");
                }
            }
        }
    }

    $('#combomaterial').change(getMaterialGrade)

    function getMaterialGrade() {
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
    }

    function getDataList() {
        if (ladeBillID != null) {
            sqlStr = "select [LadeBill].[LadeBillID], [Customer].[CustomerName], [Material].[MaterialName], [LadeBill].[quotedPrice], Convert(decimal(18,2),[PlanQuantity]), Convert(decimal(18,2),[LadeBill].[actualQuantity]), [LadeBill].[plateNumber], convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate, [LadeBill].[destination], [LadeBill].[state] from [LadeBill] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] where [LadeBill].[LadeBillID] = " + ladeBillID;
        }
        else {
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

            sqlStr = "select [LadeBill].[LadeBillID], [Customer].[CustomerName], [Material].[MaterialName], [LadeBill].[quotedPrice], Convert(decimal(18,2),[PlanQuantity]), Convert(decimal(18,2),[LadeBill].[actualQuantity]), [LadeBill].[plateNumber], convert(nvarchar(10),[LadeBill].[ladeDate],120) as ladeDate, [LadeBill].[destination], [LadeBill].[state] from [LadeBill] join [Customer] on [LadeBill].[customerID] = [Customer].[customerID] join [Material] on [LadeBill].[materialID] = [Material].[materialID] where [ContractID] < 0 and [LadeBill].[Agent] = '" + decodeURIComponent($.cookie('userTrueName')) + "'";
            sqlStr += " and [LadeBill].[billingTime] between '" + toolBar.getValue("beginbillingTime") + " 0:0:0' AND '" + toolBar.getValue("endbillingTime") + " 23:59:59' ";

            if (toolBar.getValue("txtcustomerSearch") != "") {
                sqlStr += " and [Customer].[CustomerName] like '%" + toolBar.getValue("txtcustomerSearch") + "%'";
            }

            //if (toolBar.getItemText("combomaterialSearch") != "产品") {
            //    sqlStr += " and [Material].[MaterialName] = '" + toolBar.getItemText("combomaterialSearch") + "'";
            //}

            if ($("#combomaterialSearch").val() != "-1") {
                sqlStr += " and [Material].[MaterialID] = " + $("#combomaterialSearch").val();
            }
        }

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push(toolBar.getInput("beginbillingTime"));

    dateboxArray.push(toolBar.getInput("endbillingTime"));

    dateboxArray.push("txtbillingTime");

    dateboxArray.push("txtladeDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

    $("#txtplanQuantity").blur(CalcJE);
    $("#txtquotedPrice").blur(CalcJE);
    $("#txtpipePrice").blur(CalcJE);

    function CalcJE() {
        var txt计划提货数量 = $("#txtplanQuantity").val();
        var txt挂牌单价 = $("#txtquotedPrice").val();
        var txt管输单价 = $("#txtpipePrice").val();
        var txt计划量总金额 = $("#txtplanTotal").val();
        var 挂牌单价 = 0;
        var 管输单价 = 0;
        var 单价 = 0;
        var 数量 = 0;
        var 金额 = 0;

        if (txt计划提货数量 != "") {

            if (rock.chknum(txt计划提货数量)) {
                数量 = parseFloat(txt计划提货数量);
            }
        }
        if (txt挂牌单价 != "") {
            if (rock.chknum(txt挂牌单价)) {
                挂牌单价 = parseFloat(txt挂牌单价);
            }
        }

        if (txt管输单价 != "") {
            if (rock.chknum(txt管输单价)) {
                管输单价 = parseFloat(txt管输单价);
            }
        }

        单价 = 挂牌单价 + 管输单价;
        金额 = 单价 * 数量;

        $("#txtplanTotal").val(Number(金额).toFixed(2).toString());
    }

})