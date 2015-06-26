# CacheWarmer
CacheWarmer is built on the concept of using browser idleness as a playground
to pre-fetch and cache resources that users will be needing later. If browser
supports Web Workers then a worker thread is spawned which takes care of all
the resource caching. 

It is a JavaScript utility to pre-fetch and cache resources/data on the 
client side or execute JavaScript functions in small periodic chunks 
without penalizing UI responsiveness or user interactions (similar to webwrokers, 
but work in all browsers). This will be extremely useful for applications to 
retrieve data before hand and respond immediately when data is requested. 

Typical use cases would be pre-fetching JS/CSS resources which will be required
for upcoming pages or other on-demand  functionalities, data that needs to be 
fetched (through AJAX etc.) based on user actions, messages in email applications
etc.

The key challenge here is the single threaded nature of JavaScript in which the
same thread is shared between UI rendering and interactions. The CacheWarmer 
utility simulates a multi-threaded browser environment using simple timeout
techniques and assures the UI thread is properly shared between user 
interactions & warmup and hence making the browser always responsive.

 CacheWarmer also detects the availabilty of Web Workers and uses a worker thread
 to achieve JS multi-threading without interfering with UI responsiveness. With 
 more browsers supporting workers that would be an ideal elegant solution going
 forward. Please refer to webworker.js for more details.

Functions in CacheWarmer are triggered only when an idle check passes and this
idle check function is abstracted out in the utility to be overridden by the 
implementing application (as the perception of idleness is different for  
different applications).

The CacheWarmer has 3 default properties which can be overridden by the 
application

1. `timeout` - 50 ms, all function in CacheWarmer queue are time sliced with 50ms
			 intervals
2. `isIdle` - Abstract function which always returns true, needs to be overridden
		    by the implementer
3. `iterations` - 2, the max number of iterations the utility will try if isIdle 
			    function returns false
4. `avoidWorker` - false, Flag to indicate that Web Workers should NOT be used

## Usage
The complete usage and demostration of cachewarmer is illustrated in 
dashboard.html (https://github.com/senthilp/cachewarmer/blob/master/dashboard.html).
It also provides an interactive tool to play arround the utility

## Notes
1. CacheWarmer is loosely based on YUI Async Queue http://developer.yahoo.com/yui/3/async-queue/
2. Webworkers support is TODO action item in the utility
3. The CacheWarmer is no guaranteed to run always. When the idle check fails over all iterations 
   then the cachewarmer will be stopped and queue cleared

 
