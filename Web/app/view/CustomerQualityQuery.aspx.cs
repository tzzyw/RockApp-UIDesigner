using Rock.RunCommon;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class app_view_CustomerQualityQuery : System.Web.UI.Page
{
    DataTable dataList
    {
        get { return ViewState["dt数据列表"] == null ? null : (DataTable)ViewState["dt数据列表"]; }
        set { ViewState["dt数据列表"] = value; }
    }
    DataSetHelper dsHelp = new DataSetHelper();
    string Sql = "SELECT Customer.CustomerCode, CustomerQualification.CustomerQualificationID,CustomerQualification.CustomerID,Customer.CustomerName,CustomerQualification.CustomerQualificationCategory,CustomerQualification.LicenseNumber,CustomerQualification.BeginEffectiveDate,CustomerQualification.EndEffectiveDate,CustomerQualification.Attachment from CustomerQualification,Customer where Customer.CustomerID=CustomerQualification.CustomerID ";

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            查询数据列表();
        }
    }

    protected void btn查询_Click(object sender, ImageClickEventArgs e)
    {
        查询数据列表();
    }

    private void 查询数据列表()
    {
        Sql += WhereClause;
        dataList = dsHelp.GetDataList(Sql);

        this.GridView1.DataSource = dsHelp.SelectDistinct("dt主数据表", dataList, new string[] { "CustomerID", "CustomerCode", "CustomerName" });
        this.GridView1.DataBind();
    }

    public DataTable GetDataDetial(int CustomerID)
    {
        if (dataList != null)
        {
            return dsHelp.SelectInto("dt明细数据表", dataList, "CustomerQualificationCategory,LicenseNumber,BeginEffectiveDate,EndEffectiveDate,Attachment", "CustomerID=" + CustomerID, "");
        }
        else
        {
            return null;
        }
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

    #region 获得查询条件和排序方式
    private string WhereClause
    {
        get
        {
            // 形成查询条件	
            string WhereClause = "";

            if (this.txtcustomerID.Value != "")
            {
                WhereClause += String.Concat(" and Customer.CustomerID = '", this.txtcustomerID.Value + "' ");
            }

            WhereClause += " order by Customer.CustomerID ";
            return WhereClause;
        }
    }

    #endregion 获取查询条件和排序方式

    protected void GridView1_RowDataBound(object sender, GridViewRowEventArgs e)
    {
        if (e.Row.RowType == DataControlRowType.DataRow)
        {
            GridView gv = e.Row.FindControl("GridView2") as GridView;
            gv.DataSource = GetDataDetial(Convert.ToInt32(GridView1.DataKeys[e.Row.RowIndex].Values[0]));
            gv.DataBind();
        }
    }
}