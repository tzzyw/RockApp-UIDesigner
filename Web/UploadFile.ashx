<%@ WebHandler Language="C#" Class="UploadFile" %>

using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Net;
using System.Web;
using System.Web.Services;

/// <summary>
/// Handler1 的摘要说明
/// </summary>
public class UploadFile : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {

        context.Response.ContentType = "text/plain";

        HttpPostedFile file = context.Request.Files["Filedata"];
        string fileType = "." + file.FileName.Split('.')[file.FileName.Split('.').Length - 1];
        string serverFileName = DateTime.Now.Ticks.ToString() + fileType;

        string uploadPath = HttpContext.Current.Server.MapPath("Upload") + "\\";

        if (file != null)
        {
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            file.SaveAs(uploadPath + serverFileName);
            context.Response.Write(uploadPath + "&&" + serverFileName);
        }
        else
        {
            context.Response.Write("0");
        }

    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }
}
