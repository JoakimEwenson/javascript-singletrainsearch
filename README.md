# Search single train data from Trafikverket Open API
Author: Joakim Ewenson <joakim@ewenson.se>
Date: 2018-06-05
Updated: 2019-06-15

### Disclaimer
This is my first attempt at creating something for uploading to GitHub. This is also my first serious attempt at doing something somewhat usefull in JavaScript/JQuery. Please do keep that in mind when viewing this code.

### Updated
New updated version of this to support the new API version 2 and schema 1.5 for TrainAnnouncement. This includes more data and better information. Still no proper error handling though...

## Licensed under MIT license
Copyright 2019 Joakim Ewenson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Description
This is a JavaScript/JQuery example of getting data regarding a single train from the Trafikverket Open API located at <https://api.trafikinfo.trafikverket.se/>. You will need a API key from them to use this.

The script/page also use W3 CSS for styling and JQuery throughout the script.

This script will get you data for a single trains schedule, it's current state and deviations. The text in the HTML file is written in Swedish as the data that comes from the API is in Swedish, ment for use in Sweden.

## Known problems
This is not a proper, clean and best practice use of JavaScript/JQuery but more of a quick hack to test things out. It lacks proper error handling among other things. It is in nowhere a complete solution and is still a work in progress.


## Got feedback?
Please be kind and helpful...
