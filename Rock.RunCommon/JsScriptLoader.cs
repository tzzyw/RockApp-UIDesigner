using Rock.Dyn.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rock.RunCommon
{
    internal class JsScriptLoader
    {
        private string[] _coreObjectNames = { "Application", "Module", "Namespace", "Class", "Method", "Property", "Parameter", "SystemService", "ISystemService" };
        private Dictionary<string, string> _jsScriptDict = new Dictionary<string, string>();

        /// <summary>
        /// 统一生成js动态库
        /// </summary>
        internal void GenJsScript()
        {
            //清空类型名称、内容字典
            _jsScriptDict.Clear();

            StringBuilder jsCodeBuilder = new StringBuilder();

            //生成DynInterfaceJavascript代码
            for (int i = 0; i < DynTypeManager.DynInterfaces.Count; i++)
            {
                DynInterface dynInterface = DynTypeManager.DynInterfaces[i];
                DynMethod[] methods = dynInterface.GetMethods();
                if (methods.Length > 0)
                {                 //清空
                    jsCodeBuilder.Clear();

                    //js接口对象的声明
                    jsCodeBuilder.AppendLine("var " + dynInterface.Name + " = function (){");

                    //js接口对象的变量声明                   
                    jsCodeBuilder.AppendLine("    var name = \"" + dynInterface.Name + "\";");
                    jsCodeBuilder.AppendLine("    var nameSpace = \"" + dynInterface.Namespace + "\";");
                    jsCodeBuilder.AppendLine("    var methods = {};");

                    //构造methodNames methodResultTypes methodResultcollectionTypes methodResultstructNames paramaterInfoAll 集合
                    string methodNames = "    var methodNames = [", methodResultTypes = "    var methodResultTypes = [", methodResultcollectionTypes = "    var methodResultcollectionTypes = [", methodResultstructNames = "    var methodResultstructNames = [", paramaterInfoAll = "    var paramaterInfoAll = [";


                    List<string> methodNameList = new List<string>();
                    for (int j = 0; j < methods.Length; j++)
                    {
                        methodNameList.Add(methods[j].Name);
                        //methodNames
                        methodNames += "\"" + methods[j].Name + "\"";

                        //methodResultTypes
                        methodResultTypes += "rock.core.DynType." + methods[j].Result.DynType.ToString();

                        //methodResultcollectionType
                        methodResultcollectionTypes += "rock.core.CollectionType." + methods[j].Result.CollectionType.ToString();

                        //methodResultstructNames
                        methodResultstructNames += "\"" + methods[j].Result.StructName + "\"";

                        //paramaterInfoAll
                        DynParameter[] paramaters = methods[j].GetParameters();
                        if (paramaters.Length == 0)
                        {
                            paramaterInfoAll += "[[]]";
                        }
                        else
                        {
                            for (int k = 0; k < paramaters.Length; k++)
                            {
                                if (k == 0)
                                {
                                    paramaterInfoAll += "[[" + paramaters[k].ID + ",";
                                }
                                else
                                {
                                    paramaterInfoAll += "[" + paramaters[k].ID + ",";
                                }
                                paramaterInfoAll += "\"" + paramaters[k].Name + "\",";
                                paramaterInfoAll += "rock.core.CollectionType." + paramaters[k].CollectionType.ToString() + ",";
                                paramaterInfoAll += "rock.core.DynType." + paramaters[k].DynType.ToString() + ",";


                                if (k < paramaters.Length - 1)
                                {
                                    paramaterInfoAll += "\"" + paramaters[k].StructName + "\"],";
                                }
                                else
                                {
                                    paramaterInfoAll += "\"" + paramaters[k].StructName + "\"]]";
                                }
                            }
                        }

                        if (j < methods.Length - 1)
                        {
                            methodNames += ",";
                            methodResultTypes += ",";
                            methodResultcollectionTypes += ",";
                            methodResultstructNames += ",";
                            paramaterInfoAll += ",";
                        }
                        else
                        {
                            methodNames += "];";
                            methodResultTypes += "];";
                            methodResultcollectionTypes += "];";
                            methodResultstructNames += "];";
                            paramaterInfoAll += "];";
                        }
                    }

                    jsCodeBuilder.AppendLine(methodNames);
                    jsCodeBuilder.AppendLine(methodResultTypes);
                    jsCodeBuilder.AppendLine(methodResultcollectionTypes);
                    jsCodeBuilder.AppendLine(methodResultstructNames);
                    jsCodeBuilder.AppendLine(paramaterInfoAll);

                    jsCodeBuilder.AppendLine();
                    jsCodeBuilder.AppendLine("    for (var i = 0; i < methodNames.length; i++) {");
                    jsCodeBuilder.AppendLine("        var paramaterInfos = paramaterInfoAll[i];");
                    jsCodeBuilder.AppendLine("        var method = new rock.core.Method(methodNames[i], paramaterInfos, methodResultTypes[i], methodResultcollectionTypes[i], methodResultstructNames[i], \"" + dynInterface.Name + "\")");
                    jsCodeBuilder.AppendLine("        var methodName = method.name.substr(0, 1).toLowerCase() + method.name.substr(1);");
                    jsCodeBuilder.AppendLine("        methods[methodName] = method;");
                    jsCodeBuilder.AppendLine("    }");
                    jsCodeBuilder.AppendLine();
                    jsCodeBuilder.AppendLine("    function getMethods() {");
                    jsCodeBuilder.AppendLine("        return methods;");
                    jsCodeBuilder.AppendLine("    }");
                    jsCodeBuilder.AppendLine();
                    jsCodeBuilder.AppendLine("    return {");
                    jsCodeBuilder.AppendLine("        name: name,");
                    jsCodeBuilder.AppendLine("        nameSpace: nameSpace,");
                    for (int l = 0; l < methodNameList.Count; l++)
                    {
                        jsCodeBuilder.AppendLine("        " + methodNameList[l].Substring(0, 1).ToLower() + methodNameList[l].Substring(1) + " : methods." + methodNameList[l].Substring(0, 1).ToLower() + methodNameList[l].Substring(1) + ",");
                    }
                    jsCodeBuilder.AppendLine("        getMethods: getMethods");
                    jsCodeBuilder.AppendLine("    };");
                    jsCodeBuilder.AppendLine("} ();");
                    jsCodeBuilder.AppendLine("parent." + dynInterface.Name + " = " + dynInterface.Name + ";");
                    string ss = jsCodeBuilder.ToString();
                    _jsScriptDict.Add(dynInterface.Name, jsCodeBuilder.ToString());
                }
            }

            //生成DynClassJavascript代码
            for (int i = 0; i < DynTypeManager.DynClasses.Count; i++)
            {
                DynClass dynClass = DynTypeManager.DynClasses.Values.ToArray()[i];

                //有接口的不需要生成:

                DynProperty[] properties = dynClass.GetProperties();
                List<DynMethod> methods = new List<DynMethod>();

                foreach (DynMethod method in dynClass.GetMethods())
                {
                    if (method.ContainsAttribute("OperationContract"))
                    {
                        methods.Add(method);
                    }
                }


                int length = properties == null ? 0 : properties.Length;

                if (length > 0)
                {
                    //清空
                    jsCodeBuilder.Clear();
                    //实体对象的声明
                    jsCodeBuilder.AppendLine("var " + dynClass.Name + "Class = function (){");

                    //js实体对象变量声明                   
                    jsCodeBuilder.AppendLine("    var className = \"" + dynClass.Name + "\";");
                    jsCodeBuilder.AppendLine("    var displayName = \"" + dynClass.DisplayName + "\";");
                    jsCodeBuilder.AppendLine("    var nameSpace = \"" + dynClass.Namespace + "\";");
                    if (dynClass.BaseClass != null)
                    {
                        jsCodeBuilder.AppendLine("    var baseClassName = \"" + dynClass.BaseClass.Name + "\";");
                    }
                    jsCodeBuilder.AppendLine("    var properties = new rock.Dictionary();");
                    jsCodeBuilder.AppendLine("    var methods = {};");
                    //方法是否在此处生成需要讨论

                    //构造propertyInfoAll 集合
                    string propertyInfoAll = "    var propertyInfoAll = [";

                    List<string> propertyNameList = new List<string>();
                    //var propertyInfoAll = [[0, "ApplicationID", CollectionType.None, DynType.I32,""], [1, "ApplicationName", CollectionType.None, DynType.String,""], [2, "Description", CollectionType.None, DynType.String,""], [3, "Version", CollectionType.None, DynType.I32,""]];
                    Dictionary<DynProperty, string> vaildateProperties = new Dictionary<DynProperty, string>();
                    StringBuilder validateSB = new StringBuilder();
                    StringBuilder validateBindingSB = new StringBuilder();
                    for (int j = 0; j < properties.Length; j++)
                    {
                        propertyNameList.Add(properties[j].Name);
                        propertyInfoAll += "[" + properties[j].ID + ",";
                        propertyInfoAll += "\"" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\",";
                        propertyInfoAll += "rock.core.CollectionType." + properties[j].CollectionType.ToString() + ",";
                        propertyInfoAll += "rock.core.DynType." + properties[j].DynType.ToString() + ",";
                        propertyInfoAll += "\"" + properties[j].StructName + "\",";
                        propertyInfoAll += "\"" + properties[j].Description + "\",";
                        propertyInfoAll += "\"" + properties[j].DisplayName + "\",";

                        StringBuilder designInfoSB = new StringBuilder();
                        //string validateType = "";
                        //string inputTypeStr = "";

                        designInfoSB.Append("{");
                        bool hasDesignInfo = false;
                        foreach (var attribute in properties[j].Attributes)
                        {
                            //TODO:脚本控件验证处理 
                            if (attribute.DynClass.Name == "DesignInfo")
                            {
                                designInfoSB.Append(" validateType:\"");

                                switch (attribute["ValidateType"].ToString())
                                {
                                    case "Number":
                                        designInfoSB.Append("number\",");
                                        validateSB.AppendLine("        if (!$(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\").validate(\"number\", \"" + properties[j].DisplayName + "\")) {");
                                        validateSB.AppendLine("                return false;");
                                        validateSB.AppendLine("        }");

                                        validateBindingSB.AppendLine("$(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\").blur(function () {");
                                        validateBindingSB.AppendLine("        if (!$(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\").validate(\"number\", \"" + properties[j].DisplayName + "\")) {");
                                        validateBindingSB.AppendLine("                return false;");
                                        validateBindingSB.AppendLine("                }");
                                        validateBindingSB.AppendLine("                return true;");
                                        validateBindingSB.AppendLine("       });");
                                        break;
                                    case "Date":
                                        designInfoSB.Append("date\",");
                                        validateSB.AppendLine("if (!$(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\").validate(\"date\", \"" + properties[j].DisplayName + "\")) {");
                                        validateSB.AppendLine("        return false;");
                                        validateSB.AppendLine("}");

                                        validateBindingSB.AppendLine("$(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\").blur(function () {");
                                        validateBindingSB.AppendLine("        if (!$(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\").validate(\"date\", \"" + properties[j].DisplayName + "\")) {");
                                        validateBindingSB.AppendLine("                return false;");
                                        validateBindingSB.AppendLine("                }");
                                        validateBindingSB.AppendLine("                return true;");
                                        validateBindingSB.AppendLine("       });");

                                        break;
                                    default:
                                        designInfoSB.Append("none\",");
                                        break;
                                }

                                //validateSB.Append("none\",");
                                // h:"", GridColAlign:"", GridColSorting: "", GridColType:"", isRequired: "True" } };
                                designInfoSB.Append("inputType:\"" + attribute["InputType"].ToString() + "\",");
                                if (attribute["GridHeader"] == null)
                                {
                                    designInfoSB.Append("gridHeader:\"\",");
                                }
                                else
                                {
                                    designInfoSB.Append("gridHeader:\"" + attribute["GridHeader"].ToString() + "\",");
                                }
                                designInfoSB.Append("gridWidth:\"" + attribute["GridWidth"].ToString() + "\",");
                                designInfoSB.Append("gridColAlign:\"" + attribute["GridColAlign"].ToString() + "\",");
                                designInfoSB.Append("gridColSorting:\"" + attribute["GridColSorting"].ToString() + "\",");
                                designInfoSB.Append("gridColType:\"" + attribute["GridColType"].ToString() + "\",");
                                if (attribute["ReferType"] == null)
                                {
                                    designInfoSB.Append("referType:\"None\",");
                                }
                                else
                                {
                                    designInfoSB.Append("referType:\"" + attribute["ReferType"].ToString() + "\",");
                                }
                                if (attribute["QueryForm"] == null)
                                {
                                    designInfoSB.Append("queryForm: \"Value\",");
                                }
                                else
                                {
                                    designInfoSB.Append("queryForm: \"" + attribute["QueryForm"].ToString() + "\",");
                                }
                                if ((bool)attribute["IsReadOnly"])
                                {
                                    designInfoSB.Append("isReadOnly: true,");
                                }
                                else
                                {
                                    designInfoSB.Append("isReadOnly: false,");
                                }
                                if ((bool)attribute["IsRequired"])
                                {
                                    designInfoSB.Append("isRequired: true}]");
                                    //判断是否是通用参照
                                    if (string.IsNullOrWhiteSpace(attribute["ReferType"] as string))
                                    {
                                        //判断是否是一对多关联关系
                                        if (string.IsNullOrWhiteSpace(properties[j].StructName))
                                        {
                                            validateSB.AppendLine("        if (!$(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\").validate(\"required\", \"" + properties[j].DisplayName + "\")) {");
                                            validateSB.AppendLine("            return false;");
                                            validateSB.AppendLine("        }");

                                            validateBindingSB.AppendLine("        $(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\").blur(function () {");
                                            validateBindingSB.AppendLine("            if (!$(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\").validate(\"required\", \"" + properties[j].DisplayName + "\")) {");
                                            validateBindingSB.AppendLine("                return false;");
                                            validateBindingSB.AppendLine("            }");
                                            validateBindingSB.AppendLine("            return true;");
                                            validateBindingSB.AppendLine("         });");
                                        }
                                        else
                                        {
                                            validateSB.AppendLine("        if (!$(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "ID\").validate(\"required\", \"" + properties[j].DisplayName + "\")) {");
                                            validateSB.AppendLine("            return false;");
                                            validateSB.AppendLine("        }");

                                            validateBindingSB.AppendLine("        $(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "\").blur(function () {");
                                            validateBindingSB.AppendLine("            if (!$(\"#txt" + properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1) + "ID\").validate(\"required\", \"" + properties[j].DisplayName + "\")) {");
                                            validateBindingSB.AppendLine("                return false;");
                                            validateBindingSB.AppendLine("            }");
                                            validateBindingSB.AppendLine("            return true;");
                                            validateBindingSB.AppendLine("         });");
                                        }
                                    }
                                }
                                else
                                {
                                    designInfoSB.Append("isRequired: false}]");
                                }
                                //inputTypeStr = attribute["InputType"].ToString();
                                hasDesignInfo = true;
                            }
                            //if (Zork.Dyn.AttProcesser.DynAttributeValidateManage.DynJSValidateList.ContainsKey(attribute.DynClass.Name))
                            //{
                            //    string validateJs = Zork.Dyn.AttProcesser.DynAttributeValidateManage.DynJSValidateList[attribute.DynClass.Name].GetJSValidateString(properties[j].DisplayName ?? properties[j].Description ?? properties[j].Name, attribute);
                            //    if (!string.IsNullOrEmpty(validateJs))
                            //    {
                            //        validateSB.Append(validateJs);
                            //        validateSB.Append(",");
                            //        index++;
                            //    }
                            //}
                            //else if (Zork.Dyn.AttProcesser.DynAttributeControlManage.DynControlList.ContainsKey(attribute.DynClass.Name))
                            //{
                            //    inputTypeStr = attribute.DynClass.Name;
                            //}
                        }
                        if (!hasDesignInfo)
                        {
                            designInfoSB.Append("}]");
                        }
                        //if (hasDesignInfo)
                        //{
                        //    validateSB.Length = validateSB.Length - 1;
                        //    vaildateProperties.Add(properties[j], inputTypeStr);
                        //}
                        //validateSB.Append("},");
                        //if (string.IsNullOrEmpty(inputTypeStr))
                        //{
                        //    inputTypeStr = "hidden";
                        //}
                        //validateSB.Append("\"" + inputTypeStr + "\"");
                        //validateSB.Append("]");
                        propertyInfoAll += designInfoSB.ToString();

                        if (j < properties.Length - 1)
                        {
                            propertyInfoAll += ",";
                        }
                        else
                        {
                            propertyInfoAll += "];";
                        }
                    }
                    jsCodeBuilder.AppendLine(propertyInfoAll);


                    //构造methodInfoAll 集合

                    string methodInfoAll = "";
                    if (methods.Count != 0)
                    {
                        methodInfoAll = "    var methodInfoAll = [";

                        List<DynMethod> dynVaildateMethods = new List<DynMethod>();

                        for (int j = 0; j < methods.Count; j++)
                        {
                            methodInfoAll += "[";
                            methodInfoAll += "\"" + methods[j].Name.Substring(0, 1).ToLower() + methods[j].Name.Substring(1) + "\",";
                            methodInfoAll += "\"" + methods[j].DisplayName + "\",";

                            methodInfoAll += "[";

                            foreach (var parameter in methods[j].Parameters)
                            {
                                methodInfoAll += "\"" + parameter.Key.ToString() + "\",";
                            }

                            if (methods[j].Parameters.Count > 0)
                            {
                                methodInfoAll = methodInfoAll.Substring(0, methodInfoAll.Length - 1);
                            }

                            methodInfoAll += "]";
                            methodInfoAll += "]";

                            if (j < methods.Count - 1)
                            {
                                methodInfoAll += ",";
                            }
                            else
                            {
                                methodInfoAll += "];";
                            }
                        }


                    }
                    else
                    {
                        methodInfoAll = "    var methodInfoAll = []";
                    }
                    jsCodeBuilder.AppendLine(methodInfoAll);


                    //构建验证标识列表
                    jsCodeBuilder.AppendLine();
                    jsCodeBuilder.AppendLine("    for (var i = 0; i < propertyInfoAll.length; i++) {");
                    jsCodeBuilder.AppendLine("        var propertyInfos = propertyInfoAll[i];");
                    jsCodeBuilder.AppendLine("        var property = new rock.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);");
                    jsCodeBuilder.AppendLine("        property.displayName = propertyInfos[6];");
                    jsCodeBuilder.AppendLine("        property.designInfo = propertyInfos[7];");
                    //jsCodeBuilder.AppendLine("        property.inputType = propertyInfos[8];");
                    jsCodeBuilder.AppendLine("        properties.add(property.name, property);");
                    //jsCodeBuilder.AppendLine("        properties[property.id] = property;");
                    jsCodeBuilder.AppendLine("    }");

                    jsCodeBuilder.AppendLine();
                    jsCodeBuilder.AppendLine("    for (var i = 0; i < methodInfoAll.length; i++) {");
                    jsCodeBuilder.AppendLine("        var methodInfos = methodInfoAll[i];");
                    jsCodeBuilder.AppendLine("        var method = {name:methodInfos[0],displayName:methodInfos[1],params:methodInfos[2] }");
                    jsCodeBuilder.AppendLine("        methods[method.name] = method;");
                    jsCodeBuilder.AppendLine("    }");


                    jsCodeBuilder.AppendLine();

                    //如果存在对象属性创建构造对象的方法
                    for (int j = 0; j < properties.Length; j++)
                    {
                        if (properties[j].DynType == DynType.Struct && properties[j].CollectionType == CollectionType.None)
                        {
                            string lowerPropertyName = properties[j].Name.Substring(0, 1).ToLower() + properties[j].Name.Substring(1);
                            jsCodeBuilder.AppendLine("    function get" + properties[j].Name + "() {");
                            jsCodeBuilder.AppendLine("      this." + lowerPropertyName + "= rock.GetObject(this." + lowerPropertyName + "ID, \"" + properties[j].Name + "\");");
                            jsCodeBuilder.AppendLine("    }");
                        }
                    }

                    //生成获取方法集合的方法
                    jsCodeBuilder.AppendLine();
                    jsCodeBuilder.AppendLine("    function getMethods() {");
                    jsCodeBuilder.AppendLine("        return methods;");
                    jsCodeBuilder.AppendLine("    }");
                    jsCodeBuilder.AppendLine();

                    //生成获取属性集合的方法
                    jsCodeBuilder.AppendLine();
                    jsCodeBuilder.AppendLine("    function getProperties() {");
                    jsCodeBuilder.AppendLine("        return properties;");
                    jsCodeBuilder.AppendLine("    }");
                    jsCodeBuilder.AppendLine();

                    //生成根据名称获取属性的方法
                    jsCodeBuilder.AppendLine("    function getPropertyByName(name) {");
                    jsCodeBuilder.AppendLine("        return properties.item(name);");
                    jsCodeBuilder.AppendLine("    }");
                    jsCodeBuilder.AppendLine();

                    //生成根据id获取属性的方法
                    jsCodeBuilder.AppendLine("    function getPropertyByID(id) {");
                    jsCodeBuilder.AppendLine("        var propertyValues = properties.values();");
                    jsCodeBuilder.AppendLine("        for (var i = 0; i < properties.count; i++) {");
                    jsCodeBuilder.AppendLine("            if (propertyValues[i].id == id)");
                    jsCodeBuilder.AppendLine("            {");
                    jsCodeBuilder.AppendLine("                return propertyValues[i];");
                    jsCodeBuilder.AppendLine("            }");
                    jsCodeBuilder.AppendLine("        }");
                    jsCodeBuilder.AppendLine("        return null;");
                    jsCodeBuilder.AppendLine("    }");
                    jsCodeBuilder.AppendLine();

                    jsCodeBuilder.AppendLine("    function validateValue() {");
                    jsCodeBuilder.AppendLine("        var isOk=true;");
                    jsCodeBuilder.AppendLine(validateSB.ToString());
                    //foreach (var vaildateProperty in vaildateProperties)
                    //{
                    //    string controlName = GetJSControlName(vaildateProperty.Key, vaildateProperty.Value);
                    //    if (!string.IsNullOrEmpty(controlName))
                    //    {
                    //        string propertyStringName = vaildateProperty.Key.Name.Substring(0, 1).ToLower() + vaildateProperty.Key.Name.Substring(1);
                    //        string controlDisplayName = vaildateProperty.Key.DisplayName ?? vaildateProperty.Key.Description ?? vaildateProperty.Key.Name;

                    //        validateBindingBuilder.AppendLine("  $(\"#" + controlName + "\").blur(function () {");

                    //        foreach (var attribute in vaildateProperty.Key.Attributes)
                    //        {
                    //            //TODO:脚本控件验证处理
                    //            //if (Zork.Dyn.AttProcesser.DynAttributeValidateManage.DynJSValidateList.ContainsKey(attribute.DynClass.Name))
                    //            //{
                    //            //    string valdatastr = Zork.Dyn.AttProcesser.DynAttributeValidateManage.DynJSValidateList[attribute.DynClass.Name].GetJSValidationString(controlDisplayName, attribute, controlName);
                    //            //    jsCodeBuilder.AppendLine("if(!" + valdatastr + "){");
                    //            //    jsCodeBuilder.AppendLine("      return false;");
                    //            //    jsCodeBuilder.AppendLine("}");

                    //            //    validateBindingBuilder.AppendLine("if(!" + valdatastr + "){");
                    //            //    validateBindingBuilder.AppendLine("      return false;");
                    //            //    validateBindingBuilder.AppendLine("}");
                    //            //}
                    //        }

                    //        validateBindingBuilder.AppendLine("         return true;");
                    //        validateBindingBuilder.AppendLine("   });");
                    //    }
                    //}
                    jsCodeBuilder.AppendLine("        return isOk;");
                    jsCodeBuilder.AppendLine("    }");
                    jsCodeBuilder.AppendLine();



                    //生成构造类型实例的方法
                    jsCodeBuilder.AppendLine("    function createInstance() {");
                    jsCodeBuilder.AppendLine("        return {");
                    for (int j = 0; j < properties.Length; j++)
                    {
                        jsCodeBuilder.AppendLine("            " + propertyNameList[j].Substring(0, 1).ToLower() + propertyNameList[j].Substring(1) + ": null,");
                        if (properties[j].DynType == DynType.Struct && properties[j].CollectionType == CollectionType.None)
                        {
                            jsCodeBuilder.AppendLine("            get" + properties[j].Name + ": get" + properties[j].Name + ",");
                        }
                    }
                    jsCodeBuilder.AppendLine("            ValidateValue: validateValue,");
                    jsCodeBuilder.AppendLine("            Class: this");
                    jsCodeBuilder.AppendLine("        };");
                    jsCodeBuilder.AppendLine("    }");



                    jsCodeBuilder.AppendLine("    return {");
                    jsCodeBuilder.AppendLine("        className: className,");
                    jsCodeBuilder.AppendLine("        nameSpace: nameSpace,");
                    if (dynClass.BaseClass != null)
                    {
                        jsCodeBuilder.AppendLine("        BaseClassName: baseClassName,");
                    }
                    jsCodeBuilder.AppendLine("        getProperties: getProperties,");
                    for (int l = 0; l < propertyNameList.Count; l++)
                    {
                        jsCodeBuilder.AppendLine("        " + propertyNameList[l].Substring(0, 1).ToLower() + propertyNameList[l].Substring(1) + " : properties.item('" + propertyNameList[l].Substring(0, 1).ToLower() + propertyNameList[l].Substring(1) + "'),");
                    }
                    jsCodeBuilder.AppendLine("        getPropertyByName: getPropertyByName,");
                    jsCodeBuilder.AppendLine("        getPropertyByID: getPropertyByID,");
                    jsCodeBuilder.AppendLine("        createInstance: createInstance,");
                    jsCodeBuilder.AppendLine("        validateValue: validateValue,");
                    jsCodeBuilder.AppendLine("        getMethods: getMethods");
                    jsCodeBuilder.AppendLine("    };");
                    jsCodeBuilder.AppendLine("} ();");

                    //生成属性失去焦点验证验证方法
                    jsCodeBuilder.AppendLine("    " + dynClass.Name + "Class.validateBind = function() {");
                    jsCodeBuilder.AppendLine(validateBindingSB.ToString());
                    jsCodeBuilder.AppendLine("    }");
                    jsCodeBuilder.AppendLine("parent." + dynClass.Name + "Class = " + dynClass.Name + "Class;");
                    jsCodeBuilder.AppendLine();
                    //jsCodeBuilder.AppendLine("ClassFactory.addClass(" + dynClass.Name + "Class);");
                    //jsCodeBuilder.AppendLine();
                    _jsScriptDict.Add(dynClass.Name, jsCodeBuilder.ToString());
                }
            }
        }

        //private string GetJSControlName(DynProperty dynProperty, string attributeName)
        //{
        //    string strControlName = dynProperty.Name.Substring(0, 1).ToLower() + dynProperty.Name.Substring(1);
        //    switch (attributeName)
        //    {
        //        case "TextBox":
        //            strControlName = "txt" + strControlName;
        //            break;
        //        case "MultiTextBox":
        //            strControlName = "txt" + strControlName;
        //            break;
        //        case "PasswordBox":
        //            strControlName = "pass" + strControlName;
        //            break;
        //        case "Date":
        //            strControlName = "date" + strControlName;
        //            break;
        //        case "DateTime":
        //            strControlName = "date" + strControlName;
        //            break;
        //        case "Combox":
        //            strControlName = "combo" + strControlName;
        //            break;
        //        case "CheckBox":
        //            strControlName = "chk" + strControlName;
        //            break;
        //        case "RadioBox":
        //            strControlName = "txt" + strControlName;
        //            break;
        //        default:
        //            strControlName = "txt" + strControlName;
        //            break;
        //    }
        //    return strControlName;
        //}

        /// <summary>
        /// 获取指定的js动态类型
        /// </summary>
        /// <returns></returns>
        internal string GetJsScript(string[] jsTypes)
        {
            StringBuilder jsCodeBuilder = new StringBuilder();
            foreach (string jsType in jsTypes)
            {
                if (_jsScriptDict.ContainsKey(jsType))
                {
                    jsCodeBuilder.Append(_jsScriptDict[jsType]);
                    jsCodeBuilder.AppendLine();
                }
            }
            return jsCodeBuilder.ToString();
        }

        /// <summary>
        /// 获取所有的js动态类型
        /// </summary>
        /// <returns></returns>
        internal string GetJsScript()
        {
            StringBuilder jsCodeBuilder = new StringBuilder();
            foreach (var item in _jsScriptDict)
            {
                jsCodeBuilder.Append(item.Value);
                jsCodeBuilder.AppendLine();
            }
            return jsCodeBuilder.ToString();
        }
    }
}
