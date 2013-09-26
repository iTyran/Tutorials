// Character.js

var ActionSprite = cc.Node.extend({
	_sprite: null,
	_state: null,
	
	_isRun: false,
	_RunDegrees: 0,
	_speed: 300,

	_actionStand: null,
	_actionRunning: null,
	_actionAttack: null,
	_actionAttackJump: null,
	_actionAttackT: null,

	_zLocation: null,		// 脚下所占的位置，y 坐标，用以判断 前后层次关系
	_flipX: false,
	_imageflipX: false,		// 默认图片是否面向右
	_attackRangt: 150,		// 打击距离

	_obj: null,
	_blood: 100,
	_bloodMax: 100,
	_lossBlood: null,
	_roleType: null,

	init:function(obj){
		var bRet = false;
		if (this._super()){
			this._obj = obj;

			this.scheduleUpdate();

			cc.NotificationCenter.getInstance().addObserver(this, this.acceptAttack, "attack", null);

			bRet = true;
		}
		cc.log("action sprite init ...");
		return bRet;
	},
	acceptAttack:function(obj){
		if (this != obj){
			// 同一水平高度
			if (Math.abs(this.getZLocation() - obj.getZLocation()) < 30){
			cc.log("accept attack ..." + obj._attackRangt);
				
				// 距离
				var value = this.getPosition().x - obj.getPosition().x;
				if (!obj.isFlip() && value >= 0 && value < obj._attackRangt){
					this.blood();
				}else if(obj.isFlip() && value <= 0 && -value < obj._attackRangt){
					this.blood();
				}
				// cc.log("value: " + value);
			}
		}
	},
	isFlip:function(){
		// return this._imageflipX ? !this._flipX: this._flipX;
		return this._flipX;
	},
	setSprite:function(image, pos){
		this._sprite = cc.Sprite.create(image);
		this.addChild(this._sprite);
		this.setPosition(pos);		
	},
	runWithDegrees:function(degrees){
		this._isRun = true;
		this._RunDegrees = degrees;
		// var x = Math.sin(this._RunDegrees * (2 * 3.14 / 360)) * 1;
		this.hRunning();
		// cc.log("klt:" + this._isRun);
	},
	moveWithDegrees:function(degrees){
		this._RunDegrees = degrees;
	},
	idle:function(){
		this._isRun = false;
		if (!this.isAttack())
			this.hStand();			
	},
	update:function(dt){
		// 打斗时是不能够跑动的
		if (this._isRun && !this.isAttack()){
			
			var x = Math.sin(this._RunDegrees * 2 * Math.PI / 360) * this._speed * dt;
			var y = Math.cos(this._RunDegrees * 2 * Math.PI / 360) * this._speed * dt;

			var p = cc.p(-y, x);
			if (y < 0){
				if (!this._flipX)
					this._sprite.runAction(cc.ScaleTo.create(0, this._imageflipX ? 1:-1, 1));
				
				this._flipX = true;
				// this._sprite.setFlippedX(!this._imageflipX);

			}
			if (y > 0){
				if (this._flipX)
					this._sprite.runAction(cc.ScaleTo.create(0, this._imageflipX ? -1:1, 1));					
				// this._sprite.setFlippedX(this._imageflipX);
				this._flipX = false;
			}
			
			this.setPosition(cc.pSub(this.getPosition(), p));
		}
		this.checkLocation();
		this.ai();	
	},
	ai:function(){
		
	},
	checkLocation:function(){
		
		// 检测当前位置，超出范围控制
		var curPoint = this.getPosition();
		var newPoint = this.getPosition();
		if (curPoint.x < 60)
			newPoint.x = 60;
		if (curPoint.y < 120)
			newPoint.y = 120;
		if (curPoint.x > _winSize.width - 60)
			newPoint.x = _winSize.width - 60;
		if (curPoint.y > _winSize.height / 2 + 80)
			newPoint.y = _winSize.height / 2 + 80;
		this.setPosition(newPoint);
	},
	hStand:function(){
		this._sprite.stopAllActions();
		this._sprite.runAction(this._actionStand);
		this._state = AC.STATE_HERO_STAND;
	},
	hRunning:function(){
		this._sprite.stopAllActions();
		this._sprite.runAction(this._actionRunning);
		this._state = AC.STATE_HERO_RUNNING;		
	},
	isAttack:function(){
		return this._state == AC.STATE_HERO_ATTACK;
	},
	setZLocatoin:function(zl){
		this._zLocation = zl;
		// test
		// var sprite = cc.Sprite.create(s_HeroState2);
		// sprite.setPosition(cc.p(0, zl));
		// this.addChild(sprite);
	},
	getZLocation:function(){
		return this.getPosition().y + this._zLocation;
	},
	
	blood:function(){		// 掉血
		var lb = 30;
		this._blood -= lb;
		this.removeChild(this._lossBlood);
		this._lossBlood = cc.LabelTTF.create("-" + lb, AC.FONT, 20);
		this._lossBlood.setPosition(cc.p(0, -this._zLocation));
		this.addChild(this._lossBlood);

		var fadeIn = cc.FadeIn.create(0.8);
		var fadeOut = cc.FadeOut.create(1);
		var mu = cc.MoveTo.create(1, cc.p(0, 30 + -this._zLocation));
		var a = cc.Spawn.create(fadeIn,fadeOut, mu);
		// this._lossBlood.runAction(cc.Sequence.create(cc.DelayTime.create(0.5), a));
		this._lossBlood.runAction(a);

		// 控制掉血，发送一个掉血的消息
		cc.NotificationCenter.getInstance().postNotification("status", this);		
	},
	postAttack:function(){
		this.setAttackRect();
		cc.NotificationCenter.getInstance().postNotification("attack", this);		
	},
	setAttackRect:function(){		// 设置打击范围
		// cc.log("set attack rect ...");
		
		var point = this.getPosition();
		var attackWidth = 100;
		
		var newPoint = this._flipX ? cc.pSub(point, cc.p(100, 0)) : point;
		this._attackRect = cc.rect(point.x - 100 * 2, point.y, 100, 5);
		
		// var tagLayer = 10001;
		// var layer = cc.LayerColor.create(cc.c4b(0, 200, 200, 64), 100, 5);
		// layer.setPosition(newPoint);
		// this.getParent().removeChildByTag(tagLayer);
		// this.getParent().addChild(layer, 0, tagLayer);
	},
	getBloodPercent:function(){
		var p = this._blood / this._bloodMax;
		cc.log("k" + p);
		return p;
	},
	setRoleType:function(type){
		this._roleType = type;
	},
	getRoleType:function(){
		return this._roleType;
	}
});

var Hero = ActionSprite.extend({

	init:function(){
		var bRet = false;
		if (this._super()){
			
			this.setSprite(s_Hero1, cc.p(300, 300));
			this.setZLocatoin(-80);
			this.initAction();
			this.hStand();
			this.setRoleType(AC.ROLE_HERO);
			bRet = true;
		}		
		return bRet;
	},
	initAction:function(){
		// stand action
		var sa = cc.Animation.create();
		for (var si = 1; si < 4; si++){
			var frameName1 = "res/Hero" + si + ".png";
			sa.addSpriteFrameWithFile(frameName1);
		}
		sa.setDelayPerUnit(5.8 / 14);
		sa.setRestoreOriginalFrame(true);
		this._actionStand = cc.RepeatForever.create(cc.Animate.create(sa));
		
		// running action
		var animation = cc.Animation.create();
		for (var i = 1; i < 12; i++){
			var frameName = "res/HeroRun" + i + ".png";
			animation.addSpriteFrameWithFile(frameName);
		}
		animation.setDelayPerUnit(2.8 / 14);
		animation.setRestoreOriginalFrame(true);
		this._actionRunning = cc.RepeatForever.create(cc.Animate.create(animation));

		
		// 普通攻击
		var anAttack = cc.Animation.create();
		for (var attackIndex = 1; attackIndex < 6; attackIndex ++){
			var attackFrame = "res/HeroAttack" + attackIndex + ".png";
			anAttack.addSpriteFrameWithFile(attackFrame);
		}
		anAttack.setDelayPerUnit(1.8 / 14);
		// anAttack.setRestoreOriginalFrame(false);
		this._actionAttack = cc.Animate.create(anAttack);

		// 跳跃攻击
		var jmpAttack = cc.Animation.create();
		for (var ji = 1; ji < 9; ji ++){
			var jiFrame = "res/HeroAttackJ" + ji + ".png";
			jmpAttack.addSpriteFrameWithFile(jiFrame);
		}
		jmpAttack.setDelayPerUnit(0.1);
		// jmpAttack.setRestoreOriginalFrame(false)
		this._actionAttackJump = cc.Animate.create(jmpAttack);
		
		// 突刺攻击
		var tAttack = cc.Animation.create();
		for (var ti = 1; ti < 4; ti ++){
			var tiFrame = "res/HeroAttackT" + ti + ".png";
			tAttack.addSpriteFrameWithFile(tiFrame);
		}
		tAttack.setDelayPerUnit(0.1);
		this._actionAttackT = cc.Animate.create(tAttack);
	},
	hAttack:function(at){
		var aa = null;
		if (at == AT.ATTACK){
			aa = this._actionAttack;
			this._attackRangt = 150;			
		}else if (at == AT.ATTACK_A){
			aa = this._actionAttackJump;
			// 当前位置跳跃
			var jump = cc.JumpTo.create(
				0.6, cc.pSub(this.getPosition(), cc.p(this._flipX ? 200: -200)), 120, 1);
			this.runAction(jump);
			this._attackRangt = 300;
		}else if (at == AT.ATTACK_B){
			aa = this._actionAttackT;
			// 当前位置移动
			var move = cc.MoveTo.create(0.3, cc.pSub(this.getPosition(), cc.p(
					this._flipX ? 200:-200, 0)));
			this.runAction(move);
			this._attackRangt = 300;			
		}
			
		if (aa){
			this._sprite.stopAllActions();
			var action = cc.Sequence.create(
				aa,
				cc.CallFunc.create(this.callBackEndAttack, this));
			this._sprite.runAction(action);
			this._state = AC.STATE_HERO_ATTACK;
			this.postAttack();
		}
	},
	attack:function(at){
		this.hAttack(at);
	},
	callBackEndAttack:function(){
		if (this._isRun){
			this.hRunning();
		}else{
			this.hStand();
		}
	}
});

Hero.create = function(){
	var hero = new Hero();
	if (hero && hero.init(hero)){
		return hero;
	}
	return null;
};


var Robot = ActionSprite.extend({
	_armture:null,
	
	init:function(){
		var bRet = false;
		if (this._super()){

			cc.ArmatureDataManager.getInstance().addArmatureFileInfo(
				s_Robot_png,
				s_Robot_plist,
				s_Robot_json);
			
			this._armature = cc.Armature.create("NewProject");
			this.setSprite(this._armature, cc.p(500, 300));
			this.setZLocatoin(-90);
			this.hStand();

			this.runWithDegrees(180);

			this.setRoleType(AC.ROLE_ROBOT);
			this._imageflipX = true;
			bRet = true;
			this._speed = 150;
		}		
		return bRet;
	},
	setSprite:function(armature, pos){
		this._sprite = armature;
		this.addChild(this._sprite);
		this.setPosition(pos);		
	},	
	hAttack:function(at){
		this._attackRangt = 150;					
		this._sprite.stopAllActions();
		this._sprite.getAnimation().play("attack");
		this._sprite.getAnimation().setMovementEventCallFunc(this.callBackEndAttack,this);
		this._state = AC.STATE_HERO_ATTACK;
		this.postAttack();
	},
	hStand:function(){
		this._sprite.getAnimation().play("stand");
		this._state = AC.STATE_HERO_STAND;
	},
	hRunning:function(){
		this._sprite.getAnimation().play("run");
		this._state = AC.STATE_HERO_RUNNING;		
	},
	attack:function(button){
		this.hAttack(button);
	},
	callBackEndAttack:function(armature, movementType, movementID){
		if (movementType == CC_MovementEventType_LOOP_COMPLETE) {
			if (this._isRun){
				this.hRunning();
			}else{
				this.hStand();
			}
		}
	},
	_timestamp: (new Date()).valueOf(),
	_attackIndex: 0,
	_moveIndex: 0,
	ai:function(){
		var newTs = (new Date()).valueOf();
		var value = newTs - this._timestamp;

		if (this._moveIndex < value / 3000){
			this._moveIndex += 1;
			var r = Math.random() * 360;
			this.moveWithDegrees(r);
		}
		if (this._attackIndex < value / 6000){
			this._attackIndex += 1;
			this.attack();
		}

	}
});

Robot.create = function(){
	var robot = new Robot();
	if (robot && robot.init(robot)){
		return robot;
	}
	return null;
};

