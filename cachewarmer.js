/**
 * 
 * CacheWarmer is built on the concept of using browser idleness as a playground
 * to pre-fetch and cache resources that users will be needing later.

 * It is a JavaScript utility to pre-fetch and cache resources/data on the 
 * client side or execute JavaScript functions in small periodic chunks 
 * without penalizing UI responsiveness or user interactions (similar to webwrokers, 
 * but work in all browsers). This will be extremely useful for applications to 
 * retrieve data before hand and respond immediately when data is requested. 

 * Typical use cases would be pre-fetching JS/CSS resources which will be required
 * for upcoming pages or other on-demand  functionalities, data that needs to be 
 * fetched (through AJAX etc.) based on user actions, messages in email applications
 * etc.

 * The key challenge here is the single threaded nature of JavaScript in which the
 * same thread is shared between UI rendering and interactions. The CacheWarmer 
 * utility simulates a multi-threaded browser environment using simple timeout
 * techniques and assures the UI thread is properly shared between user 
 * interactions & warmup and hence making the browser always responsive.

 * Functions in CacheWarmer are triggered only when an idle check passes and this
 * idle check function is abstracted out in the utility to be overridden by the 
 * implementing application (as the perception of idleness is different for  
 * different applications).

 * The CacheWarmer has 3 default properties which can be overridden by the 
 * application
 * 1. timeout - 50 ms, all function in CacheWarmer queue are time sliced with 50ms
 * 			    intervals
 * 2. isIdle - Abstract function which always returns true, needs to be overridden
 * 		       by the implementer
 * 3. iterations - 2, the max number of iterations the utility will try if isIdle 
 * 			       function returns false 
 *
 * NOTE: The CacheWarmer is no guaranteed to run always. When the idle check fails 
 * over all iterations then the cachewarmer will be stopped and queue cleared
 *
 * @Class CacheWarmer
 * @singleton
 * 
 */
var CacheWarmer = function() {
	var queue = [], 
		isRunning,
		isPaused;

	return {
	    /**
	     * The main execution engine of the cachewarmer, recursively calls itself 
	     * and schedules tasks based on the provided timeouts. Scheduling happens
	     * sequenctially so the queue order is maintianed. 
	     *
	     * @method _execute
	     * @private
	     */		
		_execute: function() {
			// Initial checks 
			// Empty queue or paused state return immediately
			if(!queue.length || isPaused) {
				isRunning = 0; // Reset the running status
				return;
			}
			
			var t = this, // Local reference
				cbObj = queue[0], // Retrieving callback object from top of queue
				timeout = cbObj.timeout || t.defaults.timeout, // Deciding the time interval
				isIdle = cbObj.isIdle || t.defaults.isIdle, // Deciding the idle function
				refId; // Reference ID of timeout
			
			// Overriding iterations attribute in callback object itself
			cbObj.iterations = cbObj.iterations || t.defaults.iterations;
			
			refId = setTimeout(function() {
						// Clear the timeout first
						clearTimeout(refId);
						// Checking for paused state again
						if(!isPaused) { 
							if(isIdle()) { // Check for idleness
								// Shift queue
								queue.shift();
								// execute callback
								cbObj.callback && cbObj.callback();
								// call the _execute function recursively
								t._execute();
							} else if(--cbObj.iterations > 0) { // Check if iterations left
								// Continue executing the queue at the same position
								t._execute();
							} else { // Browser not idle & iterations ran out
								// Stop the queue
								t.stop();
							}
						}
					}, timeout);				
		},
		
	    /**
	     * Default properties of CacheWarmer
	     * Application can override it as required
	     *
	     * @Object defaults
	     * @public
	     */			
		defaults: {
		    /**
		     * 50 ms, all function in CacheWarmer queue are time sliced with 50ms
		     * intervals
		     *
		     * @int timeout
		     * @public
		     */
			timeout      : 50,
		    /**
		     * Abstract function which always returns true, needs to be overridden
		     * by the implementer
		     *
		     * @function timeout
		     * @public
		     * @Abstract
		     */
			isIdle		 : function() {
				return 1;
			},
		    /**
		     * 2, the max number of iterations the utility will try if isIdle 
		     * function returns false 
		     *
		     * @int iterations
		     * @public
		     */
			iterations   : 2
		},

	    /**
	     * Add any number of callbacks to the end of the queue. Callbacks may be
	     * provided as functions or objects.
	     *
	     * @method add
	     * @param callback* {Function|Object} 0..n callbacks
	     * @public
	     */		
		add: function() {
			var i=0, args=arguments, l=args.length, obj;
			if(!l) {
				return;
			}
			for(; i<l; i++) {
				// Convert to object type if argument is a function
				obj = typeof (obj = args[i]) === 'function'? {callback: obj}: obj;
				// Adding to queue
				queue.push(obj);
			}
		},

	    /**
	     * Sets the CacheWarmer in motion.  All queued callbacks will be executed 
	     * in order with the defaulted or overriden timeout intervals.
	     *
	     * @method run
	     * @public
	     */		
		run: function() {
			// Reset paused status
			isPaused = 0;
			// If already running just exit
			if(isRunning) {
				return;
			}
			// Set running flag
			isRunning = 1;
			// Call execute
			this._execute();
		},
		
	    /**
	     * Stop and clear the queue immediately.
	     *
	     * @method stop
	     * @public
	     */		
		stop: function() {
			// Pause and clear the queue
			this.pause();
			queue = [];
		},
		
	    /**
	     * Pause the execution of the cachewarmer. Paused queue can be
	     * restarted with q.run(), which resumes from the next callback
	     * in queue.
	     *
	     * @method pause
	     * @public
	     */		
		pause: function() {
			isPaused = 1;
			isRunning = 0;
		},
		
	    /**
	     * Returns the live CacheWarmer queue size.
	     *
	     * @method getQueueSize
	     * @return int
	     * @public
	     */		
		getQueueSize: function() {
			return queue.length;
		}
	};
}();