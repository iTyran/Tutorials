// Joypad.js

var Joypad = cc.Layer.extend({
	_winSize: null,
	_pCenter: null,
	_pControlSprite: null,
	_pDefaultPoint: null,

	_pDefaultRotation: null,
	_pRotation: null,

	_pDelegate: null,
	_pKeyDown: false,
	ctor:function(){
		this._super();

		_winSize = cc.Director.getInstance().getWinSize();
		_pCenter = cc.p(_winSize.width / 2, _winSize.height / 2);

	},
	init:function(){
		var bRet = false;
		if (this._super()){
			cc.log("Joypad init ..");
			// 控制杆所在位置
			this._pDefaultPoint = cc.p(110, 110);
			// 默认旋转角度，以使开口正对右侧
			this._pDefaultRotation = 26;
			// 实际旋转角度
			this._pRotation = 0;

			this.setPosition(this._pDefaultPoint);			

			this.addChild(cc.Sprite.create(s_Joypad1));
			this.addChild(cc.Sprite.create(s_Joypad2));
			this._pControlSprite = cc.Sprite.create(s_Joypad3);
			this.addChild(this._pControlSprite);
			this.addChild(cc.Sprite.create(s_Joypad4));
			
			this.updateRotation();

			bRet = true;
		}
		return bRet;
	},
	keyStart:function(degrees){
		if (this._pDelegate)			
			this._pDelegate.actionJoypadStart(this._pRotation);
	},
	keyUpdate:function(degrees){
		this._pRotation = degrees;
		this.updateRotation();
		if (this._pDelegate)
			this._pDelegate.actionJoypadUpdate(this._pRotation);				
	},
	keyEnded:function(degrees){
		if (this._pDelegate)			
			this._pDelegate.actionJoypadEnded(this._pRotation);		
	},
	onEnter:function(){
		this._super();
		// cc.Director.getInstance().getTouchDispatcher().addTargetedDelegate(this, 0, true);
		// 2.1.5 to 2.1.6
		cc.registerTargetedDelegate(0, true, this);
	},
	onExit:function(){
		cc.unregisterTouchDelegate(this);
	},
	onTouchBegan:function (touch, event){
		// 点击点的范围判断
		var curPoint = touch.getLocation();
		if (curPoint.x > _winSize.width / 2 || curPoint.y > _winSize.height / 2 ){
			return false;
		}
		
		// var sp = cc.pSub(this._pDefaultPoint, curPoint);
		// var angle = cc.pToAngle(sp);
		
		this.updateTouchRotation(touch, event);
		this.updateRotation();
		if(this._pDelegate)
			this._pDelegate.actionJoypadStart(this._pRotation);
		else
			cc.log('_pDelegate is null ... ');

		// cc.log("Joypad touch ...");
		return true;
	},
	onTouchMoved:function (touch, event){
		this.updateTouchRotation(touch, event);
		this.updateRotation();

		if (this._pDelegate)
			this._pDelegate.actionJoypadUpdate(this._pRotation);
		else
			cc.log('_pDelegate is null ... ');
		
		// var a = cc.pAngleSigned( curPoint, this._pDefaultPoint);
		// cc.log("Joypad touch mvove ..." + rotation) ;
	},
	onTouchEnded:function (touch, event){
		this.updateTouchRotation(touch, event);
		this.updateRotation();
		if (this._pDelegate)
			this._pDelegate.actionJoypadEnded(this._pRotation);
		else
			cc.log('_pDelegate is null ... ');
	},
	updateTouchRotation:function(touch, event){
		var curPoint = touch.getLocation();
		var sp = cc.pSub(curPoint, this._pDefaultPoint);
		var angle = cc.pToAngle(sp) ;// * -57.29577951;
		var rotation = angle * -57.29577951;
		rotation = rotation < 0 ? 360 + rotation: rotation;
		this._pRotation = rotation;		
	},
	updateRotation:function(){
		this._pControlSprite.setRotation(this._pDefaultRotation + this._pRotation);
	},
	setDelegate:function(dg){
		this._pDelegate = dg;
	}
});

Joypad.create = function(){
	var joypad = new Joypad();
	if (joypad && joypad.init()){
		return joypad;
	}
	return null;
};



