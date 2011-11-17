/**
 * 
 * The Worker file to do all resource fetching jobs without affecting the page
 * UI responsiveness.
 * 
 * Replace the DO SOMETHING below, with the resource fetching logic to handle 
 * all cachewarmer calls
 * 
 */
onmessage = function(event) {
	// If data is present in request then do something
	if(event.data) {
		try{
			// DO SOMETHING
		} catch(e) {
			throw {message: "unknown error"};
		}
	}
	postMessage("success");
};