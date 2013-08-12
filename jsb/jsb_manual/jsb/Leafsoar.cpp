//
//  Leafsoar.cpp
//  jsb
//
//  Created by leafsoar on 8/1/13.
//
//

#include "ScriptingCore.h"
#include "jsapi.h"
#include "Leafsoar.h"

bool ls::Leafsoar::init(){
    bool bRef = false;
    
    do {
        cocos2d::CCLog("leafsoar init ...");
        
        bRef = true;
    } while (0);
    return bRef;
}

void ls::Leafsoar::functionTest(){
    cocos2d::CCLog("function Test");
    js_proxy_t * p = jsb_get_native_proxy(this);
    jsval retval;
    JSContext* jc = ScriptingCore::getInstance()->getGlobalContext();
    
    jsval v[] = {
        v[0] = int32_to_jsval(jc, 32),
        v[1] =UINT_TO_JSVAL(88)
    };

    
    ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(p->obj), "callback", 2, v, &retval);
    
}