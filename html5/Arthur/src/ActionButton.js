// ActionButton.js

var ActionButton = cc.Node.extend({
	_sprite: null,
	_rect: null,
	_delegate: null,
	_attackType: null,

	_childObj: null,
	rect:function(){
		var size = this._sprite.getContentSize();
		return cc.rect(-size.width / 2, -size.height / 2, size.width, size.height);
	},
	setChindObj:function(obj){
		this._childObj = obj;
	},
	init:function(image){
		this._super();

		this._sprite = cc.Sprite.create(image);
		this.addChild(this._sprite);
		return true;
	},
	setDelegate:function(delegate){
		this._delegate = delegate;
	},
	setAttackType:function(at){
		this._attackType = at;
	},
	getAttackType:function(){
		return this._attackType;
	},
	onEnter:function(){
		this._super();
		// cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, 0, false);
		// 2.1.5 to 2.1.6		
		cc.registerTargetedDelegate(0, true, this);
	},
	onExit:function(){
		this._super();
		// cc.Director.getInstance().getTouchDispatcher().removeDelegate(this);
		cc.unregisterTouchDelegate(this);
	},
	containsTouchLocation:function(touch){
		return cc.rectContainsPoint(this.rect(), this.convertTouchToNodeSpace(touch));
	},
	onTouchBegan:function(touch, event){
		// 区域判断
		if (!this.containsTouchLocation(touch))
			return false;
		this.click();
		// 播放点击动画
		return true;
	},
	click:function(){
		if(this._delegate && this._childObj.isCanClick()){
			this._delegate.attackButtonClick(this.getAttackType());
			this.beganAnimation();			
		}
	},
	onTouchEnded:function(touch, event){
		this.endedAnimation();
	},
	beganAnimation:function(){
	},
	endedAnimation:function(){
	},
	isCanClick:function(){
		return true;
	}
});

var AttackButton = ActionButton.extend({
	_pt: null,
	_ac: null,

	_defaultScale: 0.35,
	_maxScale: 0.5,

	_inAction: null,
	_outAction: null,

	_timestamp: null,
	ctor:function(){
		this._super();
		this._pt= cc.Sprite.create(s_AttackO);
		this._pt.setScale(this._maxScale);
		this.setChindObj(this);

		// this.addChild(this._pt);

		var aScale = cc.ScaleTo.create(0.1, this._defaultScale);
		var aFadein = cc.FadeIn.create(0.1);
		this._inAction = cc.Spawn.create(aScale, aFadein);

		var oScale = cc.ScaleTo.create(.2, this._maxScale);
		var oFade = cc.FadeOut.create(0.2);
		this._outAction = cc.Spawn.create(oScale, oFade);
	},
	beganAnimation:function(){
		var timestamp = (new Date()).valueOf();		
		this._timestamp = timestamp;

		this.removeChild(this._pt);
		this.addChild(this._pt);
		this._pt.runAction(this._inAction);
		
	},	
	endedAnimation:function(){
		this._pt.stopAllActions();
		this._pt.runAction(this._outAction);
	},
	clickUp:function(){
		this.endedAnimation();
	},
	isCanClick:function(){
		var timestamp = (new Date()).valueOf();		
		return timestamp - this._timestamp > 600;
	}
});

var AttackEffect = ActionButton.extend({
	_pt: null,
	_ac: null,
	_isCanClick: true,
	ctor:function(){
		this._super();
		var h = cc.Sprite.create(s_AttackFreeze);
		this._pt = cc.ProgressTimer.create(h);
		this._pt.setType(cc.PROGRESS_TIMER_TYPE_RADIAL);
		this._pt.setReverseDirection(true);
		this._pt.setScale(0.43);

		var to = cc.ProgressTo.create(0, 99.999);
		var to1 = cc.ProgressTo.create(2, 0);
		var ac2 = cc.CallFunc.create(this.callBack, this);
		this._ac = cc.Sequence.create(to, to1, ac2);
		this.setChindObj(this);
	},
	beganAnimation:function(){
		this.removeChild(this._pt);
		this.addChild(this._pt);
		this._pt.runAction(this._ac);
		this._isCanClick = false;
	},
	endedAnimation:function(){
	},
	callBack:function(){
		// cc.log("call back");
		this._isCanClick = true;
	},
	isCanClick:function(){
		return this._isCanClick;
	}
});

AttackButton.initWithImage = function(image){
	var ab = new AttackButton();
	if (ab && ab.init(image)){
		return ab;
	}
	return null;
};

AttackEffect.initWithImage = function(image){
	var ae = new AttackEffect();
	if (ae && ae.init(image))
		return ae;
	return null;
};

