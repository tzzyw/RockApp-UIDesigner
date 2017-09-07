using Rock.RunCommon;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class app_view_CustomerPrintList : System.Web.UI.Page
{
    DataTable 数据列表;
    string Sql;
    DataSetHelper dsHelp = new DataSetHelper();
    protected void Page_Load(object sender, EventArgs e)
    {

    }

    protected void btn查询_Click(object sender, ImageClickEventArgs e)
    {
        Sql = "SELECT CustomerID,CustomerCode,CustomerName ,Category ,Address, LegalPerson, LegalPersonTelephone from Customer where (CustomerName like '%" + this.txt客户名称.Text.Trim() + "%' or SearchCode like '%" + this.txt客户名称.Text.Trim() + "%')";

        数据列表 = dsHelp.GetDataList(Sql);

        this.GridView1.DataSource = 数据列表;
        this.GridView1.DataBind();
    }

    public override void VerifyRenderingInServerForm(Control control)
    {
        //base.VerifyRenderingInServerForm(control);
    }
    protected void btn导出_Click(object sender, ImageClickEventArgs e)
    {
        Response.Clear();
        Response.AddHeader("content-disposition", "attachment;filename=Export.xls");
        Response.Charset = "utf-8";
        Response.ContentEncoding = System.Text.Encoding.UTF8;
        Response.Cache.SetCacheability(HttpCacheability.NoCache);
        Response.ContentType = "application/vnd.xls";
        System.IO.StringWriter stringWrite = new System.IO.StringWriter();
        System.Web.UI.HtmlTextWriter htmlWrite = new HtmlTextWriter(stringWrite);
        this.GridView1.RenderControl(htmlWrite);
        Response.Write(stringWrite.ToString());
        Response.End();
    }
}