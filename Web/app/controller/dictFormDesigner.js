$(function () {
    //初始化系统通用变量
    var dhxLayout, topToolbar, formLayoutTree, formLayoutTree, modelPropertyGrid, modelProperties, formToolbar, formItems, formDataGrid, queryItems, selectedItemType,
        isChanged,
        dictForm = null,
      formLayoutList = new rock.Dictionary(),
      propertyDataList = new rock.JsonList()
    gridList = new rock.JsonList();
    //加载JS脚本库域服务和对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,DictForm,QueryItem,FormItem,DataGrid,GridColumn,ToolBarButton,ToolBar,IUIDesignService," + $.getUrlParam("model");
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        IUIDesignService.getDictFormByID.dictFormID = $.getUrlParam("id");;
        rock.AjaxRequest(IUIDesignService.getDictFormByID, rock.exceptionFun);
        if (IUIDesignService.getDictFormByID.success) {
            (function (e) {
                dictForm = e;
            }(IUIDesignService.getDictFormByID.resultValue));
        }
        //初始化当前表单页面
        if (dictForm) {
            (function (e) {
                //初始化当前页面元素到页面结构树   
                formLayoutList.add("DictForm_" + dictForm.dictFormID, dictForm);
                formLayoutTree.insertNewChild(0, "DictForm_" + dictForm.dictFormID, dictForm.dictFormName);
                //工具条
                if (dictForm.toolBar) {
                    formToolbar = dictForm.toolBar;
                    formLayoutList.add("ToolBar_" + formToolbar.toolBarID, formToolbar);
                    formLayoutTree.insertNewChild("DictForm_" + dictForm.dictFormID, "ToolBar_" + formToolbar.toolBarID, formToolbar.toolBarName);
                    if (formToolbar.toolBarButtons.length > 0) {
                        for (var i = 0; i < formToolbar.toolBarButtons.length; i++) {
                            var toolBarButton = formToolbar.toolBarButtons.item(i);
                            formLayoutList.add("ToolBarButton_" + toolBarButton.toolBarButtonID, toolBarButton);
                            formLayoutTree.insertNewChild("ToolBar_" + formToolbar.toolBarID, "ToolBarButton_" + toolBarButton.toolBarButtonID, toolBarButton.toolBarButtonDisplayName);
                        }
                    }
                }
                //查询项
                if (dictForm.queryItems) {
                    queryItems = dictForm.queryItems;
                    formLayoutTree.insertNewChild("DictForm_" + dictForm.dictFormID, "QueryItems", "查询项");
                    if (dictForm.queryItems.length > 0) {
                        for (var i = 0; i < queryItems.length; i++) {
                            var queryItem = queryItems.item(i);
                            formLayoutList.add("QueryItem_" + queryItem.queryItemID, queryItem);
                            formLayoutTree.insertNewChild("QueryItems", "QueryItem_" + queryItem.queryItemID, queryItem.displayName);
                        }
                    }
                }
                //编辑项
                if (dictForm.formItems) {
                    formItems = dictForm.formItems;
                    formLayoutTree.insertNewChild("DictForm_" + dictForm.dictFormID, "FormItems", "表单编辑项");
                    if (dictForm.formItems.length > 0) {
                        for (var i = 0; i < formItems.length; i++) {
                            var formItem = formItems.item(i);
                            formLayoutList.add("FormItem_" + formItem.formItemID, formItem);
                            formLayoutTree.insertNewChild("FormItems", "FormItem_" + formItem.formItemID, formItem.displayName);
                        }
                    }
                }

                //数据表格
                if (dictForm.dataGrid) {
                    formDataGrid = dictForm.dataGrid;
                    formLayoutList.add("DataGrid_" + formDataGrid.dataGridID, formDataGrid);
                    formLayoutTree.insertNewChild("DictForm_" + dictForm.dictFormID, "DataGrid_" + formDataGrid.dataGridID, formDataGrid.dataGridName);
                    if (formDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < formDataGrid.gridColumns.length; i++) {
                            var gridColumn = formDataGrid.gridColumns.item(i);
                            formLayoutList.add("GridColumn_" + gridColumn.gridColumnID, gridColumn);
                            formLayoutTree.insertNewChild("DataGrid_" + formDataGrid.dataGridID, "GridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);
                        }
                    }
                }

                // RefreshPreview();
            }());

            modelProperties = eval(dictForm.modelType + "Class").getProperties().values();

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
    topToolbar.addButtonSelect("codeType", null, "代码类型", [], null, null, true, true, 15, "select");
    topToolbar.addButton("generateCode", null, "生成代码");

    topToolbar.attachEvent("onClick", function (itemId) {
        switch (itemId) {
            case "save":
                IUIDesignService.modifyDictForm.dictForm = dictForm;
                rock.AjaxRequest(IUIDesignService.modifyDictForm, rock.exceptionFun);
                if (IUIDesignService.modifyDictForm.success) {                   
                    isChanged = false;
                    RefreshBtnState();
                }
                break;
            case "generateCode":
                if (dictForm) {
                    switch (topToolbar.getListOptionSelected("codeType")) {
                        case "代码类型":
                            alert("请选择要生成的页面代码类型!");
                            break;
                        case "基本编辑":
                            IUIDesignService.generateJsCode.fromModel = dictForm;
                            IUIDesignService.generateJsCode.templateType = "DictForm";
                            IUIDesignService.generateJsCode.templateName = "DictForm";
                            rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                            if (IUIDesignService.generateJsCode.success) {
                                (function (e) {
                                    $("#txtcode").val(e.value);
                                }(IUIDesignService.generateJsCode.resultValue));
                            }
                            break;
                        case "文档上传编辑":
                            IUIDesignService.generateJsCode.fromModel = dictForm;
                            IUIDesignService.generateJsCode.templateType = "DictForm";
                            IUIDesignService.generateJsCode.templateName = "DictFormUploadFile";
                            rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                            if (IUIDesignService.generateJsCode.success) {
                                (function (e) {
                                    $("#txtcode").val(e.value);
                                }(IUIDesignService.generateJsCode.resultValue));
                            }
                            break;
                        case "查看列表":
                            IUIDesignService.generateJsCode.fromModel = dictForm;
                            IUIDesignService.generateJsCode.templateType = "DictForm";
                            IUIDesignService.generateJsCode.templateName = "DictViewList";
                            rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                            if (IUIDesignService.generateJsCode.success) {
                                (function (e) {
                                    $("#txtcode").val(e.value);
                                }(IUIDesignService.generateJsCode.resultValue));
                            }
                            break;
                        case "上传文档列表":
                            IUIDesignService.generateJsCode.fromModel = dictForm;
                            IUIDesignService.generateJsCode.templateType = "DictForm";
                            IUIDesignService.generateJsCode.templateName = "DictUploadFileViewList";
                            rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                            if (IUIDesignService.generateJsCode.success) {
                                (function (e) {
                                    $("#txtcode").val(e.value);
                                }(IUIDesignService.generateJsCode.resultValue));
                            }
                            break;
                        case "上传文档流程历史列表":
                            IUIDesignService.generateJsCode.fromModel = dictForm;
                            IUIDesignService.generateJsCode.templateType = "DictForm";
                            IUIDesignService.generateJsCode.templateName = "DictFlowUploadFileViewList";
                            rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                            if (IUIDesignService.generateJsCode.success) {
                                (function (e) {
                                    $("#txtcode").val(e.value);
                                }(IUIDesignService.generateJsCode.resultValue));
                            }
                            break;
                        default:
                            alert("请正确选择要生成的页面代码类型!");
                            break;
                    }                    
                }
                else {
                    alert("模型对象不能为空!");
                }                
                break;
        }
    });
    topToolbar.addListOption("codeType", "基本编辑", 1, "button", "基本编辑")
    topToolbar.addListOption("codeType", "文档上传编辑", 2, "button", "文档上传编辑")
    topToolbar.addListOption("codeType", "查看列表", 3, "button", "查看列表")
    topToolbar.addListOption("codeType", "上传文档列表", 4, "button", "上传文档列表")
    topToolbar.addListOption("codeType", "上传文档流程历史列表", 5, "button", "上传文档流程历史列表")

    //初始化页面布局树
    formLayoutTree = dhxLayout.cells("a").attachTree();
    formLayoutTree.setImagePath("../../resource/dhtmlx/codebase/imgs/tree_icon/");
    formLayoutTree.attachEvent("onSelect", function (itemId) {
        curformLayoutTreeNodeID = itemId;
        selectedItemType = itemId.split("_")[0];
        switch (selectedItemType) {
            case "DictForm":
                modelPropertyGrid.clearAll();
                break;
            case "ToolBar":
                modelPropertyGrid.clearAll();
                break;
            case "QueryItems":
                for (var i = 0; i < propertyDataList.rows.length; i++) {
                    propertyDataList.rows[i].data[0] = 0;
                }
                if (dictForm.queryItems.length > 0) {
                    queryItems = dictForm.queryItems;
                    for (var i = 0; i < queryItems.length; i++) {
                        var queryItem = queryItems.item(i);
                        for (var j = 0; j < propertyDataList.rows.length; j++) {
                            if (propertyDataList.rows[j].data[1] == queryItem.queryItemID) {
                                propertyDataList.rows[j].data[0] = 1;
                                break;
                            }
                        }
                    }
                }
                modelPropertyGrid.clearAll();
                modelPropertyGrid.parse(propertyDataList, "json");
                break;
            case "FormItems":
                for (var i = 0; i < propertyDataList.rows.length; i++) {
                    propertyDataList.rows[i].data[0] = 0;
                }
                if (dictForm.formItems.length > 0) {
                    formItems = dictForm.formItems;
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
                if (dictForm.dataGrid) {
                    formDataGrid = dictForm.dataGrid;
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
        var property = eval(dictForm.modelType + "Class").getPropertyByID(propertyID);
        switch (selectedItemType) {
            case "QueryItems":
                var queryItem = null;
                if (state) {
                    queryItem = QueryItemClass.createInstance();
                    queryItem.queryItemID = property.id;
                    queryItem.queryItemName = property.name;
                    queryItem.displayName = property.displayName;
                    if (property.designInfo) {                        
                        queryItem.referType = property.designInfo.referType;
                        queryItem.queryForm = property.designInfo.queryForm;
                        queryItem.isRequired = property.designInfo.isRequired;
                        queryItem.structName = property.structName;
                        switch (property.designInfo.queryForm) {
                            case "Combox":
                                if (property.structName && property.designInfo.referType == "") {
                                    queryItem.queryType = "Struct";
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        queryItem.queryType = "Refer";
                                    }                                    
                                }
                                queryItem.inputType = "Combox";
                                break;
                            case "Tree":
                                if (property.structName && property.designInfo.referType == "") {
                                    queryItem.queryType = "Struct";
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        queryItem.queryType = "Refer";
                                    }
                                }
                                break;
                                queryItem.inputType = "TextBox";
                            case "Fuzzy":
                                if (property.structName && property.designInfo.referType == "") {
                                    queryItem.queryType = "Struct";
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        queryItem.queryType = "Refer";
                                    }
                                }
                                queryItem.inputType = "TextBox";
                                break;
                            case "Quick":
                                if (property.structName) {
                                    queryItem.queryType = "Quick";
                                }
                                queryItem.inputType = "TextBox";
                                break;
                            default:
                                queryItem.queryType = "None";
                                queryItem.inputType = "TextBox";
                                break;

                        }
                    }
                    else {
                        alert("未设计界面信息的属性不能作为查询成员!");
                        return;
                    }
                    formLayoutList.add("QueryItem_" + queryItem.queryItemID, queryItem);
                    dictForm.queryItems.add(queryItem);
                    formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "QueryItem_" + queryItem.queryItemID, queryItem.displayName);
                   
                }
                else {
                    queryItem = formLayoutList.item("QueryItem_" + property.id);
                    formLayoutTree.deleteItem("QueryItem_" + property.id, true);
                    formLayoutList.remove("QueryItem_" + property.id);
                    dictForm.queryItems.remove(queryItem);
                }
                break;
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
                    dictForm.formItems.add(formItem);
                    formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "FormItem_" + formItem.formItemID, formItem.displayName);
                    
                }
                else {
                    formItem = formLayoutList.item("FormItem_" + property.id);
                    formLayoutTree.deleteItem("FormItem_" + property.id, true);
                    formLayoutList.remove("FormItem_" + property.id);
                    dictForm.formItems.remove(formItem);
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
                        dictForm.dataGrid.gridColumns.add(gridColumn);
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
                        dictForm.dataGrid.gridColumns.remove(gridColumn);
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
