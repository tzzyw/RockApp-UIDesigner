
$(function () {
    //初始化系统通用变量
    var toolBar, dhxLayout, editState, detailEditState, detailForm, detailGrid,  billState, uIState, referGrid, referForm, serverDate, sqlStr,
	priceApply = null,
	priceApplyDetal = null,
	detailObjList = [],
	detailDataList = new rock.JsonList(),
	mainReferGridDataList = new rock.JsonList(),
	editImg = "/resource/dhtmlx/codebase/imgs/edit.gif",
    deleteImg = "/resource/dhtmlx/codebase/imgs/delete.gif",
	masterEditItem = $("#masterEditItem"),
	detailForm = $("#detailForm"),
	detailEditItem = $("#detailEditItem"),
	priceApplyID = decodeURI($.getUrlParam("ID"));
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,PriceApply,PriceApplyDetal,Refer,IBusinessService";
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


        $("#comboproductName").empty();
        sqlStr = "SELECT [ReferName] FROM [Refer] where [ReferType] = '调价申请产品'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#comboproductName").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }



        //初始化明细表通用参照

        $("#combopriceCategory").empty();
        sqlStr = "SELECT [ReferName] FROM [Refer] where [ReferType] = '调价申请价格类别'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combopriceCategory").append("<option value='" + rowResult[0].value + "'>" + rowResult[0].value + "</option>")
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }



        //填充实体弹窗参照树


        //填充通用弹窗参照树
     

        //获取单据对象
        if (priceApplyID != "null") {
            uIState = "Browsing";
            editState = "modify";
            $("#txtpriceApplyID").val(priceApplyID);
            IBusinessService.getPriceApplyByID.priceApplyID = priceApplyID;
            rock.AjaxRequest(IBusinessService.getPriceApplyByID, rock.exceptionFun);
            if (IBusinessService.getPriceApplyByID.success) {
                (function (e) {
                    priceApply = e;
                    if (e != null) {
                        billState = priceApply.state;
                        fillPageItem();
                    }
                }(IBusinessService.getPriceApplyByID.resultValue));
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
                if (priceApply) {
                    //新增和修改的不同处理
                    if (editState == "add") {
                        uIState = "Init";
                        clearPageItem();
                    }
                    else {
                        uIState = "Browsing";
                        billState = priceApply.state;
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
                IBusinessService.getPriceApplyByID.priceApplyID = $("#txtpriceApplyID").val();
                rock.AjaxRequest(IBusinessService.getPriceApplyByID, rock.exceptionFun);
                if (IBusinessService.getPriceApplyByID.success) {
                    (function (e) {
                        priceApply = e;
                    }(IBusinessService.getPriceApplyByID.resultValue));
                    fillPageItem();
                    refreshToolBarState();
                }
                break;
            case "save":
                if (detailDataList.rows.length == 0) {
                    alert("产品价格调整申请必须要有明细!");
                    return false;
                }
                if (priceApply == null) {
                    alert("修改的产品价格调整申请不存在,请检查!");
                    return false;
                }
                if (!priceApply.ValidateValue()) {
                    return;
                }

                priceApply.priceApplyNum = $("#txtpriceApplyNum").val();
                priceApply.over50 = $('#chkover50').attr('checked');

                if ($.trim($("#comboproductName").val()) != '') {
                    priceApply.productName = $("#comboproductName").val();
                }
                else {
                    priceApply.productName = null;
                }



                if ($.trim($("#txtagent").val()) != '') {
                    priceApply.agent = $("#txtagent").val();
                }
                else {
                    priceApply.agent = null;
                }


                if ($.trim($("#txtreason").val()) != '') {
                    priceApply.reason = $("#txtreason").val();
                }
                else {
                    priceApply.reason = null;
                }
               
                priceApply.priceApplyDetals = detailObjList;
                //处理明细部分
                if (editState == "add") {
                    IBusinessService.addPriceApply.priceApply = priceApply;
                    rock.AjaxRequest(IBusinessService.addPriceApply, rock.exceptionFun);
                    if (IBusinessService.addPriceApply.success) {
                        (function (e) {
                            alert("添加成功！");
                        }(IBusinessService.addPriceApply.resultValue));
                    }
                    else {
                        return;
                    }
                }
                else {
                    IBusinessService.modifyPriceApply.priceApply = priceApply;
                    rock.AjaxRequest(IBusinessService.modifyPriceApply, rock.exceptionFun);
                    if (IBusinessService.modifyPriceApply.success) {
                        (function (e) {
                            alert("修改成功！");
                        }(IBusinessService.modifyPriceApply.resultValue));
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
                IBusinessService.deletePriceApply.priceApplyID = priceApply.priceApplyID;
                rock.AjaxRequest(IBusinessService.deletePriceApply, rock.exceptionFun);
                if (IBusinessService.deletePriceApply.success) {
                    (function (e) {
                        uIState = "Init";
                        clearPageItem();
                        refreshToolBarState();
                    }(IBusinessService.deletePriceApply.resultValue));
                }
                break;
            case "submit":
                IBusinessService.submitPriceApply.priceApplyID = priceApply.priceApplyID;
                rock.AjaxRequest(IBusinessService.submitPriceApply, rock.exceptionFun);
                if (IBusinessService.submitPriceApply.success) {
                    (function (e) {
                        priceApply.state = "已提交";

                    }(IBusinessService.submitPriceApply.resultValue));
                }
                billState = "已提交";
                uIState = "Browsing";
                refreshToolBarState();
                break;
            case "repeal":
                IBusinessService.repealPriceApply.priceApplyID = priceApply.priceApplyID;
                rock.AjaxRequest(IBusinessService.repealPriceApply, rock.exceptionFun);
                if (IBusinessService.repealPriceApply.success) {
                    (function (e) {
                        priceApply.state = "已创建";

                    }(IBusinessService.repealPriceApply.resultValue));
                }
                billState = "已创建";
                uIState = "Browsing";
                refreshToolBarState();
                break;
            case "addDetail":
                $("#detailFormTitle").text("添加产品价格调整申请明细");
                $("#txtbeforePrice").val("");
                $("#txtapplyPrice").val("");
                $("#txtpriceRange").val("");
                detailEditState = "add";
                showDetailForm();
                break;
        }
    });

    //处理主表编辑项

    //tableString = '';
    //masterEditItem.html(tableString);


    //处理明细表编辑项

    //detailForm.height(250);
    //tableString = '';
    //detailEditItem.html(tableString);


    //初始化明细表格
    detailGrid = new dhtmlXGridObject("detailGrid");
    detailGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    detailGrid.setSkin("dhx_skyblue");


    detailGrid.setHeader("序号,,修改,删除,价格类别,调整前价格,申请调整价格,价格调整幅度");
    detailGrid.setInitWidths("40,0,40,40,200,100,100,*");
    detailGrid.setColAlign("center,left,center,left,left,left,left,left");
    detailGrid.setColSorting("na,na,na,na,str,str,str,str");
    detailGrid.setColTypes("cntr,ro,img,img,ro,ro,ro,ro");
    detailGrid.enableDistributedParsing(true, 20);
    detailGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        if (billState == "已创建" && uIState == "Editing") {
            if (cIndex == 2) {
                for (var i = 0; i < detailDataList.rows.length; i++) {
                    if (detailDataList.rows[i].id == rowID) {
                        $("#txtpriceApplyDetalID").val(rowID);
                        rock.setSelectItem("combopriceCategory", detailGrid.cells(rowID, 4).getValue(), "text");
                        $("#txtbeforePrice").val(detailGrid.cells(rowID, 5).getValue());

                        $("#txtapplyPrice").val(detailGrid.cells(rowID, 6).getValue());

                        $("#txtpriceRange").val(detailGrid.cells(rowID, 7).getValue());

                    }
                }
                for (var j = 0; j < detailObjList.length; j++) {
                    if (detailObjList[j].departmentDetailID == rowID) {
                        priceApplyDetal = detailObjList[j];
                        break;
                    }
                }
                detailEditState = "modify";
                showDetailForm();
            }
            if (cIndex == 3) {
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
                            if (detailObjList[i].priceApplyDetalID == rowID) {
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
                            if (detailObjList[i].priceApplyDetalID == rowID) {
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

   
    //产品价格调整申请明细弹窗
    detailForm = $("#detailForm");
    detailForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        var top = $("#detailForm").offset().top;
        var left = $("#detailForm").offset().left;

        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                detailForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
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
        var priceCategory = $("#combopriceCategory").val();
        //分两种情况判断,新增的明细不直接保存;修改的明细直接保存到数据库
        if (editState == "add") {
            if (detailEditState == "add") {
                //判断明细是否重复选择
                for (var j = 0; j < detailObjList.length; j++) {
                    if (detailObjList[j].priceCategory == priceCategory) {
                        alert("价格类别不能重复选择");
                        return;
                    }
                }
                priceApplyDetal = PriceApplyDetalClass.createInstance();
                if (!priceApplyDetal.ValidateValue()) {
                    return;
                }
                //获取明细ID
                ISystemService.getNextID.typeName = 'PriceApplyDetal';
                rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                if (ISystemService.getNextID.success) {
                    (function (e) {
                        priceApplyDetal.priceApplyDetalID = e.value;
                    }(ISystemService.getNextID.resultValue))
                }

                priceApplyDetal.priceApplyID = $("#txtpriceApplyID").val();

                if ($.trim($("#combopriceCategory").val()) != '') {
                    priceApplyDetal.priceCategory = $("#combopriceCategory").val();
                }
                else {
                    priceApplyDetal.priceCategory = null;
                }



                if ($.trim($("#txtbeforePrice").val()) != '') {
                    priceApplyDetal.beforePrice = $("#txtbeforePrice").val();
                }
                else {
                    priceApplyDetal.beforePrice = null;
                }


                if ($.trim($("#txtapplyPrice").val()) != '') {
                    priceApplyDetal.applyPrice = $("#txtapplyPrice").val();
                }
                else {
                    priceApplyDetal.applyPrice = null;
                }


                if ($.trim($("#txtpriceRange").val()) != '') {
                    priceApplyDetal.priceRange = $("#txtpriceRange").val();
                }
                else {
                    priceApplyDetal.priceRange = null;
                }


                priceApplyDetal.editState = "add";
                detailObjList.push(priceApplyDetal);

                var detailData = new rock.JsonData(priceApplyDetal.priceApplyDetalID);
                detailData.data.push(null);
                detailData.data.push(priceApplyDetal.priceApplyDetalID);
                detailData.data.push(editImg);
                detailData.data.push(deleteImg);

                detailData.data.push($("#combopriceCategory").find("option:selected").text());

                detailData.data.push($("#txtbeforePrice").val());

                detailData.data.push($("#txtapplyPrice").val());

                detailData.data.push($("#txtpriceRange").val());

                detailDataList.rows.push(detailData);
            }
            else {
                if (!priceApplyDetal.ValidateValue()) {
                    return;
                }
                //判断明细是否重复选择
                for (var j = 0; j < detailObjList.length; j++) {
                    if (detailObjList[j].priceCategory == priceCategory && detailObjList[j].priceApplyDetalID != priceApplyDetal.priceApplyDetalID) {
                        alert("价格类别不能重复选择");
                        return;
                    }
                }
                for (var i = 0; i < detailDataList.rows.length; i++) {
                    if (detailDataList.rows[i].id.toString() == priceApplyDetal.priceApplyDetalID) {
                        detailDataList.rows[i].data[1] = priceApplyDetal.priceApplyDetalID;
                        detailDataList.rows[i].data[2] = editImg;
                        detailDataList.rows[i].data[3] = deleteImg;

                        detailDataList.rows[i].data[4] = $("#combopriceCategory").find("option:selected").text();

                        detailDataList.rows[i].data[5] = $("#txtbeforePrice").val();

                        detailDataList.rows[i].data[6] = $("#txtapplyPrice").val();

                        detailDataList.rows[i].data[7] = $("#txtpriceRange").val();


                        for (var j = 0; j < detailObjList.length; j++) {
                            if (detailObjList[j].priceApplyDetalID == priceApplyDetal.priceApplyDetalID) {

                                if ($.trim($("#combopriceCategory").val()) != '') {
                                    priceApplyDetal.priceCategory = $("#combopriceCategory").val();
                                }
                                else {
                                    priceApplyDetal.priceCategory = null;
                                }



                                if ($.trim($("#txtbeforePrice").val()) != '') {
                                    priceApplyDetal.beforePrice = $("#txtbeforePrice").val();
                                }
                                else {
                                    priceApplyDetal.beforePriceID = null;
                                }


                                if ($.trim($("#txtapplyPrice").val()) != '') {
                                    priceApplyDetal.applyPrice = $("#txtapplyPrice").val();
                                }
                                else {
                                    priceApplyDetal.applyPrice = null;
                                }


                                if ($.trim($("#txtpriceRange").val()) != '') {
                                    priceApplyDetal.priceRange = $("#txtpriceRange").val();
                                }
                                else {
                                    priceApplyDetal.priceRange = null;
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
                //判断明细是否重复选择
                for (var j = 0; j < detailObjList.length; j++) {
                    if (detailObjList[j].priceCategory == priceCategory) {
                        alert("价格类别不能重复选择");
                        return;
                    }
                }

                priceApplyDetal = PriceApplyDetalClass.createInstance();
                //获取明细ID
                ISystemService.getNextID.typeName = 'PriceApplyDetal';
                rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                if (ISystemService.getNextID.success) {
                    (function (e) {
                        priceApplyDetal.priceApplyDetalID = e.value;
                    }(ISystemService.getNextID.resultValue))
                }
                priceApplyDetal.priceApplyID = $("#txtpriceApplyID").val();

                if ($.trim($("#combopriceCategory").val()) != '') {
                    priceApplyDetal.priceCategory = $("#combopriceCategory").val();
                }
                else {
                    priceApplyDetal.priceCategory = null;
                }



                if ($.trim($("#txtbeforePrice").val()) != '') {
                    priceApplyDetal.beforePrice = $("#txtbeforePrice").val();
                }
                else {
                    priceApplyDetal.beforePrice = null;
                }


                if ($.trim($("#txtapplyPrice").val()) != '') {
                    priceApplyDetal.applyPrice = $("#txtapplyPrice").val();
                }
                else {
                    priceApplyDetal.applyPrice = null;
                }


                if ($.trim($("#txtpriceRange").val()) != '') {
                    priceApplyDetal.priceRange = $("#txtpriceRange").val();
                }
                else {
                    priceApplyDetal.priceRange = null;
                }


                priceApplyDetal.editState = "add";
                detailObjList.push(priceApplyDetal);

                var detailData = new rock.JsonData(priceApplyDetal.priceApplyDetalID);
                detailData.data.push(null);
                detailData.data.push(priceApplyDetal.priceApplyDetalID);
                detailData.data.push(editImg);
                detailData.data.push(deleteImg);

                detailData.data.push($("#combopriceCategory").find("option:selected").text());

                detailData.data.push($("#txtbeforePrice").val());

                detailData.data.push($("#txtapplyPrice").val());

                detailData.data.push($("#txtpriceRange").val());

                detailDataList.rows.push(detailData);
            }
            else {
                //判断明细是否重复选择
                for (var j = 0; j < detailObjList.length; j++) {
                    if (detailObjList[j].priceCategory == priceCategory && detailObjList[j].priceApplyDetalID != priceApplyDetal.priceApplyDetalID) {
                        alert("参照不能重复选择");
                        return;
                    }
                }
                for (var i = 0; i < detailDataList.rows.length; i++) {
                    if (detailDataList.rows[i].id.toString() == priceApplyDetal.priceApplyDetalID) {
                        detailDataList.rows[i].data[1] = priceApplyDetal.priceApplyDetalID;
                        detailDataList.rows[i].data[2] = editImg;
                        detailDataList.rows[i].data[3] = deleteImg;

                        detailDataList.rows[i].data[4] = $("#combopriceCategory").find("option:selected").text();

                        detailDataList.rows[i].data[5] = $("#txtbeforePrice").val();

                        detailDataList.rows[i].data[6] = $("#txtapplyPrice").val();

                        detailDataList.rows[i].data[7] = $("#txtpriceRange").val();


                        for (var j = 0; j < detailObjList.length; j++) {
                            if (detailObjList[j].priceApplyDetalID == priceApplyDetal.priceApplyDetalID) {

                                if ($.trim($("#combopriceCategory").val()) != '') {
                                    priceApplyDetal.priceCategory = $("#combopriceCategory").val();
                                }
                                else {
                                    priceApplyDetal.priceCategory = null;
                                }



                                if ($.trim($("#txtbeforePrice").val()) != '') {
                                    priceApplyDetal.beforePrice = $("#txtbeforePrice").val();
                                }
                                else {
                                    priceApplyDetal.beforePrice = null;
                                }


                                if ($.trim($("#txtapplyPrice").val()) != '') {
                                    priceApplyDetal.applyPrice = $("#txtapplyPrice").val();
                                }
                                else {
                                    priceApplyDetal.applyPrice = null;
                                }


                                if ($.trim($("#txtpriceRange").val()) != '') {
                                    priceApplyDetal.priceRange = $("#txtpriceRange").val();
                                }
                                else {
                                    priceApplyDetal.priceRange = null;
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

    //加载弹窗Div


    //初始化实体弹窗树

    //初始化通用参照弹窗树

    //表单快查弹窗
 
    function fillPageItem() {
        if (priceApply) {
            $("#txtpriceApplyID").val(priceApply.priceApplyID);

            $("#txtpriceApplyNum").val(priceApply.priceApplyNum);


            rock.setSelectItem("comboproductName", priceApply.productName, "text");


            $("#txtagent").val(priceApply.agent);
            $('#chkover50').attr('checked',priceApply.over50);

            $("#txtreason").val(priceApply.reason);


            //填充明细列表 
            detailObjList = [];
            detailDataList.rows = [];
            for (var i = 0; i < priceApply.priceApplyDetals.length; i++) {
                var tempPriceApplyDetal = priceApply.priceApplyDetals[i];
                var detailData = new rock.JsonData(tempPriceApplyDetal.priceApplyDetalID);
                var refer = null;
                detailData.data.push(null);
                detailData.data.push(tempPriceApplyDetal.priceApplyID);
                detailData.data.push(editImg);
                detailData.data.push(deleteImg);

                detailData.data.push(tempPriceApplyDetal.priceCategory);


                detailData.data.push(tempPriceApplyDetal.beforePrice);


                detailData.data.push(tempPriceApplyDetal.applyPrice);


                detailData.data.push(tempPriceApplyDetal.priceRange);


                detailDataList.rows.push(detailData);
                detailObjList.push(tempPriceApplyDetal);
            }
            detailGrid.clearAll();
            detailGrid.parse(detailDataList, "json");
        }
    }
    function clearPageItem() {
        $("#txtpriceApplyID").val("");


        $("#txtpriceApplyNum").val("");


        $("#comboproductName").get(0).selectedIndex = 0;

        $("#txtagent").val("");
        $('#chkover50').attr('checked', false);

        $("#txtreason").val("");


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
        priceApply = PriceApplyClass.createInstance();
        priceApply.state = "已创建";
        priceApply.createDate = serverDate;
        ISystemService.getNextID.typeName = 'PriceApply';
        rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
        if (ISystemService.getNextID.success) {
            (function (e) {
                priceApply.priceApplyID = e.value;
                $("#txtpriceApplyID").val(e.value);
            }(ISystemService.getNextID.resultValue))
        }       

        $("#txtpriceApplyNum").val("营价调");
        $("#txtagent").val(decodeURIComponent($.cookie('userTrueName')));
        $("#txtreason").val("");
        editState = "add";
        uIState = "Editing";
        billState = "已创建";
        refreshToolBarState();
    }

})