// HudLayer.js

var State = cc.Node.extend({
	_bloodSprite: null,
	_roleType: null,
	ctor:function(){
		this._super();
	},
	setBloodSprite:function(obj){
		this._bloodSprite = obj;
	},
	init:function(){
		var bRet = false;
		
		if(this._super()){
			cc.NotificationCenter.getInstance().addObserver(this, this.notifyChangeStatus, "status", null);

			bRet = true;
		}

		return bRet;
	},
	notifyChangeStatus:function(obj){
		if (obj.getRoleType() == this._roleType){
			cc.log("notify status ...");
			this.setBlood(obj.getBloodPercent());
		}
	},
	setBlood:function(value){
		// 显示血量百分比
		if (value < 0)
			value = 0;
		if (value > 1)
			value = 1;
		this._bloodSprite.setScaleX(value);
	},
	setRoleType:function(type){
		this._roleType = type;
	}
});

State.create = function(){
	var state = new State();
	if (state && state.init()){
		return state;
	}
	return null;
};

State.createHero = function(){
	var state = State.create();


	var s1 = cc.Sprite.create(s_HeroState1);
	var s2 = cc.Sprite.create(s_HeroState2);
	var s3 = cc.Sprite.create(s_HeroState3);
	var s4 = cc.Sprite.create(s_HeroState4);

	s1.setPosition(cc.p(-80, 3));
	s2.setPosition(cc.p(33, 15));
	
	s3.setPosition(cc.p(-45, -12));
	s3.setAnchorPoint(cc.p(0, 0));
	
	state.setBloodSprite(s3);
	
	state.addChild(s1);
	state.addChild(s2);
	state.addChild(s3);
	state.addChild(s4);
	state.setRoleType(AC.ROLE_HERO);

	var title = cc.LabelTTF.create("Lv7 一叶", "Tahoma", 14);
	title.setPosition(cc.p(-15, 30));
	state.addChild(title);

	
	return state;
};

State.createRobot = function(){
	var state = State.create();
	var s1 = cc.Sprite.create(s_RobotState1);
	var s2 = cc.Sprite.create(s_RobotState2);
	var s3 = cc.Sprite.create(s_RobotState3);
	var s4 = cc.Sprite.create(s_RobotState4);

	s1.setPosition(cc.p(50, -16));
	state.setBloodSprite(s1);
	s1.setAnchorPoint(cc.p(1, 0));

	// s1.ignoreAnchorPointForPosition(true);
	
	s2.setPosition(cc.p(-20, -7));
	s4.setPosition(cc.p(65, 1));

	state.setRoleType(AC.ROLE_ROBOT);	

	state.addChild(s2);
	state.addChild(s1);
	state.addChild(s3);
	state.addChild(s4);

	var title = cc.LabelTTF.create("Lv5 子龙山人", "Tahoma", 14);
	title.setPosition(cc.p(-15, 12));
	state.addChild(title);
	
	return state;
};

var HudLayer = cc.Layer.extend({
	_winSize: null,
	_pCenter: null,
	_delegate: null,

	mJoypad: null,
	mStateHero: null,
	mStateRobot: null,

	mAttack: null,
	mAttackA: null,
	mAttackB: null,
	ctor:function(){
		this._super();
		_winSize = cc.Director.getInstance().getWinSize();
		_pCenter = cc.p(_winSize.width / 2, _winSize.height / 2);
	},
	init:function(){
		cc.log("Hud layer init ..");
		var bRet = false;

		if(this._super()){

			// 添加控制器
			this.mJoypad = Joypad.create();
			this.addChild(this.mJoypad);

			var keyMap = KeyMap.create();
			keyMap.setDelegateJoypad(this.mJoypad);
			keyMap.setDelegateAttack(this);
			this.addChild(keyMap);

			// 添加攻击按钮

			this.mAttack = AttackButton.initWithImage(s_Attack);
			this.mAttack.setPosition(cc.p(mWinSize.width - 80,  80));
			this.mAttack.setDelegate(this);
			this.mAttack.setAttackType(AT.ATTACK);
			this.addChild(this.mAttack);

			// 添加特效攻击
			// var attackA = cc.Sprite.create(s_AttackA);
			this.mAttackA = AttackEffect.initWithImage(s_AttackA);
			this.mAttackA.setPosition(cc.p(mWinSize.width - 200, 60));
			this.mAttackA.setDelegate(this);
			this.mAttackA.setAttackType(AT.ATTACK_A);
			this.addChild(this.mAttackA);

			// var attackB = cc.Sprite.create(s_AttackB);
			this.mAttackB = AttackEffect.initWithImage(s_AttackB);		
			this.mAttackB.setPosition(cc.p(mWinSize.width - 165, 165));
			this.mAttackB.setDelegate(this);
			this.mAttackB.setAttackType(AT.ATTACK_B);
			this.addChild(this.mAttackB);

			// 添加 Hero 血条状态
			this.mStateHero = State.createHero();
			this.mStateHero.setPosition(cc.p(130, _winSize.height - 55));
			this.addChild(this.mStateHero);

			// 怪物血条
			this.mStateRobot = State.createRobot();
			this.mStateRobot.setPosition(cc.p(800 - 100, _winSize.height - 35));
			this.addChild(this.mStateRobot);

			bRet = true;
		}
		return bRet;
	},
	setDelegate: function(delegate){
		this._delegate = delegate;
		this.mJoypad.setDelegate(delegate);
	},
	
	attackButtonClick:function(button){
		if (this._delegate){
			this._delegate.attackButtonClick(button);
		}
	},
	keyAttack:function(btnType){
		if (btnType == AT.ATTACK_A && this.mAttackA.isCanClick())
			this.mAttackA.click();
		if (btnType == AT.ATTACK_B && this.mAttackB.isCanClick())
			this.mAttackB.click();
		if (btnType == AT.ATTACK && this.mAttack.isCanClick())
			this.mAttack.click();
		
		// this.attackButtonClick(bunType);
	},
	keyAttackUp:function(btnType){
		if (btnType == AT.ATTACK) //  && this.mAttack.isCanClick())
			this.mAttack.clickUp();		
	}
});

HudLayer.create = function(){
	var hudlayer = new HudLayer();
	if (hudlayer && hudlayer.init()){
		return hudlayer;
	}
	return null;
};


