
var GameLayer = cc.Layer.extend({
	mWinSize:null,	
	mPointCenter:null,
	mHero: null,
	mRobot: null,
	init:function(){
		cc.log("game layer init ...");
		var bRef = false;
		if(this._super()){
			mWinSize = cc.Director.getInstance().getWinSize();
			mPointCenter = cc.p(mWinSize.width / 2, mWinSize.height / 2);
			
			// 添加背景
			var backGround = cc.Sprite.create(s_BackGround);
			backGround.setPosition(mPointCenter);
			this.addChild(backGround);

			// 添加英雄
			this.mHero = Hero.create();

			// 添加机器人
			this.mRobot = Robot.create();

			var characters = cc.Node.create();
			characters.addChild(this.mHero);
			characters.addChild(this.mRobot);
			this.addChild(characters);

			// 添加控制层
			var hudLayer = HudLayer.create();
			this.addChild(hudLayer);
			hudLayer.setDelegate(this);

			if (sys["capabilities"].hasOwnProperty('keyboard'))
				this.setKeyboardEnabled(true);

			this.scheduleUpdate();


			// 骨骼动画测试
			this.test();
			
			bRef = true;
		}
		return bRef;
	},
	actionJoypadStart:function(degrees){
		this.mHero.runWithDegrees(degrees);
		// this.mRobot.runWithDegrees(degrees);
	},
	actionJoypadUpdate:function(degrees){
		this.mHero.moveWithDegrees(degrees);		
		// this.mRobot.moveWithDegrees(degrees);
	},
	actionJoypadEnded:function(degrees){
		this.mHero.idle();
		// this.mRobot.idle();		
	},
	attackButtonClick:function(button){
		this.mHero.attack(button);
		// this.mRobot.attack(button);
	},
	onKeyDown:function(e){
		// 保存所有的按键信息
		AC.KEYS[e] = true;
	},
	onKeyUp:function(e){
		AC.KEYS[e] = false;
	},
	update:function(dt){
		var b = this.mHero.getZLocation() > this.mRobot.getZLocation();
		this.mHero.setZOrder(b ? 0: 1);
		this.mRobot.setZOrder(b ? 1: 0) ;
	},
	test:function(){
		return;
		cc.ArmatureDataManager.getInstance().addArmatureFileInfo(
			s_Robot_png,
			s_Robot_plist,
			s_Robot_json);

		var armature = cc.Armature.create("Animation1");
		armature.getAnimation().PlayByIndex(0);
		armature.setAnchorPoint(cc.p(0.5, 0.5));
		armature.setPosition(cc.p(300, 300));
		this.addChild(armature);
		cc.log("armature add ");
		
	}
});
var ctx;

GameLayer.create = function(){
	var sg = new GameLayer();
	if (sg && sg.init()){
		return sg;
	}	
	return null;
};

GameLayer.scene = function(){
	var scene = cc.Scene.create();
	// var layer = new GameLayer();
	// layer.init();
	var layer = GameLayer.create();
	scene.addChild(layer);
	return scene;
};


