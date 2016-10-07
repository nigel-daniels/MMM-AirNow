# MMM-AirNow
This is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror/tree/develop). This module shows air quality based on the US AirNow API.

## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/nigel-daniels/MMM-AirNow`.  A new folder `MMM-AirNow` will appear.

## Config
The entry in `config.js` can include the following options:

|Option|Description|
|---|---|
|`api_key`|**Required** This is the API key you need to use to request Air Quality Index (AQI) data from the AirNow site.  To request an API key visit the AirNow API site [here](https://docs.airnowapi.org/account/request/)<br><br>**Type:** `string`<br>**Default Value:** `null`|
|`zip_code`|**Required** The US location about which you are requesting AQI data.<br><br>**Type:** `string`<br>**Default value:** `null`|
|`interval`|How often the weather is updated.<br><br>**Type:** `integer`<br>**Default value:** `900000 // 15 minutes`|

Here is an example of an entry in `config.js`
```
{
    module:		'MMM-AirNow',
    position:	'top_left',
    classes:	'dimmed medium',
    config:		{
                api_key:	'xxxxxxxxxxxx',
                zip_code:	'95110'
                }
},
```

## Dependencies
- [request](https://www.npmjs.com/package/request) (installed via `npm install`)

## Notes
Enjoy this module it's a port of one I had in a home-brew mirror project I had prior to moving to using MM2.

## Thanks To...
- [Michael Teeuw](https://github.com/MichMich) for the [MagicMirror2](https://github.com/MichMich/MagicMirror/tree/develop) framework that made this module possible.
- [Sam Lewis](https://github.com/SamLewis0602) whose [MMM-Traffic](https://github.com/SamLewis0602/MMM-Traffic) module I use and whose code I learnt a great deal from.
- [AirNow API Site](https://docs.airnowapi.org) for the helpful guides and information they publish on their APIs.
