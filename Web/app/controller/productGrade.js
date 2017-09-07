
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, dictDataList, sqlStr,
      productGrade = null,
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,ProductGrade";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        $("#comboproduct").empty();
        sqlStr = "SELECT [MaterialID],[MaterialName] FROM [Material] where [Available] = '1'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#comboproduct").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>");
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        getInitList();
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("productName", null, "产品名称");
    toolBar.addInput("txtproductName", null, "", 100);

    toolBar.addText("productGradeName", null, "等级名称");
    toolBar.addInput("txtproductGrade", null, "", 100); 


    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "add":
                //
                var grade = toolBar.getValue("txtproductGrade");
                if (grade != "") {
                    productGrade = ProductGradeClass.createInstance();
                    ISystemService.getNextID.typeName = "ProductGrade";
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            productGrade.productGradeID = e.value;
                        }(ISystemService.getNextID.resultValue))
                    }

                    productGrade.productID = $("#comboproduct").val();
                    productGrade.productGradeName = toolBar.getValue("txtproductGrade");

                    ISystemService.addDynObject.dynObject = productGrade;
                    rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                    if (ISystemService.addDynObject.success) {
                        (function (e) {
                            getInitList();
                        }(ISystemService.addDynObject.resultValue));
                    }
                }
                else {
                    alert("产品等级不能为空!");
                }              
                break;
            case "delete":
                var checked = listGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的记录吗?")) {
                    var rowids = checked.split(',');
                    for (var i = 0; i < rowids.length; i++) {
                        ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                        ISystemService.deleteDynObjectByID.structName = "ProductGrade";
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

    toolBar.getInput("txtproductName").id = "txtproductName";
    $("#txtproductName").css("display", "none");
    $("#txtproductName").after("<select id='comboproduct' style=\"width:180px\"></select>");


    $("#comboproduct").change(function () {
        sqlStr = "select [ProductGrade].[ProductGradeID], [Material].MaterialName, [ProductGrade].ProductGradeName from [ProductGrade] join [Material] on  [ProductGrade].ProductID = [Material].MaterialID and [ProductGrade].ProductID = '" + $("#comboproduct").val() + "'";
        //sqlStr = "select [ProductGrade].[ProductGradeID], [ProductGrade].[roductGradeName], [ProductGrade].[productName] from [ProductGrade] where [ProductGrade].[PersonName] = '" + $("#combopersonName").val() + "'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
    });

    //初始化产品营销人员列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,产品名称,产品等级");
    listGrid.setInitWidths("40,0,150,*");
    listGrid.setColAlign("center,left,left,left");
    listGrid.setColSorting("na,na,str,str");
    listGrid.setColTypes("ch,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    function getInitList() {
        //处理初始化加载数据
        sqlStr = "select [ProductGrade].[ProductGradeID], [Material].MaterialName, [ProductGrade].ProductGradeName from [ProductGrade] join [Material] on  [ProductGrade].ProductID = [Material].MaterialID and [ProductGrade].ProductID = '" + $("#comboproduct").val() + "'";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }

    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("delete");
        }
        else {
            toolBar.enableItem("delete");
        }
    }

})