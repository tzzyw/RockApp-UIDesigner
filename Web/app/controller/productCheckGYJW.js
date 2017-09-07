
$(function () {

    //初始化系统通用变量
    var sqlStr, serverDate,
      examination = null;
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
    //加载动态脚本
    var jsTypes = "ISystemService,IBusinessService,DataTable,DataRow,DataColumn,Examination";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {

        $("#txtexaminationNun").val("");
        $("#txtproductName").val("");
        $("#txtstorageBatch").val("");
        $("#txtexamineDate").val(serverDate);
        $("#txtmidu").val("");
        $("#txtqiwei").val("");
        $("#txtbeikszdcz").val("");
        $("#txtxiuzs").val("");
        $("#txtsaibtsh").val("");
        $("#txtbogsh").val("");
        $("#txtchuld").val("");
        $("#txtgand").val("");
        $("#txtbuhfw").val("");
        $("#txtliuhl").val("");
        $("#txtbenhl").val("");
        $("#txtzhengjwhl").val("");
        $("#txtqian").val("");
        $("#txtshen").val("");
        $("#txtsedh").val("");
        $("#txttongpfs").val("");
        $("#txtjixzzjsf").val("");
        $("#txtshuihl").val("");
        $("#txtinspector").val("");
        $("#txtliucl100d").val("");
        $("#txtliucl120d").val("");
        $("#txtcanll").val("");
        $("#txtxiuz").val("");
        $("#txtfangxthl").val("");
        $("#txtbossy").val("");
        $("#txtshuirxshj").val("");
        $("#txtyouzsy").val("");
        $("#txtmTBE").val("");
        $("#txtjuhw").val("");
        $("#txtc4").val("");
        $("#txtjiac").val("");
        $("#txtshudc").val("");
        $("#txtdingx2").val("");
        $("#txtyidx").val("");
        $("#txtc3C4").val("");
        $("#txtzongl").val("");
        $("#txtyouls").val("");
        $("#txtdingx1").val("");
        $("#txtzhengydw").val("");
        $("#txtyidx2dx").val("");
        $("#txtdingexbex").val("");
        $("#txtbingq").val("");
        $("#txtzongqj").val("");
        $("#txtcO").val("");
        $("#txtcO2").val("");
        $("#txtwaig").val("");
        $("#txtfill").val("");
        $("#txtcomment").val("");

    });

    //保存
    $("#btn_Save").click(function () {
        if ($.trim($("#txtstorageBatch").val()) == '') {
            alert("贮存批号不可以为空!");
            return;
        }

        if ($.trim($("txtexamineDate")) == "") {
            alert("检验时间不能为空！");
            return;
        }
        if (!rock.chkdate($("#txtexamineDate").val(), "-")) {
            alert("检验时间格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if ($.trim($("#txtinspector").val()) == '') {
            alert("质量检验员不可以为空!");
            return;
        }

        examination = ExaminationClass.createInstance();
        ISystemService.getNextID.typeName = "Examination";
        rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
        if (ISystemService.getNextID.success) {
            (function (e) {
                examination.examinationID = e.value;
            }(ISystemService.getNextID.resultValue))
        }

        //获取单据号
        IBusinessService.getBillNO.objectType = "质量检验单";
        rock.AjaxRequest(IBusinessService.getBillNO, rock.exceptionFun);
        if (IBusinessService.getBillNO.success) {
            (function (e) {
                examination.examinationNun = e.value;
            }(IBusinessService.getBillNO.resultValue))
        }
        examination.productName = "工业己烷";
        examination.storageBatch = $("#txtstorageBatch").val();
        examination.examineDate = $("#txtexamineDate").val();
        examination.inspector = $("#txtinspector").val();
        examination.fill = decodeURIComponent($.cookie('userTrueName'));
        if ($.trim($("#txtmidu").val()) != '') {
            examination.midu = $("#txtmidu").val();
        }
        else {
            examination.midu = null;
        }


        if ($.trim($("#txtqiwei").val()) != '') {
            examination.qiwei = $("#txtqiwei").val();
        }
        else {
            examination.qiwei = null;
        }


        if ($.trim($("#txtbeikszdcz").val()) != '') {
            examination.beikszdcz = $("#txtbeikszdcz").val();
        }
        else {
            examination.beikszdcz = null;
        }


        if ($.trim($("#txtxiuzs").val()) != '') {
            examination.xiuzs = $("#txtxiuzs").val();
        }
        else {
            examination.xiuzs = null;
        }


        if ($.trim($("#txtsaibtsh").val()) != '') {
            examination.saibtsh = $("#txtsaibtsh").val();
        }
        else {
            examination.saibtsh = null;
        }


        if ($.trim($("#txtbogsh").val()) != '') {
            examination.bogsh = $("#txtbogsh").val();
        }
        else {
            examination.bogsh = null;
        }


        if ($.trim($("#txtchuld").val()) != '') {
            examination.chuld = $("#txtchuld").val();
        }
        else {
            examination.chuld = null;
        }


        if ($.trim($("#txtgand").val()) != '') {
            examination.gand = $("#txtgand").val();
        }
        else {
            examination.gand = null;
        }


        if ($.trim($("#txtbuhfw").val()) != '') {
            examination.buhfw = $("#txtbuhfw").val();
        }
        else {
            examination.buhfw = null;
        }


        if ($.trim($("#txtliuhl").val()) != '') {
            examination.liuhl = $("#txtliuhl").val();
        }
        else {
            examination.liuhl = null;
        }


        if ($.trim($("#txtbenhl").val()) != '') {
            examination.benhl = $("#txtbenhl").val();
        }
        else {
            examination.benhl = null;
        }


        if ($.trim($("#txtzhengjwhl").val()) != '') {
            examination.zhengjwhl = $("#txtzhengjwhl").val();
        }
        else {
            examination.zhengjwhl = null;
        }


        if ($.trim($("#txtqian").val()) != '') {
            examination.qian = $("#txtqian").val();
        }
        else {
            examination.qian = null;
        }


        if ($.trim($("#txtshen").val()) != '') {
            examination.shen = $("#txtshen").val();
        }
        else {
            examination.shen = null;
        }


        if ($.trim($("#txtsedh").val()) != '') {
            examination.sedh = $("#txtsedh").val();
        }
        else {
            examination.sedh = null;
        }


        if ($.trim($("#txttongpfs").val()) != '') {
            examination.tongpfs = $("#txttongpfs").val();
        }
        else {
            examination.tongpfs = null;
        }


        if ($.trim($("#txtjixzzjsf").val()) != '') {
            examination.jixzzjsf = $("#txtjixzzjsf").val();
        }
        else {
            examination.jixzzjsf = null;
        }


        if ($.trim($("#txtshuihl").val()) != '') {
            examination.shuihl = $("#txtshuihl").val();
        }
        else {
            examination.shuihl = null;
        }





        if ($.trim($("#txtliucl100d").val()) != '') {
            examination.liucl100d = $("#txtliucl100d").val();
        }
        else {
            examination.liucl100d = null;
        }


        if ($.trim($("#txtliucl120d").val()) != '') {
            examination.liucl120d = $("#txtliucl120d").val();
        }
        else {
            examination.liucl120d = null;
        }


        if ($.trim($("#txtcanll").val()) != '') {
            examination.canll = $("#txtcanll").val();
        }
        else {
            examination.canll = null;
        }


        if ($.trim($("#txtxiuz").val()) != '') {
            examination.xiuz = $("#txtxiuz").val();
        }
        else {
            examination.xiuz = null;
        }


        if ($.trim($("#txtfangxthl").val()) != '') {
            examination.fangxthl = $("#txtfangxthl").val();
        }
        else {
            examination.fangxthl = null;
        }


        if ($.trim($("#txtbossy").val()) != '') {
            examination.bossy = $("#txtbossy").val();
        }
        else {
            examination.bossy = null;
        }


        if ($.trim($("#txtshuirxshj").val()) != '') {
            examination.shuirxshj = $("#txtshuirxshj").val();
        }
        else {
            examination.shuirxshj = null;
        }


        if ($.trim($("#txtyouzsy").val()) != '') {
            examination.youzsy = $("#txtyouzsy").val();
        }
        else {
            examination.youzsy = null;
        }


        if ($.trim($("#txtmTBE").val()) != '') {
            examination.mTBE = $("#txtmTBE").val();
        }
        else {
            examination.mTBE = null;
        }


        if ($.trim($("#txtjuhw").val()) != '') {
            examination.juhw = $("#txtjuhw").val();
        }
        else {
            examination.juhw = null;
        }


        if ($.trim($("#txtc4").val()) != '') {
            examination.c4 = $("#txtc4").val();
        }
        else {
            examination.c4 = null;
        }


        if ($.trim($("#txtjiac").val()) != '') {
            examination.jiac = $("#txtjiac").val();
        }
        else {
            examination.jiac = null;
        }


        if ($.trim($("#txtshudc").val()) != '') {
            examination.shudc = $("#txtshudc").val();
        }
        else {
            examination.shudc = null;
        }


        if ($.trim($("#txtdingx2").val()) != '') {
            examination.dingx2 = $("#txtdingx2").val();
        }
        else {
            examination.dingx2 = null;
        }


        if ($.trim($("#txtyidx").val()) != '') {
            examination.yidx = $("#txtyidx").val();
        }
        else {
            examination.yidx = null;
        }


        if ($.trim($("#txtc3C4").val()) != '') {
            examination.c3C4 = $("#txtc3C4").val();
        }
        else {
            examination.c3C4 = null;
        }


        if ($.trim($("#txtzongl").val()) != '') {
            examination.zongl = $("#txtzongl").val();
        }
        else {
            examination.zongl = null;
        }


        if ($.trim($("#txtyouls").val()) != '') {
            examination.youls = $("#txtyouls").val();
        }
        else {
            examination.youls = null;
        }


        if ($.trim($("#txtdingx1").val()) != '') {
            examination.dingx1 = $("#txtdingx1").val();
        }
        else {
            examination.dingx1 = null;
        }


        if ($.trim($("#txtzhengydw").val()) != '') {
            examination.zhengydw = $("#txtzhengydw").val();
        }
        else {
            examination.zhengydw = null;
        }


        if ($.trim($("#txtyidx2dx").val()) != '') {
            examination.yidx2dx = $("#txtyidx2dx").val();
        }
        else {
            examination.yidx2dx = null;
        }


        if ($.trim($("#txtdingexbex").val()) != '') {
            examination.dingexbex = $("#txtdingexbex").val();
        }
        else {
            examination.dingexbex = null;
        }


        if ($.trim($("#txtbingq").val()) != '') {
            examination.bingq = $("#txtbingq").val();
        }
        else {
            examination.bingq = null;
        }


        if ($.trim($("#txtzongqj").val()) != '') {
            examination.zongqj = $("#txtzongqj").val();
        }
        else {
            examination.zongqj = null;
        }


        if ($.trim($("#txtcO").val()) != '') {
            examination.cO = $("#txtcO").val();
        }
        else {
            examination.cO = null;
        }


        if ($.trim($("#txtcO2").val()) != '') {
            examination.cO2 = $("#txtcO2").val();
        }
        else {
            examination.cO2 = null;
        }


        if ($.trim($("#txtwaig").val()) != '') {
            examination.waig = $("#txtwaig").val();
        }
        else {
            examination.waig = null;
        }

        if ($.trim($("#txtcomment").val()) != '') {
            examination.comment = $("#txtcomment").val();
        }
        else {
            examination.comment = null;
        }

        ISystemService.addDynObject.dynObject = examination;
        rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
        if (ISystemService.addDynObject.success) {
            $("#btn_Save").attr("disabled", true);
            alert("保存成功!");
        }
    });

    ////初始化工具条同时处理查询条件
    //toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
    //toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");

    //toolBar.addText("productName", null, "产品名称");
    //toolBar.addInput("txtproductNameSearch", null, "", 100);


    //toolBar.addButton("query", null, "查询");
    //toolBar.addSeparator("sepQuery", null);
    //toolBar.addButton("add", null, "添加");
    //toolBar.addSeparator("sepAdd", null);
    //toolBar.addButton("modify", null, "修改");
    //toolBar.addSeparator("sepModify", null);
    //toolBar.addButton("delete", null, "删除");
    //toolBar.attachEvent("onClick", function (id) {
    //    switch (id) {

    //        case "query":


    //            sqlStr = "select [Examination].[ExaminationID], [Examination].[examinationNun], [Examination].[productName], [Examination].[storageBatch], convert(nvarchar(10),[Examination].[examineDate],120) asexamineDate from [Examination] where 1=1 ";

    //            if (toolBar.getValue("txtproductNameSearch") != "") {
    //                sqlStr += " and [Examination].[productName] like '%" + toolBar.getValue("txtproductNameSearch") + "%'";
    //            }



    //            ISystemService.execQuery.sqlString = sqlStr;
    //            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
    //            if (ISystemService.execQuery.success) {
    //                (function (e) {
    //                    rock.tableToListGrid(e, listGrid, dictDataList)
    //                }(ISystemService.execQuery.resultValue));
    //            }
    //            break;
    //        case "add":
    //            editState = "add";
    //            $("#formTitle").text("添加产品检验");




    //            examination = null;
    //            showEditForm();
    //            break;
    //        case "modify":
    //            editState = "modify";
    //            $("#formTitle").text("编辑产品检验");
    //            var checked = listGrid.getCheckedRows(0);
    //            if (checked != "") {
    //                if (checked.indexOf(',') == -1) {
    //                    var dictDataID = listGrid.cells(checked, 1).getValue();
    //                    ISystemService.getDynObjectByID.dynObjectID = dictDataID;
    //                    ISystemService.getDynObjectByID.structName = "Examination";
    //                    rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
    //                    if (ISystemService.getDynObjectByID.success) {
    //                        (function (e) {
    //                            examination = e;
    //                        }(ISystemService.getDynObjectByID.resultValue));
    //                    }
    //                    else {
    //                        return;
    //                    }


    //                    $("#txtexaminationNun").val(examination.examinationNun);


    //                    $("#txtproductName").val(examination.productName);


    //                    $("#txtstorageBatch").val(examination.storageBatch);


    //                    $("#txtexamineDate").val(examination.examineDate.split(' ')[0]);

    //                    $("#txtmidu").val(examination.midu);


    //                    $("#txtqiwei").val(examination.qiwei);


    //                    $("#txtbeikszdcz").val(examination.beikszdcz);


    //                    $("#txtxiuzs").val(examination.xiuzs);


    //                    $("#txtsaibtsh").val(examination.saibtsh);


    //                    $("#txtbogsh").val(examination.bogsh);


    //                    $("#txtchuld").val(examination.chuld);


    //                    $("#txtgand").val(examination.gand);


    //                    $("#txtbuhfw").val(examination.buhfw);


    //                    $("#txtliuhl").val(examination.liuhl);


    //                    $("#txtbenhl").val(examination.benhl);


    //                    $("#txtzhengjwhl").val(examination.zhengjwhl);


    //                    $("#txtqian").val(examination.qian);


    //                    $("#txtshen").val(examination.shen);


    //                    $("#txtsedh").val(examination.sedh);


    //                    $("#txttongpfs").val(examination.tongpfs);


    //                    $("#txtjixzzjsf").val(examination.jixzzjsf);


    //                    $("#txtshuihl").val(examination.shuihl);


    //                    $("#txtinspector").val(examination.inspector);


    //                    $("#txtliucl100d").val(examination.liucl100d);


    //                    $("#txtliucl120d").val(examination.liucl120d);


    //                    $("#txtcanll").val(examination.canll);


    //                    $("#txtxiuz").val(examination.xiuz);


    //                    $("#txtfangxthl").val(examination.fangxthl);


    //                    $("#txtbossy").val(examination.bossy);


    //                    $("#txtshuirxshj").val(examination.shuirxshj);


    //                    $("#txtyouzsy").val(examination.youzsy);


    //                    $("#txtmTBE").val(examination.mTBE);


    //                    $("#txtjuhw").val(examination.juhw);


    //                    $("#txtc4").val(examination.c4);


    //                    $("#txtjiac").val(examination.jiac);


    //                    $("#txtshudc").val(examination.shudc);


    //                    $("#txtdingx2").val(examination.dingx2);


    //                    $("#txtyidx").val(examination.yidx);


    //                    $("#txtc3C4").val(examination.c3C4);


    //                    $("#txtzongl").val(examination.zongl);


    //                    $("#txtyouls").val(examination.youls);


    //                    $("#txtdingx1").val(examination.dingx1);


    //                    $("#txtzhengydw").val(examination.zhengydw);


    //                    $("#txtyidx2dx").val(examination.yidx2dx);


    //                    $("#txtdingexbex").val(examination.dingexbex);


    //                    $("#txtbingq").val(examination.bingq);


    //                    $("#txtzongqj").val(examination.zongqj);


    //                    $("#txtcO").val(examination.cO);


    //                    $("#txtcO2").val(examination.cO2);


    //                    $("#txtwaig").val(examination.waig);


    //                    $("#txtfill").val(examination.fill);


    //                    $("#txtcomment").val(examination.comment);


    //                    showEditForm();
    //                }
    //                else {
    //                    alert("请仅选择一条要修改的行!");
    //                }
    //            }
    //            else {
    //                alert("请选择要修改的行!");
    //            }
    //            break;
    //        case "delete":
    //            var checked = listGrid.getCheckedRows(0);
    //            if (confirm("您确定要删除选定的记录吗?")) {
    //                var rowids = checked.split(',');
    //                for (var i = 0; i < rowids.length; i++) {
    //                    ISystemService.deleteDynObjectByID.dynObjectID = rowids[i];
    //                    ISystemService.deleteDynObjectByID.structName = "Examination";
    //                    rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
    //                    if (ISystemService.deleteDynObjectByID.success) {
    //                        (function (e) {
    //                            for (var j = 0; j < dictDataList.rows.length; j++) {
    //                                if (dictDataList.rows[j].id == rowids[i]) {
    //                                    dictDataList.rows.splice(j, 1);
    //                                    listGrid.deleteRow(rowids[i]);
    //                                    break;
    //                                }
    //                            }
    //                        }(ISystemService.deleteDynObjectByID.resultValue));
    //                    }
    //                }
    //                refreshToolBarState();
    //            }
    //            break;

    //    }
    //});



    ////初始化产品检验列表
    //listGrid = new dhtmlXGridObject("listGrid");
    //listGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    //listGrid.setSkin("dhx_skyblue");


    //listGrid.setHeader("选择,,检验结果编号,产品名称,贮存批号,检验日期");
    //listGrid.setInitWidths("40,0,100,90,80,*");
    //listGrid.setColAlign("center,left,left,left,left,left");
    //listGrid.setColSorting("na,na,str,str,str,str");
    //listGrid.setColTypes("ch,ro,ro,ro,ro,ro");
    //listGrid.enableDistributedParsing(true, 20);
    //listGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
    //    editState = "modify";
    //    $("#formTitle").text("编辑产品检验");
    //    ISystemService.getDynObjectByID.dynObjectID = rowID;
    //    ISystemService.getDynObjectByID.structName = "Examination";
    //    rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
    //    if (ISystemService.getDynObjectByID.success) {
    //        (function (e) {
    //            examination = e;
    //        }(ISystemService.getDynObjectByID.resultValue));
    //    }
    //    else {
    //        return;
    //    }

    //    $("#txtexaminationNun").val(examination.examinationNun);


    //    $("#txtproductName").val(examination.productName);


    //    $("#txtstorageBatch").val(examination.storageBatch);


    //    $("#txtexamineDate").val(examination.examineDate.split(' ')[0]);

    //    $("#txtmidu").val(examination.midu);


    //    $("#txtqiwei").val(examination.qiwei);


    //    $("#txtbeikszdcz").val(examination.beikszdcz);


    //    $("#txtxiuzs").val(examination.xiuzs);


    //    $("#txtsaibtsh").val(examination.saibtsh);


    //    $("#txtbogsh").val(examination.bogsh);


    //    $("#txtchuld").val(examination.chuld);


    //    $("#txtgand").val(examination.gand);


    //    $("#txtbuhfw").val(examination.buhfw);


    //    $("#txtliuhl").val(examination.liuhl);


    //    $("#txtbenhl").val(examination.benhl);


    //    $("#txtzhengjwhl").val(examination.zhengjwhl);


    //    $("#txtqian").val(examination.qian);


    //    $("#txtshen").val(examination.shen);


    //    $("#txtsedh").val(examination.sedh);


    //    $("#txttongpfs").val(examination.tongpfs);


    //    $("#txtjixzzjsf").val(examination.jixzzjsf);


    //    $("#txtshuihl").val(examination.shuihl);


    //    $("#txtinspector").val(examination.inspector);


    //    $("#txtliucl100d").val(examination.liucl100d);


    //    $("#txtliucl120d").val(examination.liucl120d);


    //    $("#txtcanll").val(examination.canll);


    //    $("#txtxiuz").val(examination.xiuz);


    //    $("#txtfangxthl").val(examination.fangxthl);


    //    $("#txtbossy").val(examination.bossy);


    //    $("#txtshuirxshj").val(examination.shuirxshj);


    //    $("#txtyouzsy").val(examination.youzsy);


    //    $("#txtmTBE").val(examination.mTBE);


    //    $("#txtjuhw").val(examination.juhw);


    //    $("#txtc4").val(examination.c4);


    //    $("#txtjiac").val(examination.jiac);


    //    $("#txtshudc").val(examination.shudc);


    //    $("#txtdingx2").val(examination.dingx2);


    //    $("#txtyidx").val(examination.yidx);


    //    $("#txtc3C4").val(examination.c3C4);


    //    $("#txtzongl").val(examination.zongl);


    //    $("#txtyouls").val(examination.youls);


    //    $("#txtdingx1").val(examination.dingx1);


    //    $("#txtzhengydw").val(examination.zhengydw);


    //    $("#txtyidx2dx").val(examination.yidx2dx);


    //    $("#txtdingexbex").val(examination.dingexbex);


    //    $("#txtbingq").val(examination.bingq);


    //    $("#txtzongqj").val(examination.zongqj);


    //    $("#txtcO").val(examination.cO);


    //    $("#txtcO2").val(examination.cO2);


    //    $("#txtwaig").val(examination.waig);


    //    $("#txtfill").val(examination.fill);


    //    $("#txtcomment").val(examination.comment);


    //    showEditForm();
    //});
    //listGrid.attachEvent("onCheck", function (rowID, cIndex) {
    //    refreshToolBarState();
    //    return true;
    //});
    //listGrid.init();

    ////初始化编辑弹窗
    //editForm = $("#editForm");

    //editForm.height(775);
    //editForm.width(650);
    //editForm.mousedown(function (e) {
    //    iDiffX = e.pageX - $(this).offset().left;
    //    iDiffY = e.pageY - $(this).offset().top;

    //    if (iDiffY < 30) {
    //        $(document).mousemove(function (e) {
    //            editForm.css({ "left": (e.pageX - iDiffX), "top": (e.pageY - iDiffY) });
    //        });
    //    }
    //});
    //editForm.mouseup(function () {
    //    $(document).unbind("mousemove");
    //});
    //hideEditForm();
    //function hideEditForm() {
    //    editForm.css({ top: 200, left: -1300 }).hide();
    //    editForm.css("visibility", "visible");
    //}
    //function showEditForm() {
    //    editForm.css({ top: 100, left: 180 }).show();
    //}
    ////取消
    //$("#btn_Cancle").click(function () {
    //    hideEditForm();
    //});
    ////关闭
    //$("#img_Close").click(function () {
    //    hideEditForm();
    //});

    //处理编辑项

    //tableString = '<table style="width: 98%"><tr> <td class="label2">检验结果编号</td><td class="inputtd2"><input id="txtexaminationNun" class="smallInput" type="text" /></td><td class="label2">产品名称</td><td class="inputtd2"><input id="txtproductName" class="smallInput" type="text" /></td></tr><tr> <td class="label2">贮存批号</td><td class="inputtd2"><input id="txtstorageBatch" class="smallInput" type="text" /></td><td class="label2">检验日期</td><td class="inputtd2"><input id="txtexamineDate" class="smallInput" type="text" /></td></tr><tr> <td class="label2">密度</td><td class="inputtd2"><input id="txtmidu" class="smallInput" type="text" /></td><td class="label2">气味</td><td class="inputtd2"><input id="txtqiwei" class="smallInput" type="text" /></td></tr><tr> <td class="label2">贝壳松酯丁醇值</td><td class="inputtd2"><input id="txtbeikszdcz" class="smallInput" type="text" /></td><td class="label2">溴指数</td><td class="inputtd2"><input id="txtxiuzs" class="smallInput" type="text" /></td></tr><tr> <td class="label2">赛波特色号</td><td class="inputtd2"><input id="txtsaibtsh" class="smallInput" type="text" /></td><td class="label2">铂钴色号</td><td class="inputtd2"><input id="txtbogsh" class="smallInput" type="text" /></td></tr><tr> <td class="label2">初馏点</td><td class="inputtd2"><input id="txtchuld" class="smallInput" type="text" /></td><td class="label2">干点</td><td class="inputtd2"><input id="txtgand" class="smallInput" type="text" /></td></tr><tr> <td class="label2">不挥发物</td><td class="inputtd2"><input id="txtbuhfw" class="smallInput" type="text" /></td><td class="label2">硫含量</td><td class="inputtd2"><input id="txtliuhl" class="smallInput" type="text" /></td></tr><tr> <td class="label2">苯含量</td><td class="inputtd2"><input id="txtbenhl" class="smallInput" type="text" /></td><td class="label2">正己烷含量</td><td class="inputtd2"><input id="txtzhengjwhl" class="smallInput" type="text" /></td></tr><tr> <td class="label2">铅</td><td class="inputtd2"><input id="txtqian" class="smallInput" type="text" /></td><td class="label2">砷</td><td class="inputtd2"><input id="txtshen" class="smallInput" type="text" /></td></tr><tr> <td class="label2">色度号</td><td class="inputtd2"><input id="txtsedh" class="smallInput" type="text" /></td><td class="label2">铜片腐蚀</td><td class="inputtd2"><input id="txttongpfs" class="smallInput" type="text" /></td></tr><tr> <td class="label2">机械杂质及水分</td><td class="inputtd2"><input id="txtjixzzjsf" class="smallInput" type="text" /></td><td class="label2">水含量</td><td class="inputtd2"><input id="txtshuihl" class="smallInput" type="text" /></td></tr><tr> <td class="label2">质量检验员</td><td class="inputtd2"><input id="txtinspector" class="smallInput" type="text" /></td><td class="label2">馏出量110度</td><td class="inputtd2"><input id="txtliucl100d" class="smallInput" type="text" /></td></tr><tr> <td class="label2">馏出量120度</td><td class="inputtd2"><input id="txtliucl120d" class="smallInput" type="text" /></td><td class="label2">残留量</td><td class="inputtd2"><input id="txtcanll" class="smallInput" type="text" /></td></tr><tr> <td class="label2">溴值</td><td class="inputtd2"><input id="txtxiuz" class="smallInput" type="text" /></td><td class="label2">芳香烃含量</td><td class="inputtd2"><input id="txtfangxthl" class="smallInput" type="text" /></td></tr><tr> <td class="label2">博士试验</td><td class="inputtd2"><input id="txtbossy" class="smallInput" type="text" /></td><td class="label2">水溶性酸或碱</td><td class="inputtd2"><input id="txtshuirxshj" class="smallInput" type="text" /></td></tr><tr> <td class="label2">油渍试验</td><td class="inputtd2"><input id="txtyouzsy" class="smallInput" type="text" /></td><td class="label2">MTBE</td><td class="inputtd2"><input id="txtmTBE" class="smallInput" type="text" /></td></tr><tr> <td class="label2">聚合物</td><td class="inputtd2"><input id="txtjuhw" class="smallInput" type="text" /></td><td class="label2">碳四</td><td class="inputtd2"><input id="txtc4" class="smallInput" type="text" /></td></tr><tr> <td class="label2">甲醇</td><td class="inputtd2"><input id="txtjiac" class="smallInput" type="text" /></td><td class="label2">叔丁醇</td><td class="inputtd2"><input id="txtshudc" class="smallInput" type="text" /></td></tr><tr> <td class="label2">丁烯2</td><td class="inputtd2"><input id="txtdingx2" class="smallInput" type="text" /></td><td class="label2">异丁烯</td><td class="inputtd2"><input id="txtyidx" class="smallInput" type="text" /></td></tr><tr> <td class="label2">C3C4</td><td class="inputtd2"><input id="txtc3C4" class="smallInput" type="text" /></td><td class="label2">总硫</td><td class="inputtd2"><input id="txtzongl" class="smallInput" type="text" /></td></tr><tr> <td class="label2">游离水</td><td class="inputtd2"><input id="txtyouls" class="smallInput" type="text" /></td><td class="label2">丁烯1</td><td class="inputtd2"><input id="txtdingx1" class="smallInput" type="text" /></td></tr><tr> <td class="label2">正异丁烷</td><td class="inputtd2"><input id="txtzhengydw" class="smallInput" type="text" /></td><td class="label2">异丁烯2丁烯</td><td class="inputtd2"><input id="txtyidx2dx" class="smallInput" type="text" /></td></tr><tr> <td class="label2">丁二稀丙二烯</td><td class="inputtd2"><input id="txtdingexbex" class="smallInput" type="text" /></td><td class="label2">丙炔</td><td class="inputtd2"><input id="txtbingq" class="smallInput" type="text" /></td></tr><tr> <td class="label2">总羰基</td><td class="inputtd2"><input id="txtzongqj" class="smallInput" type="text" /></td><td class="label2">CO</td><td class="inputtd2"><input id="txtcO" class="smallInput" type="text" /></td></tr><tr> <td class="label2">CO2</td><td class="inputtd2"><input id="txtcO2" class="smallInput" type="text" /></td><td class="label2">外观</td><td class="inputtd2"><input id="txtwaig" class="smallInput" type="text" /></td></tr><tr> <td class="label2">填报人员</td><td class="inputtd2"><input id="txtfill" class="smallInput" type="text" /></td><td class="label2">备注</td><td class="inputtd2"><input id="txtcomment" class="smallInput" type="text" /></td></tr></table>';
    //editItem.html(tableString);




    //加载弹窗Div









    ////工具栏按钮状态控制
    //function refreshToolBarState() {
    //    var checked = listGrid.getCheckedRows(0);
    //    var rowids = checked.split(',');
    //    if (checked == "") {
    //        toolBar.disableItem("modify");
    //        toolBar.disableItem("delete");
    //    }
    //    else {
    //        if (rowids.length != 1) {
    //            toolBar.disableItem("modify");
    //        }
    //        else {
    //            toolBar.enableItem("modify");
    //        }
    //        toolBar.enableItem("delete");
    //    }
    //}

    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push("txtexamineDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})