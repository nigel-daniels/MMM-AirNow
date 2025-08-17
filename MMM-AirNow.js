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
        this.url = 'https://www.airnowapi.org/aq/observation/zipCode/current/?format=application/json&zipCode=' + this.config.zip_code + '&distance=25&API_KEY=' + this.config.api_key;
        this.location = '';
        this.result = null;

        // Schedule the first update with a small delay to ensure everything is initialized
        var self = this;
        setTimeout(function() {
            Log.log('MMM-AirNow: Starting initial data fetch');
            self.getAirQualityData(self);
        }, 1000);
        },


    getStyles: function() {
        return ['airnow.css', 'font-awesome.css'];
        },


    getAirQualityData: function(that) {
        // Make the initial request to the helper then set up the timer to perform the updates
        Log.log('MMM-AirNow sending GET-AIR-QUALITY with URL:', that.url);
        that.sendSocketNotification('GET-AIR-QUALITY', that.url);
        setTimeout(that.getAirQualityData, that.config.interval, that);
        },



    getDom: function() {
        // Set up the local wrapper
        var wrapper = null;

        // If we have some data to display then build the results table
        if (this.loaded) {
            wrapper = document.createElement('div');
            wrapper.className = 'airnow bright small updated';

            // Location header with icon
            airLocation = document.createElement('div');
            airLocation.className = 'airLocation';
            airLocation.innerHTML = '<i class="fa fa-map-marker airIcon"></i>' + this.location;

            airDetails = document.createElement('table');

            if (this.result !== null) {
                // Build the air quality details
                for (var i=0; i < this.result.length; i++) {

                    var colourClass = '';
                    var catName = '';
                    var icon = '';

                    switch (this.result[i].Category.Number) {
                        case 1:
                            colourClass = 'good';
                            catName = 'Good';
                            icon = 'fa-check-circle';
                            break;
                        case 2:
                            colourClass = 'moderate';
                            catName = 'Moderate';
                            icon = 'fa-minus-circle';
                            break;
                        case 3:
                            colourClass = 'sensitive';
                            catName = 'Sensitive Groups';
                            icon = 'fa-exclamation-triangle';
                            break;
                        case 4:
                            colourClass = 'unhealthy';
                            catName = 'Unhealthy';
                            icon = 'fa-exclamation-circle';
                            break;
                        case 5:
                            colourClass = 'v_unhealthy';
                            catName = 'Very Unhealthy';
                            icon = 'fa-exclamation-circle';
                            break;
                        case 6:
                            colourClass = 'hazardous';
                            catName = 'Hazardous';
                            icon = 'fa-times-circle';
                            break;
                        }

                    airRow = document.createElement('tr');
                    airRow.className = colourClass;

                    // Parameter with icon
                    airParameter = document.createElement('td');
                    airParameter.className = 'airParameter normal';
                    var paramIcon = this.getParameterIcon(this.result[i].ParameterName);
                    var displayName = this.result[i].ParameterName === 'O3' ? 'OZONE' : this.result[i].ParameterName;
                    airParameter.innerHTML = '<i class="fa ' + paramIcon + ' airIcon"></i>' + displayName;

                    // AQI value with visual bar
                    airAQI = document.createElement('td');
                    airAQI.className = 'airAQI normal';
                    var aqiValue = this.result[i].AQI;
                    var aqiPercent = Math.min((aqiValue / 300) * 100, 100); // Cap at 300 for visualization
                    airAQI.innerHTML = aqiValue + 
                        '<div class="airAQIBar">' +
                        '<div class="airAQIBarFill ' + colourClass + '" style="width: ' + aqiPercent + '%;"></div>' +
                        '</div>';

                    // Category name with status icon
                    airName = document.createElement('td');
                    airName.className ='airName ' + colourClass;
                    airName.innerHTML = '<i class="fa ' + icon + '"></i> ' + catName;

                    airRow.appendChild(airParameter);
                    airRow.appendChild(airAQI);
                    airRow.appendChild(airName);

                    airDetails.appendChild(airRow);
                    }
                }

            // Add elements to the wrapper div
            wrapper.appendChild(airLocation);
            wrapper.appendChild(airDetails);
        } else {
            // Otherwise lets just use a simple div with loading animation
            wrapper = document.createElement('div');
            wrapper.className = 'airnow bright';
            wrapper.innerHTML = '<i class="fa fa-spinner fa-pulse"></i> Loading air quality data...';
            }

        return wrapper;
        },

    getParameterIcon: function(parameter) {
        // Return appropriate icon for each pollutant type
        switch(parameter) {
            case 'PM2.5':
                return 'fa-circle';  // Small dot for fine particles
            case 'PM10':
                return 'fa-circle-o';  // Larger circle for coarse particles
            case 'O3':
            case 'OZONE':
                return 'fa-sun-o';
            case 'NO2':
            case 'SO2':
            case 'CO':
                return 'fa-industry';
            default:
                return 'fa-flask';
        }
    },


    socketNotificationReceived: function(notification, payload) {
        Log.log('MMM-AirNow received notification:', notification);
        if (notification === 'GOT-AIR-QUALITY') {
            Log.log('MMM-AirNow payload URL:', payload.url);
            Log.log('MMM-AirNow module URL:', this.url);
            Log.log('MMM-AirNow URLs match:', payload.url === this.url);
            
            // check to see if the response was for us and used the same url
            if (payload.url === this.url) {
                // we got some data so set the flag, stash the data to display then request the dom update
                Log.log('MMM-AirNow updating with location:', payload.location);
                this.loaded = true;
                this.location = payload.location;
                this.result = payload.result;
                this.updateDom(1000);
            } else {
                Log.log('MMM-AirNow URL mismatch - ignoring notification');
            }
        }
    }
    });
