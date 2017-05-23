var pinnedPages = [],
currentPage = [],
daysSaved,
daysMilli,
linkSaved = false;

//init function-----------------------------------------------------------------------------
window.onload = function(){
	
	//get users setting for after how many days to delete pages
	chrome.storage.sync.get('daysSaved', function(result) {
		daysSaved = result.daysSaved;
		if(result.daysSaved != undefined) {
			document.getElementsByTagName("select")[0].value = result.daysSaved;
		} else {
			daysSaved = 1;
		}
		
		//set milliseconds of days saved
		switch (parseInt(daysSaved)) {
			case 1:
				daysMilli = 86400000;
			  console.log("1 day");
			  break;
			case 2:
				daysMilli = 86400000*2;
			  console.log("2 day");
			  break;
			case 3:
				daysMilli = 86400000*3;
			  console.log("3 day");
			  break;
			case 4:
				daysMilli = 86400000*4;
			  console.log("4 day");
			  break;
			case 5:
				daysMilli = 86400000*5;
			  console.log("5 day");
			  break;
			case 6:
				daysMilli = 86400000*6;
			  console.log("6 day");
			  break;
			case 7:
				daysMilli = 86400000*7;
			  console.log("7 day");
			  break;
			default:
			console.log("nothing");
		}
		
		/*//set milliseconds of 30 seconds saved
		switch (parseInt(daysSaved)) {
			case 1:
				daysMilli = 30000;
			  console.log("1 day");
			  break;
			case 2:
				daysMilli = 30000*2;
			  console.log("2 day");
			  break;
			case 3:
				daysMilli = 30000*3;
			  console.log("3 day");
			  break;
			case 4:
				daysMilli = 30000*4;
			  console.log("4 day");
			  break;
			case 5:
				daysMilli = 30000*5;
			  console.log("5 day");
			  break;
			case 6:
				daysMilli = 30000*6;
			  console.log("6 day");
			  break;
			case 7:
				daysMilli = 30000*7;
			  console.log("7 day");
			  break;
			default:
			console.log("nothing");
		}*/
	});

	chrome.storage.sync.get('pinnedPages', function(result) {

	    pinnedPages = result.pinnedPages;
	    
	    //if array isnt empty display links in a list
	    if (pinnedPages == undefined || pinnedPages.length == 0) {
			document.getElementById("pinnedPages").innerHTML +=
				"<center><p> You havn't saved any pages yet.</p></center>";
		} else {
			
			//do this stuff for each array entry
			for(var i = 0; i < pinnedPages.length; i++) {
			
				if (new Date().getTime() > pinnedPages[i][2] + daysMilli) {
					//edit pinnedpages margin
					document.getElementById("pinnedPages").style.margin = "0 0 0 0";
					//visable html on show
					document.getElementById("deletedPages").innerHTML +=
					'<p><a href="' + pinnedPages[i][1] + '"> ' + pinnedPages[i][0] + ' </a></p>';
					//delete entry from pinned pages
					pinnedPages.splice(i,1);
					chrome.storage.sync.set({'pinnedPages' : pinnedPages}, function() {console.log("set");});
				} else {
					//visable html on show
					document.getElementById("pinnedPages").innerHTML +=
				'<p><a href="' + pinnedPages[i][1] + '"> ' + pinnedPages[i][0] + ' </a><button class="deleteBtn" type="button">delete</button><input type="hidden" value="'+i+'" /></p>';
				}
				
			}
		}
		
		//click saved links and start openUrl() ----------------------------
		var aTags = document.getElementsByTagName('a');
		for(var i = 0; i < aTags.length; i++) {
			aTags[i].onclick = function (click) {
				openUrl(click.srcElement.href);
			}
		}
		
		//click delete buttons ---------------------------------------------
		//find all delete buttons
		var deletion = document.getElementsByClassName('deleteBtn');
		//get the certain button
		for(var i = 0; i < deletion.length; i++) {
			deletion[i].onclick = function (click) {
				//variable holding the order number of the button
				var pageOrder = click.srcElement.parentNode.getElementsByTagName("input")[0].value;
				//remove associated page from array
				pinnedPages.splice(pageOrder,1);
				//make link display.none
				click.srcElement.parentNode.style.display="none";
				//save edited list in google storage
				chrome.storage.sync.set({'pinnedPages' : pinnedPages}, function() {
					console.log("set");
				});
			}
		}
    
	});
	
	//allow buttons to be clicked
	clickingButtons();
	
}

//function that allows buttons to be clicked ------------------------------------------------
function clickingButtons() {

	//when button is clicked, run function to add to array
	document.getElementById("pinLink").onclick = function() {
		//start getCurrentTab function
		if (!linkSaved) {	
			getCurrentTab();
		}
		document.getElementById('pinLink').style.background='#9DCE5B';
		document.getElementById('pinLink').innerHTML = "page saved!";
		if (pinnedPages == undefined) {
			document.getElementById("pinnedPages").innerHTML = "";
		}
	};
	
	//show delete buttons
	document.getElementById("showDelete").onclick = function(click) {
		var deleteBtns = document.getElementsByClassName('deleteBtn');
		for (var i = 0; i < deleteBtns.length; i++) {
			deleteBtns[i].style.width = (deleteBtns[i].style.width != '100px' ? '100px' : '0' );
		}
	};
	
	//set amount of days to save on select tag change -------------------
	document.getElementsByTagName("select")[0].onchange = function () {
		daysSaved = document.getElementsByTagName("select")[0].value;
		chrome.storage.sync.set({'daysSaved' : daysSaved}, function() {
		console.log('Settings saved');
		});
	}
	
	//clear google storage
	document.getElementById("clear").onclick = function() {
		chrome.storage.sync.clear(function() {console.log('storage cleared');});
	};

}

//create new tab for linked url--------------------------------------------------------------
function openUrl(theUrl) {
		
		//open new tab of clicked url (theUrl)
		chrome.tabs.create({
		url: theUrl,
		active: true
		}, function() {});
}

//find the name and title of currently active tab--------------------------------------------
function getCurrentTab() {
	
	//Get currently open tab
	chrome.tabs.query({
		active: true,
		windowId: window.WINDOW_ID_CURRENT
		}, function(tabsArray) {
	
			var tabUrl = tabsArray[0].url,
			tabTitle = tabsArray[0].title,
			timeAdded = new Date().getTime();
			//24 hours is 86400000 milliseconds
			
			//start function thats adds to storage
			addUrlToGoogleSync(tabTitle, tabUrl, timeAdded);
	
		});
}

//add the current tab to the array ----------------------------------------------------------
function addUrlToGoogleSync(title, url, time) {
	
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