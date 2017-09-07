

var StateMachineActionClass = function () {
    var className = "StateMachineAction";
    var displayName = "";
    var nameSpace = "Zork.Attribute.StateMachine";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "toState", zork.core.CollectionType.None, zork.core.DynType.String, "", "后置状态", "", {}, "TextBox"], [1, "fromState", zork.core.CollectionType.None, zork.core.DynType.String, "", "前置状态", "", {}, "TextBox"], [2, "eventName", zork.core.CollectionType.None, zork.core.DynType.String, "", "事件名", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            toState: null,
            fromState: null,
            eventName: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        toState: properties.toState,
        fromState: properties.fromState,
        eventName: properties.eventName,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
StateMachineActionClass.validateBind = function () {

}
parent.StateMachineActionClass = StateMachineActionClass;


var ComboxClass = function () {
    var className = "Combox";
    var displayName = "";
    var nameSpace = "Zork.Attribute.DataPresent";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "refer", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            refer: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        refer: properties.refer,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
ComboxClass.validateBind = function () {

}
parent.ComboxClass = ComboxClass;


var PrivilegeResourceClass = function () {
    var className = "PrivilegeResource";
    var displayName = "";
    var nameSpace = "Zork.Attribute.Permission";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "aliasName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            aliasName: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        aliasName: properties.aliasName,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
PrivilegeResourceClass.validateBind = function () {

}
parent.PrivilegeResourceClass = PrivilegeResourceClass;


var PrivilegeOperaterClass = function () {
    var className = "PrivilegeOperater";
    var displayName = "";
    var nameSpace = "Zork.Attribute.Permission";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "aliasName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            aliasName: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        aliasName: properties.aliasName,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
PrivilegeOperaterClass.validateBind = function () {

}
parent.PrivilegeOperaterClass = PrivilegeOperaterClass;


var EntityClassEntityClass = function () {
    var className = "EntityClassEntity";
    var displayName = "";
    var nameSpace = "Zork.EntityClass.Entity";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "isRelationClass", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [1, "associations", zork.core.CollectionType.List, zork.core.DynType.Struct, "AssociationClass", "", "", {}, "TextBox"], [2, "workFlowPropertyID", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [3, "classModelType", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [4, "moduleID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [5, "attributes", zork.core.CollectionType.List, zork.core.DynType.Struct, "Object", "", "", {}, "TextBox"], [6, "stateEvents", zork.core.CollectionType.List, zork.core.DynType.Struct, "StateEvent", "", "", {}, "TextBox"], [7, "states", zork.core.CollectionType.List, zork.core.DynType.Struct, "State", "状态", "", {}, "TextBox"], [8, "namespaceID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [9, "classID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [10, "methods", zork.core.CollectionType.List, zork.core.DynType.Struct, "Object", "", "", {}, "TextBox"], [11, "properties", zork.core.CollectionType.List, zork.core.DynType.Struct, "PropertyEntity", "", "", {}, "TextBox"], [12, "stateName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [13, "isFlowManager", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [14, "isStateManager", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [15, "rightManagerName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [16, "isRightManager", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [17, "isServerProtocol", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [18, "isDataProtocol", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [19, "isNeedSave", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [20, "tableName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [21, "mainType", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [22, "description", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [23, "baseClassName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [24, "displayName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [25, "name", zork.core.CollectionType.None, zork.core.DynType.String, "", "名称", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            isRelationClass: null,
            associations: null,
            workFlowPropertyID: null,
            classModelType: null,
            moduleID: null,
            attributes: null,
            stateEvents: null,
            states: null,
            namespaceID: null,
            classID: null,
            methods: null,
            properties: null,
            stateName: null,
            isFlowManager: null,
            isStateManager: null,
            rightManagerName: null,
            isRightManager: null,
            isServerProtocol: null,
            isDataProtocol: null,
            isNeedSave: null,
            tableName: null,
            mainType: null,
            description: null,
            baseClassName: null,
            displayName: null,
            name: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        isRelationClass: properties.isRelationClass,
        associations: properties.associations,
        workFlowPropertyID: properties.workFlowPropertyID,
        classModelType: properties.classModelType,
        moduleID: properties.moduleID,
        attributes: properties.attributes,
        stateEvents: properties.stateEvents,
        states: properties.states,
        namespaceID: properties.namespaceID,
        classID: properties.classID,
        methods: properties.methods,
        properties: properties.properties,
        stateName: properties.stateName,
        isFlowManager: properties.isFlowManager,
        isStateManager: properties.isStateManager,
        rightManagerName: properties.rightManagerName,
        isRightManager: properties.isRightManager,
        isServerProtocol: properties.isServerProtocol,
        isDataProtocol: properties.isDataProtocol,
        isNeedSave: properties.isNeedSave,
        tableName: properties.tableName,
        mainType: properties.mainType,
        description: properties.description,
        baseClassName: properties.baseClassName,
        displayName: properties.displayName,
        name: properties.name,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
EntityClassEntityClass.validateBind = function () {

}
parent.EntityClassEntityClass = EntityClassEntityClass;


var StateClass = function () {
    var className = "State";
    var displayName = "";
    var nameSpace = "Zork.EntityClass.Entity";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "isFinalState", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "终止状态", "", {}, "TextBox"], [1, "isStartState", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "起始状态", "", {}, "TextBox"], [2, "stateName", zork.core.CollectionType.None, zork.core.DynType.String, "", "状态名称", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            isFinalState: null,
            isStartState: null,
            stateName: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        isFinalState: properties.isFinalState,
        isStartState: properties.isStartState,
        stateName: properties.stateName,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
StateClass.validateBind = function () {

}
parent.StateClass = StateClass;


var StateEventClass = function () {
    var className = "StateEvent";
    var displayName = "";
    var nameSpace = "Zork.EntityClass.Entity";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "toState", zork.core.CollectionType.None, zork.core.DynType.String, "", "转化为状态", "", {}, "TextBox"], [1, "beginState", zork.core.CollectionType.None, zork.core.DynType.String, "", "绑定事件名称", "", {}, "TextBox"], [2, "bindingEventName", zork.core.CollectionType.None, zork.core.DynType.String, "", "绑定事件名称", "", {}, "TextBox"], [3, "stateEventName", zork.core.CollectionType.None, zork.core.DynType.String, "", "状态事件名称", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            toState: null,
            beginState: null,
            bindingEventName: null,
            stateEventName: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        toState: properties.toState,
        beginState: properties.beginState,
        bindingEventName: properties.bindingEventName,
        stateEventName: properties.stateEventName,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
StateEventClass.validateBind = function () {

}
parent.StateEventClass = StateEventClass;


var ResourceOperateClass = function () {
    var className = "ResourceOperate";
    var displayName = "";
    var nameSpace = "Zork.Security";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "resourceID", zork.core.CollectionType.None, zork.core.DynType.I32, "Resource", "", "", {}, "TextBox"], [1, "resourceOperateName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [2, "resourceOperateID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            resourceID: null,
            resourceOperateName: null,
            resourceOperateID: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        resourceID: properties.resourceID,
        resourceOperateName: properties.resourceOperateName,
        resourceOperateID: properties.resourceOperateID,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
ResourceOperateClass.validateBind = function () {

}
parent.ResourceOperateClass = ResourceOperateClass;


var UserGroupResourceOperateClass = function () {
    var className = "UserGroupResourceOperate";
    var displayName = "";
    var nameSpace = "Zork.Security";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "resourceOperateID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [1, "userGroupID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            resourceOperateID: null,
            userGroupID: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        resourceOperateID: properties.resourceOperateID,
        userGroupID: properties.userGroupID,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
UserGroupResourceOperateClass.validateBind = function () {

}
parent.UserGroupResourceOperateClass = UserGroupResourceOperateClass;


var MethodEntityClass = function () {
    var className = "MethodEntity";
    var displayName = "";
    var nameSpace = "Zork.EntityClass.Entity";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "isAsync", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [1, "logType", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [2, "methodID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [3, "classID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [4, "attributes", zork.core.CollectionType.List, zork.core.DynType.Struct, "Object", "", "", {}, "TextBox"], [5, "aliasName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [6, "isRightProtocol", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [7, "operationProtocolName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [8, "isOperationProtocol", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [9, "resultStructName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [10, "resultType", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [11, "resultCollectionType", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [12, "parameters", zork.core.CollectionType.List, zork.core.DynType.Struct, "Object", "", "", {}, "TextBox"], [13, "scriptType", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [14, "body", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [15, "displayName", zork.core.CollectionType.None, zork.core.DynType.String, "", "描述", "", {}, "TextBox"], [16, "description", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [17, "name", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            isAsync: null,
            logType: null,
            methodID: null,
            classID: null,
            attributes: null,
            aliasName: null,
            isRightProtocol: null,
            operationProtocolName: null,
            isOperationProtocol: null,
            resultStructName: null,
            resultType: null,
            resultCollectionType: null,
            parameters: null,
            scriptType: null,
            body: null,
            displayName: null,
            description: null,
            name: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        isAsync: properties.isAsync,
        logType: properties.logType,
        methodID: properties.methodID,
        classID: properties.classID,
        attributes: properties.attributes,
        aliasName: properties.aliasName,
        isRightProtocol: properties.isRightProtocol,
        operationProtocolName: properties.operationProtocolName,
        isOperationProtocol: properties.isOperationProtocol,
        resultStructName: properties.resultStructName,
        resultType: properties.resultType,
        resultCollectionType: properties.resultCollectionType,
        parameters: properties.parameters,
        scriptType: properties.scriptType,
        body: properties.body,
        displayName: properties.displayName,
        description: properties.description,
        name: properties.name,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
MethodEntityClass.validateBind = function () {

}
parent.MethodEntityClass = MethodEntityClass;


var MethodParameterClass = function () {
    var className = "MethodParameter";
    var displayName = "";
    var nameSpace = "Zork.EntityClass.Entity";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "structName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [1, "type", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [2, "collectionType", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [3, "parameterName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            structName: null,
            type: null,
            collectionType: null,
            parameterName: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        structName: properties.structName,
        type: properties.type,
        collectionType: properties.collectionType,
        parameterName: properties.parameterName,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
MethodParameterClass.validateBind = function () {

}
parent.MethodParameterClass = MethodParameterClass;


var PropertyEntityClass = function () {
    var className = "PropertyEntity";
    var displayName = "";
    var nameSpace = "Zork.EntityClass.Entity";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "isLoad", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [1, "acceptStringErrorText", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [2, "regularStringErrorText", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [3, "maxLengthErrorText", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [4, "minLengthErrorText", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [5, "maxValueErrorText", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [6, "minValueErrorText", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [7, "typeVerificationSourceErrorText", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [8, "isNeedInputErrorText", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [9, "relationType", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [10, "relationPropetyName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [11, "relationClassID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [12, "classID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [13, "attributes", zork.core.CollectionType.List, zork.core.DynType.Struct, "Object", "", "", {}, "TextBox"], [14, "propertyID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [15, "showMaxLength", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [16, "showMinLength", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [17, "manifestation", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [18, "acceptString", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [19, "regularString", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [20, "maxLength", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [21, "minLength", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [22, "maxValue", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [23, "minValue", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [24, "typeVerificationSource", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [25, "isNeedInput", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [26, "dataMemberFieldName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [27, "isAsDataMember", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [28, "entityTypeLength", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [29, "entityType", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [30, "isNullable", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [31, "isEncryption", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [32, "isPrimarykey", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [33, "entityFieldName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [34, "isNeedSave", zork.core.CollectionType.None, zork.core.DynType.Bool, "", "", "", {}, "TextBox"], [35, "defaultValue", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [36, "structName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [37, "type", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [38, "collectionType", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [39, "description", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [40, "displayName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [41, "name", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            isLoad: null,
            acceptStringErrorText: null,
            regularStringErrorText: null,
            maxLengthErrorText: null,
            minLengthErrorText: null,
            maxValueErrorText: null,
            minValueErrorText: null,
            typeVerificationSourceErrorText: null,
            isNeedInputErrorText: null,
            relationType: null,
            relationPropetyName: null,
            relationClassID: null,
            classID: null,
            attributes: null,
            propertyID: null,
            showMaxLength: null,
            showMinLength: null,
            manifestation: null,
            acceptString: null,
            regularString: null,
            maxLength: null,
            minLength: null,
            maxValue: null,
            minValue: null,
            typeVerificationSource: null,
            isNeedInput: null,
            dataMemberFieldName: null,
            isAsDataMember: null,
            entityTypeLength: null,
            entityType: null,
            isNullable: null,
            isEncryption: null,
            isPrimarykey: null,
            entityFieldName: null,
            isNeedSave: null,
            defaultValue: null,
            structName: null,
            type: null,
            collectionType: null,
            description: null,
            displayName: null,
            name: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        isLoad: properties.isLoad,
        acceptStringErrorText: properties.acceptStringErrorText,
        regularStringErrorText: properties.regularStringErrorText,
        maxLengthErrorText: properties.maxLengthErrorText,
        minLengthErrorText: properties.minLengthErrorText,
        maxValueErrorText: properties.maxValueErrorText,
        minValueErrorText: properties.minValueErrorText,
        typeVerificationSourceErrorText: properties.typeVerificationSourceErrorText,
        isNeedInputErrorText: properties.isNeedInputErrorText,
        relationType: properties.relationType,
        relationPropetyName: properties.relationPropetyName,
        relationClassID: properties.relationClassID,
        classID: properties.classID,
        attributes: properties.attributes,
        propertyID: properties.propertyID,
        showMaxLength: properties.showMaxLength,
        showMinLength: properties.showMinLength,
        manifestation: properties.manifestation,
        acceptString: properties.acceptString,
        regularString: properties.regularString,
        maxLength: properties.maxLength,
        minLength: properties.minLength,
        maxValue: properties.maxValue,
        minValue: properties.minValue,
        typeVerificationSource: properties.typeVerificationSource,
        isNeedInput: properties.isNeedInput,
        dataMemberFieldName: properties.dataMemberFieldName,
        isAsDataMember: properties.isAsDataMember,
        entityTypeLength: properties.entityTypeLength,
        entityType: properties.entityType,
        isNullable: properties.isNullable,
        isEncryption: properties.isEncryption,
        isPrimarykey: properties.isPrimarykey,
        entityFieldName: properties.entityFieldName,
        isNeedSave: properties.isNeedSave,
        defaultValue: properties.defaultValue,
        structName: properties.structName,
        type: properties.type,
        collectionType: properties.collectionType,
        description: properties.description,
        displayName: properties.displayName,
        name: properties.name,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
PropertyEntityClass.validateBind = function () {

}
parent.PropertyEntityClass = PropertyEntityClass;


var BindTreeViewClassClass = function () {
    var className = "BindTreeViewClass";
    var displayName = "";
    var nameSpace = "Zork.EntityClass.Entity";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "name", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [1, "iD", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            name: null,
            iD: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        name: properties.name,
        iD: properties.iD,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
BindTreeViewClassClass.validateBind = function () {

}
parent.BindTreeViewClassClass = BindTreeViewClassClass;


var LoggingEnableClass = function () {
    var className = "LoggingEnable";
    var displayName = "";
    var nameSpace = "Zork.Attribute.Log";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "type", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            type: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        type: properties.type,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
LoggingEnableClass.validateBind = function () {

}
parent.LoggingEnableClass = LoggingEnableClass;


var c12222Class = function () {
    var className = "c12222";
    var displayName = "";
    var nameSpace = "Zork.Schedule.Entities";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "c12222Name", zork.core.CollectionType.None, zork.core.DynType.String, "", "自动主键", "", {}, "TextBox"], [1, "c12222ID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "自动主键", "", {}, "TextBox"], [2, "pks", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"], [3, "state", zork.core.CollectionType.None, zork.core.DynType.String, "", "状态机状态", "状态", { required: { errorText: "状态的值必须输入" } }, "Combox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        if (!$("#combostate").validate("required", "状态的不可为空标记特性验证失败", null)) {
            return false;
        }
        return isOk;
    }

    function createInstance() {
        return {
            c12222Name: null,
            c12222ID: null,
            pks: null,
            state: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        c12222Name: properties.c12222Name,
        c12222ID: properties.c12222ID,
        pks: properties.pks,
        state: properties.state,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
c12222Class.validateBind = function () {
    $("#combostate").blur(function () {
        if (!$("#combostate").validate("required", "状态的不可为空标记特性验证失败", null)) {
            return false;
        }
        return true;
    });

}
parent.c12222Class = c12222Class;


var AssociationClassClass = function () {
    var className = "AssociationClass";
    var displayName = "";
    var nameSpace = "Zork.EntityClass.Entity";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "aliasName", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [1, "associationID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            aliasName: null,
            associationID: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        aliasName: properties.aliasName,
        associationID: properties.associationID,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
AssociationClassClass.validateBind = function () {

}
parent.AssociationClassClass = AssociationClassClass;


var CustomerClass = function () {
    var className = "Customer";
    var displayName = "";
    var nameSpace = "Zork.Schedule.Entities";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "address", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [1, "name", zork.core.CollectionType.None, zork.core.DynType.String, "", "", "", {}, "TextBox"], [2, "iD", zork.core.CollectionType.None, zork.core.DynType.I32, "", "", "", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            address: null,
            name: null,
            iD: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        address: properties.address,
        name: properties.name,
        iD: properties.iD,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
CustomerClass.validateBind = function () {

}
parent.CustomerClass = CustomerClass;


var bClass = function () {
    var className = "b";
    var displayName = "sdfsdf";
    var nameSpace = "Zork.Schedule.Entities";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "aName", zork.core.CollectionType.None, zork.core.DynType.String, "", "自动主键", "aName", {}, "TextBox"], [1, "bID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "自动主键", "aID", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            aName: null,
            bID: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        aName: properties.aName,
        bID: properties.bID,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
bClass.validateBind = function () {

}
parent.bClass = bClass;


var REClass = function () {
    var className = "RE";
    var displayName = "SS";
    var nameSpace = "Zork.Attribute.Workflow";
    var properties = {};
    var methods = {};
    var propertyInfoAll = [[0, "rEName", zork.core.CollectionType.None, zork.core.DynType.String, "", "自动主键", "REName", {}, "TextBox"], [1, "rEID", zork.core.CollectionType.None, zork.core.DynType.I32, "", "自动主键", "REID", {}, "TextBox"]];
    var methodInfoAll = []

    for (var i = 0; i < propertyInfoAll.length; i++) {
        var propertyInfos = propertyInfoAll[i];
        var property = new zork.core.Property(propertyInfos[0], propertyInfos[1], propertyInfos[2], propertyInfos[3], propertyInfos[4]);
        property.displayName = propertyInfos[6];
        property.validate = propertyInfos[7];
        property.controlType = propertyInfos[8];
        properties[property.name] = property;
        properties[property.id] = property;
    }

    for (var i = 0; i < methodInfoAll.length; i++) {
        var methodInfos = methodInfoAll[i];
        var method = { name: methodInfos[0], displayName: methodInfos[1], params: methodInfos[2] }
        methods[method.name] = method;
    }


    function getMethods() {
        return methods;
    }


    function getProperties() {
        return properties;
    }

    function getProperty(nameOrId) {
        return properties[nameOrId];
    }

    function validateValue() {
        var isOk = true;
        return isOk;
    }

    function createInstance() {
        return {
            rEName: null,
            rEID: null,
            ValidateValue: validateValue,
            Class: this
        };
    }
    return {
        className: className,
        nameSpace: nameSpace,
        getProperties: getProperties,
        rEName: properties.rEName,
        rEID: properties.rEID,
        getProperty: getProperty,
        createInstance: createInstance,
        validateValue: validateValue,
        getMethods: getMethods
    };
}();
REClass.validateBind = function () {

}
parent.REClass = REClass;


