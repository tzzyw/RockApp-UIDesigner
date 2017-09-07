
$(function () {
    //初始化系统通用变量
    var listGrid, dictDataList, sqlStr, serverDate, curMaterialID,
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
    listGrid.init();

})