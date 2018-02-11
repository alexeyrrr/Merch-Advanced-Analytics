/***************************************************************/
/*************** Date & Global Helper Functions ******************/
/***************************************************************/
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
      /* if we meet a double quote we skip until the next one */
      var c = row[idx];

      if (c === '"') {
        do { c = row[++idx]; } while (c !== '"' && idx < row.length - 1);
      }

      if (c === ',' || /* handle end of line with no comma */ idx === row.length - 1) {
        /* we've got a value */
        var value = row.substr(startValueIdx, idx - startValueIdx).trim();

        /* skip first double quote */
        if (value[0] === '"') { value = value.substr(1); }
        /* skip last comma */
        if (value[value.length - 1] === ',') { value = value.substr(0, value.length - 1); }
        /* skip last double quote */
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

function assembleDynamicBlankArray(callback){
	chrome.storage.sync.get(null, function(items) {
		//chrome.storage.local.get(null, function(localItems) { //Get both sync and local storage
			var allValues = Object.values(items); // + Object.values(localItems);
			
			for (i = 0; i < allValues.length; i++){
				allValues[i] =  JSON.parse(allValues[i]);
				allValues[i] = allValues[i]["niche"]
			}
			
			uniqueArray = allValues.filter(function(item, pos) {
				return allValues.indexOf(item) == pos;
			})
			
			var resultBlankArray = {};
			//Init count to 0
			for (i = 0; i < uniqueArray.length; i++){
				resultBlankArray[uniqueArray[i]] = 0;
			}
			
			resultBlankArray["unknown niche"] = 0;
			
			callback(resultBlankArray);
		//});
	});
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
							'<li><a id="productManager"><i class="fa fa-pencil-square-o" aria-hidden="true"></i> Manage Products</a></li>' +
							'<li style="display:none;"><a id="indvProduct"><i class="fa fa-crosshairs" aria-hidden="true"></i> Individual Product Info</a></li>' +
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
		
function globalInit(){
	document.head.innerHTML = globalHeader;
	document.body.innerHTML = globalBody;
	document.body.style.backgroundColor = "#ecf1f2";  
	
	document.body.classList.add('merch-advanced-analytics');
		
	//Initialize Sidebar
	$(function(){		
		$("#todaySales").click(function(){
			var fromDateToday = moment().startOf('day').unix();
			var toDateToday = moment().endOf('day').unix();
			
			dailySalesPage(fromDateToday, toDateToday);
		});
		$("#dailySales, #logo").click(function(){
			//Calculate Unix Timestamps
			var fromDate7 = moment().subtract(7, 'days').unix();
			var toDate = moment().unix();
			
			dailySalesPage(fromDate7, toDate);
		});
		
		$("#monthlySales").click(function(){
			//Calculate Unix Timestamps
			var fromDate6Mo = moment().endOf('month').subtract(5, 'months').startOf('month').unix();
			var toDate = moment().unix();
						
			dailySalesPage(fromDate6Mo, toDate, "month");
		});
		
		$("#productManager").click(function(){
			productManager();	
		});
		
		$("#settingsPage").click(function(){
			settingsPage();
		})
		
		$("#sidebar li").click(function(){
			$("#sidebar li").removeClass("active");
			$(this).addClass("active");
			$('#indvProduct').closest("li").hide();
		});
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

router(getQueryParams());

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
		}
		
		if (showNavTab != 0){
			$('.top-nav-links-container ul').append('<li class="a-align-center top-nav-link-unselected"><a class="a-link-normal" target="_blank" href="/MerchAnalytics">Merch Analytics</a></li>');
		}
	});
}
		
/***************************************************************/
/********* Global Fetch Function (Sales & Live List) ***********/
/***************************************************************/	
function fetchSalesDataCSV(endDate, toDate, result, callback){
	//This Function Deals in Unix Milliseconds
	var a = moment.unix(toDate);
	var b = moment.unix(endDate);
	var daysDifference = a.diff(b, 'days')
	
	if(daysDifference <= 90){ //Period under 90 days (with grace period)
        var sls = 'https://merch.amazon.com/product-purchases-report?fromDate=' + endDate * 1000 + '&toDate=' + toDate * 1000;
        var reqs = new XMLHttpRequest();
        reqs.open("GET", sls, true);
        reqs.onreadystatechange = function() {
            if (reqs.readyState == 4) {
                if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {

				} else {
                    if (reqs.responseText.indexOf('AuthenticationPortal') != -1) {
                        generateLoginModal();
                    } else {
						setstatus("Processing Data...");
						
						responseList = csvToJSON(reqs.responseText);
						Array.prototype.push.apply(result,responseList);     
						
						callback(result);
					}
                };
			};
        };
        reqs.send();
    } else { //Period over 90 days (with grace period)
		var newEndDate = moment.unix(toDate).subtract(90, 'days').unix();
	
		var sls = 'https://merch.amazon.com/product-purchases-report?fromDate=' + newEndDate * 1000+ '&toDate=' + toDate * 1000;
		var reqs = new XMLHttpRequest();
		reqs.open("GET", sls, true);
		reqs.onreadystatechange = function() {
			if (reqs.readyState == 4) {
				if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {

				} else {
					if (reqs.responseText.indexOf('AuthenticationPortal') != -1) {
						generateLoginModal();
					} else {
						setstatus("Gathering Data...");
					
						responseList = csvToJSON(reqs.responseText);
						Array.prototype.push.apply(result,responseList); 	
						
						
						//Shift Last Call Date Down
						toDate = moment.unix(toDate).subtract(91, 'days').startOf('day').unix();
						fetchSalesDataCSV(endDate, toDate, result, callback);
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
		var sls = 'https://merch.amazon.com/merchandise/list?pageSize=250&pageNumber=';
		var url = sls + page;
		
		var reqs = new XMLHttpRequest();
		reqs.open("GET", url, true);
		reqs.onreadystatechange = function() {
			if (reqs.readyState == 4) {
				if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {
					callback();
				} else {
					if (reqs.responseText.indexOf('AuthenticationPortal') != -1) {
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
	
/***************************************************************/
/********************** Daily Sales Page ***********************/
/***************************************************************/	
function dailySalesPage(fromDate, toDate, viewType = 'day'){	
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
								'<li class="nav-item"><a class="nav-link" href="#niche" role="tab" data-toggle="tab">'+
									'Niche Analysis' +
									'<i class="fa fa-info-circle" aria-hidden="true" data-toggle="tooltip" data-placement="bottom" title="Group together TShirt designs of similar niches or styles to help forecast future winners on a broader scale. Niche tags can be set on the Manage Products page"></i>'+
								'</a></li>' +
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
							'<div class="tab-pane" role="tabpanel" id="niche">' +
								'<div class="inner-container">' +
									'<div class="container row">' +									
										'<div class="col col-xs-6 col-sm-6">'+
											'<center class="canvas-wrapper">' +
												'<canvas id="canvas8" height="340" width="280"></canvas>'+
												'<h5 class="canvas-title">Niche Distribution (Number Sold)</h5>' +
											'</center>' +
										'</div>' +
										
										'<div class="col col-xs-6 col-sm-6">'+
											'<center class="canvas-wrapper">' +
												'<canvas id="canvas9" height="340" width="280"></canvas>'+
												'<div class="canvas-title">' +
													'<h5>Normalized Niche Distribution (%)</h5>' +
													'<i class="fa fa-info-circle" style="font-size:1rem;" aria-hidden="true" data-toggle="tooltip" data-placement="bottom" title="A normalized distribution takes into account the number of shirts for each niche and factors out the relative availablilty of each niche. (i.e. think like comparing a country\'s GDP vs GDP Per Capita)"></i>'+
												'</div>' +
											'</center>' +
										'</div>' +
									'</div>' +
								'</div>' +
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
		var revenueData = new Array(axisLabels.length).fill(0);
		var royaltyData = new Array(axisLabels.length).fill(0);
		
		//Tally Numbers
		var gendersArray = {'Men': 0, 'Women': 0, 'Youth': 0, 'Unisex': 0};
		var sizesArray = {'Small': 0, 'Medium': 0, 'Large': 0, 'XL': 0, '2XL': 0, '3XL': 0, '4': 0, '6': 0, '8': 0, '10': 0, '12': 0};		
		var shirtColorsArray = {'Dark Heather': 0, 'Heather Grey': 0, 'Heather Blue': 0, 'Black': 0, 'Navy': 0, 'Silver': 0, 'Royal Blue': 0, 'Brown': 0, 'Slate': 0, 'Red': 0, 'Asphalt': 0, 'Grass': 0, 'Olive': 0, 'Kelly Green': 0, 'Baby Blue': 0, 'White': 0, 'Lemon': 0, 'Cranberry': 0, 'Pink': 0, 'Orange': 0, 'Purple': 0};
		var priceObject = {};
		var productTypeObject = {};
		
		//Assemble Dynamic Blank Array For Niches
		var nicheArray = {};
				
		assembleDynamicBlankArray(function(resultBlankArray){
			nicheArray = resultBlankArray;
		
			//Sales Data (Not Very Efficient)
			getAllShirtNiches(function(nichesLookupArray){		
				var numberofDaysInner = axisLabels.length; //Janky Way to recover number of days with proper scope
				
				//Reset Scope Again
				var localUnixToDate2 = moment.unix(unixToDate);
				var localUnixFromDate2 = moment.unix(unixFromDate);
				
				for (i = 0; i < axisLabels.length; i++) {
					for ( i2 = 0; i2 < responseArray.length; i2++){						
						if(viewType == "month"){
							var startDate   = moment(axisLabels[i], "MMM YYYY"); //This date month
							var endDate     = moment(axisLabels[i], "MMM YYYY").add(1,'months'); //Previous month
							var compareDate = moment(responseArray[i2]["Date"], "MM-DD-YYYY");

							var isWithinRange = compareDate.isBetween(startDate, endDate, 'months', '[)') // left inclusive
						
						} else if(viewType == "week"){
							var startDate   = moment(axisLabels[i], "ww YYYY"); //This date week
							var endDate     = moment(axisLabels[i], "WW YYYY").add(1,'weeks'); //Previous week
							var compareDate = moment(responseArray[i2]["Date"], "MM-DD-YYYY");
							
							var isWithinRange = compareDate.isBetween(startDate, endDate, 'weeks', '[)') // left inclusive
							
						} else if(viewType == "day"){ //Daily View
							var startDate   = moment(axisLabels[i], "MM-DD-YYYY"); //This Date
							var endDate     = moment(axisLabels[i], "MM-DD-YYYY").add(1,'days'); //Yesterday
							var compareDate = moment(responseArray[i2]["Date"], "MM-DD-YYYY");
							
							var isWithinRange = compareDate.isBetween(startDate, endDate, 'days', '[)') // left inclusive
						}
						
						
						if(isWithinRange){ //See if inside range
							//If niche tag matches, increment count
							if (responseArray[i2]["ASIN"] in nichesLookupArray){ 
								var shirtNiche = JSON.parse(nichesLookupArray[responseArray[i2]["ASIN"]])["niche"];
								nicheArray[shirtNiche] += 1;
							} else {
								nicheArray["unknown niche"] += 1;
							}
											
							salesData[i] += parseInt(responseArray[i2]["Units"]);
							cancelData[i] += parseInt(responseArray[i2]["Cancellations"]);
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
							
							//Determine Unit Price & Count it
							var unitsSold = responseArray[i2]["Units"] - responseArray[i2]["Cancellations"];
							if (unitsSold != 0){ //Disregarding canceled units intentionally								
								var unitPrice = "$"+(responseArray[i2]["Revenue"] / (unitsSold)).toFixed(2);	
								if (unitPrice in priceObject){
									priceObject[unitPrice] += 1;
								} else {
									priceObject[unitPrice] = 1;
								}
							}
														
							//Determine Product Type & Count it
							var productType = responseArray[i2]["Product Type"];							
							if (productType in productTypeObject){
								productTypeObject[productType] += 1;
							} else {
								productTypeObject[productType] = 1;
							}
						}
					}
					
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
				totals.revenue = revenueData.reduce(function(a, b) { return a + b; }, 0).toFixed(2);				
				totals.royalty = royaltyData.reduce(function(a, b) { return a + b; }, 0).toFixed(2);
				

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
									'<h2 class="font-weight-lighter" style="color:#474C4F;"  >$'+ parseFloat(totals.revenue).formatMoney(2) + '</h2>'+
									'<span class="text-muted text-uppercase small">Revenue</span>'+
								'</div>'+
							'</div>'+
						'</div>'+
						
						'<div class="col-lg-2 col-sm-3 col-xs-12 no-card-bottom">'+
							'<div class="maa-card card">'+
								'<div class="card-body">'+                                                                       
									'<h2 class="font-weight-lighter" style="color:#474C4F;"  >$'+ parseFloat(totals.royalty).formatMoney(2) + '</h2>'+
									'<span class="text-muted text-uppercase small">Royalties</span>'+
								'</div>'+
							'</div>'+
						'</div>'+
						
						'<div class="col-lg-2 col-sm-4 col-xs-12 offset-md-3 offset-lg-3 no-card-bottom">'+
							'<div class="maa-card card">'+
								'<div class="card-body">'+                                                                       
									'<h2 class="font-weight-lighter" style="color:#474C4F;"  >$'+ (totals.royalty /(totals.sales - totals.cancelled + 0.00001)).formatMoney(2) + '</h2>'+
									'<span class="text-muted text-uppercase small">Avg Royalties / Unit Sold</span>'+
								'</div>'+
							'</div>'+
						'</div>'+
						
						'<div class="col-lg-2 col-sm-4 col-xs-12 no-card-bottom ">'+
							'<div class="maa-card card">'+
								'<div class="card-body">'+                                                                       
									'<h2 class="font-weight-lighter" style="color:#474C4F;"  >'+ ((totals.sales - totals.cancelled) /(numberofDaysInner+ 0.00001)).formatMoney(2) + '</h2>'+
									'<span class="text-muted text-uppercase small">Avg Net Sales / '+ periodTitle +'</span>'+
								'</div>'+
							'</div>'+
						'</div>'+
						
						'<div class="col-lg-2 col-sm-4 col-xs-12 no-card-bottom ">'+
							'<div class="maa-card card">'+
								'<div class="card-body">'+                                                                       
									'<h2 class="font-weight-lighter" style="color:#474C4F;"  >$'+ (totals.royalty /(numberofDaysInner+ 0.00001)).toFixed(2) + '</h2>'+
									'<span class="text-muted text-uppercase small">Avg Royalties / '+ periodTitle +'</span>'+
								'</div>'+
							'</div>'+
						'</div>';
												
				document.getElementById("dailystats").innerHTML = stats;
				
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
				Object.keys(priceObject).sort(function(a,b){return priceObject[b]-priceObject[a]}).forEach(function(key) {
					sortedPriceObject[key] = priceObject[key];
				});
				
				var tealColorScheme = ["#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#009688", "#00897b", "#00796b", "#00695c", "#004d40"];
				var greenColorScheme = ["#429d54", "#4db461", "#65be76", "#7dc88b", "#95d2a1", "#addcb6", "#c4e6cb"]; 
				//Extend Array Length
				var shirtNicheColorsLUT = replicateArray(tealColorScheme, 20);
				var pricingColorsLUT = replicateArray(greenColorScheme, 20);
				
				if(viewType == "month"){ //Monthly Labels
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
				} else if(viewType == "week"){ //Weekly Labels
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
				
				
				//Shirt Niches (Non-normalized) 
				var lineChartData8 = {
					type: 'doughnut',
					data: {
						labels: Object.keys(nicheArray),
						datasets: [{							
							data: Object.values(nicheArray),
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
				
				var ctxNiches = document.getElementById("canvas8").getContext("2d");	
				var myChart8 = new Chart(ctxNiches, lineChartData8);
				
				//Summing up all values
				var allASINValues = [];
				for (i = 0; i < responseArray.length; i++){
					allASINValues.push(responseArray[i]["ASIN"]);
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
						Cancellations: 0,
						Royalty: 0,
						Revenue: 0
					})
				}
				
				for (i = 0; i < resultSumSales.length; i++){
					for (i2 = 0; i2 < responseArray.length; i2++){
						if(resultSumSales[i]["ASIN"] == responseArray[i2]["ASIN"]){
							resultSumSales[i]["Name"] = responseArray[i2]["Name"];
							resultSumSales[i]["ProductType"] = responseArray[i2]["Product Type"].replace(/-/i, '&#8209;');
							resultSumSales[i]["Units"] += parseInt(responseArray[i2]["Units"]);
							resultSumSales[i]["Cancellations"] += parseInt(responseArray[i2]["Cancellations"]);
							resultSumSales[i]["Royalty"] += parseFloat(responseArray[i2]["Royalty"]);
							resultSumSales[i]["Revenue"] += parseFloat(responseArray[i2]["Revenue"]);
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
							'<th>Niche Category</th>' +
							'<th class="text-center">Product Details</th>' +
							'<th class="text-center">Units Sold</th>' +
							'<th class="text-center">Units Cancelled</th>' +
							'<th class="text-center">Revenue</th>' +
							'<th class="text-center">Royalties</th>' +
							'<th class="text-center">Avg Royalties / Unit</th>' +
							'<th class="text-center">Edit / Delete </th>' +
						'</tr>'  +
					'</thead><tbody>';

					
				for (i=0; i < resultSumSales.length; i++){
					//Assign Niche
					var reminderPopoverData= ''; //Blank popover data
					if(nichesLookupArray[resultSumSales[i]["ASIN"]] != undefined){
						specificNiche = JSON.parse(nichesLookupArray[resultSumSales[i]["ASIN"]])["niche"];
					} else {
						specificNiche = "unknown";
						reminderPopoverData = 'data-toggle="tooltip" data-placement="bottom" title="Assign product niche on Manage Products Page"';
					}
					
					
					var itemName = resultSumSales[i]["Name"].replace(/"/g, "");
					var uriEncodedName = encodeURIComponent(itemName); 
					var deleteLink = 'https://merch.amazon.com/manage/products?pageNumber=1&pageSize=15&keywords=' + uriEncodedName + '&statusFilters=%5B%22DELETED%22%2C%22DRAFT%22%2C%22LIVE%22%2C%22NOT_DISCOVERABLE%22%2C%22PENDING%22%2C%22PROCESSING%22%2C%22STOPPED%22%2C%22UNDER_REVIEW%22%2C%22REJECTED%22%2C%22MANUALLY_REJECTED%22%5D';	
				
						
					cp2 += '<tr data-href="https://www.amazon.com/dp/' + resultSumSales[i]["ASIN"]  +   '">' + 
						'<td>' + (i + 1) + '</td>' + 
						'<td>' + 
							resultSumSales[i]["Name"]  + 
						'</td>' + 
						
						'<td>' + 
							resultSumSales[i]["ProductType"]   + 
						'</td>' + 
						
						'<td class="niche-tag">'+
							'<i class="fa fa-tag fa-inline" aria-hidden="true" ' + reminderPopoverData + '></i>' +
							specificNiche +
						'</td>' +
						
						'<td class="text-center btn-inside">' +						
							'<a target="_blank" href="' + '/IndividualProductPage/?ASIN=' + resultSumSales[i]["ASIN"]  + '" class="btn btn-primary">Analyze</a>' +
						'</td>' +
										
						'<td class="text-center">' +
							resultSumSales[i]["Units"]  +
						'</td>' +
							
						'<td class="text-center">' +
							resultSumSales[i]["Cancellations"]  +
						'</td>' +
						
						'<td class="text-center">' +
							'$' + resultSumSales[i]["Revenue"].toFixed(2)  +
						'</td>' +
						
						'<td class="text-center">' +
							'$' + resultSumSales[i]["Royalty"].toFixed(2)  +
						'</td>' +
						
						'<td class="text-center">' +
							'$' + (resultSumSales[i]["Royalty"].toFixed(2) / (resultSumSales[i]["Units"] - resultSumSales[i]["Cancellations"] + 0.00001)).toFixed(2)  +
						'</td>' +
						'<td class="text-center btn-inside">' +  
							'<a target="_blank" href="' + deleteLink + '" class="btn btn-outline-primary">Edit</a>' + 
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

				//********** Get Normalized Array ***************//
				// (This is down here because it takes longer)
				normalizedNicheArray = {};
				normalizedPercentageArray = {};
				
				getNicheDistribution(function(totalTally){
					for(var key in nicheArray){
						if (key in totalTally){
							loopTotalTally = totalTally[key];
						} else {
							loopTotalTally = 999; //Artifically Skew Unidentified shirts
						}
						
						normalization = (nicheArray[key] / loopTotalTally);
						normalizedNicheArray[key] = normalization;
					}
					
					var grandTotal = 0;
					for(var key in normalizedNicheArray){ //Get Total of Normalized
						numberToAdd = parseFloat(normalizedNicheArray[key]);
						if (!isNaN(numberToAdd)){					
							grandTotal += numberToAdd;
						}
					}
					
					for(var key in normalizedNicheArray){
						percertangeValue = (normalizedNicheArray[key] / grandTotal * 100).toFixed(1);
						normalizedPercentageArray[key] = percertangeValue;
					}
					
					var lineChartData8 = {
						type: 'doughnut',
						data: {
							labels: Object.keys(normalizedPercentageArray),
							datasets: [{							
								data: Object.values(normalizedPercentageArray),
								backgroundColor: shirtNicheColorsLUT,
							}]
						},
						options: globalLineChartOptions,
					};
					
					var ctxNormNiches = document.getElementById("canvas9").getContext("2d");	
					var myChart9 = new Chart(ctxNormNiches, lineChartData8);
					
					
					
					//Compute Top Selling Niches
					topSellingNiches = Object.keys(normalizedPercentageArray).sort(function(a,b) {
							return normalizedPercentageArray[b]-normalizedPercentageArray[a]
					});
					
					//Not a great execution
					if (topSellingNiches.length < 3){
						topSellingNiches = ['Unknown Niche', 'Unknown Niche', 'Unknown Niche' ];
					}
					
					
					//Generate Top Niches
					topNichesData = '<div class="container maa-container row">' +					
										'<div class="col-lg-3 col-sm-4 col-xs-12 offset-md-0 offset-lg-2">'+
											'<div class="maa-card card">'+
												'<div class="card-body">'+                                                                       
													'<h2 class="font-weight-lighter" style="color:#474C4F;"  >'+ topSellingNiches[0] + '</h2>'+
													'<span class="text-muted text-uppercase small">#1 Top Selling Niche</span>'+
												'</div>'+
											'</div>'+
										'</div>'+
									
										'<div class="col-lg-3 col-sm-4 col-xs-12 ">'+
											'<div class="maa-card card">'+
												'<div class="card-body">'+                                                                       
													'<h2 class="font-weight-lighter" style="color:#474C4F;"  >'+ topSellingNiches[1] + '</h2>'+
													'<span class="text-muted text-uppercase small">#2 Top Selling Niche</span>'+
												'</div>'+
											'</div>'+
										'</div>'+
										
										'<div class="col-lg-3 col-sm-4 col-xs-12 ">'+
											'<div class="maa-card card">'+
												'<div class="card-body">'+                                                                       
													'<h2 class="font-weight-lighter" style="color:#474C4F;"  >'+ topSellingNiches[2] + '</h2>'+
													'<span class="text-muted text-uppercase small">#3 Top Selling Niche</span>'+
												'</div>'+
											'</div>'+
										'</div>'+
						
									'</div>';

					$("#niche").prepend(topNichesData);
					
			
					
					
					/*
					//Dump Sales Data 
					var nicheDistData = '<div class="col-xs-6">';
					nicheDistData += '<h4>Total Number Of Shirts Available For Sale In Each Niche</h4>' +
									'<div class="niche-list-area">';
					
					
					//Have to sort by descending, this is ugly
					var sortableTotalTally = [];
					for (var number in totalTally) {
						sortableTotalTally.push([number, totalTally[number]]);
					}

					sortableTotalTally.sort(function(a, b) {
						return b[1] - a[1];
					});
								
					for(i=0; i < sortableTotalTally.length; i++){
						nicheDistData += '<dl>'
											+ '<dt>'
											+ 		sortableTotalTally[i][0] + ":&nbsp;"
											+ '</dt>'
											+ '<dd>'
											+ 		sortableTotalTally[i][1]
											+ '</dd>'
										+ '</dl>'
					}
					
					nicheDistData += '</div>' + 
									'<a class="more-btn">Display All</a>' +
									'</div>';
					
								
					$("#niche").append(nicheDistData);
					
					
					
					$(".more-btn").click(function(){
						$('.niche-list-area').toggleClass('expanded');
					});	
					*/
					
					

					//Initialize Tooltips
					$(function () {
					  $('[data-toggle="tooltip"]').tooltip()
					  

		
					})
				
				
				});
				
			}); //Callback 2 end
			
		}); //Callback end
	});
	
}

/***************************************************************/
/******************* Product Manager Page **********************/
/***************************************************************/
function productManager() {
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
										'<a class="btn btn-outline-secondary" id="reviewChecker" data-toggle="tooltip" data-placement="bottom" title="Launch Review Checker" href="" target="_blank" >'+
											'<i class="fa fa-star" aria-hidden="true"></i>' +
											'<i class="fa fa-star" aria-hidden="true"></i>' +
											'<i class="fa fa-star" aria-hidden="true"></i>' +
											'<i class="fa fa-star-half-o" aria-hidden="true"></i>' +
											'<i class="fa fa-star-o" aria-hidden="true"></i>' +
										'</a>' +
										'<div class="btn btn-outline-secondary" id="reset-button" data-toggle="tooltip" data-placement="bottom" title="Clear All Niche Data"><i class="fa fa-eraser" aria-hidden="true"></i></div>' +
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
				if(ts[i].daysUntilDeletion.length === 0 || parseInt(ts[i].daysUntilDeletion) > 90){
					hasLifetimeSales = true;
					lifetimesSalesCounter++;
				}
			}
		
			if (ts[i].marketplaceAsinMap.US !== undefined && ts[i].status == "LIVE"){
				//Parse Create Date
				var stringifiedCreateDate = moment.unix(parseInt(ts[i].createDate) / 1000).format("MM-DD-YYYY");
				
				if (liveDesignsCounter < 500){ //Only show first 500 products
					strOfASINs += ts[i].marketplaceAsinMap.US + ',';
				}
				
				var itemName = ts[i].name.replace(/"/g, "");
				var uriEncodedName = encodeURIComponent(itemName); 
				var deleteLink = 'https://merch.amazon.com/manage/products?pageNumber=1&pageSize=15&keywords=' + uriEncodedName + '&statusFilters=%5B%22DELETED%22%2C%22DRAFT%22%2C%22LIVE%22%2C%22NOT_DISCOVERABLE%22%2C%22PENDING%22%2C%22PROCESSING%22%2C%22STOPPED%22%2C%22UNDER_REVIEW%22%2C%22REJECTED%22%2C%22MANUALLY_REJECTED%22%5D';
				switch (ts[i].shirtType) {
					case "AMERICAN_APPAREL":
					case "HOUSE_BRAND":
						productType = "Standard T&#8209;Shirt";
						break;
					case "PREMIUM_BRAND":
						productType = "Premium T&#8209;Shirt";
						break;
					case "STANDARD_SWEATSHIRT":
						productType = "Sweatshirt";
						break;
					case "STANDARD_PULLOVER_HOODIE":
						productType = "Pullover Hoodie";
						break;
					case "STANDARD_LONG_SLEEVE":
						productType = "Long-Sleeve T&#8209;Shirt";
						break;
					default: 
						productType = "";
				}
				
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
							'<td class="text-center btn-inside">' + '<a target="_blank" href="http://merch.amazon.com/merch-tshirt/title-setup/' + ts[i].id + '/add_details" class="btn btn-outline-primary">Edit</a>' + '</td>' +
							'<td class="text-center btn-inside">' +  '<a target="_blank" href="' + deleteLink + '" class="btn btn-outline-danger"><i class="fa fa-trash-o fa-lg"></i></a>' + '</td>' +
						'</tr>';
			}
		}
		
		$('#reviewChecker').attr("href", "https://ams.amazon.com/hsa-ad-landing-page/preview?asins=" + strOfASINs);
		
		
			
		cp2 += '</tbody></table>';
		document.getElementById("shirtlist").innerHTML = cp2;
						
		managerStats = '<center><h2>Product Manager</h2></center>' +
			'<table class="maa-table table table-striped"><thead>' + 
				'<tr>' +
					'<th class="text-center">Products With Atleast One Lifetime Sale</th>'+
					'<th class="text-center">Total Live Products</th>' + 
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
				
			
		initSaveButtons(); //initialize event listeners for buttons
		
		});
}

/***************************************************************/
/**************** Individual Product Page **********************/
/***************************************************************/
function individualProductPage(queryParams){
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

function renderIndividualProductSales(queryParams){
	$('#sidebar li').removeClass("active")
	$('#indvProduct').closest('li').addClass("active");
	$('#indvProduct').closest('li').show();
	
	var targetASIN = queryParams["ASIN"];
	
	fetchIndividualProductSales(targetASIN, function(responseArray){	
		// Need To get First Publication Date
		fetchAllLiveProducts(1, '0', liveProductsArray = [], targetASIN, function(){
			var firstPublishDate = {};
						
			for ( i =0; i < liveProductsArray.length; i++){
				if(liveProductsArray[i]["marketplaceAsinMap"]["US"] == targetASIN){
					var firstPublishDate = parseInt(liveProductsArray[i]["firstPublishDate"]) / 1000;
					var imgURL = liveProductsArray[i]["imageURL"]; 
					var shirtName = liveProductsArray[i]["name"];	
					var shirtID = liveProductsArray[i]["id"];
					break;
				}
			}
			
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
			var revenueData = new Array(axisLabels.length).fill(0);
			var royaltyData = new Array(axisLabels.length).fill(0);
			
			//Tally Numbers
			var gendersArray = {'Men': 0, 'Women': 0, 'Youth': 0, 'Unisex': 0};
			var sizesArray = {'Small': 0, 'Medium': 0, 'Large': 0, 'XL': 0, '2XL': 0, '3XL': 0, '4': 0, '6': 0, '8': 0, '10': 0, '12': 0};
			var shirtColorsArray = {'Dark Heather': 0, 'Heather Grey': 0, 'Heather Blue': 0, 'Black': 0, 'Navy': 0, 'Silver': 0, 'Royal Blue': 0, 'Brown': 0, 'Slate': 0, 'Red': 0, 'Asphalt': 0, 'Grass': 0, 'Olive': 0, 'Kelly Green': 0, 'Baby Blue': 0, 'White': 0, 'Lemon': 0, 'Cranberry': 0, 'Pink': 0, 'Orange': 0, 'Purple': 0};
			var priceObject = {};
			var productType = ""
			
			//Sales Data (Not Very Efficient)
			for (i = 0; i < axisLabels.length; i++) {
				for ( i2 = 0; i2 < responseArray.length; i2++){
					if(axisLabels[i] == responseArray[i2]["Date"]){
						salesData[i] += parseInt(responseArray[i2]["Units"]);
						cancelData[i] += parseInt(responseArray[i2]["Cancellations"]);
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
			

			var lifetimeSales = salesData.reduce(function(a, b) { return a + b; }, 0) - cancelData.reduce(function(a, b) { return a + b; }, 0) ;
			var lifetimeRevenue = revenueData.reduce(function(a, b) { return a + b; }, 0).toFixed(2);
			var lifetimeRoyalties = royaltyData.reduce(function(a, b) { return a + b; }, 0).toFixed(2);
			
			var lifespan = Math.round(today.diff(moment.unix(firstPublishDate), 'days', true));	
			if (lifespan <= 30){ 
				lifespan = 30 //Minimum 1 month lifespan
			}; 
			
			var uriEncodedName = encodeURIComponent(shirtName); 
			var deleteLink = 'https://merch.amazon.com/manage/products?pageNumber=1&pageSize=15&keywords=' + uriEncodedName + '&statusFilters=%5B%22DELETED%22%2C%22DRAFT%22%2C%22LIVE%22%2C%22NOT_DISCOVERABLE%22%2C%22PENDING%22%2C%22PROCESSING%22%2C%22STOPPED%22%2C%22UNDER_REVIEW%22%2C%22REJECTED%22%2C%22MANUALLY_REJECTED%22%5D';
			
			
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
										'<dd>' + productType + '</dd>' +
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
										'<dd>$' + (lifetimeRoyalties / (lifespan / 30)).toFixed(2) + '</dd>' +
									'</dl><dl>' +
										'<dt style="margin: 5px 5px 5px 0;">Niche: </dt>' +
										'<dd>'+
											'<div class="form-group">' +
												'<input type="text" class="form-control niche-input">'  +
											'</div>' +
										'</dd>' +
									'</dl>' +
									'<div class="btn-group-inline">' +
										'<a target="_blank" href="http://merch.amazon.com/merch-tshirt/title-setup/' + shirtID + '/add_details" class="btn btn-outline-primary">Edit</a>' + 
										'<a target="_blank" href="' + deleteLink + '" class="btn btn-outline-danger"><i class="fa fa-trash-o fa-lg"></i></a>' + 
									'</div>' +
								'</div>' +
							'</div>';
			
			document.getElementById("individualShirtSummary").innerHTML = shirtInfo;	
			
			getShirtNiche(targetASIN, function(determinedNiche){
				if(determinedNiche != 'unknown niche'){					
					$(".niche-input").val(determinedNiche);
					$(".niche-input").closest('.form-group').addClass("has-success");
					$(".niche-input").addClass("form-control-success");
				}
				
				//Remove success on focus 
				$('.niche-input').focusin(function() {
					$(this).removeClass("form-control-success").removeClass("form-control-danger");
				});
				
				//Unfocus auto saves
				$('.niche-input').focusout(function() {
					if ($(this).val().length > 1){
						nicheName = $(this).val();
						saveShirtNiche(nicheName, targetASIN, $(this));
					}
				});
				
				//Enter key goes to next field
				$('.niche-input').keydown(function(e) {
					if (e.which == 13 || e.which == 9) { //Enter Key
						e.preventDefault();
								
						if ($(this).val().length > 1){
							nicheName = $(this).val();
							saveShirtNiche(nicheName, targetASIN, $(this));
						}
					}
				});
			})
			
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
				
			/*Assemble Sales History Table */
			var cp2 = '<table id="indvTable" class="maa-table table table-striped sortable"><thead><tr><th>#</th>' +
				'<th class="text-center">Date Sold</th>' +
				'<th class="text-center">Units</th>' +
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
}

function fetchIndividualProductSales(targetASIN, callback){
	var toDate = moment().unix();
	var fromDate = moment().subtract(90, 'days').unix();

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
			
			if (optionDashboard){
				$('#optionDashboard').prop('checked', true);
			}else{
				$('#optionDashboard').prop('checked', false);
			}
		}
	});
}

// Saves options to chrome.storage
function save_options() {
	var optionSound = $('#notificationSound').prop("checked") ? 1 : 0;
	var optionNotif = $('#notificationPopup').prop("checked") ? 1 : 0;
	var optionDashboard = $('#optionDashboard').prop("checked") ? 1 : 0;
	
	var data = JSON.stringify({
		'sound': optionSound,
		'popup': optionNotif,
		'optionDashboard': optionDashboard,
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
/***************************************************************/
/************************ Niche Storage ************************/
/***************************************************************/
function getShirtNiche(shirtASIN, callback){
	var myKey = String(shirtASIN);
	var determinedNiche = 'unknown niche'; //default state
	
	chrome.storage.local.get(myKey, function(items) { //This gets from both sync and local apparently
		if(Object.values(items).length > 0){ 
			parsedJson = JSON.parse(items[myKey]);
			determinedNiche = parsedJson["niche"];
		} 
		callback(determinedNiche); //Run Callback
	});
}
			
function getAllShirtNiches(callback){
	chrome.storage.sync.get(null, function(items) {
		chrome.storage.local.get(null, function(localItems) {			
			var itemsTogether = Object.assign({}, items, localItems);
			callback(itemsTogether);
		});
	});
}
		
function saveShirtNiche(nicheName, parentASIN, targetHTMLitem = null) {		
	//Assemble Stringified JSON	
	var key = parentASIN,
	data = JSON.stringify({
		'niche': nicheName
	});
    var jsonfile = {};
    jsonfile[key] = data;
	
	// Save it using the Chrome extension storage API.	
    chrome.storage.sync.set(jsonfile, function () {
		if (chrome.runtime.lastError && chrome.runtime.lastError.message == 'This request exceeds the MAX_WRITE_OPERATIONS_PER_MINUTE quota.') {	
			targetHTMLitem.closest('.form-group').addClass('has-danger');
			targetHTMLitem.addClass("form-control-danger");
			
			console.log("Cannot store tag. Entering items too quickly. Please slow down.");
			
		} else if (chrome.runtime.lastError && chrome.runtime.lastError.message == 'MAX_ITEMS quota exceeded'){		
			//Store it locally
			chrome.storage.local.set(jsonfile, function () {
				console.log('Saved in local:', key, data);
				targetHTMLitem.closest('.form-group').addClass('has-success');
				targetHTMLitem.addClass("form-control-success");
			});
			
		} else if (chrome.runtime.lastError){
			targetHTMLitem.closest('.form-group').addClass('has-danger');
			targetHTMLitem.addClass("form-control-danger")
			
			console.log("Caught generic error");

		} else{
			console.log('Saved in Sync:', key, data);
			targetHTMLitem.closest('.form-group').addClass('has-success');
			targetHTMLitem.addClass("form-control-success");
		}
    });
}

function readShirtNiche(){	//Used only on Product Manager Page
	$('[name="nicheName"]').each(function () {
		//Get ASIN
		var myKey = $(this).closest('td').find('[name="parentASIN"]').val();
		
		var that = $(this);
		//Fetch Matching Niche, Sync first, if not, attempt to get it locally.
		chrome.storage.sync.get(myKey, function(items) {
			if (typeof(items[myKey]) != 'undefined' && items[myKey].length > 1){
				parsedJson = JSON.parse(items[myKey]);
				that.val(parsedJson["niche"]);
				that.closest('td').attr('data-sort', parsedJson["niche"]);
				that.closest('.form-group').addClass("has-success");
				that.addClass("form-control-success");
			} else{
				//Try to get it locally
				chrome.storage.local.get(myKey, function(items) {
					if (typeof(items[myKey]) != 'undefined' && items[myKey].length > 1){
						parsedJson = JSON.parse(items[myKey]);
						that.val(parsedJson["niche"]);
						that.closest('td').attr('data-sort', parsedJson["niche"]);
						that.closest('.form-group').addClass("has-success");
						that.addClass("form-control-success");
					}
				});
			}
		});
	});
}
	
function getNicheDistribution(callback){
	chrome.storage.sync.get(null, function(items) {
		var allValues = Object.values(items);
		
		parsedArray = [];
		for(var i=0; i < allValues.length; i++ ) {
			parsedArray.push(JSON.parse(allValues[i])['niche']);
			
		}
		
		var totalTally = {};
		parsedArray.forEach(function(x) { totalTally[x] = (totalTally[x] || 0)+1; });
		
		
		callback(totalTally);
	});
	
}
	
function clearAllNicheData(){
	chrome.storage.sync.clear();
	$('.niche-input').val(''); 
	$('.form-control-success').removeClass('form-control-success');
	alert("All previous data has been cleared");
}

function initSaveButtons(){ //(Used only on Product Manager: Adds event listeners to all buttons	
	$(function(){			
		//Listener for reset button
		document.getElementById('reset-button').addEventListener("click", function(){
			var confirmResponse = confirm("This will clear all the data you have entered. Are you sure you want to clear all niches?");
			if (confirmResponse == true) {
				clearAllNicheData();
			} 
		}, false);
		
		//Remove success on focus 
		$('#shirtlist input[type="text"]').focusin(function() {
			$(this).removeClass("form-control-success").removeClass("form-control-danger");
		})
		
		var enterPressed = false; //Flag to prevent double saving
		//Unfocus auto saves
		$('#shirtlist input[type="text"]')
			.keydown(function(e) { 
				//Enter key goes to next field
				if (e.which == 13 || e.which == 9) { //Enter Key
					e.preventDefault();
							
					if ($(this).val().length > 1){
						nicheName = $(this).closest('td').find('[name="nicheName"]').val();
						parentASIN = $(this).closest('td').find('[name="parentASIN"]').val();
						$(this).closest('td').attr('data-sort', $(this).val()); //Add attr for table sorting
						saveShirtNiche(nicheName, parentASIN, $(this));
						enterPressed = true;
						
						$(this).closest("tr").next().find('input[type="text"]').focus(); //Focus on Next Field
					}
				}
					
				if (e.which == 38) { //Up Key
					e.preventDefault();
					$(this).closest("tr").prev().find('input[type="text"]').focus(); //Focus on Next Field
				}
				
				if (e.which == 40) { //Down Key
					e.preventDefault();
					$(this).closest("tr").next().find('input[type="text"]').focus(); //Focus on Next Field
				}
	
			})
			.focusout(function() { //Unfocus also saves
				if ($(this).val().length > 1 && !enterPressed){
					nicheName = $(this).closest('td').find('[name="nicheName"]').val();
					parentASIN = $(this).closest('td').find('[name="parentASIN"]').val();
					$(this).closest('td').attr('data-sort', $(this).val()); //Add attr for table sorting
					saveShirtNiche(nicheName, parentASIN, $(this));
					

				}
				enterPressed = false;
		})
		
		readShirtNiche();		
	})
}
