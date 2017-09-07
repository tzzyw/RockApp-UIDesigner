<%@ Page Language="C#" AutoEventWireup="true" CodeFile="DBSale.aspx.cs" Inherits="app_view_SalWeightllj" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>地磅发货</title>
    <link href="../../resource/dhtmlx/codebase/css/global.css" rel="stylesheet" type="text/css" />
    <link href="../../resource/dhtmlx/codebase/css/form.css" rel="stylesheet" type="text/css" />
    <link href="../../resource/dhtmlx/codebase/dhtmlx.css" rel="stylesheet" />
    <script src="../../resource/dhtmlx/codebase/dhtmlx.js"></script>
    <script src="../../resource/common/jquery-1.8.2.min.js" type="text/javascript"></script>
    <script src="../../resource/common/rock-common.js"></script>
    <script type="text/vbscript">
'      Function ReadICCardNum(s_port,sector,whichblock,cardaddr)
'            Dim ctrl1
'            Dim Val1
'            Dim ctrl2
'            Set ctrl1 = document.getElementById("MFRC500Ctrl1")
'            Set ctrl2 = document.getElementById("HDIC卡芯片编号")
'            call ctrl1.ReadString(s_port, sector,whichblock,cardaddr, Val1)
'            ctrl2.value=Val1
'      End Function
'       
'      Function ReadCustomerNum(s_port,sector,whichblock,cardaddr)
'            Dim ctrl1
'            Dim Val1
'            Dim ctrl2
'            Set ctrl1 = document.getElementById("MFRC500Ctrl1")
'            Set ctrl2 = document.getElementById("HDIC卡客户编号")
'            call ctrl1.ReadString(s_port, sector,whichblock,cardaddr, Val1)
'            ctrl2.value=Val1
'      End Function

      Function vbs()
        MsgBox "vbs"
      End Function
    </script>
    <script type="text/javascript">
        var dataWeight1 = 0.1;
        var dataWeight2 = 0.2;
        var dataWeight3 = 0.3;
        var i = 0; j = 0;

        // 获取磅房名称
        function getWeightHouse() {
            try {
                var fso, file, data;
                fso = new ActiveXObject("Scripting.FileSystemObject");
                file = fso.OpenTextFile("C:\\cz.inp", 1)
                data = file.ReadLine();
                file.Close();
                var parts = data.split(",");
                return parts[0];
            }
            catch (e) {
                alert(e);
            }
        }

        // 通用ScriptService回调，客户端通知服务端该IE所在的磅房名称
        function setWeightHouse(weightHouseName) {
            requestSimpleService = WeightWebService.SetWeightHouse(weightHouseName);
        }


        // 获取称重数据
        function getWeightData() {
            try {
                var fso, file, data;
                fso = new ActiveXObject("Scripting.FileSystemObject");
                file = fso.OpenTextFile("C:\\cz.inp", 1)
                data = file.ReadLine();

                var parts = data.split(",");
                var dataHouse = parts[0];
                var dataDateTime = parts[1];
                var dataWeight = parts[2];
                var dataDate = dataDateTime.split(" ")[0];
                var dataTime = dataDateTime.split(" ")[1];

                var curTime = currentTime();

                //if (Math.abs(comptime(dataTime, curTime)) > 2) {
                //    document.getElementById("txtreadNum").value = "错误：请检查称重服务器是否在运行！";
                //}
                //else {
                //    document.getElementById("txtreadNum").value = dataWeight;
                //}

                document.getElementById("txtreadNum").value = dataWeight;

                file.Close();

                if (i == 0) {
                    dataWeight1 = dataWeight;
                    j = 1;
                }
                if (i == 1) {
                    dataWeight2 = dataWeight;
                    j = 2;
                }
                if (i == 2) {
                    dataWeight3 = dataWeight;
                    j = 0;
                }

                i = j;

                if (document.getElementById("txtreadNum").value == "错误：请检查称重服务器是否在运行！") {
                    document.getElementById("btnreadNum").disabled = true;
                    document.getElementById("txtreadNum").style.color = 'Red';
                }
                else {
                    if (dataWeight1 == dataWeight2 && dataWeight2 == dataWeight3) {
                        document.getElementById("btnreadNum").disabled = false;
                        document.getElementById("txtreadNum").style.color = 'Lime';
                    }
                    else {
                        document.getElementById("btnreadNum").disabled = true;
                        document.getElementById("txtreadNum").style.color = 'Yellow';
                    }
                }
                setTimeout("getWeightData()", 500);
            }
            catch (e) {
                alert(e);
            }
        }               

        function comptime(a, b) {
            var aParts = a.split(":");
            var aSeconds = aParts[0] * 3600 + aParts[1] * 60 + aParts[2] * 1;
            var bParts = b.split(":");
            var bSeconds = bParts[0] * 3600 + bParts[1] * 60 + bParts[2] * 1;
            return bSeconds - aSeconds;
        }

        function currentTime() {
            thistime = new Date()
            var hours = thistime.getHours()
            var minutes = thistime.getMinutes()
            var seconds = thistime.getSeconds()
            if (eval(hours) < 10) { hours = "0" + hours }
            if (eval(minutes) < 10) { minutes = "0" + minutes }
            if (seconds < 10) { seconds = "0" + seconds }
            thistime = hours + ":" + minutes + ":" + seconds
            return thistime;
        }
    </script>
    <script src="../controller/dbSale.js"></script>
    <style type="text/css">
        .QueryPageTopdiv {
            width: 98%;
            height: 20px;
            font-weight: bold;
            text-align: left;
            font-size: 15px;
            color: #fd8f00;
            font-family: Arial;
            text-decoration: none;
        }

        .blue1 {
            FONT-SIZE: 12px;
            COLOR: #5a789f;
            LINE-HEIGHT: 20px;
            FONT-FAMILY: "Arial", "Helvetica", "sans-serif";
            TEXT-DECORATION: none;
            height: 25px;
            text-align: right;
        }

        .gray {
            FONT-SIZE: 12px;
            COLOR: #707070;
            FONT-FAMILY: "Arial", "Helvetica", "sans-serif";
            TEXT-DECORATION: none;
            height: 25px;
            text-align: center;
            width: 35%;
        }

        .smallInput {
            background: #ffffff;
            border-bottom-color: #8888AA;
            border-bottom-width: 1px;
            border-top-width: 0px;
            border-left-width: 0px;
            border-right-width: 0px;
            color: #000000;
            FONT-SIZE: 9pt;
            FONT-STYLE: normal;
            FONT-VARIANT: normal;
            FONT-WEIGHT: normal;
            LINE-HEIGHT: normal;
            margin-bottom: 0px;
            width: 95%;
        }
    </style>
</head>
<body>
    <%-- <form id="form1" runat="server">--%>
    <div class="QueryPageTopdiv">
        <img id="Img1" src="../../Images/Arrow.jpg" alt="箭头图片" style="border-width: 0px;" />
        地磅发货
    </div>
    <div style="background-image: url(../../Images/line.gif); width: 98%; height: 3px">
    </div>
    <div id="main" style="border: 2px solid #AEDEF2; border-top: 0px solid gray; width: 98%; margin: 0; padding: 0;">
        <table style="height: 60px; width: 100%; text-align: center; border: 0px solid gray; border-collapse: collapse; background-color: black;">
            <tr>
                <td style="width: 100%; vertical-align: middle; text-align: center;">
                    <input id="txtreadNum" type="text" style="width: 99%; height: 44px; border-width: 0px; background-color: black; font-size: xx-large; text-align: center; color: lime" readonly="readonly" />
                </td>
            </tr>
        </table>
        <table style="width: 98%; text-align: center; border: 0 solid gray; margin-top: 5px; border-collapse: collapse;">
            <tr>
                <td style="width: 100%">
                    <object id="MFRC500Ctrl1" data="DATA:application/x-oleobject;BASE64,vAK+NmEJrkyosf0rraGIAwAJAADYEwAA2BMAAA=="
                        classid="clsid:36BE02BC-0961-4CAE-A8B1-FD2BADA18803">
                    </object>
                    <input id="txtICPassword" runat="server" type="password" />
                    <input type="button" class="toolbar" id="btnReadCard" style="width: 50px; margin-left: 5px" value="读卡" />
                    <input type="button" class="toolbar" id="btnidentity" style="width: 70px; margin-left: 5px" value="身份验证" />
                    <input type="button" id="btn查看待称重车辆" style="width: 70px; margin-left: 5px" value="查看车辆" />
                    <input id="txtplatName" value="己烷站台" type="hidden" />
                    <input id="txtICCustomerCode" value="0002" type="hidden" />
                    <input id="txtICNum" value="0002" type="hidden" />
                    <input id="txtmeasureID" type="hidden" />
                    <input id="repeat" type="hidden" />
                </td>
            </tr>
        </table>
        <table style="width: 98%; text-align: center; border: 0 solid gray; border-collapse: collapse;">
            <tbody>
                <tr>
                    <td class="blue1">车辆选择
                    </td>
                    <td class="gray">
                        <input id="txtvehicle" class="smallInput" />
                    </td>
                    <td class="blue1">称重类型
                    </td>
                    <td class="gray">
                        <input id='pizhong' type='radio' name='sex' checked='checked' />皮重
                            <input id='maozhong' type='radio' name='sex' style='margin-left: 5px; margin-top: 3px' />毛重
                            <%--<asp:RadioButton ID="rb称取皮重" runat="server" Text="皮重" GroupName="group称重类型" OnCheckedChanged="rb称取皮重_CheckedChanged"
                                AutoPostBack="True"></asp:RadioButton>--%>
                            &nbsp;&nbsp;
                                <%--<asp:RadioButton ID="rb称取毛重" runat="server" Text="毛重" GroupName="group称重类型" OnCheckedChanged="rb称取毛重_CheckedChanged"
                                    AutoPostBack="True"></asp:RadioButton>--%>
                    </td>
                </tr>
                <tr>
                    <td class="blue1">&nbsp;客户名称
                    </td>
                    <td class="gray">
                        <input id="txtcustomer" class="smallInput" type="text" readonly="readonly" /><input id="txtcustomerID" type="hidden" />
                    </td>
                    <td class="blue1">站台
                    </td>
                    <td class="gray">
                        <input id="txtplatform" class="smallInput" type="text" readonly="readonly" />
                    </td>
                </tr>
                <tr>
                    <td class="blue1">&nbsp;产品名称
                    </td>
                    <td class="gray">
                        <input id="txtmaterial" class="smallInput" type="text" readonly="readonly" /><input id="txtmaterialID" type="hidden" />
                    </td>
                    <td class="blue1">计量单类型
                    </td>
                    <td class="gray">
                        <input id="txtmeasureType" class="smallInput" type="text" readonly="readonly" />
                        &nbsp;
                    </td>
                </tr>
                <tr>
                    <td class="blue1">&nbsp;车号
                    </td>
                    <td class="gray">
                        <input id="txtvehicleNum" class="smallInput" type="text" readonly="readonly" />
                    </td>
                    <td class="blue1">计划量(吨)
                    </td>
                    <td class="gray">
                        <input id="txtplanQuantity" class="smallInput" type="text" readonly="readonly" />
                    </td>
                </tr>
                <tr>
                    <td class="blue1">&nbsp;提货单号
                    </td>
                    <td class="gray">
                        <input id="txtLadeBillNum" class="smallInput" type="text" readonly="readonly" /><input id="txtladeBillID" type="hidden" />
                    </td>
                    <td class="blue1">皮重时间
                    </td>
                    <td class="gray">
                        <input id="txttareTime" class="smallInput" type="text" readonly="readonly" />
                    </td>
                </tr>
                <tr>
                    <td class="blue1">&nbsp;轻车司磅员
                    </td>
                    <td class="gray">
                        <input id="txtlightOperator" class="smallInput" type="text" readonly="readonly" />
                    </td>
                    <td class="blue1">&nbsp;皮重(吨)
                    </td>
                    <td class="gray">
                        <input id="txttare" class="smallInput" type="text" readonly="readonly" />
                    </td>
                </tr>
                <tr>
                    <td class="blue1">&nbsp;重车司磅员
                    </td>
                    <td class="gray">
                        <input id="txtheavyOperator" class="smallInput" type="text" readonly="readonly" />
                    </td>
                    <td class="blue1">&nbsp;毛重时间
                    </td>
                    <td class="gray">
                        <input id="txtgrossTime" class="smallInput" type="text" readonly="readonly" />
                    </td>
                </tr>
                <tr>
                    <td class="blue1">&nbsp;提货日期
                    </td>
                    <td class="gray">
                        <input id="txtladeDate" class="smallInput" type="text" readonly="readonly" />
                    </td>
                    <td class="blue1">&nbsp;毛重(吨)
                    </td>
                    <td class="gray">
                        <input id="txtgross" class="smallInput" type="text" readonly="readonly" />
                    </td>
                </tr>
                <tr>
                    <td class="blue1">发货罐体
                    </td>
                    <td class="gray">
                        <input id="txtdeliveryTank" class="smallInput" />
                    </td>
                    <td class="blue1">&nbsp;净重(吨)
                    </td>
                    <td class="gray">
                        <input id="txtnetWeight" class="smallInput" type="text" readonly="readonly" />
                    </td>
                </tr>
                <tr>
                    <td class="blue1">封签号
                    </td>
                    <td class="gray">
                        <input id="txtsealNum" class="smallInput" />
                    </td>
                    <td class="blue1">备注
                    </td>
                    <td class="gray">
                        <input id="txtcomment" class="smallInput" />
                    </td>
                </tr>
                <tr>
                    <td class="blue1">&nbsp;
                    </td>
                    <td class="gray">注意：封签号信息只有在称取毛重时输入有效
                    </td>
                    <td class="blue1">&nbsp;
                    </td>
                    <td class="gray">&nbsp;
                    </td>
                </tr>
            </tbody>
        </table>
        <table style="width: 98%; text-align: center; border: 0 solid gray; border-collapse: collapse;">
            <tr>
                <td style="width: 100%;">
                    <input type="button" id="btnreadNum" style="width: 50px; margin-left: 5px" value="读 数" />
                    <input type="button" id="btnsave" style="width: 50px; margin-left: 5px" value="保 存" />
                    <input type="button" id="btncontinue" style="width: 50px; margin-left: 5px" value="继 续" />
                    <%--<asp:Button ID="btn读数" OnClick="btn读数_Click" runat="server" Width="59px" Text="读数"
                            type="text" readonly="readonly"></asp:Button>--%>
                    <%--<asp:Button ID="btn保存" OnClick="btn保存_Click" runat="server" Width="59px" Text="保 存"></asp:Button>--%>
                    <%--<asp:Button ID="btn继续" OnClick="btn继续_Click" runat="server" Width="59px" Text="继续"
                            Visible="False"></asp:Button>--%>
                </td>
            </tr>
            <tr>
                <td class="blue1" style="text-align: center" colspan="4">
                    <a id="printMeasure">打印磅单 </a>
                    &nbsp;
                        <a id="printExit">打印出门证 </a>
                    &nbsp;
                        <a id="printLadeBill">打印提货单 </a>
                </td>
            </tr>
        </table>
    </div>
    <div id="vehiclePop" style="width: 560px; height: 400px; position: absolute; background-color: White; display: none; z-index: 9">
        <div id="vehicleGrid" style="width: 540px; height: 400px; float: left; border: 1px solid #E3E3E3;">
        </div>
    </div>
    <%--  </form>--%>
</body>
</html>
