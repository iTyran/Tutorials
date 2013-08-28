// KeyMap.js

var KeyMap = cc.Layer.extend({
	_delegateJoypad: null,
	_delegateAttack: null,
	_pJoyKeyDown: false,
	_pJKeyDown: false,
	_pUKeyDown: false,
	_pIKeyDown: false,
	init:function(){
		this._super();
		this.scheduleUpdate();
		return true;
	},
	setDelegateJoypad:function(delegate){
		this._delegateJoypad = delegate;
	},
	setDelegateAttack:function(delegate){
		this._delegateAttack = delegate;
	},
	update:function(dt){
		this._super();

		// 控制杆键盘映射处理
		var au = false;
		var al = false;
		var ad = false;
		var ar = false;

		if ((AC.KEYS[cc.KEY.w] || AC.KEYS[cc.KEY.up])){
			au = true;
		}
		if ((AC.KEYS[cc.KEY.a] || AC.KEYS[cc.KEY.left])){
			al = true;
		}
		if ((AC.KEYS[cc.KEY.s] || AC.KEYS[cc.KEY.down])){
			ad = true;
		}
		if ((AC.KEYS[cc.KEY.d] || AC.KEYS[cc.KEY.right])){
			ar = true;
		}

		var newDegrees = -1;
		if (au && !al && !ad && !ar)
			newDegrees = 270;
		if (!au && al && !ad && !ar)
			newDegrees = 180;
		if (!au && !al && ad && !ar)
			newDegrees = 90;
		if (!au && !al && !ad && ar)
			newDegrees = 0;

		if (au && al && !ad && !ar)
			newDegrees = 225;
		if (!au && al && ad && !ar)
			newDegrees = 135;
		if (!au && !al && ad && ar)
			newDegrees = 45;
		if (au && !al && !ad && ar)
			newDegrees = -45;

		if (this._delegateJoypad){
			if (au || al || ad || ar){
				if (!this._pJoyKeyDown)
					this._delegateJoypad.keyStart(newDegrees);					
				this._pJoyKeyDown = true;
			}
			else if(this._pJoyKeyDown){
				this._pJoyKeyDown = false;
				this._delegateJoypad.keyEnded(newDegrees);
			}
			if (newDegrees != -1 && this._pJoyKeyDown){
				this._delegateJoypad.keyUpdate(newDegrees);
			}			
		}

		
		// 攻击按钮控制映射
		var keyJ = false;
		var keyU = false;
		var keyI = false;
		if (AC.KEYS[cc.KEY.j])
			keyJ = true;
		if (AC.KEYS[cc.KEY.u])
			keyU = true;
		if (AC.KEYS[cc.KEY.i])
			keyI = true;

		var pressJ = false;
		var pressU = false;
		var pressI = false;
		
		if (keyJ){
			if (!this._pJKeyDown){
				this._pJKeyDown = true;
				pressJ = true;
			}			
		}else{
			if (this._pJKeyDown){
				// 发送一个攻击键松开的操作
				this._delegateAttack.keyAttackUp(AT.ATTACK);
			}				
			this._pJKeyDown = false;
		}

		if (keyU){
			if (!this._pUKeyDown){
				this._pUKeyDown = true;
				pressU = true;
			}
		}else{
			this._pUKeyDown = false;
		}

		if (keyI){
			if (!this._pIKeyDown){
				this._pIKeyDown = true;
				pressI = true;
			}
		}else{
			this._pIKeyDown = false;
		}

		if (this._delegateAttack){
			if (pressJ)
				this._delegateAttack.keyAttack(AT.ATTACK);
			if (pressU)
				this._delegateAttack.keyAttack(AT.ATTACK_A);
			if (pressI)
				this._delegateAttack.keyAttack(AT.ATTACK_B);
		}

	}
});

KeyMap.create = function(){
	var km = new KeyMap();
	if (km && km.init())
		return km;
	return null;
};

