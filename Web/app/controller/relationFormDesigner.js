$(function () {
    //初始化系统通用变量
    var dhxLayout, topToolbar, formLayoutTree, formLayoutTree, propertyGrid, masterProperties, slaveProperties,
        masterFormItems, selectedItemType, isChanged,
        relationForm = null,
      formLayoutList = new rock.Dictionary(),
      masterPropertyDataList = new rock.JsonList(),
      slavePropertyDataList = new rock.JsonList(),
    gridList = new rock.JsonList();
    //加载JS脚本库域服务和对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,RelationForm,FormItem,GridColumn,IUIDesignService," + $.getUrlParam("RType") + "," + $.getUrlParam("MType") + "," + $.getUrlParam("SType");
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        IUIDesignService.getRelationFormByID.relationFormID = $.getUrlParam("id");;
        rock.AjaxRequest(IUIDesignService.getRelationFormByID, rock.exceptionFun);
        if (IUIDesignService.getRelationFormByID.success) {
            (function (e) {
                relationForm = e;
            }(IUIDesignService.getRelationFormByID.resultValue));
        }
        //初始化当前表单页面
        if (relationForm) {
            (function (e) {
                //初始化当前页面元素到页面结构树   
                formLayoutList.add("RelationForm_" + relationForm.relationFormID, relationForm);
                formLayoutTree.insertNewChild(0, "RelationForm_" + relationForm.relationFormID, relationForm.relationFormName);
                //主实体表单项
                if (relationForm.masterFormItems) {
                    masterFormItems = relationForm.masterFormItems;
                    formLayoutTree.insertNewChild("RelationForm_" + relationForm.relationFormID, "MasterFormItems", "主实体表单项");
                    if (relationForm.masterFormItems.length > 0) {
                        for (var i = 0; i < masterFormItems.length; i++) {
                            var formItem = masterFormItems.item(i);
                            formLayoutList.add("MasterFormItem_" + formItem.formItemID, formItem);
                            formLayoutTree.insertNewChild("MasterFormItems", "MasterFormItem_" + formItem.formItemID, formItem.displayName);
                        }
                    }
                }
                //主实体表格列
                if (relationForm.masterGridColumns) {
                    masterGridColumns = relationForm.masterGridColumns;
                    formLayoutTree.insertNewChild("RelationForm_" + relationForm.relationFormID, "MasterGridColumns", "主实体表格列");
                    if (relationForm.masterGridColumns.length > 0) {
                        for (var i = 0; i < masterGridColumns.length; i++) {
                            var masterGridColumn = masterGridColumns.item(i);
                            formLayoutList.add("MasterGridColumn_" + masterGridColumn.gridColumnID, masterGridColumn);
                            formLayoutTree.insertNewChild("MasterGridColumns", "MasterGridColumn_" + masterGridColumn.gridColumnID, masterGridColumn.gridHeader);
                        }
                    }
                }
              
                //从实体表格列
                if (relationForm.slaveGridColumns) {
                    slaveGridColumns = relationForm.slaveGridColumns;
                    formLayoutTree.insertNewChild("RelationForm_" + relationForm.relationFormID, "SlaveGridColumns", "从实体表格列");
                    if (relationForm.slaveGridColumns.length > 0) {
                        for (var i = 0; i < slaveGridColumns.length; i++) {
                            var slaveGridColumn = slaveGridColumns.item(i);
                            formLayoutList.add("SlaveGridColumn_" + slaveGridColumn.gridColumnID, slaveGridColumn);
                            formLayoutTree.insertNewChild("SlaveGridColumns", "SlaveGridColumn_" + slaveGridColumn.gridColumnID, slaveGridColumn.gridHeader);
                        }
                    }
                }

                //从实体待选表格列
                if (relationForm.slaveWaitGridColumns) {
                    slaveWaitGridColumns = relationForm.slaveWaitGridColumns;
                    formLayoutTree.insertNewChild("RelationForm_" + relationForm.relationFormID, "SlaveWaitGridColumns", "从实体待选表格列");
                    if (relationForm.slaveWaitGridColumns.length > 0) {
                        for (var i = 0; i < slaveWaitGridColumns.length; i++) {
                            var slaveWaitGridColumn = slaveWaitGridColumns.item(i);
                            formLayoutList.add("SlaveWaitGridColumn_" + slaveWaitGridColumn.gridColumnID, slaveWaitGridColumn);
                            formLayoutTree.insertNewChild("SlaveWaitGridColumns", "SlaveWaitGridColumn_" + slaveWaitGridColumn.gridColumnID, slaveWaitGridColumn.gridHeader);
                        }
                    }
                }               
               
            }());

            masterProperties = eval(relationForm.masterType + "Class").getProperties().values();
            (function (e) {
                var propertyData = null;
                for (var i = 0; i < masterProperties.length; i++) {
                    if (masterProperties[i].designInfo.gridHeader) {
                        propertyData = new rock.JsonData(masterProperties[i].name);

                        propertyData.data.push(0);
                        propertyData.data.push(masterProperties[i].id);
                        propertyData.data.push(masterProperties[i].name);
                        propertyData.data.push(masterProperties[i].displayName);
                        masterPropertyDataList.rows.push(propertyData);
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(masterPropertyDataList, "json");
            }());

            slaveProperties = eval(relationForm.slaveType + "Class").getProperties().values();
            (function (e) {
                var propertyData = null;
                for (var i = 0; i < slaveProperties.length; i++) {
                    if (slaveProperties[i].designInfo.gridHeader) {
                        propertyData = new rock.JsonData(slaveProperties[i].name);
                        propertyData.data.push(0);
                        propertyData.data.push(slaveProperties[i].id);
                        propertyData.data.push(slaveProperties[i].name);
                        propertyData.data.push(slaveProperties[i].displayName);
                        slavePropertyDataList.rows.push(propertyData);
                    }
                }
            }());        

            formLayoutTree.selectItem("MasterFormItems", true, false);
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
                IUIDesignService.modifyRelationForm.relationForm = relationForm;
                rock.AjaxRequest(IUIDesignService.modifyRelationForm, rock.exceptionFun);
                if (IUIDesignService.modifyRelationForm.success) {
                    ISystemService.executeScalar.sqlString = "select Script from RelationForm where RelationFormID = " + relationForm.relationFormID;
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
                if (relationForm) {
                    IUIDesignService.generateJsCode.fromModel = relationForm;
                    IUIDesignService.generateJsCode.templateType = "RelationForm";
                    IUIDesignService.generateJsCode.templateName = "RelationForm";
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
            case "RelationForm":
                propertyGrid.clearAll();
                break;
            case "MasterFormItems":
                for (var i = 0; i < masterPropertyDataList.rows.length; i++) {
                    masterPropertyDataList.rows[i].data[0] = 0;
                }
                if (relationForm.masterFormItems.length > 0) {
                    masterFormItems = relationForm.masterFormItems;
                    for (var i = 0; i < masterFormItems.length; i++) {
                        var masterFormItem = masterFormItems.item(i);
                        for (var j = 0; j < masterPropertyDataList.rows.length; j++) {
                            if (masterPropertyDataList.rows[j].data[1] == masterFormItem.formItemID) {
                                masterPropertyDataList.rows[j].data[0] = 1;
                                break;
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(masterPropertyDataList, "json");
                break;
            case "MasterGridColumns":
                for (var i = 0; i < masterPropertyDataList.rows.length; i++) {
                    masterPropertyDataList.rows[i].data[0] = 0;
                }
                if (relationForm.masterGridColumns.length > 0) {
                    masterGridColumns = relationForm.masterGridColumns;
                    for (var i = 0; i < masterGridColumns.length; i++) {
                        var gridColumn = masterGridColumns.item(i);
                        for (var j = 0; j < masterPropertyDataList.rows.length; j++) {
                            if (masterPropertyDataList.rows[j].data[1] == gridColumn.gridColumnID) {
                                masterPropertyDataList.rows[j].data[0] = 1;
                                break;
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(masterPropertyDataList, "json");
                break;           
            case "SlaveGridColumns":
                for (var i = 0; i < slavePropertyDataList.rows.length; i++) {
                    slavePropertyDataList.rows[i].data[0] = 0;
                }
                if (relationForm.slaveGridColumns) {
                    slaveGridColumns = relationForm.slaveGridColumns;
                    if (slaveGridColumns.length > 0) {
                        for (var i = 0; i < slaveGridColumns.length; i++) {
                            var gridColumn = slaveGridColumns.item(i);
                            for (var j = 0; j < slavePropertyDataList.rows.length; j++) {
                                if (slavePropertyDataList.rows[j].data[1] == gridColumn.gridColumnID) {
                                    slavePropertyDataList.rows[j].data[0] = 1;
                                    break;
                                }
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(slavePropertyDataList, "json");
                break;           
            case "SlaveWaitGridColumns":
                for (var i = 0; i < slavePropertyDataList.rows.length; i++) {
                    slavePropertyDataList.rows[i].data[0] = 0;
                }
                if (relationForm.slaveWaitGridColumns) {
                    slaveWaitGridColumns = relationForm.slaveWaitGridColumns;
                    if (slaveWaitGridColumns.length > 0) {
                        for (var i = 0; i < slaveWaitGridColumns.length; i++) {
                            var gridColumn = slaveWaitGridColumns.item(i);
                            for (var j = 0; j < slavePropertyDataList.rows.length; j++) {
                                if (slavePropertyDataList.rows[j].data[1] == gridColumn.gridColumnID) {
                                    slavePropertyDataList.rows[j].data[0] = 1;
                                    break;
                                }
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(slavePropertyDataList, "json");
                break;           
            default:
                propertyGrid.clearAll();
                break;
        }
    });
    //初始化对象属性列表
    propertyGrid = dhxLayout.cells("b").attachGrid();
    propertyGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    propertyGrid.setHeader("选择,,属性名称,显示名称");
    propertyGrid.setInitWidths("40,0,100,*");
    propertyGrid.setColAlign("center,center,left,left");
    propertyGrid.enableDragAndDrop(true);
    propertyGrid.setSkin("dhx_skyblue");
    propertyGrid.setColSorting("na,int,str,str");
    propertyGrid.setColTypes("ch,ro,ro,ro");
    propertyGrid.attachEvent("onCheck", function (rId, cInd, state) {
        var propertyID = parseInt(propertyGrid.cells(rId, 1).getValue(), 10);
        switch (selectedItemType) {
            case "MasterFormItems":
                var property = eval(relationForm.masterType + "Class").getPropertyByID(propertyID);
                var queryItem = null;
                if (state) {
                    masterFormItem = FormItemClass.createInstance();
                    masterFormItem.formItemID = property.id;
                    masterFormItem.formItemName = property.name;
                    masterFormItem.displayName = property.displayName;
                    if (property.designInfo) {
                        masterFormItem.inputType = property.designInfo.inputType;
                        masterFormItem.isReadOnly = property.designInfo.isReadOnly;
                        masterFormItem.isRequired = property.designInfo.isRequired;
                        masterFormItem.validateType = property.designInfo.validateType;
                        masterFormItem.referType = property.designInfo.referType;
                        switch (property.designInfo.queryForm) {
                            case "Combox":
                                if (property.structName && property.designInfo.referType == "") {
                                    masterFormItem.queryType = "Struct";
                                    masterFormItem.structName = property.structName;
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        masterFormItem.queryType = "Refer";
                                    }
                                    else {
                                        masterFormItem.queryType = "None";
                                    }
                                }
                                break;
                            case "Tree":
                                if (property.structName && property.designInfo.referType == "") {
                                    masterFormItem.queryType = "Struct";
                                    masterFormItem.structName = property.structName;
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        masterFormItem.queryType = "Refer";
                                    }
                                }
                                break;
                            case "Quick":
                                if (property.structName) {
                                    masterFormItem.queryType = "Quick";
                                    masterFormItem.structName = property.structName;
                                }
                                break;
                            default:
                                masterFormItem.queryType = "None";
                                break;

                        }
                    }
                    else {
                        alert("未设计界面信息的属性不能作为编辑成员成员!");
                        return;
                    }
                    formLayoutList.add("MasterFormItem_" + masterFormItem.formItemID, masterFormItem);
                    relationForm.masterFormItems.add(masterFormItem);
                    formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "MasterFormItem_" + masterFormItem.formItemID, masterFormItem.displayName);
                }
                else {
                    masterFormItem = formLayoutList.item("MasterFormItem_" + property.id);
                    formLayoutTree.deleteItem("MasterFormItem_" + property.id, true);
                    formLayoutList.remove("MasterFormItem_" + property.id);
                    relationForm.masterFormItems.remove(masterFormItem);
                }
                break;
            case "MasterGridColumns":
                var property = eval(relationForm.masterType + "Class").getPropertyByID(propertyID);
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
                        if (property.structName) {
                            gridColumn.structName = property.structName;
                        }
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
                        formLayoutList.add("MasterGridColumn_" + gridColumn.gridColumnID, gridColumn);
                        relationForm.masterGridColumns.add(gridColumn);
                        formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "MasterGridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);

                        for (var i = 0; i < masterPropertyDataList.rows.length; i++) {
                            if (masterPropertyDataList.rows[i].data[1] == propertyID) {
                                masterPropertyDataList.rows[i].data[0] = 1;
                                break;
                            }
                        }
                    }
                    else {
                        gridColumn = formLayoutList.item("MasterGridColumn_" + property.id);
                        formLayoutTree.deleteItem("MasterGridColumn_" + property.id, true);
                        formLayoutList.remove("MasterGridColumn_" + property.id);
                        relationForm.masterGridColumns.remove(gridColumn);
                    }
                }
                else {
                    alert("未指定列信息的属性不能作为列表成员!");
                    for (var i = 0; i < masterPropertyDataList.rows.length; i++) {
                        if (masterPropertyDataList.rows[i].data[1] == propertyID) {
                            masterPropertyDataList.rows[i].data[0] = 0;
                            breakmasterPropertyDataList
                        }
                    }
                    propertyGrid.clearAll();
                    propertyGrid.parse(masterPropertyDataList, "json");
                }
                break;            
            case "SlaveGridColumns":
                var property = eval(relationForm.slaveType + "Class").getPropertyByID(propertyID);
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
                        if (property.structName) {
                            gridColumn.structName = property.structName;
                        }
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
                        formLayoutList.add("SlaveGridColumn_" + gridColumn.gridColumnID, gridColumn);
                        relationForm.slaveGridColumns.add(gridColumn);
                        formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "SlaveGridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);

                        for (var i = 0; i < slavePropertyDataList.rows.length; i++) {
                            if (slavePropertyDataList.rows[i].data[1] == propertyID) {
                                slavePropertyDataList.rows[i].data[0] = 1;
                                break;
                            }
                        }
                    }
                    else {
                        gridColumn = formLayoutList.item("SlaveGridColumn_" + property.id);
                        formLayoutTree.deleteItem("SlaveGridColumn_" + property.id, true);
                        formLayoutList.remove("SlaveGridColumn_" + property.id);
                        relationForm.slaveGridColumns.remove(gridColumn);
                    }
                }
                else {
                    alert("未指定列信息的属性不能作为列表成员!");
                    for (var i = 0; i < slavePropertyDataList.rows.length; i++) {
                        if (slavePropertyDataList.rows[i].data[1] == propertyID) {
                            slavePropertyDataList.rows[i].data[0] = 0;
                            break;
                        }
                    }
                    propertyGrid.clearAll();
                    propertyGrid.parse(slavePropertyDataList, "json");
                }
                break;
            
            case "SlaveWaitGridColumns":
                var property = eval(relationForm.slaveType + "Class").getPropertyByID(propertyID);
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
                        if (property.structName) {
                            gridColumn.structName = property.structName;
                        }
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
                        formLayoutList.add("SlaveWaitGridColumn_" + gridColumn.gridColumnID, gridColumn);
                        relationForm.slaveWaitGridColumns.add(gridColumn);
                        formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "SlaveWaitGridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);

                        for (var i = 0; i < slavePropertyDataList.rows.length; i++) {
                            if (slavePropertyDataList.rows[i].data[1] == propertyID) {
                                slavePropertyDataList.rows[i].data[0] = 1;
                                break;
                            }
                        }
                    }
                    else {
                        gridColumn = formLayoutList.item("SlaveWaitGridColumn_" + property.id);
                        formLayoutTree.deleteItem("SlaveWaitGridColumn_" + property.id, true);
                        formLayoutList.remove("SlaveWaitGridColumn_" + property.id);
                        relationForm.slaveWaitGridColumns.remove(gridColumn);
                    }
                }
                else {
                    alert("未指定列信息的属性不能作为列表成员!");
                    for (var i = 0; i < slavePropertyDataList.rows.length; i++) {
                        if (slavePropertyDataList.rows[i].data[1] == propertyID) {
                            slavePropertyDataList.rows[i].data[0] = 0;
                            break;
                        }
                    }
                    propertyGrid.clearAll();
                    propertyGrid.parse(detailMainReferPropertyDataList, "json");
                }
                break;           
            default:
                propertyGrid.clearAll();
                break;
        }
        isChanged = true;
        RefreshBtnState();
    });
    propertyGrid.init();

    function RefreshBtnState() {
        if (isChanged) {
            topToolbar.enableItem("save");
        }
        else {
            topToolbar.disableItem("save");
        }
    }
})
