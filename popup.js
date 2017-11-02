document.addEventListener("DOMContentLoaded", function(event) {
	document.querySelector("#goToMA").onclick = function() {
		gotodaysales();
		return false;
	};
});

function gotodaysales(info, tab) {
	l2 = "https://merch.amazon.com/MerchAnalyticsDailySales";
	chrome.tabs.create({ url: l2 });
};
