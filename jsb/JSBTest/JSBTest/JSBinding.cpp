//
//  JSBinding.cpp
//  JSBTest
//
//  Created by 郭 一鸣 on 13-8-7.
//
//

#include "JSBinding.h"

bool JSB::JSBinding::init(){
    bool bRef = false;
    do{
        cocos2d::CCLog("JSB init...");
        
        bRef = true;
    } while (0);
    
    return bRef;
}

void JSB::JSBinding::functionTest(){
    cocos2d::CCLog("Function test...");
    js_proxy_t* p = jsb_get_native_proxy(this);
    jsval retval;
    jsval v[] = {
        v[0] = UINT_TO_JSVAL(32),
        v[1] = UINT_TO_JSVAL(88)
    };
    
    ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(p->obj),
                                                          "callback", 2, v, &retval);
}
