// Saves options to chrome.storage
function save_options() {
	var ntsound = document.getElementById('sound').value;
	var likesColor = document.getElementById('like').checked;
	
	console.log();
	
	chrome.storage.sync.set({
			nsound: ntsound,
			likesColor: likesColor
		}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
	chrome.storage.sync.get({
		nsound: 'on',
		likesColor: true
		
	}, function(items) {
		document.getElementById('sound').value = items.nsound;
		document.getElementById('like').checked = items.likesColor;
	});
}


document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save-settings').addEventListener('click', save_options);