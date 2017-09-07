<%@ Page Language="C#" EnableEventValidation = "false" AutoEventWireup="true" CodeFile="DisabledCustomerList.aspx.cs" Inherits="app_view_DisabledCustomerList" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>已禁用客户列表</title>
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

        input.toolbar {
            border-right: #4A494A 1px solid;
            border-top: #4A494A 1px solid;
            font-size: 12px;
            margin-left: 1px;
            border-left: #4A494A 1px solid;
            cursor: pointer;
            color: #000000;
            margin-right: 1px;
            padding-top: 2px;
            border-bottom: #F48913 2px solid;
            font-family: 宋体;
            background-color: white;
            width: 77px;
            height: 21px;
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
   <div class="QueryPageTopdiv">
        <img id="Img1" src="../../Images/Arrow.jpg" alt="箭头图片" style="border-width: 0px;" />
        已禁用客户列表
    </div>
  <div style="background-image: url(../../Images/line.gif); width: 98%; height: 3px">
    </div>
        <table style="width: 98%;">
            <tr>
                <td style="width: 15%; text-align: right">
                </td>
                <td style="width: 30%">
                   
                </td>
                <td style="width: 15%;"></td>
                <td style="width: 35%; text-align: center">
                    <asp:ImageButton ID="btn查询" runat="server" ImageUrl="../../Images/button_js.gif" CssClass="ImageButton"
                        OnClick="btn查询_Click" Style="height: 20px" />
                    <asp:ImageButton ID="btn导出" runat="server" ImageUrl="../../Images/export.gif" CssClass="ImageButton"
                        OnClick="btn导出_Click" />
                    
                </td>
            </tr>
        </table>
        <div style="width: 98%; height: 90%; border: 2px; overflow: auto; border-color: #7C7C94;
            border-style: solid;">
            <asp:GridView ID="GridView1" runat="server" Width="100%" CssClass="Grid" CellPadding="2"
                AutoGenerateColumns="False">
                <Columns>
                <asp:TemplateField HeaderText="序号">                            
                            <ItemStyle Width="6%" HorizontalAlign="Center"></ItemStyle>
                            <ItemTemplate>
                                <%#Container.DataItemIndex+1%>
                            </ItemTemplate>
                        </asp:TemplateField>
                <asp:TemplateField HeaderText="客户名称">
                    <ItemStyle Width="28%"></ItemStyle>
                    <ItemTemplate>
                        <%#DataBinder.Eval(Container.DataItem, "CustomerName")%>
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="客户类别">
                    <ItemStyle Width="10%"></ItemStyle>
                    <ItemTemplate>
                        <%#DataBinder.Eval(Container.DataItem, "Category")%>
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="地址">
                    <ItemStyle Width="30%"></ItemStyle>
                    <ItemTemplate>
                        <%#DataBinder.Eval(Container.DataItem, "Address")%>
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="联系人">
                    <ItemStyle Width="8%"></ItemStyle>
                    <ItemTemplate>
                        <%#DataBinder.Eval(Container.DataItem, "LegalPerson")%>
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="联系人电话">
                    <ItemStyle Width="10%"></ItemStyle>
                    <ItemTemplate>
                        <%#DataBinder.Eval(Container.DataItem, "LegalPersonTelephone")%>
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="操作">
                    <ItemStyle Width="6%" HorizontalAlign="Center"></ItemStyle>
                    <ItemTemplate>
                        <a href='CustomerManage.html?ID=<%#DataBinder.Eval(Container.DataItem, "CustomerID")%>' target="_blank">
                            维护</a>
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
</body>
</html>
