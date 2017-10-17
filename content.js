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
		var allValues = Object.values(items);
		
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
	});
}

/******** More Date Related Stuff ********/				
function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

function when(t) { //Converts Unix timestamp to human
    var dateVal = "/Date(" + t.toString() + ")/";
    var a = new Date(parseFloat(dateVal.substr(6)));
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
};

Date.prototype.adjustDate = function(days) {
    var date;

    days = days || 0;

    if (days === 0) {
        date = new Date(this.getTime());
    } else if (days > 0) {
        date = new Date(this.getTime());
        date.setDate(date.getDate() + days);
    } else {
        date = new Date(
            this.getFullYear(),
            this.getMonth(),
            this.getDate() - Math.abs(days),
            this.getHours(),
            this.getMinutes(),
            this.getSeconds(),
            this.getMilliseconds()
        );
    }
    return date;
};
Date.prototype.adjustMonth = function(months) {
    var date;

    months = months || 0;

    if (months === 0) {
        date = new Date(this.getTime());
    } else if (months > 0) {
        date = new Date(this.getTime());
        date.setMonth(date.getMonth() + months);
    } else {
        date = new Date(
            this.getFullYear(),
            this.getMonth() - Math.abs(months),
            this.getDate(),
            this.getHours(),
            this.getMinutes(),
            this.getSeconds(),
            this.getMilliseconds()
        );
    }
    return date;
};
Date.prototype.getFirstDateOfMonth = function() {
    var date = new Date(this.getTime());
    date.setDate(1);
    return new Date(date.getTime());
};
Date.prototype.getLastDayOfMonth = function() {
    var nextMonthDate = new Date(this.getTime());
    nextMonthDate.setMonth(this.getMonth() + 1);
    nextMonthDate.setDate(1);
    var date = new Date(nextMonthDate.getTime());
    date.setDate(nextMonthDate.getDate() - 1);
    return date;
};
Date.prototype.setTimeZone = function(zone) {
    zone = zone || "America/Los_Angeles";
    return new Date(this.toLocaleString("en-US", {
        timeZone: zone
    }));
};
Date.prototype.getUTC = function(reset) {
    return true === reset ? new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate())) :
        new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds()));
};
Date.prototype.setUTC = function(reset) {
    return true === reset ? new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate())) :
        new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds(), this.getMilliseconds()));
};



/***************************************************************/
/************************* Login Functions *********************/
/***************************************************************/
function logincheck(cmd, queryParams = null) {
	//Disappointed but not surprised :)
    var sls = 'https://merch.amazon.com/accountSummary';
    var reqs = new XMLHttpRequest();
    reqs.open("GET", sls, true);
    reqs.onreadystatechange = function() {
        if (reqs.readyState == 4) {

            if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {

            } else {
                if (reqs.responseText.indexOf('AuthenticationPortal') != -1) {

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
                        '<button type="button" class="btn btn-success" data-dismiss="modal">Done, Reload The Page ! .</button>' +
                        '</div></div></div></div>';

                    document.body.innerHTML = loginerr;

                    $('#myModal')
                        .modal('show');

                    $(document)
                        .on('hide.bs.modal', '#myModal', function() {
                            location.reload();
                        });


                } else {
                    switch (cmd) {
                        case "twoweekssales":
                            twoweekssales(14);
                            break;
                        case "todaysales":
                            twoweekssales(0);
                            break;
                        case "merchall":
                            merchmonthsall();
                            break;
                        case "productManager":
                            productManager();
                            break;
						case "individualProductPage":
                            individualProductPage(queryParams);
                            break;
						case "settings":
                            settingsPage();
                            break;
                    };
                };
            };

        };
    };

    reqs.send();

};

//Get Base Path
var cmd = window.location.href.split('?')[0];

// Get Query Params
var queryString = window.location.search.substring(1);

var parseQueryString = function( funcQueryString ) {
    var params = {}, queries, temp, i, l;
    // Split into key/value pairs
    queries = funcQueryString.split("&");
    // Convert the array of strings into an object
    for ( i = 0, l = queries.length; i < l; i++ ) {
        temp = queries[i].split('=');
        params[temp[0]] = temp[1];
    }
    return params;
};
parsedParams = parseQueryString(queryString);
//End Parsing Query Params

if (cmd.indexOf("MerchToolsTodaySales") !== -1) {
    logincheck("todaysales");
};

if (cmd.indexOf("MerchToolsTwoWeeksSales") !== -1) {
    logincheck("twoweekssales");
};


if (cmd.indexOf("MerchToolsAllMonthsSales") !== -1) {
    logincheck("merchall");
};

if (cmd.indexOf("MerchToolsEditor") !== -1) {
    logincheck("productManager");
};

if (cmd.indexOf("IndividualProductPage") !== -1 && parsedParams) {
    logincheck("individualProductPage", parsedParams);
};

if (cmd.indexOf("MerchAnalyticsSettings") !== -1) {
    logincheck("settings");
};

/***************************************************************/
/************************** Global HTML ************************/
/***************************************************************/
var globalHeader = '<head><style></style></head>' + 
					"<script src='tablesort.min.js'></script>" + 
					"<script src='tablesort.number.js'></script>" +
					'<script src="https://code.jquery.com/jquery-1.12.0.min.js"></script>' +    
					'<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>';


var sidebarHTML = '<nav id="sidebar">' +
						'<div class="sidebar-header">' +
							'<h3>Merch Analytics</div>' +
						'</div>' +

						'<ul class="list-unstyled components">' +
							'<li><a href="/MerchToolsTodaySales">Today\'s Sales</a></li>' +
							'<li><a href="/MerchToolsTwoWeeksSales">14 Day Sales</a></li>' +
							'<li><a href="/MerchToolsAllMonthsSales">Monthly Sales</a></li>' +
							'<li><a href="/MerchToolsEditor">Manage Products</a></li>' +
							'<li style="display:none;"><a href="/IndividualProductPage/">Individual Product Info</a></li>' +
							'<li><a href="/MerchAnalyticsSettings">Settings</a></li>' +

							/*'<li>' +
								'<a href="#subMenu" data-toggle="collapse" aria-expanded="false">Other Tools</a>' +
								'<ul class="collapse list-unstyled" id="subMenu">' +
									'<li><a href="/MerchToolsAllASINs">Live ASINs</a></li>' +
								'</ul>' +
							'</li>' +
							*/
						'</ul>' +
				'</nav>' +
				'<script src="navscript.js"></script>';
				
			
/***************************************************************/
/********* Global Fetch Function (Sales & Live List) ***********/
/***************************************************************/	
function fetchSalesDataCSV(fromDate, toDate, callback){
	var sls = 'https://merch.amazon.com/product-purchases-report?fromDate=' + fromDate + '&toDate=' + toDate ;
    var reqs = new XMLHttpRequest();
    reqs.open("GET", sls, true);
    reqs.onreadystatechange = function() {
        if (reqs.readyState == 4) {
            if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {
            } else {
                var responseArray = csvToJSON(reqs.responseText);
				//Run Callback
				callback(responseArray);
            };

        };
    };
    reqs.send();
}

function fetchAllLiveProducts(callback){
    var sls = 'https://merch.amazon.com/merchandise/all';
    var reqs = new XMLHttpRequest();
    reqs.open("GET", sls, true);
    reqs.onreadystatechange = function() {
        if (reqs.readyState == 4) {
            if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {

            } else {
                var result = JSON.parse(reqs.responseText);
				callback(result);
            };
        };
    };
    reqs.send();
}
	
/***************************************************************/
/********************** Daily Sales Page ***********************/
/***************************************************************/	
function fetchDaySales(numberOfDays, callback){ /* Todo, not implemented */
	var today = new Date().setTimeZone();
	today.setUTCHours(7,0,0,0); 
	var fromDate = today.adjustDate(-numberOfDays).getTime();
	var toDate = today.getTime();
	
	fetchSalesDataCSV(fromDate, toDate, function(responseArray){
		console.log(responseArray);
		
	});
	
}


function fetchsales(count, m, salesData, cancelData, returnData, rev, roy, chlabel, ts, gendersArray, sizesArray, shirtColorsArray, nicheArray, specificASIN = null) {
    if (count >= 0) {
        var today = new Date().setTimeZone();
		today.setUTCHours(7,0,0,0) ; 
        var sls = 'https://merch.amazon.com/salesAnalyticsRecord/all?fromDate=' + today.adjustDate(-count)
            .getTime() + '&toDate=' + today.adjustDate(-count)
            .getTime();
        var reqs = new XMLHttpRequest();
        reqs.open("GET", sls, true);
        reqs.onreadystatechange = function() {
            if (reqs.readyState == 4) {
                if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {
                    alert("error");

                } else {
					var totalSold = 0;
					var totalReturned = 0;
					var totalCancelled = 0;
					var totalRevenue = 0;
					var totalRoyalties = 0;
					var gendersArray = {Mens: 0, Womens: 0, Kids: 0};
					var sizesArray = {'Small': 0, 'Medium': 0, 'Large': 0, 'XL': 0, '2XL': 0, '3XL': 0, 'Youth': 0};
					var shirtColorsArray = {'Dark Heather': 0, 'Heather Grey': 0, 'Heather Blue': 0, 'Black': 0, 'Navy': 0, 'Silver': 0, 'Royal Blue': 0, 'Brown': 0, 'Slate': 0, 'Red': 0, 'Asphalt': 0, 'Grass': 0, 'Olive': 0, 'Kelly Green': 0, 'Baby Blue': 0, 'White': 0, 'Lemon': 0, 'Cranberry': 0, 'Pink': 0, 'Orange': 0, 'Purple': 0};

					//Assemble Dynamic Blank Array For Niches
					var nicheArray = {};
					assembleDynamicBlankArray(function(resultBlankArray){
						nicheArray = resultBlankArray;
					});
				
					
					var ts = JSON.parse(reqs.responseText);
					
					
					for (i = 0; i < ts.length; i++) {
						if (ts[i].isParentAsin == true) {
							totalSold += parseInt(ts[i].unitsSold);
							totalReturned += parseInt(ts[i].unitsReturned);
							totalCancelled += parseInt(ts[i].unitsCancelled);
							totalRevenue += parseFloat(parseFloat(ts[i].revenueValue)
								.toFixed(2));
							totalRoyalties += parseFloat(parseFloat(ts[i].royaltyValue)
								.toFixed(2));
								
							
							//Determine Shirt Niche
							getShirtNiche(ts[i].id, function(shirtNiche){								
								if (shirtNiche in nicheArray){ //If niche tag mactches, incremeent count
									nicheArray[shirtNiche] += 1;
								} else {
									nicheArray["unknown niche"] += 1;
								}
							});
						} else if (ts[i].isParentAsin == false) {
							//Determine Gender And Count it 
							shirtGender = getShirtGender(ts[i].asinName);
							for (var key in gendersArray){
								if (key.toString() == shirtGender){
									gendersArray[key] += 1;
								}
							}
							
							//Determine Size And Count it 
							shirtSize = getShirtSize(ts[i].asinName);
							for (var key in sizesArray){
								if (key.toString() == shirtSize){
									sizesArray[key] += 1;
								}
							}
							
							//Determine Size And Count it 
							shirtColor = getShirtColor(ts[i].asinName);
							for (var key in shirtColorsArray){
								if (key.toString() == shirtColor){
									shirtColorsArray[key] += 1;
								}
							}
						};
					};
					
					setTimeout(function(){
						salesData.push(totalSold);
						cancelData.push(totalCancelled);
						returnData.push(totalReturned);
						gendersData.push(gendersArray);
						sizesData.push(sizesArray);
						shirtColorsData.push(shirtColorsArray);

						shirtNicheData.push(nicheArray);						
					
						chlabel.push(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.adjustDate(-count)
							.getUTCDay()
						]);
						rev.push(totalRevenue);
						roy.push(totalRoyalties);
						document.getElementById("twoweeksstats")
							.innerHTML = "<center><h3>Loading Day [" + (m - count) + "/" + m + "]</h3></center>";
												
						fetchsales(count - 1, m, salesData, cancelData, returnData, rev, roy, chlabel, ts, gendersData, sizesData, shirtColorsData, shirtNicheData);
						
						
						
						
					}, 250);
					
					
				
                };

            };
        };

        reqs.send();

    } else {
        unitsSold = 0;
        unitsCancelled = 0;
        rRoyalties = 0;
        rrev = 0;
		rgendersArray = {Mens: 0, Womens: 0, Kids: 0};
		rsizesArray = {'Small': 0, 'Medium': 0, 'Large': 0, 'XL': 0, '2XL': 0, '3XL': 0, 'Youth': 0};
		rshirtColorsArray = {'Dark Heather': 0, 'Heather Grey': 0, 'Heather Blue': 0, 'Black': 0, 'Navy': 0, 'Silver': 0, 'Royal Blue': 0, 'Brown': 0, 'Slate': 0, 'Red': 0, 'Asphalt': 0, 'Grass': 0, 'Olive': 0, 'Kelly Green': 0, 'Baby Blue': 0, 'White': 0, 'Lemon': 0, 'Cranberry': 0, 'Pink': 0, 'Orange': 0, 'Purple': 0};
		
		//Assemble Dynamic Blank Array For Niches
		rnicheArray = {};
		
		assembleDynamicBlankArray(function(resultBlankArray){
			rnicheArray = resultBlankArray;
			
			
						
			for (i = 0; i < salesData.length; i++) {
				unitsSold += salesData[i];
				rRoyalties += roy[i];
				rrev += rev[i];
				unitsCancelled += cancelData[i]
				
				//Add Genders Together
				for (var key in gendersData[i]){
					rgendersArray[key] += gendersData[i][key];
				}
				
				//Add Sizes Together
				for (var key in sizesData[i]){
					rsizesArray[key] += sizesData[i][key];
				}
				
				//Add Shirt Colors Together
				for (var key in shirtColorsData[i]){
					rshirtColorsArray[key] += shirtColorsData[i][key];
				}
				
				//Add Shirt Niches Together
				for (var key in shirtNicheData[i]){
					rnicheArray[key] += shirtNicheData[i][key];
				}
			}
			
			
			
			normalizedNicheArray = {};
			normalizedPercentageArray = {};
			
			getNicheDistribution(function(totalTally){
				for(var key in rnicheArray){
					if (key in totalTally){
						loopTotalTally = totalTally[key];
					} else {
						loopTotalTally = 999; //Artifically Skew Unidentified shirts
					}
					
					normalization = (rnicheArray[key] / loopTotalTally);
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
											
				var lineChartData1 = {
					"datasets": [{
						"data": salesData,
						label: 'Sales',
						"pointStrokeColor": "#fff",
						"fillColor": "rgba(91, 185, 70, 0.75)",
						"pointColor": "rgba(91, 185, 70,1)",
						"strokeColor": "rgba(91, 185, 70,1)"
					}, {
						"data": cancelData,
						label: 'Cancellations',
						"pointStrokeColor": "#fff",
						"fillColor": "rgba(255, 61, 61, 0.75)",
						"pointColor": "rgba(255, 61, 61,1)",
						"strokeColor": "rgba(255, 61, 61,1)"

					}],
					"labels": chlabel
				};


				var lineChartData2 = {
					"datasets": [{
						"data": rev,
						label: 'Revenue',
						"pointStrokeColor": "#fff",
						"fillColor": "rgba(246, 145, 30, 0.75)",
						"pointColor": "rgba(246, 145, 30,1)",
						"strokeColor": "rgba(246, 145, 30,1)"
					}, {
						"data": roy,
						label: 'Royalties',
						"pointStrokeColor": "#fff",
						"fillColor": "rgba(215, 45, 255, 0.5)",
						"pointColor": "rgba(215, 45, 255,1)",
						"strokeColor": "rgba(215, 45, 255,1)"

					}],
					"labels": chlabel
				};
					
				/* New Gender Chart */
				var genderColors = {"Mens": "#3498db", "Womens": "#e86dab", "Kids": "#84cb74"};
				lineChartData3 = [];
				for (var key in rgendersArray){
					lineChartData3.push({
						"value": rgendersArray[key],
						"color": genderColors[key],
						"label": key
					})
				}
					
				var genderChart = new Chart(document.getElementById("canvas3")
					.getContext("2d"))
				.Pie(lineChartData3);
				/* End New Gender Chart */
			
				
				/* New Sizes Chart */
				var sizesColors = {'Small': '#ffab91', 'Medium': '#ff8a65', 'Large': '#ff7043', 'XL': '#ff5722', '2XL': '#e64a19', '3XL': '#d84315', 'Youth': '#ffccbc'};
				lineChartData4 = [];
				for (var key in rsizesArray){
					lineChartData4.push({
						"value": rsizesArray[key],
						"color": sizesColors[key],
						"label": key
					})
				}
					
				var sizesChart = new Chart(document.getElementById("canvas4")
					.getContext("2d"))
				.Pie(lineChartData4);
				/* End New Sizes Chart */
				
				
				/* New Shirt Colors Chart */
				var shirtColorsColors = {'Dark Heather': "#454b4b", 'Heather Grey': "#d5d9da", 'Heather Blue': "#696c9c", 'Black': "#222", 
					'Navy': "#15232b", 'Silver': "#cfd1d1", 'Royal Blue': "#1c4086", 'Brown': "#31261d", 'Slate': "#818189", 'Red': "#b71111", 'Asphalt': "#3f3e3c", 
					'Grass': "#5e9444", 'Olive': "#4a4f26", 'Kelly Green': "#006136", 'Baby Blue': "#8fb8db", 'White': "#eeeeee", 'Lemon': "#f0e87b", 'Cranberry': "#6e0a25",
					'Pink': "#f8a3bc", 'Orange': "#ff5c39", 'Purple': "#514689"};
				lineChartData5 = [];
				for (var key in rshirtColorsArray){
					lineChartData5.push({
						"value": rshirtColorsArray[key],
						"color": shirtColorsColors[key],
						"label": key
					})
				}
					
				var genderChart = new Chart(document.getElementById("canvas5")
					.getContext("2d"))
				.Pie(lineChartData5);
				/* End Shirt Colors Chart */

			
			
				/* New Shirt Niches Chart */
				var shirtNicheColors = ["#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#009688", "#00897b", "#00796b", "#00695c", "#004d40"];
				lineChartData6 = [];
				lineChartData7 = [];
				
				colorIndex = 0;
				

				var options = {};
				
				//If want to display tooltips:
				/*
				var options = 
				{
					tooltipTemplate: "<%=label%>: <%= value %>",
					onAnimationComplete: function()
					{
						this.showTooltip(this.segments, true);
					},
					tooltipEvents: [],
					showTooltips: true
				}
				*/
					
				// change to normalizedPercentageArray

							
					
					
				for (var key in rnicheArray){
					lineChartData6.push({
						"value": rnicheArray[key],
						"color": shirtNicheColors[colorIndex],
						"label": key
					})
					colorIndex ++;
					if (colorIndex > 9){ //Reset and reloop over colors
						colorIndex = 0;
					}
				}
					
				for (var key in normalizedPercentageArray){
					lineChartData7.push({
						"value": normalizedPercentageArray[key],
						"color": shirtNicheColors[colorIndex],
						"label": key
					})
					colorIndex ++;
					if (colorIndex > 9){ //Reset and reloop over colors
						colorIndex = 0;
					}
				}
				

				var nicheChart = new Chart(document.getElementById("canvas6")
					.getContext("2d"))
				.Pie(lineChartData6, options);

				
				var nicheChart = new Chart(document.getElementById("canvas7")
					.getContext("2d"))
				.Pie(lineChartData7, options);
				/* End Shirt Niches Chart */
			
			
			
			
				/*Generate Other Line Charts */
				var sales = new Chart(document.getElementById("canvas1")
						.getContext("2d"))
					.Line(lineChartData1);
				var royt = new Chart(document.getElementById("canvas2")
						.getContext("2d"))
					.Line(lineChartData2);
					
					
				/*Stats on top for the page */
				stats = '<center><h3>Statistics For The Past ' + (numberofDays + 1) + ' Days</h3></center><br>';	
				stats += '<table class="table table-striped"><thead><tr><th class="text-center">Shirts Sold</th><th class="text-center">Shirts Cancelled</th><th class="text-center">Revenue</th><th class="text-center">Royalties</th>'
						+ '<th class="text-center">Average Royalties / Shirt </th>'
						+ '<th class="text-center">Average Sales / Day </th>'
						+ '<th class="text-center">Average Royalties / Day </th>'
						+ '</tr></thead><tbody>'
						+ '<tr class="success text-center"><td><b>' + unitsSold + '</b></td>'
						+ '<td><b>' + unitsCancelled + '</b></td>'
						+ '<td><b>' + rrev.toFixed(2) + '</b></td>'
						+ '<td><b>' + rRoyalties.toFixed(2) + '</b></td>'
						+ '<td><b>' + (rRoyalties /(unitsSold - unitsCancelled)).toFixed(2) + '</b></td>'
						+ '<td><b>' + (unitsSold /(numberofDays + 1)).toFixed(2) + '</b></td>'
						+ '<td><b>' + (rRoyalties /(numberofDays + 1)).toFixed(2) + '</b></td>'
						+ '</tr></tbody></table><br>'

						+ '<div>'
						+ '<span>Set Date Range </span>'
						+ 	'<input type="text" name="numberOfDaysInput" />' 
						+ 	'<input type="submit" value="Update & Refresh" class="btn btn-success" id="save-number-days"/>'
						+ '</div>';
			   
							
				document.getElementById("twoweeksstats")
					.innerHTML = stats;
					
				if(m == 0 ){ //Hide Top 2 Charts if Days == 1, since they're useless.
					document.getElementById('salesPanel').style.display = "none";
					document.getElementById('revenuePanel').style.display = "none";
				}
				
					
				$('#save-number-days')
					.on('click', function(e) {
						numberOfDaysInput = parseInt($(this).closest("div").find('[name="numberOfDaysInput"]').val());
											
						if (numberOfDaysInput === parseInt(numberOfDaysInput, 10)){ //Check if integer
							if(numberOfDaysInput <= 0){
								alert('Enter a number greater than 0');
							} else if (numberOfDaysInput > 90){
								alert('Cannot get info for more than 90 days');
								
							} else{
								numberOfDaysInput --; //Need to do this to get right info
								twoweekssales(numberOfDaysInput);
								//location.reload();
							}
							
						} else{
							alert("Please complete field with a number");
						}
					})
					
				/*Dump Sales Data */				
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
				
							
				$("#nichePanel .panel-body").append(nicheDistData);
				
				$(".more-btn").click(function(){
					$('.niche-list-area').toggleClass('expanded');
				});
								
					
					
				/*Table Header */
				var cp2 = '<table class="table table-striped" id="shirtListTable"><thead><tr><th>#</th><th>Shirt Name</th><th class="text-center">Listing page</th>'
						+ '<th class="text-center">Units Sold</th>'
						+ '<th class="text-center">Units Cancelled</th>'
						+ '<th class="text-center">Revenue</th>'
						+ '<th class="text-center">Royalties</th>'
						+ '<th class="text-center">Average Royalties Per Shirt </th>'
						+ '<th class="text-center">Edit Shirt</th>'
						+ '</tr></thead><tbody>';


				var today = new Date().setTimeZone();
				today.setUTCHours(7,0,0,0) ; 

				var sls = 'https://merch.amazon.com/salesAnalyticsRecord/all?fromDate=' + today.adjustDate(-m)
					.getTime() + '&toDate=' + today.getTime();
				var reqs = new XMLHttpRequest();
				reqs.open("GET", sls, true);
				reqs.onreadystatechange = function() {
					if (reqs.readyState == 4) {
						if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {
							alert("error");

						} else {
							var ts = JSON.parse(reqs.responseText);
							k = 0;
							for (var i = 0; i < ts.length; i++) {					
								if (ts[i].isParentAsin == true) {
									k++;
									if((ts[i].unitsSold - ts[i].unitsCancelled) != 0){
										avgSaleValue = (ts[i].royaltyValue / (ts[i].unitsSold - ts[i].unitsCancelled)).toFixed(2)
									} else {
										avgSaleValue = 0;
									}
									
									
									cp2 += '<tr data-href="' + '/IndividualProductPage/?ASIN=' + ts[i].id + '">'  +
										'<th scope="row">' + k + '</th>'  +
										'<td>' + ts[i].asinName + '</td>' + 
										'<td class="text-center">' +
											'<a target="_blank" href="https://www.amazon.com/dp/' + ts[i].id + '" class="btn btn-info">Preview</a>' +
										'</td>' +
										'<td class="text-center">' + ts[i].unitsSold + '</td>' +
										'<td class="text-center">' + ts[i].unitsCancelled + '</td>' +
										'<td class="text-center">$' + ts[i].revenueValue + '</td>' +
										'<td class="text-center">$' + ts[i].royaltyValue + '</td>' +
										'<td class="text-center">$' + avgSaleValue + '</td>' +
										'<td class="text-center">' + '<a target="_blank" href="http://merch.amazon.com/merch-tshirt/title-setup/' + ts[i].merchandiseId + '/add_details" class="btn btn-info">Edit</a>' + '</td>' +
										'</tr>';
								}else if (ts[i].isParentAsin == false) {
									/*
									//Diplays shirts color, size and gender below each one.
									cp2 += '<tr>';
									cp2 += 		'<td>';
									cp2 += 			getShirtColor(ts[i].asinName);
									cp2 += 		'</td>';
									cp2 += 		'<td>';
									cp2 +=			getShirtSize(ts[i].asinName);
									cp2 += 		'</td>';
									cp2 += 		'<td>';
									cp2 +=			getShirtGender(ts[i].asinName);
									cp2 += 		'</td>';
									cp2 += '</tr>';
									*/
									
								};
							}
							cp2 += '</tbody></table>';
							document.getElementById("shirtlist")
								.innerHTML = cp2;
								
								
							new Tablesort(document.getElementById('shirtListTable'));

							//Make Entire Row Clickable
							$(function(){
								$('#shirtListTable tbody > tr[data-href!=""]').click(function() {
									var url = $(this).data("href");
									window.open(url, '_blank');
									
								});
							});
								
								
								
						};

					};
				};
				
				
				

				reqs.send();
			
			
			});// End of Callback 1
		}); //End of Callback 2 
	};
	
};


function twoweekssales(number) {
    document.head.innerHTML = globalHeader;
			
			
	var style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = chrome.extension.getURL('css.css');


    var d = new Date();
    n = d.toString();
    document.body.innerHTML = '<body>' +
				'<div class="wrapper">' +
					'<div class="container"><div class="panel panel-default"></center><div class="panel-body" id="twoweeksstats"><center><h3>Loading..</h3></center></div></div>' +
					' <div class="panel panel-default" id="salesPanel">    <div class="panel-heading">Sales/Cancellations</div>    <div class="panel-body"><center><canvas id="canvas1" height="450" width="800" ></canvas></center></div> </div>' +
					' <div class="panel panel-default" id="revenuePanel">    <div class="panel-heading">Revenue/Royalties</div>    <div class="panel-body"><center><canvas id="canvas2" height="450" width="800" ></canvas></center></div> </div>' +
					' <div class="panel panel-default">    <div class="panel-heading">Advanced Analytics</div>    <div class="panel-body">'+
					'<center>' +
						'<div class="canvas-wrapper">' +
							'<canvas id="canvas3" height="350" width="280" style="padding:10px"></canvas>' +
							'<h3 class="canvas-title">Gender Distribution</h3>' +
						'</div>' +
						'<div class="canvas-wrapper">'+
							'<canvas id="canvas4" height="350" width="280" style="padding:10px"></canvas>' +
							'<h3 class="canvas-title">Size Distribution</h3>' +
						'</div>'+
						'<div class="canvas-wrapper">'+
							'<canvas id="canvas5" height="350" width="280" style="padding:10px"></canvas>'+
							'<h3 class="canvas-title">Color Distribution</h3>' +
						'</div>' +
						'</div> </div>' +
					'</center>' +
					' <div class="panel panel-default" id="nichePanel">    <div class="panel-heading">Niche Analysis</div>    <div class="panel-body">'+
						'<div class="col-xs-6">' +
							'<center>' +
								'<div class="canvas-wrapper" style="width: 100%;">'+
									'<canvas id="canvas6" height="350" width="280" style="padding:10px"></canvas>'+
									'<h3 class="canvas-title">Niche Distribution (Number Sold)</h3>' +
								'</div>' +
							'</center>' +
						'</div>' +
						
						'<div class="col-xs-6">' +
							'<center>' +
								'<div class="canvas-wrapper" style="width: 100%;">'+
									'<canvas id="canvas7" height="350" width="280" style="padding:10px"></canvas>'+
									'<h3 class="canvas-title">Normalized Niche Distribution (%)</h3>' +
								'</div>' +
							'</center>' +
						'</div>' +
						
					'</div> </div>' +
					'<br><div class="panel panel-default"><div class="panel-heading">Shirts Sold</div> <div class="panel-body" id="shirtlist"></div></div></div>' + 
				'</div>' +
			'</body>';
			
	var pageContent = document.querySelector(".wrapper");
	pageContent.innerHTML += sidebarHTML;
	
	numberofDays = number; //Reset scope of var
		
	document.title = "Past " + numberofDays +"  Days Sales - Merch Analytics ";
	document.body.style.backgroundColor = "#ecf1f2";
	salesData = [];
	cancelData = [];
	returnData = [];
	gendersData = [];
	sizesData = [];
	shirtColorsData = [];
	shirtNicheData = [];
	rev = [];
	roy = [];
	chlabel = [];
	
	
	fetchsales(numberofDays, numberofDays, salesData, cancelData, returnData, rev, roy, chlabel, gendersData, sizesData, shirtColorsData, shirtNicheData);
};


/***************************************************************/
/********************* Monthly Sales Page **********************/
/***************************************************************/	
function merchmonths(count, m, salesData, cancelData, returnData, rev, roy, chlabel, ts) {
    if (count >= 0) {
        var today = new Date().setTimeZone();
		today.setUTCHours(7,0,0,0) ; 
        var thatMonth = today.adjustMonth(-count);
        startDate = thatMonth.getFirstDateOfMonth();
        endDate = thatMonth.getLastDayOfMonth();

        var sls = 'https://merch.amazon.com/salesAnalyticsRecord/all?fromDate=' + startDate.getTime() + '&toDate=' + endDate.getTime();
        var reqs = new XMLHttpRequest();
        reqs.open("GET", sls, true);
        reqs.onreadystatechange = function() {
            if (reqs.readyState == 4) {
                if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {
                    alert("error");

                } else {


                    var tots = 0;
                    var totr = 0;
                    var totc = 0;
                    var totrev = 0;
                    var totroy = 0;
                    var ts = JSON.parse(reqs.responseText);

                    for (i = 0; i < ts.length; i++) {
                        if (ts[i].isParentAsin == true) {
                            tots += parseInt(ts[i].unitsSold);
                            totr += parseInt(ts[i].unitsReturned);
                            totc += parseInt(ts[i].unitsCancelled);
                            totrev += parseFloat(parseFloat(ts[i].revenueValue)
                                .toFixed(2));
                            totroy += parseFloat(parseFloat(ts[i].royaltyValue)
                                .toFixed(2));
                        };
                    };

                    salesData.push(tots);
                    cancelData.push(totc);
                    returnData.push(totr);
                    chlabel.push(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][today.adjustMonth(-count)
                        .getMonth()
                    ]);
                    rev.push(totrev);
                    roy.push(totroy);
                    document.getElementById("twoweeksstats")
                        .innerHTML = "<center><h3>Loading Month [" + (m - count) + "/" + m + "]</h3></center>";
                    merchmonths(count - 1, m, salesData, cancelData, returnData, rev, roy, chlabel, ts);
                };

            };
        };

        reqs.send();

    } else {

        xx = 0;
        cxx = 0;
        rr = 0;
        rrev = 0;
		
        for (i = 0; i < salesData.length; i++) {
            xx += salesData[i];
            rr += roy[i];
            rrev += rev[i];
            cxx += cancelData[i];
        }
		
		
		/* Calculate Projections */
		daysSinceStartOfMonth = new Date().getDate();
		var projectionSalesArray = new Array(salesData.length).fill(null); //Array of Nulls for Projection
		var projectionRevenueArray = new Array(salesData.length).fill(null); //Array of Nulls for Projection
		var projectionRoyaltiesArray = new Array(salesData.length).fill(null); //Array of Nulls for Projection
		

		/* Projected Sales */
		salesThisMonthSoFar = salesData[salesData.length - 1];
		projectedSales = (salesThisMonthSoFar * 30 / daysSinceStartOfMonth); //Calculate Projection
		
		projectionSalesArray[projectionSalesArray.length - 1] = projectedSales; 
		
		
		/* Projected Revenue */
		revenueThisMonthSoFar = rev[rev.length - 1];
		projectedRevenue = (revenueThisMonthSoFar * 30 / daysSinceStartOfMonth); //Calculate Projection
		
		projectionRevenueArray[projectionRevenueArray.length - 1] = projectedRevenue; 
		
		
		/* Projected Profit */
		royaltiesThisMonthSoFar = roy[roy.length - 1];
		projectedRoyalties = (royaltiesThisMonthSoFar * 30 / daysSinceStartOfMonth); //Calculate Projection
		
		projectionRoyaltiesArray[projectionRoyaltiesArray.length - 1] = projectedRoyalties; 

		
		/*Generate Charts */
        var lineChartData1 = {
            "datasets": [{
				"data": projectionSalesArray,
                label: 'Projected Sales',
                "pointStrokeColor": "#fff",
                "fillColor": "rgba(200, 200, 200, 0.75)",
                "pointColor": "#ddd",
                "strokeColor": "#ddd"
            }, {
                "data": salesData,
                label: 'Sales',
                "pointStrokeColor": "#fff",
                "fillColor": "rgba(91, 185, 70, 1)",
                "pointColor": "rgba(91, 185, 70,1)",
                "strokeColor": "rgba(91, 185, 70,1)"
            }, {
                "data": cancelData,
                label: 'Cancellations',
                "pointStrokeColor": "#fff",
                "fillColor": "rgba(255, 61, 61, 0.75)",
                "pointColor": "rgba(255, 61, 61,1)",
                "strokeColor": "rgba(255, 61, 61,1)"

            }],
            "labels": chlabel

        };


        var lineChartData2 = {
            "datasets": [{
				"data": projectionRevenueArray,
                label: 'Projected Revenue',
                "pointStrokeColor": "#fff",
                "fillColor": "rgba(200, 200, 200, 0.75)",
                "pointColor": "#ddd",
                "strokeColor": "#ddd"
            }, {
				"data": projectionRoyaltiesArray,
                label: 'Projected Revenue',
                "pointStrokeColor": "#fff",
                "fillColor": "rgba(220, 220, 220, 0.75)",
                "pointColor": "#ddd",
                "strokeColor": "#ddd"
            }, {
                "data": rev,
                label: 'Revenue',
                "pointStrokeColor": "#fff",
                "fillColor": "rgba(246, 145, 30, 1)",
                "pointColor": "rgba(246, 145, 30, 1)",
                "strokeColor": "rgba(246, 145, 30, 1)"
            }, {
                "data": roy,
                label: 'Royalties',
                "pointStrokeColor": "#fff",
                "fillColor": "rgba(215, 45, 255, 0.5)",
                "pointColor": "rgba(215, 45, 255, 1)",
                "strokeColor": "rgba(215, 45, 255, 1)"

            }],
            "labels": chlabel

        };

        var sales = new Chart(document.getElementById("canvas1")
                .getContext("2d"))
            .Line(lineChartData1);
        var royt = new Chart(document.getElementById("canvas2")
                .getContext("2d"))
            .Line(lineChartData2);

        document.getElementById("twoweeksstats")
            .innerHTML = '<center><h3>Monthly Statistics</h3></center><br><table class="table table-striped"><thead><tr><th class="text-center">Shirts Sold</th><th class="text-center">Shirts Cancelled</th><th class="text-center">Revenue</th><th class="text-center">Royalties</th></tr></thead><tbody>' +
            '<tr class="success text-center"><td><b>' + xx + '</b></td><td><b>' + cxx + '</b></td><td><b>' + rrev.toFixed(2) + '</b></td><td><b>' + rr.toFixed(2) + '</b></td></tr></tbody></table><br>';



    };
}

function merchmonthsall() {
    document.head.innerHTML = globalHeader;
    var d = new Date();
    n = d.toString();
    document.body.innerHTML = '<body>' + 
									'<div class="wrapper">' +
										'<div class="container"><div class="panel panel-default"></center><div class="panel-body" id="twoweeksstats"><center><h3>Loading..</h3></center></div></div>' +
										' <div class="panel panel-default">    <div class="panel-heading">Sales/Cancellations</div>    <div class="panel-body"><center><canvas id="canvas1" height="450" width="800" ></canvas></center></div> </div>' +
										' <div class="panel panel-default">    <div class="panel-heading">Revenue/Royalties</div>    <div class="panel-body"><center><canvas id="canvas2" height="450" width="800" ></canvas></center></div> </div>' +
										'<br></div>' + 
									'</div>' +
								'</body>';
		
	var pageContent = document.querySelector(".wrapper");
	pageContent.innerHTML += sidebarHTML;
		

    document.title = "Merch Months - MerchTools ";
    document.body.style.backgroundColor = "#ecf1f2";
    salesData = [];
    cancelData = [];
    returnData = [];
    rev = [];
    roy = [];
    chlabel = [];

    iio = monthDiff(
        new Date(2016, 6, 1),
        new Date()
    );
    merchmonths(iio, iio, salesData, cancelData, returnData, rev, roy, chlabel);
};


/***************************************************************/
/******************* Product Manager Page **********************/
/***************************************************************/
function productManager() {
    document.head.innerHTML = globalHeader;
				
	bodyHTML = '<body>' + 
					'<div class="wrapper">' +
						'<div class="container"><br><div class="panel panel-default">' +
						'<div class="alert alert-success"><strong> Use  CTRL + F (PC) or ⌘ + F (MAC) to open the search bar.</strong>' +
						'<div class="btn btn-info" id="reset-button">Clear All Niche Data</div>' +
						'</div><div class="panel-body" id="shirtlist"></div></div></div>' + 
					'</div>' +
				'</body>';
	
    document.body.innerHTML = bodyHTML;
    document.title = "Quick Editor  - MerchTools ";
    document.body.style.backgroundColor = "#ecf1f2";  //"#D1F8CC";
	
	var pageContent = document.querySelector(".wrapper");
	pageContent.innerHTML += sidebarHTML;
	

	fetchAllLiveProducts(function(ts){
		var cp2 = '<h2>Live Listings:</h2><br>' +
					'<div id="status"></div>' +
					'<table id="quickEditor" class="table table-striped"><thead><tr><th>#</th>'
					+ '<th>Title</th>'
					+ '<th class="text-center">Days Until Deletion</th>'
					+ '<th class="text-center">Listing page</th>'
					+ '<th class="text-center">Niche</th>'
					+ '<th class="text-center">Price</th>' 
					+ '<th class="text-center">Edit</th>'
					+ '</tr></thead><tbody>';
		k = 0;
		for (var i = 0; i < ts.length; i++) {
			k++;
			
			
			
			
			if (ts[i].marketplaceAsinMap.US !== undefined){
			
				var hasLifetimeSales = false;
				//Determine if a design has ever sold
				if(ts[i].daysUntilDeletion.length === 0 || parseInt(ts[i].daysUntilDeletion) > 90){
					hasLifetimeSales = true;
				}
			
				cp2 += '<tr data-lifetime-sales="'+ hasLifetimeSales.toString() + '"><th scope="row">' + k + '</th>' + 
					'<td><a href="/IndividualProductPage/?ASIN=' + ts[i].marketplaceAsinMap.US + '">' + ts[i].name + '</a></td>' + 
						
					'<td class="text-center">' +
						ts[i].daysUntilDeletion + 
					'</td>' +
					
					'<td class="text-center">' +
						'<a target="_blank" href="https://www.amazon.com/dp/' + ts[i].marketplaceAsinMap.US + '" class="btn btn-info">Preview</a>' +
					'</td>' +
					
					'<td class="text-center">' +
						  '<input type="text" name="nicheName" class="niche-input"/>' +
						  '<input type="hidden" name="parentASIN" value='+ ts[i].marketplaceAsinMap.US + '>' +
						  '<input type="submit" value="Save" class="btn btn-info save"/>' +
					'</td>' +
					'<td class="text-center">' + ts[i].listPrice + '</td>' +
				'<td class="text-center">' + '<a target="_blank" href="http://merch.amazon.com/merch-tshirt/title-setup/' + ts[i].id + '/add_details" class="btn btn-info">Edit</a>' + '</td></tr>';
			}
		}
			
		cp2 += '</tbody></table>';
		document.getElementById("shirtlist")
			.innerHTML = cp2;
			
		new Tablesort(document.getElementById('quickEditor'));
			
		initSaveButtons(); //initialize event listeners for buttons
		
		});
}


/***************************************************************/
/**************** Individual Product Page **********************/
/***************************************************************/
function individualProductPage(queryParams){
	document.head.innerHTML = globalHeader;
				
	bodyHTML = '<body>' + 
					'<div class="wrapper">' + 
						'<div class="container">' +
							'<div class="panel panel-default">' +
								'<div class="alert alert-success" id="status">' + 
									'<strong> Loading ... </strong>' +
								'</div>'+
								'<div class="panel-body" id="individualShirtSummary"></div>' +
							'</div>'+
							' <div class="panel panel-default" id="salesPanel">' + 
								'<div class="panel-heading">Sales/Cancellations</div>' + 
								'<div class="panel-body">' + 
									'<center><canvas id="canvas1" height="450" width="800" ></canvas></center>' + 
								'</div>' + 
							'</div>' +
							'<div class="panel panel-default" id="revenuePanel">'+ 
								'<div class="panel-heading">Revenue/Royalties</div>' + 
								'<div class="panel-body">' + 
									'<center><canvas id="canvas2" height="450" width="800" ></canvas></center>' + 
								'</div>' + 
							'</div>' +
							'<div class="panel panel-default">' + 
								'<div class="panel-heading">Sales History</div>' + 
								'<div class="panel-body" id="individualShirtSales"></div>' +
							'</div>' +
						'</div>' + 
					'</div>' + 
				'</body>';
		
    document.body.innerHTML = bodyHTML;
		
	var pageContent = document.querySelector(".wrapper");
	pageContent.innerHTML += sidebarHTML;
			
	renderIndividualProductSales(queryParams);
}


function renderIndividualProductSales(queryParams){
	var targetASIN = queryParams["ASIN"];
	
	fetchIndividualProductSales(targetASIN, function(responseArray){	
		// Assemble Data for Graphs 
		
		// Need To get First Publication Date
		fetchAllLiveProducts(function (liveProductsArray){
			var firstPublishDate = "";
			var today = new Date().setTimeZone();
			today.setUTCHours(7,0,0,0); 
			
			for ( i =0; i < liveProductsArray.length; i++){
				if(liveProductsArray[i]["marketplaceAsinMap"]["US"] == targetASIN){
					var firstPublishDate = new Date(parseInt(liveProductsArray[i]["firstPublishDate"]));
					var imgURL = liveProductsArray[i]["imageURL"]; //Not working ATM
					var firstPublishDateString = firstPublishDate.toDateString();
					var shirtName = liveProductsArray[i]["name"];					
				}
			
			}
										
			//Generate Axis Labels
			var axisLabels = [];
			while (firstPublishDate <= today.getTime()) {
				var dd = firstPublishDate.getDate();
				var mm = firstPublishDate.getMonth()+1;

				var yyyy = firstPublishDate.getFullYear();
				if(dd<10){
					dd='0'+dd;
				} 
				if(mm<10){
					mm='0'+mm;
				} 
				var stringifiedDate = mm+'-'+dd+'-'+yyyy;
				axisLabels.push(stringifiedDate);
				firstPublishDate = firstPublishDate.adjustDate(1);
			}
			
			
			//Extract Dates of Sales
			var datesArray = [];
			for ( i =0; i < responseArray.length; i++){
				datesArray.push(responseArray[i]["Date"]);
			}
			
			var salesData = new Array(axisLabels.length).fill(0);
			var cancelData = new Array(axisLabels.length).fill(0);
			var revenueData = new Array(axisLabels.length).fill(0);
			var royaltyData = new Array(axisLabels.length).fill(0);
			
			//Sales Data (Not Very Efficient)
			for (i = 0; i < axisLabels.length; i++) {
				for ( i2 = 0; i2 < responseArray.length; i2++){
					if(axisLabels[i] == responseArray[i2]["Date"]){
						salesData[i] += 1;
						revenueData[i] += parseFloat(responseArray[i2]["Revenue"]);
						royaltyData[i] += parseFloat(responseArray[i2]["Royalty"]);
					} 
					
					if(axisLabels[i] == responseArray[i2]["Date"] && parseInt(responseArray[i2]["Revenue"]) == 0){
						cancelData[i] += 1;
					} 
					
				}
			}
			
			var lifetimeSales = salesData.reduce(function(a, b) { return a + b; }, 0) - cancelData.reduce(function(a, b) { return a + b; }, 0) ;
			var lifetimeRevenue = revenueData.reduce(function(a, b) { return a + b; }, 0).toFixed(2);
			var lifetimeRoyalties = royaltyData.reduce(function(a, b) { return a + b; }, 0).toFixed(2);
			
					
			var lineChartData1 = {
				"datasets": [{
					"data": salesData,
					label: 'Sales',
					"pointStrokeColor": "#fff",
					"fillColor": "rgba(91, 185, 70, 0.75)",
					"pointColor": "rgba(91, 185, 70,1)",
					"strokeColor": "rgba(91, 185, 70,1)"
				} , {
					"data": cancelData,
					label: 'Cancellations',
					"pointStrokeColor": "#fff",
					"fillColor": "rgba(255, 61, 61, 0.75)",
					"pointColor": "rgba(255, 61, 61,1)",
					"strokeColor": "rgba(255, 61, 61,1)"

				}],
				"labels": axisLabels
			};
						
			var lineChartData2 = {
				"datasets": [{
					"data": revenueData,
					label: 'Revenue',
					"pointStrokeColor": "#fff",
					"fillColor": "rgba(246, 145, 30, 0.75)",
					"pointColor": "rgba(246, 145, 30,1)",
					"strokeColor": "rgba(246, 145, 30,1)"
				}, {
					"data": royaltyData,
					label: 'Royalties',
					"pointStrokeColor": "#fff",
					"fillColor": "rgba(215, 45, 255, 0.5)",
					"pointColor": "rgba(215, 45, 255,1)",
					"strokeColor": "rgba(215, 45, 255,1)"

				}],
				"labels": axisLabels
			};
			
			
			var sales = new Chart(document.getElementById("canvas1")
					.getContext("2d"))
				.Line(lineChartData1);
				
			
			var royt = new Chart(document.getElementById("canvas2")
					.getContext("2d"))
				.Line(lineChartData2);
		
			/*Assemble Sales History Table */
			var cp2 = '<div id="status"></div>' +
				'<table class="table table-striped"><thead><tr><th>#</th>'
				+ '<th class="text-center">Date Sold</th>'
				+ '<th class="text-center">Units</th>'
				+ '<th class="text-center">Revenue</th>'
				+ '<th class="text-center">Royalty</th>'
				+ '<th class="text-center">Gender</th>' 
				+ '<th class="text-center">Size</th>'
				+ '<th class="text-center">Color</th>'
				+ '</tr></thead><tbody>';

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
			document.getElementById("individualShirtSales")
				.innerHTML = cp2;
			
			
			var shirtInfo = '<dl>'+
								'<dt>Shirt Name:&nbsp;</dt>' +
								'<dd>' + shirtName + '</dd>' +
							'</dl><dl>' +
								'<dt>First Published Date:&nbsp;</dt>' +
								'<dd>' + firstPublishDateString + '</dd>' +
							'</dl><dl>' +
								'<dt>ASIN:&nbsp; </dt>' +
								'<dd>' + targetASIN + '</dd>' +
							'</dl><dl>' +
								'<dt>Lifetime Sales:&nbsp; </dt>' +
								'<dd>' + lifetimeSales + '</dd>' +
							'</dl><dl>' +
								'<dt>Lifetime Revenue:&nbsp; </dt>' +
								'<dd>$' + lifetimeRevenue + '</dd>' +
							'</dl><dl>' +
								'<dt>Lifetime Royalties:&nbsp; </dt>' +
								'<dd>$' + lifetimeRoyalties + '</dd>' +
							'</dl>';
			
			document.getElementById("status").innerHTML = '<strong>Individual Product Information</strong>';			
			//document.getElementById("individualShirtSummary").innerHTML += '<img src='+ imgURL +'/>'; //Not working ATM
			document.getElementById("individualShirtSummary").innerHTML += shirtInfo;
							
		});
	});	
}


function fetchIndividualProductSales(targetASIN, callback){
	var today = new Date().setTimeZone();
	today.setUTCHours(7,0,0,0); 
	var fromDate = today.adjustDate(-90).getTime();
	var toDate = today.getTime();
	
	fetchSalesDataCSV(fromDate, toDate, function(responseArray){
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
   (e || window.event).preventDefault();
   document.head.innerHTML = globalHeader;
   document.body.innerHTML = '<body>'+
								'<div class="wrapper">' +
								'</div>' +
							'</body>';
   var pageContent = document.querySelector(".wrapper");
	pageContent.innerHTML += sidebarHTML;
   
   var con = document.querySelector('.wrapper'), xhr = new XMLHttpRequest();

   xhr.onreadystatechange = function (e) { 
		if (xhr.readyState == 4 && xhr.status == 200) {
			con.innerHTML += xhr.responseText;
		}
   }

	xhr.open("GET", chrome.extension.getURL('options.html'), true);
	xhr.setRequestHeader('Content-type', 'text/html');
	xhr.send();
}


/***************************************************************/
/************* Shirt Determination Functions *******************/
/***************************************************************/
function getShirtColor(shirtASIN){
	knownColors = ["Dark Heather", "Heather Grey", "Heather Blue", "Black", "Navy", "Silver", "Royal Blue", "Brown", "Slate", "Red", "Asphalt", "Grass", "Olive", "Kelly Green", "Baby Blue", "White", "Lemon", "Cranberry", "Pink", "Orange", "Purple"];
	for(var i = 0, len = knownColors.length; i < len; i++){
		term = knownColors[i];
		var index = shirtASIN.indexOf(term); 
		if (index != -1) {
			color =  knownColors[i];
			break;
		} else{
			color = "Unknown Color";
		}
	}
	return color;
}

function getShirtSize(shirtASIN){
	adultSizes = ["Small", "Medium", "Large", "XL", "2XL", "3XL"];
	youthSizes =  ["4", "6", "8", "10", "12"];
	
	for(var i = 0, len = adultSizes.length + youthSizes.length ; i < len; i++){
		var indexAdult = shirtASIN.indexOf(adultSizes[i]); 
		if (indexAdult != -1) {
			size =  adultSizes[i];
			break;
		}
		
		var indexYouth = shirtASIN.indexOf(youthSizes[i]); 
		if (indexYouth != -1) {
			size = "Youth"
			break
		}	
	}
	
	if (size == null){ //Just in case can't determine the size
		size = "Unknown Size";
	}
	
	return size;
}

function getShirtGender(shirtASIN){
	knownGenders = ["Mens", "Womens", "Kids"];

	for(var i = 0, len = knownGenders.length; i < len; i++){
		term = knownGenders[i];
		var index = shirtASIN.indexOf(term); 
		if (index != -1) {
			shirtGender =  knownGenders[i];
			break;
		} else{
			shirtGender = "Unknown Gender";
		}
	}
	return shirtGender;
}


function getShirtNiche(shirtASIN, callback){
	var myKey = String(shirtASIN);
	
	chrome.storage.sync.get(myKey, function(items) {
		if(Object.values(items).length == 0){ //If no matches, set to unknown
			determinedNiche = "unknown niche";
			
		} else{
			parsedJson = JSON.parse(items[myKey]);
			determinedNiche = parsedJson["niche"];
		}
		
		
		callback(determinedNiche); //Run Callback
	});
}
				

/***************************************************************/
/************************ Niche Storage ************************/
/***************************************************************/
function saveShirtNiche(nicheName, parentASIN) {		
	//Assemble Stringified JSON	
	var key = parentASIN,
	data = JSON.stringify({
		'niche': nicheName
	});
    var jsonfile = {};
    jsonfile[key] = data;
	
	
	// Save it using the Chrome extension storage API.	
    chrome.storage.sync.set(jsonfile, function () {
        console.log('Saved', key, data);
    });
}


function readShirtNiche(){	
	$('[name="nicheName"]').each(function () {
		//Get ASIN
		var myKey = $(this).closest('td').find('[name="parentASIN"]').val();
		
		var that = $(this);
		
		//Fetch Matching Niche
		chrome.storage.sync.get(myKey, function(items) {
			if (typeof(items[myKey]) != 'undefined'){
				parsedJson = JSON.parse(items[myKey]);
				that.val(parsedJson["niche"]);
			} else{
				that.siblings('input[type="submit"]').addClass("btn-danger");
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
	 alert("All previous data has been cleared");
}


function initSaveButtons(){ //Adds event listeners to all buttons	
	$(function(){
		$('.save').on('click',function(){
			nicheName = $(this).closest('td').find('[name="nicheName"]').val();
			parentASIN = $(this).closest('td').find('[name="parentASIN"]').val();
			saveShirtNiche(nicheName, parentASIN);
			
			//Remove class than makes button red
			$(this).removeClass("btn-danger");
		});
			
		//Listener for reset button
		document.getElementById('reset-button').addEventListener("click", function(){clearAllNicheData();}, false);
		
		//Enter key goes to next field
		$('#shirtlist input[type="text"]').keydown(function(e) {
			if (e.which == 13) { //Enter Key
				e.preventDefault();
				$(this).siblings('input[type="submit"]').click(); //Click Submit Button
				$(this).closest("tr").next().find('input[type="text"]').focus(); //Focus on Next Field
			}
			
			if (e.which == 38) { //Up Key
				e.preventDefault();
				$(this).closest("tr").prev().find('input[type="text"]').focus(); //Focus on Next Field
			}
			
			if (e.which == 40) { //Down Key
				e.preventDefault();
				$(this).closest("tr").next().find('input[type="text"]').focus(); //Focus on Next Field
			}
		});
		
		
		readShirtNiche();		
	})
}
