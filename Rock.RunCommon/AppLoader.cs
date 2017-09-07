using Rock.Common;
using Rock.Dyn.Core;
using Rock.Orm.Common;
using Rock.Orm.Common.Design;
using Rock.Orm.Data;
using Rock.StaticEntities;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Rock.RunCommon
{
    public delegate void ExceptionHandlerDelegate(object sender, string exceptionMsg);
    public sealed class AppLoader
    {
        private static string[] CoreObjectNames = { "Object", "Application", "Module", "ApplicationModule", "Namespace", "Class", "Method", "Property", "Parameter", "ObjType", "SystemService", "ISystemService", "DataRow", "DataColumn", "DataTable", "DataSet", "PrimaryKey", "NotNull", "Persistable", "PersistIgnore", "Relation", "FkReverseQuery", "FkQuery", "SqlType", "Comment", "MappingName", "FriendKey", "RelationKey", "ServiceContract", "OperationContract" };
        private int _appID;
        private string _appName = "未知";
        private bool _isBaseSystemLoaded = false;
        private bool _isLoaded = false;
        private string _appPath;

        private JsScriptLoader jsScriptLoader = new JsScriptLoader();

        private Dictionary<int, DynEntity> moduleEntityDict = new Dictionary<int, DynEntity>();
        private Dictionary<int, DynEntity> classEntityDict = new Dictionary<int, DynEntity>();
        private Dictionary<int, DynEntity> namespaceEntityDict = new Dictionary<int, DynEntity>();
        private Dictionary<int, DynEntity> propertyEntityDict = new Dictionary<int, DynEntity>();
        private Dictionary<int, DynEntity> methodEntityDict = new Dictionary<int, DynEntity>();

        private Dictionary<int, DynObject> classObjDict = new Dictionary<int, DynObject>();
        private Dictionary<int, DynObject> namespaceObjDict = new Dictionary<int, DynObject>();
        private Dictionary<int, DynObject> propertyObjDict = new Dictionary<int, DynObject>();
        private Dictionary<int, DynObject> methodObjDict = new Dictionary<int, DynObject>();

        private Dictionary<int, DynClass> classIDDynClassMap = new Dictionary<int, DynClass>();
        private Dictionary<int, DynInterface> classIDDynInterfaceMap = new Dictionary<int, DynInterface>();
        private Dictionary<int, List<DynObject>> classIDPropertyObjsMap = new Dictionary<int, List<DynObject>>();
        private Dictionary<int, DynProperty> dynPropertyObjIDDynPropertyMap = new Dictionary<int, DynProperty>();
        private Dictionary<string, Type> types = new Dictionary<string, Type>();

        private Dictionary<string, ReflectMethod> reflectDynMethodDict = new Dictionary<string, ReflectMethod>();
        private Dictionary<string, ReflectMethod> reflectStaticMethodDict = new Dictionary<string, ReflectMethod>();

        public int AppID
        {
            get { return _appID; }
            set { _appID = value; }
        }
        public string AppName
        {
            get { return _appName; }
            set { _appName = value; }
        }

        public bool IsBaseSystemLoaded
        {
            get { return _isBaseSystemLoaded; }
        }
        public bool IsLoaded
        {
            get { return _isLoaded; }
        }

        public string AppPath
        {
            get { return _appPath; }
            set { _appPath = value; }
        }

        //单例模式实现
        public static AppLoader Instance
        {
            set
            {
                Nested.instance = value;
            }
            get
            {
                return Nested.instance;
            }
        }
        class Nested
        {
            static Nested()
            {
            }

            internal static AppLoader instance = new AppLoader();
        }

        //加载应用程序核心运行时基础体系
        public void LoadBaseSystem()
        {
            if (_isBaseSystemLoaded)
                throw new ApplicationException("应用系统已经载入，不能再次加载！");

            LoadCoreAppRunTimeInfrastructure();
        }
        /// <summary>
        /// 加载应用程序核心运行时基础体系
        /// </summary>
        public void LoadCoreAppRunTimeInfrastructure()
        {
            #region  注册系统核心动态对象类型
            /// <summary>
            /// Object动态对象类型
            /// </summary>
            DynClass dcObject = new DynClass("Object");

            DynTypeManager.RegistClass(dcObject);

            /// <summary>
            /// Application动态对象类型
            /// </summary>
            DynClass dcApplication = new DynClass("Application");

            DynProperty dpApplicationID = new DynProperty(0, "ApplicationID", DynType.I32);
            DynProperty dpApplicationName = new DynProperty(1, "ApplicationName", DynType.String);
            DynProperty dpApplicationDescription = new DynProperty(2, "Description", DynType.String);

            dcApplication.AddProperty(dpApplicationID);
            dcApplication.AddProperty(dpApplicationName);
            dcApplication.AddProperty(dpApplicationDescription);

            DynTypeManager.RegistClass(dcApplication);

            /// <summary>
            /// ApplicationModule动态对象类型
            /// </summary>
            DynClass dcApplicationModule = new DynClass("ApplicationModule");

            DynProperty dpApplicationID1 = new DynProperty(0, "ApplicationID", DynType.I32);
            DynProperty dpModuleID1 = new DynProperty(1, "ModuleID", DynType.I32);

            dcApplicationModule.AddProperty(dpApplicationID1);
            dcApplicationModule.AddProperty(dpModuleID1);

            DynTypeManager.RegistClass(dcApplicationModule);

            /// <summary>
            /// Module动态对象类型
            /// </summary>
            DynClass dcModule = new DynClass("Module");

            DynProperty dpModuleID = new DynProperty(0, "ModuleID", DynType.I32);
            DynProperty dpModuleName = new DynProperty(1, "ModuleName", DynType.String);
            DynProperty dpModuleDescription = new DynProperty(2, "Description", DynType.String);

            dcModule.AddProperty(dpModuleID);
            dcModule.AddProperty(dpModuleName);
            //dcModule.AddProperty(dpModuleNamespaces);
            dcModule.AddProperty(dpModuleDescription);

            DynTypeManager.RegistClass(dcModule);

            /// <summary>
            /// Namespace动态对象类型
            /// </summary>
            DynClass dcNamespace = new DynClass("Namespace");

            DynProperty dpNamespaceID = new DynProperty(0, "NamespaceID", DynType.I32);
            DynProperty dpNamespaceName = new DynProperty(1, "NamespaceName", DynType.String);
            DynProperty dpNamespaceDescription = new DynProperty(2, "Description", DynType.String);

            dcNamespace.AddProperty(dpNamespaceID);
            dcNamespace.AddProperty(dpNamespaceName);
            // dcNamespace.AddProperty(dpNamespaceClasses);
            dcNamespace.AddProperty(dpNamespaceDescription);

            DynTypeManager.RegistClass(dcNamespace);

            /// <summary>
            /// Class动态对象类型
            /// </summary>
            DynClass dcClass = new DynClass("Class");

            DynProperty dpClassID = new DynProperty(0, "ClassID", DynType.I32);
            DynProperty dpClassName = new DynProperty(1, "ClassName", DynType.String);
            DynProperty dpClassBaseClassName = new DynProperty(2, "BaseClassName", DynType.String);
            DynProperty dpClassMainType = new DynProperty(3, "MainType", DynType.I32);
            DynProperty dpClassInterfaceNames = new DynProperty(4, "InterfaceNames", DynType.String);
            DynProperty dpClassProperties = new DynProperty(5, "Properties", CollectionType.List, DynType.Struct, "Property");
            DynProperty dpClassMethods = new DynProperty(6, "Methods", CollectionType.List, DynType.Struct, "Method");
            DynProperty dpClassDescription = new DynProperty(7, "Description", DynType.String);
            DynProperty dpClassNamespaceID = new DynProperty(8, "NamespaceID", DynType.I32);
            DynProperty dpClassModuleID = new DynProperty(9, "ModuleID", DynType.I32);
            DynProperty dpClassAttributes = new DynProperty(10, "Attributes", DynType.String);
            DynProperty dyClassDisplayName = new DynProperty(11, "DisplayName", DynType.String);

            dcClass.AddProperty(dpClassID);
            dcClass.AddProperty(dpClassName);
            dcClass.AddProperty(dpClassBaseClassName);
            dcClass.AddProperty(dpClassMainType);
            dcClass.AddProperty(dpClassProperties);
            dcClass.AddProperty(dpClassMethods);
            dcClass.AddProperty(dpClassDescription);
            dcClass.AddProperty(dpClassInterfaceNames);
            dcClass.AddProperty(dpClassNamespaceID);
            dcClass.AddProperty(dpClassModuleID);
            dcClass.AddProperty(dpClassAttributes);
            dcClass.AddProperty(dyClassDisplayName);

            DynTypeManager.RegistClass(dcClass);

            /// <summary>
            /// Property动态对象类型
            /// </summary>
            DynClass dcProperty = new DynClass("Property");

            DynProperty dpPropertyID = new DynProperty(0, "PropertyID", DynType.I32);
            DynProperty dpPropertyName = new DynProperty(1, "PropertyName", DynType.String);
            DynProperty dpPropertyDynType = new DynProperty(2, "Type", DynType.String);
            DynProperty dpPropertyIsArray = new DynProperty(3, "IsArray", DynType.Bool);
            DynProperty dpPropertyIsInherited = new DynProperty(4, "IsInherited", DynType.Bool);
            DynProperty dpPropertyInheritEntityName = new DynProperty(5, "InheritEntityName", DynType.String);
            DynProperty dpPropertyIsQueryProperty = new DynProperty(6, "IsQueryProperty", DynType.Bool);
            DynProperty dpPropertyCollectionType = new DynProperty(7, "CollectionType", DynType.String);
            DynProperty dpPropertyStructName = new DynProperty(8, "StructName", DynType.String);
            DynProperty dpPropertyDescription = new DynProperty(9, "Description", DynType.String);
            DynProperty dpPropertyClassName = new DynProperty(10, "ClassID", DynType.I32);
            DynProperty dpPropertyAttributes = new DynProperty(11, "Attributes", DynType.String);
            DynProperty dyPropertyDisplayName = new DynProperty(12, "DisplayName", DynType.String);


            dcProperty.AddProperty(dpPropertyID);
            dcProperty.AddProperty(dpPropertyName);
            dcProperty.AddProperty(dpPropertyDynType);
            dcProperty.AddProperty(dpPropertyIsArray);
            dcProperty.AddProperty(dpPropertyIsInherited);
            dcProperty.AddProperty(dpPropertyInheritEntityName);
            dcProperty.AddProperty(dpPropertyIsQueryProperty);
            dcProperty.AddProperty(dpPropertyCollectionType);
            dcProperty.AddProperty(dpPropertyStructName);
            dcProperty.AddProperty(dpPropertyDescription);
            dcProperty.AddProperty(dpPropertyClassName);
            dcProperty.AddProperty(dpPropertyAttributes);
            dcProperty.AddProperty(dyPropertyDisplayName);


            DynTypeManager.RegistClass(dcProperty);

            /// <summary>
            /// Method动态对象类型
            /// </summary>
            DynClass dcMethod = new DynClass("Method");

            DynProperty dpMethodID = new DynProperty(0, "MethodID", DynType.I32);
            DynProperty dpMethodName = new DynProperty(1, "MethodName", DynType.String);
            DynProperty dpMethodIParameters = new DynProperty(2, "Parameters", CollectionType.List, DynType.Struct, "Parameter");
            DynProperty dpMethodIResult = new DynProperty(3, "Result", CollectionType.None, DynType.Struct, "Parameter");
            DynProperty dpMethodIBody = new DynProperty(4, "Body", DynType.String);
            DynProperty dpMethodDescription = new DynProperty(5, "Description", DynType.String);
            DynProperty dpMethodClassName = new DynProperty(6, "ClassID", DynType.I32);
            DynProperty dpMethodAttributes = new DynProperty(7, "Attributes", DynType.String);
            DynProperty dpMethodScriptType = new DynProperty(8, "ScriptType", DynType.String);
            DynProperty dpMethodIsAsync = new DynProperty(9, "IsAsync", DynType.Bool);
            DynProperty dyMethodDisplayName = new DynProperty(10, "DisplayName", DynType.String);
            DynProperty dpSourceMethodID = new DynProperty(11, "SourceMethodID", DynType.I32);

            dcMethod.AddProperty(dpMethodID);
            dcMethod.AddProperty(dpMethodName);
            dcMethod.AddProperty(dpMethodIParameters);
            dcMethod.AddProperty(dpMethodIResult);
            dcMethod.AddProperty(dpMethodIBody);
            dcMethod.AddProperty(dpMethodDescription);
            dcMethod.AddProperty(dpMethodClassName);
            dcMethod.AddProperty(dpMethodAttributes);
            dcMethod.AddProperty(dpMethodScriptType);
            dcMethod.AddProperty(dpMethodIsAsync);
            dcMethod.AddProperty(dyMethodDisplayName);
            dcMethod.AddProperty(dpSourceMethodID);

            DynTypeManager.RegistClass(dcMethod);

            /// <summary>
            /// Parameter动态对象类型
            /// </summary>
            DynClass dcParameter = new DynClass("Parameter");

            DynProperty dpParameterID = new DynProperty(0, "ParameterID", DynType.I32);
            DynProperty dpParameterName = new DynProperty(1, "ParameterName", DynType.String);
            DynProperty dpParameterType = new DynProperty(2, "Type", DynType.String);
            DynProperty dpParameterDirection = new DynProperty(3, "Direction", DynType.String);
            DynProperty dpParameterIsNullable = new DynProperty(4, "IsNullable", DynType.Bool);
            DynProperty dpParameterValue = new DynProperty(5, "Value", DynType.String);
            DynProperty dpParameterDefaultValue = new DynProperty(6, "DefaultValue", DynType.String);
            DynProperty dpParameterCollectionType = new DynProperty(7, "CollectionType", DynType.String);
            DynProperty dpParameterStructName = new DynProperty(8, "StructName", DynType.String);
            DynProperty dpParameterDescription = new DynProperty(9, "Description", DynType.String);

            dcParameter.AddProperty(dpParameterID);
            dcParameter.AddProperty(dpParameterName);
            dcParameter.AddProperty(dpParameterType);
            dcParameter.AddProperty(dpParameterDirection);
            dcParameter.AddProperty(dpParameterIsNullable);
            dcParameter.AddProperty(dpParameterValue);
            dcParameter.AddProperty(dpParameterDefaultValue);
            dcParameter.AddProperty(dpParameterCollectionType);
            dcParameter.AddProperty(dpParameterStructName);
            dcParameter.AddProperty(dpParameterDescription);

            DynTypeManager.RegistClass(dcParameter);

            //TODO:这里名称的规范需要调整 TypeID -> ObjTypeID
            /// <summary>
            /// ObjType动态对象类型
            /// </summary>
            DynClass dcObjType = new DynClass("ObjType");

            DynProperty dpObjTypeID = new DynProperty(0, "TypeID", DynType.I32);
            DynProperty dpObjTypeName = new DynProperty(1, "Name", DynType.String);
            DynProperty dpCnName = new DynProperty(2, "CnName", DynType.String);
            DynProperty dpDescription = new DynProperty(3, "Description", DynType.String);
            DynProperty dpAppLevel = new DynProperty(4, "AppLevel", DynType.String);
            DynProperty dpIsDymatic = new DynProperty(5, "IsDymatic", DynType.Bool);
            DynProperty dpNextID = new DynProperty(6, "NextID", DynType.I32);
            DynProperty dpDefinition = new DynProperty(7, "Definition", DynType.String);

            dcObjType.AddProperty(dpObjTypeID);
            dcObjType.AddProperty(dpObjTypeName);
            dcObjType.AddProperty(dpCnName);
            dcObjType.AddProperty(dpDescription);
            dcObjType.AddProperty(dpAppLevel);
            dcObjType.AddProperty(dpIsDymatic);
            dcObjType.AddProperty(dpNextID);
            dcObjType.AddProperty(dpDefinition);

            DynTypeManager.RegistClass(dcObjType);

            #endregion 注册系统核心动态对象类型

            #region 注册系统核心持久化实体对象类型
            /// <summary>
            /// ObjType实体对象类型
            /// </summary>
            DynEntityType type_ObjType = new DynEntityType("ObjType");
            type_ObjType.Namespace = "Rock.Core.Entities";
            type_ObjType.Attributes.Add(new CommentDynAttribute("对象类型"));
            type_ObjType.Attributes.Add(new MappingNameDynAttribute("ObjType"));

            DynPropertyConfiguration property_ObjType_TypeID = new DynPropertyConfiguration("TypeID");
            property_ObjType_TypeID.EntityType = type_ObjType;
            property_ObjType_TypeID.PropertyType = typeof(int).ToString();
            property_ObjType_TypeID.Attributes.Add(new PrimaryKeyDynAttribute());
            property_ObjType_TypeID.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_ObjType_Name = new DynPropertyConfiguration("Name");
            property_ObjType_Name.EntityType = type_ObjType;
            property_ObjType_Name.PropertyType = typeof(string).ToString();
            property_ObjType_Name.Attributes.Add(new SqlTypeDynAttribute("nvarchar(50)"));
            property_ObjType_Name.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_ObjType_CnName = new DynPropertyConfiguration("CnName");
            property_ObjType_CnName.EntityType = type_ObjType;
            property_ObjType_CnName.PropertyType = typeof(string).ToString();
            property_ObjType_CnName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(50)"));
            property_ObjType_CnName.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_ObjType_Description = new DynPropertyConfiguration("Description");
            property_ObjType_Description.EntityType = type_ObjType;
            property_ObjType_Description.PropertyType = typeof(string).ToString();
            property_ObjType_Description.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            DynPropertyConfiguration property_ObjType_AppLevel = new DynPropertyConfiguration("AppLevel");
            property_ObjType_AppLevel.EntityType = type_ObjType;
            property_ObjType_AppLevel.PropertyType = typeof(string).ToString();
            property_ObjType_AppLevel.Attributes.Add(new SqlTypeDynAttribute("nvarchar(50)"));
            property_ObjType_AppLevel.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_ObjType_IsDymatic = new DynPropertyConfiguration("IsDymatic");
            property_ObjType_IsDymatic.EntityType = type_ObjType;
            property_ObjType_IsDymatic.PropertyType = typeof(bool).ToString();
            property_ObjType_IsDymatic.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_ObjType_NextID = new DynPropertyConfiguration("NextID");
            property_ObjType_NextID.EntityType = type_ObjType;
            property_ObjType_NextID.PropertyType = typeof(int).ToString();
            property_ObjType_NextID.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_ObjType_Definition = new DynPropertyConfiguration("Definition");
            property_ObjType_Definition.EntityType = type_ObjType;
            property_ObjType_Definition.PropertyType = typeof(string).ToString();
            property_ObjType_Definition.Attributes.Add(new SqlTypeDynAttribute("text"));

            type_ObjType.AddProperty(property_ObjType_TypeID);
            type_ObjType.AddProperty(property_ObjType_Name);
            type_ObjType.AddProperty(property_ObjType_CnName);
            type_ObjType.AddProperty(property_ObjType_Description);
            type_ObjType.AddProperty(property_ObjType_AppLevel);
            type_ObjType.AddProperty(property_ObjType_IsDymatic);
            type_ObjType.AddProperty(property_ObjType_NextID);
            type_ObjType.AddProperty(property_ObjType_Definition);

            DynEntityTypeManager.AddEntityType(type_ObjType);

            /// <summary>
            /// Application实体对象类型
            /// </summary>
            DynEntityType type_Application = new DynEntityType("Application");
            type_Application.Namespace = "Rock.Core.Entities";
            type_Application.Attributes.Add(new CommentDynAttribute("应用程序"));
            type_Application.Attributes.Add(new MappingNameDynAttribute("Application"));

            DynPropertyConfiguration property_Application_ApplicationID = new DynPropertyConfiguration("ApplicationID");
            property_Application_ApplicationID.EntityType = type_Application;
            property_Application_ApplicationID.PropertyType = typeof(int).ToString();
            property_Application_ApplicationID.Attributes.Add(new PrimaryKeyDynAttribute());

            DynPropertyConfiguration property_Application_ApplicationName = new DynPropertyConfiguration("ApplicationName");
            property_Application_ApplicationName.EntityType = type_Application;
            property_Application_ApplicationName.PropertyType = typeof(string).ToString();
            property_Application_ApplicationName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));
            property_Application_ApplicationName.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_Application_Description = new DynPropertyConfiguration("Description");
            property_Application_Description.EntityType = type_Application;
            property_Application_Description.PropertyType = typeof(string).ToString();
            property_Application_Description.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            type_Application.AddProperty(property_Application_ApplicationID);
            type_Application.AddProperty(property_Application_ApplicationName);
            type_Application.AddProperty(property_Application_Description);

            DynEntityTypeManager.AddEntityType(type_Application);

            /// <summary>
            /// ApplicationModule实体对象类型
            /// </summary>
            DynEntityType type_ApplicationModule = new DynEntityType("ApplicationModule");
            type_ApplicationModule.Namespace = "Rock.Core.Entities";
            type_ApplicationModule.Attributes.Add(new CommentDynAttribute("应用程序"));
            type_ApplicationModule.Attributes.Add(new MappingNameDynAttribute("ApplicationModule"));

            DynPropertyConfiguration property_ApplicationModule_ApplicationID = new DynPropertyConfiguration("ApplicationID");
            property_ApplicationModule_ApplicationID.EntityType = type_ApplicationModule;
            property_ApplicationModule_ApplicationID.PropertyType = typeof(int).ToString();
            property_ApplicationModule_ApplicationID.Attributes.Add(new PrimaryKeyDynAttribute());
            property_ApplicationModule_ApplicationID.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_ApplicationModule_ModuleID = new DynPropertyConfiguration("ModuleID");
            property_ApplicationModule_ModuleID.EntityType = type_ApplicationModule;
            property_ApplicationModule_ModuleID.PropertyType = typeof(int).ToString();
            property_ApplicationModule_ModuleID.Attributes.Add(new PrimaryKeyDynAttribute());
            property_ApplicationModule_ModuleID.Attributes.Add(new NotNullDynAttribute());

            type_ApplicationModule.AddProperty(property_ApplicationModule_ApplicationID);
            type_ApplicationModule.AddProperty(property_ApplicationModule_ModuleID);

            DynEntityTypeManager.AddEntityType(type_ApplicationModule);

            /// <summary>
            /// Module实体对象类型
            /// </summary>
            DynEntityType type_Module = new DynEntityType("Module");
            type_Module.Namespace = "Rock.Core.Entities";
            type_Module.Attributes.Add(new CommentDynAttribute("应用程序"));
            type_Module.Attributes.Add(new MappingNameDynAttribute("Module"));

            DynPropertyConfiguration property_Module_ModuleID = new DynPropertyConfiguration("ModuleID");
            property_Module_ModuleID.EntityType = type_Module;
            property_Module_ModuleID.PropertyType = typeof(int).ToString();
            property_Module_ModuleID.Attributes.Add(new PrimaryKeyDynAttribute());
            property_Module_ModuleID.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_Module_ModuleName = new DynPropertyConfiguration("ModuleName");
            property_Module_ModuleName.EntityType = type_Module;
            property_Module_ModuleName.PropertyType = typeof(string).ToString();
            property_Module_ModuleName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));
            property_Module_ModuleName.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_Module_Description = new DynPropertyConfiguration("Description");
            property_Module_Description.EntityType = type_Module;
            property_Module_Description.PropertyType = typeof(string).ToString();
            property_Module_Description.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            type_Module.AddProperty(property_Module_ModuleID);
            type_Module.AddProperty(property_Module_ModuleName);
            type_Module.AddProperty(property_Module_Description);

            DynEntityTypeManager.AddEntityType(type_Module);

            /// <summary>
            /// Namespace实体对象类型
            /// </summary>
            DynEntityType type_Namespace = new DynEntityType("Namespace");
            type_Namespace.Namespace = "Rock.Core.Entities";
            type_Namespace.Attributes.Add(new CommentDynAttribute("命名空间"));
            type_Namespace.Attributes.Add(new MappingNameDynAttribute("Namespace"));

            DynPropertyConfiguration property_Namespace_NamespaceID = new DynPropertyConfiguration("NamespaceID");
            property_Namespace_NamespaceID.EntityType = type_Namespace;
            property_Namespace_NamespaceID.PropertyType = typeof(int).ToString();
            property_Namespace_NamespaceID.Attributes.Add(new PrimaryKeyDynAttribute());
            property_Namespace_NamespaceID.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_Namespace_NamespaceName = new DynPropertyConfiguration("NamespaceName");
            property_Namespace_NamespaceName.EntityType = type_Namespace;
            property_Namespace_NamespaceName.PropertyType = typeof(string).ToString();
            property_Namespace_NamespaceName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(30)"));
            property_Namespace_NamespaceName.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_Namespace_Description = new DynPropertyConfiguration("Description");
            property_Namespace_Description.EntityType = type_Namespace;
            property_Namespace_Description.PropertyType = typeof(string).ToString();
            property_Namespace_Description.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            type_Namespace.AddProperty(property_Namespace_NamespaceID);
            type_Namespace.AddProperty(property_Namespace_NamespaceName);
            type_Namespace.AddProperty(property_Namespace_Description);

            DynEntityTypeManager.AddEntityType(type_Namespace);

            /// <summary>
            /// DynClass实体对象类型
            /// </summary>
            DynEntityType type_DynClass = new DynEntityType("DynClass");
            type_DynClass.Namespace = "Rock.Core.Entities";
            type_DynClass.Attributes.Add(new CommentDynAttribute("应用程序"));
            type_DynClass.Attributes.Add(new MappingNameDynAttribute("DynClass"));

            DynPropertyConfiguration property_DynClass_DynClassID = new DynPropertyConfiguration("DynClassID");
            property_DynClass_DynClassID.EntityType = type_DynClass;
            property_DynClass_DynClassID.PropertyType = typeof(int).ToString();
            property_DynClass_DynClassID.Attributes.Add(new PrimaryKeyDynAttribute());
            property_DynClass_DynClassID.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_DynClass_DynClassName = new DynPropertyConfiguration("DynClassName");
            property_DynClass_DynClassName.EntityType = type_DynClass;
            property_DynClass_DynClassName.PropertyType = typeof(string).ToString();
            property_DynClass_DynClassName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));
            property_DynClass_DynClassName.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_DynClass_Attributes = new DynPropertyConfiguration("Attributes");
            property_DynClass_Attributes.EntityType = type_DynClass;
            property_DynClass_Attributes.PropertyType = typeof(string).ToString();
            property_DynClass_Attributes.Attributes.Add(new SqlTypeDynAttribute("nvarchar(5000)"));
            property_DynClass_Attributes.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_DynClass_BaseClassName = new DynPropertyConfiguration("BaseClassName");
            property_DynClass_BaseClassName.EntityType = type_DynClass;
            property_DynClass_BaseClassName.PropertyType = typeof(string).ToString();
            property_DynClass_BaseClassName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            DynPropertyConfiguration property_DynClass_InterfaceNames = new DynPropertyConfiguration("InterfaceNames");
            property_DynClass_InterfaceNames.EntityType = type_DynClass;
            property_DynClass_InterfaceNames.PropertyType = typeof(string).ToString();
            property_DynClass_InterfaceNames.Attributes.Add(new SqlTypeDynAttribute("nvarchar(500)"));

            DynPropertyConfiguration property_DynClass_ModuleID = new DynPropertyConfiguration("ModuleID");
            property_DynClass_ModuleID.EntityType = type_DynClass;
            property_DynClass_ModuleID.PropertyType = typeof(int).ToString();

            DynPropertyConfiguration property_DynClass_Description = new DynPropertyConfiguration("Description");
            property_DynClass_Description.EntityType = type_DynClass;
            property_DynClass_Description.PropertyType = typeof(string).ToString();
            property_DynClass_Description.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            DynPropertyConfiguration property_DynClass_MainType = new DynPropertyConfiguration("MainType");
            property_DynClass_MainType.EntityType = type_DynClass;
            property_DynClass_MainType.PropertyType = typeof(int).ToString();

            DynPropertyConfiguration property_DynClass_NamespaceID = new DynPropertyConfiguration("NamespaceID");
            property_DynClass_NamespaceID.EntityType = type_DynClass;
            property_DynClass_NamespaceID.PropertyType = typeof(int).ToString();

            DynPropertyConfiguration property_DynClass_DisplayName = new DynPropertyConfiguration("DisplayName");
            property_DynClass_DisplayName.EntityType = type_DynClass;
            property_DynClass_DisplayName.PropertyType = typeof(string).ToString();
            property_DynClass_DisplayName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            type_DynClass.AddProperty(property_DynClass_DynClassID);
            type_DynClass.AddProperty(property_DynClass_DynClassName);
            type_DynClass.AddProperty(property_DynClass_BaseClassName);
            type_DynClass.AddProperty(property_DynClass_InterfaceNames);
            type_DynClass.AddProperty(property_DynClass_ModuleID);
            type_DynClass.AddProperty(property_DynClass_Description);
            type_DynClass.AddProperty(property_DynClass_MainType);
            type_DynClass.AddProperty(property_DynClass_NamespaceID);
            type_DynClass.AddProperty(property_DynClass_Attributes);
            //type_DynClass.AddProperty(property_DynClass_ClassModelType);
            type_DynClass.AddProperty(property_DynClass_DisplayName);

            DynEntityTypeManager.AddEntityType(type_DynClass);

            /// <summary>
            /// DynProperty实体对象类型
            /// </summary>
            DynEntityType type_DynProperty = new DynEntityType("DynProperty");
            type_DynProperty.Namespace = "Rock.Core.Entities";
            type_DynProperty.Attributes.Add(new CommentDynAttribute("应用程序"));
            type_DynProperty.Attributes.Add(new MappingNameDynAttribute("DynProperty"));

            DynPropertyConfiguration property_DynProperty_DynPropertyID = new DynPropertyConfiguration("DynPropertyID");
            property_DynProperty_DynPropertyID.EntityType = type_DynProperty;
            property_DynProperty_DynPropertyID.PropertyType = typeof(int).ToString();
            property_DynProperty_DynPropertyID.Attributes.Add(new PrimaryKeyDynAttribute());
            property_DynProperty_DynPropertyID.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_DynProperty_DynPropertyName = new DynPropertyConfiguration("DynPropertyName");
            property_DynProperty_DynPropertyName.EntityType = type_DynProperty;
            property_DynProperty_DynPropertyName.PropertyType = typeof(string).ToString();
            property_DynProperty_DynPropertyName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));
            property_DynProperty_DynPropertyName.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_DynProperty_Description = new DynPropertyConfiguration("Description");
            property_DynProperty_Description.EntityType = type_DynProperty;
            property_DynProperty_Description.PropertyType = typeof(string).ToString();
            property_DynProperty_Description.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            DynPropertyConfiguration property_DynProperty_DynClassID = new DynPropertyConfiguration("DynClassID");
            property_DynProperty_DynClassID.EntityType = type_DynProperty;
            property_DynProperty_DynClassID.PropertyType = typeof(int).ToString();

            DynPropertyConfiguration property_DynProperty_Type = new DynPropertyConfiguration("Type");
            property_DynProperty_Type.EntityType = type_DynProperty;
            property_DynProperty_Type.PropertyType = typeof(string).ToString();
            property_DynProperty_Type.Attributes.Add(new SqlTypeDynAttribute("nvarchar(50)"));

            DynPropertyConfiguration property_DynProperty_IsArray = new DynPropertyConfiguration("IsArray");
            property_DynProperty_IsArray.EntityType = type_DynProperty;
            property_DynProperty_IsArray.PropertyType = typeof(bool).ToString();

            DynPropertyConfiguration property_DynProperty_IsInherited = new DynPropertyConfiguration("IsInherited");
            property_DynProperty_IsInherited.EntityType = type_DynProperty;
            property_DynProperty_IsInherited.PropertyType = typeof(bool).ToString();

            DynPropertyConfiguration property_DynProperty_InheritEntityName = new DynPropertyConfiguration("InheritEntityName");
            property_DynProperty_InheritEntityName.EntityType = type_DynProperty;
            property_DynProperty_InheritEntityName.PropertyType = typeof(string).ToString();
            property_DynProperty_InheritEntityName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(50)"));

            DynPropertyConfiguration property_DynProperty_IsQueryProperty = new DynPropertyConfiguration("IsQueryProperty");
            property_DynProperty_IsQueryProperty.EntityType = type_DynProperty;
            property_DynProperty_IsQueryProperty.PropertyType = typeof(bool).ToString();

            DynPropertyConfiguration property_DynProperty_CollectionType = new DynPropertyConfiguration("CollectionType");
            property_DynProperty_CollectionType.EntityType = type_DynProperty;
            property_DynProperty_CollectionType.PropertyType = typeof(string).ToString();
            property_DynProperty_CollectionType.Attributes.Add(new SqlTypeDynAttribute("nvarchar(50)"));

            DynPropertyConfiguration property_DynProperty_StructName = new DynPropertyConfiguration("StructName");
            property_DynProperty_StructName.EntityType = type_DynProperty;
            property_DynProperty_StructName.PropertyType = typeof(string).ToString();
            property_DynProperty_StructName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(50)"));

            DynPropertyConfiguration property_DynProperty_Attributes = new DynPropertyConfiguration("Attributes");
            property_DynProperty_Attributes.EntityType = type_DynProperty;
            property_DynProperty_Attributes.PropertyType = typeof(string).ToString();
            property_DynProperty_Attributes.Attributes.Add(new SqlTypeDynAttribute("nvarchar(5000)"));
            property_DynProperty_Attributes.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_DynProperty_DisplayName = new DynPropertyConfiguration("DisplayName");
            property_DynProperty_DisplayName.EntityType = type_DynProperty;
            property_DynProperty_DisplayName.PropertyType = typeof(string).ToString();
            property_DynProperty_DisplayName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            type_DynProperty.AddProperty(property_DynProperty_DynPropertyID);
            type_DynProperty.AddProperty(property_DynProperty_DynPropertyName);
            type_DynProperty.AddProperty(property_DynProperty_Description);
            type_DynProperty.AddProperty(property_DynProperty_DynClassID);
            type_DynProperty.AddProperty(property_DynProperty_Type);
            type_DynProperty.AddProperty(property_DynProperty_IsArray);
            type_DynProperty.AddProperty(property_DynProperty_IsInherited);
            type_DynProperty.AddProperty(property_DynProperty_InheritEntityName);
            type_DynProperty.AddProperty(property_DynProperty_IsQueryProperty);
            type_DynProperty.AddProperty(property_DynProperty_CollectionType);
            type_DynProperty.AddProperty(property_DynProperty_StructName);
            type_DynProperty.AddProperty(property_DynProperty_Attributes);
            type_DynProperty.AddProperty(property_DynProperty_DisplayName);

            DynEntityTypeManager.AddEntityType(type_DynProperty);

            /// <summary>
            /// DynMethod实体对象类型
            /// </summary>
            DynEntityType type_DynMethod = new DynEntityType("DynMethod");
            type_DynMethod.Namespace = "Rock.Core.Entities";
            type_DynMethod.Attributes.Add(new CommentDynAttribute("应用程序"));
            type_DynMethod.Attributes.Add(new MappingNameDynAttribute("DynMethod"));

            DynPropertyConfiguration property_DynMethod_DynMethodID = new DynPropertyConfiguration("DynMethodID");
            property_DynMethod_DynMethodID.EntityType = type_DynMethod;
            property_DynMethod_DynMethodID.PropertyType = typeof(int).ToString();
            property_DynMethod_DynMethodID.Attributes.Add(new PrimaryKeyDynAttribute());
            property_DynMethod_DynMethodID.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_DynMethod_DynMethodName = new DynPropertyConfiguration("DynMethodName");
            property_DynMethod_DynMethodName.EntityType = type_DynMethod;
            property_DynMethod_DynMethodName.PropertyType = typeof(string).ToString();
            property_DynMethod_DynMethodName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));
            property_DynMethod_DynMethodName.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_DynMethod_Description = new DynPropertyConfiguration("Description");
            property_DynMethod_Description.EntityType = type_DynMethod;
            property_DynMethod_Description.PropertyType = typeof(string).ToString();
            property_DynMethod_Description.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            DynPropertyConfiguration property_DynMethod_DynClassID = new DynPropertyConfiguration("DynClassID");
            property_DynMethod_DynClassID.EntityType = type_DynMethod;
            property_DynMethod_DynClassID.PropertyType = typeof(int).ToString();

            DynPropertyConfiguration property_DynMethod_Definition = new DynPropertyConfiguration("Definition");
            property_DynMethod_Definition.EntityType = type_DynMethod;
            property_DynMethod_Definition.PropertyType = typeof(string).ToString();
            property_DynMethod_Definition.Attributes.Add(new SqlTypeDynAttribute("nvarchar(8000)"));

            DynPropertyConfiguration property_DynMethod_Body = new DynPropertyConfiguration("Body");
            property_DynMethod_Body.EntityType = type_DynMethod;
            property_DynMethod_Body.PropertyType = typeof(string).ToString();
            property_DynMethod_Body.Attributes.Add(new SqlTypeDynAttribute("nvarchar(8000)"));

            DynPropertyConfiguration property_DynMethod_Attributes = new DynPropertyConfiguration("Attributes");
            property_DynMethod_Attributes.EntityType = type_DynMethod;
            property_DynMethod_Attributes.PropertyType = typeof(string).ToString();
            property_DynMethod_Attributes.Attributes.Add(new SqlTypeDynAttribute("nvarchar(5000)"));
            property_DynMethod_Attributes.Attributes.Add(new NotNullDynAttribute());

            DynPropertyConfiguration property_DynMethod_ScriptType = new DynPropertyConfiguration("ScriptType");
            property_DynMethod_ScriptType.EntityType = type_DynMethod;
            property_DynMethod_ScriptType.PropertyType = typeof(string).ToString();
            property_DynMethod_ScriptType.Attributes.Add(new SqlTypeDynAttribute("nvarchar(50)"));

            DynPropertyConfiguration property_DynMethod_IsAsync = new DynPropertyConfiguration("IsAsync");
            property_DynMethod_IsAsync.EntityType = type_DynMethod;
            property_DynMethod_IsAsync.PropertyType = typeof(bool).ToString();

            DynPropertyConfiguration property_DynMethod_DisplayName = new DynPropertyConfiguration("DisplayName");
            property_DynMethod_DisplayName.EntityType = type_DynMethod;
            property_DynMethod_DisplayName.PropertyType = typeof(string).ToString();
            property_DynMethod_DisplayName.Attributes.Add(new SqlTypeDynAttribute("nvarchar(200)"));

            DynPropertyConfiguration property_DynMethod_SourceMethodID = new DynPropertyConfiguration("SourceMethodID");
            property_DynMethod_SourceMethodID.EntityType = type_DynMethod;
            property_DynMethod_SourceMethodID.PropertyType = typeof(int).ToString();

            type_DynMethod.AddProperty(property_DynMethod_DynMethodID);
            type_DynMethod.AddProperty(property_DynMethod_DynMethodName);
            type_DynMethod.AddProperty(property_DynMethod_Description);
            type_DynMethod.AddProperty(property_DynMethod_DynClassID);
            type_DynMethod.AddProperty(property_DynMethod_Definition);
            type_DynMethod.AddProperty(property_DynMethod_Body);
            type_DynMethod.AddProperty(property_DynMethod_Attributes);
            type_DynMethod.AddProperty(property_DynMethod_ScriptType);
            type_DynMethod.AddProperty(property_DynMethod_IsAsync);
            type_DynMethod.AddProperty(property_DynMethod_DisplayName);
            type_DynMethod.AddProperty(property_DynMethod_SourceMethodID);

            DynEntityTypeManager.AddEntityType(type_DynMethod);

            //将DynEntityTypeManager中的DynentityType 转换成 EntityConfiguration 存放到 MetaDataManager中的Entities集合中用于持久化
            DynEntityTypeMetaDataCoordinator.EntityTypes2EntityConfiguration();
            #endregion  注册系统核心持久化实体对象类型

            #region 注册系统通用辅助类型
            /// <summary>
            /// DataRow动态对象类型
            /// </summary>
            DynClass dcDataRow = new DynClass("DataRow");
            DynProperty dpDataRowValues = new DynProperty(0, "Values", CollectionType.List, DynType.String, null);

            dcDataRow.AddProperty(dpDataRowValues);

            DynTypeManager.RegistClass(dcDataRow);

            /// <summary>
            /// DataColumn动态对象类型
            /// </summary>
            DynClass dcDataColumn = new DynClass("DataColumn");
            DynProperty dpDataColumnName = new DynProperty(0, "Name", DynType.String);
            DynProperty dpDataColumnType = new DynProperty(1, "Type", DynType.String);

            dcDataColumn.AddProperty(dpDataColumnName);
            dcDataColumn.AddProperty(dpDataColumnType);

            DynTypeManager.RegistClass(dcDataColumn);

            /// <summary>
            /// DataTable动态对象类型
            /// </summary>
            DynClass dcDataTable = new DynClass("DataTable");
            DynProperty dpDataTableRows = new DynProperty(0, "Rows", CollectionType.List, DynType.Struct, "DataRow");
            DynProperty dpDataTableColumns = new DynProperty(1, "Columns", CollectionType.List, DynType.Struct, "DataColumn");

            dcDataTable.AddProperty(dpDataTableRows);
            dcDataTable.AddProperty(dpDataTableColumns);

            DynTypeManager.RegistClass(dcDataTable);

            /// <summary>
            /// DataSet动态对象类型
            /// </summary>
            DynClass dcDataSet = new DynClass("DataSet");
            DynProperty dpDataSetTables = new DynProperty(0, "Tables", CollectionType.List, DynType.Struct, "DataTable");

            dcDataSet.AddProperty(dpDataSetTables);

            DynTypeManager.RegistClass(dcDataSet);

            #endregion 注册系统通用辅助类型

            #region 注册DynClass的Attribute类型此Attribute继承自DynClass没有添加自己的任何特征,本质上相等,只是进行概念上的一个区分
            DynTypeManager.RegistClass(new DynAttribute("PrimaryKey", null, null));
            DynTypeManager.RegistClass(new DynAttribute("NotNull", null, null));
            DynTypeManager.RegistClass(new DynAttribute("Persistable", null, null));
            DynTypeManager.RegistClass(new DynAttribute("PersistIgnore", null, null));
            DynTypeManager.RegistClass(new DynAttribute("Relation", null, null));
            DynTypeManager.RegistClass(new DynAttribute("FkReverseQuery", null, null));


            //SqlType
            DynAttribute dynSqlTypeAttribute = new DynAttribute("SqlType", null, null);
            DynProperty dpType = new DynProperty(0, "Type", DynType.String);
            dynSqlTypeAttribute.AddProperty(dpType);
            DynTypeManager.RegistClass(dynSqlTypeAttribute);

            //Comment
            DynAttribute dynCommentAttribute = new DynAttribute("Comment", null, null);
            DynProperty dpContent = new DynProperty(0, "Content", DynType.String);
            dynCommentAttribute.AddProperty(dpContent);
            DynTypeManager.RegistClass(dynCommentAttribute);

            //MappingName
            DynAttribute dynMappingNameAttribute = new DynAttribute("MappingName", null, null);
            DynProperty dpMappingName = new DynProperty(0, "Name", DynType.String);
            dynMappingNameAttribute.AddProperty(dpMappingName);
            DynTypeManager.RegistClass(dynMappingNameAttribute);

            //FriendKey
            DynAttribute dynFriendKeyAttribute = new DynAttribute("FriendKey", null, null);
            DynProperty dpRelatedEntityType = new DynProperty(0, "RelatedEntityType", DynType.String);
            dynFriendKeyAttribute.AddProperty(dpRelatedEntityType);
            DynTypeManager.RegistClass(dynFriendKeyAttribute);

            //FkQuery
            DynAttribute dynFkQueryAttribute = new DynAttribute("FkQuery", null, null);
            DynProperty dpFkQuery = new DynProperty(0, "RelatedManyToOneQueryPropertyName", DynType.String);
            dynFkQueryAttribute.AddProperty(dpFkQuery);
            DynTypeManager.RegistClass(dynFkQueryAttribute);

            //RelationKey
            DynAttribute dynRelationKeyAttribute = new DynAttribute("RelationKey", null, null);
            DynProperty dpRelatedType = new DynProperty(0, "RelatedType", DynType.String);
            dynRelationKeyAttribute.AddProperty(dpRelatedType);
            DynTypeManager.RegistClass(dynRelationKeyAttribute);

            //ServiceContract
            DynAttribute dynServiceContractAttribute = new DynAttribute("ServiceContract", null, null);
            DynProperty dpServiceContractName = new DynProperty(0, "Name", DynType.String);
            dynServiceContractAttribute.AddProperty(dpServiceContractName);
            DynTypeManager.RegistClass(dynServiceContractAttribute);

            //OperationContract
            DynAttribute dynOperationContractAttribute = new DynAttribute("OperationContract", null, null);
            DynProperty dpOperationContractName = new DynProperty(0, "Name", DynType.String);
            dynOperationContractAttribute.AddProperty(dpOperationContractName);
            DynTypeManager.RegistClass(dynOperationContractAttribute);

            //DesignInfo
            DynAttribute dynDesignInfoAttribute = new DynAttribute("DesignInfo", null, null);

            //验证类型
            DynProperty dpValidateType = new DynProperty(0, "ValidateType", DynType.String);
            dynDesignInfoAttribute.AddProperty(dpValidateType);
            //控件名称
            DynProperty dpInputType = new DynProperty(1, "InputType", DynType.String);
            dynDesignInfoAttribute.AddProperty(dpInputType);
            //列表标题
            DynProperty dpGridHeader = new DynProperty(2, "GridHeader", DynType.String);
            dynDesignInfoAttribute.AddProperty(dpGridHeader);
            //列表宽度
            DynProperty dpGridWidth = new DynProperty(3, "GridWidth", DynType.I32);
            dynDesignInfoAttribute.AddProperty(dpGridWidth);
            //列表对齐方式
            DynProperty dpGridColAlign = new DynProperty(4, "GridColAlign", DynType.String);
            dynDesignInfoAttribute.AddProperty(dpGridColAlign);
            //列表排序方式
            DynProperty dpGridColSorting = new DynProperty(5, "GridColSorting", DynType.String);
            dynDesignInfoAttribute.AddProperty(dpGridColSorting);
            //列表列类型
            DynProperty dpGridColType = new DynProperty(6, "GridColType", DynType.String);
            dynDesignInfoAttribute.AddProperty(dpGridColType);
            //是否必须输入项
            DynProperty dpIsRequired = new DynProperty(7, "IsRequired", DynType.Bool);
            dynDesignInfoAttribute.AddProperty(dpIsRequired);
            //是否只读项
            DynProperty dpIsReadOnly = new DynProperty(8, "IsReadOnly", DynType.Bool);
            dynDesignInfoAttribute.AddProperty(dpIsReadOnly);
            //通用参照类型
            DynProperty dpReferType = new DynProperty(9, "ReferType", DynType.String);
            dynDesignInfoAttribute.AddProperty(dpReferType);
            //是否模糊查询
            DynProperty dpQueryForm = new DynProperty(10, "QueryForm", DynType.String);
            dynDesignInfoAttribute.AddProperty(dpQueryForm);

            DynTypeManager.RegistClass(dynDesignInfoAttribute);

            #endregion 注册Attribute类型

            #region 注册SystemService 服务契约

            //SystemService 服务
            DynInterface systemServiceInterface = new DynInterface("ISystemService");
            systemServiceInterface.Namespace = "Zork.Service.Common";
            DynTypeManager.RegistInterface(systemServiceInterface);

            List<string> systemsServiceInterfaceNames = new List<string>() { "ISystemService" };
            DynClass systemService = new DynClass("SystemService", systemsServiceInterfaceNames);
            DynTypeManager.RegistClass(systemService);

            //GetNextID
            DynMethod getNextIDMethod = new DynMethod("GetNextID");
            systemServiceInterface.AddMethod(getNextIDMethod);
            systemService.AddMethod(getNextIDMethod);
            getNextIDMethod.ScriptType = ScriptType.DLL;

            DynParameter paraTypeName = new DynParameter(0, "typeName", DynType.String);
            getNextIDMethod.AddParameter(paraTypeName);
            getNextIDMethod.Result.DynType = DynType.I32;

            //UpdateUserState
            DynMethod updateUserStateMethod = new DynMethod("UpdateUserState");
            systemServiceInterface.AddMethod(updateUserStateMethod);
            systemService.AddMethod(updateUserStateMethod);
            updateUserStateMethod.ScriptType = ScriptType.DLL;

            DynParameter paraUserID = new DynParameter(0, "userID", DynType.I32);
            updateUserStateMethod.AddParameter(paraUserID);

            DynParameter paraState = new DynParameter(1, "state", DynType.String);
            updateUserStateMethod.AddParameter(paraState);
            updateUserStateMethod.Result.DynType = DynType.Void;
            //CheckUserLoginLog
            DynMethod checkUserLoginLogMethod = new DynMethod("CheckUserLoginLog");
            systemServiceInterface.AddMethod(checkUserLoginLogMethod);
            systemService.AddMethod(checkUserLoginLogMethod);
            checkUserLoginLogMethod.ScriptType = ScriptType.DLL;
            //GetBillNO
            DynMethod getBillNOMethod = new DynMethod("GetBillNO");
            systemServiceInterface.AddMethod(getBillNOMethod);
            systemService.AddMethod(getBillNOMethod);
            getBillNOMethod.ScriptType = ScriptType.DLL;

            DynParameter paraBillType = new DynParameter(0, "billType", DynType.String);
            getBillNOMethod.AddParameter(paraBillType);
            getBillNOMethod.Result.DynType = DynType.String;

            //ExecQuery
            DynMethod execQuery = new DynMethod("ExecQuery");
            systemServiceInterface.AddMethod(execQuery);
            systemService.AddMethod(execQuery);
            execQuery.ScriptType = ScriptType.DLL;

            DynParameter paraSqlString = new DynParameter(0, "sqlString", DynType.String);
            execQuery.AddParameter(paraSqlString);
            execQuery.Result.DynType = DynType.Struct;
            execQuery.Result.StructName = "Object";

            //ExcuteNoneReturnQuery
            DynMethod excuteNoneReturnQuery = new DynMethod("ExcuteNoneReturnQuery");
            systemServiceInterface.AddMethod(excuteNoneReturnQuery);
            systemService.AddMethod(excuteNoneReturnQuery);
            excuteNoneReturnQuery.ScriptType = ScriptType.DLL;

            excuteNoneReturnQuery.AddParameter(new DynParameter(0, "sqlString", DynType.String));
            excuteNoneReturnQuery.Result.DynType = DynType.Void;

            //ExcuteNoneReturnQueryWithTrans
            DynMethod excuteNoneReturnQueryWithTrans = new DynMethod("ExcuteNoneReturnQueryWithTrans");
            systemServiceInterface.AddMethod(excuteNoneReturnQueryWithTrans);
            systemService.AddMethod(excuteNoneReturnQueryWithTrans);
            excuteNoneReturnQueryWithTrans.ScriptType = ScriptType.DLL;

            excuteNoneReturnQueryWithTrans.AddParameter(new DynParameter(0, "sqlString", DynType.String));
            excuteNoneReturnQueryWithTrans.Result.DynType = DynType.Void;

            //ExecuteScalar
            DynMethod executeScalar = new DynMethod("ExecuteScalar");
            systemServiceInterface.AddMethod(executeScalar);
            systemService.AddMethod(executeScalar);
            executeScalar.ScriptType = ScriptType.DLL;

            executeScalar.AddParameter(paraSqlString);
            executeScalar.Result.DynType = DynType.String;

            //GetServerDate
            DynMethod getGetServerDate = new DynMethod("GetServerDate");
            systemServiceInterface.AddMethod(getGetServerDate);
            systemService.AddMethod(getGetServerDate);
            getGetServerDate.ScriptType = ScriptType.DLL;

            getGetServerDate.Result.DynType = DynType.String;

            //GetDiffDateString
            DynMethod getDiffDateString = new DynMethod("GetDiffDateString");
            systemServiceInterface.AddMethod(getDiffDateString);
            systemService.AddMethod(getDiffDateString);
            getDiffDateString.ScriptType = ScriptType.DLL;

            getDiffDateString.AddParameter(new DynParameter(1, "dateDiff", DynType.I32));
            getDiffDateString.Result.DynType = DynType.String;

            //GetServerDateTime
            DynMethod getGetServerDateTime = new DynMethod("GetServerDateTime");
            systemServiceInterface.AddMethod(getGetServerDateTime);
            systemService.AddMethod(getGetServerDateTime);
            getGetServerDateTime.ScriptType = ScriptType.DLL;

            getGetServerDateTime.Result.DynType = DynType.DateTime;

            //AddDynObject
            DynMethod addDynObject = new DynMethod("AddDynObject");
            systemServiceInterface.AddMethod(addDynObject);
            systemService.AddMethod(addDynObject);
            addDynObject.ScriptType = ScriptType.DLL;

            addDynObject.AddParameter(new DynParameter(0, "dynObject", DynType.Struct));
            addDynObject.Result.DynType = DynType.Void;

            //AddDynObjectsByTransaction
            DynMethod addDynObjectsByTransaction = new DynMethod("AddDynObjectsByTransaction");
            systemServiceInterface.AddMethod(addDynObjectsByTransaction);
            systemService.AddMethod(addDynObjectsByTransaction);
            addDynObjectsByTransaction.ScriptType = ScriptType.DLL;

            addDynObjectsByTransaction.AddParameter(new DynParameter(0, "objects", CollectionType.List, DynType.Struct, null));
            addDynObjectsByTransaction.Result.DynType = DynType.Void;

            //ModfyDynObject
            DynMethod modifyDynObject = new DynMethod("ModifyDynObject");
            systemServiceInterface.AddMethod(modifyDynObject);
            systemService.AddMethod(modifyDynObject);
            modifyDynObject.ScriptType = ScriptType.DLL;

            modifyDynObject.AddParameter(new DynParameter(0, "dynObject", DynType.Struct));
            modifyDynObject.Result.DynType = DynType.Void;

            //ModifyDynObjectsByTransaction
            DynMethod modifyDynObjectsByTransaction = new DynMethod("ModifyDynObjectsByTransaction");
            systemServiceInterface.AddMethod(modifyDynObjectsByTransaction);
            systemService.AddMethod(modifyDynObjectsByTransaction);
            modifyDynObjectsByTransaction.ScriptType = ScriptType.DLL;

            modifyDynObjectsByTransaction.AddParameter(new DynParameter(0, "objects", CollectionType.List, DynType.Struct, null));
            modifyDynObjectsByTransaction.Result.DynType = DynType.Void;

            //DeleteDynObjectByID
            DynMethod deleteDynObject = new DynMethod("DeleteDynObjectByID");
            systemServiceInterface.AddMethod(deleteDynObject);
            systemService.AddMethod(deleteDynObject);
            deleteDynObject.ScriptType = ScriptType.DLL;

            deleteDynObject.AddParameter(new DynParameter(0, "structName", DynType.String));
            deleteDynObject.AddParameter(new DynParameter(1, "dynObjectID", DynType.I32));
            deleteDynObject.Result.DynType = DynType.Void;

            //DeleteDynObjectByIDs
            DynMethod deleteObjectByIDs = new DynMethod("DeleteDynObjectByIDs");
            systemServiceInterface.AddMethod(deleteObjectByIDs);
            systemService.AddMethod(deleteObjectByIDs);
            deleteObjectByIDs.ScriptType = ScriptType.DLL;

            deleteObjectByIDs.AddParameter(new DynParameter(0, "structName", DynType.String));
            deleteObjectByIDs.AddParameter(new DynParameter(1, "firstID", DynType.I32));
            deleteObjectByIDs.AddParameter(new DynParameter(2, "secondID", DynType.I32));
            deleteObjectByIDs.Result.DynType = DynType.Void;

            //GetDynObjectByID
            DynMethod getDynObjectByID = new DynMethod("GetDynObjectByID");
            systemServiceInterface.AddMethod(getDynObjectByID);
            systemService.AddMethod(getDynObjectByID);
            getDynObjectByID.ScriptType = ScriptType.DLL;

            getDynObjectByID.AddParameter(new DynParameter(0, "structName", DynType.String));
            getDynObjectByID.AddParameter(new DynParameter(1, "dynObjectID", DynType.I32));
            getDynObjectByID.Result.DynType = DynType.Struct;

            //GetDynObjectByIDs
            DynMethod getDynObjectByIDs = new DynMethod("GetDynObjectByIDs");
            systemServiceInterface.AddMethod(getDynObjectByIDs);
            systemService.AddMethod(getDynObjectByIDs);
            getDynObjectByIDs.ScriptType = ScriptType.DLL;

            getDynObjectByIDs.AddParameter(new DynParameter(0, "structName", DynType.String));
            getDynObjectByIDs.AddParameter(new DynParameter(1, "firstID", DynType.I32));
            getDynObjectByIDs.AddParameter(new DynParameter(2, "secondID", DynType.I32));
            getDynObjectByIDs.Result.DynType = DynType.Struct;


            //GetObjectProperty获取对象的当属性值
            DynMethod getObjectProperty = new DynMethod("GetObjectProperty");
            systemServiceInterface.AddMethod(getObjectProperty);
            systemService.AddMethod(getObjectProperty);
            getObjectProperty.ScriptType = ScriptType.DLL;

            getObjectProperty.AddParameter(new DynParameter(0, "objName", DynType.String));
            getObjectProperty.AddParameter(new DynParameter(1, "property", DynType.String));
            getObjectProperty.AddParameter(new DynParameter(2, "ojbID", DynType.I32));
            getObjectProperty.Result.DynType = DynType.String;

            //DeleteUploadFile
            DynMethod deleteUploadFile = new DynMethod("DeleteUploadFile");
            systemServiceInterface.AddMethod(deleteUploadFile);
            systemService.AddMethod(deleteUploadFile);
            deleteUploadFile.ScriptType = ScriptType.DLL;

            deleteUploadFile.AddParameter(new DynParameter(0, "uploadFileID", DynType.I32));
            deleteUploadFile.Result.DynType = DynType.Void;

            //获取用户角色集合
            DynMethod getUserRoles = new DynMethod("GetUserRoles");
            systemServiceInterface.AddMethod(getUserRoles);
            systemService.AddMethod(getUserRoles);
            getUserRoles.ScriptType = ScriptType.DLL;

            DynParameter paraGetUserRoles = new DynParameter(0, "userID", DynType.I32);
            getUserRoles.AddParameter(paraGetUserRoles);
            getUserRoles.Result.DynType = DynType.Struct;
            getUserRoles.Result.StructName = "Object";

            //获取用户角色所有功能集合
            DynMethod getUserRoleActions = new DynMethod("GetUserRoleActions");
            systemServiceInterface.AddMethod(getUserRoleActions);
            systemService.AddMethod(getUserRoleActions);
            getUserRoleActions.ScriptType = ScriptType.DLL;

            DynParameter paraGetUserRoleActions = new DynParameter(0, "roleID", DynType.I32);
            getUserRoleActions.AddParameter(paraGetUserRoleActions);
            getUserRoleActions.Result.DynType = DynType.Struct;
            getUserRoleActions.Result.StructName = "Object";

            //获取所有菜单集合
            DynMethod getMenus = new DynMethod("GetMenus");
            systemServiceInterface.AddMethod(getMenus);
            systemService.AddMethod(getMenus);
            getMenus.ScriptType = ScriptType.DLL;

            getMenus.Result.DynType = DynType.Struct;
            getMenus.Result.StructName = "Object";

            //启动工作流
            DynMethod startWorkflow = new DynMethod("StartWorkflow");
            systemServiceInterface.AddMethod(startWorkflow);
            systemService.AddMethod(startWorkflow);
            startWorkflow.ScriptType = ScriptType.DLL;

            startWorkflow.AddParameter(new DynParameter(0, "workflowID", DynType.I32));
            startWorkflow.AddParameter(new DynParameter(1, "userID", DynType.I32));
            startWorkflow.AddParameter(new DynParameter(2, "exchangeParamLists", CollectionType.List, DynType.String, ""));
            startWorkflow.Result.DynType = DynType.Void;

            //启动工作流书签
            DynMethod resumeBookmark = new DynMethod("ResumeBookmark");
            systemServiceInterface.AddMethod(resumeBookmark);
            systemService.AddMethod(resumeBookmark);
            resumeBookmark.ScriptType = ScriptType.DLL;

            resumeBookmark.AddParameter(new DynParameter(0, "workflowToDoListID", DynType.I32));
            resumeBookmark.AddParameter(new DynParameter(1, "userID", DynType.I32));
            resumeBookmark.AddParameter(new DynParameter(2, "exchangeParamLists", CollectionType.List, DynType.String, ""));
            resumeBookmark.Result.DynType = DynType.Void;

            //终结工作流
            DynMethod terminateWorkflow = new DynMethod("TerminateWorkflow");
            systemServiceInterface.AddMethod(terminateWorkflow);
            systemService.AddMethod(terminateWorkflow);
            terminateWorkflow.ScriptType = ScriptType.DLL;

            terminateWorkflow.AddParameter(new DynParameter(0, "workflowID", DynType.I32));
            terminateWorkflow.AddParameter(new DynParameter(1, "workflowInstanceID", DynType.I32));
            terminateWorkflow.AddParameter(new DynParameter(2, "userID", DynType.I32));
            terminateWorkflow.AddParameter(new DynParameter(3, "exchangeParamLists", CollectionType.List, DynType.String, ""));
            terminateWorkflow.Result.DynType = DynType.Void;

            ////GetToDoListByUserID
            //DynMethod getToDoListByUserID = new DynMethod("GetToDoListByUserID");
            //systemServiceInterface.AddMethod(getToDoListByUserID);
            //systemService.AddMethod(getToDoListByUserID);
            //getToDoListByUserID.ScriptType = ScriptType.DLL;

            //getToDoListByUserID.AddParameter(new DynParameter(0, "userID", DynType.I32));
            //getToDoListByUserID.AddParameter(new DynParameter(1, "tableName", DynType.String));
            //getToDoListByUserID.Result.DynType = DynType.Struct;
            //getToDoListByUserID.Result.StructName = "Object";

            //ExecuteBaseScalar
            DynMethod executeBaseScalar = new DynMethod("ExecuteBaseScalar");
            systemServiceInterface.AddMethod(executeBaseScalar);
            systemService.AddMethod(executeBaseScalar);
            executeBaseScalar.ScriptType = ScriptType.DLL;

            executeBaseScalar.AddParameter(paraSqlString);
            executeBaseScalar.Result.DynType = DynType.String;

            //ExecBaseQuery
            DynMethod execBaseQuery = new DynMethod("ExecBaseQuery");
            systemServiceInterface.AddMethod(execBaseQuery);
            systemService.AddMethod(execBaseQuery);
            execBaseQuery.ScriptType = ScriptType.DLL;

            // DynParameter paraBaseSqlString = new DynParameter(0, "sqlString", DynType.String);
            execBaseQuery.AddParameter(paraSqlString);
            execBaseQuery.Result.DynType = DynType.Struct;
            execBaseQuery.Result.StructName = "Object";

            #endregion 注册SystemService 服务契约

            #region 注册UIDesignService 服务契约
            DynInterface uIDesignServiceInterface = new DynInterface("IUIDesignService");
            uIDesignServiceInterface.Namespace = "Zork.UIDesign";
            DynTypeManager.RegistInterface(uIDesignServiceInterface);

            List<string> uIDesignServiceInterfaceNames = new List<string>() { "IUIDesignService" };
            DynClass uIDesignService = new DynClass("UIDesignService", uIDesignServiceInterfaceNames);
            DynTypeManager.RegistClass(uIDesignService);
            //字典模型
            //AddDictForm
            DynMethod addDictForm = new DynMethod("AddDictForm");
            uIDesignServiceInterface.AddMethod(addDictForm);
            uIDesignService.AddMethod(addDictForm);
            addDictForm.ScriptType = ScriptType.DLL;

            addDictForm.AddParameter(new DynParameter(0, "dictForm", DynType.Struct));
            addDictForm.Result.DynType = DynType.Void;

            //GetDictFormByID
            DynMethod getDictFormByID = new DynMethod("GetDictFormByID");
            uIDesignServiceInterface.AddMethod(getDictFormByID);
            uIDesignService.AddMethod(getDictFormByID);
            getDictFormByID.ScriptType = ScriptType.DLL;

            getDictFormByID.AddParameter(new DynParameter(0, "dictFormID", DynType.I32));
            getDictFormByID.Result.DynType = DynType.Struct;

            //ModfyDictForm
            DynMethod modifyDictForm = new DynMethod("ModifyDictForm");
            uIDesignServiceInterface.AddMethod(modifyDictForm);
            uIDesignService.AddMethod(modifyDictForm);
            modifyDictForm.ScriptType = ScriptType.DLL;

            modifyDictForm.AddParameter(new DynParameter(0, "dictForm", DynType.Struct));
            modifyDictForm.Result.DynType = DynType.Void;

            ////generateDictFormJsCode
            //DynMethod generateDictFormJsCode = new DynMethod("GenerateDictFormJsCode");
            //uIDesignServiceInterface.AddMethod(generateDictFormJsCode);
            //uIDesignService.AddMethod(generateDictFormJsCode);
            //generateDictFormJsCode.ScriptType = ScriptType.DLL;

            //generateDictFormJsCode.AddParameter(new DynParameter(0, "dictForm", DynType.Struct));
            //generateDictFormJsCode.AddParameter(new DynParameter(1, "templateName", DynType.String));
            //generateDictFormJsCode.Result.DynType = DynType.String;

            //单据列表模型
            //AddBillListForm
            DynMethod addBillListForm = new DynMethod("AddBillListForm");
            uIDesignServiceInterface.AddMethod(addBillListForm);
            uIDesignService.AddMethod(addBillListForm);
            addBillListForm.ScriptType = ScriptType.DLL;

            addBillListForm.AddParameter(new DynParameter(0, "billListForm", DynType.Struct));
            addBillListForm.Result.DynType = DynType.Void;

            //GetBillListFormByID
            DynMethod getBillListFormByID = new DynMethod("GetBillListFormByID");
            uIDesignServiceInterface.AddMethod(getBillListFormByID);
            uIDesignService.AddMethod(getBillListFormByID);
            getBillListFormByID.ScriptType = ScriptType.DLL;

            getBillListFormByID.AddParameter(new DynParameter(1, "billListFormID", DynType.I32));
            getBillListFormByID.Result.DynType = DynType.Struct;

            //ModfyBillListForm
            DynMethod modifyBillListForm = new DynMethod("ModifyBillListForm");
            uIDesignServiceInterface.AddMethod(modifyBillListForm);
            uIDesignService.AddMethod(modifyBillListForm);
            modifyBillListForm.ScriptType = ScriptType.DLL;

            modifyBillListForm.AddParameter(new DynParameter(0, "billListForm", DynType.Struct));
            modifyBillListForm.Result.DynType = DynType.Void;

            ////GenerateBillListFormJsCode
            //DynMethod generateBillListFormJsCode = new DynMethod("GenerateBillListFormJsCode");
            //uIDesignServiceInterface.AddMethod(generateBillListFormJsCode);
            //uIDesignService.AddMethod(generateBillListFormJsCode);
            //generateBillListFormJsCode.ScriptType = ScriptType.DLL;

            //generateBillListFormJsCode.AddParameter(new DynParameter(0, "billListForm", DynType.Struct));
            //generateBillListFormJsCode.AddParameter(new DynParameter(1, "templateName", DynType.String));
            //generateBillListFormJsCode.Result.DynType = DynType.String;

            //单据模型
            //AddBillForm
            DynMethod addBillForm = new DynMethod("AddBillForm");
            uIDesignServiceInterface.AddMethod(addBillForm);
            uIDesignService.AddMethod(addBillForm);
            addBillForm.ScriptType = ScriptType.DLL;

            addBillForm.AddParameter(new DynParameter(0, "billForm", DynType.Struct));
            addBillForm.Result.DynType = DynType.Void;

            //GetBillFormByID
            DynMethod getBillFormByID = new DynMethod("GetBillFormByID");
            uIDesignServiceInterface.AddMethod(getBillFormByID);
            uIDesignService.AddMethod(getBillFormByID);
            getBillFormByID.ScriptType = ScriptType.DLL;

            getBillFormByID.AddParameter(new DynParameter(1, "billFormID", DynType.I32));
            getBillFormByID.Result.DynType = DynType.Struct;

            //ModfyBillForm
            DynMethod modifyBillForm = new DynMethod("ModifyBillForm");
            uIDesignServiceInterface.AddMethod(modifyBillForm);
            uIDesignService.AddMethod(modifyBillForm);
            modifyBillForm.ScriptType = ScriptType.DLL;

            modifyBillForm.AddParameter(new DynParameter(0, "billForm", DynType.Struct));
            modifyBillForm.Result.DynType = DynType.Void;

            ////GenerateBillFormJsCode
            //DynMethod generateBillFormJsCode = new DynMethod("GenerateBillFormJsCode");
            //uIDesignServiceInterface.AddMethod(generateBillFormJsCode);
            //uIDesignService.AddMethod(generateBillFormJsCode);
            //generateBillFormJsCode.ScriptType = ScriptType.DLL;

            //generateBillFormJsCode.AddParameter(new DynParameter(0, "billForm", DynType.Struct));
            //generateBillFormJsCode.AddParameter(new DynParameter(1, "templateName", DynType.String));
            //generateBillFormJsCode.Result.DynType = DynType.String;

            //树模型
            //AddTreeForm
            DynMethod addTreeForm = new DynMethod("AddTreeForm");
            uIDesignServiceInterface.AddMethod(addTreeForm);
            uIDesignService.AddMethod(addTreeForm);
            addTreeForm.ScriptType = ScriptType.DLL;

            addTreeForm.AddParameter(new DynParameter(0, "treeForm", DynType.Struct));
            addTreeForm.Result.DynType = DynType.Void;

            //GetTreeFormByID
            DynMethod getTreeFormByID = new DynMethod("GetTreeFormByID");
            uIDesignServiceInterface.AddMethod(getTreeFormByID);
            uIDesignService.AddMethod(getTreeFormByID);
            getTreeFormByID.ScriptType = ScriptType.DLL;

            getTreeFormByID.AddParameter(new DynParameter(1, "treeFormID", DynType.I32));
            getTreeFormByID.Result.DynType = DynType.Struct;

            //ModfyTreeForm
            DynMethod modifyTreeForm = new DynMethod("ModifyTreeForm");
            uIDesignServiceInterface.AddMethod(modifyTreeForm);
            uIDesignService.AddMethod(modifyTreeForm);
            modifyTreeForm.ScriptType = ScriptType.DLL;

            modifyTreeForm.AddParameter(new DynParameter(0, "treeForm", DynType.Struct));
            modifyTreeForm.Result.DynType = DynType.Void;

            ////GenerateTreeFormJsCode
            //DynMethod generateTreeFormJsCode = new DynMethod("GenerateTreeFormJsCode");
            //uIDesignServiceInterface.AddMethod(generateTreeFormJsCode);
            //uIDesignService.AddMethod(generateTreeFormJsCode);
            //generateTreeFormJsCode.ScriptType = ScriptType.DLL;

            //generateTreeFormJsCode.AddParameter(new DynParameter(0, "treeForm", DynType.Struct));
            //generateTreeFormJsCode.AddParameter(new DynParameter(1, "templateName", DynType.String));
            //generateTreeFormJsCode.Result.DynType = DynType.String;

            //关联实体模型
            //AddRelationForm
            DynMethod addRelationForm = new DynMethod("AddRelationForm");
            uIDesignServiceInterface.AddMethod(addRelationForm);
            uIDesignService.AddMethod(addRelationForm);
            addRelationForm.ScriptType = ScriptType.DLL;

            addRelationForm.AddParameter(new DynParameter(0, "relationForm", DynType.Struct));
            addRelationForm.Result.DynType = DynType.Void;

            //GetRelationFormByID
            DynMethod getRelationFormByID = new DynMethod("GetRelationFormByID");
            uIDesignServiceInterface.AddMethod(getRelationFormByID);
            uIDesignService.AddMethod(getRelationFormByID);
            getRelationFormByID.ScriptType = ScriptType.DLL;

            getRelationFormByID.AddParameter(new DynParameter(1, "relationFormID", DynType.I32));
            getRelationFormByID.Result.DynType = DynType.Struct;

            //ModfyRelationForm
            DynMethod modifyRelationForm = new DynMethod("ModifyRelationForm");
            uIDesignServiceInterface.AddMethod(modifyRelationForm);
            uIDesignService.AddMethod(modifyRelationForm);
            modifyRelationForm.ScriptType = ScriptType.DLL;

            modifyRelationForm.AddParameter(new DynParameter(0, "relationForm", DynType.Struct));
            modifyRelationForm.Result.DynType = DynType.Void;

            //GenerateJsCode
            DynMethod generateJsCode = new DynMethod("GenerateJsCode");
            uIDesignServiceInterface.AddMethod(generateJsCode);
            uIDesignService.AddMethod(generateJsCode);
            generateJsCode.ScriptType = ScriptType.DLL;

            generateJsCode.AddParameter(new DynParameter(0, "fromModel", DynType.Struct));
            generateJsCode.AddParameter(new DynParameter(1, "templateType", DynType.String));
            generateJsCode.AddParameter(new DynParameter(2, "templateName", DynType.String));
            generateJsCode.Result.DynType = DynType.String;

            #endregion 注册UIDesignService 服务契约


        }

        /// <summary>
        /// 加载应用程序运行时基础体系
        /// </summary>
        /// <param name="appID"></param>
        public void LoadAppInfrastructure()
        {
            // _serviceIsRunning = false;

            if (_isLoaded)
                throw new ApplicationException("应用系统已经载入，不能再次加载！");

            //加载应用程序设计运行时基础体系
            LoadDesignAppRunTimeInfrastructure();

            //反射加载动态服务方法
            LoadReflectDynMethod();

            //反射加载静态实体类
            LoadStaticEntities();
            //反射加载静态服务方法
            LoadStaticReflectMethod();
            // 设置方法执行委托
            DynTypeManager.MethodHandler = this.MethodHandler;

            // 加载关联关系表(在查询属性的DynClass中的RelationDynClassDict和RelationDynPropertyDict字典中添加key是自己对象类型名称,value分别是自己的对象类型(DynClass)和自己对象类型对应的查询属性)
            //比如StockInDetail有一个查询属性Material 就是在Material Dynclass的RelationDynClassDict和RelationDynPropertyDict字典中添加key是StockInDetail,value分别是StockInDetail的Dynclass和StockInDetail的属性Material的DynProperty
            DynTypeManager.MakeRelation();

            //TODO:这里主要是对关联关系进行验证,目前不需要,等需要时,再开启并根据实际需要调整其验证内容
            //DynObject.ReferValidateHandle += new DynObject.ReferValidateDelegate(ReferValidate);

            // 加载Js库
            jsScriptLoader.GenJsScript();
            // 设置加载完成状态
            _isLoaded = true;
        }

        public void Reload()
        {
            //清空动态对象
            DynTypeManager.Clear();

            //清空动态实体
            MetaDataManager.Entities.Clear();
            DynEntityTypeManager.Entities.Clear();

            classObjDict.Clear();
            namespaceObjDict.Clear();
            propertyObjDict.Clear();
            methodObjDict.Clear();

            moduleEntityDict.Clear();
            classEntityDict.Clear();
            namespaceEntityDict.Clear();
            propertyEntityDict.Clear();
            methodEntityDict.Clear();

            classIDDynClassMap.Clear();
            classIDDynInterfaceMap.Clear();
            classIDPropertyObjsMap.Clear();

            dynPropertyObjIDDynPropertyMap.Clear();
            DynStringResolver.MethodDict.Clear();
            DynEntityTypeManager.ClearEntityTypes();

            //设置加载完成状态
            _isLoaded = false;

            //重新加载
            LoadAppInfrastructure();

        }

        /// <summary>
        /// 加载应用程序设计运行时基础体系
        /// </summary>
        public void LoadDesignAppRunTimeInfrastructure()
        {
            #region 加载数据库中应用程序的业务对象设计体系
            DynEntity appEntiey = null; ;
            try
            {
                appEntiey = GatewayFactory.Default.Find("Application", _appID);
            }
            catch (Exception ex)
            {
                throw new ApplicationException(ex.Message);
            }

            if (appEntiey == null)
                throw new ApplicationException("不存在该ID的应用程序");

            _appName = (string)appEntiey["ApplicationName"];

            DynEntity[] appModules = GatewayFactory.Default.FindArray("ApplicationModule", _.P("ApplicationModule", "ApplicationID") == _appID);

            if (appModules.Length == 0)
                return;

            //该应用程序下的所有模块的ID数组
            object[] moduleIDs = new object[appModules.Length];
            //根据应用程序和模块的关联找出应用程序下的所有模块
            for (int i = 0; i < appModules.Length; i++)
            {
                int moduleID = (int)appModules[i]["ModuleID"];
                moduleEntityDict.Add(moduleID, appModules[i]);
                moduleIDs[i] = moduleID;
            }

            //获取所有的模块下的DynClass表中的classEntities
            DynEntity[] classEntities = GatewayFactory.Default.FindArray("DynClass", _.P("DynClass", "ModuleID").In(moduleIDs));
            //该应用程序下的所有模块下的所有DynClass的ID数组
            object[] classIDs = new object[classEntities.Length];
            //所有命名空间的ID列表
            List<object> namespaceIDs = new List<object>();
            for (int i = 0; i < classEntities.Length; i++)
            {
                DynEntity classEntity = classEntities[i];
                if (!classEntityDict.ContainsKey((int)classEntity["DynClassID"]))
                {
                    classEntityDict.Add((int)classEntity["DynClassID"], classEntity);
                }

                classIDs[i] = classEntity["DynClassID"];
                if (!namespaceIDs.Contains(classEntity["NamespaceID"]))
                {
                    namespaceIDs.Add(classEntity["NamespaceID"]);
                }
            }

            //获取相应的namespaceEntity集合
            DynEntity[] namespaceEntities = GatewayFactory.Default.FindArray("Namespace", _.P("Namespace", "NamespaceID").In(namespaceIDs.ToArray()));
            foreach (DynEntity namespaceEntity in namespaceEntities)
            {
                namespaceEntityDict.Add((int)namespaceEntity["NamespaceID"], namespaceEntity);
            }

            //根据classEntities获取相应的propertyEntity集合
            DynEntity[] propertyEntities = GatewayFactory.Default.FindArray("DynProperty", _.P("DynProperty", "DynClassID").In(classIDs));
            foreach (DynEntity propertyEntity in propertyEntities)
            {
                int propertyID = (int)(propertyEntity["DynPropertyID"]);
                if (!propertyEntityDict.ContainsKey(propertyID))
                {
                    propertyEntityDict.Add(propertyID, propertyEntity);
                }
            }

            //根据classEntities获取相应的methodEntity
            DynEntity[] methodEntities = GatewayFactory.Default.FindArray("DynMethod", _.P("DynMethod", "DynClassID").In(classIDs));
            foreach (DynEntity methodEntity in methodEntities)
            {
                int methodID = (int)methodEntity["DynMethodID"];
                if (!methodEntityDict.ContainsKey(methodID))
                {
                    methodEntityDict.Add(methodID, methodEntity);
                }
            }

            #endregion 加载数据库中应用程序的业务对象设计体系

            #region 将从数据库中加载的基本DynEntities转换成DynObjects集合

            //将ClassEnetity转换成DynObjClass并加入_classObjList
            foreach (DynEntity classEntity in classEntityDict.Values)
            {
                DynObject classObj = new DynObject("Class");
                classObj["ClassID"] = classEntity["DynClassID"];
                classObj["ClassName"] = classEntity["DynClassName"];
                classObj["BaseClassName"] = classEntity["BaseClassName"];
                classObj["MainType"] = classEntity["MainType"];
                classObj["InterfaceNames"] = classEntity["InterfaceNames"];
                classObj["Description"] = classEntity["Description"];
                classObj["NamespaceID"] = classEntity["NamespaceID"];
                classObj["ModuleID"] = classEntity["ModuleID"];
                classObj["Attributes"] = classEntity["Attributes"];
                classObj["DisplayName"] = classEntity["DisplayName"];

                classObjDict.Add((int)classObj["ClassID"], classObj);
            }

            //将NamespaceEnetity转换成NamespaceObj并加入_namespaceObjList
            foreach (DynEntity namespaceEntity in namespaceEntityDict.Values)
            {
                int namespaceID = (int)(namespaceEntity["NamespaceID"]);
                DynObject namespaceObj = new DynObject("Namespace");
                namespaceObj["NamespaceID"] = namespaceEntity["NamespaceID"];
                namespaceObj["NamespaceName"] = namespaceEntity["NamespaceName"];
                namespaceObj["Description"] = namespaceEntity["Description"];

                namespaceObjDict.Add(namespaceID, namespaceObj);
            }

            //将PropertyEnetity转换成PropertyObj并加入_dynPropertiesList
            foreach (DynEntity propertyEntity in propertyEntityDict.Values)
            {
                int propertyID = (int)(propertyEntity["DynPropertyID"]);
                int dynClassID = (int)propertyEntity["DynClassID"];
                DynObject PropertyObj = new DynObject("Property");
                PropertyObj["PropertyID"] = propertyEntity["DynPropertyID"];
                PropertyObj["PropertyName"] = propertyEntity["DynPropertyName"];
                PropertyObj["Type"] = propertyEntity["Type"];
                PropertyObj["Type"] = propertyEntity["Type"];
                PropertyObj["IsArray"] = propertyEntity["IsArray"];
                PropertyObj["IsInherited"] = propertyEntity["IsInherited"];
                PropertyObj["InheritEntityName"] = propertyEntity["InheritEntityName"];
                PropertyObj["IsQueryProperty"] = propertyEntity["IsQueryProperty"];
                PropertyObj["CollectionType"] = propertyEntity["CollectionType"];
                PropertyObj["StructName"] = propertyEntity["StructName"];
                PropertyObj["Description"] = propertyEntity["Description"];
                PropertyObj["ClassID"] = dynClassID;
                PropertyObj["Attributes"] = propertyEntity["Attributes"];
                PropertyObj["DisplayName"] = propertyEntity["DisplayName"];
                propertyObjDict.Add(propertyID, PropertyObj);

                //填充classID和propertyObj的字典映射,将对应的propertyObj添加到对应的classID的propertyObj集合中
                if (classIDPropertyObjsMap.ContainsKey(dynClassID))
                {
                    if (!classIDPropertyObjsMap[dynClassID].Contains(PropertyObj))
                    {
                        classIDPropertyObjsMap[dynClassID].Add(PropertyObj);
                    }
                }
                else
                {
                    List<DynObject> PropertyObjList = new List<DynObject>();
                    PropertyObjList.Add(PropertyObj);
                    classIDPropertyObjsMap.Add(dynClassID, PropertyObjList);
                }
            }

            //将MethodEnetity转换成MethodObj并加入_dynMethodList
            foreach (DynEntity methodEntity in methodEntityDict.Values)
            {
                int methodID = (int)(methodEntity["DynMethodID"]);
                DynObject methodObj = null;
                if (!string.IsNullOrEmpty(methodEntity["Definition"] as string))
                {
                    methodObj = DynObjectTransverter.JsonToDynObject(methodEntity["Definition"] as string);
                }

                methodObj["MethodID"] = methodEntity["DynMethodID"];
                methodObj["MethodName"] = methodEntity["DynMethodName"];
                methodObj["Body"] = methodEntity["Body"];
                methodObj["Description"] = methodEntity["Description"];
                methodObj["ClassID"] = methodEntity["DynClassID"];
                methodObj["Attributes"] = methodEntity["Attributes"];
                methodObj["ScriptType"] = methodEntity["ScriptType"];
                methodObj["IsAsync"] = methodEntity["IsAsync"];
                methodObj["DisplayName"] = methodEntity["DisplayName"];
                methodObj["SourceMethodID"] = methodEntity["SourceMethodID"];

                methodObjDict.Add(methodID, methodObj);
            }

            #endregion 将从数据库中加载的基本DynEntities转换成DynObjects集合

            #region 加工组装从数据库中加载设计的应用程序相关的业务对象体系
            //初始化函数解析器
            if (DynStringResolver.MethodDict == null)
            {
                DynStringResolver.MethodDict = new Dictionary<string, string>();
            }

            //开始构造业务对象的DynClass 根据classObj["MainType"]的不同分别放到不同的Factory中
            foreach (DynObject classObj in classObjDict.Values)
            {
                if (!CoreObjectNames.Contains<string>(classObj["ClassName"].ToString()))
                {
                    int mainType = Convert.ToInt32(classObj["MainType"]);
                    string BaseClassName = null;
                    if (classObj["BaseClassName"] != null)
                    {
                        if (classObj["BaseClassName"].ToString().Trim() != "Entity")
                        {
                            BaseClassName = classObj["BaseClassName"].ToString();
                        }
                    }
                    List<DynObject> dynAttributes = new List<DynObject>();
                    switch (mainType)
                    {
                        case 0: // Class 实体类
                            DynClass dynClass = new DynClass(classObj["ClassName"].ToString(), BaseClassName, null);
                            if (classObj["Description"] != null)
                            {
                                dynClass.Description = classObj["Description"] as string;
                            }
                            if (classObj["DisplayName"] != null)
                            {
                                dynClass.DisplayName = classObj["DisplayName"] as string;
                            }
                            //添加Class的Attribute
                            dynAttributes = DynObjectTransverter.JsonToDynObjectList(classObj["Attributes"] as string);
                            foreach (DynObject dynAttribute in dynAttributes)
                            {
                                dynClass.AddAttribute(dynAttribute);
                            }
                            dynClass.Namespace = namespaceEntityDict[(int)classObj["NamespaceID"]]["NamespaceName"].ToString();
                            dynClass.ClassMainType = (ClassMainType)Enum.Parse(typeof(ClassMainType), classObj["MainType"].ToString(), true);
                            DynTypeManager.RegistClass(dynClass);
                            classIDDynClassMap.Add((int)classObj["ClassID"], dynClass);
                            break;

                        case 1:// 控制类
                            DynClass controlClass = new DynClass(classObj["ClassName"].ToString(), BaseClassName, null);
                            if (classObj["Description"] != null)
                            {
                                controlClass.Description = classObj["Description"] as string;
                            }
                            if (classObj["DisplayName"] != null)
                            {
                                controlClass.DisplayName = classObj["DisplayName"] as string;
                            }
                            //添加Class的Attribute
                            dynAttributes = DynObjectTransverter.JsonToDynObjectList(classObj["Attributes"] as string);
                            foreach (DynObject dynAttribute in dynAttributes)
                            {
                                controlClass.AddAttribute(dynAttribute);
                            }
                            controlClass.Namespace = namespaceEntityDict[(int)classObj["NamespaceID"]]["NamespaceName"].ToString();
                            controlClass.ClassMainType = (ClassMainType)Enum.Parse(typeof(ClassMainType), classObj["MainType"].ToString(), true);
                            DynTypeManager.RegistClass(controlClass);
                            classIDDynClassMap.Add((int)classObj["ClassID"], controlClass);
                            break;

                        case 2:// 关联类
                            dynClass = new DynClass(classObj["ClassName"].ToString(), BaseClassName, null);
                            if (classObj["Description"] != null)
                            {
                                dynClass.Description = classObj["Description"] as string;
                            }
                            if (classObj["DisplayName"] != null)
                            {
                                dynClass.DisplayName = classObj["DisplayName"] as string;
                            }
                            //添加Class的Attribute
                            dynAttributes = DynObjectTransverter.JsonToDynObjectList(classObj["Attributes"] as string);
                            foreach (DynObject dynAttribute in dynAttributes)
                            {
                                dynClass.AddAttribute(dynAttribute);
                            }
                            dynClass.Namespace = namespaceEntityDict[(int)classObj["NamespaceID"]]["NamespaceName"].ToString();
                            dynClass.ClassMainType = (ClassMainType)Enum.Parse(typeof(ClassMainType), classObj["MainType"].ToString(), true);
                            DynTypeManager.RegistClass(dynClass);
                            classIDDynClassMap.Add((int)classObj["ClassID"], dynClass);
                            break;
                        case 3://interface 接口类
                            DynInterface dynInterface = new DynInterface(classObj["ClassName"].ToString());
                            dynInterface.Namespace = namespaceEntityDict[(int)classObj["NamespaceID"]]["NamespaceName"].ToString();
                            dynInterface.ClassMainType = (ClassMainType)Enum.Parse(typeof(ClassMainType), classObj["MainType"].ToString(), true);

                            DynTypeManager.RegistInterface(dynInterface);
                            classIDDynInterfaceMap.Add((int)classObj["ClassID"], dynInterface);
                            break;
                        case 4://function 函数类
                            dynClass = new DynClass(classObj["ClassName"].ToString(), BaseClassName, null);
                            if (classObj["Description"] != null)
                            {
                                dynClass.Description = classObj["Description"] as string;
                            }
                            if (classObj["DisplayName"] != null)
                            {
                                dynClass.DisplayName = classObj["DisplayName"] as string;
                            }
                            //添加Class的Attribute
                            dynAttributes = DynObjectTransverter.JsonToDynObjectList(classObj["Attributes"] as string);
                            foreach (DynObject dynAttribute in dynAttributes)
                            {
                                dynClass.AddAttribute(dynAttribute);
                            }
                            dynClass.Namespace = namespaceEntityDict[(int)classObj["NamespaceID"]]["NamespaceName"].ToString();
                            dynClass.ClassMainType = (ClassMainType)Enum.Parse(typeof(ClassMainType), classObj["MainType"].ToString(), true);
                            DynTypeManager.RegistFunction(dynClass);
                            classIDDynClassMap.Add((int)classObj["ClassID"], dynClass);
                            break;
                        default:
                            throw new ApplicationException("不存在该种类型");
                    }
                }
            }

            //构建属性(目前method对应的class没有property属性)          
            foreach (DynObject PropertyObj in propertyObjDict.Values)
            {
                try
                {
                    string propertyCollectionTypeStr = PropertyObj["CollectionType"] as string;
                    string propertyTypeNameStr = PropertyObj["Type"] as string;
                    short propertyID = -1;
                    string propertyName = PropertyObj["PropertyName"] as string;
                    string propertyCollectionType = string.IsNullOrEmpty(propertyCollectionTypeStr) ? "None" : propertyCollectionTypeStr;
                    string propertyDynType = string.IsNullOrEmpty(propertyTypeNameStr) ? "String" : (propertyTypeNameStr);
                    string propertyStructName = PropertyObj["StructName"] as string;
                    DynProperty dynProperty = new DynProperty(propertyID, propertyName, (CollectionType)Enum.Parse(typeof(CollectionType), propertyCollectionType, true), (DynType)Enum.Parse(typeof(DynType), propertyDynType, true), propertyStructName);
                    dynProperty.IsArray = Convert.ToBoolean(PropertyObj["IsArray"]);
                    if (PropertyObj["Description"] != null)
                    {
                        dynProperty.Description = PropertyObj["Description"] as string;
                    }
                    if (PropertyObj["DisplayName"] != null)
                    {
                        dynProperty.DisplayName = PropertyObj["DisplayName"] as string;
                    }
                    //给属性添加Attribute
                    List<DynObject> dynAttributes = DynObjectTransverter.JsonToDynObjectList(PropertyObj["Attributes"] as string);
                    foreach (DynObject dynAttribute in dynAttributes)
                    {
                        dynProperty.AddAttribute(dynAttribute);
                    }

                    //找到_dynClassIDDynClassMap字典中的PropertyObj所属的DynClass将dynProperty添加到DynClass的Property集合中
                    if (classIDDynClassMap.ContainsKey((int)PropertyObj["ClassID"]))
                    {
                        DynClass dynClass = classIDDynClassMap[(int)PropertyObj["ClassID"]];
                        //判断dynClass是否核心类型,核心类型不处理
                        if (!CoreObjectNames.Contains<string>(dynClass.Name))
                        {
                            dynProperty.ID = Convert.ToInt16(dynClass.GetLocalProperties().Length);
                            dynClass.AddProperty(dynProperty);

                            //缓存PropertyObjID和DynProperty的对应关系
                            dynPropertyObjIDDynPropertyMap.Add((int)PropertyObj.PropertyValues["PropertyID"], dynProperty);

                            //特殊处理None:Struct类型 的属性 扩展一个额外的属性为 其 名字+"ID" 类型为None:I32 目前只有一对多的关联符合
                            if (propertyCollectionType == "None" && propertyDynType == "Struct")
                            {
                                DynProperty dynPropertyAdditional = new DynProperty(propertyID, propertyName + "ID", CollectionType.None, DynType.I32, null);
                                dynPropertyAdditional.ID = Convert.ToInt16(dynClass.GetLocalProperties().Length);
                                dynClass.AddProperty(dynPropertyAdditional);

                                //构造一个PersistIgnore的Attribute添加到该属性的Attribute集合中
                                var obj = dynProperty.Attributes.FirstOrDefault(item => item.DynClass.Name == "PersistIgnore");
                                if (obj == null)
                                {
                                    DynObject dynObject = new DynObject("PersistIgnore");
                                    dynProperty.AddAttribute(dynObject);
                                }
                            }
                        }
                    }

                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }

            //构建方法
            foreach (DynObject methodObj in methodObjDict.Values)
            {
                DynMethod dynMethod = null;
                //方法类现在有两种情况,这里是属于Interface的方法
                if (classIDDynInterfaceMap.ContainsKey((int)methodObj["ClassID"]))
                {
                    DynInterface dynInterface = classIDDynInterfaceMap[(int)methodObj["ClassID"]];
                    //判断dynInterface是否核心类型
                    if (!CoreObjectNames.Contains<string>(dynInterface.Name))
                    {
                        dynMethod = new DynMethod(methodObj["MethodName"].ToString());
                        if (methodObj["Description"] != null)
                        {
                            dynMethod.Description = methodObj["Description"] as string;
                        }
                        if (methodObj["DisplayName"] != null)
                        {
                            dynMethod.DisplayName = methodObj["DisplayName"] as string;
                        }
                        dynInterface.AddMethod(dynMethod);
                    }

                }   //方法类现在有两种情况,这里是属于DynClass的实例方法,另一种是属于DynInterface的方法
                else if (classIDDynClassMap.ContainsKey((int)methodObj["ClassID"]))
                {
                    DynClass dynClass = classIDDynClassMap[(int)methodObj["ClassID"]];
                    //判断dynClass是否核心类型
                    if (!CoreObjectNames.Contains<string>(dynClass.Name))
                    {
                        dynMethod = new DynMethod(methodObj["MethodName"].ToString());
                        if (methodObj["Description"] != null)
                        {
                            dynMethod.Description = methodObj["Description"] as string;
                        }
                        if (methodObj["DisplayName"] != null)
                        {
                            dynMethod.DisplayName = methodObj["DisplayName"] as string;
                        }
                        if (methodObj["Body"] != null)
                        {
                            dynMethod.Body = methodObj["Body"].ToString();
                        }

                        dynClass.AddMethod(dynMethod);
                    }

                    //如果类的状态是函数 则将函数加入解析器的字典列表
                    if (dynClass.ClassMainType == ClassMainType.Function)
                    {
                        DynStringResolver.MethodDict.Add(dynMethod.Name, dynClass.Name);
                    }
                }

                //判断method是否被成功的创建,否者就是该method所属的DynInterface或者DynClass 不存在
                if (dynMethod != null)
                {
                    //添加执行类型 
                    if (!string.IsNullOrEmpty(methodObj["ScriptType"] as string))
                    {
                        dynMethod.ScriptType = (ScriptType)Enum.Parse(typeof(ScriptType), methodObj["ScriptType"] as string, true);
                    }
                    else
                    {
                        dynMethod.ScriptType = ScriptType.DLL;
                    }

                    //给方法加上attribute实例    
                    string dynMethodAttributesStr = methodObj["Attributes"] as string;
                    if (!string.IsNullOrEmpty(dynMethodAttributesStr))
                    {
                        List<DynObject> dynAttributes = DynObjectTransverter.JsonToDynObjectList(dynMethodAttributesStr);
                        foreach (DynObject dynAttribute in dynAttributes)
                        {
                            dynMethod.AddAttribute(dynAttribute);
                        }
                    }

                    //构建输入参数
                    //这里的inputParametersObj 是DynProperty对应的DynObject因为
                    List<DynObject> inputParametersObj = methodObj["Parameters"] as List<DynObject>;
                    if (inputParametersObj != null)
                    {
                        short i = 0;
                        foreach (var inputParameterObj in inputParametersObj)
                        {
                            string methodInputParameterCollectionTypeStr = inputParameterObj["CollectionType"] as string;
                            string methodInputParameterTypeNameStr = inputParameterObj["Type"] as string;

                            string methodInputParameterName = inputParameterObj["ParameterName"] as string;
                            string methodInputParameterCollectionType = string.IsNullOrEmpty(methodInputParameterCollectionTypeStr) ? "None" : methodInputParameterCollectionTypeStr;
                            string methodInputParameterDynType = string.IsNullOrEmpty(methodInputParameterTypeNameStr) ? "String" : (methodInputParameterTypeNameStr);
                            string methodInputParameterStructName = inputParameterObj["StructName"] as string;

                            DynParameter dynMethodInputParameter = new DynParameter(i++, methodInputParameterName, (CollectionType)Enum.Parse(typeof(CollectionType), methodInputParameterCollectionType, true), (DynType)Enum.Parse(typeof(DynType), methodInputParameterDynType, true), methodInputParameterStructName);
                            dynMethod.AddParameter(dynMethodInputParameter);
                        }
                    }

                    //构建输出参数
                    DynObject outputParameterObj = methodObj["Result"] as DynObject;
                    if (outputParameterObj != null)
                    {
                        string methodOutputParameterCollectionTypeStr = outputParameterObj["CollectionType"] as string;
                        string methodOutputParameterTypeNameStr = outputParameterObj["Type"] as string;

                        string methodOutputParameterName = outputParameterObj["ParameterName"] as string;
                        string methodOutputParameterCollectionType = string.IsNullOrEmpty(methodOutputParameterCollectionTypeStr) ? "None" : methodOutputParameterCollectionTypeStr;
                        string methodOutputParameterDynType = string.IsNullOrEmpty(methodOutputParameterTypeNameStr) ? "String" : (methodOutputParameterTypeNameStr);
                        string methodOutputParameterStructName = outputParameterObj["StructName"] as string;

                        dynMethod.Result.DynType = (DynType)Enum.Parse(typeof(DynType), methodOutputParameterDynType, true);
                        dynMethod.Result.CollectionType = (CollectionType)Enum.Parse(typeof(CollectionType), methodOutputParameterCollectionType, true);
                        dynMethod.Result.StructName = methodOutputParameterStructName;
                    }
                }
            }
            ////给属性排序 TODO:(目前不支持继承关系,暂时不需要排序)
            //for (int i = 0; i < DynTypeManager.DynClasses.Count; i++)
            //{
            //    DynClass dynClass = DynTypeManager.DynClasses.Values.ToArray()[i];

            //    if (!CoreObjectNames.Contains<string>(dynClass.Name))
            //    {
            //        short propertyStartID = GetPropertyStartID(dynClass);
            //        DynProperty[] allDynPropertiesList = dynClass.GetProperties();
            //        DynProperty[] localPropertiesList = dynClass.GetLocalProperties();
            //        for (int j = 0; j < localPropertiesList.Length; j++)
            //        {
            //            DynProperty localProperty = localPropertiesList[j];
            //            dynClass.RemoveProperty(localProperty.Name);
            //            localProperty.ID = propertyStartID++;
            //            allDynPropertiesList[localProperty.ID] = localProperty;
            //        }
            //        //for (int j = localPropertiesList.Length - 1; j >= 0; j--)
            //        //{
            //        //    DynProperty localProperty = localPropertiesList[j];
            //        //    dynClass.RemoveProperty(localProperty.Name);
            //        //    localProperty.ID = propertyStartID++;
            //        //    allDynPropertiesList[localProperty.ID] = localProperty;
            //        //}

            //        foreach (DynProperty dynProperty in allDynPropertiesList)
            //        {
            //            if (dynProperty != null)
            //            {
            //                dynClass.AddProperty(dynProperty);
            //            }
            //        }
            //    }
            //}

            //TODO:实现接口需要在实际的应用中细化,看哪些需要完善和清理
            //实现接口
            foreach (DynObject classObj in classObjDict.Values)
            {
                if (!CoreObjectNames.Contains<string>(classObj["ClassName"].ToString()))
                {
                    int mainType = Convert.ToInt32(classObj["MainType"]);
                    string interfaceNames = classObj["InterfaceNames"] as string;
                    List<string> interfaceNameList = new List<string>();

                    if (!string.IsNullOrEmpty(interfaceNames))
                    {
                        string[] ins = interfaceNames.Split(',');
                        interfaceNameList.AddRange(ins);
                    }

                    if (interfaceNameList.Count > 0)
                    {
                        switch (mainType)
                        {
                            case 0: // Class 实体类
                                DynTypeManager.GetClass(classObj["ClassName"].ToString()).ImplementInterfaces(interfaceNameList);
                                break;
                            case 1:// 控制类
                                DynTypeManager.GetClass(classObj["ClassName"].ToString()).ImplementInterfaces(interfaceNameList);
                                break;
                            case 2://关联类
                                DynTypeManager.GetClass(classObj["ClassName"].ToString()).ImplementInterfaces(interfaceNameList);
                                break;
                            case 3:// 接口类
                                break;
                            case 4://functaion
                                break;
                            default:
                                throw new ApplicationException("不存在该种类型");
                        }
                    }
                }
            }

            //需要持久化对象的Attribute构建对应的DynEntityType实体放入实体工厂
            foreach (DynObject dynClassObj in classObjDict.Values)
            {
                if (dynClassObj["ClassName"] != null)
                {
                    if (dynClassObj["Attributes"] != null)
                    {
                        bool isPersistable = false;
                        string classObjAttributesStr = dynClassObj["Attributes"] as string;
                        List<DynObject> classObjAtrributes = DynObjectTransverter.JsonToDynObjectList(classObjAttributesStr);
                        foreach (var item in classObjAtrributes)
                        {
                            if (item.DynClass.Name == "Persistable")
                            {
                                isPersistable = true;
                                break;
                            }
                        }
                        if (isPersistable)
                        {
                            DynEntityType dynEntityType = null;
                            string dynEntityName = dynClassObj["ClassName"] as string;
                            string baseClassName = dynClassObj["BaseClassName"] as string;
                            //根据classObj的NamespaceID从_namespaceObjList集合中取出namespaceObj,再从namespaceObj中取出["NamespaceName"],也可以从_namespaceEntityList中获取
                            string namespaceName = namespaceObjDict[(int)dynClassObj["NamespaceID"]]["NamespaceName"].ToString();
                            if (!string.IsNullOrEmpty(baseClassName) && baseClassName != "Entity")
                            {
                                dynEntityType = new DynEntityType(dynEntityName, baseClassName, namespaceName);
                            }
                            else
                            {
                                dynEntityType = new DynEntityType(dynEntityName);
                                dynEntityType.Namespace = namespaceName;
                            }

                            //TODO:这里要在设计器中进行限定需要持久化的类一定要添加MappingNameAttribute默认是类名
                            foreach (var dynClassAttributeObj in classObjAtrributes)
                            {
                                string attributeName = dynClassAttributeObj.DynClass.Name;

                                switch (dynClassAttributeObj.DynClass.Name)
                                {
                                    case "MappingName":
                                        string dynClassMappingName = dynClassAttributeObj["Name"] as string;
                                        dynEntityType.Attributes.Add(new MappingNameDynAttribute(dynClassMappingName));
                                        break;
                                    case "OutputNamespace":
                                        string outputNamespaceName = dynClassAttributeObj["Name"] as string;
                                        if (outputNamespaceName != null)
                                        {
                                            dynEntityType.Attributes.Add(new OutputNamespaceDynAttribute(outputNamespaceName));
                                        }
                                        break;
                                    case "Relation":
                                        dynEntityType.Attributes.Add(new RelationDynAttribute());
                                        break;
                                    default:
                                        break;
                                }
                            }
                            if (dynClassObj["Description"] != null)
                            {
                                dynEntityType.Attributes.Add(new CommentDynAttribute(dynClassObj["Description"] as string));
                            }

                            //处理属性的Attribute 从dynClassIDPropertyObjsMap集合中提取propertyDynObject,从propertyDynObject的Attributes属性中取出json串并判断是否存在PersistIgnore这个Attribute如果不存在则构造DynPropertyConfiguration的实例并添加到dynEntityType中
                            if (classIDPropertyObjsMap.ContainsKey((int)dynClassObj["ClassID"]))
                            {
                                List<DynObject> dynPropertyObjs = classIDPropertyObjsMap[(int)dynClassObj["ClassID"]];

                                if (dynPropertyObjs != null && dynPropertyObjs.Count > 0)
                                {
                                    foreach (DynObject dynPropertyObj in dynPropertyObjs)
                                    {
                                        //非查询属性的不需要持久化的不需要生成不生成对应的持久化实体属性
                                        bool isPersistIgnore = false;
                                        //非查询类型的对象及对象列表属性(目前均为为模型对象)不生成对应的持久化实体属性
                                        if ((string)dynPropertyObj["Type"] == "Struct" && !(bool)dynPropertyObj["IsQueryProperty"])
                                        {
                                            continue;
                                        }
                                        string dynPropertyAttributesString = dynPropertyObj["Attributes"] as string;
                                        string dynPropertyName = dynPropertyObj["PropertyName"] as string;
                                        DynPropertyConfiguration dynPropertyConfiguration = new DynPropertyConfiguration(dynPropertyName);
                                        dynPropertyConfiguration.IsArray = Convert.ToBoolean(dynPropertyObj["IsArray"]);

                                        List<DynObject> propertyObjAtrributes = DynObjectTransverter.JsonToDynObjectList(dynPropertyAttributesString);

                                        foreach (var propertyObjAtrribute in propertyObjAtrributes)
                                        {
                                            switch (propertyObjAtrribute.DynClass.Name)
                                            {
                                                case "PrimaryKey":
                                                    dynPropertyConfiguration.Attributes.Add(new PrimaryKeyDynAttribute());
                                                    dynPropertyConfiguration.IsPrimaryKey = true;
                                                    break;
                                                case "NotNull":
                                                    dynPropertyConfiguration.Attributes.Add(new NotNullDynAttribute());
                                                    dynPropertyConfiguration.IsNotNull = true;
                                                    break;
                                                case "MappingName":
                                                    dynPropertyConfiguration.Attributes.Add(new MappingNameDynAttribute(propertyObjAtrribute["Name"].ToString()));
                                                    dynPropertyConfiguration.MappingName = propertyObjAtrribute["Name"].ToString();
                                                    break;
                                                case "FriendKey":
                                                    dynPropertyConfiguration.Attributes.Add(new FriendKeyDynAttribute(propertyObjAtrribute["RelatedEntityType"].ToString()));
                                                    dynPropertyConfiguration.IsFriendKey = true;
                                                    break;
                                                case "RelationKey":
                                                    dynPropertyConfiguration.Attributes.Add(new RelationKeyDynAttribute(propertyObjAtrribute["RelatedType"].ToString()));
                                                    dynPropertyConfiguration.IsRelationKey = true;
                                                    dynPropertyConfiguration.RelatedType = propertyObjAtrribute["RelatedType"].ToString();
                                                    break;
                                                case "FkReverseQuery":
                                                    //额外添加dynPropertyName + "ID" 用于接收key值
                                                    DynPropertyConfiguration temp = new DynPropertyConfiguration(dynPropertyName + "ID");
                                                    temp.Attributes.Add(new NotNullDynAttribute());
                                                    temp.IsNotNull = true;
                                                    temp.PropertyType = GetPropertyTypeName(dynPropertyObj);
                                                    temp.EntityType = dynEntityType;
                                                    dynEntityType.AddProperty(temp);
                                                    dynPropertyConfiguration.Attributes.Add(new FkReverseQueryDynAttribute(true));
                                                    dynPropertyConfiguration.IsQueryProperty = true;
                                                    dynPropertyConfiguration.Attributes.Add(new SerializationIgnoreDynAttribute());
                                                    break;
                                                case "FkQuery":
                                                    dynPropertyConfiguration.Attributes.Add(new FkQueryDynAttribute(dynEntityName));
                                                    dynPropertyConfiguration.IsQueryProperty = true;
                                                    //dynPropertyConfiguration.RelatedForeignKey = propertyObjAtrribute["RelatedType"].ToString();
                                                    break;
                                                case "PersistIgnore":
                                                    isPersistIgnore = true;
                                                    break;
                                                default:
                                                    break;
                                            }
                                        }
                                        if (!isPersistIgnore)
                                        {
                                            dynPropertyConfiguration.PropertyType = GetPropertyTypeName(dynPropertyObj);
                                            dynPropertyConfiguration.EntityType = dynEntityType;
                                            dynEntityType.AddProperty(dynPropertyConfiguration);
                                        }
                                    }
                                }
                            }

                            DynEntityTypeManager.AddEntityType(dynEntityType);
                        }
                    }
                }
                else
                {
                    throw new ApplicationException("需要转换成DynEntity的DynClass没有名字");
                }
            }

            DynEntityTypeMetaDataCoordinator.EntityTypes2EntityConfiguration();

            // 添加接口和对应的实现映射
            InterfaceImplementMap.Init();
            #endregion 加工组装从数据库中加载设计的应用程序相关的业务对象体系
        }

        public void LoadReflectDynMethod()
        {
            reflectDynMethodDict.Clear();

            string[] fileNames = Directory.GetFiles(_appPath + "ref\\");
            ///获取文件列表信息  
            foreach (string fileName in fileNames)
            {
                FileInfo fileInfo = new FileInfo(fileName);
                if (fileInfo.Extension.ToLower() == ".dll")
                {
                    Assembly assembly = Assembly.LoadFrom(fileInfo.FullName);

                    foreach (Type type in assembly.GetTypes())
                    {
                        if (type.IsClass && !type.FullName.Contains("System.Diagnostics.Contracts"))
                        {
                            object typeInstance = null;
                            try
                            {
                                typeInstance = Activator.CreateInstance(type, null);
                            }
                            catch (MissingMethodException) //如果是静态类时，生成实例会报异常
                            {
                                typeInstance = null;
                            }
                            catch (Exception ex)
                            {
                                throw GetBaseException(ex);
                            }

                            PropertyInfo[] propertyInfos = type.GetProperties();
                            foreach (PropertyInfo propertyInfo in propertyInfos)
                            {
                                if (propertyInfo.Name == "DefaultDatabase")
                                {
                                    propertyInfo.SetValue(typeInstance, GatewayFactory.Default, null);
                                }
                            }

                            MethodInfo[] methodInfos = type.GetMethods();

                            foreach (MethodInfo methodInfo in methodInfos)
                            {
                                ReflectMethod refMethod = new ReflectMethod(typeInstance, methodInfo);

                                if (!reflectDynMethodDict.ContainsKey(type.Name + "_" + methodInfo.Name))
                                {
                                    reflectDynMethodDict.Add(type.Name + "_" + methodInfo.Name, refMethod);
                                }
                            }
                        }
                    }
                }
            }
        }
        private void LoadStaticEntities()
        {
            //反射静态类
            Assembly assembly = Assembly.GetAssembly(typeof(Rock.StaticEntities.User));

            foreach (Type type in assembly.GetTypes())
            {
                if (type.IsClass)
                {
                    if (!DynTypeManager.ContainsStaticType(type.Name))
                        DynTypeManager.RegistStaticType(type);
                }
            }
        }
        private void LoadStaticReflectMethod()
        {
            //_reflectStaticMethodDict.Clear();

            string[] fileNames = Directory.GetFiles(_appPath + "sref\\");
            ///获取文件列表信息  
            foreach (string fileName in fileNames)
            {
                FileInfo fileInfo = new FileInfo(fileName);
                if (fileInfo.Extension.ToLower() == ".dll")
                {
                    Assembly assembly = Assembly.LoadFrom(fileInfo.FullName);

                    foreach (Type type in assembly.GetTypes())
                    {
                        if (type.IsClass)
                        {
                            object typeInstance = null;
                            try
                            {
                                typeInstance = Activator.CreateInstance(type, null);
                            }
                            catch  //如果是静态类时，生成实例会报异常
                            {
                                typeInstance = null;
                            }

                            PropertyInfo[] propertyInfos = type.GetProperties();
                            foreach (PropertyInfo propertyInfo in propertyInfos)
                            {
                                if (propertyInfo.Name == "DefaultDatabase")
                                {
                                    propertyInfo.SetValue(typeInstance, GatewayFactory.Default, null);
                                }
                            }

                            MethodInfo[] methodInfos = type.GetMethods();

                            foreach (MethodInfo methodInfo in methodInfos)
                            {
                                ReflectMethod refMethod = new ReflectMethod(typeInstance, methodInfo);

                                if (!reflectStaticMethodDict.ContainsKey(type.Name + "_" + methodInfo.Name))
                                {
                                    reflectStaticMethodDict.Add(type.Name + "_" + methodInfo.Name, refMethod);
                                }
                            }
                        }
                    }
                }
            }
        }
        public string GetJsScript(string[] jsTypes)
        {
            return jsScriptLoader.GetJsScript(jsTypes);
        }
        private object MethodHandler(object self, string methodName, Dictionary<string, Object> paramDict)
        {
            if (string.IsNullOrEmpty(methodName))
            {
                string message = "调用MethodHandler时方法没有方法名";
                Exception ex = new ApplicationException(message);
                throw ex;
            }

            string[] temp = methodName.Split("_".ToArray(), StringSplitOptions.RemoveEmptyEntries);
            if (temp.Length != 2)
            {
                string message = string.Format("调用MethodHandler时输入错误格式的方法名:{0}", methodName);
                Exception ex = new ApplicationException(message);
                throw ex;
            }

            DynClass dynClass = DynTypeManager.GetClass(temp[0]);
            DynMethod dynMethod = dynClass.GetMethod(temp[1]);

            if (!_isLoaded && temp[0] != "ServiceControl")
            {
                string message = string.Format("当前服务已停止，不提供方法{0}的实现。", dynMethod.FullName);
                Exception ex = new ApplicationException(message);
                throw ex;
            }

            try
            {
                switch (dynMethod.ScriptType)
                {
                    case ScriptType.DLL:
                        object dllResult = null;
                        if (reflectStaticMethodDict.ContainsKey(methodName))
                        {

                            Dictionary<string, object> paramValues = new Dictionary<string, object>();

                            foreach (string paramName in dynMethod.GetParameterNames())
                            {
                                switch (dynMethod.Parameters[paramName].CollectionType)
                                {
                                    case CollectionType.None:
                                        if (dynMethod.Parameters[paramName].DynType == DynType.Struct)
                                        {
                                            object value = DynObjectTransverter.DynObjectToStatic(paramDict[paramName] as DynObject);

                                            paramValues[paramName] = value;
                                        }
                                        else
                                        {
                                            paramValues[paramName] = paramDict[paramName];
                                        }

                                        break;

                                    case CollectionType.List:
                                        if (dynMethod.Parameters[paramName].DynType == DynType.Struct)
                                        {
                                            List<object> list = new List<object>();

                                            foreach (DynObject item in paramDict[paramName] as List<DynObject>)
                                            {
                                                object value = DynObjectTransverter.DynObjectToStatic(item as DynObject);

                                                list.Add(value);
                                            }

                                            paramValues[paramName] = list;
                                        }
                                        else
                                        {
                                            paramValues[paramName] = paramDict[paramName];
                                        }
                                        break;
                                }
                            }

                            dllResult = InvokeReflectStaticMethod(self, dynMethod, paramValues);
                        }
                        else
                        {
                            dllResult = InvokeReflectDynMethod(self, dynMethod, paramDict);
                        }
                        return dllResult;
                    default:
                        break;
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return null;
        }
        public object InvokeReflectDynMethod(object self, DynMethod dynMethod, Dictionary<string, Object> paramDict)
        {
            if (reflectDynMethodDict.ContainsKey(dynMethod.FullName))
            {
                ReflectMethod reflectMethod = reflectDynMethodDict[dynMethod.FullName];

                Dictionary<string, object> defaultValue = new Dictionary<string, object>();

                Dictionary<string, int> nameMaping = new Dictionary<string, int>();

                int i = 0;
                foreach (ParameterInfo p in reflectMethod.Method.GetParameters())
                {
                    if (p.IsOptional)
                    {
                        defaultValue[p.Name] = p.DefaultValue;
                    }

                    nameMaping[p.Name] = i;

                    i++;
                }

                DynParameter[] parameters = dynMethod.GetParameters();
                object[] paramValues = new object[i];

                foreach (var item in parameters)
                {
                    if (item.Value == null && defaultValue.ContainsKey(item.Name))
                    {
                        if (nameMaping.ContainsKey(item.Name))
                        {
                            paramValues[nameMaping[item.Name]] = defaultValue[item.Name];
                        }
                    }
                    else
                    {
                        if (nameMaping.ContainsKey(item.Name))
                        {
                            paramValues[nameMaping[item.Name]] = paramDict[item.Name];
                        }
                    }
                }

                return reflectMethod.Method.Invoke(reflectMethod.Instance, paramValues); //带参数方法的调用
            }
            else
            {
                throw new ApplicationException(string.Format("反射方法中不包含方法【{0}】的定义", dynMethod.FullName));
            }
        }
        public object InvokeReflectStaticMethod(object self, DynMethod dynMethod, Dictionary<string, Object> paramDict)
        {
            if (reflectStaticMethodDict.ContainsKey(dynMethod.FullName))
            {
                ReflectMethod reflectMethod = reflectStaticMethodDict[dynMethod.FullName];

                Dictionary<string, object> defaultValue = new Dictionary<string, object>();

                Dictionary<string, int> nameMaping = new Dictionary<string, int>();

                int i = 0;
                foreach (ParameterInfo p in reflectMethod.Method.GetParameters())
                {
                    if (p.IsOptional)
                    {
                        defaultValue[p.Name] = p.DefaultValue;
                    }

                    nameMaping[p.Name] = i;

                    i++;
                }

                DynParameter[] parameters = dynMethod.GetParameters();
                object[] paramValues = new object[i];

                foreach (var item in parameters)
                {
                    if (item.Value == null && defaultValue.ContainsKey(item.Name))
                    {
                        if (nameMaping.ContainsKey(item.Name))
                        {
                            paramValues[nameMaping[item.Name]] = defaultValue[item.Name];
                        }
                    }
                    else
                    {
                        if (nameMaping.ContainsKey(item.Name))
                        {
                            paramValues[nameMaping[item.Name]] = paramDict[item.Name];
                        }
                    }
                }
                object instance = reflectMethod.Method.Invoke(reflectMethod.Instance, paramValues); //带参数方法的调用

                if (instance != null)
                {
                    if (instance.GetType().ToString() == "System.Data.DataTable")
                    {
                        return DynObjectTransverter.ToTransDataTable((DataTable)instance);
                    }
                    else
                    {
                        if (dynMethod.Result.CollectionType == CollectionType.None)
                        {
                            if (dynMethod.Result.DynType == DynType.Struct)
                            {
                                return DynObjectTransverter.StaticToDynObj(instance);
                            }
                            else
                            {
                                return instance;
                            }
                        }
                        else if (dynMethod.Result.CollectionType == CollectionType.List)
                        {
                            IList list = instance as IList;

                            if (dynMethod.Result.DynType == DynType.Struct)
                            {
                                List<DynObject> dynObjectList = new List<DynObject>();
                                foreach (var item in list)
                                {
                                    dynObjectList.Add(DynObjectTransverter.StaticToDynObj(item));
                                }
                                return dynObjectList;
                            }
                            else
                            {
                                return list;
                            }
                        }
                        else
                        {
                            return instance;
                        }
                    }
                }
                else
                    return null;
            }
            else
            {
                throw new ApplicationException(string.Format("反射方法中不包含方法【{0}】的定义", dynMethod.FullName));
            }
        }
        private string GetPropertyTypeName(DynObject dynProperty)
        {
            string typeString = null;
            if (dynProperty["Type"] as string == "Struct")
            {
                typeString = dynProperty["StructName"] as string;
            }
            else if (dynProperty["CollectionType"] as string != "None")
            {
                typeString = typeof(string).ToString();
            }
            else
            {
                DynType dynType = (DynType)Enum.Parse(typeof(DynType), (dynProperty["Type"] as string) ?? "String", true);

                switch (dynType)
                {
                    case DynType.Binary:
                        typeString = typeof(byte[]).ToString();
                        break;
                    case DynType.Void:
                        throw new Exception("一个错误的属性类型定义");
                    case DynType.Bool:
                        typeString = typeof(bool).ToString();
                        break;
                    case DynType.Byte:
                        typeString = typeof(byte).ToString();
                        break;
                    case DynType.Double:
                        typeString = typeof(double).ToString();
                        break;
                    case DynType.Decimal:
                        typeString = typeof(decimal).ToString();
                        break;
                    case DynType.I16:
                        typeString = typeof(short).ToString();
                        break;
                    case DynType.I32:
                        typeString = typeof(int).ToString();
                        break;
                    case DynType.I64:
                        typeString = typeof(long).ToString();
                        break;
                    case DynType.String:
                        typeString = typeof(string).ToString();
                        break;
                    case DynType.DateTime:
                        typeString = typeof(DateTime).ToString();
                        break;
                    default:
                        break;
                }

            }

            return typeString;
        }

        /// <summary>
        /// 获取类的属性起始ID
        /// </summary>
        /// <param name="dynClass"></param>
        /// <returns></returns>
        private static short GetPropertyStartID(DynClass dynClass)
        {
            short startID = 0;
            DynClass baseClass = dynClass.BaseClass;
            if (baseClass != null)
            {
                startID += (short)baseClass.GetLocalProperties().Length;
                startID += GetPropertyStartID(baseClass);
            }
            return startID;
        }
        public const int MaxEachConnectionObjectShowsMostAssociatedEntityName = 5;
        public void ReferValidate(DynObject dynObject)
        {
            if (dynObject == null)
            {
                return;
            }

            string dynClassDisplayName = GetDisplayName(dynObject.DynClass.Name);
            string errorMessages = null;
            if (dynObject.DynClass.RelationDynClassDict.Count > 0)
            {
                bool isHavePk = false;
                int classKey = 0;

                DynProperty[] dynProperties = dynObject.DynClass.GetProperties();
                foreach (var dynProperty in dynProperties)
                {
                    if (dynProperty.ContainsAttribute("PrimaryKey"))
                    {
                        classKey = (int)dynObject[dynProperty.Name];
                        isHavePk = true;
                        break;
                    }
                }

                if (isHavePk)
                {
                    foreach (string relationClassName in dynObject.DynClass.RelationDynClassDict.Keys)
                    {
                        DynClass relationClass = dynObject.DynClass.RelationDynClassDict[relationClassName];
                        string relationClassDisplayName = GetDisplayName(relationClassName);
                        string relationClassTrueName = GetTrueName(relationClass);
                        DynProperty relationDynProperty = dynObject.DynClass.RelationDynPropertyDict[relationClassName];
                        string relationPropertyTrueName = relationDynProperty.CollectionType == CollectionType.None && relationDynProperty.DynType == DynType.Struct ? relationDynProperty.Name : GetTrueName(relationDynProperty);
                        string dynObjectShowName = null;

                        DynEntity[] des = GatewayFactory.Default.FindArray(relationClassTrueName, _.P(relationClassTrueName, relationPropertyTrueName) == classKey);
                        string errorMessage = string.Format("无法进行操作\r\n给定的对象【{0}】被【{1}】对象的【{2}】个实例关联\r\n如果想删除【{0}】 请先删除与【{0}】有关系的【{1}】", dynClassDisplayName, relationClassDisplayName, des.Length);
                        if (relationDynProperty.ContainsAttribute("Relevance"))
                        {
                            var relevanceAttribute = relationDynProperty.GetAttribute("Relevance");
                            string errMessage = relevanceAttribute["ErrorMessage"] as string;
                            if (!string.IsNullOrEmpty(errMessage))
                            {
                                errorMessage = errMessage;
                            }
                        }


                        if (des != null && des.Length > 0)
                        {
                            string additionErrorMessage = "";
                            int showErrorLength = des.Length > MaxEachConnectionObjectShowsMostAssociatedEntityName ? MaxEachConnectionObjectShowsMostAssociatedEntityName : des.Length;
                            string relationShowName = "";
                            bool isNeedAdditionErrorMessage = true;

                            if (dynObject.DynClass.ContainsProperty(dynObject.DynClass.Name + "Name"))
                            {
                                dynObjectShowName = dynObject[dynObject.DynClass.Name + "Name"] as string;

                                if (relationClass.ContainsProperty(relationClass.Name + "Name"))
                                {
                                    DynProperty relationShowNameProperty = relationClass.GetProperty(relationClass.Name + "Name");
                                    relationShowName = GetTrueName(relationShowNameProperty);
                                }
                                else if (relationDynProperty.Name.ToLower().EndsWith("id"))
                                {
                                    string className = relationDynProperty.Name.Remove(relationDynProperty.Name.Length - 2, 2);
                                    if (DynTypeManager.ContainsClass(className))
                                    {
                                        DynClass trueRelationClass = DynTypeManager.GetClass(className);
                                        relationClassTrueName = GetTrueName(trueRelationClass);
                                        if (trueRelationClass.ContainsProperty(trueRelationClass.Name + "Name"))
                                        {
                                            des = GatewayFactory.Default.FindArray(relationClassTrueName, _.P(relationClassTrueName, relationClassTrueName + "ID") == classKey);
                                            DynProperty relationShowNameProperty = trueRelationClass.GetProperty(trueRelationClass.Name + "Name");
                                            relationShowName = GetTrueName(relationShowNameProperty);
                                        }
                                        else
                                        {
                                            isNeedAdditionErrorMessage = false;
                                        }
                                    }
                                    else
                                    {
                                        isNeedAdditionErrorMessage = false;
                                    }
                                }
                                else
                                {
                                    isNeedAdditionErrorMessage = false;
                                }
                            }
                            else
                            {
                                isNeedAdditionErrorMessage = false;
                            }
                            if (isNeedAdditionErrorMessage)
                            {

                                additionErrorMessage = "【" + dynClassDisplayName + "】中的【" + dynObjectShowName + "】与【" + relationClassDisplayName + "】中的";
                                for (int i = 0; i < showErrorLength; i++)
                                {
                                    additionErrorMessage += "【" + des[i][relationShowName] + "】,";
                                }

                                additionErrorMessage = additionErrorMessage.Remove(additionErrorMessage.Length - 1, 1);

                                if (des.Length > 5)
                                {
                                    additionErrorMessage += "等";
                                }
                                additionErrorMessage += "对象有关";

                                errorMessages = errorMessages + errorMessage + "\r\n" + additionErrorMessage;
                            }
                            else
                            {
                                errorMessages = errorMessages + errorMessage;
                            }

                        }
                    }
                }
            }

            Check.Require(string.IsNullOrEmpty(errorMessages), errorMessages);
        }
        private string GetDisplayName(string dynClassName)
        {
            if (DynTypeManager.ContainsClass(dynClassName))
            {
                DynClass dynClass = DynTypeManager.GetClass(dynClassName);
                return dynClass.DisplayName ?? dynClass.Name;
            }
            else
            {
                throw new Exception(string.Format("不存在类{0}", dynClassName));
            }
        }
        private string GetTrueName(DynClass dynClass)
        {
            string className = dynClass.Name;
            if (dynClass.ContainsAttribute("MappingName"))
            {
                DynObject mappingNameAttributeOnClass = dynClass.GetAttribute("MappingName");
                if (!string.IsNullOrEmpty(mappingNameAttributeOnClass["Name"] as string))
                {
                    className = mappingNameAttributeOnClass["Name"] as string;
                }
            }
            return className;
        }

        private string GetTrueName(DynProperty dynProperty)
        {
            string className = dynProperty.Name;
            if (dynProperty.ContainsAttribute("MappingName"))
            {
                DynObject mappingNameAttributeOnClass = dynProperty.GetAttribute("MappingName");
                if (!string.IsNullOrEmpty(mappingNameAttributeOnClass["Name"] as string))
                {
                    className = mappingNameAttributeOnClass["Name"] as string;
                }
            }
            return className;
        }
        public Exception GetBaseException(Exception ex)
        {
            if (ex.InnerException != null && ex != ex.InnerException)
            {
                return GetBaseException(ex.InnerException);
            }
            else
            {
                return ex;
            }
        }
    }
}
