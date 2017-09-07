
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate,
      producer = null,
      canDelete = true,
	  editItem = $("#editItem"),
      dictDataList = new rock.JsonList();
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Producer";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //处理初始化加载数据

        sqlStr = "select top 100 [Producer].[ProducerID], [Producer].[producerName], [Producer].[comment] from [Producer] where 1=1  ";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList);
            }(ISystemService.execQuery.resultValue));
        }
        //初始化实体参照及查询项
        //初始化通用参照
        //绑定控件失去焦点验证方法
        //ProducerClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    toolBar.addText("producerName", null, "生产厂商名称");
    toolBar.addInput("txtproducerNameSearch", null, "", 100);


    toolBar.addText("comment", null, "备注");
    toolBar.addInput("txtcommentSearch", null, "", 100);


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
                sqlStr = "select [Producer].[ProducerID], [Producer].[producerName], [Producer].[comment] from [Producer] where 1=1 ";

                if (toolBar.getValue("txtproducerNameSearch") != "") {
                    sqlStr += " and [Producer].[producerName] = '" + toolBar.getValue("txtproducerNameSearch") + "'";
                }

                if (toolBar.getValue("txtcommentSearch") != "") {
                    sqlStr += " and [Producer].[comment] like '%" + toolBar.getValue("txtcommentSearch") + "%'";
                }

                ISystemService.execQuery.sqlString = sqlStr;
                rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                if (ISystemService.execQuery.success) {
                    (function (e) {
                        rock.tableToListGrid(e, listGrid, dictDataList)
                    }(ISystemService.execQuery.resultValue));
                }
                break;
            case "add":
                editState = "add";
                $("#formTitle").text("添加生产厂商");
                $("#txtproducerName").val("");
                $("#txtcomment").val("");

                producer = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑生产厂商");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "Producer";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                producer = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }


                        $("#txtproducerName").val(producer.producerName);


                        $("#txtcomment").val(producer.comment);


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
                canDelete = true;
                var checked = listGrid.getCheckedRows(0);
                var rowids = checked.split(',');
                for (var i = 0; i < rowids.length; i++) {
                    sqlStr = "select Producer.[ProducerID] from [Producer] inner join Motor on (Producer.ProducerID = Motor.ProducerID) where Producer.ProducerID = " + rowids[i];
                    ISystemService.execQuery.sqlString = sqlStr;
                    rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                    if (ISystemService.execQuery.success) {
                        (function (e) {
                            if (e.rows.length > 0) {
                                canDelete = false;
                            }
                        }(ISystemService.execQuery.resultValue));
                    }
                }
                if (canDelete) {
                    if (confirm("您确定要删除选定的记录吗?")) {
                        for (var i = 0; i < rowids.length; i++) {
                            ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
                            ISystemService.deleteDynObjectByID.structName = "Producer";
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
                    }
                    refreshToolBarState();
                }
                else {
                    alert("选中的生产厂商和电机台账存在关联关系，不能删除，请检查！");
                }
                break;

        }
    });




    //初始化生产厂商列表
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");


    listGrid.setHeader("选择,,生产厂商名称,备注");
    listGrid.setInitWidths("40,0,100,*");
    listGrid.setColAlign("center,left,left,left");
    listGrid.setColSorting("na,na,str,str");
    listGrid.setColTypes("ch,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑生产厂商");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "Producer";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                producer = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtproducerName").val(producer.producerName);


        $("#txtcomment").val(producer.comment);


        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        return true;
    });
    listGrid.init();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(175);
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

    tableString = '<table style="width: 98%"><tr> <td class="label">生产厂商名称</td><td class="inputtd"><input id="txtproducerName" class="smallInput" type="text" /></td></tr><tr> <td class="label">备注</td><td class="inputtd"><input id="txtcomment" class="smallInput" type="text" /></td></tr></table>';
    editItem.html(tableString);


    //保存
    $("#btn_Save").click(function () {
        if (producer == null) {
            producer = ProducerClass.createInstance();
            ISystemService.getNextID.typeName = "Producer";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    producer.producerID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        if (!producer.ValidateValue()) {
            return;
        }

        producer.producerName = $("#txtproducerName").val();


        if ($.trim($("#txtcomment").val()) != '') {
            producer.comment = $("#txtcomment").val();
        }
        else {
            producer.comment = null;
        }


        if (editState == "add") {
            ISystemService.addDynObject.dynObject = producer;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(producer.producerID);
                    dictData.data.push(0);
                    dictData.data.push(producer.producerID);

                    dictData.data.push($("#txtproducerName").val());

                    dictData.data.push($("#txtcomment").val());

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = producer;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == producer.producerID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtproducerName").val();

                            dictDataList.rows[i].data[3] = $("#txtcomment").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("生产厂商修改成功!");
        }



        refreshToolBarState();
    });

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

})