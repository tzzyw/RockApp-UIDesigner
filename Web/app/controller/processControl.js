$(function () {
    var jsTypes = "ISystemService,DataTable,DataColumn,DataRow,Refer,MotorMaintenanceRecord,DepartmentDetail,IMotorMaintenanceService,ProcessControl";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        var tabbar, dhxLayout, toolBar, editState,
        motorMaintenanceRecord = MotorMaintenanceRecordClass.createInstance();
        editState = "add";
        //初始化工具条
        toolBar = new dhtmlXToolbarObject("toolBar", 'dhx_skyblue');
        toolBar.setIconsPath("/resource/dhtmlx/codebase/imgs");
        toolBar.addButton("save", null, "保存");
        toolBar.addSeparator("sepQuery", null);
        toolBar.addButton("save", null, "提交");
        toolBar.attachEvent("onClick", function (id) {
            switch (id) {
                case "save":
                    if ($("#jianxiuriqi").val() == "") {
                        alert("检修日期不能为空！");
                        return;
                    }

                    if ($("#jianxiuriqi").val() == "") {
                        alert("检修日期不能为空！");
                        return;
                    }

                    var sfgzdj = $("#sfgzdj").val();
                    var gzxx = $("#gzxx").val();
                    if (sfgzdj == "是") {
                        if (gzxx == "") {
                            alert("故障电机必须添加故障描述!");
                            return false;
                        }

                    }
                    modifysfgzdj(sfgzdj, gzxx);

                    if (editState == "add") {
                        for (var i = 0; i < 15; i++) {
                            var processControl = ProcessControlClass.createInstance();

                            //获取流程控制卡ID
                            ISystemService.getNextID.typeName = 'ProcessControl';
                            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                            if (ISystemService.getNextID.success) {
                                (function (e) {
                                    processControl.processControlID = e.value;
                                }(ISystemService.getNextID.resultValue))
                            }
                            processControl.motorMaintenanceRecordID = 198;
                            processControl.xuhao = i + 1;
                            if ($("#caozuozhe" + processControl.xuhao).val() != "") {
                                processControl.caozuozhe = $("#caozuozhe" + processControl.xuhao).val();
                            }
                            if ($("#cznyr" + processControl.xuhao).val() != "") {
                                processControl.cznyr = $("#cznyr" + processControl.xuhao).val();
                            }
                            if ($("#jianyanyuan" + processControl.xuhao).val() != "") {
                                processControl.jianyanyuan = $("#jianyanyuan" + processControl.xuhao).val();
                            }
                            if ($("#jynyr" + processControl.xuhao).val() != "") {
                                processControl.jynyr = $("#jynyr" + processControl.xuhao).val();
                            }
                            processControl.beizhu = $("#beizhu" + processControl.xuhao).val();
                            switch (processControl.xuhao) {
                                case 1:
                                    processControl.gxzylc = "修前检查";
                                    break;
                                case 2:
                                    processControl.gxzylc = "修前试车";
                                    break;
                                case 3:
                                    processControl.gxzylc = "电机表面清理";
                                    break;
                                case 4:
                                    processControl.gxzylc = "电机解体";
                                    break;
                                case 5:
                                    processControl.gxzylc = "电机定子检修";
                                    break;
                                case 6:
                                    processControl.gxzylc = "电机转子检修";
                                    break;
                                case 7:
                                    processControl.gxzylc = "轴承检测";
                                    break;
                                case 8:
                                    processControl.gxzylc = "机械尺寸测量";
                                    processControl.jxccclzcsfhd = $("#jxccclzcsfhd").val();
                                    processControl.jxccclzcsffhd = $("#jxccclzcsffhd").val();
                                    processControl.jxccclzjfhd = $("#jxccclzjfhd").val();
                                    processControl.jxccclzjffhd = $("#jxccclzjffhd").val();
                                    break;
                                case 9:
                                    processControl.gxzylc = "机械加工";
                                    break;

                                case 10:
                                    processControl.gxzylc = "尺寸复核";
                                    processControl.ccfhzcsfhd = $("#ccfhzcsfhd").val();
                                    processControl.ccfhzzsffhd = $("#ccfhzzsffhd").val();
                                    processControl.ccfhzjfhd = $("#ccfhzjfhd").val();
                                    processControl.ccfhzjffhd = $("#ccfhzjffhd").val();
                                    break;
                                case 11:
                                    processControl.gxzylc = "装配电机";
                                    break;
                                case 12:
                                    processControl.gxzylc = "试验";
                                    break;
                                case 13:
                                    processControl.gxzylc = "试车";
                                    processControl.kzdla = $("#kzdla").val();
                                    processControl.kzdlb = $("#kzdlb").val();
                                    processControl.kzdlc = $("#kzdlc").val();
                                    processControl.zdfhdsp = $("#zdfhdsp").val();

                                    processControl.zdfhdcz = $("#zdfhdcz").val();
                                    processControl.zdfhdzx = $("#zdfhdzx").val();
                                    processControl.zdffhdsp = $("#zdffhdsp").val();
                                    processControl.zdffhdcz = $("#zdffhdcz").val();

                                    processControl.zdffhdzx = $("#zdffhdzx").val();
                                    processControl.wdfhd = $("#wdfhd").val();
                                    processControl.wdffhd = $("#wdffhd").val();
                                    break;
                                case 14:
                                    processControl.gxzylc = "防腐、出厂";
                                    break;
                                case 15:
                                    processControl.bianzhi = $("#bianzhi").val();
                                    processControl.shenhe = $("#shenhe").val();
                                    processControl.pageCount = $("#pageCount").val() == "" ? 0 : $("#pageCount").val();
                                    processControl.pageIndex = $("#pageIndex").val() == "" ? 0 : $("#pageIndex").val();
                                    break;
                            }
                            ISystemService.addDynObject.dynObject = processControl;
                            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
                            if (ISystemService.addDynObject.success) {
                                (function (e) {
                                }(ISystemService.addDynObject.resultValue));
                            }
                        }
                    }
                    else if (editState == "modify") {
                        for (var i = 0; i < 15; i++) {
                            var processControl = ProcessControlClass.createInstance();

                            //获取流程控制卡ID
                            ISystemService.getNextID.typeName = 'ProcessControl';
                            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
                            if (ISystemService.getNextID.success) {
                                (function (e) {
                                    processControl.processControlID = e.value;
                                }(ISystemService.getNextID.resultValue))
                            }
                            processControl.motorMaintenanceRecordID = 198;
                            processControl.xuhao = i + 1;
                            if ($("#caozuozhe" + processControl.xuhao).val() != "") {
                                processControl.caozuozhe = $("#caozuozhe" + processControl.xuhao).val();
                            }
                            if ($("#cznyr" + processControl.xuhao).val() != "") {
                                processControl.cznyr = $("#cznyr" + processControl.xuhao).val();
                            }
                            if ($("#jianyanyuan" + processControl.xuhao).val() != "") {
                                processControl.jianyanyuan = $("#jianyanyuan" + processControl.xuhao).val();
                            }
                            if ($("#jynyr" + processControl.xuhao).val() != "") {
                                processControl.jynyr = $("#jynyr" + processControl.xuhao).val();
                            }
                            processControl.beizhu = $("#beizhu" + processControl.xuhao).val();
                            switch (processControl.xuhao) {
                                case 1:
                                    processControl.gxzylc = "修前检查";
                                    break;
                                case 2:
                                    processControl.gxzylc = "修前试车";
                                    break;
                                case 3:
                                    processControl.gxzylc = "电机表面清理";
                                    break;
                                case 4:
                                    processControl.gxzylc = "电机解体";
                                    break;
                                case 5:
                                    processControl.gxzylc = "电机定子检修";
                                    break;
                                case 6:
                                    processControl.gxzylc = "电机转子检修";
                                    break;
                                case 7:
                                    processControl.gxzylc = "轴承检测";
                                    break;
                                case 8:
                                    processControl.gxzylc = "机械尺寸测量";
                                    processControl.jxccclzcsfhd = $("#jxccclzcsfhd").val();
                                    processControl.jxccclzcsffhd = $("#jxccclzcsffhd").val();
                                    processControl.jxccclzjfhd = $("#jxccclzjfhd").val();
                                    processControl.jxccclzjffhd = $("#jxccclzjffhd").val();
                                    break;
                                case 9:
                                    processControl.gxzylc = "机械加工";
                                    break;

                                case 10:
                                    processControl.gxzylc = "尺寸复核";
                                    processControl.ccfhzcsfhd = $("#ccfhzcsfhd").val();
                                    processControl.ccfhzzsffhd = $("#ccfhzzsffhd").val();
                                    processControl.ccfhzjfhd = $("#ccfhzjfhd").val();
                                    processControl.ccfhzjffhd = $("#ccfhzjffhd").val();
                                    break;
                                case 11:
                                    processControl.gxzylc = "装配电机";
                                    break;
                                case 12:
                                    processControl.gxzylc = "试验";
                                    break;
                                case 13:
                                    processControl.gxzylc = "试车";
                                    processControl.kzdla = $("#kzdla").val();
                                    processControl.kzdlb = $("#kzdlb").val();
                                    processControl.kzdlc = $("#kzdlc").val();
                                    processControl.zdfhdsp = $("#zdfhdsp").val();

                                    processControl.zdfhdcz = $("#zdfhdcz").val();
                                    processControl.zdfhdzx = $("#zdfhdzx").val();
                                    processControl.zdffhdsp = $("#zdffhdsp").val();
                                    processControl.zdffhdcz = $("#zdffhdcz").val();

                                    processControl.zdffhdzx = $("#zdffhdzx").val();
                                    processControl.wdfhd = $("#wdfhd").val();
                                    processControl.wdffhd = $("#wdffhd").val();
                                    break;
                                case 14:
                                    processControl.gxzylc = "防腐、出厂";
                                    break;
                                case 15:
                                    processControl.bianzhi = $("#bianzhi").val();
                                    processControl.shenhe = $("#shenhe").val();
                                    processControl.pageCount = $("#pageCount").val();
                                    processControl.pageIndex = $("#pageIndex").val();
                                    break;
                            }
                            ISystemService.modifyDynObject.dynObject = processControl;
                            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
                            if (ISystemService.modifyDynObject.success) {
                                (function (e) {
                                }(ISystemService.modifyDynObject.resultValue));
                            }
                        }
                    }
                    break;
            }
        });
        //构造Tab页
        tabbar = new dhtmlXTabBar({
            parent: "tabcontainer",
            skin: 'dhx_skyblue',
            tabs: [
            { id: "ddjmp", text: "详细信息", active: true }
            ]
        });

        //初始化Tab页内容
        tabbar.tabs("ddjmp").attachObject("ddjmp");

        IMotorMaintenanceService.getMotorMaintenanceRecordByID.motorMaintenanceRecordID = 198;
        rock.AjaxRequest(IMotorMaintenanceService.getMotorMaintenanceRecordByID, rock.exceptionFun);
        if (IMotorMaintenanceService.getMotorMaintenanceRecordByID.success) {
            (function (e) {
                motorMaintenanceRecord = e;
                ISystemService.executeScalar.sqlString = "select DepartmentName from [Department] where [DepartmentID] = " + motorMaintenanceRecord.departmentID;
                rock.AjaxRequest(ISystemService.executeScalar, rock.exceptionFun);
                var warehouseName = null;
                if (ISystemService.executeScalar.success) {
                    (function (e) {
                        $("#departmentName").val(e.value);
                    }(ISystemService.executeScalar.resultValue));
                }
                $("#sfgzdj").val(motorMaintenanceRecord.sfgzdj);
                $("#gzxx").val(motorMaintenanceRecord.gzxx);
                $("#equipmentName").val(motorMaintenanceRecord.equipmentName);
                $("#dianjiweihao").val(motorMaintenanceRecord.motorNumber);
                $("#gongzuolinghao").val(motorMaintenanceRecord.gongzuolinghao);
                $("#kapianhao").val(motorMaintenanceRecord.kapianhao);
                $("#departmentID").val(motorMaintenanceRecord.departmentID);
                $("#xiangmufuzeren").val(motorMaintenanceRecord.xiangmufuzeren);
                if (editState == "add") {
                    var referSql = "SELECT[ProcessControlID],[xuhao],[gxzylc],[caozuozhe],convert(nvarchar(10),[cznyr],120),[jianyanyuan],convert(nvarchar(10),[jynyr],120),[jxccclzcsfhd],[jxccclzcsffhd],[jxccclzjfhd],[jxccclzjffhd],[kzdla],[kzdlb],[kzdlc],[zdfhdsp],[zdfhdcz],[zdfhdzx],[zdffhdsp],[zdffhdcz],[zdffhdzx],[wdfhd],[wdffhd],[beizhu],[ccfhzcsfhd],[ccfhzzsffhd],[ccfhzjfhd],[ccfhzjffhd],[bianzhi],[shenhe],[pageCount],[pageIndex]FROM[ProcessControl] where [MotorMaintenanceRecordID]=198 order by xuhao";
                    ISystemService.execQuery.sqlString = referSql;
                    rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
                    if (ISystemService.execQuery.success) {
                        (function (e) {
                            if (e != null) {
                                var rows = e.rows;

                                for (var i = 0; i < rows.length; i++) {
                                    var rowResult = rows[i].values;
                                    $("#caozuozhe" + (i + 1)).val(rowResult[3].value);
                                    $("#cznyr" + (i + 1)).val(rowResult[4].value);
                                    $("#jianyanyuan" + (i + 1)).val(rowResult[5].value);
                                    $("#jynyr" + (i + 1)).val(rowResult[6].value);
                                    $("#beizhu" + (i + 1)).val(rowResult[22].value);
                                    switch (rowResult[1].value) {
                                        case "8":
                                            $("#jxccclzcsfhd").val(rowResult[7].value);
                                            $("#jxccclzcsffhd").val(rowResult[8].value);
                                            $("#jxccclzjfhd").val(rowResult[9].value);
                                            $("#jxccclzjffhd").val(rowResult[10].value);
                                            break;
                                        case "10":
                                            $("#ccfhzcsfhd").val(rowResult[23].value);
                                            $("#ccfhzzsffhd").val(rowResult[24].value);
                                            $("#ccfhzjfhd").val(rowResult[25].value);
                                            $("#ccfhzjffhd").val(rowResult[26].value);
                                            break;
                                        case "13":
                                            $("#kzdla").val(rowResult[11].value);
                                            $("#kzdlb").val(rowResult[12].value);
                                            $("#kzdlc").val(rowResult[13].value);
                                            $("#zdfhdsp").val(rowResult[14].value);

                                            $("#zdfhdcz").val(rowResult[15].value);
                                            $("#zdfhdzx").val(rowResult[16].value);
                                            $("#zdffhdsp").val(rowResult[17].value);
                                            $("#zdffhdcz").val(rowResult[18].value);

                                            $("#zdffhdzx").val(rowResult[19].value);
                                            $("#wdfhd").val(rowResult[20].value);
                                            $("#wdffhd").val(rowResult[21].value);
                                            break;
                                        case "15":
                                            $("#bianzhi").val(rowResult[27].value);
                                            $("#shenhe").val(rowResult[28].value);
                                            $("#pageCount").val(rowResult[29].value);
                                            $("#pageIndex").val(rowResult[30].value);
                                            break;
                                    }
                                }
                            }
                        }(ISystemService.execQuery.resultValue));
                    }
                }
            }(IMotorMaintenanceService.getMotorMaintenanceRecordByID.resultValue));
        }

        function modifysfgzdj(sfgzdj, gzxx) {
            //修改检修记录状态和故障描述   
            if (sfgzdj == "是") {
                ISystemService.excuteNoneReturnQuery.sqlString = "UPDATE [MotorMaintenanceRecord] SET [sfgzdj] = '" + sfgzdj + "', gzxx = '" + gzxx + "' WHERE MotorMaintenanceRecordID =" + currentMaintenanceRecordID;
                rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);
            }
            else {
                ISystemService.excuteNoneReturnQuery.sqlString = "UPDATE [MotorMaintenanceRecord] SET [sfgzdj] = '" + sfgzdj + "', gzxx ='' WHERE MotorMaintenanceRecordID =" + currentMaintenanceRecordID;
                rock.AjaxRequest(ISystemService.excuteNoneReturnQuery, rock.exceptionFun);
            }
        }

        //日期控件处理 
        var dateboxArray = [];

        dateboxArray.push("cznyr1");
        dateboxArray.push("jynyr1");
        dateboxArray.push("cznyr2");
        dateboxArray.push("jynyr2");
        dateboxArray.push("cznyr3");
        dateboxArray.push("jynyr3");
        dateboxArray.push("cznyr4");
        dateboxArray.push("jynyr4");
        dateboxArray.push("cznyr5");
        dateboxArray.push("jynyr5");
        dateboxArray.push("cznyr6");
        dateboxArray.push("jynyr6");
        dateboxArray.push("cznyr7");
        dateboxArray.push("jynyr7");
        dateboxArray.push("cznyr8");
        dateboxArray.push("jynyr8");
        dateboxArray.push("cznyr9");
        dateboxArray.push("jynyr9");
        dateboxArray.push("cznyr10");
        dateboxArray.push("jynyr10");
        dateboxArray.push("cznyr11");
        dateboxArray.push("jynyr11");
        dateboxArray.push("cznyr12");
        dateboxArray.push("jynyr12");
        dateboxArray.push("cznyr13");
        dateboxArray.push("jynyr13");
        dateboxArray.push("cznyr14");
        dateboxArray.push("jynyr14");

        myCalendar = new dhtmlXCalendarObject(dateboxArray);
        myCalendar.loadUserLanguage('cn');
    });
})