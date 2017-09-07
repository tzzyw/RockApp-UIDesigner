
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      siemensPrice = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,SiemensPrice";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [SiemensPrice].[SiemensPriceID], [SiemensPrice].[registrationservices], [SiemensPrice].[motortype], [SiemensPrice].[motorSerNo], [SiemensPrice].[endusercompany], [SiemensPrice].[address], [SiemensPrice].[contactPerson] from [SiemensPrice] where type= 'inhouse' ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("registrationservices", null, "服务登记号");
    toolBar.addInput("txtregistrationservicesSearch", null, "", 100);


    toolBar.addText("motortype", null, "电机型号");
    toolBar.addInput("txtmotortypeSearch", null, "", 100);

    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);   
    toolBar.addButton("view", null, "查看");
    toolBar.addSeparator("sepQuery1", null);
    toolBar.addButton("export", null, "生成word/pdf文档");
    toolBar.addSeparator("sepQuery2", null);
    toolBar.addButton("downWord", null, "下载word文档");
    toolBar.addSeparator("sepQuery3", null);
    toolBar.addButton("downPDF", null, "下载PDF文档");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":

                sqlStr = "select [SiemensPrice].[SiemensPriceID], [SiemensPrice].[registrationservices], [SiemensPrice].[motortype], [SiemensPrice].[motorSerNo], [SiemensPrice].[endusercompany], [SiemensPrice].[address], [SiemensPrice].[contactPerson] from [SiemensPrice] where type= 'inhouse' ";

                if (toolBar.getValue("txtregistrationservicesSearch") != "") {
                    sqlStr += " and [SiemensPrice].[registrationservices] like '%" + toolBar.getValue("txtregistrationservicesSearch") + "%'";
                }

                if (toolBar.getValue("txtmotortypeSearch") != "") {
                    sqlStr += " and [SiemensPrice].[motortype] like '%" + toolBar.getValue("txtmotortypeSearch") + "%'";
                }

                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList)
                    }(ISystemService.execQuery.resultValue));
                }
                break;            
            case "view":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();                       
                        window.open("PrintInHOuseRepair.html?ID=" + dictDataID);
                    }
                    else {
                        alert("请仅选择一条要修改的行!");
                    }
                }
                else {
                    alert("请选择要修改的行!");
                }
                break;
            case "export":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        window.location.href = "../../ToPDFHandler.ashx?ID=" + dictDataID + "&TYPE=InHoust";
                    }
                    else {
                        alert("请仅选择一条要生成word文档的行!");
                    }
                }
                else {
                    alert("请选择要生成word文档的行!");
                }

                break;
            case "downWord":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        $.ajax({
                            url: "/Upload/SiemensPrice" + dictDataID + ".doc",
                            type: 'GET',
                            complete: function (response) {
                                if (response.status == 200) {
                                    window.open("\\Upload\\SiemensPrice" + dictDataID + ".doc");
                                }
                                else {
                                    alert("word文档还没有生成，请先生成word/pdf文档后再下载！");
                                }
                            }
                        });
                    }
                    else {
                        alert("请仅选择一条要下载word档的行!");
                    }
                }
                else {
                    alert("请选择要下载word文档的行!");
                }
                break;
            case "downPDF":
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        $.ajax({
                            url: "/Upload/SiemensPrice" + dictDataID + ".pdf",
                            type: 'GET',
                            complete: function (response) {
                                if (response.status == 200) {
                                    window.open("\\Upload\\SiemensPrice" + dictDataID + ".pdf");
                                }
                                else {
                                    alert("PDF文档还没有生成，请先生成word/pdf文档后再下载！");
                                }
                            }
                        });
                    }
                    else {
                        alert("请仅选择一条要下载PDF档的行!");
                    }
                }
                else {
                    alert("请选择要下载PDF文档的行!");
                }
                break;
        }
    });

    //初始化SiemensPrice列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,服务登记号,电机型号,电机序列号,最终客户名称,地址,联系人");
    listGrid.setInitWidths("40,0,120,120,120,150,150,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {       
        window.open("PrintInHOuseRepair.html?ID=" + rowID);
    });   
    listGrid.init();   
})