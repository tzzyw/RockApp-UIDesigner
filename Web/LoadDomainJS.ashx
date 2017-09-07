<%@ WebHandler Language="C#" Class="LoadDomainJS" %>

using System;
using System.Web;
using Rock.RunCommon;
public class LoadDomainJS : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "text/javascript";
        string jsTypesStr = context.Request["JsTypes"];
        if (!string.IsNullOrEmpty(jsTypesStr))
        {
            string[] jsTypes = jsTypesStr.Split(',');
            context.Response.Write(AppLoader.Instance.GetJsScript(jsTypes));
        }
        context.Response.End();
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}