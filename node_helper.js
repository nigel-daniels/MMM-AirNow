/* Magic Mirror Module: MMM-AirNow helper
 * Version: 1.0.0
 *
 * By Nigel Daniels https://github.com/nigel-daniels/
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({

    start: function () {
        console.log('MMM-AirNow helper, started...');

        // Set up the local values
        this.location = '';
        this.result = null;
        },


    getAirQualityData: function(payload) {

        var that = this;
        this.url = payload;
        console.log('MMM-AirNow helper received URL:', this.url);

        request({url: this.url, method: 'GET'}, function(error, response, body) {
            console.log('MMM-AirNow helper API response status:', response ? response.statusCode : 'no response');
            
            // Check to see if we are error free and got an OK response
            if (!error && response.statusCode == 200) {
                try {
                    // Lets convert the body into JSON
                    var result = JSON.parse(body);
                    console.log('MMM-AirNow helper parsed', result.length, 'results');
                    
                    if (result && result.length > 0 && result[0].ReportingArea) {
                        // Let's get the air quality data
                        that.location = result[0].ReportingArea;
                        that.result = result;
                        console.log('MMM-AirNow helper location:', that.location);
                    } else {
                        console.log('MMM-AirNow helper: Invalid data structure');
                        that.location = 'No data available';
                        that.result = null;
                    }
                } catch (parseError) {
                    console.log('MMM-AirNow helper: Error parsing JSON -', parseError.message);
                    that.location = 'Error parsing data';
                    that.result = null;
                }
            } else {
                // In all other cases it's some other error
                console.log('MMM-AirNow helper: API error -', error || 'Status ' + response.statusCode);
                that.location = 'Error getting data';
                that.result = null;
            }

            // We have the response figured out so lets fire off the notification
            console.log('MMM-AirNow helper sending GOT-AIR-QUALITY with URL:', that.url);
            that.sendSocketNotification('GOT-AIR-QUALITY', {'url': that.url, 'location': that.location, 'result': that.result});
        });
    },


    socketNotificationReceived: function(notification, payload) {
        console.log('MMM-AirNow helper received notification:', notification);
        // Check this is for us and if it is let's get the weather data
        if (notification === 'GET-AIR-QUALITY') {
            console.log('MMM-AirNow helper processing GET-AIR-QUALITY');
            this.getAirQualityData(payload);
        }
    }

    });
