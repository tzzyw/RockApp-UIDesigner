<%@ Page Language="C#" AutoEventWireup="true" CodeFile="CustomerQualityQuery.aspx.cs" Inherits="app_view_CustomerQualityQuery" %>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>客户资质列表</title>   
    <link href="../../resource/dhtmlx/codebase/dhtmlx.css" rel="stylesheet" />
    <script src="../../resource/dhtmlx/codebase/dhtmlx.js"></script>
    <script src="../../resource/common/jquery-1.8.2.min.js" type="text/javascript"></script>
    <script src="../../resource/common/rock-common.js"></script>
    <script src="../controller/customerQualityList.js"></script>
    <style type="text/css">
        html {
            height: 100%;
        }

        body {
            height: 95%;
            margin: 1px 5px auto 7px;
        }

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

        .ImageButton {
            display: inline;
            vertical-align: middle;
        }

        .HeadingCell {
            background-color: #F1F1F1;
            border: 1px solid #FFFFFF;
            border-right-color: #B5B5B5;
            border-bottom-color: #B5B5B5;
            padding: 3px;
        }

        .DataRow td.FirstDataCell {
            padding-left: 3px;
        }

        .SelectedRow {
            background-color: #FFEEC2;
        }

            .SelectedRow td.DataCell {
                cursor: default;
                padding: 2px;
                padding-left: 3px;
                padding-bottom: 3px;
                font-family: verdana;
                font-size: 9px;
                border-bottom: 1px solid #4B4B6F;
                border-top: 1px solid #4B4B6F;
                border-right: 0px;
            }

        .GridFooter {
            cursor: default;
            padding: 5px;
        }

            .GridFooter a {
                color: Black;
                font-weight: bold;
            }

        .PagerText {
            font-family: verdana;
            font-size: 9px;
        }


        /* 1.1新加的和调整后的样式表 */

        .Grid {
            border: 0px solid #7C7C94;
            background-color: #FFFFFF;
            cursor: pointer;
            border-collapse: collapse;
        }

            .Grid td, th {
                border-bottom: 1px dotted #666;
                border-top: 0px dotted #666;
                border-left: 0px dotted #666;
                border-right: 0px dotted #666;
                height: 40px;
                text-align: center;
            }

        .GridViewHeader {
            position: relative;
            table-layout: fixed;
            font-weight: bold;
            font-size: 15px;
            color: Navy;
            z-index: 0;
            background-color: #CEDDF0;
            background-image: url('../Images/GridViewHeader.jpg');
        }

        .GridViewHeaderscroll {
            font-weight: bold;
            font-size: 13px;
            color: Navy;
            z-index: 0;
            background-color: #CEDDF0;
            line-height: 20px;
        }

        .DataRow {
            font-size: 12px;
            color: #325699;
            line-height: 20px;
            font-family: "Arial", "Helvetica", "sans-serif";
            text-decoration: none;
        }

        .AlternatingRowStyle {
            font-size: 12px;
            color: #325699;
            line-height: 20px;
            font-family: "Arial", "Helvetica", "sans-serif";
            text-decoration: none;
        }


        /**************2,快查GridView样式****************/

        .Grid1 {
            border: 0px solid #7C7C94;
            background-color: #FFFFFF;
            cursor: pointer;
            border-collapse: collapse;
        }

            .Grid1 td, th {
                border-bottom: 1px dotted #666;
                border-top: 0px dotted #666;
                border-left: 0px dotted #666;
                border-right: 0px dotted #666;
                height: 20px;
            }

        .GridViewHeader1 {
            position: relative;
            table-layout: fixed;
            font-weight: bold;
            font-size: 15px;
            color: Navy;
            z-index: 0;
            background-color: #CEDDF0;
            background-image: url('../Images/GridViewHeader.jpg');
        }

        .GridViewHeaderscroll1 {
            font-weight: bold;
            font-size: 13px;
            color: Navy;
            z-index: 0;
            background-color: #CEDDF0;
            line-height: 20px;
        }

        .DataRow1 {
            font-size: 12px;
            color: #325699;
            line-height: 20px;
            font-family: "Arial", "Helvetica", "sans-serif";
            text-decoration: none;
        }

        .AlternatingRowStyle1 {
            font-size: 12px;
            color: #325699;
            line-height: 20px;
            font-family: "Arial", "Helvetica", "sans-serif";
            text-decoration: none;
        }
    </style>
</head>
<body >
    <form id="form1" runat="server" style="height:100%">
        <div class="QueryPageTopdiv">
            <img id="Img1" src="../../Images/Arrow.jpg" alt="箭头图片" style="border-width: 0px;" />
            客户资质列表<asp:HiddenField ID="txtcustomerID" runat="server" />
        </div>
        <div style="background-image: url(../../Images/line.gif); width: 98%; height: 3px">
        </div>
        <table style="width: 98%;">
            <tr>
                <td style="width: 10%; text-align: right">选择客户:
                </td>
                <td style="width: 20%">
                    <input id="txtcustomerSearch" class="smallInput" type="text" />
                </td>
                <td style="width: 35%;"></td>
                <td style="width: 35%; text-align: center">
                    <asp:ImageButton ID="btn查询" runat="server" ImageUrl="../../Images/button_js.gif" CssClass="ImageButton"
                        OnClick="btn查询_Click" Style="height: 20px" />
                    <asp:ImageButton ID="btn导出" runat="server" ImageUrl="../../Images/export.gif" CssClass="ImageButton"
                        OnClick="btn导出_Click" />                     
                </td>
            </tr>
        </table>
        <div style="width: 98%; height: 90%; border: 2px; overflow: auto; border-color: #7C7C94; border-style: solid;">
            <asp:GridView ID="GridView1" runat="server" Width="100%" CssClass="Grid" CellPadding="2"
                AutoGenerateColumns="False" OnRowDataBound="GridView1_RowDataBound" DataKeyNames="CustomerID">
                <Columns>
                    <asp:TemplateField HeaderText="客户编码">
                        <ItemStyle></ItemStyle>
                        <ItemTemplate>
                            <%#DataBinder.Eval(Container.DataItem, "CustomerCode")%>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="客户名称">
                        <ItemStyle></ItemStyle>
                        <ItemTemplate>
                            <%#DataBinder.Eval(Container.DataItem, "CustomerName")%>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="资质列表">
                        <ItemStyle></ItemStyle>
                        <ItemTemplate>
                            <asp:GridView ID="GridView2" runat="server" Width="100%" CssClass="Grid1" CellPadding="0"
                                AutoGenerateColumns="False" BorderWidth="1px">
                                <Columns>
                                    <asp:TemplateField HeaderText="资质分类">
                                        <ItemStyle></ItemStyle>
                                        <ItemTemplate>
                                            <%#DataBinder.Eval(Container.DataItem, "CustomerQualificationCategory")%>
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                    <asp:TemplateField HeaderText="许可证号">
                                        <ItemStyle></ItemStyle>
                                        <ItemTemplate>
                                            <%#DataBinder.Eval(Container.DataItem, "LicenseNumber")%>
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                    <asp:TemplateField HeaderText="开始有效时间">
                                        <ItemStyle></ItemStyle>
                                        <ItemTemplate>
                                            <%#DataBinder.Eval(Container.DataItem, "BeginEffectiveDate","{0:yyyy-MM-dd}")%>
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                    <asp:TemplateField HeaderText="结束有效时间">
                                        <ItemStyle></ItemStyle>
                                        <ItemTemplate>
                                            <%#DataBinder.Eval(Container.DataItem, "EndEffectiveDate", "{0:yyyy-MM-dd}")%>
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                    <asp:TemplateField HeaderText="附件">
                                        <ItemStyle></ItemStyle>
                                        <ItemTemplate>
                                            <asp:Literal ID="Literal1" runat="server" Text='<%#DataBinder.Eval(Container.DataItem, "Attachment")%>'></asp:Literal>
                                        </ItemTemplate>
                                    </asp:TemplateField>
                                </Columns>
                                <HeaderStyle CssClass="GridViewHeaderscroll"></HeaderStyle>
                                <RowStyle CssClass="DataRow"></RowStyle>
                                <AlternatingRowStyle CssClass="AlternatingRowStyle" />
                                <FooterStyle CssClass="GridFooter"></FooterStyle>
                                <EmptyDataTemplate>
                                    <br />
                                    <span>在当前的查询条件下没有任何数据！</span>
                                    <br />
                                </EmptyDataTemplate>
                            </asp:GridView>
                        </ItemTemplate>
                    </asp:TemplateField>
                </Columns>
                <HeaderStyle CssClass="GridViewHeaderscroll"></HeaderStyle>
                <RowStyle CssClass="DataRow"></RowStyle>
                <AlternatingRowStyle CssClass="AlternatingRowStyle" />
                <FooterStyle CssClass="GridFooter"></FooterStyle>
                <EmptyDataTemplate>
                    <br />
                    <span>在当前的查询条件下没有任何数据！</span>
                    <br />
                </EmptyDataTemplate>
            </asp:GridView>
        </div>
    </form>
    <div id="customerForm" style="z-index: 8; width: 410px; height: 440px; top: 200px; left: 250px; position: absolute; background-color: #FBFBFB; border-style: solid; border-color: #E3E3E3; border-width: 2px;">
        <div id="customerGrid" style="width: 100%; height: 440px"></div>
    </div>
</body>
</html>
