
$(function () {
    //初始化系统通用变量
    var listGrid, editState, editForm, dictDataList, sqlStr, serverDate,curMaterialID,
      material = null,
      productPrice = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,IBusinessService,DataTable,DataRow,DataColumn,Material,ProductPrice";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
            }(ISystemService.getServerDate.resultValue));
        }

        sqlStr = "select [Material].[MaterialID], [Material].[materialName], '' as price, '' as changeDate from [Material] where Available = '1' and  ForSale = '1'";
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

                    IBusinessService.getProductPriceByMaterialID.materialID = rowResult[0].value;
                    rock.AjaxRequest(IBusinessService.getProductPriceByMaterialID, rock.exceptionFun);
                    if (IBusinessService.getProductPriceByMaterialID.success) {
                        (function (e) {
                            productPrice = e;                           
                        }(IBusinessService.getProductPriceByMaterialID.resultValue))
                    }

                    if (productPrice != null) {
                        listdata.data[3] = productPrice.price.toFixed(2);
                        listdata.data[4] = productPrice.updateDate.split(' ')[0];
                    }
                    else {
                        listdata.data[3] = "0.00";
                        listdata.data[4] = serverDate;
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


    listGrid.setHeader("序号,,产品名称,产品报价,更新日期");
    listGrid.setInitWidths("40,0,160,150,*");
    listGrid.setColAlign("center,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        curMaterialID = rowID;
        IBusinessService.getProductPriceByMaterialID.materialID = rowID;
        rock.AjaxRequest(IBusinessService.getProductPriceByMaterialID, rock.exceptionFun);
        if (IBusinessService.getProductPriceByMaterialID.success) {
            (function (e) {
                productPrice = e;
                if (e == null) {
                    editState = "add";
                }
                else {
                    editState = "modify";
                }
            }(IBusinessService.getProductPriceByMaterialID.resultValue))
        }

        $("#txtproductName").val(listGrid.cells(rowID, 2).getValue());
        $("#txtprice").val(listGrid.cells(rowID, 3).getValue()); 
        showEditForm();
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(175);
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

        if (!rock.chknum($("#txtprice").val())) {
            alert('产品报价输入格式错误');
            return;
        }

        if (productPrice == null) {
            productPrice = ProductPriceClass.createInstance();
            ISystemService.getNextID.typeName = "ProductPrice";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    productPrice.productPriceID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        
        productPrice.materialID = curMaterialID;
        productPrice.price = parseFloat($("#txtprice").val());
        productPrice.updateDate = serverDate;  

        if (editState == "add") {
            ISystemService.addDynObject.dynObject = productPrice;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {

                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == curMaterialID) {

                            dictDataList.rows[i].data[3] = $("#txtprice").val();
                            dictDataList.rows[i].data[4] = serverDate;
                        }
                    }
                   
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = productPrice;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == curMaterialID) {
                            dictDataList.rows[i].data[3] = $("#txtprice").val();
                            dictDataList.rows[i].data[4] = serverDate;
                        }
                    }
                   
                }(ISystemService.modifyDynObject.resultValue));
            }         
        }
        listGrid.clearAll();
        listGrid.parse(dictDataList, "json");
        hideEditForm();
        alert("产品报价调整成功!");

    });
})