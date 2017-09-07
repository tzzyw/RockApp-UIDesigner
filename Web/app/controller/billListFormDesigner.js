$(function () {
    //初始化系统通用变量
    var dhxLayout, topToolbar, formLayoutTree, formLayoutTree, propertyGrid, masterProperties, detailProperties, detailMainReferProperties,
        formItems, masterDataGrid, detailDataGrid, detailMainReferDataGrid, queryItems, selectedItemType, isChanged, detailMainReferMatchColumns,
        billListForm = null,
      formLayoutList = new rock.Dictionary(),
      masterPropertyDataList = new rock.JsonList(),
      detailPropertyDataList = new rock.JsonList(),
      detailMainReferPropertyDataList = new rock.JsonList(),
    gridList = new rock.JsonList();
    //加载JS脚本库域服务和对象
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,BillListForm,QueryItem,FormItem,DataGrid,GridColumn,IUIDesignService," + $.getUrlParam("MType") + "," + $.getUrlParam("DType") + "," + $.getUrlParam("RType");
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        IUIDesignService.getBillListFormByID.billListFormID = $.getUrlParam("id");;
        rock.AjaxRequest(IUIDesignService.getBillListFormByID, rock.exceptionFun);
        if (IUIDesignService.getBillListFormByID.success) {
            (function (e) {
                billListForm = e;
            }(IUIDesignService.getBillListFormByID.resultValue));
        }
        //初始化当前表单页面
        if (billListForm) {
            (function (e) {
                //初始化当前页面元素到页面结构树   
                formLayoutList.add("BillListForm_" + billListForm.billListFormID, billListForm);
                formLayoutTree.insertNewChild(0, "BillListForm_" + billListForm.billListFormID, billListForm.billListFormName);               
                //查询项
                if (billListForm.queryItems) {
                    queryItems = billListForm.queryItems;
                    formLayoutTree.insertNewChild("BillListForm_" + billListForm.billListFormID, "QueryItems", "查询项");
                    if (billListForm.queryItems.length > 0) {
                        for (var i = 0; i < queryItems.length; i++) {
                            var queryItem = queryItems.item(i);
                            formLayoutList.add("QueryItem_" + queryItem.queryItemID, queryItem);
                            formLayoutTree.insertNewChild("QueryItems", "QueryItem_" + queryItem.queryItemID, queryItem.displayName);
                        }
                    }
                }               

                //主表格
                if (billListForm.masterGrid) {
                    masterDataGrid = billListForm.masterGrid;
                    formLayoutList.add("MasterGrid_" + masterDataGrid.dataGridID, masterDataGrid);
                    formLayoutTree.insertNewChild("BillListForm_" + billListForm.billListFormID, "MasterGrid_" + masterDataGrid.dataGridID, masterDataGrid.dataGridName);
                    if (masterDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < masterDataGrid.gridColumns.length; i++) {
                            var gridColumn = masterDataGrid.gridColumns.item(i);
                            formLayoutList.add("MasterGridColumn_" + gridColumn.gridColumnID, gridColumn);
                            formLayoutTree.insertNewChild("MasterGrid_" + masterDataGrid.dataGridID, "MasterGridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);
                        }
                    }
                }

                //明细表格
                if (billListForm.detailGrid) {
                    detailDataGrid = billListForm.detailGrid;
                    formLayoutList.add("DetailGrid_" + detailDataGrid.dataGridID, detailDataGrid);
                    formLayoutTree.insertNewChild("BillListForm_" + billListForm.billListFormID, "DetailGrid_" + detailDataGrid.dataGridID, detailDataGrid.dataGridName);
                    if (detailDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < detailDataGrid.gridColumns.length; i++) {
                            var gridColumn = detailDataGrid.gridColumns.item(i);
                            formLayoutList.add("DetailGridColumn_" + gridColumn.gridColumnID, gridColumn);
                            formLayoutTree.insertNewChild("DetailGrid_" + detailDataGrid.dataGridID, "DetailGridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);
                        }
                    }
                }
                //明细主参照表格
                if (billListForm.detailMainReferGrid) {
                    detailMainReferDataGrid = billListForm.detailMainReferGrid;
                    formLayoutList.add("DetailMainReferGrid_" + detailMainReferDataGrid.dataGridID, detailMainReferDataGrid);
                    formLayoutTree.insertNewChild("BillListForm_" + billListForm.billListFormID, "DetailMainReferGrid_" + detailMainReferDataGrid.dataGridID, detailMainReferDataGrid.dataGridName);
                    if (detailMainReferDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < detailMainReferDataGrid.gridColumns.length; i++) {
                            var gridColumn = detailMainReferDataGrid.gridColumns.item(i);
                            formLayoutList.add("DetailMainReferGridColumn_" + gridColumn.gridColumnID, gridColumn);
                            formLayoutTree.insertNewChild("DetailMainReferGrid_" + detailMainReferDataGrid.dataGridID, "DetailMainReferGridColumn_" + gridColumn.gridColumnID, gridColumn.gridHeader);
                        }
                    }
                }
               
            }());

            masterProperties = eval(billListForm.masterType + "Class").getProperties().values();
            (function (e) {
                var propertyData = null;
                for (var i = 0; i < masterProperties.length; i++) {
                    propertyData = new rock.JsonData(masterProperties[i].name);

                    propertyData.data.push(0);
                    propertyData.data.push(masterProperties[i].id);
                    propertyData.data.push(masterProperties[i].name);
                    propertyData.data.push(masterProperties[i].displayName);

                    masterPropertyDataList.rows.push(propertyData);                 
                }
                propertyGrid.clearAll();
                propertyGrid.parse(masterPropertyDataList, "json");
            }());

            detailProperties = eval(billListForm.detailType + "Class").getProperties().values();
            (function (e) {
                var propertyData = null;
                for (var i = 0; i < detailProperties.length; i++) {
                    propertyData = new rock.JsonData(detailProperties[i].name);

                    propertyData.data.push(0);
                    propertyData.data.push(detailProperties[i].id);
                    propertyData.data.push(detailProperties[i].name);
                    propertyData.data.push(detailProperties[i].displayName);

                    detailPropertyDataList.rows.push(propertyData);
                }
            }());

            detailMainReferProperties = eval(billListForm.detailMainReferType + "Class").getProperties().values();
            (function (e) {
                var propertyData = null;
                for (var i = 0; i < detailMainReferProperties.length; i++) {
                    propertyData = new rock.JsonData(detailMainReferProperties[i].name);

                    propertyData.data.push(0);
                    propertyData.data.push(detailMainReferProperties[i].id);
                    propertyData.data.push(detailMainReferProperties[i].name);
                    propertyData.data.push(detailMainReferProperties[i].displayName);

                    detailMainReferPropertyDataList.rows.push(propertyData);
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
    topToolbar.addButtonSelect("codeType", null, "代码类型", [], null, null, true, true, 15, "select");
    topToolbar.addButton("generateCode", null, "生成代码");
    topToolbar.attachEvent("onClick", function (itemId) {
        switch (itemId) {
            case "save":
                IUIDesignService.modifyBillListForm.billListForm = billListForm;
                rock.AjaxRequest(IUIDesignService.modifyBillListForm, rock.exceptionFun);
                if (IUIDesignService.modifyBillListForm.success) {
                    ISystemService.executeScalar.sqlString = "select Script from BillListForm where BillListFormID = " + billListForm.billListFormID;
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
                if (billListForm) {
                    switch (topToolbar.getListOptionSelected("codeType")) {
                        case "代码类型":
                            alert("请选择要生成的页面代码类型!");
                            break;
                        case "基本编辑":
                            IUIDesignService.generateJsCode.fromModel = billListForm;
                            IUIDesignService.generateJsCode.templateType = "BillListForm";
                            IUIDesignService.generateJsCode.templateName = "BillListForm";
                            rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                            if (IUIDesignService.generateJsCode.success) {
                                (function (e) {
                                    $("#txtcode").val(e.value);
                                }(IUIDesignService.generateJsCode.resultValue));
                            }
                            break;
                        case "基本附件编辑":
                            IUIDesignService.generateJsCode.fromModel = billListForm;
                            IUIDesignService.generateJsCode.templateType = "BillListForm";
                            IUIDesignService.generateJsCode.templateName = "BillUploadListForm";
                            rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                            if (IUIDesignService.generateJsCode.success) {
                                (function (e) {
                                    $("#txtcode").val(e.value);
                                }(IUIDesignService.generateJsCode.resultValue));
                            }
                            break;
                        case "基本查看":
                            IUIDesignService.generateJsCode.fromModel = billListForm;
                            IUIDesignService.generateJsCode.templateType = "BillListForm";
                            IUIDesignService.generateJsCode.templateName = "BaseBillView";
                            rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                            if (IUIDesignService.generateJsCode.success) {
                                (function (e) {
                                    $("#txtcode").val(e.value);
                                }(IUIDesignService.generateJsCode.resultValue));
                            }
                            break;
                        case "基本附件查看":
                            IUIDesignService.generateJsCode.fromModel = billListForm;
                            IUIDesignService.generateJsCode.templateType = "BillListForm";
                            IUIDesignService.generateJsCode.templateName = "BillUploadView";
                            rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                            if (IUIDesignService.generateJsCode.success) {
                                (function (e) {
                                    $("#txtcode").val(e.value);
                                }(IUIDesignService.generateJsCode.resultValue));
                            }
                            break;
                        case "流程历史查看":
                            IUIDesignService.generateJsCode.fromModel = billListForm;
                            IUIDesignService.generateJsCode.templateType = "BillListForm";
                            IUIDesignService.generateJsCode.templateName = "BillFlowView";
                            rock.AjaxRequest(IUIDesignService.generateJsCode, rock.exceptionFun);
                            if (IUIDesignService.generateJsCode.success) {
                                (function (e) {
                                    $("#txtcode").val(e.value);
                                }(IUIDesignService.generateJsCode.resultValue));
                            }
                            break;
                        case "流程历史附件查看":
                            IUIDesignService.generateJsCode.fromModel = billListForm;
                            IUIDesignService.generateJsCode.templateType = "BillListForm";
                            IUIDesignService.generateJsCode.templateName = "BillFlowUploadView";
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
    topToolbar.addListOption("codeType", "基本附件编辑", 2, "button", "基本+附件编辑")
    topToolbar.addListOption("codeType", "基本查看", 3, "button", "基本查看")
    topToolbar.addListOption("codeType", "基本附件查看", 4, "button", "基本+附件查看")
    topToolbar.addListOption("codeType", "流程历史查看", 5, "button", "基本+流程历史查看")
    topToolbar.addListOption("codeType", "流程历史附件查看", 6, "button", "基本+附件+流程历史查看")


    //初始化页面布局树
    formLayoutTree = dhxLayout.cells("a").attachTree();
    formLayoutTree.setImagePath("../../resource/dhtmlx/codebase/imgs/tree_icon/");
    formLayoutTree.attachEvent("onSelect", function (itemId) {
        curformLayoutTreeNodeID = itemId;
        selectedItemType = itemId.split("_")[0];
        switch (selectedItemType) {
            case "BillListForm":
                propertyGrid.clearAll();
                break;           
            case "QueryItems":
                for (var i = 0; i < masterPropertyDataList.rows.length; i++) {
                    masterPropertyDataList.rows[i].data[0] = 0;
                }
                if (billListForm.queryItems.length > 0) {
                    queryItems = billListForm.queryItems;
                    for (var i = 0; i < queryItems.length; i++) {
                        var queryItem = queryItems.item(i);
                        for (var j = 0; j < masterPropertyDataList.rows.length; j++) {
                            if (masterPropertyDataList.rows[j].data[1] == queryItem.queryItemID) {
                                masterPropertyDataList.rows[j].data[0] = 1;
                                break;
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(masterPropertyDataList, "json");
                break;           
            case "MasterGrid":
                for (var i = 0; i < masterPropertyDataList.rows.length; i++) {
                    masterPropertyDataList.rows[i].data[0] = 0;
                }
                if (billListForm.masterGrid) {
                    masterDataGrid = billListForm.masterGrid;
                    if (masterDataGrid.gridColumns.length > 0) {
                        for (var i = 0; i < masterDataGrid.gridColumns.length; i++) {
                            var gridColumn = masterDataGrid.gridColumns.item(i);
                            for (var j = 0; j < masterPropertyDataList.rows.length; j++) {
                                if (masterPropertyDataList.rows[j].data[1] == gridColumn.gridColumnID) {
                                    masterPropertyDataList.rows[j].data[0] = 1;
                                    break;
                                }
                            }
                        }
                    }
                }
                propertyGrid.clearAll();
                propertyGrid.parse(masterPropertyDataList, "json");
                break;
            case "DetailGrid":
                for (var i = 0; i < detailPropertyDataList.rows.length; i++) {
                    detailPropertyDataList.rows[i].data[0] = 0;
                }
                if (billListForm.detailGrid) {
                    detailDataGrid = billListForm.detailGrid;
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
            case "DetailMainReferGrid":
                for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                    detailMainReferPropertyDataList.rows[i].data[0] = 0;
                }
                if (billListForm.detailMainReferGrid) {
                    detailMainReferDataGrid = billListForm.detailMainReferGrid;
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
            case "QueryItems":
                var property = eval(billListForm.masterType + "Class").getPropertyByID(propertyID);
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
                        switch (property.designInfo.queryForm) {
                            case "Combox":
                                if (property.structName && property.designInfo.referType == "") {
                                    queryItem.queryType = "Struct";
                                    queryItem.structName = property.structName;
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
                                    queryItem.structName = property.structName;
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
                                    queryItem.structName = property.structName;
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
                                    queryItem.queryType = "Struct";
                                    queryItem.structName = property.structName;
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
                    if (property.structName) {
                        queryItem.structName = property.structName;
                        queryItem.queryType = "Struct";
                    }
                    if (property.designInfo) {
                        //如果是模糊查询用TextBox
                        if (property.designInfo.queryForm == "Combox") {
                            queryItem.inputType = "Combox";
                        }
                        else {
                            queryItem.inputType = "TextBox";
                        }
                        queryItem.isRequired = property.designInfo.isRequired;
                        queryItem.queryForm = property.designInfo.queryForm;
                        queryItem.referType = property.designInfo.referType;
                        if (queryItem.queryType != "Struct") {
                            if ((property.designInfo.referType == "None" || property.designInfo.referType == "")) {
                                queryItem.queryType = "None";
                            }
                            else {
                                queryItem.queryType = "Refer";
                            }
                        }
                    }
                    formLayoutList.add("QueryItem_" + queryItem.queryItemID, queryItem);
                    billListForm.queryItems.add(queryItem);
                    formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "QueryItem_" + queryItem.queryItemID, queryItem.displayName);

                }
                else {
                    queryItem = formLayoutList.item("QueryItem_" + property.id);
                    formLayoutTree.deleteItem("QueryItem_" + property.id, true);
                    formLayoutList.remove("QueryItem_" + property.id);
                    billListForm.queryItems.remove(queryItem);
                }
                break;
            case "MasterGrid":
                var property = eval(billListForm.masterType + "Class").getPropertyByID(propertyID);
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
                        billListForm.masterGrid.gridColumns.add(gridColumn);
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
                        billListForm.masterGrid.gridColumns.remove(gridColumn);
                    }
                }
                else {
                    alert("未指定列信息的属性不能作为列表成员!");
                    for (var i = 0; i < masterPropertyDataList.rows.length; i++) {
                        if (masterPropertyDataList.rows[i].data[1] == propertyID) {
                            masterPropertyDataList.rows[i].data[0] = 0;
                            break;
                        }
                    }
                    propertyGrid.clearAll();
                    propertyGrid.parse(masterPropertyDataList, "json");
                }
                break;
            case "DetailGrid":
                var property = eval(billListForm.detailType + "Class").getPropertyByID(propertyID);
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
                        billListForm.detailGrid.gridColumns.add(gridColumn);
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
                        billListForm.detailGrid.gridColumns.remove(gridColumn);
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
            case "DetailMainReferGrid":
                var property = eval(billListForm.detailMainReferType + "Class").getPropertyByID(propertyID);
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
                        billListForm.detailMainReferGrid.gridColumns.add(gridColumn);
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
                        billListForm.detailMainReferGrid.gridColumns.remove(gridColumn);
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
            case "DetailMainReferMatchColumns":
                var property = eval(billListForm.detailMainReferType + "Class").getPropertyByID(propertyID);
                if (state) {
                    formLayoutList.add("DetailMainReferMatchColumn_" + property.name, property.name);
                    billListForm.detailMainReferMatchColumns.add(property.name);
                    formLayoutTree.insertNewChild(curformLayoutTreeNodeID, "DetailMainReferMatchColumn_" + property.name, property.name);

                    for (var i = 0; i < detailMainReferPropertyDataList.rows.length; i++) {
                        if (detailMainReferPropertyDataList.rows[i].data[2] == property.name) {
                            detailMainReferPropertyDataList.rows[i].data[0] = 1;
                            break;
                        }
                    }
                }
                else {
                    matchColumn = formLayoutList.item("DetailMainReferMatchColumn_" + property.name);
                    formLayoutTree.deleteItem("DetailMainReferMatchColumn_" + property.name, true);
                    formLayoutList.remove("DetailMainReferMatchColumn_" + property.name);
                    billListForm.detailMainReferMatchColumns.remove(matchColumn);
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
