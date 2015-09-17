(function(){

    window.theboardUtils = {

        messages:{
            error: {

            }
        },

        handleError: function( err ){
            document.body.innerHTML = '<div class="widget-error">Widget on error!</div>';
            console.error( err );
        },

        /**
         * Be careful to not refresh page when removing hash
         */
        resetSignal: function(){
            window.location.hash = '#';
        },

        /**
         *
         * - take care of eventual hash and ignore it
         * @returns {Array}
         */
        getUrlVars: function(){
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

            // remove eventual hash
            var indexOfLastHash = hashes[hashes.length -1].lastIndexOf('#');
            indexOfLastHash = (indexOfLastHash > -1) ? indexOfLastHash : hashes[hashes.length -1].length; // -1 means the were no hash
            hashes[hashes.length -1] = hashes[hashes.length -1].substring(0, indexOfLastHash); // take all string or only good part

            for(var i = 0; i < hashes.length; i++)
            {
                hash = hashes[i].split('='); // get var name and its value into array
                // only continue if a var has a value
                if( hash.length > 1 ){
                    vars.push(hash[0]);
                    // URI.js use encodeURIComponent
                    // I don't know why but (+) are not decoded in ' ' as it should ?
                    vars[hash[0]] = decodeURIComponent(hash[1].replace('+', ' '));
                }
            }
            // remove hash for last if there is
            var hashToRemove = window.location.hash;
            if(hashToRemove){
                for( var i = 0 ; i<vars.length ; i++){
                    vars[vars[i]] = vars[vars[i]].replace( window.location.hash, '');
                }
            }
            return vars;
        },

        checkValidityOfJsonFromUrl: function(jsonToParse){
            try{
                return JSON.parse(jsonToParse);
            }
            catch(e){
                return false;
            }
        },

        convertUnixTsToDate: function( unixTS ){
            // create a new javascript Date object based on the timestamp
            // multiplied by 1000 so that the argument is in milliseconds, not seconds
            var date = new Date(unixTS*1000);
            return date;
        }

    }

})();
(function(){
    var configHelper = function(){

        var utils = window.theboardUtils;

        this.loadWidgetConfiguration = function(providedWidgetConfig){
console.log(providedWidgetConfig);
            // ===============
            // Some init
            // widgetConfiguration is an object that can be create by widget creator to
            // overwrite some settings
            // ===============
            if( providedWidgetConfig && typeof providedWidgetConfig === 'object'){
                //console.log('Substitute configuration provided by user. Use it instead of default library configuration!');
                if( providedWidgetConfig.widget && providedWidgetConfig.widget.configuration){
                    var testWidgetProvided = providedWidgetConfig.widget;
                    return testWidgetProvided.configuration;
                }
            }
            else{
                console.log('No substitute configuration provided by user. Use default library configuration!');
            }

            // ===============
            // STEP 1
            // ===============
            // Get eventual settings from application
            // The first run a settings object may be passed by application
            var tmp = utils.getUrlVars();

            if( !tmp.widget){
                throw new Error("No widget configuration specified into URL");
            }
            if( ! utils.checkValidityOfJsonFromUrl( tmp.widget )){
                throw new Error("Please specify a valid widget configuration");
            }
            return JSON.parse(tmp.widget);
        }
    };

    // export
    window.configHelper = new configHelper();
})();
var test = function(){

};
(function(){

    'use strict';

    var self = this;
    var VERSION = '0.0.1';
    var SERVER_URL = 'http://localhost:1337';
    var SIGNALS = {
        INIT: 'init',
        REFRESH: 'refresh',
        STOP: 'stop',
        START: 'start'
    };
    var configHelper = window.configHelper;
    var utils = window.theboardUtils;

    var Module = function(){

        var self = this;

        // Handle hash change
        // Needed to fire widget important events
        document.addEventListener('widget.hash.received', onHashReceived, false);

        this.start = function(widgetConfig){
            _init(widgetConfig);
        };

        function _init(widgetConfig){

            // Intercept first window load
            // Send the first signal event
            if(window.location.hash){
                document.dispatchEvent(
                    new Event('widget.hash.received')
                );
            }

            // Set the handler listener for future hash change
            window.onhashchange = function(){
                // Check hash
                if(window.location.hash == null || window.location.hash == ''){
                    return;
                }
                document.dispatchEvent(
                    new Event('widget.hash.received')
                );
            };

            // Prepare configuration for the widget
            // the config is loaded from url and created as an object
            var configuration = configHelper.loadWidgetConfiguration(widgetConfig);

            console.debug('module trigger widget.ready with', configuration);
            document.dispatchEvent(
                new CustomEvent('widget.ready', {detail: configuration })
            );
        };

        function onHashReceived(e){
            // Received hash is an stringified object
            // #(obj)
            var hash = window.location.hash.substring(1);
            var hashObject = JSON.parse( decodeURIComponent(hash));

            // When refresh signal is received
            // Send refresh event to widget
            if( hashObject.signal === SIGNALS.REFRESH  ){
                utils.resetSignal();
                document.dispatchEvent(
                    new Event('widget.refresh')
                );
            }

            // Fire event refresh when signal received
            if( hashObject.signal === SIGNALS.STOP  ){
                utils.resetSignal();
                document.dispatchEvent(
                    new Event('widget.stop')
                );
            }

            if( hashObject.signal === SIGNALS.START  ){
                utils.resetSignal();
                document.dispatchEvent(
                    new Event('widget.start')
                );
            }
        }
    };

    // Export
    window.theBoardModule = new Module();

}).call(this);