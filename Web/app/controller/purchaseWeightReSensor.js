
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editForm, dictDataList, sqlStr, serverDate, platName,
      measure = null,
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

        //处理初始化加载数据

        getSensorList();
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addButton("refresh", null, "刷新列表");
    toolBar.addSeparator("sepaudit", null);
    toolBar.addButton("audit", null, "审核");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "refresh":
                getSensorList();
                refreshToolBarState();
                break;
            case "audit":
                $("#formTitle").text("审核采购计量单");
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
                        $("#txtcustomer").val(listGrid.cells(checked, 3).getValue());
                        $("#txtmaterial").val(listGrid.cells(checked, 4).getValue());
                        $("#txtmeasureNum").val(measure.measureNum);
                        $("#txttare").val(measure.tare);
                        $("#txttareTime").val(measure.tareTime);
                        $("#txtgross").val(measure.gross);
                        $("#txtgrossTime").val(measure.grossTime);
                        $("#txtnetWeight").val(measure.netWeight);
                        $("#txtlightOperator").val(measure.lightOperator);
                        $("#txtheavyOperator").val(measure.heavyOperator);
                        $("#txtplanQuantity").val(measure.planQuantity);
                        //$("#btn_Save")[0].innerText = "审核";
                        showEditForm();
                    }
                    else {
                        alert("请仅选择一条要审核的行!");
                    }
                }
                else {
                    alert("请选择要审核的行!");
                }
                break;
        }
    });


    //初始化计量单列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,计量单编号,客户名称,物料名称,车号,状态,净重");
    listGrid.setInitWidths("40,0,120,200,150,120,75,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        $("#formTitle").text("审核采购计量单");
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
        $("#txtcustomer").val(listGrid.cells(rowID, 3).getValue());
        $("#txtmaterial").val(listGrid.cells(rowID, 4).getValue());
        $("#txtmeasureNum").val(measure.measureNum);
        $("#txttare").val(measure.tare);
        $("#txttareTime").val(measure.tareTime);
        $("#txtgross").val(measure.gross);
        $("#txtgrossTime").val(measure.grossTime);
        $("#txtnetWeight").val(measure.netWeight);
        $("#txtlightOperator").val(measure.lightOperator);
        $("#txtheavyOperator").val(measure.heavyOperator);
        $("#txtplanQuantity").val(measure.planQuantity);
        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(275);
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
        measure.state = "已过皮重";
        ISystemService.modifyDynObject.dynObject = measure;
        rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
        if (ISystemService.modifyDynObject.success) {
            $("#txtcustomer").val("");
            $("#txtmeasureNum").val("");
            $("#txtmaterial").val("");
            $("#txttare").val("");
            $("#txttareTime").val("");
            $("#txtgross").val("");
            $("#txtgrossTime").val("");
            $("#txtnetWeight").val("");
            $("#txtlightOperator").val("");
            $("#txtheavyOperator").val("");
            $("#txtplanQuantity").val("");
            getSensorList();
            refreshToolBarState();
            hideEditForm();
            alert("您选择的计量单弃审完毕!");
        }
    });

    function getSensorList() {
        sqlStr = "select top 100 [Measure].[MeasureID], [Measure].[measureNum], [Customer].[CustomerName], [Material].[MaterialName], [Measure].[vehicleNum], [Measure].[State], [Measure].[netWeight] from [Measure] join [Customer] on [Measure].[customerID] = [Customer].[customerID] join [Material] on [Measure].[materialID] = [Material].[materialID] and [State] = '计量提交' and MeasureType = '采购称重' and Closed = '0' and Platform='" + platName + "' ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }

    //加载弹窗Div

    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("audit");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("audit");
            }
            else {
                toolBar.enableItem("audit");
            }
        }
    }
})