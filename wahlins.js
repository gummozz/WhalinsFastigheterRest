const request = require('request');
const cheerio = require('cheerio');
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

app.use((request, response, next) => {
    console.log(request.headers)
    next()
})




function getData() {

    global.appartmentDataArray = {};

    request('https://wahlinfastigheter.se/ledigaobjekt/', function(error, response, html){ 

        if (!error && response.statusCode == 200) {
            const $ = cheerio.load(html);

            $('.col-xs-12.col-sm-12.col-md-4.col-lg-3.sidemeny a').each( function(i, el) {

                if ($(el).attr('title')) {

                    const link = $(el)
                    .attr('href')
                    .replace(/\s\s+/g, '');
                    //console.log(link);

                    request('https://wahlinfastigheter.se' + link, function (error, response, html) {
                        if (!error && response.statusCode == 200) {

                            const $ = cheerio.load(html);
                            
                            $('.col-xs-12.col-sm-12.col-md-8.col-lg-9.subpage-content a').each( function(i, el) {

                                if ($(el).attr('title')) {

                                    const link = $(el)
                                    .attr('href')
                                    .replace(/\s\s+/g, '');

                                    const title = $(el)
                                    .attr('title')
                                    .replace(/\s\s+/g, '');

                                    //console.log(title);

                                    request('https://wahlinfastigheter.se' + link, function (error, response, html) {

                                        if (!error && response.statusCode == 200) {
                                            const $ = cheerio.load(html);

                                            $('.fastighet .block.purple-bg h2').each( function (i, el) {

                                                h2title = $(el)
                                                .text()
                                                .replace(/.*\|\s/g, '');

                                                //console.log('\n' + h2title + '\n');

                                            })

                                            var leftArray = []
                                            var rightArray = []
                                            $('ul.infolistafastighet li').each(function(i, el) {
                                                var elText = $(el)
                                                .text()
                                                .replace(/\s\s+/g, '')
                                                .trim();
                                                if ($(el).attr('class') == 'left' && elText != null ) {
                                                    leftArray.push(elText);
                                                    //console.log(elText);
                                                };
                                                if ($(el).attr('class') == 'right' && elText != null ) {
                                                    rightArray.push(elText);
                                                    //console.log(elText);
                                                };
                                            });


                                            function assign(obj, keyPath, value) {
                                                lastKeyIndex = keyPath.length-1;
                                                for (var i = 0; i < lastKeyIndex; ++ i) {
                                                key = keyPath[i];
                                                if (!(key in obj))
                                                    obj[key] = {}
                                                obj = obj[key];
                                                }
                                                obj[keyPath[lastKeyIndex]] = value;
                                            }
                                            
                                            
                                            //global.appartmentData = {};

                                            for (i = 0; i < leftArray.length; i++) {
                                                assign(appartmentDataArray, [h2title, leftArray[i]], rightArray[i]);
                                            }
                                            //console.log(appartmentData);
                                            //global.appartmentDataArray.push(global.appartmentData)

                                            
                                        }
                                    }); // end inner inner request
                                }
                            })
                        }
                    }); // end inner request

                }

            })

        }

    }); // end outer request

}
//getData();
setTimeout(getData, 3000);
app.get('/', (request, response) => {

    response.json(global.appartmentDataArray);

})

app.get('/getnewdata', (request, response) => {
    console.log('Fetching new data...');
    setTimeout(getData, 3000);
    console.log('Got new data!');
    console.log(global.appartmentDataArray);
    response.json(global.appartmentDataArray);
})

app.listen(3000);