/*!
 *  MsgPop by Anthony J. Laurene - 10/1/2014
 *  License - (JS: MIT License, CSS: MIT License)
 *  Change History:
 *  - Added HH:mm:ss:ms to the MsgPop text
 *  - Added sortOrder to show the latest at the top of the list, instead of bottom
 *  - Disabled the mobile check since we will want to show the same on any device.
 *  - Updated text for "Load More Messages" to "Load New Messages".
 *  - Future enhancement: Load New Messages should hide the older messages instead of the new ones.
 */

var MsgPop = initMsgPop();

function initMsgPop()
{
	MsgPop = {};

	//Public properties
	MsgPop.effectSpeed = 250;
	MsgPop.limit = 8;
	MsgPop.displaySmall = true;
	MsgPop.position = "bottom-right";
	//Desc - Descending means insert new item at the top of list
	//Asc - Ascending means insert new item at the bottom of the list.
    MsgPop.sortOrder = "Desc";

	//Protected properties
	var msgPopCount = 0;
	var msgPopActionID = 0;
	var msgPopContainer, closeAllBtn, loadMoreBtn;
	var containerCreated = false;
	var closeAllBtnCreated = false;
	var loadMoreBtnCreated = false;
	var msgPopQueueSize = 30;

	/* Disabling this feature, to have same display as on tablet.
	//Browser check
	var deviceAgent = navigator.userAgent.toLowerCase();
	var notMobile = (deviceAgent.match(/(iphone|ipod|ipad)/) || deviceAgent.match(/(android)/)) ? false : true;
    */

	//Protected methods
	var	createContainer = function(){
		if(containerCreated == false){
			containerCreated = true;
			//if(MsgPop.displaySmall && notMobile){
				container = $('<div id="msgPopContainer" class="msgPop-'+MsgPop.position+' msgPopContainerSmall msgPopContainerOverflow"></div>');
			//}
			//else{
			//	container = $('<div id="msgPopContainer" class="msgPop-top-right"></div>');
			//}

            $("body").append(container);
		}

		container = $("#msgPopContainer");
		container.stop(true,true).clearQueue().removeAttr("style");
		//if(MsgPop.displaySmall && notMobile){
			container.removeAttr('class').attr('class','msgPopContainerSmall msgPopContainerOverflow msgPop-'+MsgPop.position);
		//}
		//else{
		//	container.removeAttr('class').attr('class','msgPop-top-right');
		//}
		return container;
	}

	var createLoadMore = function(container){
		if(loadMoreBtnCreated == false){
			loadMoreBtnCreated = true;

			var msgMoreBtn = '<div id="msgDivMore" class="msgPopLoadMore">';
			msgMoreBtn += '<span onclick="javascript:MsgPop.showMoreMessages();">=== Load New Messages ===</span>';
			msgMoreBtn += '</div>';

			container.append(msgMoreBtn);
		}
		return $('#msgDivMore');
	}

	var createCloseAll = function(container){
		if (closeAllBtnCreated == false) {
			closeAllBtnCreated = true;
			var msgDivCloseAll = '<div type="button" id="msgPopCloseAllBtn" onclick="MsgPop.closeAll()">Close All Messages</div>';
			container.append(msgDivCloseAll);
		}
		return $("#msgPopCloseAllBtn");
	}

	MsgPop.open = function(obj){
		//Increment count build ID
		msgPopCount += 1;
		msgPopActionID += 1;
		var msgPopMessageID = 'msgPop' + msgPopActionID;

		//Create MsgPopContainer
		msgPopContainer = createContainer();

		//Merge Objects
		var defaultObject = {
			Type: "message",				// (message : success : error)
			AutoClose: true,		  		// (force : auto) -- force: user will have to click to close
			CloseTimer: 7000,		  		//  only applies to auto. Sets the timer in milliseconds before box closes
			ClickAnyClose: true,		  	// (true : false) -- true: user clicks anywhere on message to close -- false: user must click "X" to close
			HideCloseBtn: false,		  	// (true : false) -- show / hide close button
			BeforeOpen: function () { }, 	// Fires when the message has fully opened
			AfterOpen: function () { }, 	// Fires when the message begins opening
			BeforeClose: null, 				// Fires when the message begins to close
			AfterClose: null, 				// Fires when the message has closed
			ShowIcon: true,					// Show / Hide icon next to message
			MsgID: msgPopMessageID,	  		// Sets message ID for this specific call
			CssClass: "",					// Adds additional css classes to the message
			Icon: null						// Default Icon
		}

		obj = $.extend(mergedObj = {}, defaultObject, obj);	//overwrites any missing values with defaults
		obj = $.extend(mergedObj = {}, {MarkedForDelete:false}, obj);
		MsgPop[obj.MsgID] = obj; //creates a property on msgPop object that stores the current object.
		
		//queue size maximum number of msgpop objects, and remove outdated objects from queue
		if(MsgPop['msgPop' + (msgPopActionID-msgPopQueueSize)] !=null)
		{
			let id='msgPop' + (msgPopActionID-msgPopQueueSize);
			MsgPop.close(id,false);
		}

		var showMsg = (msgPopCount <= MsgPop.limit) ? true : false;

		//Create Message
		var closeAnywhere = (obj.ClickAnyClose) ? 'onclick="MsgPop.close(\''+obj.MsgID+'\')"' : '';
		var msgDivHtml = '<div id="'+obj.MsgID+'" role="alert" title="'+obj.Type+'" '+closeAnywhere+'></div>';
		var msg = $(msgDivHtml);

		switch (obj.Type) {
			case "success":
				msg.attr('class', 'msgPopSuccess ' + obj.CssClass);
				obj.Icon = (obj.Icon == null) ? '<i class="fa fa-check-circle"></i>' : obj.Icon;
				break;
			case "error":
				msg.attr('class', 'msgPopError ' + obj.CssClass);
				obj.Icon = (obj.Icon == null) ? '<i class="fa fa-ban"></i>' : obj.Icon;
				break;
			case "caution":
				msg.attr('class', 'msgPopCaution ' + obj.CssClass);
				obj.Icon = (obj.Icon == null) ? '<i class="fa fa-exclamation-circle"></i>' : obj.Icon;
				break;
			case "warning":
				msg.attr('class', 'msgPopWarning ' + obj.CssClass);
				obj.Icon = (obj.Icon == null) ? '<i class="fa fa-exclamation-triangle"></i>' : obj.Icon;
				break;
			case "message":
				msg.attr('class', 'msgPopMessage ' + obj.CssClass);
				obj.Icon = (obj.Icon == null) ? '<i class="fa fa-info-circle"></i>' : obj.Icon;
				break;
			default:
				msg.attr('class', 'msgPopMessage ' + obj.CssClass);
				obj.Icon = (obj.Icon == null) ? '<i class="fa fa-info-circle"></i>' : obj.Icon;
		}

        //Get current time
        var dt = new Date();
        var time = dt.getHours().toString().padStart(2,'0')  + ":" + dt.getMinutes().toString().padStart(2,'0')  + ":" + dt.getSeconds().toString().padStart(2,'0') + ":" +  dt.getMilliseconds().toString().padStart(3,'0')  ;

		//Create message content
		var msgDivContent = '<div class ="outerMsgPopTbl" id="outerMsgPopTbl_'+obj.MsgID+'"><div class="innerMsgPopTbl"><div class="msgPopTable">';
		msgDivContent += '<div class="msgPopTable-cell msgPopSpacer">&nbsp;</div>';
		msgDivContent += '<div class="msgPopTable-cell"><div class="msgPopTable-table">';
		if (obj.ShowIcon) {
			msgDivContent += '<div class="msgPopTable-cell" id="msgPopIconCell">' + obj.Icon + '</div>';
		}
		msgDivContent += '<div class="msgPopTable-cell">' + time + " | " + obj.Content + '</div>';
		msgDivContent += '</div></div>';
		msgDivContent += '<div class="msgPopTable-cell msgPop-align-right msgPopSpacer msgPopCloseCell" id="'+obj.MsgID+'CloseBtn">';
		if(obj.HideCloseBtn == false)
		{
			var closeBtnClick = (obj.ClickAnyClose) ? '' : 'onclick="MsgPop.close(\''+ obj.MsgID +'\')"';
			msgDivContent += '<a class="msgPopCloseLnk" title="Close" '+closeBtnClick+'><i class="fa fa-times"></i></a>';
		}
		msgDivContent += '</div>';
		msgDivContent += '</div></div></div>';
		msg.html(msgDivContent);

        //Added sounds for MsgPop plugin
        //NOTE: Currently this MsgPop is only used for Warning and Caution, when starting to use other features, may need different sounds.

	    //This check to make sure inactive  sound is only played once even when it is been published multiple times in a row
        // It will get reset when status changes back to engage
        if(g_sound_msgPop_played_once == false || g_play_audio_error==true)
        {
           playSound('audioAlert4', false);
            //make sure play audio does not return any error and successfully played once before update g_sound_played_once value
            if(g_play_audio_error == false){
                 g_sound_msgPop_played_once = true;
            }
        }

		//Create Load More & Close All Buttons
		loadMoreBtn = createLoadMore(container);
		closeAllBtn = createCloseAll(container);

		//Attach the message
		if (msgPopActionID <= 1 || MsgPop.sortOrder == "Asc")
		    //Attach Message before load more button.
		    //Or Ascending order, meaning insert at the bottom of the list.
		    loadMoreBtn.before(msg);
        else
        {
			
          //Descending order, or insert new item at the top of the list.
		  container.prepend(msg);
        }
		if(showMsg)
		{
		    //If still under the Msg limit, show the message right away.
			//Call Before Open
			obj.BeforeOpen();

			msg.stop(true,true).clearQueue().slideDown(MsgPop.effectSpeed, function () {
				obj.AfterOpen();

				//Choose display mode
				if(MsgPop.displaySmall)
				{
					container.addClass("msgPopContainerSmall");
				}
				else{
					container.removeClass("msgPopContainerSmall");
				}
			});

			if (obj.AutoClose) {
				obj.AutoCloseID = setTimeout(function () {
					MsgPop.close(obj.MsgID,false);
				}, obj.CloseTimer);
			}
		}
		else{
		    //Show the loadmore button
			loadMoreBtn.stop(true,true).clearQueue().slideDown(MsgPop.effectSpeed);
		}

		if(msgPopCount > 1){
			closeAllBtn.show();
		}
		else{
			closeAllBtn.hide();
		}

		return obj.MsgID;
	};

	MsgPop.close = function (msgID, isCloseAll) {
		var obj = MsgPop[msgID];
		if (typeof(obj) != "undefined" && obj.MarkedForDelete == false)
		{
			obj.MarkedForDelete = true;
			MsgPop[msgID] = obj;

			var isRegularClose = (isCloseAll) ? false : true;
			var message = $("#"+msgID);
			if(message.length != 0)
			{
				if (jQuery.isFunction(obj["BeforeClose"]))
				{
					obj.BeforeClose()
				}

				message.stop(true,true).clearQueue().slideUp(MsgPop.effectSpeed, function () {
					message.remove();

					if (jQuery.isFunction(obj["AfterClose"])) {
						obj.AfterClose();
					}
				});

				clearTimeout(obj.AutoCloseID);
				delete obj;				
				delete MsgPop[msgID];
			}
			msgPopCount -= 1;
			MsgPop.cleanUp(isCloseAll);

		}
	};

	MsgPop.closeAll = function (settings) {
		var defaultObject = {
			ClearEvents: 	false		// Closes each message and animates the close.
		};
		obj = $.extend(mergedObj = {}, defaultObject, settings);	//overwrites any missing values with defaults

		for (var property in MsgPop) {
			if (MsgPop.hasOwnProperty(property)) {
				clearTimeout(MsgPop[property].AutoCloseID);
			}
		}
		if(obj.ClearEvents)
		{
			UserSettings = {};
			UserSettings.effectSpeed = MsgPop.effectSpeed;
			UserSettings.limit = MsgPop.limit;
			UserSettings.displaySmall = MsgPop.displaySmall;
			UserSettings.position = MsgPop.position;
			UserSettings.sortOrder = MsgPop.sortOrder;

			initMsgPop();

			MsgPop.effectSpeed = UserSettings.effectSpeed;
			MsgPop.limit = UserSettings.limit;
			MsgPop.displaySmall = UserSettings.displaySmall;
			MsgPop.position = UserSettings.position;
			MsgPop.sortOrder = UserSettings.sortOrder;

			msgPopContainer.stop(true,true).clearQueue().remove();
		}
		else
		{
			var id;
			$('.msgPopError, .msgPopMessage, .msgPopCaution, .msgPopWarning, .msgPopSuccess').each(function () {
				id = $(this).attr("id");
				MsgPop.close(id, true);
			});
		}
	    //reset sound play after close popup
		g_sound_msgPop_played_once = false;
	}

	MsgPop.destroy = function()
	{
		delete(MsgPop);
		msgPopContainer.stop(true,true).clearQueue().remove();
	}

	MsgPop.showMoreMessages = function(){
		var currentMsg;
		var count = 0;
		var obj;

		$('.msgPopError:hidden, .msgPopMessage:hidden, .msgPopCaution:hidden, .msgPopWarning:hidden, .msgPopSuccess:hidden').each(function (data) {
			if (count < MsgPop.limit) {
				currentMsg = $(this);
				var msgID = currentMsg.attr("id");
				obj = MsgPop[msgID];

				if (obj.AutoClose) {
					obj.AutoCloseID = setTimeout(function () {
						MsgPop.close(msgID,false);
					}, obj.CloseTimer);
				}

				if(typeof(obj)!="undefined" && currentMsg.length != 0){
					if (jQuery.isFunction(obj["BeforeOpen"]))
					{
						obj.BeforeOpen();
					}

					currentMsg.stop(true,true).clearQueue().slideDown(MsgPop.effectSpeed, function () {
						if (jQuery.isFunction(obj["AfterOpen"]))
						{
							obj.AfterOpen();
						}

						MsgPop[msgID].AfterOpen();
					});
				}
			}

			count += 1;
		});

		if ($('.msgPopError:hidden, .msgPopMessage:hidden, .msgPopCaution:hidden, .msgPopWarning:hidden, .msgPopSuccess:hidden').length == 0) {
			loadMoreBtn.stop(true,true).clearQueue().slideUp(MsgPop.effectSpeed);
		}
	}

	MsgPop.cleanUp = function(isCloseAll) {
	    if (msgPopCount == 0)
	    {
			$('#msgPopContainer').stop(true,true).clearQueue().slideUp(MsgPop.effectSpeed, function(){
				if(msgPopCount==0){
					$(this).remove();
					closeAllBtn.remove();
					loadMoreBtn.remove();

					containerCreated = false;
					closeAllBtnCreated = false;
					loadMoreBtnCreated = false;
				}
			});

			loadMoreBtn.hide();
	    }
	    else if (msgPopCount == 1) {
			if(isCloseAll){
				closeAllBtn.hide();
			}
			else{
				closeAllBtn.stop(true,true).clearQueue().slideUp(MsgPop.effectSpeed);
			}
	    }
	}

	MsgPop.live = function(){
		$(document).ajaxSuccess(function (event, request, settings) {
			try {
				var messages = request.responseJSON.MsgPopQueue;

				MsgPop.closeAll();

				for (i = 0; i < messages.length; i++) {
					MsgPop.open(messages[i]);
				}
			} catch (e) { }
		});
	}

	return MsgPop;
}
