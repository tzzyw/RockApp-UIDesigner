$(function () {
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Menu";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //页面对象声明
        var curNodeID, dhxLayout = new dhtmlXLayoutObject("mainbody", "2U"),
        tree = dhxLayout.cells("a").attachTree(),
        mygrid = dhxLayout.cells("b").attachGrid(),
        allMenuList = new rock.JsonList(),
        orderMenuList = new rock.JsonList(),
        propertyNames = ["menuID", "menuName", "displayOrder"];

        //dhxLayout.setImagePath("/resource/dhtmlx/codebase/imgs/");
        dhxLayout.cells("a").setWidth(300);
        dhxLayout.cells("a").hideHeader();
        dhxLayout.cells("b").hideHeader();

        //初始化菜单树
        tree.setImagePath("/resource/dhtmlx/codebase/imgs/csh_bluefolders/");
        tree.enableTreeLines(true);
        tree.setStdImages("leaf.png", "folderOpen.png", "folderClosed.png");
        tree.attachEvent("onSelect", treeSelect);
        //添加应用程序根节点
        tree.insertNewChild(0, -1, "扬子热电厂仪表设备管理");
        //初始菜单列表
        mygrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
        mygrid.setHeader("流水号,菜单项名称, 显示顺序", null, ["align:center", "text-align:center", "text-align:center"]);
        mygrid.setInitWidths("60,*,200");
        mygrid.setColAlign("center,center,center");
        mygrid.setSkin("light");
        mygrid.setColSorting("int,str,int");
        mygrid.setColTypes("ro,ro,ed");
        mygrid.enableDistributedParsing(true, 20);
        mygrid.attachEvent("onEditCell", function (stage, rowId, cellInd) {
            //获取角色的已选用户ID列表
            if (stage == 2) {
                var menu = null;
                ISystemService.getDynObjectByID.dynObjectID = rowId;
                ISystemService.getDynObjectByID.structName = "Menu";
                rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                if (ISystemService.getDynObjectByID.success) {
                    (function (e) {
                        menu = e;
                    }(ISystemService.getDynObjectByID.resultValue));
                }                
                if (menu) {
                    var newOrder = parseInt(mygrid.cells(rowId, cellInd).cell.innerText,10);
                    if (menu.displayOrder != newOrder) {
                        menu.displayOrder = newOrder;
                        ISystemService.modifyDynObject.dynObject = menu;
                        rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                        if (ISystemService.modifyDynObject.success) {
                            (function (e) {
                                for (var i = 0; i < orderMenuList.rows.length; i++) {
                                    var menuID = orderMenuList.rows[i].id;
                                    if (menuID.toString() === rowId.toString()) {
                                        orderMenuList.rows[i].data[2] = menu.displayOrder;
                                        break;
                                    }
                                }
                                mygrid.clearAll();
                                mygrid.parse(orderMenuList, "json");
                                mygrid.sortRows(2);
                            }(ISystemService.modifyDynObject.resultValue));
                        }
                    }                       
                }               
            }
        });
        mygrid.init();

        //获取一级菜单列表
        ISystemService.execQuery.sqlString = "select MenuID, MenuName, DisplayOrder from Menu where ParentID is null order by DisplayOrder";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    for (var i = 0; i < rows.length; i++) {
                        var rowResult = rows[i].values;
                        tree.insertNewChild(-1, rowResult[0].value, rowResult[1].value);

                        var menuData = new rock.JsonData(rowResult[0].value);
                        menuData.data[0] = rowResult[0].value;
                        menuData.data[1] = rowResult[1].value;
                        menuData.data[2] = rowResult[2].value;
                        menuData.data[3] = 0;
                        allMenuList.rows.push(menuData);
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        function treeSelect(itemid) {
            //当前结点id
            curNodeID = itemid;
            //获取menu子节点并填充
            if (!tree.hasChildren(itemid)) {
                ISystemService.execQuery.sqlString = "select MenuID, MenuName, DisplayOrder, ParentID from Menu where ParentID = " + itemid + " order by DisplayOrder";
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            orderMenuList.rows = [];
                            var rows = e.rows;
                            for (var i = 0; i < rows.length; i++) {
                                var rowResult = rows[i].values;
                                tree.insertNewChild(curNodeID, rowResult[0].value, rowResult[1].value);

                                var menuData = new rock.JsonData(rowResult[0].value);
                                menuData.data[0] = rowResult[0].value;
                                menuData.data[1] = rowResult[1].value;
                                menuData.data[2] = rowResult[2].value;
                                menuData.data[3] = rowResult[3].value;

                                orderMenuList.rows.push(menuData);
                            }

                            //填充菜单项列表
                            for (var j = 0; j < orderMenuList.rows.length; j++) {
                                allMenuList.rows.push(orderMenuList.rows[j]);
                            }
                            mygrid.clearAll();
                            mygrid.parse(orderMenuList, "json");
                        }
                    }(ISystemService.execQuery.resultValue));
                }
            }
            else {
                orderMenuList.rows = [];
                if (itemid == -1) {
                    for (var i = 0; i < allMenuList.rows.length; i++) {
                        if (allMenuList.rows[i].data[3].toString() === "0") {
                            orderMenuList.rows.push(allMenuList.rows[i]);
                        }
                    }
                }
                else {
                    for (var i = 0; i < allMenuList.rows.length; i++) {
                        if (allMenuList.rows[i].data[3].toString() === itemid.toString()) {
                            orderMenuList.rows.push(allMenuList.rows[i]);
                        }
                    }
                }                
                mygrid.clearAll();
                mygrid.parse(orderMenuList, "json");
            }
        }
    });
});