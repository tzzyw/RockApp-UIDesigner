
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, editState, detailEditState, detailForm, detailGrid, mainReferGrid, billState, uIState, materialGrid, materialForm, serverDate, sqlStr,
	purchasePlan = null,
	purchasePlanDetail = null,
	detailObjList = [],
	detailDataList = new rock.JsonList(),
	mainReferGridDataList = new rock.JsonList(),
	editImg = "/resource/dhtmlx/codebase/imgs/edit.gif",
    deleteImg = "/resource/dhtmlx/codebase/imgs/delete.gif",
	masterEditItem = $("#masterEditItem"),
	detailForm = $("#detailForm"),
	detailEditItem = $("#detailEditItem"),
	purchasePlanID = decodeURI($.getUrlParam("purchasePlanID"));
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,PurchasePlan,PurchasePlanDetail,Material,ITestService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //获取服务器当前日期
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
            }(ISystemService.getServerDate.resultValue));
        }

        //初始化主表实体参照






        //初始明细表实体参照



        //初始化主表通用参照






        //初始化明细表通用参照




        //填充实体弹窗参照树


        //填充通用弹窗参照树

        //填充快查参照表格
        mainReferComplete("");


        if (purchasePlanID != "null") {
            uIState = "Browsing";
            editState = "modify";
            $("#txtpurchasePlanID").val(purchasePlanID);
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

    //初始化工具条
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
                ITestService.getPurchasePlanByID.purchasePlanID = $("#txtpurchasePlanID").val();
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
                if (detailDataList.rows.length == 0) {
                    alert("采购计划必须要有明细!");
                    return false;
                }
                if (purchasePlan == null) {
                    alert("修改的采购计划不存在,请检查!");
                    return false;
                }
                if (!purchasePlan.ValidateValue()) {
                    return;
                }

                purchasePlan.purchasePlanCode = $("#txtpurchasePlanCode").val();


                purchasePlan.purchasePlanName = $("#txtpurchasePlanName").val();


                purchasePlan.applyDate = $("#txtapplyDate").val();

                purchasePlan.handler = $("#txthandler").val();


                if ($.trim($("#txtcomment").val()) != '') {
                    purchasePlan.comment = $("#txtcomment").val();
                }
                else {
                    purchasePlan.comment = null;
                }


                purchasePlan.creater = decodeURIComponent($.cookie('userTrueName'));
                purchasePlan.purchasePlanDetailList = detailObjList;
                //处理明细部分
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
                $("#detailFormTitle").text("添加采购计划明细");


                $("#txtmaterialName").val("");


                $("#txtmaterialCategory").val("");


                $("#txtmaterialLevel").val("");


                $("#txtproducer").val("");


                detailEditState = "add";
                showDetailForm();
                break;
        }
    });

    //处理主表编辑项

    tableString = '<table style="width: 100%"><tr><td class="label" style="width: 6%">采购计划编码</td><td class="inputtd" style="width: 14%"><input id="txtpurchasePlanCode" class="smallInput" type="text" /></td><td class="label" style="width: 6%">计划名称</td><td class="inputtd" style="width: 14%"><input id="txtpurchasePlanName" class="smallInput" type="text" /></td><td class="label" style="width: 6%">提报日期</td><td class="inputtd" style="width: 14%"><input id="txtapplyDate" class="smallInput" type="text" /></td></tr><tr><td class="label" style="width: 6%">提报人</td><td class="inputtd" style="width: 14%"><input id="txthandler" class="smallInput" type="text" /></td><td class="label" style="width: 6%">备注</td><td class="inputtd" style="width: 14%"><input id="txtcomment" class="smallInput" type="text" /></td><td class="label" style="width: 6%"></td><td class="inputtd" style="width: 14%"></td></tr></table>';
    masterEditItem.html(tableString);


    //处理明细表编辑项

    detailForm.height(275);
    tableString = '<table style="width: 98%"><tr><td class="label">物料名称</td><td class="inputtd"><input id="txtmaterialName" class="smallInput" type="text" /><input id="txtpurchasePlanID" type="hidden" /><input id="txtmaterialID" type="hidden" /></td></tr><tr><td class="label">物料类别</td><td class="inputtd"><input id="txtmaterialCategory" class="smallInput" type="text" /></td></tr><tr><td class="label">物料等级</td><td class="inputtd"><input id="txtmaterialLevel" class="smallInput" type="text" /></td></tr><tr><td class="label">生产厂商</td><td class="inputtd"><input id="txtproducer" class="smallInput" type="text" /></td></tr><tr><td class="label">数量</td><td class="inputtd"><input id="txtquantity" class="smallInput" type="text" /></td></tr><tr><td class="label">备注</td><td class="inputtd"><input id="txtdetailComment" class="smallInput" type="text" /></td></tr></table>';
    detailEditItem.html(tableString);


    //初始化明细表格
    detailGrid = new dhtmlXGridObject("detailGrid");
    detailGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    detailGrid.setSkin("dhx_skyblue");


    detailGrid.setHeader("序号,,,修改,删除,物料名称,物料类别,物料等级,生产厂商,数量,备注");
    detailGrid.setInitWidths("40,0,0,40,40,100,80,80,150,40,*");
    detailGrid.setColAlign("center,left,left,center,center,left,left,left,left,left,left");
    detailGrid.setColSorting("na,na,na,na,na,str,str,str,str,str,str");
    detailGrid.setColTypes("cntr,ro,ro,img,img,ro,ro,ro,ro,ro,ro");
    detailGrid.enableDistributedParsing(true, 20);
    detailGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        if (billState == "已创建" && uIState == "Editing") {
            if (cIndex == 3) {
                for (var i = 0; i < detailDataList.rows.length; i++) {
                    if (detailDataList.rows[i].id == rowID) {
                        $("#txtpurchasePlanDetailID").val(rowID);
                        $("#txtmaterialID").val(detailDataList.rows[i].data[2]);


                        $("#txtmaterialName").val(detailGrid.cells(rowID, 5).getValue());


                        $("#txtmaterialCategory").val(detailGrid.cells(rowID, 6).getValue());


                        $("#txtmaterialLevel").val(detailGrid.cells(rowID, 7).getValue());


                        $("#txtproducer").val(detailGrid.cells(rowID, 8).getValue());



                        $("#txtquantity").val(detailGrid.cells(rowID, 9).getValue());


                        $("#txtdetailComment").val(detailGrid.cells(rowID, 10).getValue());


                    }
                }
                detailEditState = "modify";
                showDetailForm();
            }
            if (cIndex == 4) {
                if (confirm("您确定要删除选定的行吗?")) {
                    //两种情况主表新增的直接删除,主表是修改的:又分两种情况,新增的直接删除,修改的,标记为删除
                    if (editState == "add") {
                        for (var i = 0; i < detailDataList.rows.length; i++) {
                            if (detailDataList.rows[i].id == rowID) {
                                detailDataList.rows.splice(i, 1);
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
                        for (var i = 0; i < detailDataList.rows.length; i++) {
                            if (detailDataList.rows[i].id == rowID) {
                                detailDataList.rows.splice(i, 1);
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

    //初始化主参照选择表格
    mainReferGrid = new dhtmlXGridObject('mainReferGrid');
    mainReferGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    mainReferGrid.setSkin("dhx_skyblue");

    mainReferGrid.setHeader("序号,,物料名称,生产厂商,物料类别,物料等级,备注");
    mainReferGrid.setInitWidths("40,0,100,150,80,80,*");
    mainReferGrid.setColAlign("center,left,left,left,left,left,left");
    mainReferGrid.setColSorting("na,na,str,str,str,str,str");
    mainReferGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro");
    mainReferGrid.enableDistributedParsing(true, 20);
    mainReferGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        return true;
    });
    mainReferGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        $("#txtmaterialID").val(rowID);

        $("#txtmaterialName").val(mainReferGrid.cells(rowID, 2).getValue());


        $("#txtmaterialCategory").val(mainReferGrid.cells(rowID, 4).getValue());


        $("#txtmaterialLevel").val(mainReferGrid.cells(rowID, 5).getValue());


        $("#txtproducer").val(mainReferGrid.cells(rowID, 3).getValue());


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
        if (e.srcElement.id != "txtmaterialName") {
            hideMainReferForm();
        }


    });
    detailForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideDetailForm();
    function hideDetailForm() {
        detailForm.css({ top: 200, left: -1300 }).hide();
    }
    function showDetailForm() {
        detailForm.css({ top: 100, left: 180 }).show();
    }

    $("#btnDetailForm_Cancle").click(function () {
        hideDetailForm();

    });

    $("#imgDetailForm_Close").click(function () {
        hideDetailForm();

    });


    $("#btnDetailForm_Save").click(function () {
        if ($.trim($("#txtmaterialID").val()) == '') {
            alert('物料不能为空!');
            return false;
        }
        //分两种情况判断,新增的明细不直接保存;修改的明细直接保存到数据库
        if (editState == "add") {
            if (detailEditState == "add") {
                purchasePlanDetail = PurchasePlanDetailClass.createInstance();
                if (!purchasePlanDetail.ValidateValue()) {
                    return;
                }
                //获取明细ID
                ISystemService.getNextID.typeName = 'PurchasePlanDetail';
                rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                if (ISystemService.getNextID.success) {
                    (function (e) {
                        purchasePlanDetail.purchasePlanDetailID = e.value;
                    }(ISystemService.getNextID.resultValue))
                }

                purchasePlanDetail.purchasePlanID = $("#txtpurchasePlanID").val();
                purchasePlanDetail.materialID = $("#txtmaterialID").val();

                purchasePlanDetail.quantity = $("#txtquantity").val();


                if ($.trim($("#txtdetailComment").val()) != '') {
                    purchasePlanDetail.detailComment = $("#txtdetailComment").val();
                }
                else {
                    purchasePlanDetail.detailCommentID = null;
                }


                purchasePlanDetail.editState = "add";
                detailObjList.push(purchasePlanDetail);

                var dictData = new rock.JsonData(purchasePlanDetail.purchasePlanDetailID);
                dictData.data.push(null);
                dictData.data.push(purchasePlanDetail.purchasePlanDetailID);
                dictData.data.push($("#txtmaterialID").val());
                dictData.data.push(editImg);
                dictData.data.push(deleteImg);

                dictData.data.push($("#txtmaterialName").val());

                dictData.data.push($("#txtmaterialCategory").val());

                dictData.data.push($("#txtmaterialLevel").val());

                dictData.data.push($("#txtproducer").val());


                dictData.data.push($("#txtquantity").val());

                dictData.data.push($("#txtdetailComment").val());

                detailDataList.rows.push(dictData);
            }
            else {
                if (!purchasePlanDetail.ValidateValue()) {
                    return;
                }
                for (var i = 0; i < detailDataList.rows.length; i++) {
                    if (detailDataList.rows[i].id.toString() == purchasePlanDetail.purchasePlanDetailID) {
                        detailDataList.rows[i].data[1] = purchasePlanDetail.purchasePlanDetailID;
                        detailDataList.rows[i].data[2] = $("#txtmaterialID").val();
                        detailDataList.rows[i].data[3] = editImg;
                        detailDataList.rows[i].data[4] = deleteImg;


                        dictDataList.rows[i].data[5] = $("#txtmaterialName").val();

                        dictDataList.rows[i].data[6] = $("#txtmaterialCategory").val();

                        dictDataList.rows[i].data[7] = $("#txtmaterialLevel").val();

                        dictDataList.rows[i].data[8] = $("#comboproducer").find("option:selected").text();


                        dictDataList.rows[i].data[10] = $("#txtquantity").val();

                        dictDataList.rows[i].data[11] = $("#txtdetailComment").val();


                        for (var j = 0; j < detailObjList.length; j++) {
                            if (detailObjList[j].purchasePlanDetailID == purchasePlanDetail.purchasePlanDetailID) {
                                detailObjList[j].materialID = $("#txtmaterialID").val();

                                purchasePlanDetail.quantity = $("#txtquantity").val();


                                if ($.trim($("#txtdetailComment").val()) != '') {
                                    purchasePlanDetail.detailComment = $("#txtdetailComment").val();
                                }
                                else {
                                    purchasePlanDetail.detailCommentID = null;
                                }


                                detailObjList[j].editState = "add";
                            }
                        }
                    }
                }
            }
            detailGrid.clearAll();
            detailGrid.parse(detailDataList, "json");
            hideDetailForm();
        }
        else {
            if (detailEditState == "add") {
                purchasePlanDetail = PurchasePlanDetailClass.createInstance();
                //获取明细ID
                ISystemService.getNextID.typeName = 'PurchasePlanDetail';
                rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                if (ISystemService.getNextID.success) {
                    (function (e) {
                        purchasePlanDetail.purchasePlanDetailID = e.value;
                    }(ISystemService.getNextID.resultValue))
                }
                purchasePlanDetail.purchasePlanID = $("#txtpurchasePlanID").val();
                purchasePlanDetail.materialID = $("#txtmaterialID").val();

                purchasePlanDetail.quantity = $("#txtquantity").val();


                if ($.trim($("#txtdetailComment").val()) != '') {
                    purchasePlanDetail.detailComment = $("#txtdetailComment").val();
                }
                else {
                    purchasePlanDetail.detailCommentID = null;
                }


                purchasePlanDetail.editState = "add";
                detailObjList.push(purchasePlanDetail);

                var dictData = new rock.JsonData(purchasePlanDetail.purchasePlanDetailID);
                dictData.data.push(null);
                dictData.data.push(purchasePlanDetail.purchasePlanDetailID);
                dictData.data.push($("#txtmaterialID").val());
                dictData.data.push(editImg);
                dictData.data.push(deleteImg);

                dictData.data.push($("#txtmaterialName").val());

                dictData.data.push($("#txtmaterialCategory").val());

                dictData.data.push($("#txtmaterialLevel").val());

                dictData.data.push($("#comboproducer").find("option:selected").text());


                dictData.data.push($("#txtquantity").val());

                dictData.data.push($("#txtdetailComment").val());

                detailDataList.rows.push(dictData);
            }
            else {
                for (var i = 0; i < detailDataList.rows.length; i++) {
                    if (detailDataList.rows[i].id.toString() == purchasePlanDetail.purchasePlanDetailID) {
                        detailDataList.rows[i].data[1] = purchasePlanDetail.purchasePlanDetailID;
                        detailDataList.rows[i].data[2] = $("#txtmaterialID").val();
                        detailDataList.rows[i].data[3] = editImg;
                        detailDataList.rows[i].data[4] = deleteImg;


                        dictDataList.rows[i].data[5] = $("#txtmaterialName").val();

                        dictDataList.rows[i].data[6] = $("#txtmaterialCategory").val();

                        dictDataList.rows[i].data[7] = $("#txtmaterialLevel").val();

                        dictDataList.rows[i].data[8] = $("#comboproducer").find("option:selected").text();


                        dictDataList.rows[i].data[10] = $("#txtquantity").val();

                        dictDataList.rows[i].data[11] = $("#txtdetailComment").val();


                        for (var j = 0; j < detailObjList.length; j++) {
                            if (detailObjList[j].purchasePlanDetailID == purchasePlanDetail.purchasePlanDetailID) {
                                detailObjList[j].materialID = $("#txtmaterialID").val();

                                purchasePlanDetail.quantity = $("#txtquantity").val();


                                if ($.trim($("#txtdetailComment").val()) != '') {
                                    purchasePlanDetail.detailComment = $("#txtdetailComment").val();
                                }
                                else {
                                    purchasePlanDetail.detailCommentID = null;
                                }


                                detailObjList[j].editState = "modify";
                            }
                        }
                    }
                }
            }
            detailGrid.clearAll();
            detailGrid.parse(detailDataList, "json");
            hideDetailForm();
        }
    });

    //主参照选择弹窗
    mainReferForm = $("#mainReferForm");
    hideMainReferForm();
    function hideMainReferForm() {
        mainReferForm.css({ top: 200, left: -1300 }).hide();
        mainReferForm.css("visibility", "visible");
    }
    function showMainReferForm() {
        var top = $("#txtmaterialName").offset().top;
        var left = $("#txtmaterialName").offset().left;
        mainReferForm.css({ top: top + 23, left: left }).show();
    }

    //主参照选择弹窗autocomplete快速搜索处理
    $("#txtmaterialName").keyup(function () {
        mainReferComplete($("#txtmaterialName").val());
    });
    $('#txtmaterialName').focus(function (e) {
        showMainReferForm();
    });


    function mainReferComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 20 [Material].[MaterialID], [Material].[materialName], [Producer].[ProducerName], [MaterialCategory].[MaterialCategoryName], [Material].[materialLevel], [Material].[comment] from [Material] join [Producer] on [Material].[producerID] = [Producer].[producerID] join [MaterialCategory] on [Material].[materialCategoryID] = [MaterialCategory].[materialCategoryID] AND ([Material].[materialName] like '%" + $("#txtmaterialName").val() + "%' OR [MaterialCategory].[MaterialCategoryName] like '%" + $("#txtmaterialName").val() + "%' OR [Material].[materialLevel] like '%" + $("#txtmaterialName").val() + "%' OR [Producer].[ProducerName] like '%" + $("#txtmaterialName").val() + "%')";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, mainReferGrid, mainReferGridDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }
    //加载弹窗Div


    //初始化实体弹窗树

    //初始化通用参照弹窗树

    //表单快查弹窗


    //处理点击显示关闭弹窗事件
    $('#mainbody').mousedown(function (e) {
        if (e.srcElement.id != "txtmaterialName") {
            hideMainReferForm();
        }


    });
    function fillPageItem() {
        if (purchasePlan) {
            $("#txtpurchasePlanID").val(purchasePlan.purchasePlanID);

            $("#txtpurchasePlanCode").val(purchasePlan.purchasePlanCode);


            $("#txtpurchasePlanName").val(purchasePlan.purchasePlanName);


            $("#txtapplyDate").val(purchasePlan.applyDate.split(' ')[0]);

            $("#txthandler").val(purchasePlan.handler);


            $("#txtcomment").val(purchasePlan.comment);


            //填充明细列表 
            detailObjList = [];
            detailDataList.rows = [];
            for (var i = 0; i < purchasePlan.purchasePlanDetailList.length; i++) {
                var tempPurchasePlanDetail = purchasePlan.purchasePlanDetailList[i];
                var dictData = new rock.JsonData(tempPurchasePlanDetail.purchasePlanDetailID);
                var material = null;
                dictData.data.push(null);
                dictData.data.push(tempPurchasePlanDetail.purchasePlanID);
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


                ISystemService.executeScalar.sqlString = "select [MaterialCategoryName] from [MaterialCategory] where [MaterialCategoryID] = " + material.materialCategoryID;
                rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                if (ISystemService.executeScalar.success) {
                    (function (e) {
                        dictData.data.push(e.value);
                    }(ISystemService.executeScalar.resultValue));
                }


                dictData.data.push(material.materialLevel);


                ISystemService.executeScalar.sqlString = "select [ProducerName] from [Producer] where [ProducerID] = " + material.producerID;
                rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                if (ISystemService.executeScalar.success) {
                    (function (e) {
                        dictData.data.push(e.value);
                    }(ISystemService.executeScalar.resultValue));
                }



                dictData.data.push(tempPurchasePlanDetail.quantity);


                dictData.data.push(tempPurchasePlanDetail.detailComment);


                detailDataList.rows.push(dictData);
                detailObjList.push(tempPurchasePlanDetail);
            }
            detailGrid.clearAll();
            detailGrid.parse(detailDataList, "json");
        }
    }
    function clearPageItem() {
        $("#txtpurchasePlanID").val("");


        $("#txtpurchasePlanCode").val("");


        $("#txtpurchasePlanName").val("");


        $("#txtapplyDate").val("");

        $("#txthandler").val("");


        $("#txtcomment").val("");


        //清空明细列表
        detailGrid.clearAll();
        detailDataList.rows = [];
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
        purchasePlan = PurchasePlanClass.createInstance();
        purchasePlan.state = "已创建";
        ISystemService.getNextID.typeName = 'PurchasePlan';
        rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
        if (ISystemService.getNextID.success) {
            (function (e) {
                purchasePlan.purchasePlanID = e.value;
                $("#txtpurchasePlanID").val(e.value);
            }(ISystemService.getNextID.resultValue))
        }
        ISystemService.getBillNO.billType = "采购计划";
        rock.AjaxRequest(ISystemService.getBillNO, rock.exceptionFun);
        if (ISystemService.getBillNO.success) {
            (function (e) {
                $("#txtpurchasePlanCode").val(e.value);
            }(ISystemService.getBillNO.resultValue));
        }

        $("#txtapplyDate").val(serverDate);

        editState = "add";
        uIState = "Editing";
        billState = "已创建";
        refreshToolBarState();
    }

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push("txtapplyDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})