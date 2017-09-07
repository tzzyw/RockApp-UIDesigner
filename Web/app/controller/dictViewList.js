
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, tabbar, documentGrid, pictureDataView,
      user = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,User";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [User].[UserID], [User].[userName], [User].[trueName] from [User] where 1=1  ";
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

    toolBar.addText("userName", null, "用户名称");
    toolBar.addInput("txtuserNameSearch", null, "", 100);


    toolBar.addButton("query", null, "查询");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":


                sqlStr = "select [User].[UserID], [User].[userName], [User].[trueName] from [User] where 1=1 ";

                if (toolBar.getValue("txtuserNameSearch") != "") {
                    sqlStr += " and [User].[userName] like '%" + toolBar.getValue("txtuserNameSearch") + "%'";
                }



                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList)
                    }(ISystemService.execQuery.resultValue));
                }
                break;

        }
    });



    //初始化用户列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("序号,,用户名,显示名");
    listGrid.setInitWidths("40,0,50,*");
    listGrid.setColAlign("center,left,left,left");
    listGrid.setColSorting("na,na,str,str");
    listGrid.setColTypes("cntr,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        alert("尚未设定查看明细弹窗!");
    });
    listGrid.init();




})