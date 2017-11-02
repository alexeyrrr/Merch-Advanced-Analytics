document.addEventListener("DOMContentLoaded", function(event) {
	document.querySelector("#goToMA").onclick = function() {
		gotoMerchAnalytics();
		return false;
	};
});

function gotoMerchAnalytics(info, tab) {
	l2 = "https://merch.amazon.com/MerchAnalytics";
	chrome.tabs.create({ url: l2 });
};
