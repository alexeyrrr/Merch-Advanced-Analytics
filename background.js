


function gtmerchdbrd(selectedText) {
	var webpagecall = 'https://merch.amazon.com/dashboard/' ;
	chrome.tabs.create({url: webpagecall});
}

function gtmerchforum(selectedText) {
	var webpagecall = 'https://forums.developer.amazon.com/spaces/80/index.html' ;
	chrome.tabs.create({url: webpagecall});
}

function gtcreat(selectedText) {
	var webpagecall = 'https://merch.amazon.com/merch-tshirt/title-setup/new/upload_art' ;
	chrome.tabs.create({url: webpagecall});
}

function gtmanage(selectedText) {
	var webpagecall = 'https://merch.amazon.com/manage' ;
	chrome.tabs.create({url: webpagecall});
}

function gtanalyze(selectedText) {
	 var webpagecall = 'https://merch.amazon.com/analyze' ;
	 chrome.tabs.create({url: webpagecall});
}


function gohome(info, tab) {
	l2 = "https://merch.amazon.com/MerchToolsShirtsLister/page=1/mt/";
	chrome.tabs.create({ url: l2 });
};


function gotodaysales(info, tab) {
	l2 = "https://merch.amazon.com/MerchToolsTodaySales";
	chrome.tabs.create({ url: l2 });
};


function gotwoweeksssales(info, tab) {
	l2 = "https://merch.amazon.com/MerchToolsTwoWeeksSales";
	chrome.tabs.create({ url: l2 });
};


function allmonthssales(info, tab) {
	l2 = "https://merch.amazon.com/MerchToolsAllMonthsSales";
	chrome.tabs.create({ url: l2 });
};


function quickeditor(info, tab) {
	l2 = "https://merch.amazon.com/MerchToolsEditor";
	chrome.tabs.create({ url: l2 });
};


function showasins(info, tab) {
	l2 = "https://merch.amazon.com/MerchToolsAllASINs";
	chrome.tabs.create({ url: l2 });
};



var b0p = chrome.contextMenus.create({
		"title": "MerchTools" , contexts:["browser_action"], onclick: function(info, tab) { 
			gtmerchdbrd(); 
		}
	});
	
var b01p = chrome.contextMenus.create({
			"title": "Sales", contexts:["browser_action"], "parentId": b0p , onclick: function(info, tab) {}
		});
		chrome.contextMenus.create({
			"title": "Today", contexts:["browser_action"], "parentId": b01p , onclick: function(info, tab) { 
				gotodaysales(); 
			}});
		chrome.contextMenus.create({"title": "Past 14 days", contexts:["browser_action"], "parentId": b01p , onclick: function(info, tab) { gotwoweeksssales(); }} );
		chrome.contextMenus.create({"title": "All Months", contexts:["browser_action"], "parentId": b01p , onclick: function(info, tab) { allmonthssales(); }} );

		chrome.contextMenus.create({"title":  "Shirts Lister", contexts:["browser_action"], "parentId": b0p , onclick: function(info, tab) { gohome(); }} );
		chrome.contextMenus.create({"title":  "Quick Editor", contexts:["browser_action"], "parentId": b0p , onclick: function(info, tab) { quickeditor(); }} );
		chrome.contextMenus.create({"title":  "Live ASINs", contexts:["browser_action"], "parentId": b0p , onclick: function(info, tab) { showasins(); }} );

var b1p = chrome.contextMenus.create({
			"title": "Merch Dashboard" , contexts:["browser_action"], onclick: function(info, tab) { 
				gtmerchdbrd(); 
			}
		});
		
		chrome.contextMenus.create({"title": "Create", contexts:["browser_action"], "parentId": b1p , onclick: function(info, tab) { gtcreat(); }} );
		chrome.contextMenus.create({"title": "Manage", contexts:["browser_action"], "parentId": b1p , onclick: function(info, tab) { gtmanage(); }} );
		chrome.contextMenus.create({"title": "Analyse", contexts:["browser_action"], "parentId": b1p , onclick: function(info, tab) { gtanalyze(); }} );


var option = {
		playSound: true,
	};

var SaleSound = new Audio();
    SaleSound.src = "/sound/win.mp3"; 

var losssound  = new Audio(); 
    losssound.src = "/sound/loss.wav";

var currentsales = '{"royaltySymbol":"$","revenueValue":"0","royaltyValue":"0","productsSold":"0","revenueSymbol":"$"}';
var chng = 0 ;



var checkforsales = function() {
    var salesAnalytics = 'https://merch.amazon.com/salesAnalyticsSummary';
    var req = new XMLHttpRequest();
    req.open("GET", salesAnalytics, true);
    req.onreadystatechange = function() {
        if (req.readyState == 4) { 
			if ([200,201,202,203,204,205,206,207,226].indexOf(req.status) === -1) {          
                            
         } else {
             if (req.responseText.indexOf('AuthenticationPortal') != -1) {
              
              chrome.browserAction.setBadgeText({ text: "#" });
              chrome.browserAction.setBadgeBackgroundColor({color: '#FFD700' });}
                else{
             chrome.browserAction.setBadgeBackgroundColor({ color: '#008000' }); 
             if(currentsales != req.responseText) {
              
                var sales = JSON.parse(req.responseText);
                var xsales = JSON.parse(currentsales);
                chng = parseInt(sales.productsSold) - parseInt(xsales.productsSold);
                
                if (chng < 0 ){
                    if(option.playSound) {  
						losssound.play();    
					}
                    chrome.notifications.create(undefined, {
						type: 'basic',
						title: 'Sales Decreased ',
						iconUrl: '/img/can.png',
						message: "New day maybe? ("+chng +")."
					});
                    chrome.browserAction.setBadgeText({ text: sales.productsSold }); 
                    chrome.browserAction.setBadgeBackgroundColor({ color: '#cc0000' });
                    currentsales = req.responseText;
                    }
                
                if (chng == 1) {
                    if(option.playSound) { 
						SaleSound.play();    
					}
                    chrome.notifications.create(undefined, {
						type: 'basic',
						title: 'New Sale !',
						iconUrl: '/img/sales.png',
						message: "Another one! New sale.(+"+chng +")"
					});
                    chrome.browserAction.setBadgeText({ 
						text: sales.productsSold
					}); 
                    chrome.browserAction.setBadgeBackgroundColor({ 
						color: '#008000' 
					});
                    currentsales = req.responseText;
                   }
                if (chng > 1) {
                    if(option.playSound) {  
						SaleSound.play();    
					}
                    chrome.notifications.create(undefined, {
						type: 'basic',
						title: 'New Sales!',
						iconUrl: '/img/sales.png',
						message: "Good Job! "+chng +" new sales."
					});
                    chrome.browserAction.setBadgeText({ 
						text: sales.productsSold
					}); 
                    chrome.browserAction.setBadgeBackgroundColor({ 
						color: '#008000' 
					});
                    currentsales = req.responseText;
				}

                chrome.browserAction.setBadgeText({ 
					text: sales.productsSold
				});
                currentsales = req.responseText;
            }
               
           }
            
        }
		}
    };
    req.send();
};

setInterval(checkforsales, 60000);
checkforsales();
