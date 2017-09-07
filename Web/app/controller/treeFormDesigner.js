$(function () {
    //初始化系统通用变量
    var dhxLayout, topToolbar, formLayoutTree, formLayoutTree, modelPropertyGrid, modelProperties, formItems, formDataGrid, selectedItemType,
        isChanged,
        treeForm = null,
      formLayoutList = new rock.Dictionary(),
      propertyDataList = new rock.JsonList()
    gridList = new rock.JsonList();
    //加载JS脚本库域服务和对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,TreeForm,FormItem,DataGrid,GridColumn,IUIDesignService," + $.getUrlParam("model");
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        IUIDesignService.getTreeFormByID.treeFormID = $.getUrlParam("id");;
        rock.AjaxRequest(IUIDesignService.getTreeFormByID, rock.exceptionFun);
        if (IUIDesignService.getTreeFormByID.success) {
            (function (e) {
                treeForm = e;
            }(IUIDesignService.getTreeFormByID.resultValue));
        }
        //初始化当前表单页面
        if (treeForm) {
            (function (e) {
                //初始化当前页面元素到页面结构树   
                formLayoutList.add("TreeForm_" + treeForm.treeFormID, treeForm);
                formLayoutTree.insertNewChild(0, "TreeForm_" + treeForm.treeFormID, treeForm.treeFormName);
                //编辑项
                if (treeForm.formItems) {
                    formItems = treeForm.formItems;
                    formLayoutTree.insertNewChild("TreeForm_" + treeForm.treeFormID, "FormItems", "表单编辑项");
                    if (treeForm.formItems.length > 0) {
                        for (var i = 0; i < formItems.length; i++) {
                            var formItem = formItems.item(i);
                            formLayoutList.add("FormItem_" + formItem.formItemID, formItem);
                            formLayoutTree.insertNewChild("FormItems", "FormItem_" + formItem.formItemID, formItem.displayName);
                        }
                    }
                }
                //数据表格
                if (treeForm.dataGrid) {
                    formDataGrid = treeForm.dataGrid;
                    formLayoutList.add("DataGrid_" + formDataGrid.dataGridID, formDataGrid);
                    formLayoutTree.insertNewChild("TreeForm_" + treeForm.treeFormID, "DataGrid_" + formDataGrid.dataGridID, formDataGrid.dataGridName);
                    if (formDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < formDataGrid.gridColumns.length; i++) {
                            var gridColumn = formDataGrid.gridColumns.item(i);
                            formLayoutList.add("GridColumn_" + gridColumn.gridColumnID, gridColumn);
                            formLayoutTree.insertNewChild("DataGrid_" + formDataGrid.dataGridID, "GridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);
                        }
                    }
                }
            }());

            modelProperties = eval(treeForm.modelType + "Class").getProperties().values();

            //构建务对象属性数据列表(propertyListOriginal)  
            (function (e) {
                var propertyData = null;
                for (var i = 0; i < modelProperties.length; i++) {
                    if (modelProperties[i].designInfo.gridHeader) {
                        propertyData = new rock.JsonData(modelProperties[i].name);
                        propertyData.data.push(0);
                        propertyData.data.push(modelProperties[i].id);
                        propertyData.data.push(modelProperties[i].name);
                        propertyData.data.push(modelProperties[i].displayName);
                        propertyDataList.rows.push(propertyData);
                    }
                }
                modelPropertyGrid.clearAll();
                modelPropertyGrid.parse(propertyDataList, "json");
            }());
            formLayoutTree.selectItem("QueryItems", true, false);
            isChanged = false;
            RefreshBtnState();
        }
    });

    //初始化页面布局
    dhxLayout = new dhtmlXLayoutObject("mainbody", "3W");
    dhxLayout.cells("a").setText("页面布局树");
    dhxLayout.cells("a").setWidth(250);
    dhxLayout.cells("b").setWidth(300);
    dhxLayout.cells("b").setText("对象属性列表");
    dhxLayout.cells("c").setText("生成代码");
    dhxLayout.cells("c").attachObject("jsCodeDiv");
    //初始化保存页面模型工具条
    topToolbar = dhxLayout.attachToolbar();
    topToolbar.setIconsPath("../../resource/dhtmlx/codebase/imgs/toolbar_icon/");
    topToolbar.addButton("save", 0, "保存页面模型", "save.gif", "save_dis.gif");
    topToolbar.addButton("generateCode", null, "生成代码");
    topToolbar.attachEvent("onClick", function (itemId) {
        switch (itemId) {
            case "save":
                IUIDesignService.modifyTreeForm.treeForm = treeForm;
                rock.AjaxRequest(IUIDesignService.modifyTreeForm, rock.exceptionFun);
                if (IUIDesignService.modifyTreeForm.success) {
                    ISystemService.executeScalar.sqlString = "select Script from TreeForm where TreeFormID = " + treeForm.treeFormID;
                    rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                    if (ISystemService.executeScalar.success) {
                        (function (e) {
                            $("#txtcode").val(e.value);
                        }(ISystemService.executeScalar.resultValue));
                    }
                    isChanged = false;
                    RefreshBtnState();
                }
                break;
            case "generateCode":
                if (treeForm) {
                    IUIDesignService.generateJsCode.fromModel = treeForm;
                    IUIDesignService.generateJsCode.templateType = "TreeForm";
                    IUIDesignService.generateJsCode.templateName = "TreeForm";
                    rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                    if (IUIDesignService.generateJsCode.success) {
                        (function (e) {
                            $("#txtcode").val(e.value);
                        }(IUIDesignService.generateJsCode.resultValue));
                    }
                }
                else {
                    alert("模型对象不能为空!");
                }
                break;
        }
    });

    //初始化页面布局树
    formLayoutTree = dhxLayout.cells("a").attachTree();
    formLayoutTree.setImagePath("../../resource/dhtmlx/codebase/imgs/tree_icon/");
    formLayoutTree.attachEvent("onSelect", function (itemId) {
        curformLayoutTreeNodeID = itemId;
        selectedItemType = itemId.split("_")[0];
        switch (selectedItemType) {
            case "TreeForm":
                modelPropertyGrid.clearAll();
                break;
            case "FormItems":
                for (var i = 0; i < propertyDataList.rows.length; i++) {
                    propertyDataList.rows[i].data[0] = 0;
                }
                if (treeForm.formItems.length > 0) {
                    formItems = treeForm.formItems;
                    for (var i = 0; i < formItems.length; i++) {
                        var formItem = formItems.item(i);
                        for (var j = 0; j < propertyDataList.rows.length; j++) {
                            if (propertyDataList.rows[j].data[1] == formItem.formItemID) {
                                propertyDataList.rows[j].data[0] = 1;
                                break;
                            }
                        }
                    }
                }
                modelPropertyGrid.clearAll();
                modelPropertyGrid.parse(propertyDataList, "json");
                break;
            case "DataGrid":
                for (var i = 0; i < propertyDataList.rows.length; i++) {
                    propertyDataList.rows[i].data[0] = 0;
                }
                if (treeForm.dataGrid) {
                    formDataGrid = treeForm.dataGrid;
                    if (formDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < formDataGrid.gridColumns.length; i++) {
                            var gridColumn = formDataGrid.gridColumns.item(i);
                            for (var j = 0; j < propertyDataList.rows.length; j++) {
                                if (propertyDataList.rows[j].data[1] == gridColumn.gridColumnID) {
                                    propertyDataList.rows[j].data[0] = 1;
                                    break;
                                }
                            }
                        }
                    }
                }
                modelPropertyGrid.clearAll();
                modelPropertyGrid.parse(propertyDataList, "json");
                break;
            default:
                modelPropertyGrid.clearAll();
                break;
        }
    });
    //初始化对象属性列表
    modelPropertyGrid = dhxLayout.cells("b").attachGrid();
    modelPropertyGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    modelPropertyGrid.setHeader("选择,,属性名称,显示名称");
    modelPropertyGrid.setInitWidths("40,0,100,*");
    modelPropertyGrid.setColAlign("center,center,left,left");
    modelPropertyGrid.enableDragAndDrop(true);
    modelPropertyGrid.setSkin("dhx_skyblue");
    modelPropertyGrid.setColSorting("na,int,str,str");
    modelPropertyGrid.setColTypes("ch,ro,ro,ro");
    modelPropertyGrid.attachEvent("onCheck", function (rId, cInd, state) {
        var propertyID = parseInt(modelPropertyGrid.cells(rId, 1).getValue(), 10);
        var property = eval(treeForm.modelType + "Class").getPropertyByID(propertyID);
        switch (selectedItemType) {           
            case "FormItems":
                var formItem = null;
                if (state) {
                    formItem = FormItemClass.createInstance();
                    formItem.formItemID = property.id;
                    formItem.formItemName = property.name;
                    formItem.displayName = property.displayName;
                    formItem.structName = property.structName;
                    if (property.designInfo) {
                        formItem.inputType = property.designInfo.inputType;
                        formItem.isReadOnly = property.designInfo.isReadOnly;
                        formItem.isRequired = property.designInfo.isRequired;
                        formItem.validateType = property.designInfo.validateType;
                        formItem.referType = property.designInfo.referType;
                        switch (property.designInfo.queryForm) {
                            case "Combox":
                                if (property.structName && property.designInfo.referType == "") {
                                    formItem.queryType = "Struct";
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        formItem.queryType = "Refer";
                                    }
                                    else {
                                        formItem.queryType = "None";
                                    }
                                }
                                break;
                            case "Tree":
                                if (property.structName && property.designInfo.referType == "") {
                                    formItem.queryType = "Struct";
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        formItem.queryType = "Refer";
                                    }
                                }
                                break;
                            case "Quick":
                                if (property.structName) {
                                    formItem.queryType = "Quick";
                                }
                                break;
                            default:
                                formItem.queryType = "None";
                                break;

                        }
                    }
                    else {
                        alert("未设计界面信息的属性不能作为编辑成员成员!");
                        return;
                    }
                    formLayoutList.add("FormItem_" + formItem.formItemID, formItem);
                    treeForm.formItems.add(formItem);
                    formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "FormItem_" + formItem.formItemID, formItem.displayName);

                }
                else {
                    formItem = formLayoutList.item("FormItem_" + property.id);
                    formLayoutTree.deleteItem("FormItem_" + property.id, true);
                    formLayoutList.remove("FormItem_" + property.id);
                    treeForm.formItems.remove(formItem);
                }
                break;
            case "DataGrid":
                if (property.designInfo.gridHeader) {
                    var gridColumn = null;
                    if (state) {
                        gridColumn = GridColumnClass.createInstance();
                        gridColumn.gridColumnID = property.id;
                        gridColumn.gridColumnName = property.name;
                        gridColumn.gridHeader = property.designInfo.gridHeader;
                        gridColumn.gridWidth = property.designInfo.gridWidth;
                        gridColumn.gridColAlign = property.designInfo.gridColAlign;
                        gridColumn.gridColSorting = property.designInfo.gridColSorting;
                        gridColumn.gridColType = property.designInfo.gridColType;
                        gridColumn.referType = property.designInfo.referType;
                        gridColumn.structName = property.structName;
                        if (property.dynType == 18) {
                            gridColumn.dataType = "Date";
                        }
                        else {
                            gridColumn.dataType = "NotDate";
                        }
                        if (property.designInfo) {
                            gridColumn.queryForm = property.designInfo.queryForm;
                            gridColumn.referType = property.designInfo.referType;
                        }
                        formLayoutList.add("GridColumn_" + gridColumn.gridColumnID, gridColumn);
                        treeForm.dataGrid.gridColumns.add(gridColumn);
                        formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "GridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);

                        for (var i = 0; i < propertyDataList.rows.length; i++) {
                            if (propertyDataList.rows[i].data[1] == propertyID) {
                                propertyDataList.rows[i].data[0] = 1;
                                break;
                            }
                        }
                    }
                    else {
                        gridColumn = formLayoutList.item("GridColumn_" + property.id);
                        formLayoutTree.deleteItem("GridColumn_" + property.id, true);
                        formLayoutList.remove("GridColumn_" + property.id);
                        treeForm.dataGrid.gridColumns.remove(gridColumn);
                    }
                }
                else {
                    alert("未指定列信息的属性不能作为列表成员!");
                    for (var i = 0; i < propertyDataList.rows.length; i++) {
                        if (propertyDataList.rows[i].data[1] == propertyID) {
                            propertyDataList.rows[i].data[0] = 0;
                            break;
                        }
                    }
                    modelPropertyGrid.clearAll();
                    modelPropertyGrid.parse(propertyDataList, "json");
                }
                break;
            default:
                modelPropertyGrid.clearAll();
                break;
        }
        isChanged = true;
        RefreshBtnState();
    });
    modelPropertyGrid.init();

    function RefreshBtnState() {
        if (isChanged) {
            topToolbar.enableItem("save");
        }
        else {
            topToolbar.disableItem("save");
        }
    }
})
