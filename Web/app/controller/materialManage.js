
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      material = null,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Material,Producer";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据
        getDataList();
  
        //绑定控件失去焦点验证方法
        //MaterialClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();

        //parent.test = function () {
        //    alert("ss");
        //}
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("materialName", null, "物料名称");
    toolBar.addInput("txtmaterialNameSearch", null, "", 100);


    toolBar.addText("specification", null, "规格型号");
    toolBar.addInput("txtspecificationSearch", null, "", 100);


    toolBar.addButton("query", null, "查询");
    toolBar.addSeparator("sepQuery", null);
    toolBar.addButton("add", null, "添加");
    toolBar.addSeparator("sepAdd", null);
    toolBar.addButton("modify", null, "修改");
    toolBar.addSeparator("sepModify", null);
    toolBar.addButton("delete", null, "删除");
    toolBar.attachEvent("onClick", function (id) {
        switch (id) {

            case "query":
                getDataList();
                break;
            case "add":
                listGrid.selectCell(1, 2);
                listGrid.editCell();
                return;
                editState = "add";
                $("#formTitle").text("添加产品(采购物料)");
                //获取可用的物料编号
                ISystemService.executeScalar.sqlString = "select [MaterialCode] from [Material] where [MaterialID] = (select MAX([MaterialID]) from [Material])";
                rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                var warehouseName = null;
                if (ISystemService.executeScalar.success) {
                    (function (e) {
                        var codeval = parseInt(e.value,10);                       
                        $("#txtmaterialCode").val(preZeroFill(codeval + 1, 4));
                    }(ISystemService.executeScalar.resultValue));
                }
                $("#txtmaterialName").val("");
                $("#txtspecification").val("");
                $("#txtdescription").val("");
                $("#txtmeasure").val("吨");
                $("#comboavailable").get(0).selectedIndex = 0;
                $("#comboforSale").get(0).selectedIndex = 0;
                $("#comboforPurchase").get(0).selectedIndex = 0;
                $("#txtcomment").val("");
                material = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑产品(采购物料)");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "Material";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                material = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        $("#txtmaterialCode").val(material.materialCode);
                        $("#txtmaterialName").val(material.materialName);
                        $("#txtspecification").val(material.specification);
                        $("#txtdescription").val(material.description);
                        $("#txtmeasure").val(material.measure);
                        rock.setSelectItem("comboavailable", material.available, "value");
                        rock.setSelectItem("comboforSale", material.forSale, "value");
                        rock.setSelectItem("comboforPurchase", material.forPurchase, "value");
                        $("#txtcomment").val(material.comment);
                        showEditForm();
                    }
                    else {
                        alert("请仅选择一条要修改的行!");
                    }
                }
                else {
                    alert("请选择要修改的行!");
                }
                break;
            case "delete":
                var checked = listGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的记录吗?")) {
                    var rowids = checked.split(',');
                    for (var i = 0; i < rowids.length; i++) {
                        ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                        ISystemService.deleteDynObjectByID.structName = "Material";
                        rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                        if (ISystemService.deleteDynObjectByID.success) {
                            (function (e) {
                                for (var j = 0; j < dictDataList.rows.length; j++) {
                                    if (dictDataList.rows[j].id == rowids[i]) {
                                        dictDataList.rows.splice(j, 1);
                                        listGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(ISystemService.deleteDynObjectByID.resultValue));
                        }
                    }
                    refreshToolBarState();
                }
                break;

        }
    });




    //初始化物料列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,物料编码,物料名称,规格型号,计量单位,是否可用,用于销售,用于采购,物料说明");
    listGrid.setInitWidths("40,0,80,100,150,80,80,80,80,*");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑产品(采购物料)");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "Material";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                material = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtmaterialCode").val(material.materialCode);
        $("#txtmaterialName").val(material.materialName);
        $("#txtspecification").val(material.specification);
        $("#txtdescription").val(material.description);
        $("#txtmeasure").val(material.measure);
        rock.setSelectItem("comboavailable", material.available, "value");
        rock.setSelectItem("comboforSale", material.forSale, "value");
        rock.setSelectItem("comboforPurchase", material.forPurchase, "value");
        $("#txtcomment").val(material.comment);
        showEditForm();
    });

  

    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

   

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(350);
    editForm.width(450);
    editForm.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;

        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                editForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    editForm.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideEditForm();
    function hideEditForm() {
        editForm.css({ top: 200, left: -1300 }).hide();
        editForm.css("visibility", "visible");
    }
    function showEditForm() {
        editForm.css({ top: 100, left: 180 }).show();
    }
    //取消
    $("#btn_Cancle").click(function () {
        hideEditForm();
    });
    //关闭
    $("#img_Close").click(function () {
        hideEditForm();
    });

    //处理编辑项

    //tableString = '';
    //editItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {
        if (material == null) {
            material = MaterialClass.createInstance();
            ISystemService.getNextID.typeName = "Material";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    material.materialID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!material.ValidateValue()) {
            return;
        }

        material.materialCode = $("#txtmaterialCode").val();
        material.materialName = $("#txtmaterialName").val();
        if ($.trim($("#txtspecification").val()) != '') {
            material.specification = $("#txtspecification").val();
        }
        else {
            material.specification = null;
        }
        if ($.trim($("#txtdescription").val()) != '') {
            material.description = $("#txtdescription").val();
        }
        else {
            material.description = null;
        }
        if ($.trim($("#txtmeasure").val()) != '') {
            material.measure = $("#txtmeasure").val();
        }
        else {
            material.measure = null;
        }
        material.available = $("#comboavailable").val();
        material.forSale = $("#comboforSale").val();
        material.forPurchase = $("#comboforPurchase").val();
        if ($.trim($("#txtcomment").val()) != '') {
            material.comment = $("#txtcomment").val();
        }
        else {
            material.comment = null;
        }        
        if (editState == "add") {
            ISystemService.addDynObject.dynObject = material;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(material.materialID);
                    dictData.data.push(0);
                    dictData.data.push(material.materialID);

                    dictData.data.push($("#txtmaterialCode").val());

                    dictData.data.push($("#txtmaterialName").val());

                    dictData.data.push($("#txtspecification").val());

                    dictData.data.push($("#txtmeasure").val());

                    dictData.data.push($("#comboavailable").find("option:selected").text());

                    dictData.data.push($("#comboforSale").find("option:selected").text());

                    dictData.data.push($("#comboforPurchase").find("option:selected").text());
                   
                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = material;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == material.materialID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtmaterialCode").val();

                            dictDataList.rows[i].data[3] = $("#txtmaterialName").val();

                            dictDataList.rows[i].data[4] = $("#txtspecification").val();

                            dictDataList.rows[i].data[5] = $("#txtmeasure").val();

                            dictDataList.rows[i].data[6] = $("#comboavailable").find("option:selected").text();

                            dictDataList.rows[i].data[7] = $("#comboforSale").find("option:selected").text();

                            dictDataList.rows[i].data[8] = $("#comboforPurchase").find("option:selected").text();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("物料修改成功!");
        }

        refreshToolBarState();
    });

    function getDataList() {
        sqlStr = "select  [Material].[MaterialID], [Material].[materialCode], [Material].[materialName], [Material].[specification], [Material].[measure], CASE [Material].[available] WHEN '1' THEN '是' WHEN '0' THEN '否' END, CASE [Material].[forSale] WHEN '1' THEN '是' WHEN '0' THEN '否' END , CASE [Material].[forPurchase] WHEN '1' THEN '是' WHEN '0' THEN '否' END, [Material].[description] from [Material] where 1=1 ";

        if (toolBar.getValue("txtmaterialNameSearch") != "") {
            sqlStr += " and [Material].[materialName] like '%" + toolBar.getValue("txtmaterialNameSearch") + "%'";
        }
        if (toolBar.getValue("txtspecificationSearch") != "") {
            sqlStr += " and [Material].[specification] like '%" + toolBar.getValue("txtspecificationSearch") + "%'";
        }
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }

    //加载弹窗Div
    //工具栏按钮状态控制
    function refreshToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            toolBar.disableItem("modify");
            toolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                toolBar.disableItem("modify");
            }
            else {
                toolBar.enableItem("modify");
            }
            toolBar.enableItem("delete");
        }
    }

    function preZeroFill(num, size) {
        if (num >= Math.pow(10, size)) { //如果num本身位数不小于size位
            return num.toString();
        } else {
            var _str = Array(size + 1).join('0') + num;
            return _str.slice(_str.length - size);
        }
    }

   

})