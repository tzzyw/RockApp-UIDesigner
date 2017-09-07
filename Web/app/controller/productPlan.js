
$(function () {
    //初始化系统通用变量
    var listGrid, editState, editForm, dictDataList, sqlStr, serverDate, curMaterialID,
      material = null,
      planSale = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,IBusinessService,DataTable,DataRow,DataColumn,Material,PlanSale";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        //rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        //if (ISystemService.getServerDate.success) {
        //    (function (e) {
        //        serverDate = e.value;
        //    }(ISystemService.getServerDate.resultValue));
        //}

        sqlStr = "select [Material].[MaterialID], [Material].[materialName], '' as Quantity, '' as BeginDate, '' as EndDate from [Material] where Available = '1' and  ForSale = '1'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                dictDataList.rows = [];
                listGrid.clearAll();
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var listdata = new rock.JsonData(rowResult[0].value);
                    listdata.data[0] = 0;
                    listdata.data[1] = rowResult[0].value;
                    listdata.data[2] = rowResult[1].value;

                    IBusinessService.getPlanSaleByMaterialID.materialID = rowResult[0].value;
                    rock.AjaxRequest(IBusinessService.getPlanSaleByMaterialID, rock.exceptionFun);
                    if (IBusinessService.getPlanSaleByMaterialID.success) {
                        (function (e) {
                            planSale = e;
                        }(IBusinessService.getPlanSaleByMaterialID.resultValue))
                    }

                    if (planSale != null) {
                        listdata.data[3] = planSale.quantity.toFixed(2);
                        listdata.data[4] = planSale.beginDate.split(' ')[0];
                        listdata.data[5] = planSale.endDate.split(' ')[0];
                    }
                    else {
                        listdata.data[3] = "0.00";
                        listdata.data[4] = "";
                        listdata.data[5] = "";
                    }

                    dictDataList.rows.push(listdata);
                }
                listGrid.parse(dictDataList, "json");


                //rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }


    });


    //初始化物料列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("序号,,产品名称,计划销售量,开始日期,结束日期");
    listGrid.setInitWidths("40,0,160,150,80,*");
    listGrid.setColAlign("center,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        curMaterialID = rowID;
        IBusinessService.getPlanSaleByMaterialID.materialID = rowID;
        rock.AjaxRequest(IBusinessService.getPlanSaleByMaterialID, rock.exceptionFun);
        if (IBusinessService.getPlanSaleByMaterialID.success) {
            (function (e) {
                planSale = e;
                if (e == null) {
                    editState = "add";
                }
                else {
                    editState = "modify";
                }
            }(IBusinessService.getPlanSaleByMaterialID.resultValue))
        }

        $("#txtproductName").val(listGrid.cells(rowID, 2).getValue());
        $("#txtquantity").val(listGrid.cells(rowID, 3).getValue());
        $("#txtbeginDate").val(listGrid.cells(rowID, 4).getValue());
        $("#txtendDate").val(listGrid.cells(rowID, 5).getValue());
        showEditForm();
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(225);
    editForm.width(450);
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

        if (!rock.chknum($("#txtquantity").val())) {
            alert('产品计划销量输入格式错误');
            return;
        }

        if ($.trim($("#txtbeginDate").val()) == "") {
            alert("起始日期不能为空！");
            return;
        }
        if (!rock.chkdate($("#txtbeginDate").val(), "-")) {
            alert("起始日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if ($.trim($("#txtendDate").val()) == "") {
            alert("结束日期不能为空！");
            return;
        }
        if (!rock.chkdate($("#txtendDate").val(), "-")) {
            alert("结束日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }


        if (planSale == null) {
            planSale = PlanSaleClass.createInstance();
            ISystemService.getNextID.typeName = "PlanSale";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    planSale.planSaleID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }

        planSale.materialID = curMaterialID;
        planSale.quantity = parseFloat($("#txtquantity").val());
        planSale.beginDate = $("#txtbeginDate").val();
        planSale.endDate = $("#txtendDate").val();

        if (editState == "add") {
            ISystemService.addDynObject.dynObject = planSale;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {

                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == curMaterialID) {

                            dictDataList.rows[i].data[3] = $("#txtquantity").val();
                            dictDataList.rows[i].data[4] = $("#txtbeginDate").val();
                            dictDataList.rows[i].data[5] = $("#txtendDate").val();
                        }
                    }

                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = planSale;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == curMaterialID) {
                            dictDataList.rows[i].data[3] = $("#txtquantity").val();
                            dictDataList.rows[i].data[4] = $("#txtbeginDate").val();
                            dictDataList.rows[i].data[5] = $("#txtendDate").val();
                        }
                    }

                }(ISystemService.modifyDynObject.resultValue));
            }
        }
        listGrid.clearAll();
        listGrid.parse(dictDataList, "json");
        hideEditForm();
        alert("产品计划销量调整成功!");

    });

    //日期控件测试
    var dateboxArray = [];
    dateboxArray.push("txtbeginDate");
    dateboxArray.push("txtendDate");
    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})