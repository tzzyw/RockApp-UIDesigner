$(function () {
    var toolBar, editState, detailEditState, detailForm, detailGrid, billState, uIState,
    mainReferGrid, mainReferForm,
    serverDate = null,
    purchasePlan = null,
    purchasePlanDetail = null,
    detailObjList = [],
    materialDataList = new rock.JsonList(),
    purchasePlanDetailDataList = new rock.JsonList(),
    editImg = "/resource/dhtmlx/codebase/imgs/edit.gif",
    deleteImg = "/resource/dhtmlx/codebase/imgs/delete.gif",
    purchasePlanID = decodeURI($.getUrlParam("purchasePlanID"));

    //加载JS脚本库域服务和对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,PurchasePlan,PurchasePlanDetail,Material,ITestService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        //获取服务器当前日期
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
                //var date = new Date(serverDate.replace('-', '/'));
                //beginDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-1';
                //$("#txtApplyDate").val(serverDate);
            }(ISystemService.getServerDate.resultValue));
        }
        if (purchasePlanID != "null") {
            uIState = "Browsing";
            editState = "modify";
            $("#txtPurchasePlanID").val(purchasePlanID);
            ITestService.getPurchasePlanByID.purchasePlanID = purchasePlanID;
            rock.AjaxRequest(ITestService.getPurchasePlanByID, rock.exceptionFun);
            if (ITestService.getPurchasePlanByID.success) {
                (function (e) {
                    purchasePlan = e;
                    if (e != null) {
                        billState = purchasePlan.state;
                        fillPageItem();
                    }
                }(ITestService.getPurchasePlanByID.resultValue));
            }
        }
        else {
            addInit();
        }

        //页面按钮状态处理
        refreshToolBarState();

    });

    //初始化参数页面工具条
    toolBar = new dhtmlXToolbarObject("toolBar");
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addButton("add", 0, "新增");
    toolBar.addSeparator("001", 1);
    toolBar.addButton("renounce", 2, "放弃");
    toolBar.addSeparator("002", 3);
    toolBar.addButton("modify", 4, "修改");
    toolBar.addSeparator("003", 5);
    toolBar.addButton("save", 6, "保存");
    toolBar.addSeparator("004", 7);
    toolBar.addButton("delete", 7, "删除");
    toolBar.addSeparator("005", 8);
    toolBar.addButton("submit", 9, "提交");
    toolBar.addSeparator("006", 10);
    toolBar.addButton("repeal", 11, "撤销");
    toolBar.addSeparator("007", 12);
    toolBar.addButton("addDetail", 13, "新增明细");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "add":
                addInit();
                break;
            case "renounce":
                if (purchasePlan) {
                    //新增和修改的不同处理
                    if (editState == "add") {
                        uIState = "Init";
                        clearPageItem();
                    }
                    else {
                        uIState = "Browsing";
                        billState = purchasePlan.state;
                    }
                }
                else {
                    uIState = "Init";
                    clearPageItem();
                }
                refreshToolBarState();
                break;
            case "modify":
                uIState = "Editing";
                editState = "modify";
                ITestService.getPurchasePlanByID.purchasePlanID = $("#txtPurchasePlanID").val();
                rock.AjaxRequest(ITestService.getPurchasePlanByID, rock.exceptionFun);
                if (ITestService.getPurchasePlanByID.success) {
                    (function (e) {
                        purchasePlan = e;
                    }(ITestService.getPurchasePlanByID.resultValue));
                    fillPageItem();
                    refreshToolBarState();
                }
                break;
            case "save":
                //数据校验
                if ($("#txtPurchasePlanCode").val() == '') {
                    alert("采购计划编码不能为空!");
                    return false;
                }
                if ($.trim($("#txtPurchasePlanName").val()) == "") {
                    alert("计划名称不能为空!");
                    return false;
                }
                if ($.trim($("#txtApplyDate").val()) == "") {
                    alert("提报日期不能为空!");
                    return false;
                }
                if ($.trim($("#txtHandler").val()) == "") {
                    alert("提报人不能为空!");
                    return false;
                }
                if ($.trim($("#txtApplyDate").val()) != "") {
                    if (!rock.chkdate($("#txtApplyDate").val(), "-")) {
                        alert("提报日期格式不正确,正确格式为 2010-10-10！");
                        return false;
                    }
                }
                if (purchasePlanDetailDataList.rows.length == 0) {
                    alert("采购计划必须要有明细!");
                    return false;
                }

                if (editState == "add") {
                    purchasePlan = PurchasePlanClass.createInstance();
                    purchasePlan.state = "已创建";
                }
                else {
                    if (purchasePlan == null) {
                        alert("修改的采购计划不存在,请检查!");
                        return false;
                    }
                }
                purchasePlan.purchasePlanID = $("#txtPurchasePlanID").val();
                purchasePlan.purchasePlanCode = $("#txtPurchasePlanCode").val();
                purchasePlan.purchasePlanName = $("#txtPurchasePlanName").val();
                purchasePlan.applyDate = $("#txtApplyDate").val();

                purchasePlan.handler = $("#txtHandler").val();
                purchasePlan.comment = $("#txtComment").val();
                purchasePlan.creater = decodeURIComponent($.cookie('userTrueName'));
                purchasePlan.purchasePlanDetailList = detailObjList;
                //处理采购计划明细部分
                if (editState == "add") {
                    ITestService.addPurchasePlan.purchasePlan = purchasePlan;
                    rock.AjaxRequest(ITestService.addPurchasePlan, rock.exceptionFun);
                    if (ITestService.addPurchasePlan.success) {
                        (function (e) {
                            alert("添加成功！");
                        }(ITestService.addPurchasePlan.resultValue));
                    }
                    else {
                        return;
                    }
                }
                else {
                    ITestService.modifyPurchasePlan.purchasePlan = purchasePlan;
                    rock.AjaxRequest(ITestService.modifyPurchasePlan, rock.exceptionFun);
                    if (ITestService.modifyPurchasePlan.success) {
                        (function (e) {
                            alert("修改成功！");
                        }(ITestService.modifyPurchasePlan.resultValue));
                    }
                    else {
                        return;
                    }
                }
                billState = "已创建";
                uIState = "Browsing";
                refreshToolBarState();
                break;
            case "delete":
                ITestService.deletePurchasePlan.purchasePlanID = purchasePlan.purchasePlanID;
                rock.AjaxRequest(ITestService.deletePurchasePlan, rock.exceptionFun);
                if (ITestService.deletePurchasePlan.success) {
                    (function (e) {
                        uIState = "Init";
                        clearPageItem();
                        refreshToolBarState();
                    }(ITestService.deletePurchasePlan.resultValue));
                }
                break;
            case "submit":
                ITestService.submitPurchasePlan.purchasePlanID = purchasePlan.purchasePlanID;
                rock.AjaxRequest(ITestService.submitPurchasePlan, rock.exceptionFun);
                if (ITestService.submitPurchasePlan.success) {
                    (function (e) {
                        purchasePlan.state = "已提交";

                    }(ITestService.submitPurchasePlan.resultValue));
                }
                billState = "已提交";
                uIState = "Browsing";
                refreshToolBarState();
                break;
            case "repeal":
                ITestService.repealPurchasePlan.purchasePlanID = purchasePlan.purchasePlanID;
                rock.AjaxRequest(ITestService.repealPurchasePlan, rock.exceptionFun);
                if (ITestService.repealPurchasePlan.success) {
                    (function (e) {
                        purchasePlan.state = "已创建";

                    }(ITestService.repealPurchasePlan.resultValue));
                }
                billState = "已创建";
                uIState = "Browsing";
                refreshToolBarState();
                break;
            case "addDetail":
                $("#editFormTitle").text("添加采购计划明细");
                $("#txtPurchasePlanDetailID").val("");
                $("#txtMaterialID").val("");
                $("#txtMaterial").val("");
                $("#txtQuantity").val(1);
                $("#txtDetailComment").val("");
                $("#txtMaterialLevel").val("");
                detailEditState = "add";
                showDetailForm();
                break;

        }
    });

    //初始化采购计划明细表格
    detailGrid = new dhtmlXGridObject('detailGrid');
    detailGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    detailGrid.setHeader("序号,,,修改,删除,物料名称,物料等级,计划数量,备注");
    detailGrid.setInitWidths("40,0,0,40,40,120,80,80,*");
    detailGrid.setColAlign("center,left,left,center,center,left,left,left,left");
    detailGrid.setSkin("dhx_skyblue");
    detailGrid.setColSorting("na,na,na,str,str,str,str,str,str");
    detailGrid.setColTypes("cntr,ro,ro,img,img,ro,ro,ro,ro");
    detailGrid.enableDistributedParsing(true, 20);
    detailGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        if (billState == "已创建" && uIState == "Editing") {
            if (cIndex == 3) {
                for (var i = 0; i < purchasePlanDetailDataList.rows.length; i++) {
                    if (purchasePlanDetailDataList.rows[i].id == rowID) {
                        $("#txtPurchasePlanDetailID").val(rowID);
                        $("#txtMaterialID").val(purchasePlanDetailDataList.rows[i].data[2]);
                        $("#txtMaterial").val(purchasePlanDetailDataList.rows[i].data[5]);
                        $("#txtMaterialLevel").val(purchasePlanDetailDataList.rows[i].data[6]);
                        $("#txtQuantity").val(purchasePlanDetailDataList.rows[i].data[7]);
                        $("#txtDetailComment").val(purchasePlanDetailDataList.rows[i].data[8]);
                    }
                }
                detailEditState = "modify";
                showDetailForm();
            }
            if (cIndex == 4) {
                if (confirm("您确定要删除选定的行吗?")) {
                    //两种情况主表新增的直接删除,主表是修改的:又分两种情况,新增的直接删除,修改的,标记为删除
                    if (editState == "add") {
                        for (var i = 0; i < purchasePlanDetailDataList.rows.length; i++) {
                            if (purchasePlanDetailDataList.rows[i].id == rowID) {
                                purchasePlanDetailDataList.rows.splice(i, 1);
                                detailGrid.deleteRow(rowID);
                                break;
                            }
                        }
                        for (var i = 0; i < detailObjList.length; i++) {
                            if (detailObjList[i].purchasePlanDetailID == rowID) {
                                detailObjList.splice(i, 1);
                            }
                        }
                    }
                    else {
                        for (var i = 0; i < purchasePlanDetailDataList.rows.length; i++) {
                            if (purchasePlanDetailDataList.rows[i].id == rowID) {
                                purchasePlanDetailDataList.rows.splice(i, 1);
                                detailGrid.deleteRow(rowID);
                                break;
                            }
                        }
                        for (var i = 0; i < detailObjList.length; i++) {
                            if (detailObjList[i].purchasePlanDetailID == rowID) {
                                if (detailObjList[i].editState == "add") {
                                    detailObjList.splice(i, 1);
                                }
                                else {
                                    detailObjList[i].editState = "delete";
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    detailGrid.init();

    //初始化物料选择表格
    mainReferGrid = new dhtmlXGridObject('mainReferGrid');
    mainReferGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    mainReferGrid.setSkin("dhx_skyblue");
    mainReferGrid.setHeader("序号,,物料名称,物料等级");
    mainReferGrid.setInitWidths("45,0,150,*");
    mainReferGrid.setColAlign("center,left,left,left");
    mainReferGrid.setColTypes("cntr,ro,ro,ro");
    mainReferGrid.setColSorting("na,na,str,str");
    mainReferGrid.enableDistributedParsing(true, 20);
    mainReferGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        refreshMaterialFormBtnState();
        return true;
    });
    mainReferGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        $("#txtMaterialID").val(rowID);
        $("#txtMaterial").val(mainReferGrid.cells(rowID, 2).getValue());
        $("#txtMaterialLevel").val(mainReferGrid.cells(rowID, 3).getValue());
        $("#txtQuantity").val(1);
        $("#txtDetailComment").val("");
        hideMainReferForm();
    });
    mainReferGrid.init();

    //采购计划明细弹窗
    detailForm = $("#detailForm");
    detailForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        var top = $("#detailForm").offset().top;
        var left = $("#detailForm").offset().left;

        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                detailForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
                mainReferForm.css({ "left": (e.pageX - iDiffX + 126), "top": (e.pageY - iDiffY + 87) });
            });
        }
        if (e.srcElement.id != "txtMaterial") {
            hideMainReferForm();
        }
    });
    detailForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideDetailForm();
    function hideDetailForm() {
        detailForm.css({ top: 200, left: -1300 }).hide();
        detailForm.css("visibility", "visible");
    }
    function showDetailForm() {
        detailForm.css({ top: 100, left: 180 }).show();
    }

    //采购计划明细取消
    $("#btnDetailForm_Cancle").click(function () {
        hideDetailForm();
        hideMainReferForm();
    });
    //采购计划明细关闭
    $("#imgDetailForm_Close").click(function () {
        hideDetailForm();
        hideMainReferForm();
    });

    //采购计划明细确定
    $("#btnDetailForm_Save").click(function () {
        if ($.trim($("#txtMaterialID").val()) == '') {
            alert('物料不能为空!');
            return false;
        }
        if ($.trim($("#txtQuantity").val()) == '') {
            alert('计划数量不能为空!');
            return false;
        }
        if (!rock.chknum($("#txtQuantity").val())) {
            alert('计划数量数据格式不正确!');
            return false;
        }

        //分两种情况判断,新增的采购计划明细不直接保存;修改的采购计划明细直接保存到数据库
        if (editState == "add") {
            if (detailEditState == "add") {
                purchasePlanDetail = PurchasePlanDetailClass.createInstance();
                //获取采购计划明细ID
                ISystemService.getNextID.typeName = 'PurchasePlanDetail';
                rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                if (ISystemService.getNextID.success) {
                    (function (e) {
                        purchasePlanDetail.purchasePlanDetailID = e.value;
                    }(ISystemService.getNextID.resultValue))
                }
                purchasePlanDetail.purchasePlanID = $("#txtPurchasePlanID").val();
                purchasePlanDetail.materialID = $("#txtMaterialID").val();
                purchasePlanDetail.quantity = $("#txtQuantity").val();
                purchasePlanDetail.comment = $("#txtDetailComment").val();
                purchasePlanDetail.editState = "add";
                detailObjList.push(purchasePlanDetail);

                var dictData = new rock.JsonData($("#txtPurchasePlanDetailID").val());
                dictData.data.push(null);
                dictData.data.push($("#txtPurchasePlanDetailID").val());
                dictData.data.push($("#txtMaterialID").val());
                dictData.data.push(editImg);
                dictData.data.push(deleteImg);
                dictData.data.push($("#txtMaterial").val());
                dictData.data.push($("#txtMaterialLevel").val());
                dictData.data.push($("#txtQuantity").val());
                dictData.data.push($("#txtDetailComment").val());
                purchasePlanDetailDataList.rows.push(dictData);
            }
            else {
                for (var i = 0; i < purchasePlanDetailDataList.rows.length; i++) {
                    if (purchasePlanDetailDataList.rows[i].id.toString() == $("#txtPurchasePlanDetailID").val()) {
                        purchasePlanDetailDataList.rows[i].data[1] = $("#txtPurchasePlanDetailID").val();
                        purchasePlanDetailDataList.rows[i].data[2] = $("#txtMaterialID").val();
                        purchasePlanDetailDataList.rows[i].data[3] = editImg;
                        purchasePlanDetailDataList.rows[i].data[4] = deleteImg;
                        purchasePlanDetailDataList.rows[i].data[5] = $("#txtMaterial").val();
                        purchasePlanDetailDataList.rows[i].data[6] = $("#txtMaterialLevel").val();
                        purchasePlanDetailDataList.rows[i].data[7] = $("#txtQuantity").val();
                        purchasePlanDetailDataList.rows[i].data[8] = $("#txtDetailComment").val("");

                        for (var j = 0; j < detailObjList.length; j++) {
                            if (detailObjList[j].purchasePlanDetailID == $("#txtPurchasePlanDetailID").val()) {
                                detailObjList[j].materialID = $("#txtMaterialID").val();
                                detailObjList[j].quantity = $("#txtQuantity").val();
                                detailObjList[j].comment = $("#txtDetailComment").val();
                                detailObjList[j].editState = "add";
                            }
                        }
                    }
                }
            }
            detailGrid.clearAll();
            detailGrid.parse(purchasePlanDetailDataList, "json");
            hideDetailForm();
            hideMainReferForm();
        }
        else {
            if (detailEditState == "add") {
                purchasePlanDetail = PurchasePlanDetailClass.createInstance();
                //获取采购计划明细ID
                ISystemService.getNextID.typeName = 'PurchasePlanDetail';
                rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                if (ISystemService.getNextID.success) {
                    (function (e) {
                        purchasePlanDetail.purchasePlanDetailID = e.value;
                    }(ISystemService.getNextID.resultValue))
                }

                purchasePlanDetail.purchasePlanID = $("#txtPurchasePlanID").val();
                purchasePlanDetail.materialID = $("#txtMaterialID").val();
                purchasePlanDetail.quantity = $("#txtQuantity").val();
                purchasePlanDetail.comment = $("#txtDetailComment").val();
                purchasePlanDetail.editState = "add";
                detailObjList.push(purchasePlanDetail);

                var dictData = new rock.JsonData($("#txtPurchasePlanDetailID").val());
                dictData.data.push(null);
                dictData.data.push($("#txtPurchasePlanDetailID").val());
                dictData.data.push($("#txtMaterialID").val());
                dictData.data.push(editImg);
                dictData.data.push(deleteImg);
                dictData.data.push($("#txtMaterial").val());
                dictData.data.push($("#txtMaterialLevel").val());
                dictData.data.push($("#txtQuantity").val());
                dictData.data.push($("#txtDetailComment").val());
                purchasePlanDetailDataList.rows.push(dictData);

            }
            else {
                for (var i = 0; i < purchasePlanDetailDataList.rows.length; i++) {
                    if (purchasePlanDetailDataList.rows[i].id.toString() == $("#txtPurchasePlanDetailID").val()) {
                        purchasePlanDetailDataList.rows[i].data[1] = $("#txtPurchasePlanDetailID").val();
                        purchasePlanDetailDataList.rows[i].data[2] = $("#txtMaterialID").val();
                        purchasePlanDetailDataList.rows[i].data[3] = editImg;
                        purchasePlanDetailDataList.rows[i].data[4] = deleteImg;
                        purchasePlanDetailDataList.rows[i].data[5] = $("#txtMaterial").val();
                        purchasePlanDetailDataList.rows[i].data[6] = $("#txtMaterialLevel").val();
                        purchasePlanDetailDataList.rows[i].data[7] = $("#txtQuantity").val();
                        purchasePlanDetailDataList.rows[i].data[8] = $("#txtDetailComment").val();

                        for (var j = 0; j < detailObjList.length; j++) {
                            if (detailObjList[j].purchasePlanDetailID == $("#txtPurchasePlanDetailID").val()) {
                                detailObjList[j].materialID = $("#txtMaterialID").val();
                                detailObjList[j].quantity = $("#txtQuantity").val();
                                detailObjList[j].comment = $("#txtDetailComment").val();
                                detailObjList[j].editState = "modify";
                            }
                        }
                    }
                }
            }
            detailGrid.clearAll();
            detailGrid.parse(purchasePlanDetailDataList, "json");
            hideDetailForm();
            hideMainReferForm();
        }
    });

    //物料选择弹窗
    mainReferForm = $("#mainReferForm");
    hideMainReferForm();
    function hideMainReferForm() {
        mainReferForm.css({ top: 200, left: -1300 }).hide();
        mainReferForm.css("visibility", "visible");
    }
    function showMainReferForm() {
        var top = $("#txtMaterial").offset().top;
        var left = $("#txtMaterial").offset().left;
        mainReferForm.css({ top: top + 23, left: left }).show();
    }
    //物料选择弹窗确定
    $("#mainRefer_Save").click(function () {
        var materialID = mainReferGrid.getSelectedRowId();
        $("#txtMaterialID").val(materialID);
        $("#txtMaterial").val(mainReferGrid.cells(materialID, 2).getValue());
        $("#txtMaterialLevel").val(mainReferGrid.cells(materialID, 3).getValue());
        hideMainReferForm();
    });
    //物料选择弹窗取消
    $("#mainRefer_Cancle").click(function () {
        $("#txtMaterialID").val("");
        $("#txtMaterial").val("");
        $("#txtQuantity").val(1);
        $("#txtDetailComment").val("");
        $("#txtMaterial").val("");
        $("#txtMaterialLevel").val("");
        hideMainReferForm();
    });

    //物料选择弹窗autocomplete快速搜索处理
    $("#txtMaterial").keyup(function () {
        autoComplete($("#txtMaterial").val());
        showMainReferForm();
    });

    function autoComplete(SearchCode) {
        ISystemService.execQuery.sqlString = "SELECT [MaterialID],[MaterialName],[MaterialLevel] FROM [Material] where MaterialName like '%" + $("#txtMaterial").val() + "%' or MaterialLevel like '%" + $("#txtMaterial").val() + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                materialDataList.rows = [];
                mainReferGrid.clearAll();
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    listdata.data[1] = rowResult[0].value;
                    listdata.data[2] = rowResult[1].value;
                    listdata.data[3] = rowResult[2].value;
                    materialDataList.rows.push(listdata);
                }
                mainReferGrid.parse(materialDataList, "json");
                refreshMaterialFormBtnState();
            }(ISystemService.execQuery.resultValue));
        }
    }

    function refreshMaterialFormBtnState() {
        if (mainReferGrid.getSelectedRowId()) {
            $("#mainRefer_Save").removeAttr("disabled");
        }
        else {
            $("#mainRefer_Save").attr("disabled", true);
        }
    }

    function fillPageItem() {
        if (purchasePlan) {
            $("#txtPurchasePlanID").val(purchasePlan.purchasePlanID);
            $("#txtPurchasePlanCode").val(purchasePlan.purchasePlanCode);
            $("#txtApplyDate").val(purchasePlan.applyDate.split(" ")[0]);
            $("#txtHandler").val(purchasePlan.handler);
            $("#txtPurchasePlanName").val(purchasePlan.purchasePlanName);
            $("#txtComment").val(purchasePlan.comment);

            //填充明细列表 
            detailObjList = [];
            purchasePlanDetailDataList.rows = [];
            for (var i = 0; i < purchasePlan.purchasePlanDetailList.length; i++) {
                var tempPurchasePlanDetail = purchasePlan.purchasePlanDetailList[i];
                var dictData = new rock.JsonData(tempPurchasePlanDetail.purchasePlanDetailID);
                var material = null;
                dictData.data.push(null);
                dictData.data.push(tempPurchasePlanDetail.purchasePlanDetailID);
                dictData.data.push(tempPurchasePlanDetail.materialID);
                dictData.data.push(editImg);
                dictData.data.push(deleteImg);
                //获取物料
                ISystemService.getDynObjectByID.dynObjectID = tempPurchasePlanDetail.materialID;
                ISystemService.getDynObjectByID.structName = "Material";
                rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                if (ISystemService.getDynObjectByID.success) {
                    (function (e) {
                        material = e;
                    }(ISystemService.getDynObjectByID.resultValue));
                }
                dictData.data.push(material.materialName);
                dictData.data.push(material.materialLevel);
                dictData.data.push(tempPurchasePlanDetail.quantity);
                dictData.data.push(tempPurchasePlanDetail.comment);
                purchasePlanDetailDataList.rows.push(dictData);
                detailObjList.push(tempPurchasePlanDetail);
            }
            detailGrid.clearAll();
            detailGrid.parse(purchasePlanDetailDataList, "json");
        }
    }
    function clearPageItem() {
        $("#txtPurchasePlanID").val("");
        $("#txtPurchasePlanCode").val("");
        $("#txtApplyDate").val("");
        $("#txtPurchasePlanName").val("");
        $("#txtComment").val("");
        $("#txtHandler").val("");
        //清空明细列表
        detailGrid.clearAll();
        purchasePlanDetailDataList.rows = [];
        detailObjList = [];
    }

    function refreshToolBarState() {
        switch (uIState) {
            case "Init":
                toolBar.enableItem("add");
                toolBar.disableItem("renounce");
                toolBar.disableItem("modify");
                toolBar.disableItem("save");
                toolBar.disableItem("delete");
                toolBar.disableItem("submit");
                toolBar.disableItem("repeal");
                toolBar.disableItem("addDetail");
                break;
            case "Editing":
                toolBar.disableItem("add");
                toolBar.enableItem("renounce");
                toolBar.disableItem("modify");
                toolBar.enableItem("save");
                toolBar.disableItem("submit");
                toolBar.disableItem("repeal");
                //根据单据状态判断
                if (billState == "已创建") {
                    toolBar.enableItem("addDetail");
                    //修改状态可以删除,新增状态不可以删除
                    if (editState == "add") {
                        toolBar.disableItem("delete");
                    }
                    else {
                        toolBar.enableItem("delete");
                    }
                }
                else {
                    toolBar.disableItem("addDetail");
                    toolBar.disableItem("delete");
                }
                break;
            case "Browsing":
                toolBar.enableItem("add");
                toolBar.disableItem("renounce");
                toolBar.disableItem("save");
                toolBar.disableItem("addDetail");
                //根据单据状态判断
                if (billState == "已创建") {
                    toolBar.enableItem("modify");
                    toolBar.enableItem("delete");
                    toolBar.enableItem("submit");
                    toolBar.disableItem("repeal");
                }
                if (billState == "已提交") {
                    toolBar.disableItem("modify");
                    toolBar.disableItem("delete");
                    toolBar.disableItem("submit");
                    toolBar.enableItem("repeal");
                }
                break;
        }
    }

    function addInit() {
        clearPageItem();
        ISystemService.getNextID.typeName = 'PurchasePlan';
        rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
        if (ISystemService.getNextID.success) {
            (function (e) {
                $("#txtPurchasePlanID").val(e.value);
            }(ISystemService.getNextID.resultValue))
        }
        ISystemService.getBillNO.billType = "采购计划";
        rock.AjaxRequest(ISystemService.getBillNO, rock.exceptionFun);
        if (ISystemService.getBillNO.success) {
            (function (e) {
                $("#txtPurchasePlanCode").val(e.value);
            }(ISystemService.getBillNO.resultValue));
        }
        $("#txtApplyDate").val(serverDate);
        editState = "add";
        uIState = "Editing";
        billState = "已创建";
        refreshToolBarState();
    }

    //日期控件测试
    var dateboxArray = [];
    dateboxArray.push("txtApplyDate");
    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})
