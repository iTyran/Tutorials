//
//  JSB_AUTO.cpp
//  JSBTest
//
//  Created by 郭 一鸣 on 13-8-7.
//
//

#include "JSB_AUTO.h"
#include "cocos2d.h"
#include "cocos2d_specifics.hpp"

// Binding specific object
JSClass*        jsb_class;
JSObject*       jsb_prototype;


JSBool js_functionTest(JSContext* cx, uint32_t argc, jsval* vp){
    JSBool ok = JS_TRUE;
    JSObject* obj = NULL;
    JSB::JSBinding* cobj = NULL;
    obj = JS_THIS_OBJECT(cx, vp);
    js_proxy_t* proxy = jsb_get_js_proxy(obj);
    cobj = (JSB::JSBinding* )(proxy ? proxy->ptr : NULL);
    JSB_PRECONDITION2(cobj, cx, JS_FALSE, "Invalid Native Object");
    
    if (argc == 0) {
        cobj->functionTest();
        JS_SET_RVAL(cx, vp, JSVAL_VOID);
        return ok;
    }
    JS_ReportError(cx, "Wrong number of arguments");
    return JS_FALSE;
}

JSBool js_constructor(JSContext* cx, uint32_t argc, jsval* vp){
    cocos2d::CCLog("JS Constructor...");
    if (argc == 0) {
        JSB::JSBinding* cobj = new JSB::JSBinding();
        cocos2d::CCObject* ccobj = dynamic_cast<cocos2d::CCObject*>(cobj);
        
        if (ccobj) {
            ccobj->autorelease();
        }
        TypeTest<JSB::JSBinding> t;
        js_type_class_t* typeClass;
        uint32_t typeId = t.s_id();
        HASH_FIND_INT(_js_global_type_ht, &typeId, typeClass);
        assert(typeClass);
        JSObject* obj = JS_NewObject(cx, typeClass->jsclass, typeClass->proto, typeClass->parentProto);
        JS_SET_RVAL(cx, vp, OBJECT_TO_JSVAL(obj));
        
        js_proxy_t* p = jsb_new_proxy(cobj, obj);
        JS_AddNamedObjectRoot(cx, &p->obj, "JSB::JSBinding");
        
        return JS_TRUE;
    }
    
    JS_ReportError(cx, "Wrong number of arguments: %d, was expecting: %d", argc, 0);
    
    return JS_FALSE;
}

JSBool js_create(JSContext* cx, uint32_t argc, jsval* vp){
    cocos2d::CCLog("js is creating...");
    if (argc == 0) {
        JSB::JSBinding* ret = JSB::JSBinding::create();
        jsval jsret;
        do{
            if (ret) {
                js_proxy_t* proxy = js_get_or_create_proxy<JSB::JSBinding>(cx, ret);
                jsret = OBJECT_TO_JSVAL(proxy->obj);
            }
            else{
                jsret = JSVAL_NULL;
            }
        } while(0);
        JS_SET_RVAL(cx, vp, jsret);
        
        return JS_FALSE;
    }
    
    JS_ReportError(cx, "Wrong number of arguments");
    
    return JS_FALSE;
}

void js_finalize(JSFreeOp* fop, JSObject* obj){
    CCLOGINFO("JSBindings: finallizing JS object %p JSB", obj);
}

void js_register(JSContext* cx, JSObject* global){
    jsb_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_class->name = "JSBinding";
    jsb_class->addProperty = JS_PropertyStub;
    jsb_class->delProperty = JS_PropertyStub;
    jsb_class->getProperty = JS_PropertyStub;
    jsb_class->setProperty = JS_StrictPropertyStub;
    jsb_class->enumerate = JS_EnumerateStub;
    jsb_class->resolve = JS_ResolveStub;
    jsb_class->convert = JS_ConvertStub;
    jsb_class->finalize = js_finalize;
    jsb_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);
    
    static JSPropertySpec properties[] = {
        {0, 0, 0, JSOP_NULLWRAPPER, JSOP_NULLWRAPPER}
    };
    
    // Binding functionTest function
    
    static JSFunctionSpec funcs[] = {
        JS_FN("functionTest", js_functionTest, 1, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };
    
    // Binding create() function
    
    static JSFunctionSpec st_funcs[] = {
        JS_FN("create", js_create, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };
    
    // Binding create() function and prototype
    
    jsb_prototype = JS_InitClass(
                                 cx, global,
                                 NULL,
                                 jsb_class,
                                 js_constructor, 0,
                                 properties,
                                 funcs,
                                 NULL,
                                 st_funcs);
    JSBool found;
    JS_SetPropertyAttributes(cx, global, "JSB", JSPROP_ENUMERATE | JSPROP_READONLY, &found);
    
    TypeTest<JSB::JSBinding> t;
    js_type_class_t* p;
    uint32_t typeId = t.s_id();
    HASH_FIND_INT(_js_global_type_ht, &typeId, p);
    
    if (!p) {
        p = (js_type_class_t* )malloc(sizeof(js_type_class_t));
        p->type = typeId;
        p->jsclass = jsb_class;
        p->proto = jsb_prototype;
        p->parentProto = NULL;
        HASH_ADD_INT(_js_global_type_ht, type, p);
    }
}

JSBool JSB_cocos2dx_retain(JSContext* cx, uint32_t argc, jsval *vp){
    JSObject* thisObj = JS_THIS_OBJECT(cx, vp);
    
    if (thisObj) {
        js_proxy_t* proxy = jsb_get_js_proxy(thisObj);
        
        if (proxy) {
            ((CCObject* )proxy->ptr)->retain();
            CCLog("Retain succeed!");
            return JS_TRUE;
        }
    }
    
    JS_ReportError(cx, "Invaild native object");
    return JS_FALSE;
}

JSBool JSB_cocos2dx_release(JSContext* cx, uint32_t argc, jsval *vp){
    JSObject* thisObj = JS_THIS_OBJECT(cx, vp);
    
    if (thisObj) {
        js_proxy_t* proxy = jsb_get_js_proxy(thisObj);
        
        if (proxy) {
            ((CCObject* )proxy->ptr)->release();
            CCLog("Release succeed!");
            return JS_TRUE;
        }
    }
    
    JS_ReportError(cx, "Invaild native object");
    return JS_FALSE;
}

void register_all(JSContext* cx, JSObject* obj){
    jsval nsval;
    JSObject* ns;
    JS_GetProperty(cx, obj, "JS", &nsval);
    
    if (nsval == JSVAL_VOID) {
        ns = JS_NewObject(cx, NULL, NULL, NULL);
        nsval = OBJECT_TO_JSVAL(ns);
        JS_SetProperty(cx, obj, "JSB", &nsval);
    }
    else{
        JS_ValueToObject(cx, nsval, &ns);
    }
    obj = ns;
    js_register(cx, obj);
    
    JS_DefineFunction(cx, jsb_prototype, "retain", JSB_cocos2dx_retain, 0, JSPROP_READONLY | JSPROP_PERMANENT);
    JS_DefineFunction(cx, jsb_prototype, "release", JSB_cocos2dx_release, 0, JSPROP_READONLY | JSPROP_PERMANENT);
}
