using Rock.RunCommon;
using Rock.StaticEntities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class app_view_NodeliveryCustomer : System.Web.UI.Page
{
    DataTable 数据列表;
    string Sql;
    DateTime 开始日期;
    Customer customer;
    DataSetHelper dsHelp = new DataSetHelper();
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            this.txtbegin.Text = DateTime.Now.ToShortDateString();
            this.txtend.Text = DateTime.Now.ToShortDateString();
        }
    }

    protected void btn禁用_Click(object sender, CommandEventArgs e)
    {
        customer = dsHelp.GetCustomer(Convert.ToInt32(e.CommandArgument));
        if (customer != null)
        {
            if (customer.Available)
            {
                customer.Available = false;
                dsHelp.SaveCustomer(customer);
                ScriptManager.RegisterStartupScript(this, this.GetType(), Guid.NewGuid().ToString(), "alert('您选择的客户禁用完成!');", true);
            }
            else
            {
                ScriptManager.RegisterStartupScript(this, this.GetType(), Guid.NewGuid().ToString(), "alert('您选择的客户已经禁用,不可以重复禁用!');", true);
            }
        }
    }

    protected void btn查询_Click(object sender, ImageClickEventArgs e)
    {
        查询数据列表();
    }

    private void 查询数据列表()
    {
        Sql = "SELECT CustomerID,CustomerName ,Category ,Address, LegalPerson, LegalPersonTelephone from Customer where Available = '1' and ForSale = '1'";

        数据列表 = dsHelp.GetDataList(Sql);

        for (int i = 0; i < 数据列表.Rows.Count; i++)
        {
            Sql = "select count(*) from LadeBill where LadeDate between '" + this.txtbegin.Text + "' and '" + Convert.ToDateTime(this.txtend.Text).AddDays(1).AddSeconds(-1).ToString() + "' and CustomerID = " + 数据列表.Rows[i]["CustomerID"];
            if (dsHelp.ExecuteCount(Sql) > 0)
            {
                数据列表.Rows[i].Delete();
            }
        }
        数据列表.AcceptChanges();
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
    protected void btn禁用所有_Click(object sender, EventArgs e)
    {
        CheckBox chk;
        Label lbl客户ID;
        foreach (GridViewRow gr in GridView1.Rows)
        {
            if (gr.RowType == DataControlRowType.DataRow)
            {
                chk = gr.FindControl("chk选中客户") as CheckBox;

                if (chk.Checked)
                {
                    lbl客户ID = gr.FindControl("lbl客户ID") as Label;
                    if (lbl客户ID != null)
                    {
                        if (lbl客户ID.Text != "")
                        {
                            customer = dsHelp.GetCustomer(Convert.ToInt32(lbl客户ID.Text));
                            if (customer != null)
                            {
                                if (customer.Available)
                                {
                                    customer.Available = false;
                                    dsHelp.SaveCustomer(customer);
                                }
                            }
                        }
                    }
                }
            }
        }
        查询数据列表();
    }
}