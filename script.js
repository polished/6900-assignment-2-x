console.log('Manipulating data, this time with nest')

d3.csv('./data/hubway_trips_reduced.csv',parse,dataLoaded);

function dataLoaded(err,rows){

    //Step 1: start with the basics: nest, or group, trips with the same starting stations
    //Using d3.nest()...entries()
    console.log("Step 1: start with the basics: nest, or group, trips with the same starting station using d3.nest()...entries()");
    var tripsByStartStation = d3.nest()
            .key(function(d){return d.startStation;})
            .entries(rows);
    console.log(tripsByStartStation);
    //Step 2: do the same as above, but instead of .entries(), use .map()
    //How does this compare?
    console.log("Step 2: do the same as above, but instead of .entries(), use .map()");
    var tripsByStartStationMap = d3.nest()
        .key(function(d){return d.startStation;})
        .map(rows, d3.map);
    console.log(tripsByStartStationMap);
    console.log("The difference is that now keys correspond to stations numbers - this is a much more useful solution");
    //Step 3: simple two level nest
    //Nest trips with the same starting stations
    //Under each station, further nest trips into two groups: those by registered vs. casual users
    //Hint: casual users are those with no birth date, gender, or zip code information
    console.log("Step 3: simple two level nest");
    var tripsByStartStationAndSubscriber = d3.nest()
        .key(function(d){return d.startStation;})
        .key(function(d){return d.subscriber;})
        .map(rows, d3.map);
    console.log(tripsByStartStationAndSubscriber);

    //Step 4: simple two level nest
    //Same as above, but instead of returning nested trips as sub-arrays, return two numbers:
    //total count of registered trips, vs. casual trips
    console.log("Step 4: Two level nest + reduce");
    var tripsByStartStationAndSubscriberRollup = d3.nest()
        .key(function(d){return d.startStation;})
        .key(function(d){return d.subscriber;})
        .rollup(function(leaves){return leaves.length;})
        .map(rows, d3.map);
    console.log(tripsByStartStationAndSubscriberRollup);


    //Step 5: group trips with the same starting stations, BUT only for 2012
    //Do this without crossfilter
    //Hint: first you have to use array.filter() to reduce all trips to a smaller subset
    //Then you nest the smaller array
    console.log("Step 5: Nest, but only for 2012");
    var data2012 = rows.filter(function(d){return d.startTime.getFullYear() == 2012;});
    var tripsByStartStationIn2012 = d3.nest()
        .key(function(d){return d.startStation;})
        .entries(data2012);
    console.log(tripsByStartStationIn2012);
    //Step 6: do the same, but with crossfilter
    //How does this compare to step 5?
    console.log("Step 6: Group, but only for 2012");
    var allTrips = crossfilter(rows);
    var tripsByYear = allTrips.dimension(function (d) {
        return d.startTime.getFullYear();
    });
    tripsByYear.filter(2012);
    var tripsByStartStationCF = allTrips.dimension(function (d) {
        return d.startStation;
    });
    var tripsByStartStationGrouped = tripsByStartStationCF.group(function (d) {
        return d;
    });
    console.log(tripsByStartStationGrouped.all());
    console.log("What is the difference? d3.nest returns all of the observations per group while crossfilter only returns the count");
}

function parse(d){
    if(+d.duration<0) return;

    return {
        duration: +d.duration,
        startTime: parseDate(d.start_date),
        endTime: parseDate(d.end_date),
        startStation: d.strt_statn,
        endStation: d.end_statn,
        userAge: d.birth_date?parseDate(d.start_date).getFullYear()- (+d.birth_date):0,
        gender:d.gender? d.gender:"Unknown",
        subscriber: d.subsc_type
    }
}

function parseDate(date){
    var day = date.split(' ')[0].split('/'),
        time = date.split(' ')[1].split(':');

    return new Date(+day[2],+day[0]-1, +day[1], +time[0], +time[1]);
}

