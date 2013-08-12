//
//  Leafsoar.h
//  jsb
//
//  Created by leafsoar on 8/1/13.
//
//

#ifndef jsb_Leafsoar_h
#define jsb_Leafsoar_h

#include "cocos2d.h"

namespace ls {
    class Leafsoar: public cocos2d::CCObject
    {
    public:
        static cocos2d::CCScene* scene();
        
        virtual bool init();
        CREATE_FUNC(Leafsoar);
        
        void functionTest();
    };
}

#endif
