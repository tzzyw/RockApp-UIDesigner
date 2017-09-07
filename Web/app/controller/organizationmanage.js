$(function () {
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,IAuthConfigService,IEAMService,Organization,DeptLeve";

    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //页面对象声明
        var myform, curNodeID,
        dhxLayout = new dhtmlXLayoutObject("mainbody", "2U"),
        tree = dhxLayout.cells("a").attachTree(),
        toolBar = dhxLayout.cells("b").attachToolbar(),
        organizationList = new rock.RockList(),
        state = null;

        dhxLayout.setImagePath("/resource/dhtmlx/codebase/imgs/");
        dhxLayout.cells("a").setWidth(300);
        dhxLayout.cells("a").hideHeader();
        dhxLayout.cells("b").hideHeader();
        menu = new dhtmlXMenuObject();
        menu.setIconsPath("/resource/dhtmlx/codebase/imgs");
        menu.renderAsContextMenu();
        menu.addNewChild(menu.topId, 0, "add", "添加同级组织机构项", false);
        menu.addNewChild(menu.topId, 1, "addchild", "添加下级组织机构项", false);
        menu.addNewChild(menu.topId, 2, "delete", "删除当前组织机构项", false);
        menu.attachEvent("onClick", function (itemId) {
            if (myform == null) {
                myform = dhxLayout.cells("b").attachForm(formData);
            }
            myform.setItemValue("OrganizationID", "");
            myform.setItemValue("OrganizationName", "");
            myform.setItemValue("QuickSearchCode", "");
            myform.setItemValue("CompanyID", "");
            myform.setItemValue("Grades", "");
            myform.setItemValue("ParentID", "");

            var parentId = tree.getParentId(curNodeID);

            switch (itemId) {
                case "add":
                    state = "add";
                    //获取新ID   
                    ISystemService.getNextID.typeName = "Organization";
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            myform.setItemValue("OrganizationID", e.value);
                        } (ISystemService.getNextID.resultValue));
                    }
                    else {
                        return;
                    }
                    //从organizationList中找到参照Organization确定下面的信息   
                    for (var i = 0; i < organizationList.length; i++) {
                        organization = organizationList[i];
                        if (organization.organizationID == curNodeID) {
                            myform.setItemValue("CompanyID", organization.companyID);
                            myform.setItemValue("Grades", organization.grades);
                            myform.setItemValue("ParentID", organization.parentID);
                        }
                    }
                    toolBar.enableItem("save");
                    toolBar.enableItem("renounce");
                    tree.selectItem(curNodeID, false);
                    break;
                case "addchild":
                    state = "add";
                    //获取新ID   
                    ISystemService.getNextID.typeName = "Organization";
                    rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                    if (ISystemService.getNextID.success) {
                        (function (e) {
                            myform.setItemValue("OrganizationID", e.value);
                        } (ISystemService.getNextID.resultValue));
                    }
                    else {
                        return;
                    }

                    for (var i = 0; i < organizationList.length; i++) {
                        organization = organizationList[i];
                        if (organization.organizationID == curNodeID) {
                            myform.setItemValue("CompanyID", organization.companyID);
                            myform.setItemValue("Grades", organization.grades);
                            myform.setItemValue("ParentID", organization.parentID);
                        }
                    }
                    toolBar.enableItem("save");
                    toolBar.enableItem("renounce");
                    tree.selectItem(curNodeID, false);
                    break;
                case "delete":
                    state = "delete";
                    deletecur(curNodeID);
                    if (parentId > 0) {
                        tree.selectItem(parentId, false);
                    }
                    break;
            }
        });

        tree.setImagePath("/resource/dhtmlx/codebase/imgs/csh_bluefolders/");
        tree.enableTreeLines(true);
        tree.setStdImages("icon_leaf.png", "folderOpen.gif", "folderClosed.gif");
        tree.attachEvent("onSelect", treeSelect);
        tree.enableContextMenu(menu);
        tree.attachEvent("onBeforeContextMenu", function (itemId) {
            //当前结点id
            curNodeID = itemId;
            var hsachild = false;
            //获取organization子节点并填充
            if (!tree.hasChildren(itemId)) {
                IQueryService.execQuery.sqlString = "select OrganizationID, OrganizationName, QuickSearchCode, Grades, ParentID, CompanyID from Organization where ParentID = " + itemId;
                rock.AjaxRequest(IQueryService.execQuery, rock.exceptionFun);
                if (IQueryService.execQuery.success) {
                    (function (e) {
                        if (e != null) {
                            var rows = e.rows;
                            var length = rows.length;
                            if (length > 0) {
                                hsachild = true;
                            }
                            for (var i = 0; i < length; i++) {
                                var rowResult = rows[i].values;

                                var organization = {};
                                organization.organizationID= rowResult[0].value ;
                                organization.organizationName= rowResult[1].value ;
                                organization.quickSearchCode= rowResult[2].value ;
                                organization.grades= rowResult[3].value ;
                                organization.parentID= rowResult[4].value ;
                                organization.companyID= rowResult[5].value ;

                                organizationList.add(organization);
                                tree.insertNewChild(curNodeID, organization.organizationID, organization.organizationName);
                            }
                        }
                    } (IQueryService.execQuery.resultValue));
                }
            }
            if (hsachild) {

                return false;
            }
            else {
                if (tree.hasChildren(itemId)) {
                    menu.showItem('add');
                    menu.showItem('addchild');
                    menu.hideItem('delete');
                }
                else {
                    menu.showItem('add');
                    menu.showItem('addchild');
                    menu.showItem('delete');
                };
                if (tree.getLevel(itemId) == 1) {
                    menu.hideItem('add');
                }
                return true;
            }
        });

        toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
        toolBar.addButton("save", 0, "保存");
        toolBar.addSeparator("001", 1);
        toolBar.addButton("renounce", 2, "放弃");
        toolBar.addSeparator("002", 3);
        toolBar.disableItem("save");
        toolBar.disableItem("renounce");
        toolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "save":
                    //验证部分                
                    var organizationID = myform.getInput("OrganizationID").value;
                    var organizationName = myform.getInput("OrganizationName").value;
                    var quickSearchCode = myform.getInput("QuickSearchCode").value;
                    var grades = myform.getInput("Grades").value;
                    var parentID = myform.getInput("ParentID").value;
                    var companyID = myform.getInput("CompanyID").value;

                    if (!rock.chknum(organizationID)) {
                        alert('组织机构ID输入格式错误');
                        return false;
                    }

                    if (organizationName == '') {
                        alert('组织机构名称不能为空!');
                        return false;
                    }


                    if (!rock.chknum(grades)) {
                        alert('组织机构级次输入格式错误');
                        return false;
                    }

                    if (!rock.chknum(parentID)) {
                        parentID = null;
                    }

                    if (!rock.chknum(companyID)) {
                        companyID = null;
                    }
                    var organization = OrganizationClass.createInstance();
                    organization.organizationID = organizationID;
                    organization.organizationName = organizationName;
                    organization.quickSearchCode = quickSearchCode;
                    organization.grades = grades;
                    organization.parentID = parentID;
                    organization.companyID = companyID;

                    if (state == "add") {
                        ISystemService.addDynObject.dynObject = organization;
                        rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                        if (ISystemService.addDynObject.success) {
                            added();
                        }
                    }
                    else {
                        ISystemService.addDynObject.dynObject = organization;
                        rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                        if (ISystemService.addDynObject.success) {
                            modify();
                        }
                    }
                    break
                case "renounce":
                    toolBar.disableItem("save");
                    toolBar.disableItem("renounce");
                    break
                default:
                    alert(id + "-->出错啦,请查找错误原因!");
            }
        });

        formData = [
        { type: "settings", position: "label-left", labelWidth: 120, inputWidth: 230, labelAlign: "right" },
	    { type: "input", name: "OrganizationID", label: "组织机构流水号" },
        { type: "input", name: "OrganizationName", label: "组织机构名称" },
        { type: "input", name: "QuickSearchCode", label: "快查码" },
        { type: "input", name: "Grades", hidden: true, label: "级次" },
        { type: "input", name: "ParentID", hidden: true, label: "父节点ID" },
        { type: "input", name: "CompanyID", hidden: true, label: "公司ID"}];

        //获取一级组织机构列表
        IQueryService.execQuery.sqlString = "select OrganizationID, OrganizationName, QuickSearchCode, Grades, ParentID, CompanyID from Organization where ParentID is null";
        rock.AjaxRequest(IQueryService.execQuery, rock.exceptionFun);
        if (IQueryService.execQuery.success) {
            (function (e) {
                var rows = e.rows;
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;
                    var organization = {};
                    organization.organizationID = rowResult[0].value;
                    organization.organizationName = rowResult[1].value;
                    organization.quickSearchCode = rowResult[2].value;
                    organization.grades = rowResult[3].value;
                    organization.parentID = rowResult[4].value;
                    organization.companyID = rowResult[5].value;
                    organizationList.add(organization);
                    tree.insertNewChild(0, organization.organizationID, organization.organizationName);
                }
            } (IQueryService.execQuery.resultValue));
        }
        else {
            alert("获取组织子节点出错,请检查!");
            return;
        }

        function treeSelect(itemId) {
            //当前结点id
            curNodeID = itemId;
            //获取organization子节点并填充
            if (!tree.hasChildren(itemId)) {
                IQueryService.execQuery.sqlString = "select OrganizationID, OrganizationName, QuickSearchCode, Grades, ParentID, CompanyID from Organization where ParentID = " + itemId;
                rock.AjaxRequest(IQueryService.execQuery, rock.exceptionFun);
                if (IQueryService.execQuery.success) {
                    (function (e) {
                        var rows = e.rows;
                        for (var i = 0; i < rows.length; i++) {
                            var rowResult = rows[i].values;
                            var organization = {};
                            organization.organizationID = rowResult[0].value;
                            organization.organizationName = rowResult[1].value;
                            organization.quickSearchCode = rowResult[2].value;
                            organization.grades = rowResult[3].value;
                            organization.parentID = rowResult[4].value;
                            organization.companyID = rowResult[5].value;
                            organizationList.add(organization);
                            tree.insertNewChild(curNodeID, organization.organizationID, organization.organizationName);
                        }
                    } (IQueryService.execQuery.resultValue));
                }
                else {
                    alert("获取组织子节点出错,请检查!");
                    return;
                }
            }

            switch (state) {
                case "delete":
                    toolBar.disableItem("save");
                    toolBar.disableItem("renounce");
                    break;
                case "add":
                    toolBar.enableItem("save");
                    toolBar.enableItem("renounce");
                    break;
                default:
                    state = "modify";
                    var hased = false;
                    for (var i = 0; i < organizationList.length; i++) {
                        organization = organizationList[i];
                        if (organization.organizationID == itemId) {
                            if (myform == null) {
                                myform = dhxLayout.cells("b").attachForm(formData);
                            }
                            myform.setItemValue("OrganizationID", organization.organizationID);
                            myform.setItemValue("OrganizationName", organization.organizationName);
                            myform.setItemValue("QuickSearchCode", organization.quickSearchCode);
                            myform.setItemValue("Grades", organization.grades);
                            myform.setItemValue("ParentID", organization.parentID);
                            myform.setItemValue("CompanyID", organization.companyID);
                            toolBar.enableItem("save");
                            toolBar.enableItem("renounce");
                            hased = true;
                        }
                    }
                    if (!hased) {
                        alert("应用程序逻辑出错,列表中不存在当前选中的对象!");
                    }
                    break;
            }
        }

        function fillSubOrganization(e) {
            if (e != null) {
                var rows = e.result.rows;
                for (var i = 0; i < rows.length; i++) {
                    var rowResult = rows[i].values;

                    var organization = new ModuleData;
                    organization.set({ OrganizationID: rowResult[0].value });
                    organization.set({ OrganizationName: rowResult[1].value });
                    organization.set({ QuickSearchCode: rowResult[2].value });
                    organization.set({ Grades: rowResult[3].value });
                    organization.set({ ParentID: rowResult[4].value });
                    organization.set({ CompanyID: rowResult[5].value });

                    organizationList.add(organization);
                    tree.insertNewChild(curNodeID, organization.get('OrganizationID'), organization.get('OrganizationName'));
                }
            }
        }

        function deletecur(itemId) {
            //先判断menulist中是否存在menu对象
            state = null;
            for (var i = 0; i < organizationList.length; i++) {
                organization = organizationList[i];
                if (organization.organizationID == curNodeID) {
                    IAuthConfigService.deleteOrganization.organizationID = curNodeID;
                    rock.AjaxRequest(IAuthConfigService.deleteOrganization, rock.exceptionFun);
                    if (IAuthConfigService.deleteOrganization.success) {
                        (function (e) {
                            tree.deleteItem(curNodeID, true);
                        } (IAuthConfigService.deleteOrganization.resultValue));
                    }
                }
            }
        }

        function added() {
            toolBar.disableItem("save");
            toolBar.disableItem("renounce");
            //在树上添加
            var organization = {};
            organization.organizationID = myform.getInput("OrganizationID").value;
            organization.organizationName = myform.getInput("OrganizationName").value;
            organization.quickSearchCode = myform.getInput("QuickSearchCode").value;
            organization.grades = myform.getInput("Grades").value;
            organization.parentID = myform.getInput("ParentID").value;
            organization.companyID = myform.getInput("CompanyID").value;

            organizationList.add(organization);
            organizationList.add(organization);
            if (organization.parentID == "") {
                tree.insertNewChild(0, organization.organizationID, organization.organizationName);
            }
            else {
                tree.insertNewChild(organization.parentID, organization.organizationID, organization.organizationName);
            }
            tree.selectItem(organization.organizationID, false);
            state = null;
        }

        function modify() {
            toolBar.disableItem("save");
            toolBar.disableItem("renounce");
            state = null;
            for (var i = 0; i < organizationList.length; i++) {
                organization = organizationList[i];
                var localID = organization.organizationID;
                if (localID == curNodeID) {
                    organization.organizationName = myform.getInput("OrganizationName").value;
                    organization.quickSearchCode = myform.getInput("QuickSearchCode").value;
                    tree.setItemText(localID, myform.getInput("OrganizationName").value);
                }
            }
        }
    });
})

