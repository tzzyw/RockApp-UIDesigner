
$(function () {
    //初始化系统通用变量
    var serverDate, sqlStr,
	priceApply = null,
	priceApplyDetal = null,
	priceApplyID = decodeURI($.getUrlParam("ID"));
    //加载动态脚本
    var jsTypes = "ISystemService,DataTable,DataRow,DataColumn,PriceApply,PriceApplyDetal,IBusinessService";
    $.getScript('/LoadDomainJS.ashx?JsTypes=' + jsTypes, function () {
        //获取服务器当前日期
        rock.AjaxRequest(ISystemService.getServerDate, rock.exceptionFun);
        if (ISystemService.getServerDate.success) {
            (function (e) {
                serverDate = e.value;
            }(ISystemService.getServerDate.resultValue));
        } 


        //获取单据对象
        if (priceApplyID != "null") {
            $("#txtpriceApplyID").val(priceApplyID);
            IBusinessService.getPriceApplyByID.priceApplyID = priceApplyID;
            rock.AjaxRequest(IBusinessService.getPriceApplyByID, rock.exceptionFun);
            if (IBusinessService.getPriceApplyByID.success) {
                (function (e) {
                    priceApply = e;
                    fillPageItem();
                }(IBusinessService.getPriceApplyByID.resultValue));
            }
        }       
    });  

    function fillPageItem() {
        if (priceApply) {

            $("#txtproductName").val(priceApply.productName);
            $("#txtpriceApplyNum").val(priceApply.priceApplyNum);
            $('#reasion').html(priceApply.reason);
            $('#txtagent').val(priceApply.agent);
            $('#txtcreateDate').val(priceApply.createDate.split(' ')[0]);
            
            tableString = '<table class="bordertable" style="width: 700px"><thead><tr><th>价格类别</th><th>调整前价格</th><th>申请调整价格</th><th>调整幅度</th></tr></thead><tbody>';

           
            //填充明细列表 
            for (var i = 0; i < priceApply.priceApplyDetals.length; i++) {               
                var tempPriceApplyDetal = priceApply.priceApplyDetals[i];
                tableString += '<tr><td>' + tempPriceApplyDetal.priceCategory + '</td><td>' + tempPriceApplyDetal.beforePrice + '</td><td>' + tempPriceApplyDetal.applyPrice + '</td><td>' + tempPriceApplyDetal.priceRange + '</td></tr>';
            }
            tableString += '</tbody></table>'           
            $("#detail").html(tableString);

            //填充审批信息
            ISystemService.execQuery.sqlString = "select [Comment], [WorkflowActivityInstanceName],[Opinion],[Handler],[EndTime],[Result] from [WorkflowActivityInstance] where [ObjType] = 'PriceApply' and [ObjID] = " + priceApplyID;
            rock.AjaxRequest(ISystemService.execQuery, rock.exceptionFun);
            if (ISystemService.execQuery.success) {
                (function (e) {
                    var rows = e.rows;
                    for (var i = 0; i < rows.length; i++) {
                        var rowResult = rows[i].values;
                        switch (rowResult[1].value) {
                            case "销售员":
                                $('#txtsalesman').val(rowResult[3].value);                                
                                break;
                            case "部门领导":
                                $("#imgbm").attr('src', "../../SignImages/" + rowResult[3].value + ".gif");
                                $('#txtbmOpinion').val(rowResult[2].value);                               
                                if (rowResult[5].value == "通过") {
                                    $('#tableApply').css("backgroundImage", "url('../../Images/PriceApplyPrint_bg1.jpg')");
                                    //tableApply.Style["background-image"] = "url('../Images/PriceApplyPrint_bg1.jpg')";
                                }
                                break;
                            case "财务部":
                                $("#imgcw").attr('src', "../../SignImages/" + rowResult[3].value + ".gif");
                                $('#txtcwOpinion').val(rowResult[2].value);
                                if (rowResult[5].value == "通过") {
                                    $('#tableApply').css("backgroundImage", "url('../../Images/PriceApplyPrint_bg2.jpg')");
                                    //tableApply.Style["background-image"] = "url('../Images/PriceApplyPrint_bg2.jpg')";
                                }
                                break;
                            case "分管领导":
                                $("#imgfgld").attr('src', "../../SignImages/" + rowResult[3].value + ".gif");
                                $('#txtfgldOpinion').val(rowResult[2].value);
                                break;
                            case "公司领导":
                                $("#imggsld").attr('src', "../../SignImages/" + rowResult[3].value + ".gif");
                                $('#txtgsldOpinion').val(rowResult[2].value);
                                break;
                        }                    
                    }
                }(ISystemService.execQuery.resultValue));
            }
            
        }
    }
    function clearPageItem() {

        $("#txtpriceApplyNum").val("");
        $("#comboproductName").get(0).selectedIndex = 0;
        $("#txtagent").val("");
        $("#reasion").html("");
      
    }
  
})