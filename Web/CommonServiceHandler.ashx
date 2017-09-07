<%@ WebHandler Language="C#" Class="CommonServiceHandler" %>

using System;
using System.Web;

public class CommonServiceHandler : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/plain";
        string result = "Error";
        if (context.Request["webpath"] != null)
        {
            if (context.Request["webpath"].Trim() != "")
            {
                result = HttpContext.Current.Server.MapPath(context.Request["webpath"].Trim()) + "\\";
            }
        }
        if (context.Request["ServerTime"] != null)
        {
            if (context.Request["ServerTime"].Trim() != "")
            {
                string month = DateTime.Now.Month > 9 ? DateTime.Now.Month.ToString() : "0" + DateTime.Now.Month.ToString();
                string day = DateTime.Now.Day > 9 ? DateTime.Now.Day.ToString() : "0" + DateTime.Now.Day.ToString();
                switch (context.Request["ServerTime"].Trim())
                {
                    case "Date":
                        result = DateTime.Now.Year + "-" + month + "-" + day;
                        break;
                    default:
                        result = DateTime.Now.ToString();
                        break;
                }
            }
        }
        context.Response.Write(result);
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}