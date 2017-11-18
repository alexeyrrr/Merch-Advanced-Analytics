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


function comparer(otherArray){
  return function(current){
    return otherArray.filter(function(other){
      return other.value == current.value && other.display == current.display
    }).length == 0;
  }
}

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
		
		var toDate = moment().endOf('day');
		var endDate = moment().subtract(7,'days');

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
						
						console.log(sevenDaySales);
						
						sevenDaySaleCount = sevenDaySales.length;
						chrome.browserAction.setBadgeText({ text: String(sevenDaySaleCount) }); 
						
						console.log("shirtsSoldToday", shirtsSoldToday);
						
						
						var newShirtsSoldToday = [];
						var todayFormated = toDate.format("MM-DD-YYYY");
						
						sevenDaySales.forEach(function(element) {
							if (element["Date"] == todayFormated ){
								newShirtsSoldToday.push(element);
							}
						});
						
						console.log("newShirtsSoldToday", newShirtsSoldToday);
						
							
						var change = sevenDaySaleCount - saleCount;
						
						console.log("change is ", change);
							
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

							} else if (change >= 1 && change <= 30) {
								if(!firstInstallInner){
									if(option.playSound) { 
										SaleSound.play();    
									}
									if(option.showNotif) {  
										var onlyInA = shirtsSoldToday.filter(comparer(newShirtsSoldToday));
										var onlyInB = newShirtsSoldToday.filter(comparer(shirtsSoldToday));

										var diff = onlyInA.concat(onlyInB); //This is the issue right now
										
										console.log("diff", diff);
										console.log("diff.length", diff.length);
										
										for(var i=0; i < diff.length; i++ ) {
											var shirtsale = diff[i]["Name"];
											
											console.log("shirtsale", shirtsale);
											
											chrome.notifications.create(undefined, {
												type: 'basic',
												title: 'New Shirt Sale',
												iconUrl: '/img/sales.png',
												message: "Sold: " + shirtsale +""
											});
										}
									}
								}
								chrome.browserAction.setBadgeBackgroundColor({ color: '#008000' });
								
							} else if (change > 30){
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
					   
						console.log("saleCount", saleCount);
						console.log("sevenDaySaleCount", sevenDaySaleCount);
					   
					   
					   
						saleCount = sevenDaySaleCount;
						shirtsSoldToday = newShirtsSoldToday;
						firstInstall = false;
						
						
						console.log("Updated saleCount", saleCount);
					}
				};
			};
		};
		reqs.send();
		
	});
};

setInterval(checkforsales, 60000);
checkforsales();
