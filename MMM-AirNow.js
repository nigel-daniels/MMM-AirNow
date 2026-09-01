/* Magic Mirror Module: MMM-AirNow
 * Version: 1.0.0
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * MIT Licensed.
 */

Module.register('MMM-AirNow', {

    defaults: {
            api_key:    '',
            zip_code:   '',
            interval:   900000 // Every 15 mins
        },


    start:  function() {
        Log.log('Starting module: ' + this.name);

        // Set up the local values, here we construct the request url to use
        this.loaded = false;
		this.url = 'https://www.airnowapi.org/aq/observation/current/ziplatLong/?format=application/json&zipCode=' + this.config.zip_code + '&API_KEY=' + this.config.api_key;
        this.location = '';
        this.result = null;

        // Trigger the first request
        this.getAirQualityData(this);
        },


    getStyles: function() {
        return ['airnow.css', 'font-awesome.css'];
        },


    getAirQualityData: function(that) {
        // Make the initial request to the helper then set up the timer to perform the updates
        that.sendSocketNotification('GET-AIR-QUALITY', that.url);
        setTimeout(that.getAirQualityData, that.config.interval, that);
        },


    getDom: function() {
        // Set up the local wrapper
        var wrapper = null;

        // If we have some data to display then build the results table
        if (this.loaded) {
            wrapper = document.createElement('div');
		    wrapper.className = 'airnow bright small';

            airLocation = document.createElement('div');
            airLocation.className = 'airLocation';
            airLocation.innerHTML = this.location;

            airDetails = document.createElement('table');

            if (this.result !== null) {
                // Build the air quality details
                for (var i=0; i < this.result.length; i++) {

                    var colourClass = '';
                    var catName = '';

                    switch (this.result[i].aqiCategoryName) {
                        case 'Good':
                            colourClass = 'good';
                            catName = 'Good';
                            break;
                        case 'Moderate':
                            colourClass = 'moderate';
                            catName = 'Moderate';
                            break;
                        case 'Unhealthy for Sensitive Groups':
                            colourClass = 'sensitive';
                            catName = 'Unhealthy for Sensitive Groups';
                            break;
                        case 'Unhealthy':
                            colourClass = 'unhealthy';
                            catName = 'Unhealthy';
                            break;
                        case 'Very Unhealthy':
                            colourClass = 'v_unhealthy';
                            catName = 'Very Unhealthy';
                            break;
                        case 'Hazardous':
                            colourClass = 'hazardous';
                            catName = 'Hazardous';
                            break;
						default:
							colorClass = 'unavailable';
							catName = 'Unavailable';
							break;
                        }

                    airRow = document.createElement('tr');
                    airRow.className = colourClass;

                    airParameter = document.createElement('td');
                    airParameter.className = 'airParameter normal';
					airParameter.innerHTML = this.result[i].parameterName;

                    airAQI = document.createElement('td');
                    airAQI.className = 'airAQI normal';
                    airAQI.innerHTML = this.result[i].nowcastAQI;

                    airName = document.createElement('td');
                    airName.className ='airName ' + colourClass;
                    airName.innerHTML = catName;

                    airRow.appendChild(airParameter);
                    airRow.appendChild(airAQI);
                    airRow.appendChild(airName);

                    airDetails.appendChild(airRow);
                    }
                }

            // Add elements to the now div
            wrapper.appendChild(airLocation);
            wrapper.appendChild(airDetails);
        } else {
            // Otherwise lets just use a simple div
            wrapper = document.createElement('div');
            wrapper.innerHTML = 'Loading air quality data...';
            }

        return wrapper;
        },


    socketNotificationReceived: function(notification, payload) {
        // check to see if the response was for us and used the same url
        if (notification === 'GOT-AIR-QUALITY' && payload.url === this.url) {
                // we got some data so set the flag, stash the data to display then request the dom update
                this.loaded = true;
                this.location = payload.location;
                this.result = payload.result;
                this.updateDom(1000);
            }
        }
    });
