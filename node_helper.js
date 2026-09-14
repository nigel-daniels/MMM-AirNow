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

        request({url: this.url, method: 'GET'}, function(error, response, body) {
            var result = null;
            
            // Check to see if we are error free and got an OK response
            if (!error && response && response.statusCode == 200) {
                try {
                    // Lets convert the body into JSON
                    result = JSON.parse(body);
                    
                    if (result && result.WebServiceError && Array.isArray(result.WebServiceError) && result.WebServiceError.length > 0) {
                        // Handle API-reported error gracefully (e.g. no observations found for zip)
                        that.location = result.WebServiceError[0].Message;
                        that.result = null;
                    } else if (result && Array.isArray(result) && result.length > 0) {
                        var firstItem = result[0];
                        if (firstItem.reportingAreaName || firstItem.ReportingArea) {
                            that.location = firstItem.reportingAreaName || firstItem.ReportingArea;
                            that.result = result;
                        } else {
                            that.location = 'No observations available';
                            that.result = null;
                        }
                    } else if (result && (result.reportingAreaName || result.ReportingArea)) {
                        that.location = result.reportingAreaName || result.ReportingArea;
                        that.result = result;
                    } else {
                        // Truly invalid format or empty response
                        console.error('MMM-AirNow received invalid structure:', body);
                        that.location = 'No observations available';
                        that.result = null;
                    }
                } catch (e) {
                    console.error('MMM-AirNow JSON parse error:', e);
                    that.location = 'Error parsing data';
                    that.result = null;
                }
            } else {
                // In all other cases it's some other error
                console.error('MMM-AirNow network error:', error || (response ? response.statusCode : 'no response'));
                that.location = 'Error getting data';
                that.result = null;
            }

            // We have the response figured out so lets fire off the notification
            that.sendSocketNotification('GOT-AIR-QUALITY', {'url': that.url, 'location': that.location, 'result': that.result});
            });
        },


    socketNotificationReceived: function(notification, payload) {
        // Check this is for us and if it is let's get the weather data
        if (notification === 'GET-AIR-QUALITY') {
            this.getAirQualityData(payload);
            }
        }

    });

