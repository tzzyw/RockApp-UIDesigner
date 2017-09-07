<%@ WebHandler Language="C#" Class="GenerateValidateCode" %>

using System;
using System.Web;
using System.Text;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using Rock.RunCommon;
using Rock.StaticEntities;
public class GenerateValidateCode : IHttpHandler
{
    private const double IMAGELENGTHBASE = 12.5;
    private const int IMAGEHEIGHT = 22;
    private const int IMAGELINENUMBER = 25;
    private const int IMAGEPOINTNUMBER = 100;
    public static string VALIDATECODEKEY = "VALIDATECODEKEY";
    private int length = 4;
    private string code = string.Empty;


    public void ProcessRequest(HttpContext context)
    {
        //context.Response.ContentType = "text/plain";
        //context.Response.Write("Hello World");
        string key = context.Request["id"];
        Random random = new Random();
        StringBuilder sbCode = new StringBuilder();
        for (int i = 0; i < length; i++)
        {
            sbCode.Append(random.Next(0, 10));
        }

        code = sbCode.ToString();

        //保存验证码到数据库
        AuthService authService = new AuthService();
        Log log = new Log();
        log.LogType = "ValidateCode";
        log.OperaterName = key;
        log.OperaterID = -1;
        log.LogName = code;
        log.OperateTime = DateTime.Now;
        authService.AddLog(log);

        if (string.IsNullOrEmpty(code) == true) return;

        //Session[VALIDATECODEKEY] = code;

        Bitmap image = new Bitmap((int)Math.Ceiling((code.Length * IMAGELENGTHBASE)), IMAGEHEIGHT);
        Graphics g = Graphics.FromImage(image);

        random = new Random();
        try
        {
            g.Clear(Color.White);
            int x1, x2, y1, y2;
            for (int i = 0; i < IMAGELINENUMBER; i++)
            {
                x1 = random.Next(image.Width);
                x2 = random.Next(image.Height);
                y1 = random.Next(image.Width);
                y2 = random.Next(image.Height);

                g.DrawLine(new Pen(Color.Silver), x1, y1, x2, y2);
            }

            Font font = new Font("Tahoma", 12, FontStyle.Bold | FontStyle.Italic);
            LinearGradientBrush brush = new LinearGradientBrush(new Rectangle(0, 0, image.Width, image.Height), Color.Blue, Color.DarkRed, 1.2f, true);
            g.DrawString(code, font, brush, 2.0f, 2.0f);

            int x, y;
            for (int i = 0; i < IMAGEPOINTNUMBER; i++)
            {
                x = random.Next(image.Width);
                y = random.Next(image.Height);

                image.SetPixel(x, y, Color.FromArgb(random.Next()));
            }

            g.DrawRectangle(new Pen(Color.Silver), 0, 0, image.Width - 1, image.Height - 1);

            //MemoryStream ms = new MemoryStream();
            image.Save(context.Response.OutputStream, ImageFormat.Gif);

            //context.Response.ClearContent();
            //context.Response.ContentType = "image/Gif";
            //context.Response.BinaryWrite(ms.ToArray());

        }
        finally
        {

            g.Dispose();
            image.Dispose();
        }
    }

    //public string CreateCode(int length)
    //{
    //    if (length <= 0) return string.Empty;

    //    Random random = new Random();
    //    StringBuilder sbCode = new StringBuilder();
    //    for (int i = 0; i < length; i++)
    //    {
    //        sbCode.Append(random.Next(0, 10));
    //    }

    //    code = sbCode.ToString();
    //    //Session[VALIDATECODEKEY] = code;
    //    return code;
    //}

    //public void CreateValidateImage(string code)
    //{

    //}

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }



}