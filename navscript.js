var checkExist = setInterval(function() {
   if (document.querySelectorAll('#sidebar ul a').length) {
		var location = window.location.pathname;

		var sidebarLinks = document.querySelectorAll('#sidebar ul a');

		for(i = 0; i < sidebarLinks.length; i++) {
		   element = sidebarLinks[i];
		   	   
		   if (element.getAttribute("href") == location) {
			   element.parentElement.className += "active";
			   element.parentElement.setAttribute("style", "display: block;");
		   }
		}

		clearInterval(checkExist);
   }
}, 100); // check every 100ms



