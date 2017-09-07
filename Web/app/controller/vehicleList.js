var closeUpload = null;
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid,  dictDataList, sqlStr, serverDate, dhxLayout, 
      vehicle = null,
    dictDataList = new rock.JsonList();

    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Vehicle,Carrier";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //查询日期赋初值
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
            }(ISystemService.getServerDate.resultValue));
        }

        //处理初始化加载数据
        getDataList();
      

    });
  
    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("vehicleNum", null, "车牌号");
    toolBar.addInput("txtvehicleNumSearch", null, "", 100);

    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":
                getDataList();
                break;
        }
    });


    //初始化承运车辆列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    //listGrid.setHeader("序号,,车牌号,承运单位,核定装载量(kg),装载货物,到期日期,开始有效期,结束有效期");
    //listGrid.setInitWidths("40,0,150,200,100,100,80,90,*");
    //listGrid.setColAlign("center,left,left,left,left,left,left,left,left");
    //listGrid.setColSorting("na,na,str,str,str,str,str,str,str");
    //listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.setHeader("序号,,车牌号,承运单位,核定装载量(kg),装载货物,车头道路运输证到期,车头行驶证到期,车挂道路运输证到期,车挂行驶证到期,容器检验日期,扬子通行证有效期,公安局通行证有效期,推荐单位名称,审核意见,审核单位,审核人,签发日期,备注");
    listGrid.setInitWidths("40,0,150,200,100,120,120,120,120,120,120,120,120,120,120,100,60,80,60");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");

    listGrid.enableDistributedParsing(true, 20);
    listGrid.init();

    function getDataList() {
        sqlStr = "select [Vehicle].[VehicleID], [Vehicle].[vehicleNum], [Carrier].[CarrierName], [Vehicle].[approvedLoad], [Vehicle].[cargo], convert(nvarchar(10),[Vehicle].[HeadTransportDate],120) as HeadTransportDate, convert(nvarchar(10),[Vehicle].[HeadDrivingDate],120) as HeadDrivingDate, convert(nvarchar(10),[Vehicle].[TrailerTransportDate],120) as TrailerTransportDate, convert(nvarchar(10),[Vehicle].[TrailerDrivingDate],120) as TrailerDrivingDate, convert(nvarchar(10),[Vehicle].[ContainerCheckDate],120) as ContainerCheckDate, convert(nvarchar(10),[Vehicle].[YangziTransportDate],120) as YangziTransportDate, convert(nvarchar(10),[Vehicle].[PoliceDate],120) as PoliceDate, [Vehicle].[recommend], [Vehicle].[auditOpinion], [Vehicle].[auditDepart], [Vehicle].[auditor], convert(nvarchar(10),[Vehicle].[issueDate],120) as issueDate, [Vehicle].[comment] from [Vehicle] join [Carrier] on [Vehicle].[carrierID] = [Carrier].[carrierID] and [ExpiryDate]  >= '" + serverDate + "'";

        if (toolBar.getValue("txtvehicleNumSearch") != "") {
            sqlStr += " and [Vehicle].[vehicleNum] like '%" + toolBar.getValue("txtvehicleNumSearch") + "%'";
        }

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }

})