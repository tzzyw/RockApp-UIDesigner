
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
        examination.productName = "食品添加剂正己烷";
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


    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push("txtexamineDate");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');

})