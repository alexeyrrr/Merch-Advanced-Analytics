/*Created by Alexey Rom, Based on MerchTool by HandyTools */
function openMerchAnalytics(info, tab) {
	l2 = "https://merch.amazon.com/MerchAnalytics";
	chrome.tabs.create({ url: l2 });
};
	
chrome.contextMenus.create({
	"title": "Open Merch Analytics", contexts:["browser_action"], onclick: function(info, tab) { 
		openMerchAnalytics(); 
	}
});

//Make Analytics Clickable
chrome.notifications.onClicked.addListener(function(notificationId, byUser) {
	openMerchAnalytics();
});

var option = {
		playSound: true, //change to true 
		showNotif: true
	};

var SaleSound = new Audio();
    SaleSound.src = "/sound/win.mp3"; 

var losssound  = new Audio(); 
    losssound.src = "/sound/loss.wav";

var currentsales = '{"royaltySymbol":"$","revenueValue":"0","royaltyValue":"0","productsSold":"0","revenueSymbol":"$"}';
var chng = 0 ;

var shirtsSoldToday = [];

//Disable sales notification first time
var firstInstall = false;	
	
chrome.runtime.onInstalled.addListener(function(details){
	if (details.reason === "update" && details.previousVersion) {
		let newVersion = chrome.runtime.getManifest().version;

		//UPDATE MESSAGE
		/*
		chrome.notifications.create(undefined, {
			type: 'basic',
			title: 'Updated: New Pricing Analytics ',
			isClickable: true,
			iconUrl: '/img/logo-square.png',
			message: "We added pricing analytics to the daily and monthly pages. Individual Product Detail pages have also been improved. For other suggestions: alex@venmarkstudio.com"
		});	
		*/
		
	} else {
		chrome.notifications.create(undefined, {
			type: 'basic',
			title: 'Welcome To Merch Advanced Analytics',
			isClickable: true,
			iconUrl: '/img/logo-square.png',
			message: "Your niche optimization journey begins! Click to go to dashboard."
		});	
	}
	
	//For disabling a few things on first install / update
	firstInstall = true;
});

function csvToJSON(csv) {
  var lines=csv.split("\n");
  var result = [];
  var headers = lines[0].split(",");

  for(var i=1; i<lines.length; i++) {
    var obj = {};

    var row = lines[i],
      queryIdx = 0,
      startValueIdx = 0,
      idx = 0;

    if (row.trim() === '') { continue; }

    while (idx < row.length) {
      var c = row[idx];

      if (c === '"') {
        do { c = row[++idx]; } while (c !== '"' && idx < row.length - 1);
      }

      if (c === ',' || idx === row.length - 1) {
        var value = row.substr(startValueIdx, idx - startValueIdx).trim();

        if (value[0] === '"') { value = value.substr(1); }
        if (value[value.length - 1] === ',') { value = value.substr(0, value.length - 1); }
        if (value[value.length - 1] === '"') { value = value.substr(0, value.length - 1); }

        var key = headers[queryIdx++];
        obj[key] = value;
        startValueIdx = idx + 1;
      }

      ++idx;
    }

    result.push(obj);
  }
  return result;
}

var checkforsales = function() {
	chrome.storage.sync.get("Settings", function(items) {
		if(Object.values(items).length != 0){
			parsedJson = JSON.parse(items["Settings"]);
			option.playSound = parsedJson["sound"];
			option.showNotif = parsedJson["popup"];
		}
		
		var salesAnalytics = 'https://merch.amazon.com/product-purchases-summary'; //https://merch.amazon.com/salesAnalyticsSummary
		var req = new XMLHttpRequest();
		req.open("GET", salesAnalytics, true);
		req.onreadystatechange = function() {
			if (req.readyState == 4) { 
				if ([200,201,202,203,204,205,206,207,226].indexOf(req.status) === -1) {          
								
				} else {
					if (req.responseText.indexOf('AuthenticationPortal') != -1) {
						chrome.browserAction.setBadgeText({ text: " " });
						chrome.browserAction.setBadgeBackgroundColor({color: '#FFD700' });
					} else{
						var firstInstallInner = firstInstall; //Reset Scope
						chrome.browserAction.setBadgeBackgroundColor({ color: '#008000' }); 
						chrome.browserAction.setBadgeText({ text: " " });
						
						var sales = JSON.parse(req.responseText);
						chrome.browserAction.setBadgeText({ text: sales.productsSold }); 
							
						if(currentsales != req.responseText) {
							var xsales = JSON.parse(currentsales);
							chng = parseInt(sales.productsSold) - parseInt(xsales.productsSold);
							
							if (chng < 0 ){
								if(!firstInstallInner){								
									if(option.playSound) {  
										losssound.play();    
									}
									if(option.showNotif) {  
										chrome.notifications.create(undefined, {
											type: 'basic',
											title: 'Sales Decreased',
											iconUrl: '/img/can.png',
											message: "New day maybe? ("+chng +")."
										});
									}
								}
								chrome.browserAction.setBadgeBackgroundColor({ color: '#cc0000' });

							} else if (chng >= 1 && chng <= 3) {
								if(!firstInstallInner){
									if(option.playSound) { 
										SaleSound.play();    
									}
									if(option.showNotif) {  
										var toDate = moment();
										var endDate = moment().startOf('day');

										var sls = 'https://merch.amazon.com/product-purchases-report?fromDate=' + endDate + '&toDate=' + toDate ;
										var reqs = new XMLHttpRequest();
										reqs.open("GET", sls, true);
										reqs.onreadystatechange = function() {
											if (reqs.readyState == 4) {
												if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {

												} else {
													if (reqs.responseText.indexOf('AuthenticationPortal') != -1) {
														generateLoginModal();
													} else {
														newShirtsSold = csvToJSON(reqs.responseText);
															
														var diff = $(newShirtsSold).not(shirtsSoldToday).get();
														
														for(var i=0; i < diff.length; i++ ) {
															var shirtsale = diff[i]["Name"];
															
															chrome.notifications.create(undefined, {
																type: 'basic',
																title: 'New Shirt Sale',
																iconUrl: '/img/sales.png',
																message: "Sold: " + shirtsale +""
															});
														}
													}
												};
											};
										};
										reqs.send();
									}
								}
								chrome.browserAction.setBadgeBackgroundColor({ color: '#008000' });
								
							} else if (chng > 3){
								if(!firstInstallInner){
									if(option.playSound) { 
										SaleSound.play();    
									}
									if(option.showNotif) {  
										chrome.notifications.create(undefined, {
											type: 'basic',
											title: 'New Sales!',
											iconUrl: '/img/sales.png',
											message: "Good Job! "+chng +" new sales."
										});
									}
								}
								
								chrome.browserAction.setBadgeBackgroundColor({ color: '#008000' });
							}
						   
							
							currentsales = req.responseText;
							
							firstInstall = false;
						}
					}
				
				}
			}
		};
		req.send();
		
	});
};

setInterval(checkforsales, 60000);
checkforsales();
