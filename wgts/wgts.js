///////////////////////////////////////////////////////////////////////////////
// ux.wgt.DIV
/*
	innerHTML의 편집을 지원하므로

	wgt.setData/getData
		HTML
			(이 위젯은 주로 외부에서 직접 innerHTML하므로 필요는 없느나 기능은 제공함)
*/

var xa = {}

xa.styleMap = {
	title:true
	,visibility:true
	,font:true, fontSize:true
	,alpha:true
	,angle:true
	,dragX:true, dragY:true, dragInParent:true, dragContainParent:true
}

xa.scriptInfo = {
	wgtData:{HTML:{help:{ko:"String\nDIV의 'innerHTML'에 지정할 HTML입니다.",en:"String\nHTML string to be set as 'innerHTML'."}}}
}

xa.editor = {
	iconThumb:'DB/ux/imgs/wgts/thumbs/tag.png'
}

xa.properties = {
	attrs:{
		HTML:''
	}
}

xa.createAsCanvasObject = apn.widgets['apn.wgt.rect'].createAsCanvasObject; //%INFO ADD할 경우가 없으므로 사용되지 않는 함수임
xa.exeRenderTag = apn.widgets['apn.wgt.rect'].exeRenderTag;
xa.exeCreateTag = apn.widgets['apn.wgt.rect'].exeCreateTag;

xa.exeOnLoad = function(apx, oId)
{
	this._htmlSet(apx, oId);

	var _this = this;

	//	HTML set, <body> TAG 및 <head> TAG에 해당하는 HTML를 지정합니다.
	function onSetHTML(changeWgtId, value)
	{
		if (changeWgtId == oId){
			_this._htmlSet(apx, oId);
		}
	}
	apx.wgtListenProperty(oId, 'HTML', onSetHTML);
}

xa.exeOnScreenRefresh = function(apx, oId, opts)
{
	var tag = apx.wgtTag(oId);

	// Text가 있으면 다시 Set함. Virtical Align 경우 Font의 크기에 영향을 받음
	var text, refresh = true;

	if (opts && opts.font && opts.font != apx.wgtGetProperty(oId, 'apxFont', /*Resolve*/true)) refresh = false; // Font가 다르면 Skip

	if (refresh){
		apx.fireEvent('contentChange', 'font', oId, /*always*/true);
	}
}

xa._htmlSet = function(apx, oId)
{
	var html;

	if ((html = apx.wgtGetProperty(oId, 'HTML'))){
		if (!apx.sptExeIsPreview() || apn.Project.getScriptVer(apx.project) == 2){
			apx.wgtTag(oId).innerHTML = html;
		}
		else{
			apx.wgtTag(oId).innerHTML = 'This is supporeted with Aspen Scripting Ver2.';
		}
	}
}

xa.edtOnCheckContentChange = function(prj, pId, oId)
{
	return {font:'Font'};
}

xa.edtOnConfig = function(/*CEditor*/apd, oId)
{
	var buf = {HTML:apd.wgtGetProperty(oId, 'HTML')};
	var tagDlg;

	function onOK1()
	{
		eduLib.edtInputApplyAll(apd, tagDlg);
		apd.wgtSetProperty(oId, 'HTML', buf.HTML);
		//apd.wgtRefreshUI(oId);
	}

	if (tagDlg = apd.dlgDoModal(Math.ceil(bx.UX.width*0.8), 760, onOK1)){
		eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:'HTML', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'text', value:buf, key:'HTML', multiline:true, height:'600px', join:true});
	}
}

uxWgtDIV = xa;
///////////////////////////////////////////////////////////////////////////////
// ux.wgt.btnImage (W:edu.wgt.btnStateS 기본으로 함)
/*
	Image + Border + Text로 구성된 Button임
*/
var xa = apn.inheritWidget(apn.widgets['apn.wgt.image2']);
xa.exeFireStateEvent = true;

xa.styleMap = {
	title:true
	,visibility:true
	,strokeStyle:true, lineWidth:true, lineDash:true
	//,fillStyle:true
	,font:true, fontSize:true, fontStyle:true, fontItalic:true, fontBold:true, textMultiLine: true, fontUnderlined:true
	,text:true,	textAlign:true, textValign:true, textPadding:true
	,fontStrokeStyle:true, fontStrokeWidth:true
	,borderRadiusTopLeft:true, borderRadiusTopRight:true, borderRadiusBottomLeft:true, borderRadiusBottomRight:true
	,alpha:true
	,angle:true
	,mediaID:true
	,dragX:true, dragY:true, dragInParent:true, dragContainParent:true
	,csr:true
}
//xa.apnWgtImg2DOM2 = true;

xa.editor = {}; //%%INFO image2의 것이 있으면 무시하고 구성함. 이것을 image2의 정보를 사용할 정도로 관련성이 없는 위젯임.
xa.editor.iconThumb = 'DB/ux/imgs/wgts/thumbs/imageButton.png';

/*	Image를 set할 수 있도록 하기 위한 것이며, 일단 이 위젯이 직접적으로 사용되는
	''=normal, 'check', 'tab'
	에 대해서 지원함
*/
xa._txtSpt1 = {ko:"기본 상태 이미지 ID", en:"Image asset ID for normal state", ja:"基本状態の画像ID"};
xa._txtSpt2 = {ko:"선택 상태 이미지 ID", en:"Image asset ID for selected state", ja:"選択状態の画像ID"};

xa.scriptInfo = {
	wgtDataByParam:'selectType'
	,wgtData:{
		'':{
			/*	%%INFO
				undefined가 아닌 항목만 지정됩니다. 따라서 반복 호출도 가능합니다.
				또한, 교체 목적입니다. 위젯은 이미지 구성에 따라서 동작이 다르므로, 기존의 것을 교체하기 위한 목적입니다
			*/
			image:{help:"{normal:ID|undefined, pressed:ID|undefined, hover:ID|undefined}\n"+apn.CExe.GL(xa._txtSpt1), type:'so', value:{}}
			,imageDisabled:{help:"{normal:ID|undefined}\n"+apn.CExe.GL({ko:"비활성 상태 이미지 ID", en:"Image asset ID for disabled state", ja:"非アクティブの画像ID"}), type:'so', value:{}}
		}
		,tab:{
			image:{help:"{normal:ID|undefined, hover:ID|undefined}\n"+apn.CExe.GL(xa._txtSpt1), type:'so', value:{}}
			,imageSelected:{help:"{normal:ID|undefined}\n"+apn.CExe.GL(xa._txtSpt2), type:'so', value:{}}
		}
		,check:{
			image:{help:"{normal:ID|undefined, hover:ID|undefined}\n"+apn.CExe.GL({ko:"미선택 상태 이미지 ID", en:"Image asset ID for unchecked state", ja:"未選択状態の画像ID"}), type:'so', value:{}}
			,imageChecked:{help:"{normal:ID|undefined, hover:ID|undefined}\n"+apn.CExe.GL(xa._txtSpt2).replace('selected', 'checked'), type:'so', value:{}}
		}
	}
}

/*	2017/09/13
		btnV=2
		1. Setup된 Text color가 Border color에도 적용되도록 함
		2. 'btnType'값이 추가되어 'text'이면 Image를 사용하지 않고 Text로만 동작함
*/
xa.properties.state = 'normal';
xa.properties.attrs = xa.properties.attrs || {};
xa.properties.attrs.selectType = '';
xa.properties.attrs.btnV = 2;
xa.properties.attrs.autoKeepSize = false;
xa.properties.attrs.cfg = {
	images:{
		normal:{mediaID:undefined}, down:{mediaID:undefined}, hover:{mediaID:undefined} /*Normal*/
		,disabled:{mediaID:undefined}, disabledDown:{mediaID:undefined}, disabledHover:{mediaID:undefined} /*Disabled, Disabled-select*/
		,checked:{mediaID:undefined}, checkedD:{mediaID:undefined}, checkedH:{mediaID:undefined} /*Checked, down은 필요가 없으나 편의상 정의함. normal이 이것의 down이 되기 때문에*/
	}
	,clr:{disabled:null, down:null, hover:null}
	,ttip:'' // Tooltip
	,hvrSync:'' // Hover sync group - Button들이 Hover 상태를 고유하기 위한 기능. 양면책 편집에서 사용하며 Page간 통신을 위해 Context를 사용함.
};

/*	selectType='tab'
		Tab 등에서 사용하는 형태로, 한번 Select가 되면 스스로 OFF가 안되는 경우임 (즉 Toggle을 못하는 경우임)
		'disabled'상태를 Selected로 사용하고, Disabled이미지를 Hover, Down에 사용함. (단 Hover가 주어지면 그것을 사용함. 이러한 형태의 Tab도 가능함)
		Group Toggle 기능이 가능함
	selectType='toggle'
		Toggle 형태의 버튼임
		'disabled'상태를 Selected로 사용하고 disabledDown, disabledHover를 사용함
	selectType='check'
		Toggle의 경우, check이 되면 다시 돌아가지 못하지만,
		이것은 on/off check를 지원함
	selectType='simple';
		Disabled 상태를 쓰지 않는 것만 다름
*/
xa.onEdit = apn.widgets['apn.wgt.rect'].onEdit;

xa.exeCreateTag = function(viewer, canvas, objData, zx, zy, oId)/*Element*/
{
	var tag = apn.widgets['apn.wgt.rect'].exeCreateTag.call(this, viewer, canvas, objData, zx, zy, oId);

	tag.apnTapCsr = true; // Tap에 Interaction이 이미 있는 것과 같은 상태로 지정함. Cursor 처리를 위한 것임

	return tag;
}

xa.exeAssetPreload = function(apx, oId, onEnd)
{
	var cfg = apx.wgtGetProperty(oId, 'cfg');

	var imgs = {}, cnt = 0;

	for(var i in cfg.images){
		if (cfg.images[i].mediaID){
			imgs[i] = {url:apx.mediaURL(cfg.images[i].mediaID)};
			cnt ++;
		}
	}

	if (cnt){
		function onLoad(cntAll, cntSucc, cntErr)
		{
			onEnd();
		}
		new apn.CRscLoader().load(apx.project, imgs, onLoad);
	}
	else{
		onEnd();
	}
}

xa.exeOnLoad = function(apx, oId)
{
	var _this = this;
	var tag = apx.wgtTag(oId);

	function displayHover()
	{
		//	위젯간 SYNC에 의한 삭제 후 호출 가능성
		if (!apx.wgtTag(oId)) return;

		var state = 'hover';

		if (selectType == 'toggle'){
			if (apx.wgtGetProperty(oId, 'apxState') == 'disabled') state = 'disabledHover';
		}
		else if (selectType == 'check'){
			if (apx.wgtGetProperty(oId, 'apxState') == 'checked') state = 'checkedH';
		}
		else{
			if (apx.wgtGetProperty(oId, 'apxState') == 'disabled') return;
		}

		if (tag._images[state].mediaID) _this.exeAssetLoad(apx, tag, tag._images[state].mediaID);
		uxWgtBtnImage.setTextColor(apx, oId, state);
		if (_this.I_exeOnStateChange) _this.I_exeOnStateChange(apx, oId, state);
	}
	
	function displayOut()
	{
		//	위젯간 SYNC에 의한 삭제 후 호출 가능성
		if (!apx.wgtTag(oId)) return;

		if (tag._down){
			if (selectType == 'check'){
				var state = 'checkedD';
			}
			else{
				var state = 'down';
			}
		}
		else{
			var state = apx.wgtGetProperty(oId, 'apxState');
		}

		if (tag._images[state].mediaID) _this.exeAssetLoad(apx, tag, tag._images[state].mediaID);
		uxWgtBtnImage.setTextColor(apx, oId, state);
		if (_this.I_exeOnStateChange) _this.I_exeOnStateChange(apx, oId, state);
	}
	
	function displayPressed()
	{
		//	위젯간 SYNC에 의한 삭제 후 호출 가능성
		if (!apx.wgtTag(oId)) return;

		var state = 'down';

		if (selectType == 'toggle'){
			if (apx.wgtGetProperty(oId, 'apxState') == 'disabled') state = 'disabledDown';
		}
		else if (selectType == 'check'){
			//if (apx.wgtGetProperty(oId, 'apxState') == 'checked') state = 'checkedD';
		}
		else{
			if (apx.wgtGetProperty(oId, 'apxState') == 'disabled') return;
		}
		
		if (tag._images[state].mediaID) _this.exeAssetLoad(apx, tag, tag._images[state].mediaID);
		uxWgtBtnImage.setTextColor(apx, oId, state);
		if (_this.I_exeOnStateChange) _this.I_exeOnStateChange(apx, oId, state);
	}

	function displayNormal()
	{
		var state = apx.wgtGetProperty(oId, 'apxState');

		if (!tag._images[state]) state = 'normal'; // 하위 Class에서 Button의 상태외에 추가 상태를 사용하는 경우를 위해서, 모르는 State는 'normal'로 표시함

		if (tag._images[state].mediaID) _this.exeAssetLoad(apx, tag, tag._images[state].mediaID);
		uxWgtBtnImage.setTextColor(apx, oId, state);
		if (_this.I_exeOnStateChange) _this.I_exeOnStateChange(apx, oId, state);
	}

	var cfg = apx.wgtGetProperty(oId, 'cfg');
	var selectType = apx.wgtGetProperty(oId, 'selectType');

	var canHoverOut; // Hover sync 동작을 위해서 정의함
	var canPressed;

	//	ToopTip
	if (cfg.ttip){
		tag.title = cfg.ttip;
	}

	//	구버전
	if (!cfg.images.disabledDown) cfg.images.disabledDown = {mediaID:undefined};
	if (!cfg.images.disabledHover) cfg.images.disabledHover = {mediaID:undefined};
	if (!cfg.clr) cfg.clr = {disabled:null, down:null, hover:null};

	if (this.I_exeOnLoad_check && !this.I_exeOnLoad_check(apx, oId)) return;

	tag._images = bx.$cloneObject({}, cfg.images);
	tag._down = false;

	//	Tap Start로 동작하는 방식
	var useTapStart = false;

	if (apn.dbUI && apn.dbUI.system && apn.dbUI.system.exeEventStart == true){
		//	Tap Start가 우선하는 파일에서 Tap Start에 반응함
		var exeProp = apn.Project.getLayout(apx.project).property.CExe;

		if (exeProp && exeProp.event && exeProp.event.TS1 == 'Y'){
			useTapStart = true;
		}
	}

	if (selectType == 'tab' || selectType == 'toggle'){
		if (selectType == 'tab'){
			tag._images.down = tag._images.disabled;
			if (!tag._images.hover.mediaID) tag._images.hover = tag._images.disabled;
		}

		tag.apxOnEvent = function(apx, ev, sX, sY)/*Boolean*/
		{
			if (ev == (useTapStart ? 'tapStart':'click')){
				if (selectType == 'toggle'){
					if (apx.wgtGetProperty(oId, 'apxState') == 'normal'){
						apx.wgtSetProperty(oId, 'apxState', 'disabled'); // Selected
					}
					else{
						apx.wgtSetProperty(oId, 'apxState', 'normal');
					}
				}
				else{
					if (apx.wgtGetProperty(oId, 'apxState') == 'normal'){
						apx.wgtSetProperty(oId, 'apxState', 'disabled'); // Selected
					}
				}
				return true;
			}
		}
	}
	else if (selectType == 'check'){
		tag.apxOnEvent = function(apx, ev, sX, sY,v,v,sysEv)/*Boolean*/
		{
			if (ev == (useTapStart ? 'tapStart':'click')){
				if (apx.wgtGetProperty(oId, 'apxState') == 'normal'){
					apx.wgtSetProperty(oId, 'apxState', 'checked'); // Selected
				}
				else{
					apx.wgtSetProperty(oId, 'apxState', 'normal'); // Unselected
				}
				return true;
			}
		}
	}

	// Down(Pressed)
	if (!useTapStart){
		if (tag._images.down.mediaID || (cfg.clr && cfg.clr.down) || tag._images.disabledDown.mediaID || (cfg.clr && cfg.clr.disabledDown)){
			canPressed = true;

			tag.btnOnDown = function(tagThis)
			{
				if (selectType == 'toggle'){
					//NO-OP
				}
				else if (selectType == 'check'){
					//NO-OP
				}
				else{
					if (apx.wgtGetProperty(oId, 'apxState') == 'disabled') return;
				}

				if (tag._down) return;

				tag._down = true;

				displayPressed();

				//	Pressed 상태를 Broadcast
				if (cfg.hvrSync){
					apx.ctxSet('uxWgtBtnImage_'+cfg.hvrSync, {oId:oId,state:/*pressed*/2});
				}
			}
		}
	}

	tag.btnOnState = function(tagThis)
	{
		displayNormal();
	}

	if (!useTapStart){
		if (tag._images.hover.mediaID || (cfg.clr && cfg.clr.hover) || tag._images.disabledHover.mediaID || (cfg.clr && cfg.clr.disabledHover) || (cfg.clr && cfg.clr.checkedH)){
			canHoverOut = true;
			
			if (!bx.HCL.DV.hasTouchEvent()){ // Mouse/Touch 이중으로 Event가 오는 기기에서 오동작 방지
				/*	%%INFO
					MouseMove의 처리에서 IE/Chrome이 다음과 같은 차이가 있다.
					Chrome의 경우, Tag가 움직여도 Mouse가 그대로 있으면 move가 오지 않지만
					IE는 move가 온다.
					이것으로 인하여 미세한 동작 차이가 발생하지만, 일단 이러한 차이는 무시하기로 한다
				*/
				tag.onmousemove = function(ev)
				{
					//	Pass면 처리하지 않음
					if (tag.apnPassPointerEvent) return false;
					if (tag.apnBlockPointerEvent) return false;

					if (tag._down) return;

					displayHover();

					//	Hover 상태를 Broadcast
					if (cfg.hvrSync){
						if (!tag._btnHover){
							tag._btnHover = true;
							apx.ctxSet('uxWgtBtnImage_'+cfg.hvrSync, {oId:oId,state:/*hover*/1});
						}
					}
				}

				tag.onmouseout = function(ev)
				{
					//	Pass면 처리하지 않음
					if (tag.apnPassPointerEvent) return false;
					if (tag.apnBlockPointerEvent) return false;

					displayOut();

					//	Out 상태를 Broadcast
					if (cfg.hvrSync){
						if (tag._btnHover){
							tag._btnHover = false;

							if (!tag._down) apx.ctxSet('uxWgtBtnImage_'+cfg.hvrSync, {oId:oId,state:/*out*/0});
						}
					}
				}
			}
		}
	}

	function onBtnPressed(/*Boolean*/pressed)
	{
		if (pressed){
			if (tag.btnOnDown) tag.btnOnDown(tag);
		}
		else{
			if (tag._down){
				tag._down = false;
				
				if (tag.btnOnState) tag.btnOnState(tag);

				//	Normal 상태를 Broadcast
				if (cfg.hvrSync){
					apx.ctxSet('uxWgtBtnImage_'+cfg.hvrSync, {oId:oId, state:/*normal*/3});
				}
			}
		}
	}

	function onGestureEvent(tag, event, _void, _void, _void, _void, sysEV)
	{
		if (tag.apnBlockPointerEvent) return;

		if (event == bx.CGesture.POINTER_START){
			if (sysEV){
				if (apx.viewer.uOnGestureDragStartControl) apx.viewer.uOnGestureDragStartControl(sysEV);
			}
			onBtnPressed(true);
		}
		else if (event == bx.CGesture.POINTER_END){
			onBtnPressed(false);
		}
	}

	/*	Gesture Event Dispatch 기능을 제공하는 실행기

		실행기 Gesture와 연계하도록 하였으나, END쪽은 TAG 공간 밖에서는 신호가 잡히지 않을 수 있으므로, START쪽만 사용함
		그런데, 어차피 Pressed 동작은 중복진입 방지가 되어 있으므로,
		둘다 항상 실행 시킴
	*/
	if (apx.viewer.o.verGestureDispatch){ 
		tag.apxOnGesture = function(apx, event)
		{
			onGestureEvent(this, event);
		}
	}
	new bx.CGesture(tag, onGestureEvent, {noDelayedEvent:true, noLongholdEvent:true});

	//	상태 초기화
	if (tag.btnOnState) tag.btnOnState(tag);

	/*	버튼 그룹간 Hover/Press Sync 기능
		{oId:oId,state:0|1|2|3}
		0=out, 1=hover, 2=pressed, 3=normal
	*/
	if (cfg.hvrSync){
		function onCtxUxWgtBtnImage(ctxt)
		{
			if (ctxt && ctxt.oId != oId){
				if (canHoverOut && ctxt.state == 0){ // out
					displayOut();
				}
				else if (canHoverOut && ctxt.state == 1){ // hover
					displayHover();
				}
				else if (canPressed && ctxt.state == 2){ // pressed
					displayPressed();
				}
				else if (ctxt.state == 3){ // normal
					displayNormal();
				}
			}
		}
		apx.wgtListenContext(oId, 'uxWgtBtnImage_'+cfg.hvrSync, onCtxUxWgtBtnImage, /*always*/true);
	}

	/*	Scripting: setData, image|imageDisabled|imageSelected|imageChecked
		단, 이 위젯은 이미지의 초기 구성에 의하여 동작이 결정되므로
		이미지를 변경하는 것만 가능함
	*/
	function _errOnSetImage(warn)
	{
		if (warn){
			apx.log(oId, "Image can be set only to replace existing image. Currently, '"+warn+"' image is unset for this widget.");
		}
	}

	function onSetImage(changeWgtId, value)
	{
		if (changeWgtId == oId && value){
			var warn, applied;

			if (value.normal){
				if (tag._images.normal.mediaID){
					tag._images.normal.mediaID = value.normal;
					applied = true;
				}
				else warn = 'Normal';
			}
			if (value.pressed){
				if (tag._images.down.mediaID){
					tag._images.down.mediaID = value.pressed;
					applied = true;
				}
				else warn = 'Pressed';
			}
			if (value.hover){
				if (tag._images.hover.mediaID){
					tag._images.hover.mediaID = value.hover;
					applied = true;
				}
				else warn = 'Hover';
			}

			if (applied){
				if (tag.btnOnState) tag.btnOnState(tag);
			}

			_errOnSetImage(warn);
		}
	}
	apx.wgtListenProperty(oId, 'image', onSetImage);

	function onSetImageDisabled(changeWgtId, value)
	{
		if (changeWgtId == oId && value){
			var warn, applied;

			if (value.normal){
				if (tag._images.disabled.mediaID){
					tag._images.disabled.mediaID = value.normal;
					applied = true;
				}
				else warn = 'Disabled';
			}
			
			if (applied){
				if (tag.btnOnState) tag.btnOnState(tag);
			}

			_errOnSetImage(warn);
		}
	}
	apx.wgtListenProperty(oId, 'imageDisabled', onSetImageDisabled);

	function onSetImageChecked(changeWgtId, value)
	{
		if (changeWgtId == oId && value){
			var warn, applied;

			if (value.normal){
				if (tag._images.checked.mediaID){
					tag._images.checked.mediaID = value.normal;
					applied = true;
				}
				else warn = 'Checked';
			}
			if (value.hover){
				if (tag._images.checkedH.mediaID){
					tag._images.checkedH.mediaID = value.hover;
					applied = true;
				}
				else warn = 'Checked.hover';
			}
			
			if (applied){
				if (tag.btnOnState) tag.btnOnState(tag);
			}

			_errOnSetImage(warn);
		}
	}
	apx.wgtListenProperty(oId, 'imageChecked', onSetImageChecked);

	function onSetImageSelected(changeWgtId, value)
	{
		if (changeWgtId == oId && value){
			var warn, applied;

			if (value.normal){
				if (tag._images.disabled.mediaID){
					tag._images.disabled.mediaID = value.normal;
					applied = true;
				}
				else warn = 'Selected';
			}
			
			if (applied){
				if (tag.btnOnState) tag.btnOnState(tag);
			}

			_errOnSetImage(warn);
		}
	}
	apx.wgtListenProperty(oId, 'imageSelected', onSetImageSelected);

	//	Subclass module 초기화
	if (this.I_exeOnLoad_post) this.I_exeOnLoad_post(apx, oId);
}

xa.exeSetState = function(apx, tag, /*String*/state, /*String|undefined*/prvState)
{
	if (prvState == state) return; // 중복 호출 무시

	var selectType = apx.wgtGetProperty(apx.wgtId(tag), 'selectType');

	//	Disabled 상태 적용
	if (selectType == 'toggle' || selectType == 'check'){
		//동작없음
	}
	else{ // tab 의 경우, select는 disable과 동일한 동작이 됨
		// 'selected'의 경우, setState에서 Block 상태로 들어가고, 이 경위 ITR이 처리되지 않으므로 SetTimeout을 사용함.
		setTimeout(function(){
			if (state == 'normal'){
				if (apx.wgtGetProperty(tag.apnOID, 'apxVisibility') == 'Block' || apx.wgtGetProperty(tag.apnOID, 'apxVisibility') == 2){
					//	Block 상태
				}
				else{
					apx.tagBlockPointerEvent(tag, false);
					apn.IWidget.exeSetCursor(tag, apx.wgtGetProperty(tag.apnOID, 'apxCursor', true));
				}
			}
			else{//disabled
				apx.tagBlockPointerEvent(tag, true);
				apn.IWidget.exeSetCursor(tag, 'inherit');
//				if (tag.apxCursorBackup === undefined) tag.style.cursor = 'inherit'; // 임시로 지정된 값이므로 CSS에 직접 지정함.
//				else tag.apxCursorBackup = 'inherit';
			}
		},0);
	}

	// 상태 표시
	if (tag.btnOnState) tag.btnOnState(tag);

	var oId = apx.wgtId(tag);

	if (apx.wgtGetProperty(oId, 'uxToggleGroup')){
		//	Group에 존재하는 다른 Toggle 위젯을 찾아서 상태를 반영함.
		if (state == 'disabled' || state == 'checked'){
			function onWgt(/*ID*/i)
			{
				if (apx.wgtGetProperty(i, 'apxState') == 'on') apx.wgtSetProperty(i, 'apxState', 'off', undefined, {stateInitialize:true});
				else if (apx.wgtGetProperty(i, 'apxState') == 'disabled'/*selected*/ || apx.wgtGetProperty(i, 'apxState') == 'checked') apx.wgtSetProperty(i, 'apxState', 'normal'/*unselected*/, undefined, {stateInitialize:true});
				else if (apx.stateGetActive(i, true) == '2') {apx.stateLayerActivate(i, '1'); apx.stateSetActive(i, '1', /*stateInitialize*/true);}
			}
			apx.utlIterateInGroup(oId, 'uxToggleGroup', onWgt);
		}
	}
}

xa.exeOnScreenRefresh = apn.widgets['apn.wgt.rect'].exeOnScreenRefresh;

xa.setTextColor = function(apx, oId, state)
{
	var tag = apx.wgtTag(oId);
	var cfg = apx.wgtGetProperty(oId, 'cfg');
	var ver = apx.wgtGetProperty(oId, 'btnV');

	var hasText = apx.wgtGetProperty(oId, 'apxText') ? true : false;
	var tagText;

	if (hasText){
		tagText = tag.textTag ? tag.textTag : tag;
	}

	if (tagText && cfg.clr){
		if (state == 'normal'){
			if (tag == tagText){ // Widget Tag을 직접 변경해야 하는 경우.
				tagText.style.color = apn.Project.resolveStyle(apx.project, 'fontStyle', apx.wgtGetProperty(oId, 'apxTextColor'));
			}
			else{
				tagText.style.color = 'inherit';
			}
			if (ver == 2) tag.style.borderColor = apn.Project.resolveStyle(apx.project, 'strokeStyle', apx.wgtGetProperty(oId, 'apxStrokeStyle'));
		}
		else if (cfg.clr[state]){
			tagText.style.color = cfg.clr[state];
			if (ver == 2) tag.style.borderColor = cfg.clr[state];
		}
	}
}

xa.createAsCanvasObject = function(/*Object*/prj, /*Object*/position, /*Object*/size, /*Object|undefined*/styles, /*Object|undefined*/property)/*Object*/
{
	return apn.IWidget.createCanvasObject(prj, this, 'apn.CImage', bx.CCanvasWnd.SHAPE_RECT, position, size, styles, property);
}

xa.edtOnConfig = function(apd, objID)
{
	var cfg = apd.wgtGetProperty(objID, 'cfg');
	var local = apd.wgtGetProperty(objID, 'local');
	var selectType = apd.wgtGetProperty(objID, 'selectType');
	var tagDlg;

	// 구버전
	if (!cfg.images.disabledDown) cfg.images.disabledDown = {mediaID:undefined};
	if (!cfg.images.disabledHover) cfg.images.disabledHover = {mediaID:undefined};
	if (!cfg.clr) cfg.clr = {disabled:null, down:null, hover:null};

	var _this = this;

	function onOK()
	{
		eduLib.edtInputApplyAll(apd, tagDlg.tagSub);
		eduLib.edtInputApplyAll(apd, tagDlg.tagOrg);
		_this.edtOnSetState(apd, objID, apd.wgtGetProperty(objID, 'apxState'));

		apd.wgtSetProperty(objID, 'cfg', cfg);
		if (local){
			apd.wgtSetProperty(objID, 'local', local);

			if (_this.I_edtOnConfig_save){
				_this.I_edtOnConfig_save(apd, objID, local, tagDlg, tagDlg.tagSub, tagDlg.tagOrg);
			}
		}
		if (tagDlg._tmpSelectType) apd.wgtSetProperty(objID, 'selectType', tagDlg._tmpSelectType);
	}

	if (tagDlg = apd.dlgDoModal(700, Math.ceil(bx.UX.height*0.8), onOK)){
		tagDlg.tagSub = tagDlg.$TAG('div');
		tagDlg.tagOrg = tagDlg.$TAG('div');

		if (this.I_edtOnConfig){
			this.I_edtOnConfig(apd, objID, local, tagDlg, tagDlg.tagSub, tagDlg.tagOrg);
		}

		uxWgtBtnImage.I_edtOnConfigBuild.call(this, apd, objID, tagDlg, tagDlg.tagOrg, selectType);
	}
}

/*	Child class에서 Config 화면 재구성을 요청할 수 있도록 분리된 함수임
	selectType에 의해서 구성이 바뀌게 되며, Property에 저장된 상태가 아니므로 인수로 받아서 처리함
*/
xa.I_edtOnConfigBuild = function(apd, objID, tagParent, tagDlg, selectType)
{
	var cfg = apd.wgtGetProperty(objID, 'cfg');

	tagParent._tmpSelectType = selectType;

	var txtTitleDisabled = apn.CExe.GL({ko:'비활성 상태',en:'Disabled',ja:'非アクティブ'});
	var txtTitleNormal = apn.CExe.GL({ko:'기본 상태',en:'Normal',ja:'基本状態'});

	var label = apn.CExe.GL({ko:'버튼 상태 표시를 위한 이미지',en:'Image for each states',ja:'ボタンの状態を表示するための画像'});
	var titleNormal = txtTitleNormal;
	var titleDisabled = txtTitleDisabled;

	if (apd.wgtGetProperty(objID, 'btnV') == 2){
		var label2 = apn.CExe.GL({ko:'버튼 상태 표시를 위한 텍스트/테두리 색상',en:'Text/border color for each states',ja:'ボタンの状態を表示するためのテキスト/枠線の色'});
	}
	else{
		var label2 = apn.CExe.GL({ko:'버튼 상태 표시를 위한 텍스트 색상',en:'Text color for each states',ja:'ボタンの状態を表示するためのテキストの色'});
	}

	if (this.I_edtOnConfig_title && this.I_edtOnConfig_title(apd, objID, tagParent, 'normal')) titleNormal = this.I_edtOnConfig_title(apd, objID, tagParent, 'normal');
	if (this.I_edtOnConfig_title && this.I_edtOnConfig_title(apd, objID, tagParent, 'disabled')) titleDisabled = this.I_edtOnConfig_title(apd, objID, tagParent, 'disabled');

	if (tagDlg.eduLib) delete tagDlg.eduLib; // 기존 정보가 있으면 삭제함
	tagDlg.innerHTML = '';

	var isTextOnly = apd.wgtGetProperty(objID, 'btnType') == 'text';
	var hasText = apd.wgtGetProperty(objID, 'apxText') ? true : false;

	if (selectType == 'tab'){
		if (titleNormal == txtTitleNormal) titleNormal = apn.CExe.GL({ko:'미선택 상태',en:'Unselected',ja:'未選択の状態'});
		if (titleDisabled == txtTitleDisabled) titleDisabled = apn.CExe.GL({ko:'선택 상태',en:'Selected',ja:'選択状態'});

		if (!isTextOnly){
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+'', value:cfg.images, key:'normal', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Hover', value:cfg.images, key:'hover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleDisabled+'', value:cfg.images, key:'disabled', join:true});
		}

		if (cfg.clr && (hasText || isTextOnly)){
			if (cfg.clr.down) cfg.clr.down = null; // 구데이터 처리
			eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label2});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleDisabled, value:cfg.clr, key:'disabled', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Hover', value:cfg.clr, key:'hover', join:true});
		}
	}
	else if (selectType == 'toggle'){
		if (titleDisabled == txtTitleDisabled) titleDisabled = 'Selected';

		if (!isTextOnly){
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleDisabled+'', value:cfg.images, key:'disabled', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleDisabled+' Hover', value:cfg.images, key:'disabledHover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleDisabled+' Pressed', value:cfg.images, key:'disabledDown', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+'', value:cfg.images, key:'normal', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Hover', value:cfg.images, key:'hover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Pressed', value:cfg.images, key:'down', join:true});
		}

		if (cfg.clr && (hasText || isTextOnly)){
			eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label2});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleDisabled, value:cfg.clr, key:'disabled', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleDisabled+' Hover', value:cfg.clr, key:'disabledHover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleDisabled+' Pressed', value:cfg.clr, key:'disabledDown', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Hover', value:cfg.clr, key:'hover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Pressed', value:cfg.clr, key:'down', join:true});
		}
	}
	else if (selectType == 'check'){
		titleNormal = apn.CExe.GL({ko:'미선택 상태',en:'Unchecked',ja:'未選択の状態'});
		var titleChecked = apn.CExe.GL({ko:'선택 상태',en:'Checked',ja:'選択状態'});

		if (!isTextOnly){
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleChecked+'', value:cfg.images, key:'checked', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleChecked+' Hover', value:cfg.images, key:'checkedH', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+'', value:cfg.images, key:'normal', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Hover', value:cfg.images, key:'hover', join:true});
		}

		if (cfg.clr && (hasText || isTextOnly)){
			eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label2});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleChecked, value:cfg.clr, key:'checked', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleChecked+' Hover', value:cfg.clr, key:'checkedH', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Hover', value:cfg.clr, key:'hover', join:true});
		}
	}
	else{
		if (!isTextOnly){
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+'', value:cfg.images, key:'normal', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Hover', value:cfg.images, key:'hover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Pressed', value:cfg.images, key:'down', join:true});

			if (selectType != 'simple'){
				eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
				eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleDisabled, value:cfg.images, key:'disabled', join:true});
			}
		}

		if (cfg.clr && (hasText || isTextOnly)){
			eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label2});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Hover', value:cfg.clr, key:'hover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Pressed', value:cfg.clr, key:'down', join:true});
			if (selectType != 'simple'){
				eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleDisabled, value:cfg.clr, key:'disabled', join:true});
			}
		}

		//	Hover 상태 Sync Group - 'normal', 'simple' Select Type에서만 제공함
		eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
		eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:apn.CExe.GL({ko:'버튼간 Hover/Pressed 상태 동기화',en:'Synchronize Hover/Pressed status with buttons',ja:'ボタン間Hover/Pressed状態を同期'})});
		eduLib.edtInputAdd(apd, tagDlg, {type:'text', title:apn.CExe.GL({ko:'그룹 지정',en:'Group',ja:'グループ指定'}), value:cfg, key:'hvrSync', comment:apn.CExe.GL({ko:'(편집자가 할당한 그룹ID)',en:'(Unique group ID assigned by user(editor))',ja:'（編集者が割り当てたグループID）'}), join:true});
	}

	eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
	eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:apn.CExe.GL({ko:'도움말(툴팁)',en:'Tooltip',ja:'ヘルプ（ツールチップ）'})});
	eduLib.edtInputAdd(apd, tagDlg, {type:'text', title:apn.CExe.GL({ko:'메시지',en:'Message',ja:'メッセージ'}), value:cfg, key:'ttip', join:true});
}

xa.edtOnSetState = function(apd, objID, state)
{
	var cfg = apd.wgtGetProperty(objID, 'cfg');

	if (cfg.images[state].mediaID) apd.wgtSetProperty(objID, 'apxMediaID', cfg.images[state].mediaID, apd.wgtGetProperty(objID, 'autoKeepSize'));
	else apd.wgtSetProperty(objID, 'apxMediaID', null);
}

xa.edtOnBuildState = function(prj, oId, pageID, ret)
{
	var cData = prj.pages[pageID].objects[oId].create.data;
	var type;

	if (cData && cData.properties && cData.properties.attrs){
		type = cData.properties.attrs.selectType;
	}

	if (type == 'tab' || type == 'toggle'){
		ret.disabled = 'Selected';
		ret.normal = 'Unselected';
	}
	else if (type == 'check'){
		ret.checked = 'Checked';
		ret.normal = 'Unchecked';
	}
	else{
		ret.normal = 'Normal';
		ret.disabled = 'Disabled';
	}
}

/*	Subclassing 지원을 위해서 다음과 같은 I/F를 제공함
	.I_edtOnConfig(apd, objID, local, tagDlg, tagLocal, tagOrg);
	.I_edtOnConfig_save(apd, objID, local, tagDlg, tagLocal, tagOrg);
	.I_edtOnConfig_title(apd, objID, tagDlg, state) // String, 각 State의 표시 이름을 가져옴
	.I_exeOnLoad_check(apx, oId)/Boolean/ // Return false이면 onLoad가 실패임
	.I_exeOnStateChange(apx, oId, state)
*/

xa.pubOnGetHTML = function(prj, pId, oId, opts)
{
	var ret = apn.IWidget.htmlRender(this, prj, pId, oId);//, undefined, {lineWidth:true, strokStyle:true});
	var html = '<div';

	ret.css += 'overflow:hidden;';

	if (ret.style.mediaID){
		ret.css += 'background-size:100% 100%;background-repeat:no-repeat;background-image: url('+apn.Project.mediaResolve(prj, ret.style.mediaID, false, true)+');';
	}

	var attr = '';
	var attrs = prj.pages[pId].objects[oId].create.data.properties.attrs;

	if (attrs.ttip){
		attr += ' title="'+apn.IWidget.exeFormatText(attrs.ttip, {xml:true,noTag:true})+'"';
	}

	html += ' style="'+ret.css+'"' + attr;
	html += ' class="apxWgt1'+(opts&&opts.addCls ? ' '+opts.addCls : '')+'"';
	if (!(opts&&opts.noId)) html += ' data-apx-id="'+oId+'">';
	else html += '>';

	/*	이 위젯은 주로 이미지로 사용되고, Text 부분이 구형 버전으로 되어 있으므로, Text set은 DOM 방식으로 하도록 함
	if (ret.style.text){}
	*/

	html += '</div>';

	return html;
}

uxWgtBtnImage = xa;
////////////////////////////////////////////////////////////////////////////////
// ux.wgt.playerSeek
/*
	Media Player에서 Seek Handle 부분임

	Prop options
		disableDrag:false
		Drag 동작을 Disable함.
		단 Drag뿐아니라, 후진 기능이 없이 앞으로만 직진함
		즉 진행 상황을 표시하는 역할만 함. 이 경우, onTick()에 의한 부드러운 이동 기능이 동작하며 tag.ctx.slide{}에 정보가 기록됨

		값은 disableDrag이지만, 편집 표시명은 Mode로 함. 2018/08
*/
var xa = apn.inheritWidget(apn.widgets['apn.wgt.rect']);
xa.styleMap = {
	title:true
	,visibility:true
	,alpha:true
	,mediaID:true
};

xa.editor = {
	iconThumb:'imgs/wgts/thumbs/video.png'
	,states:{ready:'Ready', off:'Off'}
};

xa.properties = {
	attrs:{
		uxMediaPlayer:true
		,disableDrag:''
		,v:2 // 기능추가 FLAG
		,vbar:1 // 진행바 표시 기능 변경했다는 FLAG %%2021/04
		,cfg:{
			idAudio:''
			,bar:{mediaID:undefined}
			,barPlayed:{L:{mediaID:undefined}, C:{mediaID:undefined}, R:{mediaID:undefined}}
			,handle:{normal:{mediaID:undefined}, hover:{mediaID:undefined}, down:{mediaID:undefined}} // (o) bar, handle.normal은 최소 있어야 표시됨, barPlayed는 3patch이므로 Image preloading이 필요함
		}
	}
};

xa.createAsCanvasObject = function(/*Object*/prj, /*Object*/position, /*Object*/size, /*Object|undefined*/styles, /*Object|undefined*/property)/*Object*/
{
	return apn.IWidget.createCanvasObject(prj, this, 'apn.CImage', bx.CCanvasWnd.SHAPE_RECT, position, size, styles, property);
}

xa.exeOnTick = function(apx, oId, tmTick)
{
	//	Drag 기능을 사용하지 않을 경우(즉 짧음 음원이 사용될 가능성이 큼) 미세한 Tick에 반응하도록 개발함
	var tag = apx.wgtTag(oId);
	if (!(tag.ctx && tag.ctx.slide)) return;
	if (tag.ctx.slide.s >= tag.ctx.slide.e) return;

	if (tag.ctx.slide.run == 1){ // 시작
		tag.ctx.slide.run = 2;
		tag.ctx.slide.tick = tmTick;
		this._setHandle(apx, tag, tag.ctx.slide.s, tag.ctx._duration);
	}
	else{
		var ratio = Math.min(1, ((tmTick-tag.ctx.slide.tick)/1000)/(tag.ctx.slide.e - tag.ctx.slide.s));

		tag.ctx.slide.c = tag.ctx.slide.s+ratio*(tag.ctx.slide.e - tag.ctx.slide.s); // 현재값 저장

		this._setHandle(apx, tag, tag.ctx.slide.c, tag.ctx._duration);

		if (ratio == 1) delete tag.ctx.slide; //끝
	}
}

xa.exeSetState = function(apx, tag, /*String*/state)
{
	if (state == 'off' && tag.ctx){
		if (tag.ctx.slide) delete tag.ctx.slide;
		if (tag.ctx._duration) uxWgtPlayerSeek._setHandle(apx, tag, 0, tag.ctx._duration);
	}
}

xa.exePropSet = function(apx, oId, key, value, /*Boolean|undefined*/check)
{
	//	버튼을 보이거나(visible) 감춥니다.(hidden). 추가로 Bar의 Click 동작은 위젯을 visibilityEventPass로 해서, 막을 수 있습니다.
	if (key == 'handleVisibility'){
		if (check){
			 return true;
		}
		else{
			var tag = apx.wgtTag(oId);

			if (tag.ctx && tag.ctx.tagHandle){
				if (value == 'visible'){
					tag.ctx.tagHandle.style.display = 'block';
					tag.ctx.tagHandle.__hidden = false; // Image loading 후 display 처리가 Async이므로 변수를 추가함
				}
				else if (value == 'hidden'){
					tag.ctx.tagHandle.style.display = 'none';
					tag.ctx.tagHandle.__hidden = true;
				}
				else{
					apx.log(oId, 'Unknown parameter value for \'handleVisibility\'. Value='+value);
				}
			}
		}
	}
}

xa.exeOnLoad = function(apx, oId)
{
	var tag = apx.wgtTag(oId);

	delete tag.textTag;
	tag.style.overflow = 'visible'; // Handle이 움직이면 공간 밖으로 나가므로
	var cfg = apx.wgtGetProperty(oId, 'cfg');

	if (!cfg.idAudio || !apx.wgtTag(cfg.idAudio)){
		apx.log(oId, apn.CExe.GL({ko:"제어할 '연동할 위젯'이 설정되지 않았거나 존재하지 않습니다.",en:"'Media widget to interface with' is not set or not exist."}));
		return;
	}
	if (!cfg.bar.mediaID || !cfg.handle.normal.mediaID){
		apx.log(oId, apn.CExe.GL({ko:"'필수 이미지'가 설정되지 않았거나 존재하지 않습니다.", en:"'Mandatory images' are not set or not exist."}));
		return;
	}

	//	High Resolution Playtime
	apx.wgtSetProperty(cfg.idAudio, 'highResolutionPlaytime', true);

	tag.ctx = {};
	tag.ctx.tagAudio = apx.wgtTag(cfg.idAudio);
	tag.ctx.moduleAudio = apn.Project.getWidgetModule(apx.screen.objects[cfg.idAudio].create.data);

	tag.ctx.slide = undefined; //onTick에 의한 부드러운 이동을 위한 정보 {s:, e:}

	//	Annotation이 감지되면, Seek 과정에서 PlayTime 바꾸는 동작을 하지 않고 END에서만 동작함
	var wgtAtns = apx.widgetsByClass('edu.wgt.subtitle');
	var noSeekOnDrag;

	for(var i = 0; i < wgtAtns.length; i ++){
		if (apx.wgtGetProperty(wgtAtns[i], 'v') == '2a'){
			var buf = apx.wgtGetProperty(wgtAtns[i], 'cfg');
			var trks = apx.wgtGetProperty(wgtAtns[i], 'subs');

			if (buf && buf.idMedia && buf.idMedia == cfg.idAudio){
				for(var j = 0; j < trks.length; j ++){
					if (trks[j].pOes == 'Y'){
						noSeekOnDrag = true;
						break;
					}
				}
				if (noSeekOnDrag) break;
			}
		}
	}

	//	noSeekOnDrag이 true이고 playTime 위젯이 있으면 직접 제어함
	var idWgtTime;

	if (noSeekOnDrag){
		var wgtTms = apx.widgetsByClass('ux.wgt.playerTime');

		for(var i = 0; i < wgtTms.length; i ++){
			var buf = apx.wgtGetProperty(wgtTms[i], 'cfg');

			if (buf && buf.idAudio && buf.idAudio == cfg.idAudio){
				idWgtTime = wgtTms[i];
				break;
			}
		}
	}

	// Bar Image
	tag.style.background = 'url('+apx.mediaURL(cfg.bar.mediaID)+') no-repeat center center';
	tag.$CSS('backgroundSize', '100% auto');

	// Drag Handle
	tag.ctx.tagHandle = tag.$TAG('img', {style:'display:none;position:absolute;cursor:inherit;', alt:''}); // Handle에만 Cursor를 지정함

	if (!apx.wgtGetProperty(oId, 'disableDrag')){
		apn.IWidget.exeSetCursor(tag.ctx.tagHandle, 'pointer');
	}

	tag.ctx.tagHandle.onload = function()
	{
		var zx = 1/apx.getZoomX();

		if (!this.__hidden) this.style.display = 'block';

		this._offX = -Math.round(zx*this.naturalWidth/2-parseInt(tag.style.height)/2);
		this._innerX = Math.round(zx*this.naturalWidth/2 + this._offX);
		this._width = Math.round(zx*this.naturalWidth);

		this.style.left = this._offX+'px';
		this.style.top = -Math.round(zx*this.naturalHeight/2-parseInt(tag.style.height)/2)+'px';
		this.style.width = Math.round(zx*this.naturalWidth)+'px';
		this.style.height = Math.round(zx*this.naturalHeight)+'px';
	}
	tag.ctx.tagHandle.src = apx.mediaURL(cfg.handle.normal.mediaID);

	apx.tagDraggable(tag.ctx.tagHandle, true);

	function handlePosRatio(handle)/*Float*/
	{
		return (parseInt(handle.style.left)-handle._offX)/(parseInt(tag.style.width)-handle._innerX*2);
	}

	tag.ctx.tagHandle.apxOnDrag = function(apx, sX, sY)
	{
		if (apx.wgtGetProperty(oId, 'apxState') == 'off') return false;
		if (apx.wgtGetProperty(oId, 'disableDrag')) return false;
		
		var ret = true;
		if (sX < this._offX){
			sX = this._offX;
			ret = false;
		}
		if (sX > parseInt(tag.style.width)-(this._width+this._offX)){
			sX = parseInt(tag.style.width)-(this._width+this._offX);
			ret = false;
		}

		//	버튼가 바의 크기차이가 offX이면, 그 안쪽에 발생하는 공간을 innerX로 함. 이 innerX의 양쪽 위치가 버튼의 중심점임
		var percent = handlePosRatio(this);

		if (apx.wgtGetProperty(oId, 'vbar') == 1){
			uxWgtPlayerSeek._barPlayedRender2(apx, tag, percent);
		}
		else{
			uxWgtPlayerSeek._barPlayedRender(apx, tag, Math.max(1, percent*parseInt(tag.style.width)));
		}

		percent = Math.round(percent*100);

		//	이동 중에도 Play가 될 수 있음
		if (idWgtTime){ // Seek 위젯 시간 직접 Set
			apx.wgtSetProperty(idWgtTime, 'currentTime', percent+'%');
		}
		else if (tag.ctx.moduleAudio && !noSeekOnDrag){
			if (tag.ctx.moduleAudio.exeMediaSeek) tag.ctx.moduleAudio.exeMediaSeek(tag.ctx.tagAudio, percent+'%', false/*, true*/);
		}
		return ret;
	}
	tag.ctx.tagHandle.apxOnDragStart = function(apx)
	{
		if (apx.wgtGetProperty(oId, 'apxState') == 'off') return false;
		if (apx.wgtGetProperty(oId, 'disableDrag')) return false;

		//	Drag 제어 기능을 가진 실행기에서 이 위젯이 Overlay Page에 있으면 Drag 제어 기능을 호출함. 아래 Page의 Drag를 막기 위한 것임
		if (apx.viewer.ISub_pauseDrag && apx.screen.module == 'apn.COverlayPage'){
			//	논리적으로는 X,Y의 반대 방향만 막으면 되지만, 손에 의하여 조금씩 흔들릴 수 있으므로 X, Y를 모두 막음
			apx.viewer.ISub_pauseDrag(true, true);
		}

		this._inDrag = true; // Drag 중에는 Media의 Time 변화에 대응하지 않도록 하기 위해서
		return true;
	}
	tag.ctx.tagHandle.apxOnDragEnd = function(apx)
	{
		//	Drag 제어 기능을 가진 실행기에서 이 위젯이 Overlay Page에 있으면 Drag 제어 기능을 호출함. 아래 Page의 Drag를 막기 위한 것임
		if (apx.viewer.ISub_pauseDrag && apx.screen.module == 'apn.COverlayPage'){
			//	논리적으로는 X,Y의 반대 방향만 막으면 되지만, 손에 의하여 조금씩 흔들릴 수 있으므로 X, Y를 모두 막음
			apx.viewer.ISub_pauseDrag(false, false);
		}

		if (apx.wgtGetProperty(oId, 'apxState') == 'off') return false;
		if (apx.wgtGetProperty(oId, 'disableDrag')) return false;

		if (tag.ctx.moduleAudio){
			if (tag.ctx.moduleAudio.exeMediaSeek) tag.ctx.moduleAudio.exeMediaSeek(tag.ctx.tagAudio, handlePosRatio(this)*100+'%', true, false);
		}
		this._inDrag = false;
		
		setTimeout(function(){apx.fireEvent('wgtEvent', 'endSeek', oId)}, 100);
	
		return true;
	}

	// Bar played(focused) - 3patch
	this._barPlayedLoad(apx, oId);

	//	%%INFO 일단 기존 편집분은 그대로 두고, 신규 편집분에 대해서 기능을 추가함
	if (apx.wgtGetProperty(oId, 'v') == 2){
		if (!apx.wgtGetProperty(oId, 'disableDrag')){
			apn.IWidget.exeSetCursor(tag, 'pointer');
		}

		/*	Bar Click에 의한 Seek
			Bar를 Click하면 바로 Play가 시작됨. Chrome의 버그로 인해서 이렇게 하는 것이 안전하기 때문임
		*/
		tag.apxOnEvent = function(apx, /*Enum*/event, clientX, clientY, canvasX, canvasY, /*Event*/sysEvent)
		{
			if (event == 'click'){
				var deltaCvsX = 0;

				//	Drag가 되는 실행기의 경우, PM.tag가 이동하므로 반영해야 함. PDF실행기 등 ...
				if (apx.viewer.ISub_pauseDrag){
					var pmTag = apx.viewer.getPM().tag;
					var pmTagX = parseInt(pmTag.style.left);
					var pmTagY = parseInt(pmTag.style.top);

					sX = apx.viewer.onGestureCoordTransformX(sysEvent.clientX - pmTagX, sysEvent.clientY - pmTagY);
					canvasX = apx.toCanvasX(sX);
	
					//	양면책의 우측 페이지 좌표 보정
					deltaCvsX = apx.toCanvasX(parseInt(apx.tag.style.left));
				}

				var oCvsX = apx.screen.objects[oId].init.position.x + deltaCvsX;
				var oCvsW = apx.screen.objects[oId].init.shape.w;

				if (apx.wgtGetProperty(oId, 'apxState') == 'off') return;
				if (apx.wgtGetProperty(oId, 'disableDrag')) return;

				if (tag.ctx.moduleAudio){
					if (tag.ctx.moduleAudio.exeMediaSeek) tag.ctx.moduleAudio.exeMediaSeek(tag.ctx.tagAudio, ((canvasX-oCvsX)/oCvsW)*100+'%', true, false);
				}
				return true;
			}
		}
	}

	// 연결: Media Listen
	function onMediaEvent(ev, p1, p2)
	{
		if (apx.wgtGetProperty(oId, 'apxState') == 'off') return;

		if (ev == 'infoPlayTime'){
			if (!tag.ctx.tagHandle._inDrag){
				if (p1 !== undefined && p1 > 0 && p2){
					tag.ctx._duration = p2;

					if (apx.wgtGetProperty(oId, 'disableDrag')){
						// 실행 중인 것이 있고 이것의 현재 값이 더 크면 기존 것을 계속 유지함. 새 것에 의해서 뒤로 Back하는 것을 (더더덕) 막기 위함
						if (tag.ctx.slide && tag.ctx.slide.run == 2 && tag.ctx.slide.c >= p1){
							// 기존 움직임 유지함
						}
						else{
							tag.ctx.slide = {s:p1, e:p2, c:p1, run:1}; // run=1, Slide를 시작할 것을 나타냄
						}
					}
					else{
						uxWgtPlayerSeek._setHandle(apx, tag, p1, p2);
					}
				}
			}
		}
		else if (ev == 'infoDuration'){
			if (!tag.ctx.tagHandle._inDrag){
				if (p1 !== undefined && p2){
					tag.ctx._duration = p2;
					uxWgtPlayerSeek._setHandle(apx, tag, p1, p2);
				}
			}
		}
		else if (ev == 'trackPause'){
			//	중지하면 현재 위치에서 멈춤. (이동 중이므로 약간 오차가 있을 수는 있으나 무시해도 됨)
			if (tag.ctx.slide) delete tag.ctx.slide;
		}
		else if (ev == 'trackEnd'){ // 종료가 되면 UI 목적으로 처음으로 돌아감
			if (tag.ctx._duration){
				uxWgtPlayerSeek._setHandle(apx, tag, 0, tag.ctx._duration);
				tag.ctx.slide = undefined;
			}
		}
	}
	apx.wgtListenMedia(oId, cfg.idAudio, onMediaEvent);
}

xa._setHandle = function(apx, tag, p1, p2)
{
	var handleW = tag.ctx.tagHandle._width;

	if (handleW){
		var x = (p1/p2)*(parseInt(tag.style.width) - tag.ctx.tagHandle._innerX*2);
		var barW = (p1/p2)*parseInt(tag.style.width);

		x = Math.round(x+tag.ctx.tagHandle._offX);

		if (tag.ctx.tagHandle.style.left != x+'px') tag.ctx.tagHandle.style.left = x+'px';

		if (apx.wgtGetProperty(tag.apnOID, 'vbar') == 1){
			uxWgtPlayerSeek._barPlayedRender2(apx, tag, p1/p2);
		}
		else{
			uxWgtPlayerSeek._barPlayedRender(apx, tag, Math.max(1, barW));
		}
	}
}

xa._barPlayedLoad = function(apx, oId)
{
	var cfg = apx.wgtGetProperty(oId, 'cfg');

	if (cfg.barPlayed.L.mediaID && cfg.barPlayed.C.mediaID && cfg.barPlayed.R.mediaID){
		var tag = apx.wgtTag(oId);

		tag.ctx.uTagPlayed = tag.$TAG('div', {style:'position:absolute;overflow:hidden;left:0px;height:0px;width:1px;height:'+tag.style.height});
		apx.tagPutUnder(tag.ctx.uTagPlayed, tag.ctx.tagHandle);
		apx.tagPassPointerEvent(tag.ctx.uTagPlayed, true);

		tag.ctx.uPlayedImgs = {};
		tag.ctx.uPlayedImgs.L = {url:apx.mediaURL(cfg.barPlayed.L.mediaID)};
		tag.ctx.uPlayedImgs.M = {url:apx.mediaURL(cfg.barPlayed.C.mediaID)};
		tag.ctx.uPlayedImgs.R = {url:apx.mediaURL(cfg.barPlayed.R.mediaID)};

		function onLoad(cntAll, cntSucc, cntErr)
		{
			if (cntAll == cntSucc){
				tag.ctx.uImgLoaded = true;

				if (apx.wgtGetProperty(tag.apnOID, 'vbar') == 1){
					uxWgtPlayerSeek._barPlayedRender2(apx, tag, 0);
				}
				else{
					uxWgtPlayerSeek._barPlayedRender(apx, tag, 1);
				}
			}
			else{
				apx.log(oId, 'Failed to load '+cntErr+' images.');
			}
		}
		new apn.CRscLoader().load(apx.project, tag.ctx.uPlayedImgs, onLoad);
	}
}

/*	Handle에 따라서 Bar Played 영역을 Fill(3patch)함
*/
xa._barPlayedRender = function(apx, tag, w)
{
	if (tag.ctx.uTagPlayed && tag.ctx.uImgLoaded){
		tag.ctx.uTagPlayed.style.width = w+'px';

		apn.widgets.utils.patch3(tag.ctx.uTagPlayed, false, tag.ctx.uPlayedImgs.L.image, tag.ctx.uPlayedImgs.M.image, tag.ctx.uPlayedImgs.R.image);
	}
}

//	새버전 - 핸들이 존재하면 핸들의 위치를 기준으로 진행부분을 표시하도록 함 %%2021/04
xa._barPlayedRender2 = function(apx, tag, /*0~1*/ratio)
{
	if (tag.ctx.uTagPlayed && tag.ctx.uImgLoaded){
		var areaW = parseInt(tag.style.width);

		if (tag.ctx.tagHandle && tag.ctx.tagHandle.style.display == 'block'){
			var handleCX = parseInt(tag.ctx.tagHandle.style.left) + parseInt(tag.ctx.tagHandle.style.width)/2;
			var w = handleCX - parseInt(tag.ctx.uTagPlayed.style.left);
		}
		else{
			var w = ratio*areaW;
		}

		tag.ctx.uTagPlayed.style.width = Math.max(0.01,w)+'px';

		apn.widgets.utils.patch3(tag.ctx.uTagPlayed, false, tag.ctx.uPlayedImgs.L.image, tag.ctx.uPlayedImgs.M.image, tag.ctx.uPlayedImgs.R.image);
	}
}

xa.onEdit = undefined;

xa.edtOnConfig = function(apd, objID)
{
	var cfg = apd.wgtGetProperty(objID, 'cfg');
	var tagDlg;

	// Media 위젯 목록
	var page = apd.getScreenData();
	var medias = [];
	var buf, wgtModule;

	for(var i in page.objects){
		buf = page.objects[i].create.data;
		wgtModule = apn.Project.getWidgetModule(buf);

		if (buf && buf.properties && buf.properties.attrs && buf.properties.attrs.apxMediaControl && wgtModule && (!wgtModule.exeMediaCheck || wgtModule.exeMediaCheck('seeking'))){
			//%%INFO Multi-track 위젯은 제외함. 논리적으로 제어가 불가한 경우임.
			if (!((buf.properties.attrs.list || buf.properties.attrs.URLs) && !buf.properties.attrs.noMultiTrack)){
				medias.push({value:i, title:apd.itrGetObjectTitle(i)});
			}
		}
	}
	eduLib.utilSortObjectsByTitle(apd, medias);
	medias.push({title:apn.CExe.GL(apn.CExe.TXT_SETUP_NOSEL), value:''});

	function onOK()
	{
		eduLib.edtInputApplyAll(apd, tagDlg);
		if (cfg.bar.mediaID) apd.wgtSetProperty(objID, 'apxMediaID', cfg.bar.mediaID);
		apd.wgtSetProperty(objID, 'cfg', cfg);
	}

	if (tagDlg = apd.dlgDoModal(640, 600, onOK)){
		eduLib.edtInputAdd(apd, tagDlg, {type:'select', options:medias, title:apn.CExe.GL({ko:'연동할 위젯',en:'Media widget to interface with'})+' (m)', key:'idAudio', value:cfg, join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
		eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:apn.CExe.GL({ko:'필수 이미지',en:'Mandatory images'})});
		eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:apn.CExe.GL({ko:'탐색바',en:'Bar'})+' (m)', value:cfg, key:'bar', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:apn.CExe.GL({ko:'탐색핸들',en:'Handle'})+' (m)', value:cfg.handle, key:'normal', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:apn.CExe.GL({ko:'재생부분 표시 이미지 (3조각 패턴)',en:'Images for played area (3-patched)'})});
		eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:apn.CExe.GL({ko:'왼쪽',en:'Left'}), value:cfg.barPlayed, key:'L', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:apn.CExe.GL({ko:'가운데',en:'Middle'}), value:cfg.barPlayed, key:'C', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:apn.CExe.GL({ko:'오른쪽',en:'Right'}), value:cfg.barPlayed, key:'R', join:true});
	}
}

xa.edtOnBuildProperty = function(edt, file, oId, pageId)/*{}|null*/
{
	return {
		disableDrag:{title:'Mode', input:[{title:'Animation',value:'A'},{title:'Seek-bar',value:''}]} // true,false대신 'A',''를 사용함. 조건은 같음
	};
}

xa.edtOnRemapObjectID = function(apd, data, /*Object*/map)
{
	if (data && data.properties && data.properties.attrs && data.properties.attrs.cfg){
		var cfg = data.properties.attrs.cfg;

		if (cfg.idAudio){
			if (map[cfg.idAudio]) cfg.idAudio = map[cfg.idAudio];
			else if (!apd.getScreenData().objects[cfg.idAudio]) cfg.idAudio = '';
		}
	}
}

xa.edtOnBuildEvent = function(prj, oId, pageID, ret)
{
	ret.wgtEvent = {value:'wgtEvent', title:apn.P.eventTitle.wgtEvent, param:{endSeek:'EndSeek'}};
}

uxWgtPlayerSeek = xa;
////////////////////////////////////////////////////////////////////////////////
// ux.wgt.playerBtn
/*
	Play, Stop, Loop, Repeat 등 Player Button
	Group에 속할 경우, P:uxMediaPlayer를 가진 위젯을 찾아서 idAudio가 없으면 Set해줌. 따라서, Group으로 묶을 경우, 모든 위젯에 Media Widget를 Set하지 않아도 됨.
*/
var xa = apn.inheritWidget(uxWgtBtnImage);
xa.styleMap = {
	title:true
	,visibility:true
	,alpha:true
	,angle:true
	,mediaID:true
	,csr:true
}

xa.scriptInfo = {
	wgtData:{
		media:{help:'WidgetID\nID of media widget currently interfacing with.', value:'WidgetID'}
	}
}

if (apn.widgets['apn.wgt.rect'] && apn.widgets['apn.wgt.rect'].scriptInfo){
	xa.scriptInfo.wgtData.vertex = apn.widgets['apn.wgt.rect'].scriptInfo.wgtData.vertex;
	xa.scriptInfo.wgtData.vertexInPage = apn.widgets['apn.wgt.rect'].scriptInfo.wgtData.vertexInPage;
}

xa.editor = xa.editor || {};
xa.editor.iconThumb = 'imgs/wgts/thumbs/video.png';

xa.properties = xa.properties || {};
xa.properties.attrs = xa.properties.attrs || {};
xa.properties.attrs.uxMediaPlayer = true;
xa.properties.attrs.local = xa.properties.attrs.local || {}
xa.properties.attrs.local.idAudio = '';
xa.properties.attrs.local.type = 'stop';
xa.properties.attrs.local.all = '';
xa.properties.attrs.selectType = 'toggle';

xa.properties.state = 'normal';

xa.onEdit = undefined;

xa.exeOnScreenFull = function(apx, oId, state)
{
	var tag = apx.wgtTag(oId);
	var cfg = apx.wgtGetProperty(oId, 'local');

	if (cfg.type == 'fscrn'){
		//	Tag에 의한 전체화면 변화에만 대응함
		if ((state.tag || !state.on) && tag && tag.ctx){
			tag.ctx.fullScreen = state.on;

			apx.wgtSetProperty(oId, 'apxState', tag.ctx.fullScreen ? 'disabled' : 'normal');
		}
	}
}

xa.exeOnPagePreLoad = function(apx, oId)
{
	var orgCfg = apx.srcGetWidgetProperty(oId, 'local') || apx.srcGetWidgetProperty(oId, 'cfg');

	if (orgCfg.idAudio){
		function onWgt(/*ID*/i)
		{
			var cfg = apx.srcGetWidgetProperty(i, 'local') || apx.srcGetWidgetProperty(i, 'cfg');

			if (!cfg.idAudio || !apx.wgtTag(cfg.idAudio)) cfg.idAudio = orgCfg.idAudio; // Object이므로 Set Prop 호출 필요 없음
		}
		apx.utlIterateInGroup(oId, 'uxMediaPlayer', onWgt);
	}
}

/*	%%UNDOCUMENED yet
	setData('media', widgetID)
		제어할 연동 미디어 위젯을 지정함
*/
xa.exePropSet = function(apx, oId, key, value, /*Boolean|undefined*/check)
{
	if (key == 'media'){
		if (check){
			 return true;
		}
		else{
			var tag = apx.wgtTag(oId);

			if (value && apx.wgtTag(value) && tag && tag.ctx){ // Widget ID
				//	수신을 위한 Listener 교체. 기존 cfg.idAudio로 등록된 Handler를 제거하고 다시 등록함
				tag.ctx._resetListener(value);

				//	제어를 위한 ID 교체
				var cfg = apx.wgtGetProperty(oId, 'local');

				cfg.idAudio = value;
			}
			else{
				apx.log(oId, 'Invalid parameter for setData() of \'media\'. Value='+value);
			}
		}
	}
}

xa.exePropGet = function(apx, oId, key, /*Boolean|undefined*/check)
{
	if (key == 'vertex' || key == 'vertexInPage'){
		return apn.widgets['apn.wgt.rect'].exePropGet.call(this, apx, oId, key, /*Boolean|undefined*/check);
	}
	else if (key == 'media'){
		if (check){
			 return true;
		}
		else{
			var tag = apx.wgtTag(oId);

			if (tag && tag.ctx){
				var cfg = apx.wgtGetProperty(oId, 'local');

				return cfg.idAudio||undefined;
			}
		}
	}
}

xa.I_edtOnConfig = function(apd, objID, local, tagDlg, tagLocal, tagOrg, onSet)
{
	// Media 위젯 목록
	var page = apd.getScreenData();
	var medias = [];

	for(var i in page.objects){
		if (page.objects[i].create && page.objects[i].create.data && page.objects[i].create.data.properties && page.objects[i].create.data.properties.attrs && page.objects[i].create.data.properties.attrs.apxMediaControl){
			medias.push({value:i, title:apd.itrGetObjectTitle(i)});
		}
	}
	eduLib.utilSortObjectsByTitle(apd, medias);
	medias.push({title:apn.CExe.GL(apn.CExe.TXT_SETUP_NOSEL), value:''});

	var _this = this;

	function onType()
	{
		eduLib.edtInputShow(apd, tagLocal, 'mute', this.value == 'mute');
		eduLib.edtInputShow(apd, tagLocal, 'fscrn', this.value == 'fscrn');

		if (tagDlg._uxWgtBtnImage_tmpType == this.value) return;
		tagDlg._uxWgtBtnImage_tmpType = this.value;

		switch(this.value){
			case '_stop':
				uxWgtBtnImage.I_edtOnConfigBuild.call(_this, apd, objID, tagDlg, tagOrg, 'simple');
				break;
			default: //나머지 모두
				uxWgtBtnImage.I_edtOnConfigBuild.call(_this, apd, objID, tagDlg, tagOrg, 'toggle');
				break;
		}
	}

	var mediaWgtId = local.idAudio; // 일반 Media와 YouTube를 구분하여 TYPE 목록을 제공하기 위한 것임
	
	function onChangeWgt()
	{
		mediaWgtId = this.value;
	}

	function onBuildtype()
	{
		var types = [
			{title:apn.CExe.GL({ko:'재생/중지',en:'Play(resume)/Pause'}), value:'pause'}
			,{title:apn.CExe.GL({ko:'재생/종료',en:'Play(resume)/Stop'}), value:'stop'}
			,{title:apn.CExe.GL({ko:'종료',en:'Stop'}), value:'_stop'}
		];

		var wgtModule;

		if (mediaWgtId && page.objects[mediaWgtId] && (wgtModule = apn.Project.getWidgetModule(page.objects[mediaWgtId].create.data))){
			if (!wgtModule.exeMediaCheck || wgtModule.exeMediaCheck('mute')){
				types.push({title:apn.CExe.GL({ko:'음소거',en:'Mute'}), value:'mute'});
			}
			if (!wgtModule.exeMediaCheck || wgtModule.exeMediaCheck('loop')){
				types.push({title:apn.CExe.GL({ko:'반복',en:'Loop'}), value:'loop'});
			}
			if (!wgtModule.exeMediaCheck || wgtModule.exeMediaCheck('supportFullScreen')){
				types.push({title:apn.CExe.GL({ko:'전체화면',en:'Full screen'}), value:'fscrn'});
			}
		}

		return types;
	}

	tagDlg._uxWgtBtnImage_tmpType = local.type;

	eduLib.edtInputAdd(apd, tagLocal, {type:'select', options:medias, title:apn.CExe.GL({ko:'연동할 위젯',en:'Media widget to interface with'})+' (m)', key:'idAudio', value:local, onchange:onChangeWgt, join:true});
	eduLib.edtInputAdd(apd, tagLocal, {type:'select', onchange:onType, onbuildoptions:onBuildtype, title:apn.CExe.GL({ko:'버튼 종류',en:'Type'})+' (m)', key:'type', value:local, join:true});
	eduLib.edtInputAdd(apd, tagLocal, {id:'mute', type:'select', title:apn.CExe.GL({ko:'모든 미디어 위젯에 적용',en:'Control all media widgets'}), options:[{title:apn.CExe.GL({ko:'예',en:'Yes'}),value:'Y'},{title:apn.CExe.GL({ko:'아니오',en:'No'}),value:''}], key:'all', value:local, join:true});
	eduLib.edtInputAdd(apd, tagLocal, {id:'fscrn', type:'message', value:apn.CExe.GL({ko:"※ IE10 이하 등에서는 지원되지 않는 기능입니다. 미지원되는 환경에서는 위젯이 자동 숨김 처리됩니다.",en:"※ This function is not supported on IE9/10 or so. In that case, this widget will be hidden automatically."}), join:true});
	eduLib.edtInputAdd(apd, tagLocal, {type:'space', join:true});
}

xa.I_edtOnConfig_title = function(apd, objID, tagDlg, state)
{
	switch(tagDlg._uxWgtBtnImage_tmpType){
		case 'stop':
		case 'pause':
			if (state == 'normal') return apn.CExe.GL({ko:'중지/종료 상태',en:'Stopped/Paused'});
			else if (state == 'disabled') return apn.CExe.GL({ko:'재생 상태',en:'Playing'});
			break;
		case '_stop':
			if (state == 'normal') return apn.CExe.GL({ko:'기본 상태',en:'Default state'});
			break;
		case 'loop':
			if (state == 'normal') return apn.CExe.GL({ko:'해제 상태',en:'Off state'});
			else if (state == 'disabled') return apn.CExe.GL({ko:'설정 상태',en:'On state'});
			break;
		case 'mute':
			if (state == 'normal') return apn.CExe.GL({ko:'해제 상태',en:'Off state'});
			else if (state == 'disabled') return apn.CExe.GL({ko:'설정 상태',en:'On state'});
			break;
		case 'fscrn':
			if (state == 'normal') return apn.CExe.GL({ko:'초기 상태',en:'Initial state'});
			else if (state == 'disabled') return apn.CExe.GL({ko:'전체화면 상태',en:'Fullscreen state'});
			break;
	}
}

xa.I_exeOnLoad_check = function(apx, oId)/*Boolean*/
{
	var tag = apx.wgtTag(oId);
	var cfg = apx.wgtGetProperty(oId, 'local');

	if (!cfg || !cfg.idAudio || !apx.wgtTag(cfg.idAudio)){
		apx.log(oId, apn.CExe.GL({ko:"제어할 '연동할 위젯'이 설정되지 않았거나 존재하지 않습니다.",en:"'Media widget to interface with' is not set or not exist."}));
		return false;
	}
	return true;
}

xa.I_exeOnLoad_post = function(apx, oId)
{
	var tag = apx.wgtTag(oId);
	var cfg = apx.wgtGetProperty(oId, 'local');

	tag.ctx = tag.ctx || {};
	tag.ctx.tagAudio = apx.wgtTag(cfg.idAudio).mediaTag; // 그냥 직접 Access함 %%INFO 이 부분 사용 안하는 듯... 2019/08
	tag.ctx.moduleAudio = apn.Project.getWidgetModule(apx.screen.objects[cfg.idAudio].create.data);

	/*	FullScreen 기능을 지원하지 않는 브라우저의 경우,
		위젯이 자동으로 Hide가 되도록 처리함
	*/
	if (cfg.type == 'fscrn' && !apx.wgtGetMediaInfo(cfg.idAudio, 'supportFullScreen')){
		tag.style.display = 'none';
	}

	//	Click Handler
	var _this = this;

	tag.apxOnEvent = function(apx, ev, sX, sY)/*Boolean*/
	{
		var useTapStart = (apn.dbUI && apn.dbUI.system && apn.dbUI.system.exeEventStart == true);
		var acceptEvent = 'click';

		if (useTapStart){
			//	Tap Start가 우선하는 파일에서 Tap Start에 반응함
			var exeProp = apn.Project.getLayout(apx.project).property.CExe;

			if (exeProp && exeProp.event && exeProp.event.TS1 == 'Y'){
				acceptEvent = 'tapStart';
			}
		}

		if (ev == acceptEvent){
			switch(cfg.type){
				case '_stop': // Stop button
					apx.wgtControlMedia(cfg.idAudio, 'stop');
					break;

				case 'loop': // Loop button
					if (tag.ctx.moduleAudio.exeMediaControl && tag.ctx.moduleAudio.exeMediaControl(apx.wgtTag(cfg.idAudio), cfg.type, apx.wgtGetProperty(oId, 'apxState') == 'normal')){
						if (apx.wgtGetProperty(oId, 'apxState') == 'normal'){
							apx.wgtSetProperty(oId, 'apxState', 'disabled'); // Selected
						}
						else{
							apx.wgtSetProperty(oId, 'apxState', 'normal');
						}
					}
					break;

				case 'mute': // Mute button
					if (_this._mute(apx, cfg.idAudio, cfg, apx.wgtGetProperty(oId, 'apxState') == 'normal')){
						if (apx.wgtGetProperty(oId, 'apxState') == 'normal'){
							apx.wgtSetProperty(oId, 'apxState', 'disabled'); // Selected
						}
						else{
							apx.wgtSetProperty(oId, 'apxState', 'normal');
						}
						tag.ctx._muteByBtn = true; // Volume change가 발생할 때, 이 Button이 발생시켰는지 확인하기 위한 FLAG
					}
					break;

				case 'stop':
					if (apx.wgtGetMediaInfo(cfg.idAudio, 'pause')) apx.wgtControlMedia(cfg.idAudio, 'resume');
					else apx.wgtControlMedia(cfg.idAudio, 'stop');
					break;

				case 'pause':
					if (apx.wgtGetMediaInfo(cfg.idAudio, 'pause')) apx.wgtControlMedia(cfg.idAudio, 'resume');
					else apx.wgtControlMedia(cfg.idAudio, 'pause');
					break;

				case 'fscrn':
					if (tag.ctx.fullScreen){
						apx.wgtSetMediaInfo(cfg.idAudio, 'fullScreen', false);
					}
					else{
						apx.wgtSetMediaInfo(cfg.idAudio, 'fullScreen', true);
					}
					break;
			}
			return true;
		}
	}

	// 연결: Media Listen
	function onMediaEvent(ev, p1, p2)
	{
		if (cfg.type == 'stop' || cfg.type == 'pause'){
			if (ev == 'trackStart' || ev == 'trackResume') apx.wgtSetProperty(oId, 'apxState', 'disabled');
			else if (ev == 'trackEnd' || ev == 'trackPause') apx.wgtSetProperty(oId, 'apxState', 'normal');
		}
		else if (cfg.type == 'mute'){
			/*	%%INFO
					System Mute button의 변화는 반응하지 않지만, Volume에는 UI 반응함
					또한, Script에 의한 mute대응
			*/
			if (ev == 'volumeChange'){
				if (tag.ctx._muteByBtn){
					tag.ctx._muteByBtn = false;
				}
				else{
					apx.wgtSetProperty(oId, 'apxState', !p2 && p1 ? 'normal' : 'disabled');
				}
			}
		}
	}
	apx.wgtListenMedia(oId, cfg.idAudio, onMediaEvent);

	/*	PlayerVol 위젯에 의한 Volume change를 수신하여 UI에 반영함
		Media의 정보를 수정하지는 않고 UI에 반영만 함

		%%INFO
		HTML5 VolumeChange는 Mute와 구분이 가지 않기 때문에, 그것을 들으면 Script 등에서 Mute 등의 동작을 할때 구분이 어려워 오히려 SideEffect가 있음
	*/
	function onCtxMediaVolChange(data)
	{
		if (cfg.type == 'mute'){
			if (data.oId && data.oId == cfg.idAudio){
				if (!apx.wgtGetMediaInfo(cfg.idAudio, 'mute')){ // Mute상태가 아니면 반영
					apx.wgtSetProperty(oId, 'apxState', data.vol ? 'normal' : 'disabled');
				}
			}
		}
	}
	apx.wgtListenContext(oId, 'apxMediaVolChange', onCtxMediaVolChange, /*always*/true);

	//	제어할 연동 위젯이 바뀌었을 때, 그 Listen를 교체하기 위한 함수임
	tag.ctx._resetListener = function(newMediaWgtId)
	{
		apx.wgtListenMedia(oId, cfg.idAudio, onMediaEvent, /*remove*/true);
		apx.wgtListenMedia(oId, newMediaWgtId, onMediaEvent);
	}
}

xa._mute = function(apx, audioID, cfg, value)/*Boolean*/
{
	var ret = false;

	if (cfg.all == 'Y'){ // 모든 Media의 값을 변경
		var wgts = apx.getWidgetsByProperty('apxMediaControl');

		for(var i = 0; i < wgts.length; i ++){
			if (apx.wgtSetMediaInfo(wgts[i], 'mute', value)) ret = true;
		}
	}
	else{
		if (apx.wgtSetMediaInfo(audioID, 'mute', value)) ret = true;
	}
	return ret;
}

xa.edtOnBuildState = function(prj, oId, pageID, ret)
{
	//	NONE
}

xa.edtOnRemapObjectID = function(apd, data, /*Object*/map)
{
	if (data && data.properties && data.properties.attrs && data.properties.attrs.local){
		var cfg = data.properties.attrs.local;

		if (cfg.idAudio){
			if (map[cfg.idAudio]) cfg.idAudio = map[cfg.idAudio];
			else if (!apd.getScreenData().objects[cfg.idAudio]) cfg.idAudio = '';
		}
	}
}

uxWgtPlayerBtn = xa;
////////////////////////////////////////////////////////////////////////////////
// ux.wgt.playerTime
/*
	Media Player에서 Play Time 표시 부분임
*/
var xa = apn.inheritWidget(apn.widgets['apn.wgt.roundRect']);
xa.apnWgtRectVer = 2;

/*	Pause 기능을 가진 Annotation을 위하여 Seek이 playTime을 Drag 중 바꾸지 않는 기능이 추가됨
	이러한 경우, 시간은 계산 시간을 표시해줘야 하므로,
	attrs.currentTime
	을 추가함. 즉 Seek이 Time을 직접 지정해주기 위한 것임

	sec 또는 '%'로 끝나는 Percent
*/
xa.properties = {
	attrs:{
		uxMediaPlayer:true
		,cfg:{
			idAudio:''
		}
	}
};

//xa.editor = xa.editor || {};
//xa.editor.iconThumb = 'imgs/wgts/thumbs/video.png';

xa.styles = xa.styles || {};
xa.styles.text = '00:00 / 00:00';

xa.edtOnConfig = function(apd, objID)
{
	var cfg = apd.wgtGetProperty(objID, 'cfg');
	var tagDlg;

	// Media 위젯 목록
	var page = apd.getScreenData();
	var medias = [];

	for(var i in page.objects){
		if (page.objects[i].create && page.objects[i].create.data && page.objects[i].create.data.properties && page.objects[i].create.data.properties.attrs && page.objects[i].create.data.properties.attrs.apxMediaControl){
			medias.push({value:i, title:apd.itrGetObjectTitle(i)});
		}
	}
	eduLib.utilSortObjectsByTitle(apd, medias);
	medias.push({title:apn.CExe.GL(apn.CExe.TXT_SETUP_NOSEL), value:''});

	function onOK()
	{
		eduLib.edtInputApplyAll(apd, tagDlg);
		apd.wgtSetProperty(objID, 'cfg', cfg);
	}

	if (tagDlg = apd.dlgDoModal(640, 200, onOK)){
		eduLib.edtInputAdd(apd, tagDlg, {type:'select', options:medias, title:apn.CExe.GL({ko:'연동할 위젯',en:'Media widget to interface with'})+' (m)', key:'idAudio', value:cfg, join:true});
	}
}

xa.exeRenderTag = function(viewer, canvas, tag, objData, zx, zy)/*Element*/
{
	//	Text가 흔들리는 증상을 막기 위해서 모두 ver=2로 지정함
	objData.create.data.properties.ver = 2;

	return apn.widgets['apn.wgt.roundRect'].exeRenderTag.call(this, viewer, canvas, tag, objData, zx, zy);
}

xa.exeOnForceStyle = function(file, styles)
{
	styles.textPadding = 0; // Padding이 없는 것이 좋은 위젯임
}

xa.exeOnLoad = function(apx, oId)
{
	var tag = apx.wgtTag(oId);
	var cfg = apx.wgtGetProperty(oId, 'cfg');

	if (!cfg.idAudio || !apx.wgtTag(cfg.idAudio)){
		apx.log(oId, apn.CExe.GL({ko:"제어할 '연동할 위젯'이 설정되지 않았거나 존재하지 않습니다.",en:"'Media widget to interface with' is not set or not exist."}));
		return;
	}

	tag.ctx = {};
	tag.ctx.tagAudio = apx.wgtTag(cfg.idAudio);

	// 연결: Media Listen
	function format(sec)/*String*/
	{
		sec = Math.round(sec);
		if (!sec) sec = 0; // Media 오류에 의한 NaN, Infinity 방지

		return (Math.floor(sec/60) < 10 ? '0':'')+Math.floor(sec/60)+':'+((sec%60) < 10 ? '0':'')+(sec%60);
	}

	function onMediaEvent(ev, p1, p2)
	{
		var cur, updated;

		if (ev == 'infoPlayTime' || ev == 'infoDuration'){
			// 크롬의 경우, Play 끝 부분에 값이 튀기 때문에, 최초에 받은 값을 표시하기 위한 것임
			tag.ctx._duration = p2;
			cur = 0;
			tag.ctx._curTime = cur;
			updated = true;
		}
		if (ev == 'infoPlayTime' || ev == 'infoDuration'){
			if (p1 !== undefined && p2){
				cur = p1;
				tag.ctx._curTime = cur;
				updated = true;
			}
		}
		else if (ev == 'trackEnd'){ // 종료가 되면 UI 목적으로 값을 Reset함
			cur = 0;
			updated = true;
		}

		if (updated&&tag.ctx._duration) apx.wgtSetProperty(oId, 'apxText', format(cur)+' / '+format(tag.ctx._duration));
	}
	apx.wgtListenMedia(oId, cfg.idAudio, onMediaEvent);

	//	currentTime: 시간을 외부에서 지정함
	function onSetCurrentTime(changeWgtId, value)
	{
		if (changeWgtId == oId && tag.ctx._duration){
			if (typeof value == 'string' && value.length > 1 && value[value.length-1] == '%'){
				value = (parseFloat(value)/100)*tag.ctx._duration;
			}

			apx.wgtSetProperty(oId, 'apxText', format(value)+' / '+format(tag.ctx._duration));
		}
	}
	apx.wgtListenProperty(oId, 'currentTime', onSetCurrentTime);
}

/*	currentTime: Get-Only
		second:Sec|null, play 기록이 없으면, null. UI 목적이 아니므로, Play가 종료되어도 마지막 시간을 유지함. 
*/
xa.exePropGet = function(apx, oId, key, /*Boolean|undefined*/check)
{
	if (key == 'currentTime'){
		if (check){
			 return true;
		}
		else{
			var tag = apx.wgtTag(oId);

			if (tag && tag.ctx){
				if (tag.ctx._curTime === undefined) return null;
				else return tag.ctx._curTime;
			}
		}
	}
}

xa.edtOnRemapObjectID = function(apd, data, /*Object*/map)
{
	if (data && data.properties && data.properties.attrs && data.properties.attrs.cfg){
		var cfg = data.properties.attrs.cfg;

		if (cfg.idAudio){
			if (map[cfg.idAudio]) cfg.idAudio = map[cfg.idAudio];
			else if (!apd.getScreenData().objects[cfg.idAudio]) cfg.idAudio = '';
		}
	}
}

//	Return: [{font:String, str:Stirng},...]
xa.pubOnGetText = function(prj, pId, oId)
{
	//	Font
	var data = prj.pages[pId].objects[oId].create.data;
	var font;

	if (data.styles && data.styles.font) font = data.styles.font;
	font = apn.Project.resolveStyle(prj, 'font', font);

	return [{font:font, str:'0123456789:/'}];
}

uxWgtPlayerTime = xa;
////////////////////////////////////////////////////////////////////////////////
// ux.wgt.playerVol
/*
	Media Player에서 Volume Bar/Handle 부분임

	Bar이미지, On상태의 Bar이미지, Handle 이미지로 구성이 되며,
	Handle이미지가 없으면 Drag에 의한 Handle기능은 동작하지 않고, Bar에 대한 Drag/Click방식만 동작함.
*/
var xa = apn.inheritWidget(apn.widgets['apn.wgt.rect']);

xa.styleMap = {
	title:true
	,visibility:true
	,alpha:true
	,mediaID:true
	,csr:true
}

xa.editor = xa.editor || {};
xa.editor = {};
xa.editor.iconThumb = 'imgs/wgts/thumbs/video.png';

xa.properties = {
	attrs:{
		uxMediaPlayer:true
		,cfg:{
			idAudio:''
			,bar:{mediaID:undefined}, barOn:{mediaID:undefined}
			,handle:{normal:{mediaID:undefined}, hover:{mediaID:undefined}, down:{mediaID:undefined}} // (o) bar, handle.normal은 최소 있어야 표시됨, barPlayed는 3patch이므로 Image preloading이 필요함
			,dir:'H'
			,all:''
		}
	}
};

xa.onEdit = undefined;

xa.createAsCanvasObject = function(/*Object*/prj, /*Object*/position, /*Object*/size, /*Object|undefined*/styles, /*Object|undefined*/property)/*Object*/
{
	return apn.IWidget.createCanvasObject(prj, this, 'apn.CImage', bx.CCanvasWnd.SHAPE_RECT, position, size, styles, property, undefined, apn.CEditorS.NO_RESIZE);
}

//	Media Seek과 달리 전체 영역이 사용자 입력에 반응하므로 Widget전체에 대해서 Cursor를 지정함
xa.exeOnForceStyle = function(file, styles)
{
	if (!styles.csr || styles.csr == 'apn.auto'){
		styles.csr = 'pointer';
	}
}

xa.exeOnLoad = function(apx, oId)
{
	var tag = apx.wgtTag(oId);

	delete tag.textTag;
	tag.style.overflow = 'visible'; // Handle이 움직이면 공간 밖으로 나가므로
	var cfg = apx.wgtGetProperty(oId, 'cfg');

	if (!cfg.idAudio || !apx.wgtTag(cfg.idAudio)){
		apx.log(oId, apn.CExe.GL({ko:"제어할 '연동할 위젯'이 설정되지 않았거나 존재하지 않습니다.",en:"'Media widget to interface with' is not set or not exist."}));
		return;
	}
	if (!cfg.bar.mediaID || !cfg.barOn.mediaID){
		apx.log(oId, apn.CExe.GL({ko:"필수 '이미지'가 설정되지 않았거나 존재하지 않습니다.", en:"Mandatory 'Images' are not set or not exist."}));
		return;
	}

	tag.ctx = {};
	tag.ctx.tagAudio = apx.wgtTag(cfg.idAudio);
	tag.ctx.moduleAudio = apn.Project.getWidgetModule(apx.screen.objects[cfg.idAudio].create.data);
	tag.ctx._wHandle = 0;
	tag.ctx._hHandle = 0;
	tag.ctx._dir = cfg.dir;

	//	Bar Image
	tag.style.background = 'url('+apx.mediaURL(cfg.bar.mediaID)+') no-repeat center center';
	tag.$CSS('backgroundSize', '100% 100%');

	//	Bar On Image
	tag.ctx.tagBarOn = tag.$TAG('div', {style:'overflow:hidden;cursor:inherit;position:absolute;left:0px;top:0px;width:'+tag.style.width+';height:'+tag.style.height+';'});
	tag.ctx.tagBarOn._img = tag.ctx.tagBarOn.$TAG('img', {style:'cursor:inherit;position:absolute;left:0px;top:0px;width:'+tag.style.width+';height:'+tag.style.height+';', alt:''});
	tag.ctx.tagBarOn._img.src = apx.mediaURL(cfg.barOn.mediaID);

	//	Drag Handle
	var _this = this;

	if (cfg.handle.normal.mediaID){
		tag.ctx.tagHandle = tag.$TAG('img', {style:'display:none;position:absolute;cursor:inherit;', alt:''});
		
		tag.ctx.tagHandle.onload = function()
		{
			this.style.display = 'block';

			tag.ctx._wHandle = Math.round((1/apx.getZoomX())*this.naturalWidth);
			tag.ctx._hHandle = Math.round((1/apx.getZoomY())*this.naturalHeight);

			this._offX = -Math.round((tag.ctx._wHandle - parseInt(tag.style.width))/2);
			this._offY = -Math.round((tag.ctx._hHandle - parseInt(tag.style.height))/2);

			if (cfg.dir == 'V'){
				this.style.left = this._offX+'px';
				this.style.top = '0px';
			}
			else{
				this.style.left = '0px';
				this.style.top = this._offY+'px';
			}

			this.style.width = tag.ctx._wHandle+'px';
			this.style.height = tag.ctx._hHandle+'px';

			_this._barRender(apx, tag, apx.wgtGetMediaInfo(tag.ctx.tagAudio.apnOID, 'volume'));
		}
		tag.ctx.tagHandle.src = apx.mediaURL(cfg.handle.normal.mediaID);

		if (cfg.dir == 'V'){
			apx.tagDraggable(tag.ctx.tagHandle, false, /*Y*/true);
		}
		else{
			apx.tagDraggable(tag.ctx.tagHandle, true);
		}

		tag.ctx.tagHandle.apxOnDrag = function(apx, sX, sY)
		{
			var ret = true;

			if (cfg.dir == 'V'){
				var tagH = parseInt(tag.style.height);

				if (sY < 0){
					this.style.top = '0px';
					ret = false;
				}
				if (sY > tagH-tag.ctx._hHandle){
					this.style.top = (tagH-tag.ctx._hHandle)+'px';
					ret = false;
				}

				var value = 1 - (Math.max(0, Math.min(1, parseInt(this.style.top)/(tagH-tag.ctx._hHandle)))||0);
			}
			else{
				if (sX < 0){
					this.style.left = 0+'px';
					ret = false;
				}
				if (sX > parseInt(tag.style.width)-tag.ctx._wHandle){
					this.style.left = (parseInt(tag.style.width)-tag.ctx._wHandle)+'px';
					ret = false;
				}

				var value = Math.max(0, Math.min(1, parseInt(this.style.left)/(parseInt(tag.style.width)-tag.ctx._wHandle)))||0;
			}

			_this._barRender(apx, tag, value);
			_this._volume(apx, tag.ctx.tagAudio.apnOID, cfg, value);

			return ret;
		}

		tag.ctx.tagHandle.apxOnDragStart = function(apx)
		{
			//	Drag 제어 기능을 가진 실행기에서 이 위젯이 Overlay Page에 있으면 Drag 제어 기능을 호출함. 아래 Page의 Drag를 막기 위한 것임
			if (apx.viewer.ISub_pauseDrag && apx.screen.module == 'apn.COverlayPage'){
				//	논리적으로는 X,Y의 반대 방향만 막으면 되지만, 손에 의하여 조금씩 흔들릴 수 있으므로 X, Y를 모두 막음
				apx.viewer.ISub_pauseDrag(true, true);
			}

			this._inDrag = true; // Drag 중에는 Media의 Time 변화에 대응하지 않도록 하기 위해서
			return true;
		}
		tag.ctx.tagHandle.apxOnDragEnd = function(apx)
		{
			//	Drag 제어 기능을 가진 실행기에서 이 위젯이 Overlay Page에 있으면 Drag 제어 기능을 호출함. 아래 Page의 Drag를 막기 위한 것임
			if (apx.viewer.ISub_pauseDrag && apx.screen.module == 'apn.COverlayPage'){
				//	논리적으로는 X,Y의 반대 방향만 막으면 되지만, 손에 의하여 조금씩 흔들릴 수 있으므로 X, Y를 모두 막음
				apx.viewer.ISub_pauseDrag(false, false);
			}

			this._inDrag = false;
			return true;
		}
	}

	//	Bar을 통해서 조절하는 기능
	tag.apxOnDragStart = function(apx, sX, sY, sysEV, localX, localY)
	{
		//	Drag 제어 기능을 가진 실행기에서 이 위젯이 Overlay Page에 있으면 Drag 제어 기능을 호출함. 아래 Page의 Drag를 막기 위한 것임
		if (apx.viewer.ISub_pauseDrag && apx.screen.module == 'apn.COverlayPage'){
			//	논리적으로는 X,Y의 반대 방향만 막으면 되지만, 손에 의하여 조금씩 흔들릴 수 있으므로 X, Y를 모두 막음
			apx.viewer.ISub_pauseDrag(true, true);
		}

		this._inDrag = true;
		tag.apxOnDrag(apx, 0, 0, sX, sY, sysEV, localX, localY);
		return true;
	}
	
	tag.apxOnDragEnd = function(apx)
	{
		//	Drag 제어 기능을 가진 실행기에서 이 위젯이 Overlay Page에 있으면 Drag 제어 기능을 호출함. 아래 Page의 Drag를 막기 위한 것임
		if (apx.viewer.ISub_pauseDrag && apx.screen.module == 'apn.COverlayPage'){
			//	논리적으로는 X,Y의 반대 방향만 막으면 되지만, 손에 의하여 조금씩 흔들릴 수 있으므로 X, Y를 모두 막음
			apx.viewer.ISub_pauseDrag(false, false);
		}

		this._inDrag = false;
		return true;
	}

	tag.apxOnDrag = function(apx, x, y, sX, sY, sysEV, localX, localY)
	{
		//	Drag가 되는 실행기의 경우, PM.tag가 이동하므로 반영해야 함. PDF실행기 등 ...
		if (apx.viewer.ISub_pauseDrag){
			var pmTag = apx.viewer.getPM().tag;
			var pmTagX = parseInt(pmTag.style.left);
			var pmTagY = parseInt(pmTag.style.top);

			var tagSX = bx.HCL.getElementX2(tag) - bx.HCL.getElementX(pmTag);
			var tagSY = bx.HCL.getElementY2(tag) - bx.HCL.getElementY(pmTag);

			sX = apx.viewer.onGestureCoordTransformX(sysEV.clientX - pmTagX, sysEV.clientY - pmTagY);
			sY = apx.viewer.onGestureCoordTransformY(sysEV.clientX - pmTagX, sysEV.clientY - pmTagY);

			localX = sX - tagSX;
			localY = sY - tagSY;
		}

		if (cfg.dir == 'V'){
			var value = 1 -  (Math.max(0, Math.min(1, localY/(parseInt(tag.style.height)-tag.ctx._hHandle)))||0);
		}
		else{
			var value = Math.max(0, Math.min(1, localX/(parseInt(tag.style.width)-tag.ctx._wHandle)))||0;
		}

		_this._barRender(apx, tag, value);
		_this._volume(apx, tag.ctx.tagAudio.apnOID, cfg, value);

		return false;
	}
	
	apx.tagDraggable(tag, true);

	//	연결: volumeChange
	function onMediaEvent(ev, p1, p2)
	{
		if (tag.ctx.tagHandle && tag.ctx.tagHandle._inDrag) return;
		if (tag._inDrag) return;

		if (ev == 'volumeChange'){
			_this._barRender(apx, tag, p1);
		}
	}
	apx.wgtListenMedia(oId, cfg.idAudio, onMediaEvent);
}

xa.exeOnStart = function(apx, oId)
{
	var tag = apx.wgtTag(oId);

	if (tag.ctx && tag.ctx.tagAudio){
		var cfg = apx.wgtGetProperty(oId, 'cfg');

		if (!(cfg.vol === undefined ||  cfg.vol === '')){
			this._volume(apx, tag.ctx.tagAudio.apnOID, cfg, parseFloat(cfg.vol));
		}
	}
}

xa._volume = function(apx, audioID, cfg, value)
{
	if (cfg.all == 'Y'){ // 모든 Media의 값을 변경
		var wgts = apx.getWidgetsByProperty('apxMediaControl');

		for(var i = 0; i < wgts.length; i ++){
			apx.wgtSetMediaInfo(wgts[i], 'volume', value);
		}
	}
	else{
		apx.wgtSetMediaInfo(audioID, 'volume', value);
	}

	//	Volume 변경을 통보함. PlayerBtn 등이 수신함
	apx.ctxSet('apxMediaVolChange', {oId:audioID, vol:value});
}

//	Handle에 따라서 BarOn 영역을 표시함
xa._barRender = function(apx, tag, value)
{
	if (tag.ctx._dir == 'V'){
		//	가로 Bar와 제어축 방향이 반대임
		var tagH = parseInt(tag.style.height);
		var barH = (value*(tagH-tag.ctx._hHandle)+tag.ctx._hHandle/2);

		tag.ctx.tagBarOn.style.top = (tagH - barH) + 'px';
		tag.ctx.tagBarOn.style.height = barH+'px';

		if (tag.ctx.tagHandle){
			tag.ctx.tagHandle.style.top = (1-value)*(tagH-tag.ctx._hHandle)+'px';
		}
	}
	else{
		tag.ctx.tagBarOn.style.width = (value*(parseInt(tag.style.width)-tag.ctx._wHandle)+tag.ctx._wHandle/2)+'px';
		
		if (tag.ctx.tagHandle){
			tag.ctx.tagHandle.style.left = value*(parseInt(tag.style.width)-tag.ctx._wHandle)+'px';
		}
	}
}

xa.edtOnRemapObjectID = function(apd, data, /*Object*/map)
{
	if (data && data.properties && data.properties.attrs && data.properties.attrs.cfg){
		var cfg = data.properties.attrs.cfg;

		if (cfg.idAudio){
			if (map[cfg.idAudio]) cfg.idAudio = map[cfg.idAudio];
			else if (!apd.getScreenData().objects[cfg.idAudio]) cfg.idAudio = '';
		}
	}
}

xa.edtOnConfig = function(apd, objID)
{
//	var msg = {
//		en:"※ In case of mobile device, this widget may not work due to HW volume control button."
//		,ko:"※ 모바일 기기의 경우, HW 버튼으로 제어하기 때문에 이 위젯이 동작하지 않을 수 있습니다."
//	};

	var cfg = apd.wgtGetProperty(objID, 'cfg');
	var tagDlg;

	// Media 위젯 목록
	var page = apd.getScreenData();
	var medias = [];
	var buf, wgtModule;

	for(var i in page.objects){
		buf = page.objects[i].create.data;
		wgtModule = apn.Project.getWidgetModule(buf);

		if (buf && buf.properties && buf.properties.attrs && buf.properties.attrs.apxMediaControl && wgtModule && (!wgtModule.exeMediaCheck || wgtModule.exeMediaCheck('volume'))){
			medias.push({value:i, title:apd.itrGetObjectTitle(i)});
		}
	}
	eduLib.utilSortObjectsByTitle(apd, medias);
	medias.push({title:apn.CExe.GL(apn.CExe.TXT_SETUP_NOSEL), value:''});

	function onOK()
	{
		eduLib.edtInputApplyAll(apd, tagDlg);
		if (cfg.bar.mediaID) apd.wgtSetProperty(objID, 'apxMediaID', cfg.bar.mediaID, true);
		apd.wgtSetProperty(objID, 'cfg', cfg);
	}

	if (tagDlg = apd.dlgDoModal(640, 600, onOK)){
		eduLib.edtInputAdd(apd, tagDlg, {type:'select', options:medias, title:apn.CExe.GL({ko:'연동할 위젯',en:'Media widget to interface with'})+' (m)', key:'idAudio', value:cfg, join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'select', title:apn.CExe.GL({ko:'방향',en:'Direction'}), options:[{title:apn.CExe.GL({ko:'세로',en:'Vertical'}),value:'V'},{title:apn.CExe.GL({ko:'[가로]',en:'[Horizontal]'}),value:'H'}], key:'dir', value:cfg, join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
		eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:apn.CExe.GL({ko:'이미지',en:'Images'})});
		eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:apn.CExe.GL({ko:'볼륨바',en:'Bar'})+' (m)', value:cfg, key:'bar', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:apn.CExe.GL({ko:'볼륨바 - On',en:'Bar - On'})+' (m)', value:cfg, key:'barOn', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:apn.CExe.GL({ko:'볼륨핸들',en:'Handle'}), value:cfg.handle, key:'normal', join:true});

		eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:apn.CExe.GL(apn.CExe.TXT_SETUP_OPTS)});
		eduLib.edtInputAdd(apd, tagDlg, {type:'select', title:apn.CExe.GL({ko:'초기 볼륨',en:'Initial volume'}), key:'vol', value:cfg, options:[{title:apn.CExe.GL({ko:'[음소거]',en:'[Mute]'}),value:0}, {title:'10%',value:0.1}, {title:'20%',value:0.2}, {title:'30%',value:0.3}, {title:'40%',value:0.4}, {title:'50%',value:0.5}, {title:'60%',value:0.6}, {title:'70%',value:0.7}, {title:'80%',value:0.8}, {title:'90%',value:0.9}, {title:'100%',value:1}, {title:apn.CExe.GL({ko:'[현재 볼륨]',en:'[Current volume]'}),value:''}], join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'select', title:apn.CExe.GL({ko:'모든 미디어 위젯에 적용',en:'Control all media widgets'}), options:[{title:apn.CExe.GL({ko:'예',en:'Yes'}),value:'Y'},{title:apn.CExe.GL({ko:'아니오',en:'No'}),value:''}], key:'all', value:cfg, join:true});

//		eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
//		eduLib.edtInputAdd(apd, tagDlg, {type:'message', value:apn.CExe.GL(msg), join:true});
	}
}

uxWgtPlayerVol = xa;
