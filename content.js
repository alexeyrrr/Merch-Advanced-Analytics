/***************************************************************/
/*************** Date & Global Helper Functions ******************/
/***************************************************************/
function titleCase(str) {
	if(str == "HOUSE BRAND"){
		str = "standard t-shirt";
	}

	str = str.toLowerCase().split(' ');
	
	for (var i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
	return str.join(' ');
}


function replicateArray(array, n) {
	var arrays = Array.apply(null, new Array(n)); 
	arrays = arrays.map(function() { return array });
	return [].concat.apply([], arrays);
}

Number.prototype.formatMoney = function(c, d, t){
var n = this, 
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };
 
/***************************************************************/
/********************* Global HTML  / Options ******************/
/***************************************************************/
var logoURL = chrome.extension.getURL("/img/logo.png");
var globalHeader = '<head><meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"><link rel="shortcut icon" href="'+  chrome.extension.getURL('img/favicon.ico') + '" type="image/x-icon">' +
					'<link rel="icon" href="'+  chrome.extension.getURL('img/favicon.ico') + '" type="image/x-icon"></head>';
var globalSidebar = '<nav id="sidebar">' +
						'<div id="logo" class="sidebar-header">' +
							'<img class="img-fluid" src="'+ logoURL +'"></img>' +
						'</div>' +
						'<ul class="list-unstyled components">' +
							'<li><a id="todaySales"><i class="fa fa-calendar-o" aria-hidden="true"></i> Today\'s Sales</a></li>' +
							'<li class="active"><a id="dailySales"><i class="fa fa-th-large" aria-hidden="true"></i> 7 Day Sales</a></li>' +
							'<li><a id="monthlySales"><i class="fa fa-calendar" aria-hidden="true"></i> Monthly Sales</a></li>' +
							//'<li><a id="productManager"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Manage Products</a></li>' +
							//'<li><a id="indvProduct"><i class="fa fa-crosshairs" aria-hidden="true"></i> Individual Product Info</a></li>' + //style="display:none;"
							'<li><a id="settingsPage"><i class="fa fa-cogs" aria-hidden="true"></i> Settings</a></li>' +
						'</ul>' +
				'</nav>';
var globalLoading = '<div class="container maa-container">' +
						'<div class="maa-card card">'+
							'<div class="card-block">' +
								'<div class="status clear"><center><h3>Loading...</h3><i class="fa fa-spinner fa-spin fa-4"></i></center></div>' + 
							'</div>'+ 
						'</div>' +
					'</div>';
var globalBody = '<body class=""><div class="wrapper">' + globalSidebar + globalLoading + '</div></body>';
var globalStatus = 'none';
		
function globalInit(){
	document.head.innerHTML = globalHeader;
	document.body.innerHTML = globalBody;
	document.body.style.backgroundColor = "#ecf1f2";  
	
	document.body.classList.add('merch-advanced-analytics');
		
	//Initialize Sidebar
	$(function(){	
		function showCorrectActive(thisObject){		
			$("#sidebar li").removeClass("active");
			$(thisObject).closest("li").addClass("active");
			$('#indvProduct').closest("li").hide();
		}
		
		$("#todaySales").click(function(){
			if (globalStatus == 'none'){
				var fromDateToday = moment().startOf('day').unix();
				var toDateToday = moment().endOf('day').unix();
				
				dailySalesPage(fromDateToday, toDateToday);
				
				showCorrectActive(this);
			}
		});
		$("#dailySales, #logo").click(function(){
			if (globalStatus == 'none'){
				//Calculate Unix Timestamps
				var fromDate7 = moment().subtract(7, 'days').unix();
				var toDate = moment().unix();
				
				dailySalesPage(fromDate7, toDate);
				showCorrectActive(this);
			}
		});
		
		$("#monthlySales").click(function(){
			if (globalStatus == 'none'){
				//Calculate Unix Timestamps
				var fromDate6Mo = moment().endOf('month').subtract(5, 'months').startOf('month').unix();
				var toDate = moment().unix();
							
				dailySalesPage(fromDate6Mo, toDate, "month");
				showCorrectActive(this);
			}
		});
		
		$("#productManager").click(function(){
			if (globalStatus == 'none'){
				productManager();	
				showCorrectActive(this);
			}
		});
		
		$("#settingsPage").click(function(){
			if (globalStatus == 'none'){
				settingsPage();
				showCorrectActive(this);
			}
		})
		

	})
	
	
}

var globalLineChartOptions = {
						responsive: false,
						animation: {
							duration: 0, // general animation time
						},
						hover: {
							animationDuration: 0, // duration of animations when hovering an item
						},
						responsiveAnimationDuration: 0, // animation duration after a resize
						tooltips: {
							mode: 'label'
						},
						legend: {
							display: false
						}					
					};
													
/***************************************************************/
/******* Login Functions / Timezone Global Options *************/
/***************************************************************/
function generateLoginModal(){
	loginerr = '<div id="myModal" class="modal fade" role="dialog">' +
	'<div class="modal-dialog">' +
	'<div class="modal-content">' +
	'<div class="modal-header">' +
	'<h4 class="modal-title">Please Login </h4>' +
	' </div>' +
	'<div class="modal-body">' +
	'<h6><a href="https://merch.amazon.com/dashboard" target="_blank"><p>>>Click here to open Merch by Amazon Login<<</p></a></h6>' +
	'</div>' +
	'<div class="modal-footer">' +
	'<button type="button" class="btn btn-success" data-dismiss="modal">Done, Reload The Page!</button>' +
	'</div></div></div></div>';

	document.body.innerHTML = loginerr;

	$('#myModal')
		.modal('show');

	$(document)
		.on('hide.bs.modal', '#myModal', function() {
			location.reload();
	});
}

function generateStatusBar(message, type) {
	var html = '<div class="alert alert-' + type + ' alert-dismissable maa-alert">';    
	html += '<button type="button" class="close"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>';
	html += message;
	html += '</div>';    
	$(html).prependTo('body');
	
	$('.maa-alert .close').click(function(e) {
		e.preventDefault();
		$(this).closest('.maa-alert').remove();
	});
};

function getQueryParams() {	
	// Get Query Params
	var queryString = window.location.search.substring(1);
	
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = queryString.split("&");
    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
};

function router(queryParams){
	if (queryParams["page"] == "test"){
		//This works
	}
}

//router(getQueryParams());

//Add header and sidebar

var cmd = window.location.href.split('?')[0];
if (cmd.indexOf("MerchAnalytics") !== -1 || cmd.indexOf("IndividualProductPage") !== -1) {
	globalInit();
	if (cmd.indexOf("MerchAnalytics") !== -1) {
		var fromDate7 = moment().subtract(7, 'days').unix();
		var toDate = moment().unix();
		dailySalesPage(fromDate7, toDate);
	} else if (cmd.indexOf("IndividualProductPage") !== -1) {	
		individualProductPage(getQueryParams());
	} 
} else {
	chrome.storage.sync.get("Settings", function(items) {
		var showNavTab = 1;
		if(Object.values(items).length != 0){
			var parsedJson = JSON.parse(items["Settings"]);
			showNavTab = parsedJson["optionDashboard"];
			enterToNextPage = parsedJson["enterToNextPage"];
			uploadHelper = parsedJson["uploadHelper"];
		}
		
		if (showNavTab != 0){
			$(document).ready(function () { //Idk if this ready needs to be here
				$('.navigation ul').add('<li class="nav-item"><a class="nav-link" target="_blank" href="/MerchAnalytics">Merch Analytics</a></li>');
			});
						
			//Analyze Button On MBA
			/*
			function trytest() {
				if (!$(".gear-manage-products-row").length) {
					window.requestAnimationFrame(trytest);
				}else {
					$(".gear-manage-products-row").each(function() { 
						var link = $(this).find('.a-link-normal').attr("href").split('https://www.amazon.com/dp/')[1];
						$(this).find('.a-spacing-micro').append('<a class="a-button" href="https://merch.amazon.com/IndividualProductPage/?ASIN='+ link +'" target="_blank"><span class="a-button-text">Analyze</span></a>');
					});
				}
			};
			trytest();
			*/
		}
		
		//Enter Key To Progress
		if (enterToNextPage != 0){
			$(document).ready(function () {
				
				//Redirect to new product creation page
				$(document).keydown(function (e) {
					//e.preventDefault();
					var kCode = e.keyCode || e.charCode; 
					
					if (kCode == 13 && $('.aok-float-right .a-button-text').is(':visible')) {
						window.location = "https://merch.amazon.com/designs/new";
					};
				});
				
				//Add Deselect All Button
				var observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						if (!mutation.addedNodes) return

						for (var i = 0; i < mutation.addedNodes.length; i++) {
							var node = mutation.addedNodes[i]

							if (node.className == "pl-medium-large mt-mini ng-star-inserted") { //wait until this class shows up
								$('#select-marketplace-button').click(function(){
									$('.modal-footer.mt-0').prepend('<a class="deselect-all" style="margin-right: auto; cursor: pointer;">Deselect All</a>');
									$('.deselect-all').click(function(){
										$('.modal-content .sci-check-box').click();
									});
								});
								
								
								$('#submit-button').after('<span style="line-height:25px; width:100%; float: left; text-align: right; color: #5F6368;" class="a-color-tertiary">(Press Enter To Submit)</span>');
								$(document).keydown(function (e) {
									//e.preventDefault();
									var kCode = e.keyCode || e.charCode; 
									
									if (kCode == 13) {										
										if ($('.modal.show').is(":visible")){
											$('.modal-footer .btn-submit').click();
										} else if($('#submit-button').is(":not(:disabled)")){ // Check if submit button 
											$('#submit-button').click();
										} 
									} 
								});
								
								// stop watching
								observer.disconnect();

							}
						}
					})
				})

				observer.observe(document.body, {
					childList: true,
					subtree: true,
					attributes: false,
					characterData: false,
				});

			});
		}

		if (uploadHelper != 0){
			$(document).ready(function () {
				//Redirect to new product creation page
				var observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutation) {
						if (!mutation.addedNodes) return

						for (var i = 0; i < mutation.addedNodes.length; i++) {
							var node = mutation.addedNodes[i]

							if (node.className == "nav-item nav-item-en ng-star-inserted") { //wait until this class shows up					
								$(document).keydown(function (e) {
									//e.preventDefault();
									var kCode = e.keyCode || e.charCode; 

									if (e.altKey && kCode == 57){ //other is 48			
									
										var t = document.createElement("textarea");
										document.body.appendChild(t);
										t.focus();
										document.execCommand("paste");
										var clipboardText = t.value; //this is your clipboard data
										document.body.removeChild(t);
										
										var clipboardArray = clipboardText.split(/\r?\n/);
										if(clipboardArray.length < 4){
											alert('Too Short');
										}

										console.log(clipboardArray);
										
										//Brand
										var myInput = document.querySelectorAll('#designCreator-productEditor-brandName')[0];						
										var lastValue = myInput.value;
										myInput.value = clipboardArray[0];
										var event = new Event('input', { bubbles: true });
										event.simulated = true;
										var tracker = myInput._valueTracker;
										if (tracker) {
										  tracker.setValue(lastValue);
										}
										myInput.dispatchEvent(event);
									
										//Title 	
										var myInput = document.querySelectorAll('#designCreator-productEditor-title')[0];						
										var lastValue = myInput.value;
										myInput.value = clipboardArray[1];
										var event = new Event('input', { bubbles: true });
										event.simulated = true;
										var tracker = myInput._valueTracker;
										if (tracker) {
										  tracker.setValue(lastValue);
										}
										myInput.dispatchEvent(event);
										
										//Feature 1 	
										var myInput = document.querySelectorAll('#designCreator-productEditor-featureBullet1')[0];						
										var lastValue = myInput.value;
										myInput.value = clipboardArray[2];
										var event = new Event('input', { bubbles: true });
										event.simulated = true;
										var tracker = myInput._valueTracker;
										if (tracker) {
										  tracker.setValue(lastValue);
										}
										myInput.dispatchEvent(event);
										
										//Feature 2
										var myInput = document.querySelectorAll('[formcontrolname="featureBullet2"]')[0];						
										var lastValue = myInput.value;
										myInput.value = clipboardArray[3];
										var event = new Event('input', { bubbles: true });
										event.simulated = true;
										var tracker = myInput._valueTracker;
										if (tracker) {
										  tracker.setValue(lastValue);
										}
										myInput.dispatchEvent(event);
											
									};
									
								});	
								
								// stop watching
								observer.disconnect();

							}
						}
					})
				})

				observer.observe(document.body, {
					childList: true,
					subtree: true,
					attributes: false,
					characterData: false,
				});
			});

		}
	});
}
		
/***************************************************************/
/********* Global Fetch Function (Sales & Live List) ***********/
/***************************************************************/	
function fetchSalesDataCSV(fromDate, toDate, result, callback){
	//This Function Deals in Unix Milliseconds
	var a = moment.unix(toDate).endOf('day');
	var b = moment.unix(fromDate).endOf('day');
	var daysDifference = a.diff(b, 'days')
	
	//Change to end of day to prevent 90 day window because need full 7 day week
	fromDate = moment.unix(fromDate).endOf('day').unix();
	toDate = moment.unix(toDate).endOf('day').unix();
	
	if(daysDifference <= (90)){ //Period under 90 days (with grace period)
		var sls = 'https://merch.amazon.com/api/reporting/purchases/report?marketplaceId=ATVPDKIKX0DER&fromDate=' + fromDate * 1000 + '&toDate=' + toDate * 1000;
		
        var reqs = new XMLHttpRequest();
        reqs.open("GET", sls, true);
        reqs.onreadystatechange = function() {
            if (reqs.readyState == 4) {
                if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {

				} else {
					if (reqs.responseText.length == 0) {
                        generateLoginModal();
                    } else {
						setstatus("Processing Data...");
						
						responseList = JSON.parse(reqs.responseText)["ATVPDKIKX0DER"];
						
						intermediateResult = [];
						Array.prototype.push.apply(intermediateResult,responseList);     

						//Filter to make sure actually within range
						for(var i=0; i < intermediateResult.length; i++){
							var compareDate = moment(intermediateResult[i]['period']).unix();
							
							if (compareDate >= b.startOf('day').unix() && compareDate <= a.endOf('day').unix()) {
								
								result.push(intermediateResult[i]);     
							} 

						}
						
						callback(result);
					}
                };
			};
        };
        reqs.send();
    } else { //Period over 90 days (with grace period)
		var newEndDate = moment.unix(toDate).subtract(90, 'days').unix();
	
		var sls = 'https://merch.amazon.com/api/reporting/purchases/report?marketplaceId=ATVPDKIKX0DER&fromDate=' + newEndDate * 1000+ '&toDate=' + toDate * 1000;
		var reqs = new XMLHttpRequest();
		reqs.open("GET", sls, true);
		reqs.onreadystatechange = function() {
			if (reqs.readyState == 4) {
				if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {

				} else {
					if (reqs.responseText.length == 0) {
						generateLoginModal();
					} else {
						setstatus("Gathering Data...");
					
						responseList = JSON.parse(reqs.responseText)["ATVPDKIKX0DER"];
						Array.prototype.push.apply(result,responseList); 	
						
						//Shift Last Call Date Down
						toDate = moment.unix(toDate).subtract(91, 'days').startOf('day').unix();
						fetchSalesDataCSV(fromDate, toDate, result, callback);
					}
				};

			};
		};
		reqs.send();
	} 	
}

function fetchAllLiveProducts(page, cursor, result, specificASIN=null, callback){
	if (cursor =='null'){ 
		callback();
    } else {                   
		var sls = 'https://merch.amazon.com/merchandise/list?pageSize=250&statusFilters%5B%5D=LIVE%2C&statusFilters%5B%5D=UNDER_REVIEW&statusFilters%5B%5D=PROCESSING&statusFilters%5B%5D=PENDING&pageNumber=';
		var url = sls + page;
		
		var reqs = new XMLHttpRequest();
		reqs.open("GET", url, true);
		reqs.onreadystatechange = function() {
			if (reqs.readyState == 4) {
				if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {
					callback();
				} else {
					if (reqs.responseText.length == 0) {
						generateLoginModal();
					} else {
						var t1 = JSON.parse(reqs.responseText);
						myCursor = t1.nextPageCursor;
											
						var response = JSON.parse(reqs.responseText);
						var merchList = response.merchandiseList;
						
						//Append to Array
						Array.prototype.push.apply(result,merchList); 	
						
						//Calculate Display Message
						var totalNumberMerch = parseInt(response.totalMerchandiseCount);
						var maxPages = Math.ceil(totalNumberMerch / 250);
						
						//Set upper limit
						if (maxPages > 40){
							var totalPages = 40;
						} else {
							var totalPages = maxPages;
						}
						setstatus("Loading... [" + page + "/" + totalPages+"]");
						
						
						var resultFound = false;
						if(specificASIN){ //End Condition if already found specific ASIN, to make more efficient
							for(var i=0; i < result.length; i++){
								if(result[i]["marketplaceAsinMap"]["US"] == specificASIN){
									resultFound = true;
									callback();
									break;
								}
							}
						}						
						
						if(page >= 40){ //End Condition
							callback();
						} else if(!resultFound){
							page++;
							fetchAllLiveProducts(page, myCursor, result, specificASIN, callback);
						}
						
					}
				}
			};
			
			
		};
		reqs.send();
	}
}
	
function setstatus(message, type="loading"){
		newHTML = '<center><h3>' +
					message + 
					'</h3>' + 
					'<i class="fa fa-spinner fa-spin fa-4"></i>' +
				 '</center>';
		
		$('.status').html(newHTML);
}	
	
function determineProductType(input, callback){
	var productEditBaseUrl1= "http://merch.amazon.com/merch-tshirt/title-setup/"; //Default for shirts, sweatshirts, hoodies, long sleeves
	
	switch (input) {
		case "AMERICAN_APPAREL":
		case "HOUSE_BRAND":
			productType1 = "Standard T&#8209;Shirt";						
			break;
		case "PREMIUM_BRAND":
			productType1 = "Premium T&#8209;Shirt";
			break;
		case "STANDARD_SWEATSHIRT":
			productType1 = "Sweatshirt";
			break;
		case "STANDARD_PULLOVER_HOODIE":
			productType1 = "Pullover Hoodie";
			break;
		case "STANDARD_LONG_SLEEVE":
			productType1 = "Long-Sleeve T&#8209;Shirt";
			break;
		case "POP_SOCKET":
			productType1 = "Pop Socket";
			productEditBaseUrl1 = "https://merch.amazon.com/merch-popsocket/title-setup/";
			break;				
		default: 
			productType1 = input;
	}

	callback(productType1, productEditBaseUrl1)
}
	
/***************************************************************/
/********************** Daily Sales Page ***********************/
/***************************************************************/	
function dailySalesPage(fromDate, toDate, viewType = 'day'){
	globalStatus = 'working';
	document.title = "Daily View - Merch Advanced Analytics";
	var smallChartWidth = window.screen.availWidth / 6.9;
	var smallChartHeight = window.screen.availWidth / 5.4;
	
	var pageContent = '<div class="container maa-container">' +
					'<div class="maa-card card"></center>'+
						'<div class="card-block">'+ 
							//'<center><h2>Daily Page</h2></center>' +
							'<div id="dailystats" class="status clear"><center><h3>Loading...</h3><i class="fa fa-spinner fa-spin fa-4"></i></center></div>' + 
						'</div>' +
					'</div>' +
					'<div class="maa-card card" id="salesPanel">' +
						'<div class="card-header">' + 
							'<ul class="nav nav-pills card-header-pills" role="tablist">' +
								'<li class="nav-item"><a class="nav-link active" href="#sales" role="tab" data-toggle="tab">Sales/Cancellations</a></li>' +
								'<li class="nav-item"><a class="nav-link" href="#revenue" role="tab" data-toggle="tab">Revenue/Royalties</a></li>' +
								'<li class="nav-item"><a class="nav-link" href="#productAnalysis" role="tab" data-toggle="tab">Product Analysis</a></li>' +
								'<li class="nav-item"><a class="nav-link" href="#pricing" role="tab" data-toggle="tab">Pricing Analysis</a></li>' +
							'</ul>' +
						'</div>' +
						
						'<div class="card-block tab-content">' +
							'<div class="tab-pane active" role="tabpanel" id="sales">' +
								'<center class="inner-container"><canvas id="canvas1" height="450" width="800"></canvas></center>' + 
							'</div>' +
							
							'<div class="tab-pane" role="tabpanel" id="revenue">' +
								'<center class="inner-container"><canvas id="canvas2" height="450" width="800"></canvas></center>' +
							'</div>' + 
							'<div class="tab-pane" role="tabpanel" id="productAnalysis">' +
								'<center class="row">' +
									'<div class="canvas-wrapper col col-xs-3 col-sm-3">' +
										'<canvas id="canvas3" height="'+smallChartHeight+'" width="'+smallChartWidth+'"></canvas>' +
										'<h5 class="canvas-title">Fit Distribution</h5>' +
									'</div>' +
									'<div class="canvas-wrapper col col-xs-3 col-sm-3">' +
										'<canvas id="canvas4" height="'+smallChartHeight+'" width="'+smallChartWidth+'"></canvas>' +
										'<h5 class="canvas-title">Size Distribution</h5>' +
									'</div>'+
									'<div class="canvas-wrapper col col-xs-3 col-sm-3">' +
										'<canvas id="canvas5" height="'+smallChartHeight+'" width="'+smallChartWidth+'"></canvas>'+
										'<h5 class="canvas-title">Color Distribution</h5>' +
									'</div>' +
									'<div class="canvas-wrapper col col-xs-3 col-sm-3">' +
										'<canvas id="canvas7" height="'+smallChartHeight+'" width="'+smallChartWidth+'"></canvas>'+
										'<h5 class="canvas-title">Product Type Distribution</h5>' +
									'</div>' +
								'</center>' +
							'</div>' +
							'<div class="tab-pane" role="tabpanel" id="pricing">' +
								'<center class="row">' +
									'<div class="canvas-wrapper col col-xs-12 col-sm-12">' +
										'<canvas id="canvas6" height="350" width="500"></canvas>'+
									'</div>' +

								'</center>' +
							'</div>' +
						'</div>' +
					'</div>' +
					
					'<div class="maa-card card">' + 
						'<div class="card-header">Products Sold During Selected Period</div>' +
						'<div class="card-block" id="shirtlist"></div>' +
					'</div>' + 
				'</div>';
			
	$(".wrapper").children().filter(":not(#sidebar)").remove();
	$(".wrapper").append(pageContent);
	
	if(viewType == "month"){ //Set Sidebar Highlight
		$("#sidebar li").removeClass("active");
		$("#monthlySales").closest("li").addClass('active');
	} else{
		$("#sidebar li").removeClass("active");
		$("#dailySales").closest("li").addClass('active');
	}
	
	renderDailyView(fromDate, toDate, viewType);
}

function renderDailyView(unixFromDate, unixToDate, viewType){	
	fetchSalesDataCSV(unixFromDate, unixToDate, responseArray = [], function(){		
		//Generate Axis Labels
		
		var axisLabels = [];
				
		//Reset Var Scope
		var localUnixToDate = moment.unix(unixToDate);
		var localUnixFromDate = moment.unix(unixFromDate);	
				
		if(viewType == "month"){ //Monthly Labels		
			while (localUnixFromDate <= localUnixToDate) {	
				axisLabels.push(String(localUnixFromDate.format("MMM YYYY")));
				var daysThisMonth = moment(localUnixFromDate).daysInMonth();
				localUnixFromDate.add(daysThisMonth, 'days');
			}
		} else if(viewType == "week"){	
			while (localUnixFromDate <= localUnixToDate) {	
				axisLabels.push(String(localUnixFromDate.format("ww YYYY")));
				localUnixFromDate.add(1, 'weeks');
			}
		} else if(viewType == "day"){ //daily Labels
			while (localUnixFromDate <= localUnixToDate) {			
				axisLabels.push(String(localUnixFromDate.format("MM-DD-YYYY")));
				localUnixFromDate.add(1, 'days');
			}
		}
			
		var salesData = new Array(axisLabels.length).fill(0);
		var cancelData = new Array(axisLabels.length).fill(0);
		var returnData = new Array(axisLabels.length).fill(0);
		var revenueData = new Array(axisLabels.length).fill(0);
		var royaltyData = new Array(axisLabels.length).fill(0);
		
		//Tally Numbers
		var gendersArray = {};
		var sizesArray = {};
		var shirtColorsObject = {};
		var priceObject = {};
		var productTypeObject = {};
		
	
		//Sales Data (Not Very Efficient)
		var numberofDaysInner = axisLabels.length; //Janky Way to recover number of days with proper scope
		
		//Reset Scope Again
		var localUnixToDate2 = moment.unix(unixToDate);
		var localUnixFromDate2 = moment.unix(unixFromDate);
		
		for (i = 0; i < axisLabels.length; i++) {
			for ( i2 = 0; i2 < responseArray.length; i2++){						
				if(viewType == "month"){
					var startDate   = moment(axisLabels[i], "MMM YYYY"); //This date month
					var endDate     = moment(axisLabels[i], "MMM YYYY").add(1,'months'); //Previous month
					var compareDate = moment(responseArray[i2]["period"]);

					var isWithinRange = compareDate.isBetween(startDate, endDate, 'months', '[)') // left inclusive
				
				} else if(viewType == "week"){
					var startDate   = moment(axisLabels[i], "ww YYYY"); //This date week
					var endDate     = moment(axisLabels[i], "WW YYYY").add(1,'weeks'); //Previous week
					var compareDate = moment(responseArray[i2]["period"]);
					
					var isWithinRange = compareDate.isBetween(startDate, endDate, 'weeks', '[)') // left inclusive
					
				} else if(viewType == "day"){ //Daily View
					var startDate   = moment(axisLabels[i], "MM-DD-YYYY"); //This Date
					var endDate     = moment(axisLabels[i], "MM-DD-YYYY").add(1,'days'); //Yesterday
					var compareDate = moment(responseArray[i2]["period"]);
					
					var isWithinRange = compareDate.isBetween(startDate, endDate, 'days', '[)') // left inclusive
				}
				
				
				if(isWithinRange){ //See if inside range
					salesData[i] += parseInt(responseArray[i2]["unitsSold"]);
					cancelData[i] += parseInt(responseArray[i2]["unitsCancelled"]);
					returnData[i] += parseInt(responseArray[i2]["unitsReturned"]);
					revenueData[i] += parseFloat(responseArray[i2]["revenue"]["value"]);
					royaltyData[i] += parseFloat(responseArray[i2]["royalties"]["value"]);

					//Determine Gender And Count it 
					var shirtGender = titleCase(responseArray[i2]["variationInfo"]["fit"]);
					if (shirtGender in gendersArray){
						gendersArray[shirtGender] += 1;
					} else {
						gendersArray[shirtGender] = 1;
					}

					
					//Determine Size And Count it 
					var shirtSize = responseArray[i2]["variationInfo"]["size"];
					if (shirtSize in sizesArray){
						sizesArray[shirtSize] += 1;
					} else {
						sizesArray[shirtSize] = 1;
					}
					
					//Determine Color And Count it 
					var shirtColor = titleCase(responseArray[i2]["variationInfo"]["color"].replace(/_/g, " "));
					if (shirtColor in shirtColorsObject){
						shirtColorsObject[shirtColor] += 1;
					} else {
						shirtColorsObject[shirtColor] = 1;
					}


					
					//Determine Unit Price & Count it
					var unitsSold = responseArray[i2]["unitsSold"] - responseArray[i2]["unitsCancelled"];
					if (unitsSold != 0){ //Disregarding canceled units intentionally								
						var unitPrice = "$"+(responseArray[i2]["revenue"]["value"] / (unitsSold)).toFixed(2);	
						if (unitPrice in priceObject){
							priceObject[unitPrice] += 1;
						} else {
							priceObject[unitPrice] = 1;
						}
					}
												
					//Determine Product Type & Count it
					var productType = titleCase(responseArray[i2]["productType"].replace(/_/g, " "));		
					if (productType in productTypeObject){
						productTypeObject[productType] += 1;
					} else {
						productTypeObject[productType] = 1;
					}
				}
			}
			
			//console.log(salesData);


			if(viewType == "day" && axisLabels.length <= 15){
				axisLabels[i] = moment(axisLabels[i], "MM-DD-YYYY").format('dddd');
			} else if (viewType == "week" && axisLabels.length <= 90){
				var weekMonth = moment(axisLabels[i], "ww YYYY").format('MMM');
				
				var myDate = moment(axisLabels[i], "ww YYYY"); //saturday
				var day = myDate.day(); //6 = saturday
				var nthOfMonth = Math.ceil(myDate.date() / 7); //1

				axisLabels[i] = weekMonth + " Week " + nthOfMonth;
			}
		}
		
		/******* Render Top Page Stats *****************/
		var totals = {};				
		totals.sales = salesData.reduce(function(a, b) { return a + b; }, 0);
		totals.cancelled = cancelData.reduce(function(a, b) { return a + b; }, 0);
		totals.returned = returnData.reduce(function(a, b) { return a + b; }, 0);
		totals.revenue = revenueData.reduce(function(a, b) { return a + b; }, 0).toFixed(2);				
		totals.royalty = royaltyData.reduce(function(a, b) { return a + b; }, 0).toFixed(2);
		
		//Calculated Totals
		totals.avgRoytPerUnit = ((totals.royalty /(totals.sales - totals.cancelled + 0.00001)).formatMoney(2) < 0 ? 0 : (totals.royalty /(totals.sales - totals.cancelled + 0.00001)).formatMoney(2));
		totals.avgRoytPerTimePeriod = ((totals.royalty /(numberofDaysInner+ 0.00001)).toFixed(2) < 0 ? 0 : (totals.royalty /(numberofDaysInner+ 0.00001)).toFixed(2));

		fromDateString = localUnixFromDate2.format("MM/DD/YYYY");
		toDateString = localUnixToDate2.format("MM/DD/YYYY");
		
		//Show User the date range they've selected
		var duration = moment.duration(localUnixToDate2.diff(localUnixFromDate2));
		
		if(viewType == "month"){
			var pageTitle = "Monthly Statistics";
			var periodTitle = "month";
			var periodDuration = Math.round(duration.asMonths()) + " Month Range";
		
		} else if(viewType == "week"){
			var pageTitle = "Weekly Statistics";
			var periodTitle = "week";
			var periodDuration = Math.floor(duration.asDays()) + " Day Range"; //Keep as days
		} else {
			var pageTitle = "Daily Statistics";
			var periodTitle = "day";
			var periodDuration = Math.floor(duration.asDays()) + " Day Range";
		}
		
		stats = '<div class="container maa-container row no-padding-top">'+
					'<div class="col-sm-6 col-xs-6">' +
						'<h3>' + pageTitle + '</h3>' +
						'<h4 class="subheading" style="margin-bottom: 0;">' + periodDuration +'</h4>' +
					'</div>' +
					'<div class="col-sm-6 col-xs-6">' +
						'<div class="dropdown">' +
							'<input class="date-selector" type="text" name="datefilter" class="form-control" value="' + fromDateString + " - " + toDateString + '" />' +
							'<i class="fa fa-caret-down down-arrow" aria-hidden="true"></i>' +
						'</div>' +
					'</div>' +	
				'</div>';	
		stats += '<div class="container maa-container row no-gutters row-eq-height">' +
				'<div class="col-lg-2 col-sm-3 col-xs-12 offset-sm-0 offset-md-1 offset-lg-2">'+
					'<div class="maa-card card">'+
						'<div class="card-body">'+                                                                       
							'<h2 class="font-weight-lighter" style="color:#474C4F;"  >'+ totals.sales + '</h2>'+
							'<span class="text-muted text-uppercase small">Units Sold</span>'+
						'</div>'+
					'</div>'+
				'</div>'+
				
				'<div class="col-lg-2 col-sm-3 col-xs-12">'+
					'<div class="maa-card card">'+
						'<div class="card-body">'+                                                                       
							'<h2 class="font-weight-lighter" style="color:#474C4F;"  >'+ totals.cancelled + '</h2>'+
							'<span class="text-muted text-uppercase small">Units Cancelled</span>'+
						'</div>'+
					'</div>'+
				'</div>'+
				
				'<div class="col-lg-2 col-sm-3 col-xs-12">'+
					'<div class="maa-card card">'+
						'<div class="card-body">'+                                                                       
							'<h2 class="font-weight-lighter" style="color:#474C4F;"  >'+ totals.returned + '</h2>'+
							'<span class="text-muted text-uppercase small">Units Returned</span>'+
						'</div>'+
					'</div>'+
				'</div>'+
				
				'<div class="col-lg-2 col-sm-3 col-xs-12 offset-sm-1 offset-md-1 offset-lg-0">'+
					'<div class="maa-card card">'+
						'<div class="card-body">'+                                                                       
							'<h2 class="font-weight-lighter" style="color:#474C4F;"  >$'+ parseFloat(totals.revenue).formatMoney(2) + '</h2>'+
							'<span class="text-muted text-uppercase small">Revenue Earned</span>'+
						'</div>'+
					'</div>'+
				'</div>'+
				
				'<div class="col-lg-2 col-sm-3 col-xs-12 no-card-bottom offset-lg-2">'+ 
					'<div class="maa-card card">'+
						'<div class="card-body">'+                                                                       
							'<h2 class="font-weight-lighter" style="color:#474C4F;"  >$'+ parseFloat(totals.royalty).formatMoney(2) + '</h2>'+
							'<span class="text-muted text-uppercase small">Royalties Earned</span>'+
						'</div>'+
					'</div>'+
				'</div>'+
				
				'<div class="col-lg-2 col-sm-3 col-xs-12 no-card-bottom">'+
					'<div class="maa-card card">'+
						'<div class="card-body">'+                                                                       
							'<h2 class="font-weight-lighter" style="color:#474C4F;"  >$'+ totals.avgRoytPerUnit + '</h2>'+
							'<span class="text-muted text-uppercase small">Avg Royalties / Unit Sold</span>'+
						'</div>'+
					'</div>'+
				'</div>'+
				
				'<div class="col-lg-2 col-sm-3 col-xs-12 no-card-bottom offset-sm-2 offset-md-2 offset-lg-0">'+
					'<div class="maa-card card">'+
						'<div class="card-body">'+                                                                       
							'<h2 class="font-weight-lighter" style="color:#474C4F;"  >'+ ((totals.sales - totals.cancelled) /(numberofDaysInner+ 0.00001)).formatMoney(2) + '</h2>'+
							'<span class="text-muted text-uppercase small">Avg Net Sales / '+ periodTitle +'</span>'+
						'</div>'+
					'</div>'+
				'</div>'+
				
				'<div class="col-lg-2 col-sm-3 col-xs-12 no-card-bottom ">'+
					'<div class="maa-card card">'+
						'<div class="card-body">'+                                                                       
							'<h2 class="font-weight-lighter" style="color:#474C4F;"  >$'+ totals.avgRoytPerTimePeriod + '</h2>'+
							'<span class="text-muted text-uppercase small">Avg Royalties / '+ periodTitle +'</span>'+
						'</div>'+
					'</div>'+
				'</div>';
										
		document.getElementById("dailystats").innerHTML = stats;
		
		//Regroup all youth sizes to just Youth
		var adjustedSizesArray = {};
		for(var item in sizesArray){
			var newSize = titleCase(item.split("_")[1]);

			if (/^\d+$/.test(newSize)){  // Old Way newSize == "3" || newSize == "4" || newSize == "6" || newSize == "8" || newSize == "10" || newSize == "12") {
				if ('Youth' in adjustedSizesArray){
					adjustedSizesArray['Youth'] += parseInt(sizesArray[item]);
				} else {
					adjustedSizesArray['Youth'] = 1;
				}
			} else{
				if (newSize in adjustedSizesArray){
					adjustedSizesArray[newSize] += parseInt(sizesArray[item]);
				} else {
					adjustedSizesArray[newSize] = 1;
				}
			}		
		}
		
		//Make sure colors are in correct order												
		var shirtColorsColorsLUT = {'Dark Heather': "#454b4b", 'Heather Grey': "#d5d9da", 'Heather Blue': "#696c9c", 'Black': "#222", 
			'Navy': "#15232b", 'Silver': "#cfd1d1", 'Royal': "#1c4086", 'Brown': "#31261d", 'Slate': "#818189", 'Red': "#b71111", 'Asphalt': "#3f3e3c", 
			'Grass': "#5e9444", 'Olive': "#4a4f26", 'Kelly Green': "#006136", 'Baby Blue': "#8fb8db", 'White': "#eeeeee", 'Lemon': "#f0e87b", 'Cranberry': "#6e0a25",
			'Pink': "#f8a3bc", 'Orange': "#ff5c39", 'Purple': "#514689", 'Sapphire': "#3667A3", 'Black Athletic Heather': "#454b4b", 'Dark Heather White': "#454b4b",'Neon Pink': "#FE5BAC",'Black White': "#222",'Forest Green': "#0f5b20"};
		var finalShirtColorsLUT = [];
		for (var key in shirtColorsObject){
			finalShirtColorsLUT.push(shirtColorsColorsLUT[key]);
		}

		var gendersColorsLUT = {'Men': "#3498db", 'Women': "#e86dab", 'Kids': "#84cb74", 'Unisex': "#cfd1d1"};
		var finalgendersColorsLUT = [];
		for (var key in gendersArray){
			finalgendersColorsLUT.push(gendersColorsLUT[key]);
		}

		
						
		sortedPriceObject = {};
		Object.keys(priceObject).sort(function(a,b){return priceObject[b]-priceObject[a]}).forEach(function(key) {
			sortedPriceObject[key] = priceObject[key];
		});
		
		var tealColorScheme = ["#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#009688", "#00897b", "#00796b", "#00695c", "#004d40"];
		var greenColorScheme = ["#429d54", "#4db461", "#65be76", "#7dc88b", "#95d2a1", "#addcb6", "#c4e6cb"]; 
		//Extend Array Length
		var shirtNicheColorsLUT = replicateArray(tealColorScheme, 20);
		var pricingColorsLUT = replicateArray(greenColorScheme, 20);
		
		if(viewType == "month" && (localUnixToDate2.format("MMM YYYY") == moment().format("MMM YYYY"))){ //Monthly Labels
			
			//Projections
			/* Calculate Projections */
			startOfMonth = moment().startOf('month');
			today = moment();
			
			
			hoursSinceStartOfMonth = today.diff(startOfMonth, 'hours', true)
			hoursInMonth = moment().daysInMonth() * 24;
			
			var projectionSalesArray = new Array(salesData.length).fill(null); //Array of Nulls for Projection
			var projectionRevenueArray = new Array(salesData.length).fill(null); //Array of Nulls for Projection
			var projectionRoyaltiesArray = new Array(salesData.length).fill(null); //Array of Nulls for Projection
			

			/* Projected Sales */
			salesLastMonth = salesData[salesData.length - 2];
			salesThisMonthSoFar = salesData[salesData.length - 1];
			projectedSales = (salesThisMonthSoFar * hoursInMonth / hoursSinceStartOfMonth).toFixed(2); //Calculate Projection
			
			//Set Limits
			if (projectedSales >= salesLastMonth*3){
				projectedSales = salesLastMonth*3;
			} 
			
			projectionSalesArray[projectionSalesArray.length - 1] = projectedSales; 
			
			
			/* Projected Revenue */
			revenueLastMonth = revenueData[revenueData.length - 2];		
			revenueThisMonthSoFar = revenueData[revenueData.length - 1];
			projectedRevenue = (revenueThisMonthSoFar * hoursInMonth / hoursSinceStartOfMonth).toFixed(2); //Calculate Projection
			
			//Set Limits
			if (projectedRevenue >= revenueLastMonth*3){
				projectedRevenue = revenueLastMonth*3;
			} 
			
			projectionRevenueArray[projectionRevenueArray.length - 1] = projectedRevenue; 
			
			/* Projected Profit */
			royaltiesLastMonth = royaltyData[royaltyData.length - 2];
			royaltiesThisMonthSoFar = royaltyData[royaltyData.length - 1];
			projectedRoyalties = (royaltiesThisMonthSoFar * hoursInMonth / hoursSinceStartOfMonth).toFixed(2); //Calculate Projection
			
			
			//Set Limits
			if (projectedRoyalties >= royaltiesLastMonth*3){
				projectedRoyalties = royaltiesLastMonth*3;
			} 
			
			projectionRoyaltiesArray[projectionRoyaltiesArray.length - 1] = projectedRoyalties; 
		} else if(viewType == "week" && (localUnixToDate2.format("ww YYYY") == moment().format("ww YYYY")) ){ //Weekly Labels 
			//Projections
			/* Calculate Projections */
			startOfWeek = moment().startOf('week');
			today = moment();
			
			
			hoursSinceStartOfWeek = today.diff(startOfWeek, 'hours', true)
			hoursInWeek = 7 * 24;
			
			var projectionSalesArray = new Array(salesData.length).fill(null); //Array of Nulls for Projection
			var projectionRevenueArray = new Array(salesData.length).fill(null); //Array of Nulls for Projection
			var projectionRoyaltiesArray = new Array(salesData.length).fill(null); //Array of Nulls for Projection
			

			/* Projected Sales */
			salesLastMonth = salesData[salesData.length - 2];
			salesThisMonthSoFar = salesData[salesData.length - 1];
			projectedSales = (salesThisMonthSoFar * hoursInWeek / hoursSinceStartOfWeek).toFixed(2); //Calculate Projection
			
			//Set Limits
			if (projectedSales >= salesLastMonth*3){
				projectedSales = salesLastMonth*3;
			} else if (projectedSales <= salesLastMonth*0.5){
				projectedSales = salesLastMonth*0.5;
			}
			
			projectionSalesArray[projectionSalesArray.length - 1] = projectedSales; 
			
			
			/* Projected Revenue */
			revenueLastMonth = revenueData[revenueData.length - 2];		
			revenueThisMonthSoFar = revenueData[revenueData.length - 1];
			projectedRevenue = (revenueThisMonthSoFar * hoursInWeek / hoursSinceStartOfWeek).toFixed(2); //Calculate Projection
			
			//Set Limits
			if (projectedRevenue >= revenueLastMonth*3){
				projectedRevenue = revenueLastMonth*3;
			} else if (projectedRevenue <= revenueLastMonth*0.5){
				projectedRevenue = revenueLastMonth*0.5;
			}
			
			projectionRevenueArray[projectionRevenueArray.length - 1] = projectedRevenue; 
			
			
			/* Projected Profit */
			royaltiesLastMonth = royaltyData[royaltyData.length - 2];
			royaltiesThisMonthSoFar = royaltyData[royaltyData.length - 1];
			projectedRoyalties = (royaltiesThisMonthSoFar * hoursInWeek / hoursSinceStartOfWeek).toFixed(2); //Calculate Projection
			
			
			//Set Limits
			if (projectedRoyalties >= royaltiesLastMonth*3){
				projectedRoyalties = royaltiesLastMonth*3;
			} else if (projectedRoyalties <= royaltiesLastMonth*0.5){
				projectedRoyalties = royaltiesLastMonth*0.5;
			}
			
			projectionRoyaltiesArray[projectionRoyaltiesArray.length - 1] = projectedRoyalties; 
		}
		
		//Assemble Chart Info																	
		var lineChartData1 = {
			type: 'line',
			data: {
				labels: axisLabels,
				datasets: [{
					label: 'Projected Sales',
					data: projectionSalesArray,
					backgroundColor: "rgba(200, 200, 200, 0.75)",
					pointBorderColor: "#ddd",
					borderColor: "#ddd"
				}, {
					label: 'Returns',
					data: returnData,
					backgroundColor: "rgba(255, 204, 0, 0.75)",
					pointBorderColor: "rgba(255, 204, 0,1)",
					borderColor: "rgba(255, 204, 0,1)"
				}, {
					label: 'Cancellations',
					data: cancelData,
					backgroundColor: "rgba(255, 61, 61, 0.75)",
					pointBorderColor: "rgba(255, 61, 61,1)",
					borderColor: "rgba(255, 61, 61,1)"
				}, {
					label: 'Sales',
					data: salesData,
					backgroundColor: "rgba(91, 185, 70, 0.75)",
					pointBorderColor: "rgba(91, 185, 70,1)",
					borderColor: "rgba(91, 185, 70,1)"
				}]
			},
			options: globalLineChartOptions,
		};
			
		var lineChartData2 = {
			type: 'line',
			data: {
				labels: axisLabels,
				datasets: [{
					label: 'Royalties',
					data: royaltyData,
					backgroundColor: "rgba(215, 45, 255, 0.5)",
					pointBorderColor: "rgba(215, 45, 255,1)",
					borderColor: "rgba(215, 45, 255,1)"
				}, {
					label: 'Revenue',
					data: revenueData,
					backgroundColor: "rgba(246, 145, 30, 0.75)",
					pointBorderColor: "rgba(246, 145, 30,1)",
					borderColor: "rgba(246, 145, 30,1)"
				}, {
					label: 'Projected Royalties',
					data: projectionRoyaltiesArray,
					backgroundColor: "rgba(210, 210, 210, 0.75)",
					pointBorderColor: "#ccc",
					borderColor: "#ccc"
				}, {
					label: 'Projected Revenue',
					data: projectionRevenueArray,
					backgroundColor: "rgba(200, 200, 200, 0.75)",
					pointBorderColor: "#ddd",
					borderColor: "#ddd"
				}]
			},
			options: globalLineChartOptions,
		};
		
		//Genders Charts
		var lineChartData3 = {
			type: 'doughnut',
			data: {
				labels: Object.keys(gendersArray),
				datasets: [{							
					data: Object.values(gendersArray),
					backgroundColor: finalgendersColorsLUT,
				}]
			},
			options: globalLineChartOptions, 
		};
		
		//Size Charts
		var lineChartData4 = {
			type: 'doughnut',
			data: {
				labels: Object.keys(adjustedSizesArray),
				datasets: [{							
					data: Object.values(adjustedSizesArray),
					backgroundColor: ["#ffab91", "#ff8a65", "#ff7043", "#ff5722", "#e64a19", "#d84315", "#ffccbc"],
				}]
			},
			options: globalLineChartOptions,
		};
		
		//Colors Charts
		var lineChartData5 = {
			type: 'doughnut',
			data: {
				labels: Object.keys(shirtColorsObject),
				datasets: [{							
					data: Object.values(shirtColorsObject),
					backgroundColor: finalShirtColorsLUT,
				}]
			},
			options: globalLineChartOptions,
		};
		
		
		//Pricing Charts
		var lineChartData6 = {
			type: 'bar',
			data: {
				labels: Object.keys(sortedPriceObject),
				datasets: [{							
					data: Object.values(sortedPriceObject),
					backgroundColor: pricingColorsLUT,
				}]
			},
			options: globalLineChartOptions,
		};
		
		//Pricing Charts
		var lineChartData7 = {
			type: 'doughnut',
			data: {
				labels: Object.keys(productTypeObject),
				datasets: [{							
					data: Object.values(productTypeObject),
					backgroundColor: shirtNicheColorsLUT,
				}]
			},
			options: globalLineChartOptions,
		};
		
		
		
		var ctxSales = document.getElementById("canvas1").getContext("2d");	
		var myChart = new Chart(ctxSales, lineChartData1);
			
		var ctxRevenue = document.getElementById("canvas2").getContext("2d");	
		var myChart2 = new Chart(ctxRevenue, lineChartData2);
						
		var ctxGenders = document.getElementById("canvas3").getContext("2d");	
		ctxGenders.height = 500;
		var myChart3 = new Chart(ctxGenders, lineChartData3);
		
		var ctxSizes = document.getElementById("canvas4").getContext("2d");	
		var myChart4 = new Chart(ctxSizes, lineChartData4);
		
		var ctxColors = document.getElementById("canvas5").getContext("2d");	
		var myChart5 = new Chart(ctxColors, lineChartData5);
		
		var ctxPricing = document.getElementById("canvas6").getContext("2d");	
		var myChart6 = new Chart(ctxPricing, lineChartData6);
		
		var ctxProdTypes = document.getElementById("canvas7").getContext("2d");	
		var myChart7 = new Chart(ctxProdTypes, lineChartData7);
		
		
		//Summing up all values
		var allASINValues = [];
		for (i = 0; i < responseArray.length; i++){
			allASINValues.push(responseArray[i]["asin"]);
		}
										
		uniqueArray = allASINValues.filter(function(item, pos) {
			return allASINValues.indexOf(item) == pos;
		})
						
		//Create blank target array
		var resultSumSales = [];
		for(i=0; i < uniqueArray.length; i++){
			resultSumSales.push({
				ASIN: uniqueArray[i],
				Name: '',
				ProductType: '',
				Units: 0,
				Cancelled: 0,
				Returned: 0,
				Royalty: 0,
				Revenue: 0
			})
		}
		
		for (i = 0; i < resultSumSales.length; i++){
			for (i2 = 0; i2 < responseArray.length; i2++){
				if(resultSumSales[i]["ASIN"] == responseArray[i2]["asin"]){
					resultSumSales[i]["Name"] = responseArray[i2]["asinName"];
					resultSumSales[i]["ProductType"] = titleCase(responseArray[i2]["productType"].replace(/-/i, '&#8209;').replace(/_/g, " "));
					resultSumSales[i]["Units"] += parseInt(responseArray[i2]["unitsSold"]);
					resultSumSales[i]["Cancelled"] += parseInt(responseArray[i2]["unitsCancelled"]);
					resultSumSales[i]["Returned"] += parseInt(responseArray[i2]["unitsReturned"]);
					resultSumSales[i]["Royalty"] += parseFloat(responseArray[i2]["royalties"]["value"]);
					resultSumSales[i]["Revenue"] += parseFloat(responseArray[i2]["revenue"]["value"]);
				}
			}
		}
							
		// Assemble Sales History Table
		var cp2 = '<table class="maa-table table table-striped sortable" id="itemizedList">' +
			'<thead>' + 
				'<tr>' +
					'<th>#</th>' +
					'<th>Product Name</th>' +
					'<th>Product Type</th>' +
					//'<th class="text-center">Product Details</th>' +
					'<th class="text-center">Units Sold</th>' +
					'<th class="text-center">Units Cancelled</th>' +
					'<th class="text-center">Units Returned</th>' +
					'<th class="text-center">Revenue</th>' +
					'<th class="text-center">Royalties</th>' +
					'<th class="text-center">Royalties / Unit</th>' +
				'</tr>'  +
			'</thead><tbody>';

		//Sort Sales Data By Units Sold Descending
		resultSumSales.sort(function(a, b){
		  return b.Units - a.Units;
		});
							
		for (i=0; i < resultSumSales.length; i++){			
			
			var itemName = resultSumSales[i]["Name"].replace(/"/g, "");
			var uriEncodedName = encodeURIComponent(itemName); 		
				
			cp2 += '<tr data-href="https://www.amazon.com/dp/' + resultSumSales[i]["ASIN"]  +   '">' + 
				'<td>' + (i + 1) + '</td>' + 
				'<td>' + 
					resultSumSales[i]["Name"]  + 
				'</td>' + 
				
				'<td>' + 
					resultSumSales[i]["ProductType"]   + 
				'</td>' + 
						
				/*
				'<td class="text-center btn-inside">' +						
					'<a target="_blank" href="' + '/IndividualProductPage/?ASIN=' + resultSumSales[i]["ASIN"]  + '" class="btn btn-primary">Analyze</a>' +
				'</td>' +
				*/
								
				'<td class="text-center">' +
					resultSumSales[i]["Units"]  +
				'</td>' +
					
				'<td class="text-center">' +
					resultSumSales[i]["Cancelled"]  +
				'</td>' +
				
				'<td class="text-center">' +
					resultSumSales[i]["Returned"]  +
				'</td>' +
				
				'<td class="text-center">' +
					'$' + resultSumSales[i]["Revenue"].toFixed(2)  +
				'</td>' +
				
				'<td class="text-center">' +
					'$' + resultSumSales[i]["Royalty"].toFixed(2)  +
				'</td>' +
				
				'<td class="text-center">' +
					'$' + (resultSumSales[i]["Royalty"].toFixed(2) / (resultSumSales[i]["Units"] - resultSumSales[i]["Cancelled"] - resultSumSales[i]["Returned"] + 0.00001)).toFixed(2)  +
				'</td>' +
			'</tr>'; 
		}
					
		cp2 += '</tbody></table>';
		
		document.getElementById("shirtlist").innerHTML = cp2;
			
		//Init TableSort
		new Tablesort(document.getElementById('itemizedList'));
		
		//Make Entire Row Clickable & Link to Individual Product Page
		$(function(){
			$('#itemizedList tbody > tr[data-href!=""] td:not(.btn-inside)').click(function() {
				var url = $(this).closest("tr").data("href");
				window.open(url, '_blank');
			});
		});

		$('input[name="datefilter"]').daterangepicker(
			{  
				showDropdowns: true,
				opens: 'left',
				linkedCalendars: false,
				showCustomRangeLabel: false,
				autoApply: true,
				autoUpdateInput: true,
				alwaysShowCalendars: true,
				maxDate: new Date,
				minDate: new Date(2015, 9, 1),
				ranges: {
				   'Today': [moment(), moment()],
				   'Last 7 Days': [moment().subtract(7, 'days').startOf('day'), moment().startOf('day')],
				   'Last 14 Days': [moment().subtract(13, 'days'), moment()],
				   'Last 30 Days': [moment().subtract(29, 'days'), moment()],
				   'This Month': [moment().startOf('month'), moment().endOf('month')],
				   'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
				   'Last 90 Days': [moment().subtract(89, 'days'), moment()]
				}
			}
		);
		
		function resubmitPage(picker){
			//Calculate Unix Timestamps
			var fromDate = picker.startDate.unix();
			var toDate = picker.endDate.unix();
			
			if((toDate - fromDate) < (91*24*60*60) && (toDate - fromDate) > (32*24*60*60)){
				var extraFlag = 'week';
				fromDate = moment.unix(fromDate).startOf('week').unix(); //Get full weeks offset						
			} else if ((toDate - fromDate) > 91*24*60*60){
				var extraFlag = 'month';
				fromDate = moment.unix(fromDate).startOf('month').unix(); //Get full months offset						
			} else {
				var extraFlag = 'day';
			}
			dailySalesPage(fromDate, toDate, extraFlag);
		}
		
		$('input[name="datefilter"]').on('apply.daterangepicker', function(ev, picker) {					
			resubmitPage(picker);
		});
		
		$('input[name="datefilter"], input[name="daterangepicker_start"],  input[name="daterangepicker_end"]').on("keyup", function(e) {
			if (e.keyCode == 13) {
				var picker = {};
				
				picker.startDate = $('input[name="datefilter"]').data('daterangepicker').startDate;
				picker.endDate = $('input[name="datefilter"]').data('daterangepicker').endDate;
				
				resubmitPage(picker);
			}
		});

	
	globalStatus = 'none';
	
		
	});
	
}

/***************************************************************/
/******************* Product Manager Page **********************/
/***************************************************************/
function productManager() {
	globalStatus = 'working';
	document.title = "Manage Products - Merch Advanced Analytics";
		
	var pageContent = '<div class="container maa-container">' + 
							'<div class="maa-card card">' +
								'<div class="card-block">'+
									'<div id="manager-stats" class="status clear"><center><h3>Loading...</h3><i class="fa fa-spinner fa-spin fa-4"></i></center></div>' + 
								'</div>' +
							'</div>'+ 
							'<div class="maa-card card">' +
								'<div class="card-header clear">' +
									'<strong>Live Products</strong>' +
									'<div class="btn-group float-right" role="group" aria-label="Basic example">' +
										'<div class="btn btn-outline-secondary" id="reset-button" data-toggle="tooltip" data-placement="bottom" title="Clear All Niche Data"><i class="fa fa-trash" aria-hidden="true"></i></div>' +
									'</div>' + 
								'</div>' + 
								'<div class="card-block" id="shirtlist"></div>' + 
							'</div>'+ 
						'</div>';
	
	$(".wrapper").children().filter(":not(#sidebar)").remove();
	$(".wrapper").append(pageContent);	
    
	fetchAllLiveProducts(1, '0', ts = [], null, function(){
		var cp2 = '<table id="productManagerTable" class="maa-table sortable table table-striped"><thead><tr>' +
			'<th class="text-center">Design</th>' +
			'<th>Title</th>' +
			'<th>Niche</th>' +
			'<th class="text-center">Product Type</th>' +
			'<th class="text-center">Creation Date</th>' +
			'<th class="text-center">Days Until Deletion</th>' +
			'<th class="text-center">Product Details</th>' +
			'<th class="text-center">Price</th>' +
			'<th class="text-center">Edit</th>' +
			'<th class="text-center">Delete</th>' +
			'</tr></thead>' +
		'<tbody>';
		
		//Setup counter variables
		var lifetimesSalesCounter = 0;
		var liveDesignsCounter = 0;
		var strOfASINs = '';
		var productType = '';
		
		for (var i = 0; i < ts.length; i++) {					
			if (ts[i].marketplaceAsinMap.US !== undefined && (ts[i].status == "LIVE" || ts[i].status == "PROCESSING" || ts[i].status == "MANUALLY_REJECTED" || ts[i].status == "UNDER_AUTO_REVIEW")){
				var hasLifetimeSales = false;
				liveDesignsCounter++;
				
				//Determine if a design has ever sold
				if(ts[i].daysUntilDeletion.length === 0 || ts[i].daysUntilDeletion == null){
					hasLifetimeSales = true;
					lifetimesSalesCounter++;
				}
			}
		
			if (ts[i].marketplaceAsinMap.US !== undefined && (ts[i].status == "LIVE" || ts[i].status == "PROCESSING" || ts[i].status == "UNDER_AUTO_REVIEW") ){
				//Parse Create Date
				var stringifiedCreateDate = moment.unix(parseInt(ts[i].createDate) / 1000).format("MM-DD-YYYY");
							
				var itemName = ts[i].name.replace(/"/g, "");
				var uriEncodedName = encodeURIComponent(itemName); 
				var deleteLink = 'https://merch.amazon.com/manage/products?pageNumber=1&pageSize=15&keywords=' + uriEncodedName + '&statusFilters=%5B%22DELETED%22%2C%22DRAFT%22%2C%22LIVE%22%2C%22NOT_DISCOVERABLE%22%2C%22PENDING%22%2C%22PROCESSING%22%2C%22STOPPED%22%2C%22UNDER_REVIEW%22%2C%22REJECTED%22%2C%22MANUALLY_REJECTED%22%5D';
				
			
				
				
				determineProductType(ts[i].shirtType, function(productType, productEditBaseUrl){
					cp2 += '<tr data-lifetime-sales="'+ hasLifetimeSales.toString() + '" data-href="https://www.amazon.com/dp/' + ts[i].marketplaceAsinMap.US + '">' +
								'<td class="text-center">' +	
									'<img class="img-thumbnail design-preview" src="' +   ts[i].imageURL + '">' +
									'<img class="floated-preview img-thumbnail" style="display:none" src="' +   ts[i].imageURL + '">' +
								'</td>' +
								
								'<td class="product-name"><span>' + ts[i].name + '</span></td>' + 
									
								'<td class="text-center btn-inside">' +
									'<div class="form-group">' +
									  '<input type="text" name="nicheName" class="form-control niche-input"/>' +
									  '<input type="hidden" name="parentASIN" value='+ ts[i].marketplaceAsinMap.US + '>' +
									'</div>' +
								'</td>' +
								
								'<td class="text-center">' +	
									productType +
								'</td>' +
								
								'<td class="text-center no-wrap">' +	
									stringifiedCreateDate +
								'</td>' +
								
								'<td class="text-center">' +
									ts[i].daysUntilDeletion + 
								'</td>' +
								
								'<td class="text-center btn-inside">' +
									'<a target="_blank" href="\/IndividualProductPage\/?ASIN=' + ts[i].marketplaceAsinMap.US  + '" class="btn btn-primary">Analyze</a>' +
								'</td>' +
								
								'<td class="text-center">' + ts[i].listPrice + '</td>' +
								'<td class="text-center btn-inside">' + '<a target="_blank" href="' + productEditBaseUrl + ts[i].id + '/add_details" class="btn btn-outline-primary">Edit</a>' + '</td>' +
								'<td class="text-center btn-inside">' +  '<a target="_blank" href="' + deleteLink + '" class="btn btn-outline-danger"><i class="fa fa-trash-o fa-lg"></i></a>' + '</td>' +
							'</tr>';
				})
			}
		}
				
		cp2 += '</tbody></table>';
		document.getElementById("shirtlist").innerHTML = cp2;
						
		managerStats = '<center><h2>Product Manager</h2></center>' +
			'<table class="maa-table table table-striped"><thead>' + 
				'<tr>' +
					'<th class="text-center">Products With Atleast One Lifetime Sale</th>'+
					'<th class="text-center">Total Live Products (US)</th>' + 
					'<th class="text-center">% Of Designs that Have Ever Sold</th>' + 
				'</tr></thead><tbody>' + 
				'<tr class="success text-center">' + 
					'<td><b>' + lifetimesSalesCounter + '</b></td>' + 
					'<td><b>' + liveDesignsCounter + '</b></td>' + 
					'<td><b>' + (lifetimesSalesCounter/liveDesignsCounter*100).toFixed(2)+'%'+'</b></td>' + 
				'</tr></tbody>' +
			'</table>';
						
			
		document.getElementById("manager-stats")
			.innerHTML = managerStats;
				
		//Hover Images
		$('.design-preview').mouseenter(function() {
			$(this).siblings('.floated-preview').show();
		});
		
		$('.floated-preview').mouseleave(function (){ //Hover Out
			$(this).hide();
		});
				
		new Tablesort(document.getElementById('productManagerTable'));
		
		//Make Entire Row Clickable & Link to Individual Product Page				
		$(function(){
			$('#productManagerTable tbody > tr[data-href!=""] td:not(.btn-inside)').click(function() {
				var url = $(this).closest("tr").data("href");
				window.open(url, '_blank');
			});
			
			$('[data-toggle="tooltip"]').tooltip();//Init tooltips
		});
				
		globalStatus = 'none';
	});
}

/***************************************************************/
/**************** Individual Product Page **********************/
/***************************************************************/
function individualProductPage(queryParams){
	globalStatus = 'working';
	if (queryParams["ASIN"]){
		pageContent = '<div class="container maa-container">' +
							'<div class="maa-card card"></center>'+
								'<div class="card-block">'+ 
									'<div id="individualShirtSummary" class="status clear"><center><h3>Loading...</h3><i class="fa fa-spinner fa-spin fa-4"></i></center></div>' + 
								'</div>' +
							'</div>' +
							
							'<div class="maa-card card" id="">' +
								'<div class="card-header">' + 
									'<ul class="nav nav-pills card-header-pills" role="tablist">' +
										'<li class="nav-item"><a class="nav-link active" href="#sales" role="tab" data-toggle="tab">Sales/Cancellations</a></li>' +
										'<li class="nav-item"><a class="nav-link" href="#revenue" role="tab" data-toggle="tab">Revenue/Royalties</a></li>' +
										'<li class="nav-item"><a class="nav-link" href="#advanced" role="tab" data-toggle="tab">Advanced Analytics</a></li>' +
									'</ul>' +
								'</div>' +
								
								'<div class="card-block tab-content">' +
									'<div class="tab-pane active" role="tabpanel" id="sales">' +
										'<center class="inner-container"><canvas id="canvas1" height="450" width="800" ></canvas></center>' + 
									'</div>' +
									
									'<div class="tab-pane" role="tabpanel" id="revenue">' +
										'<center class="inner-container"><canvas id="canvas2" height="450" width="800" ></canvas></center>' +
									'</div>' + 
									
									
									'<div class="tab-pane" role="tabpanel"  id="advanced">' +
										'<center class="row">' +
											'<div class="canvas-wrapper col col-xs-4 col-sm-4">' +
												'<canvas id="canvas3" height="350" width="280" ></canvas>' +
												'<h5 class="canvas-title">Fit Distribution</h5>' +
											'</div>' +
											'<div class="canvas-wrapper col col-xs-4 col-sm-4">'+
												'<canvas id="canvas4" height="350" width="280" ></canvas>' +
												'<h5 class="canvas-title">Size Distribution</h5>' +
											'</div>'+
											'<div class="canvas-wrapper col col-xs-4 col-sm-4">'+
												'<canvas id="canvas5" height="350" width="280" ></canvas>'+
												'<h5 class="canvas-title">Color Distribution</h5>' +
											'</div>' +
										'</center>' +
									'</div>' +
								
								'</div>' +
							'</div>' +
								

							'<div class="maa-card card">' + 
								'<div class="card-header">Sales History</div>' + 
								'<div class="card-block" id="individualShirtSales"></div>' +
							'</div>' +
						'</div>';

		$(".wrapper").children().filter(":not(#sidebar)").remove();
		$(".wrapper").append(pageContent);
		
		renderIndividualProductSales(queryParams);
	} else {
		pageContent = '<div class="container maa-container">' +
						'<div class="maa-card card"></center>'+
							'<div class="card-block">'+ 
								'<div id="individualShirtSummary" class="status clear text-center">' +
									'<h2>Enter Your Product ASIN</h2>' +
									'<div class="form-group">' +
										'<input type="text">' +
										'<button class="btn btn-primary submit-asin">Go</button>' +
									'</div>' + 
									'<p>Or select a product from the Product Manager page and click "Product Details"</p>' +
								'</div>' + 
							'</div>' +
						'</div>' +
					'</div>';
		
		$(".wrapper").children().filter(":not(#sidebar)").remove();
		$(".wrapper").append(pageContent);
		
		$(".submit-asin").click(function(){
			var asin = $(this).closest('.form-group').find("input").val();
			if (asin.length != 10){
				alert("Please enter a valid ASIN");
			} else {
				window.location.replace("/IndividualProductPage/?ASIN=" + asin);
			}
		})
	}
}

/*
function renderIndividualProductSales(queryParams){
	$('#sidebar li').removeClass("active")
	$('#indvProduct').closest('li').addClass("active");
	$('#indvProduct').closest('li').show();
	
	var targetASIN = queryParams["ASIN"];
	
	
	// Need To get First Publication Date
	fetchAllLiveProducts(1, '0', liveProductsArray = [], targetASIN, function(){
		var firstPublishDate = {};
					
		for ( i =0; i < liveProductsArray.length; i++){
			if(liveProductsArray[i]["marketplaceAsinMap"]["US"] == targetASIN){
				var firstPublishDate = parseInt(liveProductsArray[i]["firstPublishDate"]) / 1000;
				var imgURL = liveProductsArray[i]["imageURL"]; 
				var shirtName = liveProductsArray[i]["name"];	
				var shirtID = liveProductsArray[i]["id"];
				var productTypeTemp = liveProductsArray[i]["shirtType"];
				break;
			}
		}
		
		
		
		
		determineProductType(productTypeTemp, function(productTypeMain, productEditBaseUrl){
			fetchIndividualProductSales(targetASIN, firstPublishDate,function(responseArray){	
				//TODO workaround error handling
				if (!firstPublishDate){
					alert("Item not found", "First Publish Date: ", firstPublishDate);
				}

				//Generate Axis Labels
				var axisLabels = [];
				var today = moment().endOf('day');
				
				var tempFirstPublishDate = moment.unix(firstPublishDate);
				
				while (tempFirstPublishDate.unix() <= today.unix()) {			
					axisLabels.push(tempFirstPublishDate.format("MM-DD-YYYY"));
					
					tempFirstPublishDate.add(1, 'days');
				}
				
				var salesData = new Array(axisLabels.length).fill(0);
				var cancelData = new Array(axisLabels.length).fill(0);
				var returnData = new Array(axisLabels.length).fill(0);
				var revenueData = new Array(axisLabels.length).fill(0);
				var royaltyData = new Array(axisLabels.length).fill(0);
				
				//Tally Numbers
				var gendersArray = {'Men': 0, 'Women': 0, 'Youth': 0, 'Unisex': 0};
				var sizesArray = {'Small': 0, 'Medium': 0, 'Large': 0, 'XL': 0, '2XL': 0, '3XL': 0, '4': 0, '6': 0, '8': 0, '10': 0, '12': 0};
				var shirtColorsArray = {'Dark Heather': 0, 'Heather Grey': 0, 'Heather Blue': 0, 'Black': 0, 'Navy': 0, 'Silver': 0, 'Royal Blue': 0, 'Brown': 0, 'Slate': 0, 'Red': 0, 'Asphalt': 0, 'Grass': 0, 'Olive': 0, 'Kelly Green': 0, 'Baby Blue': 0, 'White': 0, 'Lemon': 0, 'Cranberry': 0, 'Pink': 0, 'Orange': 0, 'Purple': 0};
				var priceObject = {};
				var productType = "";
				
				//Sales Data (Not Very Efficient)
				for (i = 0; i < axisLabels.length; i++) {
					for ( i2 = 0; i2 < responseArray.length; i2++){
						if(axisLabels[i] == responseArray[i2]["Date"]){
							salesData[i] += parseInt(responseArray[i2]["Units"]);
							cancelData[i] += parseInt(responseArray[i2]["Cancelled"]);
							returnData[i] += parseInt(responseArray[i2]["Returned"]);
							revenueData[i] += parseFloat(responseArray[i2]["Revenue"]);
							royaltyData[i] += parseFloat(responseArray[i2]["Royalty"]);
							
							//Determine Gender And Count it 
							for (var key in gendersArray){
								if (key.toString() == responseArray[i2]["Category 1"]){
									gendersArray[key] += 1;
								}
							}
							
							//Determine Size And Count it 
							for (var key in sizesArray){
								if (key.toString() == responseArray[i2]["Category 2"]){
									sizesArray[key] += 1;
								}
							}
							
							//Determine Color And Count it 
							for (var key in shirtColorsArray){
								if (key.toString() == responseArray[i2]["Category 3"]){
									shirtColorsArray[key] += 1;
								}
							}
							
							//Set Product Type 
							productType = responseArray[i2]["Product Type"]
						} 
					}
				}
				
				var lifetimeSales = salesData.reduce(function(a, b) { return a + b; }, 0) - cancelData.reduce(function(a, b) { return a + b; }, 0) - returnData.reduce(function(a, b) { return a + b; }, 0);
				var lifetimeRevenue = revenueData.reduce(function(a, b) { return a + b; }, 0).toFixed(2);
				var lifetimeRoyalties = royaltyData.reduce(function(a, b) { return a + b; }, 0).toFixed(2);
				
				var lifespan = Math.round(today.diff(moment.unix(firstPublishDate), 'days', true));	
				var computedLifespan = lifespan;
				if (computedLifespan <= 30){ 
					computedLifespan = 30 //Minimum 1 month lifespan
				}; 
				
				var uriEncodedName = encodeURIComponent(shirtName); 
				
				var shirtInfo = '<center>' +
									'<h2><a target="_blank" href="https://www.amazon.com/dp/' + targetASIN + '">' +
										shirtName +
									'</a></h2>' +
									'<p class="text-muted text-uppercase ">Individual Product Info</p>'+
								'</center>' + 
								'<div class="row">' +	
									'<div class="col col-xs-3 col-sm-2">' +	
										'<a target="_blank" href="https://www.amazon.com/dp/' + targetASIN + '">' +
											'<img class="img-responsive" src="' +  imgURL + '">' +
										'</a>' +
									'</div>' +
									'<div class="dl-list col col-xs-9 col-sm-10">' +	
										'<dl>' +
											'<dt>Product Type:&nbsp; </dt>' +
											'<dd>' + productTypeMain + '</dd>' +
										'</dl>' +
										'<dl>' +
											'<dt>First Published Date:&nbsp;</dt>' +
											'<dd>' + moment.unix(firstPublishDate).format("MM-DD-YYYY") + '</dd>' +
										'</dl><dl>' +
											'<dt>Days Live:&nbsp; </dt>' +
											'<dd>' + 
													lifespan + " days"+
											'</dd>' +
										'</dl><dl>' +
											'<dt>Lifetime Sales:&nbsp; </dt>' +
											'<dd>' + lifetimeSales + '</dd>' +
										'</dl><dl>' +
											'<dt>Lifetime Revenue:&nbsp; </dt>' +
											'<dd>$' + lifetimeRevenue + '</dd>' +
										'</dl><dl>' +
											'<dt>Lifetime Royalties:&nbsp; </dt>' +
											'<dd>$' + lifetimeRoyalties + '</dd>' +
										'</dl><dl>' +
											'<dt>Average Royalties / Month :&nbsp; </dt>' +
											'<dd>$' + (lifetimeRoyalties / (computedLifespan / 30)).toFixed(2) + '</dd>' +
										'</dl><dl>' +
											'<dt style="margin: 5px 5px 5px 0;">Niche: </dt>' +
											'<dd>'+
												'<div class="form-group">' +
													'<input type="text" class="form-control niche-input">'  +
												'</div>' +
											'</dd>' +
										'</dl>' +
										'<div class="btn-group-inline">' +
											'<a target="_blank" href="' + productEditBaseUrl + shirtID + '/add_details" class="btn btn-outline-primary">Edit</a>' + 
										'</div>' +
									'</div>' +
								'</div>';
				
				document.getElementById("individualShirtSummary").innerHTML = shirtInfo;	
								
				//Regroup all youth sizes to just Youth
				var adjustedSizesArray = {'Youth': 0, 'Small': 0, 'Medium': 0, 'Large': 0, 'XL': 0, '2XL': 0, '3XL': 0};
				for(var item in sizesArray){
					if (item == "4" || item == "6" || item == "8" || item == "10" || item == "12") {
						adjustedSizesArray['Youth'] += parseInt(sizesArray[item]);
					}
					else {
						adjustedSizesArray[item] += parseInt(sizesArray[item]);
					}
				}
					
				//Make sure colors are in correct order												
				var shirtColorsColorsLUT = {'Dark Heather': "#454b4b", 'Heather Grey': "#d5d9da", 'Heather Blue': "#696c9c", 'Black': "#222", 
					'Navy': "#15232b", 'Silver': "#cfd1d1", 'Royal Blue': "#1c4086", 'Brown': "#31261d", 'Slate': "#818189", 'Red': "#b71111", 'Asphalt': "#3f3e3c", 
					'Grass': "#5e9444", 'Olive': "#4a4f26", 'Kelly Green': "#006136", 'Baby Blue': "#8fb8db", 'White': "#eeeeee", 'Lemon': "#f0e87b", 'Cranberry': "#6e0a25",
					'Pink': "#f8a3bc", 'Orange': "#ff5c39", 'Purple': "#514689"};
				var finalShirtColorsLUT = [];
				for (var key in shirtColorsArray){
					finalShirtColorsLUT.push(shirtColorsColorsLUT[key]);
				}
				
				sortedPriceObject = {};
				
				Object.keys(priceObject)
					.sort().forEach(function(key) {
					sortedPriceObject[key] = priceObject[key];
				});;
				
				var shirtNicheColorsSeed = ["#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#009688", "#00897b", "#00796b", "#00695c", "#004d40"];
				//Extend Array Length
				var shirtNicheColorsLUT = replicateArray(shirtNicheColorsSeed, 20);
				

				var lineChartData1 = {
					type: 'line',
					data: {
						labels: axisLabels,
						datasets: [{
							label: 'Cancellations',
							data: cancelData,
							backgroundColor: "rgba(255, 61, 61, 0.75)",
							pointBorderColor: "rgba(255, 61, 61,1)",
							borderColor: "rgba(255, 61, 61,1)"
						}, {		
							label: 'Returns',
							data: returnData,
							backgroundColor: "rgba(255, 204, 0, 0.75)",
							pointBorderColor: "rgba(255, 204, 0,1)",
							borderColor: "rgba(255, 204, 0,1)"
						}, {
							label: 'Sales',
							data: salesData,
							backgroundColor: "rgba(91, 185, 70, 0.75)",
							pointBorderColor: "rgba(91, 185, 70,1)",
							borderColor: "rgba(91, 185, 70,1)"
						}]
					},
					options: globalLineChartOptions,
				};
			
			
				var lineChartData2 = {
					type: 'line',
					data: {
						labels: axisLabels,
						datasets: [{
							label: 'Royalties',
							data: royaltyData,
							backgroundColor: "rgba(215, 45, 255, 0.5)",
							pointBorderColor: "rgba(215, 45, 255,1)",
							borderColor: "rgba(215, 45, 255,1)"
						}, {
							label: 'Revenue',
							data: revenueData,
							backgroundColor: "rgba(246, 145, 30, 0.75)",
							pointBorderColor: "rgba(246, 145, 30,1)",
							borderColor: "rgba(246, 145, 30,1)"
						}]
					},
					options: globalLineChartOptions,
				};
				
				//Genders Charts
				var lineChartData3 = {
					type: 'doughnut',
					data: {
						labels: Object.keys(gendersArray),
						datasets: [{							
							data: Object.values(gendersArray),
							backgroundColor: ["#3498db", "#e86dab", "#84cb74"],
						}]
					},
					options: globalLineChartOptions,
				};
				
				//Size Charts
				var lineChartData4 = {
					type: 'doughnut',
					data: {
						labels: Object.keys(adjustedSizesArray),
						datasets: [{							
							data: Object.values(adjustedSizesArray),
							backgroundColor: ["#ffab91", "#ff8a65", "#ff7043", "#ff5722", "#e64a19", "#d84315", "#ffccbc"],
						}]
					},
					options: globalLineChartOptions,
				};
				
				//Colors Charts
				var lineChartData5 = {
					type: 'doughnut',
					data: {
						labels: Object.keys(shirtColorsArray),
						datasets: [{							
							data: Object.values(shirtColorsArray),
							backgroundColor: finalShirtColorsLUT,
						}]
					},
					options: globalLineChartOptions,
				};
				
				var ctxSales = document.getElementById("canvas1").getContext("2d");	
				var myChart = new Chart(ctxSales, lineChartData1);
				
				var ctxRoyalties = document.getElementById("canvas2").getContext("2d");	
				var myChart = new Chart(ctxRoyalties, lineChartData2);
				
				var ctxGenders = document.getElementById("canvas3").getContext("2d");	
				var myChart = new Chart(ctxGenders, lineChartData3);
				
				var ctxSizes = document.getElementById("canvas4").getContext("2d");	
				var myChart = new Chart(ctxSizes, lineChartData4);
				
				var ctxColors = document.getElementById("canvas5").getContext("2d");	
				var myChart = new Chart(ctxColors, lineChartData5);
					
				//Assemble Sales History Table 
				var cp2 = '<table id="indvTable" class="maa-table table table-striped sortable"><thead><tr><th>#</th>' +
					'<th class="text-center">Date Sold</th>' +
					'<th class="text-center">Sold</th>' +
					'<th class="text-center">Cancelled</th>' +
					'<th class="text-center">Returned</th>' +
					'<th class="text-center">Revenue</th>' +
					'<th class="text-center">Royalty</th>' +
					'<th class="text-center">Gender</th>' +
					'<th class="text-center">Size</th>' +
					'<th class="text-center">Color</th>' +
					'</tr></thead><tbody>';
					
				for (i=0; i < responseArray.length; i++){
					cp2 += '<tr><th scope="row">' + (i + 1) + '</th>' + 
						'<td class="text-center">' + 
							responseArray[i]["Date"]  + 
						'</td>' + 
						
						'<td class="text-center">' +
							responseArray[i]["Units"]  +
						'</td>' +
						
						'<td class="text-center">' +
							responseArray[i]["Cancelled"]  +
						'</td>' +
						
						'<td class="text-center">' +
							responseArray[i]["Returned"]  +
						'</td>' +
						
						'<td class="text-center">' +
							responseArray[i]["Revenue"]  +
						'</td>' +
							
						'<td class="text-center">' +
							responseArray[i]["Royalty"]  +
						'</td>' +
						
						'<td class="text-center">' +
							responseArray[i]["Category 1"]  +
						'</td>' +
						
						'<td class="text-center">' +
							responseArray[i]["Category 2"]  +
						'</td>' +
						
						'<td class="text-center">' +
							responseArray[i]["Category 3"]  +
						'</td>';
				}

				cp2 += '</tbody></table>';
				document.getElementById("individualShirtSales").innerHTML = cp2;
				
				new Tablesort(document.getElementById('indvTable'));
			});
		});
		
		globalStatus = 'none';
	});	
}

*/



function fetchIndividualProductSales(targetASIN, publishDate, callback){
	var toDate = moment().unix();
	var fromDate = publishDate;

	fetchSalesDataCSV(fromDate, toDate, responseArray = [], function(){
		infoAboutTargetASIN = []
		for (i=0; i < responseArray.length; i++){
			if (responseArray[i]["ASIN"] == targetASIN){
				infoAboutTargetASIN.push(responseArray[i]);
			}
		}
		callback(infoAboutTargetASIN);
	});
	
}

/***************************************************************/
/*********************** Settings Page *************************/
/***************************************************************/
function settingsPage (e) {
	globalStatus = 'working';
	document.title = "Settings - Merch Advanced Analytics";
	
	$(".wrapper").children().filter(":not(#sidebar)").remove();
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", chrome.extension.getURL('options.html'), true);
	xhr.setRequestHeader('Content-type', 'text/html');
	xhr.onreadystatechange = function (e) { 
		if (xhr.readyState == 4) {
            if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(xhr.status) === -1) {

            } else {
				var response = xhr.responseText;
				$(".wrapper").append(response);	
				
				$(function(){
					restore_options();
					$('#save-settings').click(function() {
						save_options();						
					});
				})
			}
		}
	}
	xhr.send();
	globalStatus = 'none';
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get("Settings", function(items) {
		if(Object.values(items).length != 0){
			parsedJson = JSON.parse(items["Settings"]);
			
			optionSound	= parsedJson["sound"];
			optionNotif	= parsedJson["popup"];
			optionDashboard	= parsedJson["optionDashboard"];
			enterToNextPage	= parsedJson["enterToNextPage"];
			uploadHelper = parsedJson["uploadHelper"];
				
			if (optionSound){
				$('#notificationSound').prop('checked', true);
			} else {
				$('#notificationSound').prop('checked', false);
			}
					
			if (optionNotif){
				$('#notificationPopup').prop('checked', true);
			}else{
				$('#notificationPopup').prop('checked', false);
			}
			
			if (enterToNextPage){
				$('#enterToNextPage').prop('checked', true);
			}else{
				$('#enterToNextPage').prop('checked', false);
			}

			if (uploadHelper){
				$('#uploadHelper').prop('checked', true);
			}else{
				$('#uploadHelper').prop('checked', false);
			}
			
			if (optionDashboard){
				$('#optionDashboard').prop('checked', true);
			}else{
				$('#optionDashboard').prop('checked', false);
			}
		}
		
		globalStatus = 'none';
	});
}

// Saves options to chrome.storage
function save_options() {
	var optionSound = $('#notificationSound').prop("checked") ? 1 : 0;
	var optionNotif = $('#notificationPopup').prop("checked") ? 1 : 0;
	var enterToNextPage = $('#enterToNextPage').prop("checked") ? 1 : 0;
	var uploadHelper = $('#uploadHelper').prop("checked") ? 1 : 0;
	var optionDashboard = $('#optionDashboard').prop("checked") ? 1 : 0;
	
	var data = JSON.stringify({
		'sound': optionSound,
		'popup': optionNotif,
		'optionDashboard': optionDashboard,
		'enterToNextPage': enterToNextPage,
		'uploadHelper': uploadHelper,
	});
    var jsonfile = {};
    jsonfile["Settings"] = data;
	
	chrome.storage.sync.set(jsonfile, function () {
		var status = $('#save-settings');
		status.text('Saved');
		status.removeClass('btn-default');
		status.addClass('btn-success');
		console.log("Saved", data);
		setTimeout(function() {
			status.text('Save');
			status.removeClass('btn-success');
			status.addClass('btn-default');
		}, 750);
    });
	
}

	

