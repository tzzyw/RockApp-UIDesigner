$(function () {
    //初始化系统通用变量
    var dhxLayout, topToolbar, formLayoutTree, formLayoutTree, propertyGrid, masterProperties, detailProperties, detailMainReferProperties,
        detailDataGrid, detailMainReferDataGrid, masterFormItems, detailFormItems, selectedItemType, isChanged, detailMainReferFuzzyColumns,
        billForm = null,
      formLayoutList = new rock.Dictionary(),
      masterPropertyDataList = new rock.JsonList(),
      detailPropertyDataList = new rock.JsonList(),
      detailMainReferPropertyDataList = new rock.JsonList(),
    gridList = new rock.JsonList();
    //加载JS脚本库域服务和对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,BillForm,QueryItem,FormItem,DataGrid,GridColumn,IUIDesignService," + $.getUrlParam("MType") + "," + $.getUrlParam("DType") + "," + $.getUrlParam("RType");
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        IUIDesignService.getBillFormByID.billFormID = $.getUrlParam("id");;
        rock.AjaxRequest(IUIDesignService.getBillFormByID, rock.exceptionFun);
        if (IUIDesignService.getBillFormByID.success) {
            (function (e) {
                billForm = e;
            }(IUIDesignService.getBillFormByID.resultValue));
        }
        //初始化当前表单页面
        if (billForm) {
            (function (e) {
                //初始化当前页面元素到页面结构树   
                formLayoutList.add("BillForm_" + billForm.billFormID, billForm);
                formLayoutTree.insertNewChild(0, "BillForm_" + billForm.billFormID, billForm.billFormName);
                //主表表单项
                if (billForm.masterFormItems) {
                    masterFormItems = billForm.masterFormItems;
                    formLayoutTree.insertNewChild("BillForm_" + billForm.billFormID, "MasterFormItems", "主表表单项");
                    if (billForm.masterFormItems.length > 0) {
                        for (var i = 0; i < masterFormItems.length; i++) {
                            var formItem = masterFormItems.item(i);
                            formLayoutList.add("MasterFormItem_" + formItem.formItemID, formItem);
                            formLayoutTree.insertNewChild("MasterFormItems", "MasterFormItem_" + formItem.formItemID, formItem.displayName);
                        }
                    }
                }
                //明细表单项
                if (billForm.detailFormItems) {
                    detailFormItems = billForm.detailFormItems;
                    formLayoutTree.insertNewChild("BillForm_" + billForm.billFormID, "DetailFormItems", "明细表单项");
                    if (billForm.detailFormItems.length > 0) {
                        for (var i = 0; i < detailFormItems.length; i++) {
                            var formItem = detailFormItems.item(i);
                            formLayoutList.add("DetailFormItem_" + formItem.formItemID, formItem);
                            formLayoutTree.insertNewChild("DetailFormItems", "DetailFormItem_" + formItem.formItemID, formItem.displayName);
                        }
                    }
                }                

                //明细表格
                if (billForm.detailGrid) {
                    detailDataGrid = billForm.detailGrid;
                    formLayoutList.add("DetailGrid_" + detailDataGrid.dataGridID, detailDataGrid);
                    formLayoutTree.insertNewChild("BillForm_" + billForm.billFormID, "DetailGrid_" + detailDataGrid.dataGridID, detailDataGrid.dataGridName);
                    if (detailDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < detailDataGrid.gridColumns.length; i++) {
                            var gridColumn = detailDataGrid.gridColumns.item(i);
                            formLayoutList.add("DetailGridColumn_" + gridColumn.gridColumnID, gridColumn);
                            formLayoutTree.insertNewChild("DetailGrid_" + detailDataGrid.dataGridID, "DetailGridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);
                        }
                    }
                }
                //明细表格主参照列 指的是:明细列表中需要显示的主参照字段
                if (billForm.detailGridMainReferColumns) {
                    detailGridMainReferColumns = billForm.detailGridMainReferColumns;
                    formLayoutTree.insertNewChild("BillForm_" + billForm.billFormID, "DetailGridMainReferColumns", "明细主参照列");
                    if (billForm.detailGridMainReferColumns.length > 0) {
                        for (var i = 0; i < detailGridMainReferColumns.length; i++) {
                            var detailGridMainReferColumn = detailGridMainReferColumns.item(i);
                            formLayoutList.add("DetailGridMainReferColumn_" + detailGridMainReferColumn.gridColumnID, detailGridMainReferColumn);
                            formLayoutTree.insertNewChild("DetailGridMainReferColumns", + "DetailGridMainReferColumn_" + detailGridMainReferColumn.gridColumnID, detailGridMainReferColumn.gridHeader);
                        }
                    }
                } 
                //明细主参照表格 指的是:明细弹窗中明细项快查列表中的列
                if (billForm.detailMainReferGrid) {
                    detailMainReferDataGrid = billForm.detailMainReferGrid;
                    formLayoutList.add("DetailMainReferGrid_" + detailMainReferDataGrid.dataGridID, detailMainReferDataGrid);
                    formLayoutTree.insertNewChild("BillForm_" + billForm.billFormID, "DetailMainReferGrid_" + detailMainReferDataGrid.dataGridID, detailMainReferDataGrid.dataGridName);
                    if (detailMainReferDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < detailMainReferDataGrid.gridColumns.length; i++) {
                            var gridColumn = detailMainReferDataGrid.gridColumns.item(i);
                            formLayoutList.add("DetailMainReferGridColumn_" + gridColumn.gridColumnID, gridColumn);
                            formLayoutTree.insertNewChild("DetailMainReferGrid_" + detailMainReferDataGrid.dataGridID, "DetailMainReferGridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);
                        }
                    }
                }
                //明细主参照表单项集合 指的是:明细表如果有参照表,需要现实的对应参照表的字段
                if (billForm.detailMainReferFormItems) {
                    detailMainReferFormItems = billForm.detailMainReferFormItems;
                    formLayoutTree.insertNewChild("BillForm_" + billForm.billFormID, "DetailMainReferFormItems", "明细主参照表单项");
                    if (billForm.detailMainReferFormItems.length > 0) {
                        for (var i = 0; i < detailMainReferFormItems.length; i++) {
                            var formItem = detailMainReferFormItems.item(i);
                            formLayoutList.add("DetailMainReferFormItem_" + formItem.formItemID, formItem);
                            formLayoutTree.insertNewChild("DetailMainReferFormItems", "DetailMainReferFormItem_" + formItem.formItemID, formItem.displayName);
                        }
                    }
                }
                //明细主参照快查匹配列
                if (billForm.detailMainReferFuzzyColumns) {
                    detailMainReferFuzzyColumns = billForm.detailMainReferFuzzyColumns;
                    formLayoutTree.insertNewChild("BillForm_" + billForm.billFormID, "DetailMainReferFuzzyColumns", "明细主参照快查匹配列");
                    if (billForm.detailMainReferFuzzyColumns.length > 0) {
                        for (var i = 0; i < detailMainReferFuzzyColumns.length; i++) {
                            var detailMainReferFuzzyColumn = detailMainReferFuzzyColumns.item(i);
                            formLayoutList.add("DetailMainReferFuzzyColumn_" + detailMainReferFuzzyColumn.gridColumnID, detailMainReferFuzzyColumn);
                            formLayoutTree.insertNewChild("DetailMainReferFuzzyColumns", + "DetailMainReferFuzzyColumn_" + detailMainReferFuzzyColumn.gridColumnID, detailMainReferFuzzyColumn.gridHeader);
                        }
                    }
                }               
            }());

            masterProperties = eval(billForm.masterType + "Class").getProperties().values();
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

            detailProperties = eval(billForm.detailType + "Class").getProperties().values();
            (function (e) {
                var propertyData = null;
                for (var i = 0; i < detailProperties.length; i++) {
                    if (detailProperties[i].designInfo.gridHeader) {
                        propertyData = new rock.JsonData(detailProperties[i].name);
                        propertyData.data.push(0);
                        propertyData.data.push(detailProperties[i].id);
                        propertyData.data.push(detailProperties[i].name);
                        propertyData.data.push(detailProperties[i].displayName);
                        detailPropertyDataList.rows.push(propertyData);
                    }                   
                }
            }());

            detailMainReferProperties = eval(billForm.detailMainReferType + "Class").getProperties().values();
            (function (e) {
                var propertyData = null;
                for (var i = 0; i < detailMainReferProperties.length; i++) {
                    if (detailMainReferProperties[i].designInfo.gridHeader) {
                        propertyData = new rock.JsonData(detailMainReferProperties[i].name);
                        propertyData.data.push(0);
                        propertyData.data.push(detailMainReferProperties[i].id);
                        propertyData.data.push(detailMainReferProperties[i].name);
                        propertyData.data.push(detailMainReferProperties[i].displayName);
                        detailMainReferPropertyDataList.rows.push(propertyData);
                    }                   
                }
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
                IUIDesignService.modifyBillForm.billForm = billForm;
                rock.AjaxRequest(IUIDesignService.modifyBillForm, rock.exceptionFun);
                if (IUIDesignService.modifyBillForm.success) {
                    ISystemService.executeScalar.sqlString = "select Script from BillForm where BillFormID = " + billForm.billFormID;
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
                if (billForm) {
                    IUIDesignService.generateJsCode.fromModel = billForm;
                    IUIDesignService.generateJsCode.templateType = "BillForm";
                    IUIDesignService.generateJsCode.templateName = "BillForm";
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
            case "BillForm":
                propertyGrid.clearAll();
                break;
            case "MasterFormItems":
                for (var i = 0; i < masterPropertyDataList.rows.length; i++) {
                    masterPropertyDataList.rows[i].data[0] = 0;
                }
                if (billForm.masterFormItems.length > 0) {
                    masterFormItems = billForm.masterFormItems;
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
            case "DetailFormItems":
                for (var i = 0; i < detailPropertyDataList.rows.length; i++) {
                    detailPropertyDataList.rows[i].data[0] = 0;
                }
                if (billForm.detailFormItems.length > 0) {
                    detailFormItems = billForm.detailFormItems;
                    for (var i = 0; i < detailFormItems.length; i++) {
                        var detailFormItem = detailFormItems.item(i);
                        for (var j = 0; j < detailPropertyDataList.rows.length; j++) {
                            if (detailPropertyDataList.rows[j].data[1] == detailFormItem.formItemID) {
                                detailPropertyDataList.rows[j].data[0] = 1;
                                break;
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(detailPropertyDataList, "json");
                break;           
            case "DetailGrid":
                for (var i = 0; i < detailPropertyDataList.rows.length; i++) {
                    detailPropertyDataList.rows[i].data[0] = 0;
                }
                if (billForm.detailGrid) {
                    detailDataGrid = billForm.detailGrid;
                    if (detailDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < detailDataGrid.gridColumns.length; i++) {
                            var gridColumn = detailDataGrid.gridColumns.item(i);
                            for (var j = 0; j < detailPropertyDataList.rows.length; j++) {
                                if (detailPropertyDataList.rows[j].data[1] == gridColumn.gridColumnID) {
                                    detailPropertyDataList.rows[j].data[0] = 1;
                                    break;
                                }
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(detailPropertyDataList, "json");
                break;
            case "DetailGridMainReferColumns":
                for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                    detailMainReferPropertyDataList.rows[i].data[0] = 0;
                }
                if (billForm.detailGridMainReferColumns) {
                    detailGridMainReferColumns = billForm.detailGridMainReferColumns;
                    if (detailGridMainReferColumns.length > 0) {
                        for (var i = 0; i < detailGridMainReferColumns.length; i++) {
                            var gridColumn = detailGridMainReferColumns.item(i);
                            for (var j = 0; j < detailMainReferPropertyDataList.rows.length; j++) {
                                if (detailMainReferPropertyDataList.rows[j].data[1] == gridColumn.gridColumnID) {
                                    detailMainReferPropertyDataList.rows[j].data[0] = 1;
                                    break;
                                }
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(detailMainReferPropertyDataList, "json");
                break;
            case "DetailMainReferGrid":
                for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                    detailMainReferPropertyDataList.rows[i].data[0] = 0;
                }
                if (billForm.detailMainReferGrid) {
                    detailMainReferDataGrid = billForm.detailMainReferGrid;
                    if (detailMainReferDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < detailMainReferDataGrid.gridColumns.length; i++) {
                            var gridColumn = detailMainReferDataGrid.gridColumns.item(i);
                            for (var j = 0; j < detailMainReferPropertyDataList.rows.length; j++) {
                                if (detailMainReferPropertyDataList.rows[j].data[1] == gridColumn.gridColumnID) {
                                    detailMainReferPropertyDataList.rows[j].data[0] = 1;
                                    break;
                                }
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(detailMainReferPropertyDataList, "json");
                break;
            case "DetailMainReferFuzzyColumns":
                    for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                        detailMainReferPropertyDataList.rows[i].data[0] = 0;
                    }
                    if (billForm.detailMainReferFuzzyColumns) {
                        detailMainReferFuzzyColumns = billForm.detailMainReferFuzzyColumns;
                        if (detailMainReferFuzzyColumns.length > 0) {
                            for (var i = 0; i < detailMainReferFuzzyColumns.length; i++) {
                                var gridColumn = detailMainReferFuzzyColumns.item(i);
                                for (var j = 0; j < detailMainReferPropertyDataList.rows.length; j++) {
                                    if (detailMainReferPropertyDataList.rows[j].data[1] == gridColumn.gridColumnID) {
                                        detailMainReferPropertyDataList.rows[j].data[0] = 1;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    propertyGrid.clearAll();
                    propertyGrid.parse(detailMainReferPropertyDataList, "json");
                    break;
            case "DetailMainReferFormItems":
                for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                    detailMainReferPropertyDataList.rows[i].data[0] = 0;
                }
                if (billForm.detailMainReferFormItems.length > 0) {
                    detailMainReferFormItems = billForm.detailMainReferFormItems;
                    for (var i = 0; i < detailMainReferFormItems.length; i++) {
                        var detailFormItem = detailMainReferFormItems.item(i);
                        for (var j = 0; j < detailMainReferPropertyDataList.rows.length; j++) {
                            if (detailMainReferPropertyDataList.rows[j].data[1] == detailFormItem.formItemID) {
                                detailMainReferPropertyDataList.rows[j].data[0] = 1;
                                break;
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(detailMainReferPropertyDataList, "json");
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
                var property = eval(billForm.masterType + "Class").getPropertyByID(propertyID);
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
                    billForm.masterFormItems.add(masterFormItem);
                    formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "MasterFormItem_" + masterFormItem.formItemID, masterFormItem.displayName);
                }
                else {
                    masterFormItem = formLayoutList.item("MasterFormItem_" + property.id);
                    formLayoutTree.deleteItem("MasterFormItem_" + property.id, true);
                    formLayoutList.remove("MasterFormItem_" + property.id);
                    billForm.masterFormItems.remove(masterFormItem);
                }
                break;
            case "DetailFormItems":
                var property = eval(billForm.detailType + "Class").getPropertyByID(propertyID);
                var queryItem = null;
                if (state) {
                    detailFormItem = FormItemClass.createInstance();
                    detailFormItem.formItemID = property.id;
                    detailFormItem.formItemName = property.name;
                    detailFormItem.displayName = property.displayName;
                    if (property.designInfo) {
                        detailFormItem.inputType = property.designInfo.inputType;
                        detailFormItem.isReadOnly = property.designInfo.isReadOnly;
                        detailFormItem.isRequired = property.designInfo.isRequired;
                        detailFormItem.validateType = property.designInfo.validateType;
                        detailFormItem.referType = property.designInfo.referType;
                        switch (property.designInfo.queryForm) {
                            case "Combox":
                                if (property.structName && property.designInfo.referType == "") {
                                    detailFormItem.queryType = "Struct";
                                    detailFormItem.structName = property.structName;
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        detailFormItem.queryType = "Refer";
                                    }
                                    else {
                                        detailFormItem.queryType = "None";
                                    }
                                }
                                break;
                            case "Tree":
                                if (property.structName && property.designInfo.referType == "") {
                                    detailFormItem.queryType = "Struct";
                                    detailFormItem.structName = property.structName;
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        detailFormItem.queryType = "Refer";
                                    }
                                }
                                break;
                            case "Quick":
                                if (property.structName) {
                                    detailFormItem.queryType = "Quick";
                                    detailFormItem.structName = property.structName;
                                }
                                break;
                            default:
                                detailFormItem.queryType = "None";
                                break;

                        }
                    }
                    else {
                        alert("未设计界面信息的属性不能作为编辑成员成员!");
                        return;
                    }
                    formLayoutList.add("DetailFormItem_" + detailFormItem.formItemID, detailFormItem);
                    billForm.detailFormItems.add(detailFormItem);
                    formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "DetailFormItem_" + detailFormItem.formItemID, detailFormItem.displayName);
                }
                else {
                    detailFormItem = formLayoutList.item("DetailFormItem_" + property.id);
                    formLayoutTree.deleteItem("DetailFormItem_" + property.id, true);
                    formLayoutList.remove("DetailFormItem_" + property.id);
                    billForm.detailFormItems.remove(detailFormItem);
                }
                break;            
            case "DetailGrid":
                var property = eval(billForm.detailType + "Class").getPropertyByID(propertyID);
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
                        formLayoutList.add("DetailGridColumn_" + gridColumn.gridColumnID, gridColumn);
                        billForm.detailGrid.gridColumns.add(gridColumn);
                        formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "DetailGridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);

                        for (var i = 0; i < detailPropertyDataList.rows.length; i++) {
                            if (detailPropertyDataList.rows[i].data[1] == propertyID) {
                                detailPropertyDataList.rows[i].data[0] = 1;
                                break;
                            }
                        }
                    }
                    else {
                        gridColumn = formLayoutList.item("DetailGridColumn_" + property.id);
                        formLayoutTree.deleteItem("DetailGridColumn_" + property.id, true);
                        formLayoutList.remove("DetailGridColumn_" + property.id);
                        billForm.detailGrid.gridColumns.remove(gridColumn);
                    }
                }
                else {
                    alert("未指定列信息的属性不能作为列表成员!");
                    for (var i = 0; i < detailPropertyDataList.rows.length; i++) {
                        if (detailPropertyDataList.rows[i].data[1] == propertyID) {
                            detailPropertyDataList.rows[i].data[0] = 0;
                            break;
                        }
                    }
                    propertyGrid.clearAll();
                    propertyGrid.parse(detailPropertyDataList, "json");
                }
                break;
            case "DetailGridMainReferColumns":
                var property = eval(billForm.detailMainReferType + "Class").getPropertyByID(propertyID);
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
                        formLayoutList.add("DetailGridMainReferColumn_" + gridColumn.gridColumnID, gridColumn);
                        billForm.detailGridMainReferColumns.add(gridColumn);
                        formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "DetailGridMainReferColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);

                        for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                            if (detailMainReferPropertyDataList.rows[i].data[1] == propertyID) {
                                detailMainReferPropertyDataList.rows[i].data[0] = 1;
                                break;
                            }
                        }
                    }
                    else {
                        gridColumn = formLayoutList.item("DetailGridMainReferColumn_" + property.id);
                        formLayoutTree.deleteItem("DetailGridMainReferColumn_" + property.id, true);
                        formLayoutList.remove("DetailGridMainReferColumn_" + property.id);
                        billForm.detailGridMainReferColumns.remove(gridColumn);
                    }
                }
                else {
                    alert("未指定列信息的属性不能作为列表成员!");
                    for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                        if (detailMainReferPropertyDataList.rows[i].data[1] == propertyID) {
                            detailMainReferPropertyDataList.rows[i].data[0] = 0;
                            break;
                        }
                    }
                    propertyGrid.clearAll();
                    propertyGrid.parse(detailMainReferPropertyDataList, "json");
                }
                break;
            case "DetailMainReferGrid": 
                var property = eval(billForm.detailMainReferType + "Class").getPropertyByID(propertyID);
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
                        formLayoutList.add("DetailMainReferGridColumn_" + gridColumn.gridColumnID, gridColumn);
                        billForm.detailMainReferGrid.gridColumns.add(gridColumn);
                        formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "DetailMainReferGridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);

                        for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                            if (detailMainReferPropertyDataList.rows[i].data[1] == propertyID) {
                                detailMainReferPropertyDataList.rows[i].data[0] = 1;
                                break;
                            }
                        }
                    }
                    else {
                        gridColumn = formLayoutList.item("DetailMainReferGridColumn_" + property.id);
                        formLayoutTree.deleteItem("DetailMainReferGridColumn_" + property.id, true);
                        formLayoutList.remove("DetailMainReferGridColumn_" + property.id);
                        billForm.detailMainReferGrid.gridColumns.remove(gridColumn);
                    }
                }
                else {
                    alert("未指定列信息的属性不能作为列表成员!");
                    for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                        if (detailMainReferPropertyDataList.rows[i].data[1] == propertyID) {
                            detailMainReferPropertyDataList.rows[i].data[0] = 0;
                            break;
                        }
                    }
                    propertyGrid.clearAll();
                    propertyGrid.parse(detailMainReferPropertyDataList, "json");
                }
                break;
            case "DetailMainReferFuzzyColumns":
                var property = eval(billForm.detailMainReferType + "Class").getPropertyByID(propertyID);
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
                        formLayoutList.add("DetailMainReferFuzzyColumn_" + gridColumn.gridColumnID, gridColumn);
                        billForm.detailMainReferFuzzyColumns.add(gridColumn);
                        formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "DetailMainReferFuzzyColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);

                        for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                            if (detailMainReferPropertyDataList.rows[i].data[1] == propertyID) {
                                detailMainReferPropertyDataList.rows[i].data[0] = 1;
                                break;
                            }
                        }
                    }
                    else {
                        gridColumn = formLayoutList.item("DetailMainReferFuzzyColumn_" + property.id);
                        formLayoutTree.deleteItem("DetailMainReferFuzzyColumn_" + property.id, true);
                        formLayoutList.remove("DetailMainReferFuzzyColumn_" + property.id);
                        billForm.detailMainReferFuzzyColumns.remove(gridColumn);
                    }
                }
                else {
                    alert("未指定列信息的属性不能作为列表成员!");
                    for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                        if (detailMainReferPropertyDataList.rows[i].data[1] == propertyID) {
                            detailMainReferPropertyDataList.rows[i].data[0] = 0;
                            break;
                        }
                    }
                    propertyGrid.clearAll();
                    propertyGrid.parse(detailMainReferPropertyDataList, "json");
                }
                break;
            case "DetailMainReferFormItems":
                var property = eval(billForm.detailMainReferType + "Class").getPropertyByID(propertyID);
                var queryItem = null;
                if (state) {
                    detailMainReferFormItem = FormItemClass.createInstance();
                    detailMainReferFormItem.formItemID = property.id;
                    detailMainReferFormItem.formItemName = property.name;
                    detailMainReferFormItem.displayName = property.displayName;
                    if (property.designInfo) {
                        detailMainReferFormItem.inputType = property.designInfo.inputType;
                        detailMainReferFormItem.isReadOnly = property.designInfo.isReadOnly;
                        detailMainReferFormItem.isRequired = property.designInfo.isRequired;
                        detailMainReferFormItem.validateType = property.designInfo.validateType;
                        detailMainReferFormItem.referType = property.designInfo.referType;
                        switch (property.designInfo.queryForm) {
                            case "Combox":
                                if (property.structName && property.designInfo.referType == "") {
                                    detailMainReferFormItem.queryType = "Struct";
                                    detailMainReferFormItem.structName = property.structName;
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        detailMainReferFormItem.queryType = "Refer";
                                    }
                                    else {
                                        detailMainReferFormItem.queryType = "None";
                                    }
                                }
                                break;
                            case "Tree":
                                if (property.structName && property.designInfo.referType == "") {
                                    detailMainReferFormItem.queryType = "Struct";
                                    detailMainReferFormItem.structName = property.structName;
                                }
                                else {
                                    if (property.structName == "" && property.designInfo.referType) {
                                        detailMainReferFormItem.queryType = "Refer";
                                    }
                                }
                                break;
                            case "Quick":
                                if (property.structName) {
                                    detailMainReferFormItem.queryType = "Quick";
                                    detailMainReferFormItem.structName = property.structName;
                                }
                                break;
                            default:
                                detailMainReferFormItem.queryType = "None";
                                break;

                        }
                    }
                    else {
                        alert("未设计界面信息的属性不能作为编辑成员成员!");
                        return;
                    }
                    formLayoutList.add("DetailMainReferFormItem_" + detailMainReferFormItem.formItemID, detailMainReferFormItem);
                    billForm.detailMainReferFormItems.add(detailMainReferFormItem);
                    formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "DetailMainReferFormItem_" + detailMainReferFormItem.formItemID, detailMainReferFormItem.displayName);
                }
                else {
                    detailMainReferFormItem = formLayoutList.item("DetailMainReferFormItem_" + property.id);
                    formLayoutTree.deleteItem("DetailMainReferFormItem_" + property.id, true);
                    formLayoutList.remove("DetailMainReferFormItem_" + property.id);
                    billForm.detailMainReferFormItems.remove(detailMainReferFormItem);
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
