var pinnedPages = [],
currentPage = [],
spacesinTitle = 0;

chrome.storage.sync.get('pinnedPages', function(result) {pinnedPages = result.pinnedPages;});

//create menu item on right clicks on links
chrome.contextMenus.create({
    "title": "Add to LaterList",
    "contexts": ["link"],
    "id": "right click"
  });

//event listener for menu link has been right clicked  
chrome.contextMenus.onClicked.addListener(function(info) {
	//variables to set from link that has been clicked
	var url = info.linkUrl,
	title = info.selectionText,
	timeAdded = new Date().getTime();
	//get current pinned pages
	chrome.storage.sync.get('pinnedPages', function(result) {pinnedPages = result.pinnedPages;});
	
	//look at each character of links title
	for (var i = 0; i < title.length; i++) {
		//if theres a space count it
		if (title.charAt(i) == " ") {
				spacesinTitle += 1;
		}
		//run this on the last character of the title
		if (i == title.length - 1) {
			//if there are 3 or less spaces
			if (spacesinTitle <= 3) {
				//allow users to create their own title
				var newTitle = prompt("Add your own page title below.");
				if (newTitle != null) {
					addRightClickToGoogle(newTitle, url, timeAdded);
				}
			} else {
				//if above 3 spaces use title from link
				addRightClickToGoogle(title, url, timeAdded);
			}
			//reset spaces count variable
			spacesinTitle = 0;
		}
	}
	
});

function addRightClickToGoogle(title, url, time) {
	console.log("title is: "+title+", linked to: "+url+" and added at: "+time);
	//add all details to currentPage var
	currentPage = [title, url, time];
	//if undefined make total saved pages equal current page else add current page to saved pages
	if (pinnedPages == undefined){
		pinnedPages = [currentPage];
	} else {
		pinnedPages.unshift(currentPage);
	}
	
	//set new saved pages array to google storage
	chrome.storage.sync.set({'pinnedPages' : pinnedPages}, function() {
    console.log('Settings saved');
    linkSaved = true;
	});
}