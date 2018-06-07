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

var change = 0;
var saleCount = 0;
var shirtsSoldToday = [];

//Disable sales notification first time
var firstInstall = false;	
	
chrome.runtime.onInstalled.addListener(function(details){
	if (details.reason === "update" && details.previousVersion) {
		let newVersion = chrome.runtime.getManifest().version;

		//UPDATE MESSAGE
		chrome.notifications.create(undefined, {
			type: 'basic',
			title: 'Update: Returns Color',
			isClickable: true,
			iconUrl: '/img/logo-square.png',
			message: "We updated the Returns color so it would be more vibrant. Also 'Never Sold' on the Manage page is now consistent with the 180 day policy."
		});	

	} else {
		chrome.notifications.create(undefined, {
			type: 'basic',
			title: 'Welcome To Merch Advanced Analytics',
			isClickable: true,
			iconUrl: '/img/logo-square.png',
			message: "Your MBA sales niche optimization journey begins! Click to go to the MAA dashboard."
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
		
		var toDate = moment();
		var endDate = moment().subtract(7,'days').startOf('day');
		
		var sls = 'https://merch.amazon.com/product-purchases-report?fromDate=' + endDate + '&toDate=' + toDate ;
		var reqs = new XMLHttpRequest();
		reqs.open("GET", sls, true);
		reqs.onreadystatechange = function() {
			if (reqs.readyState == 4) {
				if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {

				} else {
					if (reqs.responseText.indexOf('AuthenticationPortal') != -1) {
						chrome.browserAction.setBadgeText({ text: " " });
						chrome.browserAction.setBadgeBackgroundColor({color: '#FFD700' });
					} else {
						var firstInstallInner = firstInstall; //Reset Scope
						chrome.browserAction.setBadgeBackgroundColor({ color: '#008000' }); 
						chrome.browserAction.setBadgeText({ text: " " });
						
						var sevenDaySales = csvToJSON(reqs.responseText);

						var sevenDaySaleCount = 0;
						sevenDaySales.forEach(function(element) { //Tally up net units sold
							sevenDaySaleCount += element["Units"] - element["Cancelled"];
						});
						
						chrome.browserAction.setBadgeText({ text: String(sevenDaySaleCount) }); 
						
						
						var newShirtsSoldToday = {};
						sevenDaySales.forEach(function(element) {
							if (element["Date"] == toDate.format("MM-DD-YYYY") ){
								if (newShirtsSoldToday[element["ASIN"]]){ //If exists, add it
									newShirtsSoldToday[element["ASIN"]] += element["Units"] - element["Cancelled"];
								} else{
									newShirtsSoldToday[element["ASIN"]] = element["Units"] - element["Cancelled"];
								}
							}
						});
						
						var change = sevenDaySaleCount - saleCount; //Needs to be seperate to account for loses
						var diff = [];
						
						for(var item in newShirtsSoldToday){	
							var thisOldShirtSale = shirtsSoldToday[item] || 0;
							var diffInSales = newShirtsSoldToday[item] - thisOldShirtSale;
							//console.log("thisOldShirtSale", thisOldShirtSale);

							for(var k=0; k < diffInSales; k++ ){
								for(var i=0; i < sevenDaySales.length; i++ ) { //Look Up It's Name
									if (sevenDaySales[i]["ASIN"] == item){
										diff.push(sevenDaySales[i]["Name"]);
										break;
									}
								}
							} 
						}
						
						console.log("diff", diff);
						console.log("change", change);
						
						if(change != 0){ //Efficiency ;)
							if (change < 0 ){
								if(!firstInstallInner){								
									if(option.playSound) {  
										losssound.play();    
									}
									if(option.showNotif) {  
										chrome.notifications.create(undefined, {
											type: 'basic',
											title: 'Sales Decreased',
											iconUrl: '/img/can.png',
											message: "New day maybe? ("+change +")."
										});
									}
								}
								chrome.browserAction.setBadgeBackgroundColor({ color: '#cc0000' });

							} else if (change >= 1 && change <= 5) {
								if(!firstInstallInner){
									if(option.playSound) { 
										SaleSound.play();    
									}
									if(option.showNotif) {  
										for(var i=0; i < diff.length; i++ ) {
											var shirtName = diff[i];
											
											console.log("shirtName", shirtName);
											
											chrome.notifications.create(undefined, {
												type: 'basic',
												title: 'New Shirt Sale',
												iconUrl: '/img/sales.png',
												message: "Sold: " + shirtName +""
											});
										}
										
									}
								}
								chrome.browserAction.setBadgeBackgroundColor({ color: '#008000' });
								
							} else if (change > 5){
								if(!firstInstallInner){
									if(option.playSound) { 
										SaleSound.play();    
									}
									if(option.showNotif) {  
										chrome.notifications.create(undefined, {
											type: 'basic',
											title: 'New Sales!',
											iconUrl: '/img/sales.png',
											message: "Good Job! "+change +" new sales."
										});
									}
								}
								
								chrome.browserAction.setBadgeBackgroundColor({ color: '#008000' });
							}
						}
					   
						saleCount = sevenDaySaleCount;
						shirtsSoldToday = newShirtsSoldToday;
						firstInstall = false;
					}
				};
			};
		};
		reqs.send();
		
	});
};

setInterval(checkforsales, 60000);
checkforsales();
