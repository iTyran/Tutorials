//
//  JSBinding.h
//  JSBTest
//
//  Created by 郭 一鸣 on 13-8-7.
//
//

#ifndef __JSBTest__JSBinding__
#define __JSBTest__JSBinding__

#include <iostream>
#include "cocos2d.h"
#include "ScriptingCore.h"

namespace JSB {
    class JSBinding: public cocos2d::CCObject
    {
    public:
        static cocos2d::CCScene* scene();
        
        virtual bool init();
        CREATE_FUNC(JSBinding);
        
        void functionTest();
    };
}

#endif /* defined(__JSBTest__JSBinding__) */
