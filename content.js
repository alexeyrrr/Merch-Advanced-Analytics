var header = '<!DOCTYPE html><html><head>' + '<style>div.img {    background-color: lightblue;  border: 1px solid #ccc;}div.img:hover {    border: 1px solid #777;}div.img img {    width: 100%;    height: auto;}div.desc {    padding: 15px;    text-align: left;}* {    box-sizing: border-box;}.responsive {    padding: 0 6px;    float: left;    width: 24.99999%;}@media only screen and (max-width: 700px){    .responsive {        width: 49.99999%;        margin: 6px 0;    }}@media only screen and (max-width: 500px){    .responsive {        width: 100%;    }}.clearfix:after {    content: "";    display: table;    clear: both;}</style>' + '</head><body margin: 100px 150px 100px 80px;>';
var footer = '</div></body></html>';


function when(t) {
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

function imgthis(url) {
    f = "<img src=" + url + " class='img-rounded' alt='Cinque Terre' width='213' height='256'>";
    return f;
};

function cardit(num, img, id, sname, asin, pric, stat, cdate, srank, pg, dud) {

    if (dud === null) {
        dud = "<font size='3' color='Green'>Proven Seller</font>"
    } else {
        dud = "<font size='3' color='red'>" + dud + "</font>"
    };

    cardcode = "<div class='img'>  <a target='_blank' href=https://www.amazon.com/dp/" + asin + "><img src=" + img + " alt=" + img + " width='213' height='256' class='img-thumbnail'>  </a>  <div class='desc'> <br><p > <b>Name :</b> " + sname + "(" + (num + (pg * 20)) + ")<br> <b>ASIN :</b> " + asin + "<br> <b>Price :</b> " + pric + "<br><b> State :</b> " + stat + "<br> <b>Creation Date :</b> " + when(cdate) + "<br>" + "<br><b> Days Until Deletion :</b> " + dud + "<br></p>";
    revbutt = '';

    chekrev = '<a target="_blank" href="https://www.amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=gpx&asin=' + asin + '" class="btn btn-warning btn-sm">Check Reviews </a></div> </div>';
    editsh = '<a target="_blank" href="http://merch.amazon.com/merch-tshirt/title-setup/' + id + '/add_details" class="btn btn-warning btn-sm">Edit Shirt </a>';
    return cardcode + editsh + chekrev + revbutt;
};

function showshirt(t1, fr) {
    for (i = 0; i < 20; i++) {
        document.getElementById("shirts")
            .innerHTML = document.getElementById("shirts")
            .innerHTML + cardit(i, t1.merchandiseList[i].imageURL, t1.merchandiseList[i].id, t1.merchandiseList[i].name, t1.merchandiseList[i].marketplaceAsinMap.US, t1.merchandiseList[i].listPrice, t1.merchandiseList[i].status, t1.merchandiseList[i].createDate, 0, fr, t1.merchandiseList[i].daysUntilDeletion);
        //document.getElementById("asintxt").value=document.getElementById("asintxt").value+t1.merchandiseList[i].marketplaceAsinMap.US+'\n';
    };
};

/*Alexey's functions */
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




function getShirtNiche(shirtASIN, func){
	var myKey = String(shirtASIN);
	
	chrome.storage.sync.get(myKey, function(items) {
		if(Object.keys(items).length == 0){ //If no matches, set to unknown
			func("unknown niche");
			
		} else{
			parsedJson = JSON.parse(items[myKey]);
			func(parsedJson["niche"]);
		}
	});
}
				
	
/*End Alexey's functions */

function shirtlister() {
    cmd = window.location.href;
    vp = cmd.indexOf("/mt/") - cmd.indexOf("/page=");
    var pg = parseInt(cmd.slice(cmd.indexOf("/page=") + 6, cmd.indexOf("/mt/")));

    document.body.style.backgroundColor = "#ecf1f2";
    document.body.innerHTML = header + "<div class='well'><div id ='nav'></div><div id ='shirts'></div>" + footer;
    document.title = "My Shirts - MerchTools";

    var mange = 'https://merch.amazon.com/publishedItemsSummary';
    var req = new XMLHttpRequest();
    req.open("GET", mange, true);
    req.onreadystatechange = function() {
        if (req.readyState == 4) {


            if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(req.status) === -1) {} else {
                var x = JSON.parse(req.responseText);
                var mm = parseInt(x.publishedItemCount) / parseInt(x.publishedItemCountLimit) * 100;
                var mange1 = 'https://merch.amazon.com/merchandise/list?pageSize=20&pageNumber=' + pg + '&statusFilters%5B%5D=LIVE&statusFilters%5B%5D=NOT_DISCOVERABLE&statusFilters%5B%5D=PENDING&statusFilters%5B%5D=PROCESSING&statusFilters%5B%5D=STOPPED&keywords=';

                var req1 = new XMLHttpRequest();
                req1.open("GET", mange1, true);
                req1.onreadystatechange = function() {
                    if (req1.readyState == 4) {

                        if ([200, 201, 202, 203, 204, 205, 206, 207, 226, 0].indexOf(req1.status) === -1) {


                        } else {
                            
                            myasins = [];
                            var t1 = JSON.parse(req1.responseText);
                            az = parseInt(t1.totalMerchandiseCount);
                            tn = 0;
                            for (i = 0; tn * 20 < az; i++) {
                                tn = i
                            }

	
                            temp = "";
                            //document.getElementById("page").innerHTML=asintxt;

                            navbar = document.getElementById("nav");
                            navbar.innerHTML = navbar.innerHTML + '<div class="left"><ul id ="pages" class="pagination pagination-sm" >';
                            pp = document.getElementById("pages");

                            for (i = 1; i < tn + 1; i++) {
                                if (i == pg) {
                                    pp.innerHTML = pp.innerHTML + '<li class="active"><a href="/MerchToolsShirtsLister/page=' + i + '/mt/">' + i + '</a></li>';
                                } else {
                                    pp.innerHTML = pp.innerHTML + '<li><a href="/MerchToolsShirtsLister/page=' + i + '/mt/">' + i + '</a></li>';
                                };
                            };



                            pp.innerHTML = pp.innerHTML + '</ul></div>';



                            showshirt(t1, pg);
                            //document.getElementById("ovrl").innerHTML=x.publishedItemCount+" shirts Live ("+mm+"%)";
                            //document.getElementById("ovrl").style="width:"+mm+"%";
                            //document.getElementById("emp").innerHTML=parseInt(x.publishedItemCountLimit) - parseInt(x.publishedItemCount) +"("+(100-mm).toString()+"%) Slots Empty";
                            // document.getElementById("emp").style="width:"+(100-mm).toString()+"%";

                        };
                    };
                };
                req1.send();

            }

        }
    };
    req.send();
};




//*************************************************************************
function drawtodaysales(tts) {
    var tsales = '<h2>Today Sales</h2><br><table class="table table-striped"><thead><tr><th>#</th><th>Shirt Name</th><th class="text-center">Listing page</th><th class="text-center">UnitsSold</th><th class="text-center">Revenue</th><th class="text-center">Royalties</th><th class="text-center">Edit</th></tr></thead><tbody>';
    k = 0;
    for (var i = 0; i < tts.length; i++) {
        if (tts[i].isParentAsin) {
            k++;
            tsales += '<tr><th scope="row">' + k + '</th><td>' + tts[i].asinName + '</td><td class="text-center">' + '<a target="_blank" href="https://www.amazon.com/dp/' + tts[i].id + '" class="btn btn-info">Preview</a><td class="text-center">' + tts[i].unitsSold + '</td><td class="text-center">$' + tts[i].revenueValue + '</td><td class="text-center">$' + tts[i].royaltyValue + '</td><td class="text-center">' + '<a target="_blank" href="http://merch.amazon.com/merch-tshirt/title-setup/' + tts[i].merchandiseId + '/add_details" class="btn btn-info">Edit Shirt </a>' + '</td></tr>';
        };

    }
    tsales += '</tbody></table>';
    document.getElementById("well2")
        .innerHTML = tsales;
};



//-----------------------thanks for the date lib ----------------------
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
/*** End Date Library */



function todayssales() {
    document.head.innerHTML = '<head><style></style></head>';
    var d = new Date();
    n = d.toString();
    document.body.innerHTML = '<body ><br><div class="container"><div class="panel panel-default"><br><div class="panel-body" id="todaystats">Loading..</div></div><br><div class="panel panel-default"><div class="panel-body" id="shirtlist"></div></div></div></body>';
    document.title = "Today's Sales - MerchTools ";
    document.body.style.backgroundColor = "#ecf1f2";

    tot = 0;
    var today = new Date().setTimeZone();
	today.setUTCHours(7,0,0,0) ; 
    var sls = 'https://merch.amazon.com/salesAnalyticsRecord/all?fromDate=' + today.getTime() + '&toDate=' + today.getTime();
    //var sls= 'https://merch.amazon.com/salesAnalyticsRecord/all?fromDate=1461999600000&toDate=1467270000000';
    var reqs = new XMLHttpRequest();
    reqs.open("GET", sls, true);
    reqs.onreadystatechange = function() {
        if (reqs.readyState == 4) {
            if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {

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


                document.getElementById("todaystats")
                    .innerHTML = '<table class="table table-striped"><thead><tr><th class="text-center">Shirts Sold</th><th class="text-center">Shirts Cancelled</th><th class="text-center">Revenue</th><th class="text-center">Royalties</th></tr></thead><tbody>' +
                    '<tr class="success text-center"><td><b>' + tots + '</b></td><td><b>' + totc + '</b></td><td><b>' + totrev.toFixed(2) + '</b></td><td><b>' + totroy.toFixed(2) + '</b></td></tr></tbody></table><br><button type="button" class="btn btn-success btn-block" id="refbutton">REFRESH</button>';

                var cp2 = '<h2>Shirts Sold:</h2><br>' +
                    '<table class="table table-striped"><thead><tr><th>#</th><th>Shirt Name</th><th class="text-center">Listing page</th><th class="text-center">Units Sold</th><th class="text-center">Units Cancelled</th><th class="text-center">Revenue</th><th class="text-center">Royalties</th><th class="text-center">Edit Shirt</th></tr></thead><tbody>';

                k = 0;

                for (var i = 0; i < ts.length; i++) {
                    if (ts[i].isParentAsin) {
                        k++;
                        cp2 += '<tr><th scope="row">' + k + '</th><td>' + ts[i].asinName + '</td><td class="text-center">' +
                            '<a target="_blank" href="https://www.amazon.com/dp/' + ts[i].id + '" class="btn btn-info">Preview</a>' +
                            '<td class="text-center">' + ts[i].unitsSold + '</td>' +
                            '<td class="text-center">' + ts[i].unitsCancelled + '</td>' +
                            '<td class="text-center">$' + ts[i].revenueValue + '</td>' +
                            '<td class="text-center">$' + ts[i].royaltyValue + '</td>' +
                            '<td class="text-center">' + '<a target="_blank" href="http://merch.amazon.com/merch-tshirt/title-setup/' + ts[i].merchandiseId + '/add_details" class="btn btn-info">Edit</a>' + '</td></tr>';
                    };

                }
                cp2 += '</tbody></table>';

                document.getElementById("shirtlist")
                    .innerHTML = cp2;
                $('#refbutton')
                    .on('click', function(e) {
                        location.reload();
                    })

            };

        };
    };

    reqs.send();
}




function fetchsales(count, m, salesData, cancelData, returnData, rev, roy, chlabel, ts, gendersArray, sizesArray, shirtColorsArray, nicheArray) {
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
					chrome.storage.sync.get(null, function(items) {
						var allValues = Object.values(items);
						
						for (i = 0; i < allValues.length; i++){
							allValues[i] =  JSON.parse(allValues[i]);
							allValues[i] = allValues[i]["niche"]
						}
						
						uniqueArray = allValues.filter(function(item, pos) {
							return allValues.indexOf(item) == pos;
						})

						//Init count to 0
						for (i = 0; i < uniqueArray.length; i++){
							nicheArray[uniqueArray[i]] = 0;
						}
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
								for (var key in nicheArray){
									if (key.toString() == shirtNiche){
										nicheArray[key] += 1;
									}
								}
								
								//console.log(nicheArray);

							});
							


						}else if (ts[i].isParentAsin == false) {
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

						

			
		
						//shirtNicheData = {}
						shirtNicheData.push(nicheArray);
						//console.log(shirtNicheData);
						

								
					
						chlabel.push(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.adjustDate(-count)
							.getUTCDay()
						]);
						rev.push(totalRevenue);
						roy.push(totalRoyalties);
						document.getElementById("twoweeksstats")
							.innerHTML = "<center><h3>Loading Day [" + (m - count) + "/" + m + "]</h3></center>";
							
						fetchsales(count - 1, m, salesData, cancelData, returnData, rev, roy, chlabel, ts, gendersData, sizesData, shirtColorsData, shirtNicheData);
						
					}, 200);
					

				
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
		chrome.storage.sync.get(null, function(items) {
			var allValues = Object.values(items);
			
			for (i = 0; i < allValues.length; i++){
				allValues[i] =  JSON.parse(allValues[i]);
				allValues[i] = allValues[i]["niche"]
			}
			
			uniqueArray = allValues.filter(function(item, pos) {
				return allValues.indexOf(item) == pos;
			})

			//Init count to 0
			for (i = 0; i < uniqueArray.length; i++){
				rnicheArray[uniqueArray[i]] = 0;
			}
		});
		
							
		setTimeout(function(){ 
			
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
			
			colorIndex = 0;
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
				
			var nicheChart = new Chart(document.getElementById("canvas6")
				.getContext("2d"))
			.Pie(lineChartData6);
			
			
			
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
					+ '</tr></thead><tbody>'
					+ '<tr class="success text-center"><td><b>' + unitsSold + '</b></td>'
					+ '<td><b>' + unitsCancelled + '</b></td>'
					+ '<td><b>' + rrev.toFixed(2) + '</b></td>'
					+ '<td><b>' + rRoyalties.toFixed(2) + '</b></td>'
					+ '<td><b>' + (rRoyalties /(unitsSold - unitsCancelled)).toFixed(2) + '</b></td>'
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
							saveNumberOfDays(numberOfDaysInput);
							location.reload();
						}
						
					} else{
						alert("Please complete field with a number");
					}
				})
				
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
								
								
								cp2 += '<tr><th scope="row">' + k + '</th><td>' + ts[i].asinName + '</td><td class="text-center">' +
									'<a target="_blank" href="https://www.amazon.com/dp/' + ts[i].id + '" class="btn btn-info">Preview</a>' +
									'<td class="text-center">' + ts[i].unitsSold + '</td>' +
									'<td class="text-center">' + ts[i].unitsCancelled + '</td>' +
									'<td class="text-center">$' + ts[i].revenueValue + '</td>' +
									'<td class="text-center">$' + ts[i].royaltyValue + '</td>' +
									'<td class="text-center">$' + avgSaleValue + '</td>' +
									'<td class="text-center">' + '<a target="_blank" href="http://merch.amazon.com/merch-tshirt/title-setup/' + ts[i].merchandiseId + '/add_details" class="btn btn-info">Edit</a>' + '</td></tr>';
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

							
					};

				};
			};

			reqs.send();
		}); //End of timer
	};
	
};



function twoweekssales() {

    document.head.innerHTML = "<head><style></style></head>"
			+ "<script src='tablesort.min.js'></script>"
			+ "<script src='tablesort.number.js'></script>";
			
			
	var style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = chrome.extension.getURL('css.css');
	//(document.head||document.documentElement).appendChild(style);


			
    var d = new Date();
    n = d.toString();
    document.body.innerHTML = '<body ><br><br><div class="container"><div class="panel panel-default"></center><div class="panel-body" id="twoweeksstats"><center><h3>Loading..</h3></center></div></div>' +
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
		' <div class="panel panel-default">    <div class="panel-heading">Niche Analysis</div>    <div class="panel-body">'+
			'<center>' +
				'<div class="canvas-wrapper" style="width: 100%;">'+
					'<canvas id="canvas6" height="350" width="280" style="padding:10px"></canvas>'+
					'<h3 class="canvas-title">Niche Distribution</h3>' +
				'</div>' +
			'</center>' +
		'</div> </div>' +
        '<br><div class="panel panel-default"><div class="panel-heading">Shirts Sold</div> <div class="panel-body" id="shirtlist"></div></div></div></body>';
	
	readNumberOfDays(function(number){	//Have to wrap everything in a callback	
		numberofDays = (typeof number === 'undefined') ? 14 : number; //Set default value if there's a problem
		
		
		
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
		
	});
	



};



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



function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

function merchmonthsall() {

    document.head.innerHTML = '<head><style></style></head>';
    var d = new Date();
    n = d.toString();
    document.body.innerHTML = '<body ><br><br><div class="container"><div class="panel panel-default"></center><div class="panel-body" id="twoweeksstats"><center><h3>Loading..</h3></center></div></div>' +
        ' <div class="panel panel-default">    <div class="panel-heading">Sales/Cancellations</div>    <div class="panel-body"><center><canvas id="canvas1" height="450" width="800" ></canvas></center></div> </div>' +
        ' <div class="panel panel-default">    <div class="panel-heading">Revenue/Royalties</div>    <div class="panel-body"><center><canvas id="canvas2" height="450" width="800" ></canvas></center></div> </div>' +
        '<br></div></body>';
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




function querryasins(myasins, p, l) {

    if (l != "null") {

        var mange1 = 'https://merch.amazon.com/merchandise/list?pageSize=100&pageNumber=' + p + '&statusFilters%5B%5D=LIVE&keywords=';
        var req1 = new XMLHttpRequest();
        req1.open("GET", mange1, true);
        req1.onreadystatechange = function() {
            if (req1.readyState == 4) {
                if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(req1.status) === -1) {
                    logincheck("merchallasins");
                } else {
                    var t1 = JSON.parse(req1.responseText);
                    az = t1.merchandiseList.length;
                    document.getElementById("status")
                        .innerHTML = "<b>" + t1.totalMerchandiseCount + " Live ASINs Found.</b>"
                    for (i = 0; i < az; i++) {
                        myasins.push(t1.merchandiseList[i].marketplaceAsinMap.US);
                    };
                    p += 1;
                    l = t1.nextPageCursor;
                    querryasins(myasins, p, l);

                }
            }
        }
        req1.send();

    } else {

        for (var i = 0; i < myasins.length; i++) {
            document.getElementById("asintxt")
                .value += myasins[i] + '\n';
        }
    }

};



function showallsins() {

    document.head.innerHTML = '<head><style></style></head>';
    document.body.innerHTML = '<body ><br><br><div class="container"><div class="panel panel-default"></center><div class="panel-body" id="status"><center><h3>Loading..</h3></center></div></div>' +
        ' <div class="panel panel-default">    <div class="panel-heading">Live ASINs</div>    <div class="panel-body"><div class="form-group"><br><textarea class="form-control" rows="20" id="asintxt" onclick="this.select()"></textarea> </div></div> </div>' +
        '<br></div></body>';
    document.title = "All ASINs - MerchTools ";
    document.body.style.backgroundColor = "#ecf1f2";

    myasins = [];
    p = 1;
    l = "notnull";
    querryasins(myasins, p, l);

};



function qe() {
    document.head.innerHTML = '<head><style></style></head><script src="jquery.js"></script>';

	bodyHTML = '<body ><br><div class="container"><br><div class="panel panel-default">';
	bodyHTML += '<div class="alert alert-success"><strong> Use  CTRL + F (PC) or ⌘ + F (MAC) to open the search bar.</strong>';
	bodyHTML +=		'<div class="btn btn-info" id="reset-button">Clear All Niche Data</div>'
	bodyHTML += '</div><div class="panel-body" id="shirtlist"></div></div></div></body>';
	
    document.body.innerHTML = bodyHTML
    document.title = "Quick Editor  - MerchTools ";
    document.body.style.backgroundColor = "#ecf1f2";  //"#D1F8CC";


    var sls = 'https://merch.amazon.com/merchandise/all';
    var reqs = new XMLHttpRequest();
    reqs.open("GET", sls, true);
    reqs.onreadystatechange = function() {
        if (reqs.readyState == 4) {
            if ([200, 201, 202, 203, 204, 205, 206, 207, 226].indexOf(reqs.status) === -1) {

            } else {
                var ts = JSON.parse(reqs.responseText);
                var cp2 = '<h2>Live Listings:</h2><br>' +
					'<div id="status"></div>' +
                    '<table class="table table-striped"><thead><tr><th>#</th><th>Title</th><th class="text-center">Listing page</th><th class="text-center">Niche</th><th class="text-center">Price</th><th class="text-center">Edit</th></tr></thead><tbody>';
                k = 0;
                for (var i = 0; i < ts.length; i++) {
                    k++;
                    cp2 += '<tr><th scope="row">' + k + '</th><td>' + ts[i].name + '</td><td class="text-center">' +
                        '<a target="_blank" href="https://www.amazon.com/dp/' + ts[i].marketplaceAsinMap.US + '" class="btn btn-info">Preview</a>' +
						'<td class="text-center">' +
							  '<input type="text" name="nicheName" class="niche-input"/>' +
							  '<input type="hidden" name="parentASIN" value='+ ts[i].marketplaceAsinMap.US + '>' +
							  '<input type="submit" value="Save" class="btn btn-info save"/>' +
						'</td>' +
                        '<td class="text-center">' + ts[i].listPrice + '</td>' +
                        '<td class="text-center">' + '<a target="_blank" href="http://merch.amazon.com/merch-tshirt/title-setup/' + ts[i].id + '/add_details" class="btn btn-info">Edit</a>' + '</td></tr>';
                }
                cp2 += '</tbody></table>';
                document.getElementById("shirtlist")
                    .innerHTML = cp2;
					
				initSaveButtons(); //initialize event listeners for buttons
            };

        };
    };

    reqs.send();


}



function logincheck(cmd) {

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
                        case "shirts":
                            shirtlister();
                            break;
                        case "twoweekssales":
                            twoweekssales();
                            break;
                        case "todaysales":
                            todayssales();
                            break;
                        case "merchall":
                            merchmonthsall();
                            break;
                        case "merchallasins":
                            showallsins();
                            break;
                        case "qe":
                            qe();
                            break;
                    };
                };
            };

        };
    };

    reqs.send();

};



var cmd = window.location.href;
if (cmd.indexOf("MerchToolsShirtsLister") !== -1) {
    logincheck("shirts");
};

if (cmd.indexOf("MerchToolsTodaySales") !== -1) {
    logincheck("todaysales");
};

if (cmd.indexOf("MerchToolsTwoWeeksSales") !== -1) {
    logincheck("twoweekssales");
};


if (cmd.indexOf("MerchToolsAllMonthsSales") !== -1) {
    logincheck("merchall");
};


if (cmd.indexOf("MerchToolsAllASINs") !== -1) {
    logincheck("merchallasins");
};


if (cmd.indexOf("MerchToolsEditor") !== -1) {
    logincheck("qe");
};

/************** Number of Days Entry ***********/
function saveNumberOfDays(number) {		
	//Assemble Stringified JSON	
	var key = "numberOfDays";
	var data = number;
    var jsonfile = {};
	
    jsonfile[key] = data;
	
	// Save it using the Chrome extension storage API.	
    chrome.storage.sync.set(jsonfile, function () {
        console.log('Saved', key, data);
    });
}

function readNumberOfDays(callback){		
	var myKey = "numberOfDays";
	
	chrome.storage.sync.get(myKey, function(items) {
		if (typeof(items[myKey]) != 'undefined'){			
			callback(items[myKey]);
		}
	});
	
}



/**************** Niche Storage ****************/
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
			}
		});
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
		});
			
		//Listener for reset button
		document.getElementById('reset-button').addEventListener("click", function(){clearAllNicheData();}, false);
		
		
		readShirtNiche();		
	})
}

































