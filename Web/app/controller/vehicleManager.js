var closeUpload = null;
$(function () {
    //初始化系统通用变量
    var toolBar, listGrid, editState, editForm, dictDataList, sqlStr, serverDate, dhxLayout, pictureToolBar, pictureDataView, divUploadLayout, uploadFile, documentToolBar, documentGrid,
      vehicle = null,
	  editItem = $("#editItem"),
	  pictureDataList = [],
	  documentDataList = new rock.JsonList(),
      vehicleID = decodeURI($.getUrlParam("ID"));
      dictDataList = new rock.JsonList();

    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,Vehicle,Carrier";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
              
            }(ISystemService.getServerDate.resultValue));
        }

        //初始化实体参照及查询项
        $("#combocarrier").empty();
        sqlStr = "SELECT [CarrierID],[CarrierName] FROM [Carrier] order by CarrierName";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                toolBar.addListOption("combocarrierSearch", "承运单位", 1, "button", "承运单位")
                if (e != null) {
                    var rows = e.rows;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        $("#combocarrier").append("<option value='" + rowResult[0].value + "'>" + rowResult[1].value + "</option>")
                        toolBar.addListOption("combocarrierSearch", rowResult[0].value, i + 2, "button", rowResult[1].value)
                    }
                }
            }(ISystemService.execQuery.resultValue));
        }

        //处理初始化加载数据
        getDateList();
        //初始化通用参照
        //绑定控件失去焦点验证方法
        //VehicleClass.validateBind();
        //初始化工具栏状态
        refreshToolBarState();
    });
    //界面布局
    dhxLayout = new dhtmlXLayoutObject("mainbody", "2E");
    dhxLayout.cells("a").hideHeader();
    dhxLayout.cells("a").attachObject("mainPage");
    dhxLayout.cells("b").setHeight(280);
    dhxLayout.cells("b").hideHeader();

    //上传文档布局页面
    divUploadLayout = new dhtmlXLayoutObject("divUpload", "1C");
    divUploadLayout.cells("a").hideHeader();

    tabbar = dhxLayout.cells("b").attachTabbar();
    tabbar.addTab("document", "文档", 80, 1);
    //tabbar.addTab("picture", "图片", 80, 1);
    tabbar.tabs("document").setActive();
    tabbar.tabs("document").attachObject("documentDiv");
    //tabbar.tabs("picture").attachObject("pictureDiv");

    //初始化工具条同时处理查询条件
    toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
    toolBar.addText("vehicleNum", null, "车牌号");
    toolBar.addInput("txtvehicleNumSearch", null, "", 100);
    toolBar.addButtonSelect("combocarrierSearch", null, "承运单位", [], null, null, true, true, 15, "select")
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
                getDateList();
                break;
            case "add":
                editState = "add";
                $("#formTitle").text("添加承运车辆");

                $("#txtvehicleNum").val("");

                $("#combocarrier").get(0).selectedIndex = 0;

                $("#txtapprovedLoad").val("");

                $("#txtcargo").val("");


                $("#txtheadTransportDate").val("");

                $("#txtheadDrivingDate").val("");

                $("#txttrailerTransportDate").val("");

                $("#txttrailerDrivingDate").val("");
                $("#txtcontainerCheckDate").val("");
                $("#txtyangziTransportDate").val("");
                $("#txtpoliceDate").val("");

                $("#txtrecommend").val("");
                $("#txtrecommendDate").val("");

                $("#txtvolume").val("");

                $("#txtauditOpinion").val("资质审验合格,准许入厂。");


                $("#txtauditDepart").val("");


                $("#txtauditor").val(decodeURIComponent($.cookie('userTrueName')));


                $("#txtissueDate").val(serverDate);

                $("#txtcomment").val("");

                vehicle = null;
                showEditForm();
                break;
            case "modify":
                editState = "modify";
                $("#formTitle").text("编辑承运车辆");
                var checked = listGrid.getCheckedRows(0);
                if (checked != "") {
                    if (checked.indexOf(',') == -1) {
                        var dictDataID = listGrid.cells(checked, 1).getValue();
                        ISystemService.getDynObjectByID.dynObjectID = dictDataID;
                        ISystemService.getDynObjectByID.structName = "Vehicle";
                        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
                        if (ISystemService.getDynObjectByID.success) {
                            (function (e) {
                                vehicle = e;
                            }(ISystemService.getDynObjectByID.resultValue));
                        }
                        else {
                            return;
                        }

                        $("#txtvehicleNum").val(vehicle.vehicleNum);

                        rock.setSelectItem("combocarrier", vehicle.carrierID, "value");

                        $("#txtapprovedLoad").val(vehicle.approvedLoad);

                        $("#txtcargo").val(vehicle.cargo);

                        $("#txtheadTransportDate").val(vehicle.headTransportDate.split(' ')[0]);

                        $("#txtheadDrivingDate").val(vehicle.headDrivingDate.split(' ')[0]);

                        $("#txttrailerTransportDate").val(vehicle.trailerTransportDate.split(' ')[0]);

                        $("#txttrailerDrivingDate").val(vehicle.trailerDrivingDate.split(' ')[0]);
                        $("#txtcontainerCheckDate").val(vehicle.containerCheckDate.split(' ')[0]);

                        $("#txtyangziTransportDate").val(vehicle.yangziTransportDate.split(' ')[0]);
                        $("#txtpoliceDate").val(vehicle.policeDate.split(' ')[0]);

                        $("#txtrecommend").val(vehicle.recommend);
                        $("#txtvolume").val(vehicle.volume);

                        $("#txtauditOpinion").val(vehicle.auditOpinion);


                        $("#txtauditDepart").val(vehicle.auditDepart);


                        $("#txtauditor").val(vehicle.auditor);


                        $("#txtissueDate").val(vehicle.issueDate.split(' ')[0]);

                        $("#txtcomment").val(vehicle.comment);
                        if (vehicle.recommendDate) {
                            $("#txtrecommendDate").val(vehicle.recommendDate.split(' ')[0]);
                        }
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
                        ISystemService.deleteDynObjectByID.structName = "Vehicle";
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

    //初始化承运车辆列表 
    listGrid = new dhtmlXGridObject("listGrid");
    listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    listGrid.setSkin("dhx_skyblue");
    listGrid.setHeader("选择,,车牌号,承运单位,核定装载量(kg),容积,装载货物,车头道路运输证到期,车头行驶证到期,车挂道路运输证到期,车挂行驶证到期,容器检验日期,扬子通行证有效期,公安局通行证有效期,推荐单位名称,推荐单位有效期,审核意见,审核单位,审核人,签发日期,备注");
    listGrid.setInitWidths("40,0,150,200,100,80,120,120,120,120,120,120,120,120,120,120,120,100,60,80,60");
    listGrid.setColAlign("center,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left,left");
    listGrid.setColSorting("na,na,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str,str");
    listGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    listGrid.enableDistributedParsing(true, 20);
    listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        editState = "modify";
        $("#formTitle").text("编辑承运车辆");
        ISystemService.getDynObjectByID.dynObjectID = rowID;
        ISystemService.getDynObjectByID.structName = "Vehicle";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                vehicle = e;
            }(ISystemService.getDynObjectByID.resultValue));
        }
        else {
            return;
        }

        $("#txtvehicleNum").val(vehicle.vehicleNum);


        rock.setSelectItem("combocarrier", vehicle.carrierID, "value");


        $("#txtapprovedLoad").val(vehicle.approvedLoad);


        $("#txtcargo").val(vehicle.cargo);


        $("#txtheadTransportDate").val(vehicle.headTransportDate.split(' ')[0]);

        $("#txtheadDrivingDate").val(vehicle.headDrivingDate.split(' ')[0]);

        $("#txttrailerTransportDate").val(vehicle.trailerTransportDate.split(' ')[0]);

        $("#txttrailerDrivingDate").val(vehicle.trailerDrivingDate.split(' ')[0]);
        $("#txtcontainerCheckDate").val(vehicle.containerCheckDate.split(' ')[0]);

        $("#txtyangziTransportDate").val(vehicle.yangziTransportDate.split(' ')[0]);
        $("#txtpoliceDate").val(vehicle.policeDate.split(' ')[0]);
        
        $("#txtrecommend").val(vehicle.recommend);
        if (vehicle.recommendDate) {
            $("#txtrecommendDate").val(vehicle.recommendDate.split(' ')[0]);
        } else {
            $("#txtrecommendDate").val('');
        }
        $("#txtvolume").val(vehicle.volume);

        $("#txtauditOpinion").val(vehicle.auditOpinion);


        $("#txtauditDepart").val(vehicle.auditDepart);


        $("#txtauditor").val(vehicle.auditor);


        $("#txtissueDate").val(vehicle.issueDate.split(' ')[0]);

        $("#txtcomment").val(vehicle.comment);


        showEditForm();
    });
    listGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshToolBarState();
        //refreshPictureToolBarState();
        refreshDocumentToolBarState();
        return true;
    });
    listGrid.attachEvent("onRowSelect", function (rowID, cIndex) {
        getUploadDocument(rowID);
        //getUploadPicture(rowID);
        return true;
    });
    listGrid.init();

    //初始化上传文档工具栏
    documentToolBar = new dhtmlXToolbarObject("documentToolBar");
    documentToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    documentToolBar.setSkin("dhx_skyblue");
    documentToolBar.addButton("upload", 2, "上传", "add.png", "addDisabled.png");
    documentToolBar.addSeparator("001", 1);
    documentToolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
    documentToolBar.attachEvent("onClick", function (id) {
        switch (id) {
            case "upload":
                var objectID = listGrid.getCheckedRows(0);
                divUploadLayout.cells("a").attachURL("../view/UploadFile.html?objectID=" + objectID + "&objectType=承运车辆");
                showUploadFile();
                break;
            case "delete":
                var checked = documentGrid.getCheckedRows(0);
                if (confirm("您确定要删除选定的记录吗?")) {
                    var rowids = checked.split(',');
                    var userRoleRelateExist = false;
                    for (var i = 0; i < rowids.length; i++) {
                        ISystemService.deleteUploadFile.uploadFileID = rowids[i];
                        rock.AjaxRequest(ISystemService.deleteUploadFile, rock.exceptionFun);
                        if (ISystemService.deleteUploadFile.success) {
                            (function (e) {
                                for (var j = 0; j < documentDataList.rows.length; j++) {
                                    if (documentDataList.rows[j].id == rowids[i]) {
                                        documentDataList.rows.splice(j, 1);
                                        documentGrid.deleteRow(rowids[i]);
                                        break;
                                    }
                                }
                            }(ISystemService.deleteUploadFile.resultValue));
                        }
                    }
                    refreshDocumentToolBarState();
                }
                break;
        }
    });

    documentGrid = new dhtmlXGridObject("documentGrid");
    documentGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    documentGrid.setSkin("dhx_skyblue");
    documentGrid.setHeader("选择,,文档名称,文档类型,上传时间,文档格式,上传人,");
    documentGrid.setInitWidths("45,0,*,100,120,100,80,0");
    documentGrid.setColAlign("center,left,left,left,left,left,left,left");
    documentGrid.setColTypes("ch,ro,ro,ro,ro,ro,ro,ro");
    documentGrid.setColSorting("na,na,str,str,str,str,str,na");
    documentGrid.enableDistributedParsing(true, 20);
    documentGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        window.open("\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
        //if (documentGrid.cells(rowID, 5).getValue() == '.txt') {
        //    var winname = window.open("\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
        //    winname.document.execCommand('Saveas', false, "\\Upload\\" + documentGrid.cells(rowID, 7).getValue());
        //    winname.close();
        //} else {
        //    window.location.href = "\\Upload\\" + documentGrid.cells(rowID, 7).getValue();

        //}
    });
    //单击选中取消
    documentGrid.attachEvent("onCheck", function (rowID, cIndex) {
        refreshDocumentToolBarState();
        return true;
    });
    documentGrid.init();

    ////初始化上传图片工具栏
    //pictureToolBar = new dhtmlXToolbarObject("pictureToolBar")
    //pictureToolBar.setIconsPath("/resource/dhtmlx/codebase/imgs/own/");
    //pictureToolBar.setSkin("dhx_skyblue");
    //pictureToolBar.addButton("upload", 2, "上传", "add.png", "addDisabled.png");
    //pictureToolBar.addSeparator("001", 1);
    //pictureToolBar.addButton("delete", 3, "删除", "delete.png", "deleteDisabled.png");
    //pictureToolBar.attachEvent("onClick", function (id) {
    //    switch (id) {
    //        case "upload":
    //            var objectID = listGrid.getCheckedRows(0);
    //            divUploadLayout.cells("a").attachURL("../view/UploadPicture.html?objectID=" + objectID + "&objectType=承运车辆");
    //            showUploadFile();
    //            break;
    //        case "delete":
    //            var checked = pictureDataView.getSelected();
    //            if (confirm("您确定要删除选定的记录吗?")) {
    //                if (typeof (checked) == 'string') {
    //                    ISystemService.deleteUploadFile.uploadFileID = checked;
    //                    rock.AjaxRequest(ISystemService.deleteUploadFile, rock.exceptionFun);
    //                    if (ISystemService.deleteUploadFile.success) {
    //                        (function (e) {
    //                            for (var j = 0; j < pictureDataList.length; j++) {
    //                                if (pictureDataList[j].id == checked) {
    //                                    pictureDataList.splice(j, 1);
    //                                    break;
    //                                }
    //                            }
    //                        }(ISystemService.deleteUploadFile.resultValue));
    //                    }
    //                    pictureDataView.clearAll();
    //                    pictureDataView.parse(pictureDataList, "json");
    //                    //refreshPictureToolBarState();
    //                    break;
    //                }
    //                else if (typeof (checked) == 'object') {
    //                    for (var i = 0; i < checked.length; i++) {
    //                        ISystemService.deleteUploadFile.uploadFileID = checked[i];
    //                        rock.AjaxRequest(ISystemService.deleteUploadFile, rock.exceptionFun);
    //                        if (ISystemService.deleteUploadFile.success) {
    //                            (function (e) {
    //                                for (var j = 0; j < pictureDataList.length; j++) {
    //                                    if (pictureDataList[j].id == checked[i]) {
    //                                        pictureDataList.splice(j, 1);
    //                                        pictureDataView.move(checked[i], 0);
    //                                        break;
    //                                    }
    //                                }
    //                            }(ISystemService.deleteUploadFile.resultValue));
    //                        }
    //                    }
    //                    pictureDataView.clearAll();
    //                    pictureDataView.parse(pictureDataList, "json");
    //                    //refreshPictureToolBarState();
    //                    break;
    //                }
    //            }
    //            break;
    //    }
    //});

    //pictureDataView = new dhtmlXDataView({
    //    container: "pictureDataView",
    //    type: {
    //        template: "<img src='#filePath#' style='width:200px ;height:135px'> </img><br/>#fileName#",
    //        height: 140,
    //        width: 200
    //    }
    //});
    ////单击选中取消
    //pictureDataView.attachEvent("onItemClick", function (id, ev, html) {
    //    pictureToolBar.enableItem("delete");
    //    return true;
    //});
    ////单击选中取消
    //pictureDataView.attachEvent("onItemDblClick", function (id, ev, html) {
    //    pictureToolBar.enableItem("delete");
    //    window.open(pictureDataView.get(id).filePath);
    //    return true;
    //});

    //refreshPictureToolBarState();
    refreshDocumentToolBarState();

    //初始化编辑弹窗
    editForm = $("#editForm");

    editForm.height(380);
    editForm.width(800);
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

        if (!$("#txtvehicleNum").validate("required", "车牌号")) {
            return false;
        }
        if (!$("#txtheadDrivingDate").validate("date", "车头行驶证到期日期")) {
            return false;
        }
        if (!$("#txtheadTransportDate").validate("date", "车头道路运输证到期日期")) {
            return false;
        }
        if (!$("#txttrailerDrivingDate").validate("date", "车挂行驶证到期日期")) {
            return false;
        }
        if (!$("#txttrailerTransportDate").validate("date", "车挂道路运输证到期日期")) {
            return false;
        }
        if (!$("#txtcontainerCheckDate").validate("date", "容器检验日期")) {
            return false;
        }
        if (!$("#txtyangziTransportDate").validate("date", "扬子通行证有效期")) {
            return false;
        }
        if (!$("#txtpoliceDate").validate("date", "公安局通行证有效期")) {
            return false;
        }
       
        if (!$("#txtissueDate").validate("date", "签发日期")) {
            return false;
        }

        if ($.trim($("#txtrecommendDate").val()) != "") {
            if (!rock.chkdate($("#txtrecommendDate").val(), "-")) {
                alert("推荐单位有效期格式不正确,正确格式为 2010-10-10！");
                return false;
            }
        }

        if (vehicle == null) {
            vehicle = VehicleClass.createInstance();
            ISystemService.getNextID.typeName = "Vehicle";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    vehicle.vehicleID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
    
        vehicle.vehicleNum = $("#txtvehicleNum").val();

        vehicle.carrierID = $("#combocarrier").val();


        if ($.trim($("#txtapprovedLoad").val()) != '') {
            vehicle.approvedLoad = $("#txtapprovedLoad").val();
        }
        else {
            vehicle.approvedLoad = null;
        }


        if ($.trim($("#txtcargo").val()) != '') {
            vehicle.cargo = $("#txtcargo").val();
        }
        else {
            vehicle.cargo = null;
        }

        vehicle.headTransportDate = $("#txtheadTransportDate").val();
        vehicle.headDrivingDate = $("#txtheadDrivingDate").val();

        vehicle.trailerTransportDate = $("#txttrailerTransportDate").val();
        vehicle.trailerDrivingDate = $("#txttrailerDrivingDate").val();
        vehicle.containerCheckDate = $("#txtcontainerCheckDate").val();
        vehicle.yangziTransportDate = $("#txtyangziTransportDate").val();
        vehicle.policeDate = $("#txtpoliceDate").val();
               
        
        if ($.trim($("#txtrecommend").val()) != '') {
            vehicle.recommend = $("#txtrecommend").val();
        }
        else {
            vehicle.recommend = null;
        }
        if ($.trim($("#txtrecommendDate").val()) != "") {
            vehicle.recommendDate = $("#txtrecommendDate").val();
        }

        if ($.trim($("#txtvolume").val()) != '') {
            vehicle.volume = $("#txtvolume").val();
        }
        else {
            vehicle.volume = null;
        }


        if ($.trim($("#txtauditOpinion").val()) != '') {
            vehicle.auditOpinion = $("#txtauditOpinion").val();
        }
        else {
            vehicle.auditOpinion = null;
        }

        if ($.trim($("#txtauditDepart").val()) != '') {
            vehicle.auditDepart = $("#txtauditDepart").val();
        }
        else {
            vehicle.auditDepart = null;
        }

        if ($.trim($("#txtauditor").val()) != '') {
            vehicle.auditor = $("#txtauditor").val();
        }
        else {
            vehicle.auditor = null;
        }

        if ($.trim($("#txtissueDate").val()) != '') {
            vehicle.issueDate = $("#txtissueDate").val();
        }
        else {
            vehicle.issueDate = null;
        }

        if ($.trim($("#txtcomment").val()) != '') {
            vehicle.comment = $("#txtcomment").val();
        }
        else {
            vehicle.comment = null;
        }

        //计算过期日期
        //获取承运单位,判断承运单位的最后期限
        var carrier = null;
        ISystemService.getDynObjectByID.dynObjectID = parseInt(vehicle.carrierID,10);
        ISystemService.getDynObjectByID.structName = "Carrier";
        rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
        if (ISystemService.getDynObjectByID.success) {
            (function (e) {
                carrier = e;
            }(ISystemService.getDynObjectByID.resultValue));
        } else {
            alert("获取承运单位出错!");
            return false;
        }

        if (carrier == null) {
            alert("承运单位不存在,请检查!");
            return false;
        }


        var expiryDate = carrier.expiryDate.split(' ')[0];
        if (expiryDate < carrier.businessLicenceDate.split(' ')[0]) {
            expiryDate = carrier.businessLicenceDate.split(' ')[0];
        }

        if (expiryDate < vehicle.headTransportDate) {
            expiryDate = vehicle.headTransportDate;
        }
        if (expiryDate < vehicle.headDrivingDate) {
            expiryDate = vehicle.headDrivingDate;
        }
        if (expiryDate < vehicle.trailerTransportDate) {
            expiryDate = vehicle.trailerTransportDate;
        }
        if (expiryDate < vehicle.trailerDrivingDate) {
            expiryDate = vehicle.trailerDrivingDate;
        }
        if (expiryDate < vehicle.containerCheckDate) {
            expiryDate = vehicle.containerCheckDate;
        }
        if (expiryDate < vehicle.yangziTransportDate) {
            expiryDate = vehicle.yangziTransportDate;
        }
        if (expiryDate < vehicle.policeDate) {
            expiryDate = vehicle.policeDate;
        }
        
        vehicle.expiryDate = expiryDate;

        if (editState == "add") {
            ISystemService.addDynObject.dynObject = vehicle;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    var dictData = new rock.JsonData(vehicle.vehicleID);
                    dictData.data.push(0);
                    dictData.data.push(vehicle.vehicleID);

                    dictData.data.push($("#txtvehicleNum").val());

                    dictData.data.push($("#combocarrier").find("option:selected").text());

                    dictData.data.push($("#txtapprovedLoad").val());
                    dictData.data.push($("#txtvolume").val());
                   
                    dictData.data.push($("#txtcargo").val());

                    dictData.data.push($("#txtheadTransportDate").val());

                    dictData.data.push($("#txtheadDrivingDate").val());

                    dictData.data.push($("#txttrailerTransportDate").val());

                    dictData.data.push($("#txttrailerDrivingDate").val());
                    dictData.data.push($("#txtcontainerCheckDate").val());
                    dictData.data.push($("#txtyangziTransportDate").val());
                    dictData.data.push($("#txtpoliceDate").val());
                    
                    dictData.data.push($("#txtrecommend").val());
                    dictData.data.push($("#txtrecommendDate").val());
                   
                    dictData.data.push($("#txtauditOpinion").val());

                    dictData.data.push($("#txtauditDepart").val());

                    dictData.data.push($("#txtauditor").val());

                    dictData.data.push($("#txtissueDate").val());

                    dictData.data.push($("#txtcomment").val());

                    dictDataList.rows.push(dictData);
                    listGrid.clearAll();
                    listGrid.parse(dictDataList, "json");
                    hideEditForm();
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = vehicle;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    for (var i = 0; i < dictDataList.rows.length; i++) {
                        if (dictDataList.rows[i].id == vehicle.vehicleID) {
                            dictDataList.rows[i].data[0] = 0;

                            dictDataList.rows[i].data[2] = $("#txtvehicleNum").val();

                            dictDataList.rows[i].data[3] = $("#combocarrier").find("option:selected").text();

                            dictDataList.rows[i].data[4] = $("#txtapprovedLoad").val();
                            dictDataList.rows[i].data[5] = $("#txtvolume").val();
                            dictDataList.rows[i].data[6] = $("#txtcargo").val();

                            dictDataList.rows[i].data[7] = $("#txtheadTransportDate").val();

                            dictDataList.rows[i].data[8] = $("#txtheadDrivingDate").val();

                            dictDataList.rows[i].data[9] = $("#txttrailerTransportDate").val();

                            dictDataList.rows[i].data[10] = $("#txttrailerDrivingDate").val();
                            dictDataList.rows[i].data[11] = $("#txtcontainerCheckDate").val();
                            dictDataList.rows[i].data[12] = $("#txtyangziTransportDate").val();
                            dictDataList.rows[i].data[13] = $("#txtpoliceDate").val();
                                                     
                            dictDataList.rows[i].data[14] = $("#txtrecommend").val();
                            dictDataList.rows[i].data[15] = $("#txtrecommendDate").val();
                            
                            dictDataList.rows[i].data[16] = $("#txtauditOpinion").val();

                            dictDataList.rows[i].data[17] = $("#txtauditDepart").val();

                            dictDataList.rows[i].data[18] = $("#txtauditor").val();

                            dictDataList.rows[i].data[19] = $("#txtissueDate").val();

                            dictDataList.rows[i].data[20] = $("#txtcomment").val();

                        }
                    }
                }(ISystemService.modifyDynObject.resultValue));
            }
            listGrid.clearAll();
            listGrid.parse(dictDataList, "json");
            hideEditForm();
            alert("承运车辆修改成功!");
        }
        refreshToolBarState();
    });

    //文档上传
    uploadFile = $("#uploadFile");
    uploadFile.mousedown(function (e) {
        iDiffX = e.pageX - $(this).offset().left;
        iDiffY = e.pageY - $(this).offset().top;
        if (iDiffY < 30) {
            $(document).mousemove(function (e) {
                uploadFile.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
            });
        }
    });
    uploadFile.mouseup(function () {
        $(document).unbind("mousemove");
    });
    hideUploadFile();
    function hideUploadFile() {
        uploadFile.hide();
        uploadFile.css("visibility", "visible");

    }
    function showUploadFile() {
        uploadFile.css({ top: 20, left: 30 }).show();
    }

    //文档上传界面关闭按钮
    $("#uploadFile_Close").click(function () {
        hideUploadFile();
        if (tabbar.getActiveTab() == "picture") {
            //getUploadPicture(listGrid.getCheckedRows(0));
        }
        else if (tabbar.getActiveTab() == "document") {
            getUploadDocument(listGrid.getCheckedRows(0));
        }
    });

    //function getUploadPicture(rowID) {
    //    sqlStr = "SELECT [UploadFileID],[LocalFileName],[ServerFileName] FROM [UploadFile] where [FileType] ='图片' and [ObjectID] = " + rowID + " order by UploadTime desc";
    //    ISystemService.execQuery.sqlString = sqlStr;
    //    rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
    //    if (ISystemService.execQuery.success) {
    //        (function (e) {
    //            if (e != null) {
    //                pictureDataView.clearAll();
    //                pictureDataList = [];
    //                var rows = e.rows;
    //                var rowLength = rows.length;
    //                for (var i = 0; i < rowLength; i++) {
    //                    var rowResult = rows[i].values;
    //                    var listdata = new rock.JsonData(rowResult[0].value);
    //                    listdata.fileName = rowResult[1].value.split('.')[0];
    //                    listdata.filePath = "\\Upload\\" + rowResult[2].value;

    //                    pictureDataList.push(listdata);
    //                }
    //                pictureDataView.parse(pictureDataList, "json");
    //            }
    //        }(ISystemService.execQuery.resultValue));
    //    }
    //}
    function getUploadDocument(rowID) {
        documentGrid.clearAll();
        documentDataList.rows = [];
        sqlStr = "SELECT [UploadFileID],[LocalFileName],[FileType],[UploadTime],[FileFormat],[Uploader],[ServerFileName] FROM [UploadFile] where [FileType] = '文档' and [ObjectID] = " + rowID + "  order by UploadTime desc";
        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                if (e != null) {
                    var rows = e.rows;
                    var colLength = e.columns.length;
                    var rowLength = rows.length;
                    for (var i = 0; i < rowLength; i++) {
                        var rowResult = rows[i].values;
                        var listdata = new rock.JsonData(rowResult[0].value);
                        listdata.data[0] = 0;
                        for (var j = 0; j < colLength; j++) {
                            listdata.data[j + 1] = rowResult[j].value;
                        }
                        documentDataList.rows.push(listdata);
                    }
                    documentGrid.parse(documentDataList, "json");
                }
            }(ISystemService.execQuery.resultValue));
        }
    }

    closeUpload = function () {
        hideUploadFile();
        if (tabbar.getActiveTab() == "picture") {
            //getUploadPicture(listGrid.getCheckedRows(0));
        }
        else if (tabbar.getActiveTab() == "document") {
            getUploadDocument(listGrid.getCheckedRows(0));
        }
    }
    //文档上传界面关闭按钮
    $("#uploadFile_Close").click(closeUpload);
    //if ($.trim($("#txtrecommendDate").val()) != "") {
    //    vehicle.recommendDate = $("#txtrecommendDate").val();
    //}
    function getDateList() {
        sqlStr = "select [Vehicle].[VehicleID], [Vehicle].[vehicleNum], [Carrier].[CarrierName], [Vehicle].[approvedLoad], [Vehicle].[Volume], [Vehicle].[cargo], convert(nvarchar(10),[Vehicle].[HeadTransportDate],120) as HeadTransportDate, convert(nvarchar(10),[Vehicle].[HeadDrivingDate],120) as HeadDrivingDate, convert(nvarchar(10),[Vehicle].[TrailerTransportDate],120) as TrailerTransportDate, convert(nvarchar(10),[Vehicle].[TrailerDrivingDate],120) as TrailerDrivingDate, convert(nvarchar(10),[Vehicle].[ContainerCheckDate],120) as ContainerCheckDate, convert(nvarchar(10),[Vehicle].[YangziTransportDate],120) as YangziTransportDate, convert(nvarchar(10),[Vehicle].[PoliceDate],120) as PoliceDate, [Vehicle].[recommend], convert(nvarchar(10),[Vehicle].[RecommendDate],120) as RecommendDate, [Vehicle].[auditOpinion], [Vehicle].[auditDepart], [Vehicle].[auditor], convert(nvarchar(10),[Vehicle].[issueDate],120) as issueDate, [Vehicle].[comment] from [Vehicle] join [Carrier] on [Vehicle].[carrierID] = [Carrier].[carrierID]";

        if (toolBar.getValue("txtvehicleNumSearch") != "") {
            sqlStr += " and [Vehicle].[vehicleNum] like '%" + toolBar.getValue("txtvehicleNumSearch") + "%'";
        }

        if (toolBar.getItemText("combocarrierSearch") != "承运单位") {
            sqlStr += " and [Carrier].[CarrierName] = '" + toolBar.getItemText("combocarrierSearch") + "'";
        }

        ISystemService.execQuery.sqlString = sqlStr;
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, listGrid, dictDataList)
            }(ISystemService.execQuery.resultValue));
        }
    }
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
    //文档上传按钮状态控制
    function refreshDocumentToolBarState() {
        var checked = listGrid.getCheckedRows(0);
        var rowids = checked.split(',');
        if (checked == "") {
            documentToolBar.disableItem("upload");
            documentToolBar.disableItem("delete");
        }
        else {
            if (rowids.length != 1) {
                documentToolBar.disableItem("upload");
            }
            else {
                documentToolBar.enableItem("upload");
            }
        }
        var checked = documentGrid.getCheckedRows(0);
        if (checked == "") {
            documentToolBar.disableItem("delete");
        }
        else {
            documentToolBar.enableItem("delete");
        }
    }
    ////图片上传按钮状态控制
    //function refreshPictureToolBarState() {
    //    var checked = listGrid.getCheckedRows(0);
    //    var rowids = checked.split(',');
    //    if (checked == "") {
    //        pictureToolBar.disableItem("upload");
    //        pictureToolBar.disableItem("delete");
    //    }
    //    else {
    //        if (rowids.length != 1) {
    //            pictureToolBar.disableItem("upload");
    //        }
    //        else {
    //            pictureToolBar.enableItem("upload");
    //        }
    //    }

    //    var checked = pictureDataView.getSelected();
    //    if (checked == "") {
    //        pictureToolBar.disableItem("delete");
    //    }
    //    else {
    //        pictureToolBar.enableItem("delete");
    //    }
    //}


    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push("txtheadTransportDate");

    dateboxArray.push("txtheadDrivingDate");

    dateboxArray.push("txttrailerTransportDate");

    dateboxArray.push("txttrailerDrivingDate");
    dateboxArray.push("txtcontainerCheckDate");
    dateboxArray.push("txtyangziTransportDate");
    dateboxArray.push("txtpoliceDate");
    dateboxArray.push("txtrecommendDate");

    dateboxArray.push("txtissueDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})