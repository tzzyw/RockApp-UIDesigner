<%@ Page Language="C#" AutoEventWireup="true" CodeFile="WeightPrint_Purchase.aspx.cs" Inherits="app_view_WeightPrint_Purchase" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>称重计量单打印</title>
</head>
<body>
    <form id="form1" runat="server">
    <div style="z-index:1; position: relative; left: 0px; top: 0px">
            <table style="width: 700px">
                <tr>
                    <td align="center" colspan="3" style="width: 100%; height: 18px">
                        <strong><span style="font-size: 15pt; text-decoration: underline">南京扬子石化炼化有限责任公司</span></strong></td>
                </tr>
                <tr>
                    <td colspan="3" style="width: 100%; height: 18px;">
                        <div align="center">
                            &nbsp;<strong><span style="font-size: 15pt">采购称重计量单</span></strong></div>
                    </td>
                </tr>
                <tr>
                    <td style="width: 351px; height: 18px;" align="left" valign="bottom">
                        编号：<asp:Label ID="lbl编号" runat="server" Width="138px"></asp:Label></td>
                    <td style="width: 121px; height: 18px" align="right" valign="bottom">
                        <asp:Label ID="Label1" runat="server" Width="88px"></asp:Label></td>
                    <td style="width: 121px; height: 18px;" valign="bottom">
                        计量单位：吨(t)</td>
                </tr>
            </table>
            <table style="width: 700px" border="1" cellspacing="0" bordercolor="#000000">
            <tr>
                <td style="width: 65px; height: 18px;" align="right">
                    客户名称</td>
                <td style="width: 192px; height: 18px;" align="left">
                    <asp:Label ID="lbl客户名称" runat="server" Width="190px"></asp:Label></td>
                <td style="width: 85px; height: 18px;" align="right">
                    车号</td>
                <td style="width: 156px; height: 18px;">
                    <asp:Label ID="lbl车号" runat="server" Width="145px"></asp:Label></td>
                <td style="width: 40px; height: 18px;" align="right">
                    皮重</td>
                <td style="width: 80px; height: 18px;">
                    <asp:Label ID="lbl皮重" runat="server" Width="88px"></asp:Label></td>
            </tr>
            <tr>
                <td style="width: 65px" align="right">
                    产品名称</td>
                <td style="width: 192px" align="left">
                    <asp:Label ID="lbl产品名称" runat="server" Width="190px"></asp:Label></td>
                <td style="width: 85px" align="right">
                    皮重司磅员</td>
                <td style="width: 156px">
                    <asp:Label ID="lbl皮司磅" runat="server" Width="145px"></asp:Label></td>
                <td style="width: 40px" align="right">
                    毛重</td>
                <td style="width: 80px">
                    <asp:Label ID="lbl毛重" runat="server" Width="88px"></asp:Label></td>
            </tr>
            <tr>
                <td style="width: 65px; height: 18px;" align="right">
                    运输单位</td>
                <td style="width: 192px; height: 18px;" align="left">
                    <asp:Label ID="lbl运输单位" runat="server" Width="190px"></asp:Label></td>
                <td style="width: 85px; height: 18px;" align="right">
                    毛重司磅员</td>
                <td style="width: 156px; height: 18px;">
                    <asp:Label ID="lbl毛司磅" runat="server" Width="145px"></asp:Label></td>
                <td style="width: 40px; height: 18px;" align="right">
                    净重</td>
                <td style="width: 80px; height: 18px;">
                    <asp:Label ID="lbl净重" runat="server" Width="88px"></asp:Label></td>
            </tr>
            <tr>
                <td style="width: 65px; height: 18px;" align="right">
                    皮重时间</td>
                <td style="width: 192px; height: 18px;" align="left">
                    <asp:Label ID="lbl皮重时间" runat="server" Width="190px"></asp:Label></td>
                <td style="width: 85px; height: 18px;" align="right">
                    毛重时间</td>
                <td style="width: 156px; height: 18px;">
                    <asp:Label ID="lbl毛重时间" runat="server" Width="145px"></asp:Label></td>
                <td style="height: 23px;" align="left" colspan="2">
                    收货人:</td>
            </tr>
            <tr>
                <td align="right" style="width: 65px; height: 18px">
                    备注</td>
                <td align="left" style="width: 192px; height: 18px">
                    <asp:Label ID="lbl备注" runat="server" Width="98%"></asp:Label></td>
                <td align="right" style="width: 85px; height: 18px">
                    &nbsp;</td>
                <td style="width: 156px; height: 18px">
                    &nbsp;</td>
                <td align="left" colspan="2" style="height: 23px">
                    送货人:</td>
            </tr>
            <tr>
                <td align="right" style="width: 65px; height: 18px">
                    &nbsp;</td>
                <td align="left" colspan="5" style="height: 18px">
                    &nbsp;</td>
            </tr>
        </table>
            <table style="width: 698px">
            <tr>
                <td align="left" style="width: 650px">
                    查询网址:http://www.njlhgs.com</td>
            </tr>
        </table>
        </div> 
        <div id="divSeal" runat="server" style="z-index: 2; margin: -120px auto auto 510px">
            <img alt="" src="../../Images/JiLiang.gif" />
        </div>
               <script type="text/javascript">
                   window.print();
               </script>    
    </form>
</body>
</html>
