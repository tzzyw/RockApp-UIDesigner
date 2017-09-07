var closeUpload = null;
$(function () {
    //初始化系统通用变量
    var editStateA, editStateB, editStateC, editStateD, editStateE, editStateF, toolBar, editForm, sqlStr, serverDate, divUploadLayout, uploadFile, customerForm, customerGrid,
      customer = null,
      customerQuality = null;
	  qualityDataList = new rock.JsonList(),
      customerDataList = new rock.JsonList();
	  customerQualityID = $.getUrlParam("ID");
    window.dhx_globalImgPath = "/resource/dhtmlx/codebase/imgs/";
   
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,IBusinessService,CustomerQualification,Customer";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
               
        $("#txtcustomerSearch").val("");
        $("#txtcustomerQualityIDA").val("");
        $("#txtcustomerQualityIDB").val("");
        $("#txtcustomerQualityIDC").val("");
        $("#txtcustomerQualityIDD").val("");
        $("#txtcustomerQualityIDE").val("");
        $("#txtcustomerQualityIDF").val("");

        $("#viewA").css('display', 'none');
        $("#viewB").css('display', 'none');
        $("#viewC").css('display', 'none');
        $("#viewD").css('display', 'none');
        $("#viewE").css('display', 'none');
        $("#viewF").css('display', 'none');

        $("#addA").css('display', 'none');
        $("#addB").css('display', 'none');
        $("#addC").css('display', 'none');
        $("#addD").css('display', 'none');
        $("#addE").css('display', 'none');
        $("#addF").css('display', 'none');

        
        $("#btnA").css('display', 'none');
        $("#btnB").css('display', 'none');
        $("#btnC").css('display', 'none');
        $("#btnD").css('display', 'none');
        $("#btnE").css('display', 'none');
        $("#btnF").css('display', 'none');

        $("#txtLicenseNumberA").val("");
        $("#txtLicenseNumberB").val("");
        $("#txtLicenseNumberC").val("");
        $("#txtLicenseNumberD").val("");
        $("#txtLicenseNumberE").val("");
        $("#txtLicenseNumberF").val("");

        $("#txtBeginEffectiveDateA").val("");
        $("#txtBeginEffectiveDateB").val("");
        $("#txtBeginEffectiveDateC").val("");
        $("#txtBeginEffectiveDateD").val("");
        $("#txtBeginEffectiveDateE").val("");
        $("#txtBeginEffectiveDateF").val("");

        $("#txtEndEffectiveDateA").val("");
        $("#txtEndEffectiveDateB").val("");
        $("#txtEndEffectiveDateC").val("");
        $("#txtEndEffectiveDateD").val("");
        $("#txtEndEffectiveDateE").val("");
        $("#txtEndEffectiveDateF").val("");

        if (customerQualityID != null) {
            IBusinessService.getCustomerQualiyList.customerID = customerQualityID;
            rock.AjaxRequest(IBusinessService.getCustomerQualiyList, rock.exceptionFun);
            if (IBusinessService.getCustomerQualiyList.success) {
                (function (e) {
                    var priceApply = e;
                    for (var i = 0; i < e.length; i++) {
                        customerQuality = e[i];
                        switch (customerQuality.customerQualificationCategory) {
                            case "营业执照有效期":
                                $("#txtcustomerQualityIDA").val(customerQuality.customerQualificationID);
                                $("#txtLicenseNumberA").val(customerQuality.licenseNumber);
                                $("#txtBeginEffectiveDateA").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                                $("#txtEndEffectiveDateA").val(customerQuality.endEffectiveDate.split(' ')[0]);
                                $("#viewA").css('display', 'inline');
                                $('#viewA').html(customerQuality.attachment);
                                editStateA = "modify"
                                break;
                            case "营业执照年审":
                                $("#txtcustomerQualityIDB").val(customerQuality.customerQualificationID);
                                $("#txtLicenseNumberB").val(customerQuality.licenseNumber);
                                $("#txtBeginEffectiveDateB").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                                $("#txtEndEffectiveDateB").val(customerQuality.endEffectiveDate.split(' ')[0]);
                                $("#viewB").css('display', 'inline');
                                $('#viewB').html(customerQuality.attachment);
                                editStateB = "modify"
                                break;
                            case "危险化学品经营许可证":
                                $("#txtcustomerQualityIDC").val(customerQuality.customerQualificationID);
                                $("#txtLicenseNumberC").val(customerQuality.licenseNumber);
                                $("#txtBeginEffectiveDateC").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                                $("#txtEndEffectiveDateC").val(customerQuality.endEffectiveDate.split(' ')[0]);
                                $("#viewC").css('display', 'inline');
                                $('#viewC').html(customerQuality.attachment);
                                editStateC = "modify"
                                break;
                            case "安全生产许可证":
                                $("#txtcustomerQualityIDD").val(customerQuality.customerQualificationID);
                                $("#txtLicenseNumberD").val(customerQuality.licenseNumber);
                                $("#txtBeginEffectiveDateD").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                                $("#txtEndEffectiveDateD").val(customerQuality.endEffectiveDate.split(' ')[0]);
                                $('#viewD').html(customerQuality.attachment);
                                $("#viewD").css('display', 'inline');
                                editStateD = "modify"
                                break;
                            case "中华人民共和国组织机构代码证":
                                $("#txtcustomerQualityIDE").val(customerQuality.customerQualificationID);
                                $("#txtLicenseNumberE").val(customerQuality.licenseNumber);
                                $("#txtBeginEffectiveDateE").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                                $("#txtEndEffectiveDateE").val(customerQuality.endEffectiveDate.split(' ')[0]);
                                $('#viewE').html(customerQuality.attachment);
                                $("#viewE").css('display', 'inline');
                                editStateE = "modify"
                                break;
                            case "税务登记证":
                                $("#txtcustomerQualityIDF").val(customerQuality.customerQualificationID);
                                $("#txtLicenseNumberF").val(customerQuality.licenseNumber);
                                $("#txtBeginEffectiveDateF").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                                $("#txtEndEffectiveDateF").val(customerQuality.endEffectiveDate.split(' ')[0]);
                                $('#viewF').html(customerQuality.attachment);
                                $("#viewF").css('display', 'inline');
                                editStateF = "modify"
                                break;
                        }
                    }
                }(IBusinessService.getCustomerQualiyList.resultValue));
            }
        }
    });

    //初始化客户选择表格
    customerGrid = new dhtmlXGridObject('customerGrid');
    customerGrid.setImagePath("/resource/dhtmlx/codebase/imgs/");
    customerGrid.setSkin("dhx_skyblue");
    customerGrid.setHeader("序号,,客户编码,类别,客户名称");
    customerGrid.setInitWidths("40,0,70,40,*");
    customerGrid.setColAlign("center,left,left,left,left");
    customerGrid.setColTypes("cntr,ro,ro,ro,ro");
    customerGrid.setColSorting("na,na,str,str,str");
    customerGrid.enableDistributedParsing(true, 20);
    customerGrid.attachEvent("onRowDblClicked", function (rowID, cIndex) {
        $("#txtcustomerQualityIDA").val("");
        $("#txtcustomerQualityIDB").val("");
        $("#txtcustomerQualityIDC").val("");
        $("#txtcustomerQualityIDD").val("");
        $("#txtcustomerQualityIDE").val("");
        $("#txtcustomerQualityIDF").val("");

        $("#txtLicenseNumberA").val("");
        $("#txtLicenseNumberB").val("");
        $("#txtLicenseNumberC").val("");
        $("#txtLicenseNumberD").val("");
        $("#txtLicenseNumberE").val("");
        $("#txtLicenseNumberF").val("");

        $("#txtBeginEffectiveDateA").val("");
        $("#txtBeginEffectiveDateB").val("");
        $("#txtBeginEffectiveDateC").val("");
        $("#txtBeginEffectiveDateD").val("");
        $("#txtBeginEffectiveDateE").val("");
        $("#txtBeginEffectiveDateF").val("");

        $("#txtEndEffectiveDateA").val("");
        $("#txtEndEffectiveDateB").val("");
        $("#txtEndEffectiveDateC").val("");
        $("#txtEndEffectiveDateD").val("");
        $("#txtEndEffectiveDateE").val("");
        $("#txtEndEffectiveDateF").val("");

        $("#viewA").css('display', 'none');
        $("#viewB").css('display', 'none');
        $("#viewC").css('display', 'none');
        $("#viewD").css('display', 'none');
        $("#viewE").css('display', 'none');
        $("#viewF").css('display', 'none');

        $("#txtcustomerID").val(rowID);
        $("#txtcustomerSearch").val(customerGrid.cells(rowID, 4).getValue());       

        $("#btnA").css('display', 'inline');
        $("#btnB").css('display', 'inline');
        $("#btnC").css('display', 'inline');
        $("#btnD").css('display', 'inline');
        $("#btnE").css('display', 'inline');
        $("#btnF").css('display', 'inline');

        $("#addA").css('display', 'inline');
        $("#addB").css('display', 'inline');
        $("#addC").css('display', 'inline');
        $("#addD").css('display', 'inline');
        $("#addE").css('display', 'inline');
        $("#addF").css('display', 'inline');

        editStateA = "add"
        editStateB = "add"
        editStateC = "add"
        editStateD = "add"
        editStateE = "add"
        editStateF = "add"

        IBusinessService.getCustomerQualiyList.customerID = rowID;
        rock.AjaxRequest(IBusinessService.getCustomerQualiyList, rock.exceptionFun);
        if (IBusinessService.getCustomerQualiyList.success) {
            (function (e) {
                var priceApply = e;
                for (var i = 0; i < e.length; i++) {
                    customerQuality = e[i];
                    switch (customerQuality.customerQualificationCategory) {
                        case "营业执照有效期":
                            $("#txtcustomerQualityIDA").val(customerQuality.customerQualificationID);
                            $("#txtLicenseNumberA").val(customerQuality.licenseNumber);
                            $("#txtBeginEffectiveDateA").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                            $("#txtEndEffectiveDateA").val(customerQuality.endEffectiveDate.split(' ')[0]);
                            $("#viewA").css('display', 'inline');
                            $('#viewA').html(customerQuality.attachment);
                            editStateA = "modify"
                            break;
                        case "营业执照年审":
                            $("#txtcustomerQualityIDB").val(customerQuality.customerQualificationID);
                            $("#txtLicenseNumberB").val(customerQuality.licenseNumber);
                            $("#txtBeginEffectiveDateB").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                            $("#txtEndEffectiveDateB").val(customerQuality.endEffectiveDate.split(' ')[0]);
                            $("#viewB").css('display', 'inline');
                            $('#viewB').html(customerQuality.attachment);
                            editStateB = "modify"
                            break;
                        case "危险化学品经营许可证":
                            $("#txtcustomerQualityIDC").val(customerQuality.customerQualificationID);
                            $("#txtLicenseNumberC").val(customerQuality.licenseNumber);
                            $("#txtBeginEffectiveDateC").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                            $("#txtEndEffectiveDateC").val(customerQuality.endEffectiveDate.split(' ')[0]);
                            $("#viewC").css('display', 'inline');
                            $('#viewC').html(customerQuality.attachment);
                            editStateC = "modify"
                            break;
                        case "安全生产许可证":
                            $("#txtcustomerQualityIDD").val(customerQuality.customerQualificationID);
                            $("#txtLicenseNumberD").val(customerQuality.licenseNumber);
                            $("#txtBeginEffectiveDateD").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                            $("#txtEndEffectiveDateD").val(customerQuality.endEffectiveDate.split(' ')[0]);
                            $('#viewD').html(customerQuality.attachment);
                            $("#viewD").css('display', 'inline');
                            editStateD = "modify"
                            break;
                        case "中华人民共和国组织机构代码证":
                            $("#txtcustomerQualityIDE").val(customerQuality.customerQualificationID);
                            $("#txtLicenseNumberE").val(customerQuality.licenseNumber);
                            $("#txtBeginEffectiveDateE").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                            $("#txtEndEffectiveDateE").val(customerQuality.endEffectiveDate.split(' ')[0]);
                            $('#viewE').html(customerQuality.attachment);
                            $("#viewE").css('display', 'inline');
                            editStateE = "modify"
                            break;
                        case "税务登记证":
                            $("#txtcustomerQualityIDF").val(customerQuality.customerQualificationID);
                            $("#txtLicenseNumberF").val(customerQuality.licenseNumber);
                            $("#txtBeginEffectiveDateF").val(customerQuality.beginEffectiveDate.split(' ')[0]);
                            $("#txtEndEffectiveDateF").val(customerQuality.endEffectiveDate.split(' ')[0]);
                            $('#viewF').html(customerQuality.attachment);
                            $("#viewF").css('display', 'inline');
                            editStateF = "modify"
                            break;
                    }
                }
            }(IBusinessService.getCustomerQualiyList.resultValue));
        }      
        hidcustomerForm();
    });
    customerGrid.init();  

    customerForm = $("#customerForm");

    var mark = true;
    $('#txtcustomerSearch').mousedown(function (e) {
        if (mark) {
            ISystemService.execQuery.sqlString = "select top 15  [CustomerID], [CustomerCode], [Category], [CustomerName] from [Customer]";
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    rock.tableToListGrid(e, customerGrid, customerDataList);
                }(ISystemService.execQuery.resultValue));
            }
            mark = false;
        }
        showcustomerForm();
    });
     
    $("#txtcustomerSearch").keyup(function () {
        customerComplete($("#txtcustomerSearch").val());
    });

    function customerComplete(searchCode) {
        ISystemService.execQuery.sqlString = "select top 15 [CustomerID], [CustomerCode], [Category], [CustomerName] from [Customer] where CustomerName like  '%" + searchCode + "%' or [SearchCode] like  '%" + searchCode + "%'";
        rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
        if (ISystemService.execQuery.success) {
            (function (e) {
                rock.tableToListGrid(e, customerGrid, customerDataList);
            }(ISystemService.execQuery.resultValue));
        }
    }

  
    function showcustomerForm() {
        var top = $("#txtcustomerSearch").offset().top;
        var left = $("#txtcustomerSearch").offset().left;
        customerForm.css({ top: top + 22, left: left }).show();
    }
    function hidcustomerForm() {
        customerForm.css({ top: 200, left: -1300 }).hide();
    }
    $('#mainBody').mousedown(function (e) {

        if (e.srcElement.id != "txtcustomerSearch") {
            hidcustomerForm();
        }
    });
    
    hidcustomerForm();
    
    //保存
    $("#btnA").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDA").val();
        if (customerQualityID == "") {
            alert("请先上传营业执照有效期文件再保存!");
            return;
        }

        //如果证件编号为空,则删除
        if ($.trim($("#txtLicenseNumberA").val()) == '') {
            if (editStateA == "modify") {
                ISystemService.deleteDynObjectByID.dynObjectID = customerQualityID;
                ISystemService.deleteDynObjectByID.structName = "CustomerQualification";
                rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                if (ISystemService.deleteDynObjectByID.success) {
                    (function (e) {
                        $("#txtcustomerQualityIDA").val("");
                        $("#txtBeginEffectiveDateA").val("");
                        $("#txtEndEffectiveDateA").val("");
                        $("#viewA").html("");
                        $("#viewA").css('display', 'none');
                        alert("营业执照有效期已删除!");
                    }(ISystemService.deleteDynObjectByID.resultValue));
                }
                return;
            } else {
                alert("营业执照有效期证件编号不可以为空!");
                return;
            }
        }

        if ($("#viewA").html() == "") {
            alert("营业执照有效期文件为空,请先选择要上传的文件!");
            return;
        }      

        if ($.trim($("#txtBeginEffectiveDateA").val()) == "") {
            alert("营业执照有效期:起始有效日期不能为空！");
            return;
        }

        if ($.trim($("#txtEndEffectiveDateA").val()) == "") {
            alert("营业执照有效期:结束有效日期不能为空！");
            return;
        }

        if (!rock.chkdate($("#txtBeginEffectiveDateA").val(), "-")) {
            alert("营业执照有效期:起始有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (!rock.chkdate($("#txtEndEffectiveDateA").val(), "-")) {
            alert("营业执照有效期:结束有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (editStateA == "add") {
            customerQuality = CustomerQualificationClass.createInstance();
            customerQuality.customerQualificationID = $("#txtcustomerQualityIDA").val();
            customerQuality.customerID = $("#txtcustomerID").val();
        }
        else {           
            ISystemService.getDynObjectByID.dynObjectID = $("#txtcustomerQualityIDA").val();
            ISystemService.getDynObjectByID.structName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    customerQuality = e;                    
                }(ISystemService.getDynObjectByID.resultValue));
            }
        }        
        customerQuality.licenseNumber = $("#txtLicenseNumberA").val();
        customerQuality.customerQualificationCategory = "营业执照有效期";
        customerQuality.beginEffectiveDate = $("#txtBeginEffectiveDateA").val();
        customerQuality.endEffectiveDate = $("#txtEndEffectiveDateA").val();
        customerQuality.attachment = $("#viewA").html();       

        save(editStateA, "营业执照有效期");
        
    });

    $("#btnB").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDB").val();
        if (customerQualityID == "") {
            alert("请先上传营业执照年审文件再保存!");
            return;
        }

        //如果证件编号为空,则删除
        if ($.trim($("#txtLicenseNumberB").val()) == '') {
            if (editStateB == "modify") {
                ISystemService.deleteDynObjectByID.dynObjectID = customerQualityID;
                ISystemService.deleteDynObjectByID.structName = "CustomerQualification";
                rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                if (ISystemService.deleteDynObjectByID.success) {
                    (function (e) {
                        $("#txtcustomerQualityIDB").val("");
                        $("#txtBeginEffectiveDateB").val("");
                        $("#txtEndEffectiveDateB").val("");
                        $("#viewB").html("");
                        $("#viewB").css('display', 'none');
                        alert("营业执照年审已删除!");
                    }(ISystemService.deleteDynObjectByID.resultValue));
                }
                return;
            } else {
                alert("营业执照年审证件编号不可以为空!");
                return;
            }
        }

        if ($("#viewB").html() == "") {
            alert("营业执照年审文件为空,请先选择要上传的文件!");
            return;
        }

        if ($.trim($("#txtBeginEffectiveDateB").val()) == "") {
            alert("营业执照年审:起始有效日期不能为空！");
            return;
        }

        if ($.trim($("#txtEndEffectiveDateB").val()) == "") {
            alert("营业执照年审:结束有效日期不能为空！");
            return;
        }

        if (!rock.chkdate($("#txtBeginEffectiveDateB").val(), "-")) {
            alert("营业执照年审:起始有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (!rock.chkdate($("#txtEndEffectiveDateB").val(), "-")) {
            alert("营业执照年审:结束有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (editStateB == "add") {
            customerQuality = CustomerQualificationClass.createInstance();
            customerQuality.customerQualificationID = $("#txtcustomerQualityIDB").val();
            customerQuality.customerID = $("#txtcustomerID").val();
        }
        else {
            ISystemService.getDynObjectByID.dynObjectID = $("#txtcustomerQualityIDB").val();
            ISystemService.getDynObjectByID.structName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    customerQuality = e;
                }(ISystemService.getDynObjectByID.resultValue));
            }
        }
        customerQuality.licenseNumber = $("#txtLicenseNumberB").val();
        customerQuality.customerQualificationCategory = "营业执照年审";
        customerQuality.beginEffectiveDate = $("#txtBeginEffectiveDateB").val();
        customerQuality.endEffectiveDate = $("#txtEndEffectiveDateB").val();
        customerQuality.attachment = $("#viewB").html();

        save(editStateB, "营业执照年审");

    });

    $("#btnC").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDC").val();
        if (customerQualityID == "") {
            alert("请先上传危险化学品经营许可证文件再保存!");
            return;
        }

        //如果证件编号为空,则删除
        if ($.trim($("#txtLicenseNumberC").val()) == '') {
            if (editStateC == "modify") {
                ISystemService.deleteDynObjectByID.dynObjectID = customerQualityID;
                ISystemService.deleteDynObjectByID.structName = "CustomerQualification";
                rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                if (ISystemService.deleteDynObjectByID.success) {
                    (function (e) {
                        $("#txtcustomerQualityIDC").val("");
                        $("#txtBeginEffectiveDateC").val("");
                        $("#txtEndEffectiveDateC").val("");
                        $("#viewC").html("");
                        $("#viewC").css('display', 'none');
                        alert("危险化学品经营许可证已删除!");
                    }(ISystemService.deleteDynObjectByID.resultValue));
                }
                return;
            } else {
                alert("危险化学品经营许可证证件编号不可以为空!");
                return;
            }
        }

        if ($("#viewC").html() == "") {
            alert("危险化学品经营许可证文件为空,请先选择要上传的文件!");
            return;
        }

        if ($.trim($("#txtBeginEffectiveDateC").val()) == "") {
            alert("危险化学品经营许可证:起始有效日期不能为空！");
            return;
        }

        if ($.trim($("#txtEndEffectiveDateC").val()) == "") {
            alert("危险化学品经营许可证:结束有效日期不能为空！");
            return;
        }

        if (!rock.chkdate($("#txtBeginEffectiveDateC").val(), "-")) {
            alert("危险化学品经营许可证:起始有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (!rock.chkdate($("#txtEndEffectiveDateC").val(), "-")) {
            alert("危险化学品经营许可证:结束有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (editStateC == "add") {
            customerQuality = CustomerQualificationClass.createInstance();
            customerQuality.customerQualificationID = $("#txtcustomerQualityIDC").val();
            customerQuality.customerID = $("#txtcustomerID").val();
        }
        else {
            ISystemService.getDynObjectByID.dynObjectID = $("#txtcustomerQualityIDC").val();
            ISystemService.getDynObjectByID.structName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    customerQuality = e;
                }(ISystemService.getDynObjectByID.resultValue));
            }
        }
        customerQuality.licenseNumber = $("#txtLicenseNumberC").val();
        customerQuality.customerQualificationCategory = "危险化学品经营许可证";
        customerQuality.beginEffectiveDate = $("#txtBeginEffectiveDateC").val();
        customerQuality.endEffectiveDate = $("#txtEndEffectiveDateC").val();
        customerQuality.attachment = $("#viewC").html();

        save(editStateC, "危险化学品经营许可证");

    });

    $("#btnD").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDD").val();
        if (customerQualityID == "") {
            alert("请先上传安全生产许可证文件再保存!");
            return;
        }

        //如果证件编号为空,则删除
        if ($.trim($("#txtLicenseNumberD").val()) == '') {
            if (editStateD == "modify") {
                ISystemService.deleteDynObjectByID.dynObjectID = customerQualityID;
                ISystemService.deleteDynObjectByID.structName = "CustomerQualification";
                rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                if (ISystemService.deleteDynObjectByID.success) {
                    (function (e) {
                        $("#txtcustomerQualityIDD").val("");
                        $("#txtBeginEffectiveDateD").val("");
                        $("#txtEndEffectiveDateD").val("");
                        $("#viewD").html("");
                        $("#viewD").css('display', 'none');
                        alert("安全生产许可证已删除!");
                    }(ISystemService.deleteDynObjectByID.resultValue));
                }
                return;
            } else {
                alert("危险化学品经营许可证证件编号不可以为空!");
                return;
            }
        }

        if ($("#viewD").html() == "") {
            alert("安全生产许可证文件为空,请先选择要上传的文件!");
            return;
        }

        if ($.trim($("#txtBeginEffectiveDateD").val()) == "") {
            alert("安全生产许可证:起始有效日期不能为空！");
            return;
        }

        if ($.trim($("#txtEndEffectiveDateD").val()) == "") {
            alert("安全生产许可证:结束有效日期不能为空！");
            return;
        }

        if (!rock.chkdate($("#txtBeginEffectiveDateD").val(), "-")) {
            alert("安全生产许可证:起始有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (!rock.chkdate($("#txtEndEffectiveDateD").val(), "-")) {
            alert("安全生产许可证:结束有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (editStateD == "add") {
            customerQuality = CustomerQualificationClass.createInstance();
            customerQuality.customerQualificationID = $("#txtcustomerQualityIDD").val();
            customerQuality.customerID = $("#txtcustomerID").val();
        }
        else {
            ISystemService.getDynObjectByID.dynObjectID = $("#txtcustomerQualityIDD").val();
            ISystemService.getDynObjectByID.structName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    customerQuality = e;
                }(ISystemService.getDynObjectByID.resultValue));
            }
        }
        customerQuality.licenseNumber = $("#txtLicenseNumberD").val();
        customerQuality.customerQualificationCategory = "安全生产许可证";
        customerQuality.beginEffectiveDate = $("#txtBeginEffectiveDateD").val();
        customerQuality.endEffectiveDate = $("#txtEndEffectiveDateD").val();
        customerQuality.attachment = $("#viewD").html();

        save(editStateD, "安全生产许可证");

    });

    $("#btnE").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDE").val();
        if (customerQualityID == "") {
            alert("请先上传中华人民共和国组织机构代码证文件再保存!");
            return;
        }

        //如果证件编号为空,则删除
        if ($.trim($("#txtLicenseNumberE").val()) == '') {
            if (editStateE == "modify") {
                ISystemService.deleteDynObjectByID.dynObjectID = customerQualityID;
                ISystemService.deleteDynObjectByID.structName = "CustomerQualification";
                rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                if (ISystemService.deleteDynObjectByID.success) {
                    (function (e) {
                        $("#txtcustomerQualityIDE").val("");
                        $("#txtBeginEffectiveDateE").val("");
                        $("#txtEndEffectiveDateE").val("");
                        $("#viewE").html("");
                        $("#viewE").css('display', 'none');
                        alert("中华人民共和国组织机构代码证已删除!");
                    }(ISystemService.deleteDynObjectByID.resultValue));
                }
                return;
            } else {
                alert("中华人民共和国组织机构代码证证件编号不可以为空!");
                return;
            }
        }

        if ($("#viewE").html() == "") {
            alert("中华人民共和国组织机构代码证文件为空,请先选择要上传的文件!");
            return;
        }

        if ($.trim($("#txtBeginEffectiveDateE").val()) == "") {
            alert("中华人民共和国组织机构代码证:起始有效日期不能为空！");
            return;
        }

        if ($.trim($("#txtEndEffectiveDateE").val()) == "") {
            alert("中华人民共和国组织机构代码证:结束有效日期不能为空！");
            return;
        }

        if (!rock.chkdate($("#txtBeginEffectiveDateE").val(), "-")) {
            alert("中华人民共和国组织机构代码证:起始有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (!rock.chkdate($("#txtEndEffectiveDateE").val(), "-")) {
            alert("中华人民共和国组织机构代码证:结束有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (editStateE == "add") {
            customerQuality = CustomerQualificationClass.createInstance();
            customerQuality.customerQualificationID = $("#txtcustomerQualityIDE").val();
            customerQuality.customerID = $("#txtcustomerID").val();
        }
        else {
            ISystemService.getDynObjectByID.dynObjectID = $("#txtcustomerQualityIDE").val();
            ISystemService.getDynObjectByID.structName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    customerQuality = e;
                }(ISystemService.getDynObjectByID.resultValue));
            }
        }
        customerQuality.licenseNumber = $("#txtLicenseNumberE").val();
        customerQuality.customerQualificationCategory = "中华人民共和国组织机构代码证";
        customerQuality.beginEffectiveDate = $("#txtBeginEffectiveDateE").val();
        customerQuality.endEffectiveDate = $("#txtEndEffectiveDateE").val();
        customerQuality.attachment = $("#viewE").html();

        save(editStateE, "中华人民共和国组织机构代码证");

    });

    $("#btnF").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDF").val();
        if (customerQualityID == "") {
            alert("请先上传中华人民共和国组织机构代码证文件再保存!");
            return;
        }

        //如果证件编号为空,则删除
        if ($.trim($("#txtLicenseNumberF").val()) == '') {
            if (editStateF == "modify") {
                ISystemService.deleteDynObjectByID.dynObjectID = customerQualityID;
                ISystemService.deleteDynObjectByID.structName = "CustomerQualification";
                rock.AjaxRequest(ISystemService.deleteDynObjectByID, rock.exceptionFun);
                if (ISystemService.deleteDynObjectByID.success) {
                    (function (e) {
                        $("#txtcustomerQualityIDF").val("");
                        $("#txtBeginEffectiveDateF").val("");
                        $("#txtEndEffectiveDateF").val("");
                        $("#viewF").html("");
                        $("#viewF").css('display', 'none');
                        alert("税务登记证已删除!");
                    }(ISystemService.deleteDynObjectByID.resultValue));
                }
                return;
            } else {
                alert("税务登记证证件编号不可以为空!");
                return;
            }
        }

        if ($("#viewF").html() == "") {
            alert("税务登记证文件为空,请先选择要上传的文件!");
            return;
        }

        if ($.trim($("#txtBeginEffectiveDateF").val()) == "") {
            alert("税务登记证:起始有效日期不能为空！");
            return;
        }

        if ($.trim($("#txtEndEffectiveDateF").val()) == "") {
            alert("税务登记证:结束有效日期不能为空！");
            return;
        }

        if (!rock.chkdate($("#txtBeginEffectiveDateF").val(), "-")) {
            alert("税务登记证:起始有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (!rock.chkdate($("#txtEndEffectiveDateF").val(), "-")) {
            alert("税务登记证:结束有效日期格式不正确,正确格式为 2010-10-10！");
            return false;
        }

        if (editStateF == "add") {
            customerQuality = CustomerQualificationClass.createInstance();
            customerQuality.customerQualificationID = $("#txtcustomerQualityIDF").val();
            customerQuality.customerID = $("#txtcustomerID").val();
        }
        else {
            ISystemService.getDynObjectByID.dynObjectID = $("#txtcustomerQualityIDF").val();
            ISystemService.getDynObjectByID.structName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getDynObjectByID, rock.exceptionFun);
            if (ISystemService.getDynObjectByID.success) {
                (function (e) {
                    customerQuality = e;
                }(ISystemService.getDynObjectByID.resultValue));
            }
        }
        customerQuality.licenseNumber = $("#txtLicenseNumberF").val();
        customerQuality.customerQualificationCategory = "税务登记证";
        customerQuality.beginEffectiveDate = $("#txtBeginEffectiveDateF").val();
        customerQuality.endEffectiveDate = $("#txtEndEffectiveDateF").val();
        customerQuality.attachment = $("#viewF").html();

        save(editStateF, "税务登记证");

    });
    function save(editState,name) {
        if (editState == "add") {
            ISystemService.addDynObject.dynObject = customerQuality;
            rock.AjaxRequest(ISystemService.addDynObject, rock.exceptionFun);
            if (ISystemService.addDynObject.success) {
                (function (e) {
                    alert( name + "添加成功!");
                }(ISystemService.addDynObject.resultValue));
            }
        }
        else {
            ISystemService.modifyDynObject.dynObject = customerQuality;
            rock.AjaxRequest(ISystemService.modifyDynObject, rock.exceptionFun);
            if (ISystemService.modifyDynObject.success) {
                (function (e) {
                    alert(name + "修改成功!");
                }(ISystemService.modifyDynObject.resultValue));
            }
        }
    }

    //上传文档布局页面
    divUploadLayout = new dhtmlXLayoutObject("divUpload", "1C");
    divUploadLayout.cells("a").hideHeader();

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
    });

    $("#addA").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDA").val();
        if (customerQualityID == "") {
            editState = "add";
            ISystemService.getNextID.typeName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerQuality.customerQualificationID = e.value;
                    $("#txtcustomerQualityIDA").val(e.value);
                    customerQualityID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        else {
            editState = "modify";
        }
        divUploadLayout.cells("a").attachURL("../view/UploadQualityFile.html?order=A");
        showUploadFile();
    })

    $("#addB").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDB").val();
        if (customerQualityID == "") {
            editState = "add";
            ISystemService.getNextID.typeName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerQuality.customerQualificationID = e.value;
                    $("#txtcustomerQualityIDB").val(e.value);
                    customerQualityID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        else {
            editState = "modify";
        }
        divUploadLayout.cells("a").attachURL("../view/UploadQualityFile.html?order=B");
        showUploadFile();
    })

    $("#addC").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDC").val();
        if (customerQualityID == "") {
            editState = "add";
            ISystemService.getNextID.typeName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerQuality.customerQualificationID = e.value;
                    $("#txtcustomerQualityIDC").val(e.value);
                    customerQualityID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        else {
            editState = "modify";
        }
        divUploadLayout.cells("a").attachURL("../view/UploadQualityFile.html?order=C");
        showUploadFile();
    })

    $("#addD").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDD").val();
        if (customerQualityID == "") {
            editState = "add";
            ISystemService.getNextID.typeName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerQuality.customerQualificationID = e.value;
                    $("#txtcustomerQualityIDD").val(e.value);
                    customerQualityID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        else {
            editState = "modify";
        }
        divUploadLayout.cells("a").attachURL("../view/UploadQualityFile.html?order=D");
        showUploadFile();
    })

    $("#addE").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDE").val();
        if (customerQualityID == "") {
            editState = "add";
            ISystemService.getNextID.typeName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerQuality.customerQualificationID = e.value;
                    $("#txtcustomerQualityIDE").val(e.value);
                    customerQualityID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        else {
            editState = "modify";
        }
        divUploadLayout.cells("a").attachURL("../view/UploadQualityFile.html?order=E");
        showUploadFile();
    })

    $("#addF").click(function () {
        var customerQualityID = $("#txtcustomerQualityIDF").val();
        if (customerQualityID == "") {
            editState = "add";
            ISystemService.getNextID.typeName = "CustomerQualification";
            rock.AjaxRequest(ISystemService.getNextID, rock.exceptionFun);
            if (ISystemService.getNextID.success) {
                (function (e) {
                    customerQuality.customerQualificationID = e.value;
                    $("#txtcustomerQualityIDF").val(e.value);
                    customerQualityID = e.value;
                }(ISystemService.getNextID.resultValue))
            }
        }
        else {
            editState = "modify";
        }
        divUploadLayout.cells("a").attachURL("../view/UploadQualityFile.html?order=F");
        showUploadFile();
    })

    closeUpload = function (serverFileName,order) {
        hideUploadFile();
        $("#view" + order).html("<a href=../FileUpLoad/" + serverFileName + " target='_blank'>查看</a>");
        $("#view" + order).css('display', 'inline');
    }

   
    //日期控件处理 
    var dateboxArray = [];

    dateboxArray.push("txtBeginEffectiveDateA");
    dateboxArray.push("txtEndEffectiveDateA");
    dateboxArray.push("txtBeginEffectiveDateB");
    dateboxArray.push("txtEndEffectiveDateB");
    dateboxArray.push("txtBeginEffectiveDateC");
    dateboxArray.push("txtEndEffectiveDateC");
    dateboxArray.push("txtBeginEffectiveDateD");
    dateboxArray.push("txtEndEffectiveDateD");
    dateboxArray.push("txtBeginEffectiveDateE");
    dateboxArray.push("txtEndEffectiveDateE");
    dateboxArray.push("txtBeginEffectiveDateF");
    dateboxArray.push("txtEndEffectiveDateF");

    myCalendar = new dhtmlXCalendarObject(dateboxArray);
    myCalendar.loadUserLanguage('cn');
})