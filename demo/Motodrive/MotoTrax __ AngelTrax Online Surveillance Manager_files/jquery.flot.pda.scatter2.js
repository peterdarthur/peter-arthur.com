// http://jsfiddle.net/f8kk6h1L/ ============================== HTML to PDF
var urls = {
    // DATASETS: '/behavior_reports/data',
    // GETALERTS: '/behavior_reports/behavior_events/',
    // GETDAILYTREND: '/behavior_reports/vehicles/',
    // SCORELOGS: '/behavior_reports/score_logs'
    // ...... demo ......
    DATASETS: 'demoData/datasets1.json',
    GETALERTS: 'demoData/behavior_events.json', //alerts_1monthB.json',
    GETDAILYTREND: 'demoData/ind_daily.json',
    SCORELOGS: 'javascripts/score_logs.json'
};

$.get(urls.DATASETS, loadData);

// ^\s*(?!//\s)console.log     \t\t\t\t// console.log

function loadData(datasets) { // wraps everything
    // // console.log("running loadData()");

    "use strict";
	// console.log(datasets);
    var scatterData = [],
        thisGroup, // currently selected group
        thisIndividual = "",
        vehicleID, // currently selected individual
        xmax,
        datePickerID,
        monthsAgo = 0,
        periodNav = 1,
        scatterFitted = false,
        s;

    //PLOT OPTIONS
    var soptions = {

        legend: { show: false },
        axisLabels: { show: true },  // https://github.com/markrcote/flot-axislabels
        xaxes: [{ axisLabel: 'Distracted Driving' }],
        yaxes: [{ position: 'left', axisLabel: 'Aggressive Driving' }],            // end axislabels
        series: {
            grid: {},
            points: { radius: 3, show: true, fill: true, lineWidth: 12 }//,// 3 6 // fillColor would not cooperate in jquery.flot.threshold.above.js - the only way to change the fill is to increase the stroke enough to cover the white (default) fill.
        },
        xaxis: { min: 0, max: 10, ticks: 10 },
        yaxis: { min: 0, max: 10, ticks: 10 },
        grid: { hoverable: true, clickable: true, mouseActiveRadius: 15 },
        margin: { top: 50, right: 0, left: 0, bottom: 0 }
    };

    var xAvg = datasets.score_distracted[datasets.score_distracted.length - periodNav];
    var yAvg = datasets.score_aggressive[datasets.score_aggressive.length - periodNav];
    var avgLineType = "Fleet";

    var xAvgLinePos = 0,
        yAvgLinePos = 0,
        itemIDs = [];

    var clearSoptions = {
            legend: { show: false },
            axisLabels: { show: false },  // https://github.com/markrcote/flot-axislabels
            xaxes: [{ axisLabel: '' }],
            yaxes: [{ axisLabel: '' }],            // end axislabels
            series: {
                grid: {},
                points: { radius: 3, show: false, fill: false, lineWidth: 12 }//,// 3 6 // fillColor would not cooperate in jquery.flot.threshold.above.js - the only way to change the fill is to increase the stroke enough to cover the white (default) fill.
            },
            xaxis: { min: 0, max: 10, ticks: 0 },
            yaxis: { min: 0, max: 10, ticks: 0 },
            grid: { hoverable: false, clickable: false, mouseActiveRadius: 15 },
            margin: { top: 50, right: 0, left: 0, bottom: 0 }
    };

    // $("#splaceholder").bind("plothover", createScatterPlotHoverCallback);
    // $("#splaceholder").bind("plothover", createHoverBarGraphCallback(thisGroup, thisIndividual, ID));



    // ................................................ BEGIN individual BAR CHART .....................................................

    var byticks = [[0, ''],[2,''],[4,''],[6,''],[8,''],[10,''],[11,''],[13,'']];
    var bytickNames = [[0, 'Road Alerts'],[1.2,'Speed'],[3.2,'Compound'],[5.4,'Acceleration'],[7.4,'Right Turn'], [9.4,'Left Turn'], [11.4,'Braking']];
    var bxticks = [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"], [6, "6"], [7, "7"], [8, "8"], [9, "9"], [10, "10"]];

    var barColorIndiv = "#376DA4"; // rgba(70, 130, 180, 1) - blue      rgba(255, 211, 75, 0.8) -yellow
    var barColorIndivSevere = "#962627";  //rgba(200, 20, 20, 0.9) - bright red      rgba(32, 178, 170, 1) - aqua/green


    var boptions = {

        legend: {show: true},
        series: {grid: {}, highlightColor: 'rgba(255, 255, 255, 0.5)', stack: 0}, // color: default stroke color, default - (use boptions.colors instead)  highlightColor: hover color, doesn't affect legend colors
        bars: {
            show: true,
            lineWidth: 0,
            horizontal: true,
            fillColor: "rgba(0,0,0,0.2)", // default bar color, unless specified in data (barData.push())
            barWidth: 0.7,
            showNumbers: false, // jquery.flot.barnumbers.js
            numbers : {
                yAlign: function(y) { return y + 1; }, // jquery.flot.barnumbers.js
                xAlign: function(x) { return x + 0.5; } // jquery.flot.barnumbers.js
            }
        },
        colors: [barColorIndiv, barColorIndivSevere],
        xaxis: { min: 0, max: 10, autoscaleMargin: 0.5, ticks: bxticks},
        yaxis: { min: -0.3, max: 14.3, tickLength: 0, ticks: byticks, font: {size: 12, lineHeight: 13, weight: "bold", family: "Helvetica, Arial, Tahoma, sans-serif", color: "#545454"}}, //position: "right"
        grid: {hoverable: true, clickable: false, mouseActiveRadius: 5, labelMargin: 20}
    };

    // var barplot;


    // ................................................ BEGIN TREND LINE .....................................................

    var numTick = [],
        monthTick = 0,
        monthTicks = [],

        monthName = "",
        monthNameList = [],
        lplot = "",
        previousPoint = null,
        previousSeries = null,
        dataToPlot = [],
        allOrOne = "all",

        // Gap objects
        currFleetAggrGaps = {},
        currFleetDistrGaps = {},
        currFleetSpeedGaps = {},
        currFleetRoadGaps = {},
        currFleetCompdGaps = {},

        currFleetAggrGapsData = {},
        currFleetDistrGapsData = {},
        currFleetSpeedGapsData = {},
        currFleetRoadGapsData = {},
        currFleetCompdGapsData = {};

        // console.log("allOrOne is all by default");


    var lineGraphOptions = {
        legend: { show: false },
        axisLabels: { show: true },  // https://github.com/markrcote/flot-axislabels
        xaxes: [{ axisLabel: 'Date' }],  //
        yaxes: [{ position: 'left', axisLabel: 'Score' }],  //
        lines: { show: true },
        xaxis: { min: 0, max: xmax, mode: null, ticks: numTick },
        yaxis: { min: 0, max: 10 },
        series: { points: { radius: 1.3, show: true, fill: true, lineWidth: 2.8 } },
        grid: { hoverable: true, autoHighlight: false, mouseActiveRadius: 30 },
        multihighlight: { mode: 'x' }
    };

    // months for line graph
    for (var i = 0; i < datasets.score_aggressive.length; i++) {

        // ticks
        monthTick = moment().subtract(datasets.score_aggressive.length - 1 - i, 'months').format('MMM');
        monthTicks.push([i, monthTick + " "]); // [[0, "Aug"], ... added a space because IE9 and FF(PC) cut the current month tickLabel slightly

        // hover data
        monthName = moment().subtract(datasets.score_aggressive.length - 1 - i, 'months').format("MMMM YYYY");
        monthNameList.push(monthName); // ["August 2015", ... ]
    }


    var infractionsObj = {
        "trigger_collision": "Collision",
        "trigger_speeding": "Speeding",
        "fundamentals_following": "Following too closely",
        "fundamentals_traffic": "Traffic violation",
        "fundamentals_speed": "Unsafe speed",
        "fundamentals_lane": "Poor lane selection",
        "fundamentals_blind_spot": "In another’s blind spot",
        "fundamentals_leave_out": "Failure to leave an out",
        "fundamentals_stop": "Failure to stop",
        "fundamentals_yield": "Failure to yield",
        "fundamentals_passing": "Unsafe passing",
        "fundamentals_backing": "Unsafe backing",
        "fundamentals_signals": "Failure to use signals",
        "equipment_driverview": "Obstructed view of driver",
        "equipment_tamper": "Tampering / Abusing equipment",
        "equipment_exteriorview": "Obstructed exterior view",
        "equipment_panic": "Overuse of panic button",
        "risky_seatbelt_driver": "Driver seatbelt unbelted",
        "risky_seatbelt_passenger": "Passenger seatbelt unbelted",
        "risky_aggressive": "Aggressive behavior or driving",
        "awareness_scan_road": "Not scanning roadway",
        "awareness_blind_spots": "Not checking blind spots",
        "awareness_mirrors": "Not checking mirrors",
        "awareness_scan_intersection": "Not scanning intersection",
        "awareness_autopilot": "Autopilot, stare",
        "awareness_fatigue": "Fatigue or eyes closed",
        "distractions_phone_handsfree": "Mobile phone - hands free",
        "distractions_phone_hand": "Mobile phone - in hand",
        "distractions_food": "Food or beverage",
        "distractions_map": "Manifest, map or navigation",
        "distractions_hygiene": "Smoking or Personal Hygiene",
        "distractions_passengers": "Passenger(s)",
        "distractions_audio": "Loud Audio"
    };



    // ................................................ DROPDOWNS ................................................


    function periodDropdownPopulate() {
				// console.log("running periodDropdownPopulate()");

                $("#periods option").remove();
                $("#periods").append('<option id="period-all" value="all" name="all">All Months</option>');

                // for each month of data received
                $.each(datasets.score_aggressive, function(key, val) {
                    var value = key + 1;
                    $("#periods").append('<option id="period-'+value+'" value="'+value+'" name="'+value+'">' + moment().subtract(key, 'months').format("MMMM YYYY") + '</option>');
                });
                $("#periods [name='1']").prop('selected', true); // show current month as "selected" in dropdown (dropdown is not changed to affect the page, only initialized with this option selected)
    }

    $("#periods").change(function () {
        		// console.log("changed period");

                if ($(this).val() !== "all"){ // if a month is selected as period
                  periodNav = parseInt($(this).val());
                  monthsAgo = periodNav - 1;
                  allOrOne = "all"; // (trendselector)

                } else { // if "All" is selected as period
                  periodNav = "all";
                  monthsAgo = "all";
                  allOrOne = "all"; // (trendselector)
                }

                $('#choices').change();
    });

    function dropdownSortedPopulate(item, parentGroupID, listOf) {
        		// console.log("running dropdownSortedPopulate()");
                // DROPDOWN RESET AND ADD FLEET ---------
                $("#choices option").remove();
                $("#choices").append('<option id="fleet" value="Fleet" name="fleet">Fleet</option>');
                $("#choices").append('<option class="select-dash" disabled="disabled">----</option>');

                // DROPDOWN POPULATE WITH GROUPS ONLY---------
                if (listOf !== "Vehicle") {

                    $.each(item, function (key, val) {
                        $("#choices").append('<option class="group" name="' + val.id + '" value="' + val.id + '">' + val.name + '</option>');
                    });
                    // DROPDOWN POPULATE WITH GROUPS AND INDIVIDUALS ---------
                } else {
        				// console.log("populating groups and individuals right here right now, line 959");
                    $.each(datasets.groups, function (key, val) {
                        $("#choices").append('<option class="group" name="' + val.id + '" value="' + val.id + '">' + val.label + '</option>');
                    });

                    $("#choices").append('<option class="select-dash" disabled="disabled">----</option>');

                    $.each(item, function (bkey, bval) {
                        $("#choices").append('<option name="' + parentGroupID + '" value="' + bval.id + '">' + bval.name + '</option>');
        				// console.log(bval.id);
                    });

                    $("#choices").val(parentGroupID);     //keep current group selected in dropdown after sort


                }
    }


    // ................................................ INITIAL + HELPERS ................................................


    function insertTitles(h1, leftAveragesTitle, leftChartOrBarTitle, scatterTitle, trendsTitle) {
				// console.log("running insertTitles()");
                $("h1").html(h1);

                $(".mw-averages-title").html(leftAveragesTitle);
                $(".list-title").html(leftChartOrBarTitle);
                $(".sp-title").html(scatterTitle);

                $("#trendLine .title").html(trendsTitle);
    }

    function subtabs(currentTab) {
				// console.log("running subtabs()");

                // initial load, and when switching between fleet/group/vehicle
                if (currentTab == "scores") {
                  $(".tab-scores").click();
                } else if (currentTab == "alerts") {
                  $(".tab-alerts").click();
                } else if (currentTab == "trends") {
                  $(".tab-trends").click();
                } else if (currentTab == "reports") {
                  $(".tab-reports").click();
                } else if (currentTab == "scorelog") {
                  $(".tab-scorelog").click();
                }

                // "scores" tab page elements
                $(".tab-scores").unbind("click");
                $(".tab-scores").click(tabScores);

                // "alerts" tab page elements
                $(".tab-alerts").unbind("click");
                $(".tab-alerts").click(tabAlerts);

                // "trends" tab page elements
                $(".tab-trends").unbind("click");
                $(".tab-trends").click(tabTrends);

                // "reports" tab page elements
                $(".tab-reports").unbind("click");
                $(".tab-reports").click(tabReports);

                // "score log" tab page elements
                $(".tab-scorelog").unbind("click");
                $(".tab-scorelog").click(tabScoreLog);
    }

    function tabScores() {
				// console.log("running tabScores()");

                $(".header-bar").removeClass("print-hidden");
                $(".header-bar-nav").removeClass("print-hidden");
                $(".viewTabs > div").removeClass("active-tab");
                $(".tab-scores").addClass("active-tab");

                $(".dash-left-col").css("display", "block");
                $(".dash-right-col").css("display", "block");

                $("#behaviorEvents").css("display", "none");
                $("#print-alert").css("display","none");
                $("#trendLine").css("display", "none");
                $("#lplaceholder").css("display", "none");
                $("#reports-container").css("display", "none");
                $("#score-log").css("display", "none");

                currentTab = "scores";

                $("#periods").removeAttr("disabled");

                // if fleet or group
                if (viewType == "fleet" || viewType == "group"){
                    s.draw();
                }
    }

    function tabAlerts() {
				// console.log("running tabAlerts()");

                $(".header-bar").addClass("print-hidden");
                $(".header-bar-nav").addClass("print-hidden");
                $(".viewTabs > div").removeClass("active-tab");
                $(".tab-alerts").addClass("active-tab");

                $(".dash-left-col").css("display", "none");
                $(".dash-right-col").css("display", "none");

                $("#behaviorEvents").css("display", "block");
                $("#print-alert").css("display","none");

                $("#trendLine").css("display", "none");
                $("#lplaceholder").css("display", "none");
                $("#reports-container").css("display", "none");
                $("#score-log").css("display", "none");

                currentTab = "alerts";

                $("#periods").removeAttr("disabled");

                datePickerID = "#alerts-date-picker";
                setDatePickerDefaultDates(datePickerID);
    }

    function tabTrends() {
				// console.log("running tabTrends()");

                $(".header-bar").removeClass("print-hidden");
                $(".header-bar-nav").removeClass("print-hidden");
                $(".viewTabs > div").removeClass("active-tab");
                $(".tab-trends").addClass("active-tab");

                $(".dash-left-col").css("display", "none");
                $(".dash-right-col").css("display", "none");
                $("#behaviorEvents").css("display", "none");
                $("#print-alert").css("display","none");

                $("#trendLine").css("display", "block");
                $("#lplaceholder").css("display", "block");

                $("#reports-container").css("display", "none");
                $("#score-log").css("display", "none");

                currentTab = "trends";
                lplot.draw();
				// console.log("lplot drawn tab");
                coachedLabelClickable();

                // if fleet or group
                if (viewType == "fleet" || viewType == "group"){
                    $("#periods").attr("disabled","disabled");
                    $(".indiv-trend-type").css("display", "none");

                // if individual
                } else {
                    $("#periods").removeAttr("disabled");
                    $(".indiv-trend-type").css("display", "block");
                }
    }

    function tabReports() {
				// console.log("running tabReports()");

                $(".header-bar").addClass("print-hidden");
                $(".header-bar-nav").addClass("print-hidden");
                $(".viewTabs > div").removeClass("active-tab");
                $(".tab-reports").addClass("active-tab");

                $(".dash-left-col").css("display", "none");
                $(".dash-right-col").css("display", "none");
                $("#behaviorEvents").css("display", "none");
                $("#print-alert").css("display","none");
                $("#trendLine").css("display", "none");
                $("#lplaceholder").css("display", "none");

                $("#reports-container").css("display", "block");
                $(".print-page-btn").removeClass("screen-hidden");

                $("#score-log").css("display", "none");

                currentTab = "reports";

                // if fleet
                if (viewType == "fleet") {
                    $("#periods").removeAttr("disabled");
                    $(".fleet-report-type").css("display", "block");
                    $(".group-report-type").css("display", "none");
                    $(".indiv-report-type").css("display", "none");

                // if group
                } else if (viewType == "group") {
                    $("#periods").removeAttr("disabled");
                    $(".fleet-report-type").css("display", "none");
                    $(".group-report-type").css("display", "block");
                    $(".indiv-report-type").css("display", "none");

                // if individual
                } else {
                    $("#periods").removeAttr("disabled");
                    $(".fleet-report-type").css("display", "none");
                    $(".group-report-type").css("display", "none");
                    $(".indiv-report-type").css("display", "block");
                }

                // CSV export
                // http://jsfiddle.net/terryyounghk/kpegu/
                $(".exportTableCSV").unbind("click");
                $(".exportTableCSV").click(function(event) {
                    exportTableToCSV.apply(this, [$('#reports-container table'), 'report.csv']);
                });
    }

    function tabScoreLog() {
				// console.log("running tabScoreLog()");

                $(".header-bar").addClass("print-hidden");
                $(".header-bar-nav").addClass("print-hidden");
                $(".viewTabs > div").removeClass("active-tab");
                $(".tab-scorelog").addClass("active-tab");

                $(".dash-left-col").css("display", "none");
                $(".dash-right-col").css("display", "none");
                $("#behaviorEvents").css("display", "none");
                $("#print-alert").css("display","none");
                $("#trendLine").css("display", "none");
                $("#lplaceholder").css("display", "none");
                $("#reports-container").css("display", "none");
                $(".print-page-btn").addClass("screen-hidden");

                $("#score-log").css("display", "block");

                currentTab = "scorelog";
                $("#periods").removeAttr("disabled");

                datePickerID = "#scorelog-date-picker";
                setDatePickerDefaultDates(datePickerID);

                // CSV export
                // http://jsfiddle.net/terryyounghk/kpegu/
                $(".exportTableCSV").unbind("click");
                $(".exportTableCSV").click(function(event) {
                    exportTableToCSV.apply(this, [$('#score-log table'), 'report.csv']);
                });
    }

    function numberWithCommas(x) {
                var parts = x.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join(".");
    }

    function getDriveTime(thisDrives) {
				// console.log("running getDriveTime()");

                var thisDrivesCurrent;
                if (monthsAgo == "all") {
                  thisDrivesCurrent = thisDrives;
                } else {
                  thisDrivesCurrent = thisDrives[thisDrives.length - periodNav];
                }

                var driveTimeHours = moment.duration(thisDrivesCurrent, "seconds").format("h", 1);
                var driveTimeHourLabel = "[hours]";
                if (driveTimeHours == 1) { driveTimeHourLabel = "[hour]"; }

                var driveTimeHuman = moment.duration(thisDrivesCurrent, "seconds").format("h " + driveTimeHourLabel, 1);
                return driveTimeHuman;
    }

    function showTooltip(x, y, contents, tooltipName) {
				// console.log("running showTooltip()");

                $("<div id='" + tooltipName + "'>" + contents + "</div>").css({
                    position: "absolute",
                    top: y + 5,
                    left: x + 5,
                    padding: "0px 8px 0px 8px",
                    "background-color": "rgba(255, 255, 255, 1)",
                    opacity: 0.9,
                    "white-space": "nowrap"
                }).appendTo("#behavior-page").fadeIn(200);
    }

    function isNumeric(value) {
            return /^\d+$/.test(value);
    }

    function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function exportTableToCSV($table, fileName) {
                // my working version: http://jsfiddle.net/KPEGU/4205/  from original: http://jsfiddle.net/terryyounghk/kpegu/
				        // console.log($table);

                var $rows = $table.find('tr:has(td)'),

                // Temporary delimiter characters to avoid accidentally splitting the actual contents
                tmpColDelim = String.fromCharCode(11), // vertical tab character
                tmpRowDelim = String.fromCharCode(0), // null character

                // actual delimiter characters for CSV format
                colDelim = ',',
                rowDelim = '\r\n',

                // Grab text from table into CSV formatted string
                csv = $rows.map(function(i, row) {
                  var $row = $(row),
                    $cols = $row.find('td');

                  return $cols.map(function(j, col) {
                    var $col = $(col),
                      text = '="'+$col.text()+'"'; // to make dates interpret literally in excel
                    return text.replace(/"/g, '"'); // escape double quotes

                  }).get().join(tmpColDelim);

                }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim);

                // IE9+ support - using new tab or iframe to set up file
                // new tab -- http://code.ciphertrick.com/2014/12/07/download-json-data-in-csv-format-cross-browser-support/
                // iframe --- https://github.com/angular-ui/ui-grid/issues/2312#issuecomment-70348120
                // note: ieblob only works in IE10+ --- https://github.com/mholt/PapaParse/issues/175#issuecomment-75597039

                if(msieversion()){
                      var frame = document.createElement('iframe');
                      document.body.appendChild(frame);

                      frame.contentWindow.document.open("text/html", "replace");
                      frame.contentWindow.document.write('sep=,\r\n' + csv);
                      frame.contentWindow.document.close();
                      frame.contentWindow.focus();
                      frame.contentWindow.document.execCommand('SaveAs', true, fileName);

                      document.body.removeChild(frame);
                      return true;

                } else {
                    var uri = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
                    $(this).attr({
                        'download': fileName,
                        'href': uri,
                        'target': '_blank'
                    });
                }
    }

    function msieversion() {
                var ua = window.navigator.userAgent;
                var msie = ua.indexOf("MSIE ");
                if (msie != -1 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer, return version number
                {
                  return true;
                } else { // If another browser,
                  return false;
                }
                  return false;
    }

    function setDatePickerDefaultDates(){
				// console.log("running setDatePickerDefaultDates");

                var start_date, end_date;

                if(monthsAgo === 'all') {
                     start_date = moment().subtract(datasets.score_aggressive.length-1, "months").format('YYYY-MM-DD');
                } else {
                    start_date = moment().subtract(monthsAgo, "months").startOf("month").format('YYYY-MM-DD');
                }

                if(monthsAgo === 'all') {
                    end_date =  moment().endOf("month").format('YYYY-MM-DD');
                } else if (monthsAgo === 0) {
                    end_date = moment().format('YYYY-MM-DD');
                } else {
                    end_date = moment().subtract(monthsAgo, "months").endOf("month").format('YYYY-MM-DD');
                }

                // set date picker values
                var datePickerStart = moment(start_date, "YYYY-MM-DD").format("MM/DD/YYYY");
                var datePickerEnd = moment(end_date, "YYYY-MM-DD").format("MM/DD/YYYY");

                return {"startSlashes": datePickerStart, "endSlashes": datePickerEnd, "startDashes": start_date, "endDashes": end_date};
    }

    function runDatePicker(datePickerID, defaults, groupID, individualID) {
				// console.log("running runDatePicker() for ");
				// console.log(datePickerID);
                //console.log(defaults)

                // these reset the max/min clickable days in calendar
                $(datePickerID + "From").datepicker("option", "maxDate", defaults.endSlashes);
                $(datePickerID + "To").datepicker("option", "minDate", defaults.startSlashes);

                $(datePickerID + "From").val(defaults.startSlashes);
                $(datePickerID + "To").val(defaults.endSlashes);

                $(datePickerID + "From").datepicker({
                    defaultDate: defaults.startSlashes,
                    maxDate: "0D",
                    minDate: "-12M",
                    changeMonth: false,
                    numberOfMonths: 1,
                    onClose: function (selectedDate) {
				// console.log("closed FROM for");
				// console.log(datePickerID);
				// console.log(selectedDate);
                        $(datePickerID + "To").datepicker("option", "minDate", selectedDate);
                    }
                });
                $(datePickerID + "To").datepicker({
                    defaultDate: "0D",
                    maxDate: "0D",
                    minDate: "-12M",
                    changeMonth: false,
                    numberOfMonths: 1,
                    onClose: function (selectedDate) {
				// console.log("closed TO for");
				// console.log(datePickerID);
				// console.log(selectedDate);
                        $(datePickerID + "From").datepicker("option", "maxDate", selectedDate);
                    }
                });
				// console.log(groupID);
				// console.log(individualID);

                var startSlashes = $(datePickerID + "From").val();
                var endSlashes = $(datePickerID + "To").val();
                var startDashes = moment(startSlashes, "MM/DD/YYYY").format("YYYY-MM-DD");
                var endDashes = moment(endSlashes, "MM/DD/YYYY").format("YYYY-MM-DD");

                return {"startSlashes": startSlashes, "endSlashes": endSlashes, "startDashes": startDashes, "endDashes": endDashes};
    }

    function getThisMonthName() {
                var month;
                if (monthsAgo == "all") {
                    month = "All Months";
                } else {
                    month = moment().subtract(monthsAgo, 'months').format("MMM YYYY");
                }
                return month;
    }

    function abbreviate(term) {
                var parts = term.split(' ');
                var result = '';
                for(var i=0; i<parts.length; i++) {
                  result += parts[i][0].toUpperCase();
                }
                return result;
    }

    function isEven(value) {
                if (value%2 === 0)
                  return true;
                else
                  return false;
    }



    // ................................................ SCORE LOG CHART .....................................................


    function loadScoreLogData(groupID, individualID) {
				// console.log("loadScoreLogData()");

                return function(scoreLogData){

                        scoreLogItem = scoreLogData;

                        $.each(scoreLogItem, function (key, val) { scoreLogItemIDs.push([key, val.vehicle_id]); });  // for default sorting order

                        // sort initial
                        sortScoreLog("date", scoreLogItem, scoreLogItemIDs);

                };
    }

    function sortScoreLog(colToSort, scoreLogItem, scoreLogItemIDs) {
				// console.log("sortScoreLog()");
                // default sort on loading each view
                var sortedIDs = [];

                    sortThisScoreLog(scoreLogItem, colToSort);

                    // find IDs
                    var eachID, sortedID;
                    findIDs(scoreLogItem, eachID, sortedID, sortedIDs, "vehicle_id", scoreLogItemIDs);

                populateScoreLog(scoreLogItem, "score-log", sortedIDs);
    }

    function sortThisScoreLog(scoreLogItem, columnName) {
				// console.log("sortThisScoreLog()");

                scoreLogItem = scoreLogItem.sort(function (a, b) {
                    if (a[columnName] > b[columnName]) {return -1;}
                    if (a[columnName] < b[columnName]) {return 1;}
                    return 0;
                });
    }

    function setScoreLogTitle(start, end) {
				// console.log("setScoreLogTitle()");
                var startDate = moment(start, "YYYY-MM-DD").format('MMM D');
                var endDate = moment(end, "YYYY-MM-DD").format('MMM D');

                // if months are the same, only mention month before start date: "Oct 2 - 8"
                var startDateMonth = moment(start, "YYYY-MM-DD").format('MMM');
                var endDateMonth = moment(end, "YYYY-MM-DD").format('MMM');
                if (startDateMonth == endDateMonth) {
                    endDate = moment(end, "MYYYY-MM-DD").format('D');
                }

                // add to title
                $("#score-log .title").html("Score Log: " + startDate + " - " + endDate);
    }

    function setScoreLogByDatePicker(date) {
				// console.log("setScoreLogByDatePicker();");

                // set title
                setScoreLogTitle(date.startDashes, date.endDashes);

                $("#scorelog-date-picker").unbind("submit");
                $("#scorelog-date-picker").submit(function (event) {
                    event.preventDefault(); // Stop form from submitting normally

                    // set title
                    var start_date = moment($("#scorelog-date-pickerFrom").val(), "MM/DD/YYYY").format("YYYY-MM-DD");
                    var end_date = moment($("#scorelog-date-pickerTo").val(), "MM/DD/YYYY").format("YYYY-MM-DD");

                    setScoreLogTitle(start_date, end_date);

                    $.get(urls.SCORELOGS, { "start_date": start_date, "end_date": end_date }, loadScoreLogData());
                    // ?vehicle_id=3038&group_id=159&start_date=2016-01-01&end_date=2016-01-31

                });
    }

    function populateScoreLog(scoreLogItem, rowType, scoreLogVehicleIDs) {
				// console.log("populateScoreLog()");

                $("#score-log tbody").empty();

                // chart populate

                var sortedID, showVID, sortedIDs = [];

                $.each(scoreLogItem, function (key, val) {



                    // sortedIDs.push([key, val.id]);

                    showVID = _.findWhere(scoreLogItem, { vehicle_id: val.vehicle_id });
                    sortedID = _.find(scoreLogVehicleIDs, function (num) { return num[1] == showVID.vehicle_id; });
                    sortedIDs.push(sortedID);
				// console.log(sortedID);

                    var scoreLogDate, scoreLogDateTD, scoreLogTime, scoreLogTimeTD, groupFromDatasets, scoreLogGroupTD, vehicleFromDatasets, scoreLogVehicleTD, scoreLogTypeTD, scoreLogXTD, scoreLogYTD, scoreLogZTD, scoreLogLatTD, scoreLogLongTD, scoreLogMapTD;

                    // Date
                    scoreLogDate = moment.utc(val.date, "X").format("MM/DD/YY, ddd");
                    scoreLogDateTD = '<td class="scorelogDate">' + scoreLogDate + '</td>';

                    // Time
                    scoreLogTime = moment.utc(val.date, "X").format("h:mm:ss a");
                    scoreLogTimeTD = '<td class="scorelogTime">' + scoreLogTime + '</td>';

                    // Group Name
                    groupFromDatasets = _.findWhere(datasets.groups, { id: val.group_id });
                    scoreLogGroupTD = '<td class="scorelogGroup">' + groupFromDatasets.label + '</td>';

                    // Vehicle Name
                    vehicleFromDatasets = _.find(groupFromDatasets.individuals, function (item) { return item.id == val.vehicle_id; });
                    scoreLogVehicleTD = '<td class="scorelogVehicle">' + vehicleFromDatasets.label + '</td>';

                    // Event Type
                    var scoreLogTypeNameMod = val.score_type.replace("Severe", "Hard");
                    scoreLogTypeTD = '<td class="scorelogEventType">' + abbreviate(scoreLogTypeNameMod) + '</td>';

                    // X Y Z Values
                    scoreLogXTD = '<td class="scorelogX">' + val.x + '</td>';
                    scoreLogYTD = '<td class="scorelogY">' + val.y + '</td>';
                    scoreLogZTD = '<td class="scorelogZ">' + val.z + '</td>';

                    // Latitude / Longitude
                    scoreLogLatTD = '<td class="scorelogLat">' + val.lat + '</td>';
                    scoreLogLongTD = '<td class="scorelogLong">' + val.lng + '</td>';

                    // Map it
                    // https://mototrax.angeltrax.com/gmap?nors=N&lat=31.21806&eorw=W&lon=85.37984&busid=23&date=2016/02/01&time=10:20:36%20AM&alert=Key%20Off&driver=&client=dcs
                    var gmapLink = '<a target="_blank" href="https://mototrax.angeltrax.com/gmap?&lat=' + val.lat + '&lon=' + val.lng + '&busid=' + vehicleFromDatasets.label + '&date=' + scoreLogDate + '&time='+ scoreLogTime + '&event=' + scoreLogTypeNameMod + '&driver=&client="> View in Map </a>';
                    scoreLogMapTD = '<td class="scorelogMap">' + gmapLink + '</td>';






                    // add the row sortedID[1]
                    $("#score-log tbody").append('<tr class="' + rowType + '-row-' + key + '" data-index="' + val.id + '">' + scoreLogDateTD + scoreLogTimeTD + scoreLogGroupTD + scoreLogVehicleTD + scoreLogTypeTD + scoreLogXTD + scoreLogYTD + scoreLogZTD + scoreLogLatTD + scoreLogLongTD + scoreLogMapTD + '</tr>');
				// console.log('APPENDED ROW');

                });
    }



    // ................................................ ALERT CHART .....................................................


    function loadAlertData(groupID, individualID) {
				// console.log("running loadAlertData()");

                return function(alertData){
    				// console.log(alertData);

                        $.each(alertData, function (key, val) { alertItemIDs.push([key, val.vehicle_id]); });  // for default sorting order
                        var colToSort = "initial";

                        // sort initial
                        sortAlerts(colToSort, alertData, alertItemIDs);

                        resetSortAlertArrows();

                        // alerts title is set within runDatePicker

                        // sort clicking
                        $('#behaviorEvents .coachStatus div i').parents('th').unbind('click');
                        $('#behaviorEvents .eventGroup div i').parents('th').unbind('click');
                        $('#behaviorEvents .eventVehicle div i').parents('th').unbind('click');
                        $('#behaviorEvents .eventOperator div i').parents('th').unbind('click');
                        $('#behaviorEvents .eventType div i').parents('th').unbind('click');
                        $('#behaviorEvents .dateTime div i').parents('th').unbind('click');
                        $('#behaviorEvents .eventDetails div i').parents('th').unbind('click');
                        $('#behaviorEvents .eventTvMargin div i').parents('th').unbind('click');
                        $('#behaviorEvents .eventActions div i').parents('th').unbind('click');
                        $('#behaviorEvents .eventScore div i').parents('th').unbind('click');

                        $('#behaviorEvents .coachStatus div i').parents('th').click(function () { sortAlerts(0, alertData, alertItemIDs); });
                        $('#behaviorEvents .eventGroup div i').parents('th').click(function () { sortAlerts(1, alertData, alertItemIDs); });
                        $('#behaviorEvents .eventVehicle div i').parents('th').click(function () { sortAlerts(2, alertData, alertItemIDs); });
                        $('#behaviorEvents .eventOperator div i').parents('th').click(function () { sortAlerts(3, alertData, alertItemIDs); });
                        $('#behaviorEvents .eventType div i').parents('th').click(function () { sortAlerts(4, alertData, alertItemIDs); });
                        $('#behaviorEvents .dateTime div i').parents('th').click(function () { sortAlerts(5, alertData, alertItemIDs); });
                        $('#behaviorEvents .eventDetails div i').parents('th').click(function () { sortAlerts(6, alertData, alertItemIDs); });
                        $('#behaviorEvents .eventTvMargin div i').parents('th').click(function () { sortAlerts(7, alertData, alertItemIDs); });
                        $('#behaviorEvents .eventActions div i').parents('th').click(function () { sortAlerts(8, alertData, alertItemIDs); });
                        $('#behaviorEvents .eventScore div i').parents('th').click(function () { sortAlerts(9, alertData, alertItemIDs); });

                        // alerts preview on individual scores tab
                        sortAlertsPreview(alertData, alertItemIDs); // sorts by date/time, sorting manually not enabled.

                        // clicking on an alert brings up the alerts tab
                        $("#alerts-preview-container tr").click(function () {
                            var thisAlertID = $(this).data('index');
                            highlightAlert(thisAlertID);
                        });
                };
    }

    function highlightAlert(thisAlertID) {
                $(".tab-alerts").click();
                $("#behaviorEvents tbody tr[data-index=" + thisAlertID + "]").addClass("active");
                $("#behaviorEvents tbody").scrollTop($("#behaviorEvents tbody").scrollTop()+$("tr.active").position().top);   // http://jsfiddle.net/yuFk5/250/
                // setTimeout(function(){ window.close() }, 2000);
                $("#behaviorEvents tbody tr[data-index=" + thisAlertID + "]").delay(2000).removeClass("active", 2000, "swing");
    }

    function setAlertsTitle(start, end) {
				// console.log("running setAlertsTitle()");
				// console.log(start);
				// console.log(end);

                // format alerts date range as "Oct 2 - Nov 15"
                var startDate = moment(start, "YYYY-MM-DD").format('MMM D');
                var endDate = moment(end, "YYYY-MM-DD").format('MMM D');

                // if months are the same, only mention month before start date: "Oct 2 - 8"
                var startDateMonth = moment(start, "YYYY-MM-DD").format('MMM');
                var endDateMonth = moment(end, "YYYY-MM-DD").format('MMM');
                if (startDateMonth == endDateMonth) {
                    endDate = moment(end, "MYYYY-MM-DD").format('D');
                }

                // add to alerts title
                $("#behaviorEvents .title").html("Alerts: " + startDate + " - " + endDate);
    }

    function setAlertsByDatePicker(date) {
				// console.log("setAlertsByDatePicker();");
				// console.log(date);
				// console.log(alertData);

                // set title
                setAlertsTitle(date.startDashes, date.endDashes);

                $("#alerts-date-picker").unbind("submit");
                $("#alerts-date-picker").submit(function (event) {
                    event.preventDefault(); // Stop form from submitting normally

                    // set title
                    var start_date = moment($("#alerts-date-pickerFrom").val(), "MM/DD/YYYY").format("YYYY-MM-DD");
                    var end_date = moment($("#alerts-date-pickerTo").val(), "MM/DD/YYYY").format("YYYY-MM-DD");

                    setAlertsTitle(start_date, end_date);

                    $.get(urls.GETALERTS, { "start_date": start_date, "end_date": end_date}, loadAlertData());
                    // inside: sortAlerts (populateAlerts), sortAlertsPreview (populateAlertsPreview)

                });
    }

    function sortAlerts(colToSort, alertData, alertItemIDs) {
				// console.log("running sortAlerts()");
				// console.log(alertData);

                // default sort on loading each view
                var sortedIDs = [];

                if (colToSort == "initial") {

                    colToSort = 5;

                    // find IDs
                    var eachID, sortedID;
                    findIDs(alertData, eachID, sortedID, sortedIDs, "vehicle_id", alertItemIDs);
                }

                var thisCaret, columnName;
                        if (colToSort === 0) {

                    $("#behaviorEvents th").removeClass('sortedBy');
                    $("#behaviorEvents .coachStatus").addClass('sortedBy');

                    // remove other column arrows
                    $("#behaviorEvents .eventGroup i, #behaviorEvents .eventVehicle i, #behaviorEvents .eventOperator i, #behaviorEvents .eventType i, #behaviorEvents .dateTime i, #behaviorEvents .eventActions i, #behaviorEvents .eventDetails i,  #behaviorEvents .eventTvMargin i, #behaviorEvents .eventScore i").removeClass('fa-caret-up fa-caret-down');

                    thisCaret = "#behaviorEvents .coachStatus i.fa";
                    columnName = "is_reviewed";
                    sortThis(thisCaret, columnName, alertData);

                } else if (colToSort == 1) {

                    $("#behaviorEvents th").removeClass('sortedBy');
                    $("#behaviorEvents .eventGroup").addClass('sortedBy');

                    // remove other column arrows
                    $("#behaviorEvents .coachStatus > i.fa").css("color", "#333");
                    $("#behaviorEvents .coachStatus i, #behaviorEvents .eventVehicle i, #behaviorEvents .eventOperator i, #behaviorEvents .eventType i, #behaviorEvents .dateTime i, #behaviorEvents .eventActions i, #behaviorEvents .eventDetails i,  #behaviorEvents .eventTvMargin i, #behaviorEvents .eventScore i").removeClass('fa-caret-up fa-caret-down');

                    thisCaret = "#behaviorEvents .eventGroup i.fa";
                    columnName = "group_id";
                    sortThis(thisCaret, columnName, alertData);

                } else if (colToSort == 2) {

                    $("#behaviorEvents th").removeClass('sortedBy');
                    $("#behaviorEvents .eventVehicle").addClass('sortedBy');

                    // remove other column arrows
                    $("#behaviorEvents .coachStatus i, #behaviorEvents .eventGroup i, #behaviorEvents .eventOperator i, #behaviorEvents .eventType i, #behaviorEvents .dateTime i, #behaviorEvents .eventActions i, #behaviorEvents .eventDetails i,  #behaviorEvents .eventTvMargin i, #behaviorEvents .eventScore i").removeClass('fa-caret-up fa-caret-down');

                    thisCaret = "#behaviorEvents .eventVehicle i.fa";
                    columnName = "vehicle_id";
                    sortThis(thisCaret, columnName, alertData);

                } else if (colToSort == 3) {

                    $("#behaviorEvents th").removeClass('sortedBy');
                    $("#behaviorEvents .eventOperator").addClass('sortedBy');

                    // remove other column arrows
                    $("#behaviorEvents .coachStatus i, #behaviorEvents .eventGroup i, #behaviorEvents .eventVehicle i, #behaviorEvents .eventType i, #behaviorEvents .dateTime i, #behaviorEvents .eventActions i, #behaviorEvents .eventDetails i,  #behaviorEvents .eventTvMargin i, #behaviorEvents .eventScore i").removeClass('fa-caret-up fa-caret-down');

                    thisCaret = "#behaviorEvents .eventOperator i.fa";
                    columnName = "operator";
                    sortThis(thisCaret, columnName, alertData);

                } else if (colToSort == 4) {

                    $("#behaviorEvents th").removeClass('sortedBy');
                    $("#behaviorEvents .eventType").addClass('sortedBy');

                    // remove other column arrows
                    $("#behaviorEvents .coachStatus i, #behaviorEvents .eventGroup i, #behaviorEvents .eventVehicle i, #behaviorEvents .eventOperator i, #behaviorEvents .dateTime i, #behaviorEvents .eventActions i, #behaviorEvents .eventDetails i,  #behaviorEvents .eventTvMargin i, #behaviorEvents .eventScore i").removeClass('fa-caret-up fa-caret-down');

                    thisCaret = "#behaviorEvents .eventType i.fa";
                    columnName = "type";
                    sortThis(thisCaret, columnName, alertData);

                } else if (colToSort == 5) {

                    $("#behaviorEvents th").removeClass('sortedBy');
                    $("#behaviorEvents .dateTime").addClass('sortedBy');

                    // remove other column arrows
                    $("#behaviorEvents .coachStatus i, #behaviorEvents .eventGroup i, #behaviorEvents .eventVehicle i, #behaviorEvents .eventOperator i, #behaviorEvents .eventType i, #behaviorEvents .eventActions i, #behaviorEvents .eventDetails i,  #behaviorEvents .eventTvMargin i, #behaviorEvents .eventScore i").removeClass('fa-caret-up fa-caret-down');

                    thisCaret = "#behaviorEvents .dateTime i.fa";
                    columnName = "date";
                    sortThis(thisCaret, columnName, alertData);


                } else if (colToSort == 6) {

                    $("#behaviorEvents th").removeClass('sortedBy');
                    $("#behaviorEvents .eventDetails").addClass('sortedBy');

                    // remove other column arrows
                    $("#behaviorEvents .coachStatus i, #behaviorEvents .eventGroup i, #behaviorEvents .eventVehicle i, #behaviorEvents .eventOperator i, #behaviorEvents .eventType i, #behaviorEvents .dateTime i, #behaviorEvents .eventActions i,  #behaviorEvents .eventTvMargin i, #behaviorEvents .eventScore i").removeClass('fa-caret-up fa-caret-down');

                    thisCaret = "#behaviorEvents .eventDetails i.fa";
                    columnName = "date_coached";
                    sortThis(thisCaret, columnName, alertData);


                } else if (colToSort == 7) {

                    $("#behaviorEvents th").removeClass('sortedBy');
                    $("#behaviorEvents .eventTvMargin").addClass('sortedBy');

                    // remove other column arrows
                    $("#behaviorEvents .coachStatus i,  #behaviorEvents .eventActions i,  #behaviorEvents .eventGroup i, #behaviorEvents .eventVehicle i, #behaviorEvents .eventOperator i, #behaviorEvents .eventType i, #behaviorEvents .dateTime i, #behaviorEvents .eventDetails i, #behaviorEvents .eventScore i").removeClass('fa-caret-up fa-caret-down');

                    thisCaret = "#behaviorEvents .eventTvMargin i.fa";
                    columnName = "tv_margin";
                    sortThis(thisCaret, columnName, alertData);

                }else if (colToSort == 8) {

                    $("#behaviorEvents th").removeClass('sortedBy');
                    $("#behaviorEvents .eventActions").addClass('sortedBy');

                    // remove other column arrows
                    $("#behaviorEvents .coachStatus i,  #behaviorEvents .eventTvMargin i, #behaviorEvents .eventGroup i, #behaviorEvents .eventVehicle i, #behaviorEvents .eventOperator i, #behaviorEvents .eventType i, #behaviorEvents .dateTime i, #behaviorEvents .eventDetails i, #behaviorEvents .eventScore i").removeClass('fa-caret-up fa-caret-down');

                    thisCaret = "#behaviorEvents .eventActions i.fa";
                    columnName = "is_reviewed";
                    sortThis(thisCaret, columnName, alertData);

                } else if (colToSort == 9) {

                    $("#behaviorEvents th").removeClass('sortedBy');
                    $("#behaviorEvents .eventScore").addClass('sortedBy');

                    // remove other column arrows
                    $("#behaviorEvents .coachStatus i,  #behaviorEvents .eventTvMargin i, #behaviorEvents .eventGroup i, #behaviorEvents .eventVehicle i, #behaviorEvents .eventOperator i, #behaviorEvents .eventType i, #behaviorEvents .dateTime i, #behaviorEvents .eventActions i, #behaviorEvents .eventDetails i").removeClass('fa-caret-up fa-caret-down');

                    thisCaret = "#behaviorEvents .eventScore i.fa";
                    columnName = "score";
                    sortThis(thisCaret, columnName, alertData);

                }
				// console.log(sortedIDs);
                var rowType = "alert"; // ?????????????

                populateAlerts(alertData, rowType, sortedIDs);
    }

    function sortThis(thisCaret, columnName, thisData) {
				// console.log("sort()");
                $(thisCaret).css("color", "#333");
    				// console.log(alertData);

                // determine sort direction
                if ($(thisCaret).hasClass('fa-caret-up') || $(thisCaret).hasClass('fa-caret-down')) {
                    $(thisCaret).toggleClass('fa-caret-up fa-caret-down');
                } else {
                    $(thisCaret).toggleClass('fa-caret-up');
                }

                if ($(thisCaret).hasClass('fa-caret-up')) {
    				// console.log("sorting up");
                    thisData = thisData.sort(function (a, b) {
                        if (a[columnName] < b[columnName]) {return -1;}
                        if (a[columnName] > b[columnName]) {return 1;}
                        return 0;
                    });

                } else if ($(thisCaret).hasClass('fa-caret-down')) {
    				// console.log("sorting down");
                    thisData = thisData.sort(function (a, b) {
                        if (a[columnName] > b[columnName]) {return -1;}
                        if (a[columnName] < b[columnName]) {return 1;}
                        return 0;
                    });
                }
    }

    function sortAlertsPreview(alertData, alertItemIDs) {
				// console.log("running sortAlertsPreview()");
				// console.log(alertData);
                // default sort on loading each view
                // find IDs
                var eachID, sortedID, sortedIDs = [];
                findIDs(alertData, eachID, sortedID, sortedIDs, "vehicle_id", alertItemIDs);

                $("#eventsPreview th").removeClass('sortedBy');
                $("#eventsPreview th.dateTime").addClass('sortedBy');
			    // console.log("sorting up");
                alertData = alertData.sort(function (a, b) {
                    if (a.date < b.date) {return -1;}
                    if (a.date > b.date) {return 1;}
                    return 0;
                });

                var rowType = "alert"; // ??
                populateAlertsPreview(alertData, rowType, sortedIDs);
    }

    function populateAlertsPreview(alertData, rowType, alertVehicleIDs) {
				// console.log("running populateAlertsPreview()");

                $("#alerts-preview-container").empty();
				// console.log(alertData);


                // chart populate

                var sortedID, showVID, sortedIDs = [];

                $.each(alertData, function (key, val) {
				// console.log(key);
				// console.log(val.id);


                    // sortedIDs.push([key, val.id]);

                    showVID = _.findWhere(alertData, { vehicle_id: val.vehicle_id });
                    sortedID = _.find(alertVehicleIDs, function (num) { return num[1] == showVID.vehicle_id; });
                    sortedIDs.push(sortedID);
				// console.log(sortedID);

                    var alertCoachStatusTD, alertTypeTD, alertDate, alertDateTD;

                    if (!val.is_reviewed) {
                        // if no date coached, make circle filled and red
                        alertCoachStatusTD = '<td class="coachStatus"><i class="fa fa-circle" style="color: #dd1111;"></i></td>';
                    } else {
                        alertCoachStatusTD = '<td class="coachStatus"><i class="fa fa-circle" style="color: #119911;"></i></td>';
                    }

                    var eventTypeName = val.type;
                    var eventTypeNameMod = eventTypeName.replace("Severe", "Hard");

                    alertTypeTD = '<td class="eventType">' + abbreviate(eventTypeNameMod) + '</td>';

                    alertDate = moment.utc(val.date, "X").format("ddd, MMM D, h:mm:ss a");
                    alertDateTD = '<td class="dateTime">' + alertDate + '</td>';

                    var needsReview = '';
                    // if it hasn't been reviewed
                    if (!val.is_reviewed) {
                        needsReview = 'needsReview';
                    }

                    // add the row sortedID[1]
                    $("#alerts-preview-container").append('<tr class="' + rowType + '-row-' + key + ' ' + needsReview + '" data-index="' + val.id + '">' + alertCoachStatusTD + alertTypeTD + alertDateTD + '</tr>');
				// console.log('APPENDED ROW');

                });
    }

    function populateAlerts(alertData, rowType, alertVehicleIDs) {
				// console.log(alertData);
				// console.log("running populateAlerts()");

                $("#behaviorEvents tbody").empty();
                $('#reviewed-alerts-report').text('Show Details');
                $('#reviewed-alerts-report').data('show', 'false');

                // chart populate

                var sortedID, showVID, sortedIDs = [];

                $.each(alertData, function (key, val) {

                    // sortedIDs.push([key, val.id]);

                    showVID = _.findWhere(alertData, { vehicle_id: val.vehicle_id });
                    sortedID = _.find(alertVehicleIDs, function (num) { return num[1] == showVID.vehicle_id; });
                    sortedIDs.push(sortedID);
				// console.log(sortedID);

                    var alertCoachStatusTD, alertTvMarginTD, groupFromDatasets, alertGroupTD, vehicleFromDatasets, alertVehicleTD, alertOperatorTD, alertTypeTD, alertDate, alertDateTD, alertActionsTD, alertResultsTD, alertDateCoached;

                    // get group name
                    groupFromDatasets = _.findWhere(datasets.groups, { id: val.group_id });
                    alertGroupTD = '<td class="eventGroup">' + groupFromDatasets.label + '</td>';
				// console.log(groupFromDatasets.individuals);


                    // get vehicle, operator, type
                    vehicleFromDatasets = _.find(groupFromDatasets.individuals, function (item) { return item.id == val.vehicle_id; });
                    alertVehicleTD = '<td class="eventVehicle">' + vehicleFromDatasets.label + '</td>';
                    alertOperatorTD = '<td class="eventOperator">' + val.operator + '</td>';
                    var alertTypeNameMod = val.type.replace("Severe", "Hard");
                    alertTypeTD = '<td class="eventType">' + abbreviate(alertTypeNameMod) + '</td>';

                    // get date
                    alertDate = moment.utc(val.date, "X").format("ddd, MMM D, YYYY,<br> h:mm:ss a");
                    alertDateTD = '<td class="dateTime">' + alertDate + '</td>';

                    alertTvMarginTD = '<td class="tvMargin">' +(val.tv_margin === null ? "" : val.tv_margin.toFixed(2)) +"</td>";

                    var needsReview = '';
                    //
                    // uncomment below, comment above (to enable video download icon

                    if(val.src_video_ready) {
                        alertActionsTD = '<td class="eventActions"><i class="fa fa-pencil-square-o"></i>  <i class="fa fa-print"></i> <i class="fa fa-times"></i><i class="icomoon-video-dl" style="color:#0058a8"></i></td>';
                    } else {
                        alertActionsTD = '<td class="eventActions"><i class="fa fa-pencil-square-o"></i>  <i class="fa fa-print"></i> <i class="fa fa-times"></i><i class="icomoon-video-dl-disable"></i></td>';
                    }


                    // if it hasn't been reviewed
                    var alertScoreTD;
                    var borderOrNot = '';
                    var detailsTR = '';
                    if (!val.is_reviewed) {

                        alertCoachStatusTD = '<td class="coachStatus"><a name="' + val.id + '"></a><i class="fa fa-circle" style="color: #dd1111;"></i></td>';
                        alertResultsTD = '<td class="eventDetails">Video review</td>';
                        alertScoreTD = '<td class="eventScore">-</td>';

                        needsReview = 'needsReview';

                    // if it has been reviewed
                    } else {

                        alertCoachStatusTD = '<td class="coachStatus"><a name="' + val.id + '"></a><i class="fa fa-circle" style="color: #119911;"></i></td>';
                        detailsTR = '';
                        var theseNotesHTML = '';
                        var detailsOrNot = 0;
                        var notesTrContent = '';
                        var infractionsTrContent = '';

                        // if notes or not
                        if (!val.notes || /^((<br>|<br\s?\/>)*|\s*)+$/g.test(val.notes)) {
                          notesTrContent = '';
                        } else {
                          theseNotesHTML = val.notes;
                          notesTrContent = "<div class='alertReportTrLabel'>Notes:</div><div class='alertReportTrContent' style='padding-left: 12px;'> " + theseNotesHTML + "</div>";
                          detailsOrNot = 1;
                        }

                        if (!val.score) {
                            alertScoreTD = '<td class="eventScore">0</td>';
                            // (no infractions)

                        } else {

                            alertScoreTD = '<td class="eventScore">' + val.score + '</td>';

                            // (must be infractions, because of a >0 score)
                            var theseInfractionsHTML = '';
                            var theseInfractionsObj = _.pick(infractionsObj, val.infractions); // _.pick(object, *keys);

                            // add infractions
                            $.each(theseInfractionsObj, function (key, val) {
                                if (val !== undefined) {theseInfractionsHTML += '<div class="alert-infraction-item">'+val+'</div> ';}
                            });
                            infractionsTrContent = "<div class='alertReportTrLabel'>Infractions:</div><div class='alertReportTrContent'> " + theseInfractionsHTML + "</div>";
                            detailsOrNot = 1;

                        }

                        if (detailsOrNot == 1) {
                          detailsTR = "</tr><tr class='alertReportTr' data-index='" + val.id + "details' style='display: none;'><td colspan=9 ><div class='detailsTR'>" + infractionsTrContent + notesTrContent + "</div></td>";
                          borderOrNot = "hasDetails";
                        }


                        if (!val.date_coached) {
                            alertDateCoached = 'Not Coached';
                        } else {
                            alertDateCoached = 'Coached: ' + moment.utc(val.date_coached, "X").format("ddd, M/D/YY");
                        }

                        alertResultsTD = '<td class="eventDetails">' + alertDateCoached + '</td>';

                    }

                    // add the row
                    $("#behaviorEvents tbody").append('<tr class="' + rowType + '-row-' + key + ' ' + needsReview + borderOrNot + '" data-index="' + val.id + '">' + alertCoachStatusTD + alertGroupTD + alertVehicleTD + alertOperatorTD + alertTypeTD + alertDateTD + alertResultsTD +alertTvMarginTD + alertActionsTD + alertScoreTD + detailsTR + '</tr>');
				// console.log('APPENDED ROW');

                });


                // --------------------------------------------------------------------------------------------------------------

                // modal, for all initially reviewed events
                $("td.eventDetails.reviewedEventDetails").colorbox({
                    //inline: true,
                    href: "#event-details-popup",
                    width: "515px",
                    innerWidth: "515px",
                    maxWidth: "515px"
                });

                // load details
                $("#behaviorEvents td.eventDetails").css("cursor","pointer");
                $("#behaviorEvents td.eventDetails").unbind("click");
                $("#behaviorEvents td.eventDetails").click(function () {

                    var thisAlertID = parseInt($(this).parents("tr").attr("data-index"));
                    var thisAlertItem = _.findWhere(alertData, { "id": thisAlertID });
                // console.log(thisAlertItem.infractions);

                    loadEventDetails(thisAlertItem, alertData);

                    // make modal work
                    $(this).colorbox({
                        inline: true,
                        href: "#event-details-popup"
                    });
                });

                // change this to video download icon behavior
                $("#behaviorEvents .eventActions i:nth-child(1)").unbind("click");
                $("#behaviorEvents .eventActions i:nth-child(1)").click(function () {
                    var thisAlertID = parseInt($(this).parents("tr").attr("data-index"));
                    var thisAlertItem = _.findWhere(alertData, { "id": thisAlertID });

                    loadEventDetails(thisAlertItem, alertData);

                   //make modal work
                    $(this).colorbox({
                        inline: true,
                        href: "#event-details-popup"
                    });
                });



                $("#behaviorEvents .eventActions i:nth-child(2)").unbind("click");
                $("#behaviorEvents .eventActions i:nth-child(2)").click(function () {

                    var thisAlertID = parseInt($(this).parents("tr").attr("data-index"));
                    var thisAlertItem = _.findWhere(alertData, { "id": thisAlertID });
				// console.log(thisAlertItem.infractions);

                    loadEventDetailsForPrint(thisAlertItem);
                });

                $("#behaviorEvents .eventActions i:nth-child(3)").unbind("click");
                $("#behaviorEvents .eventActions i:nth-child(3)").click(function () {
                      var thisAlertID = parseInt($(this).parents("tr").attr("data-index"));
                      deleteAlert(thisAlertID);
                });


                $("#behaviorEvents .eventActions i:nth-child(4)").unbind("click");
                $("#behaviorEvents .eventActions i:nth-child(4)").click(function () {
                    var thisAlertID = parseInt($(this).parents("tr").attr("data-index"));
                    var thisAlertItem = _.findWhere(alertData, { "id": thisAlertID });

                    if(thisAlertItem.src_video_ready) {
                        window.open('/behavior_reports/behavior_events/' +thisAlertID +'/video');
                    }
                });

				// console.log(alertData);
    }

    function resetSortAlertArrows() {
				// console.log("running resetSortAlertArrows()");

                $("#alert-container-header i.fa").removeClass('fa-caret-down');
                $("#alert-container-header i.fa").removeClass('fa-caret-up');
                $("#alert-container-header .dateTime i.fa").addClass('fa-caret-up');

                $('.coachStatus div i, .eventType div i, .dateTime div i, .dateTime div i, .eventDetails div i, .eventActions div i, .eventTvMargin div i, .eventScore div i').parents('th').unbind('click');
    }

    function loadEventDetailsForPrint(thisAlertItem) {

                $("#print-alert").css("display","block");
                $("#behaviorEvents").css("display","none");

                $("#back-to-alerts").unbind("click");
                $("#back-to-alerts").click(function(){
                    $(".tab-alerts").click();
                });

                // get everything

                var findWhereObj = {};
                findWhereObj.id = thisAlertItem.group_id;
                var groupFromDatasets = _.findWhere(datasets.groups, findWhereObj);  // {id: thisAlertItem.group_id}

                var vehicleFromDatasets = _.find(groupFromDatasets.individuals, function (item) { return item.id == thisAlertItem.vehicle_id;} );

                var alertDate = moment.utc(thisAlertItem.date, "X").format("ddd, MMM D, YYYY");
                var alertTime = moment.utc(thisAlertItem.date, "X").format("h:mm:ss a");

                var score;
                if (!thisAlertItem.score) {
                  score = "None reported.";
                } else {
                  score = "<b>Score:</b> " + thisAlertItem.score;
                }

                // set everything

                // screen subhead
                $("#print-alert #print-alert-subhead").html(vehicleFromDatasets.label + " -- " + alertDate + " at " + alertTime);

                // get group name
                $("#print-alert .event-group strong").html(groupFromDatasets.label);

                // get vehicle name
                $("#print-alert .event-vehicle-name").html(vehicleFromDatasets.label + " - " + thisAlertItem.operator);

                // event trigger
                var alertType = thisAlertItem.type.replace("Severe", "Hard");
                $("#print-alert .event-trigger strong").html(alertType);

                // alert date
                $("#print-alert .event-date strong").html(alertDate);

                // alert time
                $("#print-alert .event-time strong").html(alertTime);





                // "Coached" dropdown and date
                var alertCoachedDate;
                if (!thisAlertItem.date_coached) {
                    alertCoachedDate = "Not Coached";
                } else {
                    alertCoachedDate = moment.utc(thisAlertItem.date_coached, "X").format("ddd, MMM D, YYYY");
                }
                $("#print-alert .event-coached-date strong").html(alertCoachedDate);

                $("#print-alert .event-id strong").html(thisAlertItem.id);


                // insert infractions
                $("#print-alert .event-infractions li").css("display","none");
                if (thisAlertItem.infractions) {
                    $.each(thisAlertItem.infractions, function (key, val) {
                        var thisLI = $("#print-alert .event-infractions #"+val);
                        $(thisLI).css("display","block");

                        if ($(thisLI).hasClass("event_fundamentals")) {
                          $("#fundamentals_title").css("display","block");

                        } else if ($(thisLI).hasClass("event_equipment")) {
                          $("#equipment_title").css("display","block");

                        } else if ($(thisLI).hasClass("event_risky")) {
                          $("#risky_title").css("display","block");

                        } else if ($(thisLI).hasClass("event_awareness")) {
                          $("#awareness_title").css("display","block");

                        } else if ($(thisLI).hasClass("event_distractions")) {
                          $("#distractions_title").css("display","block");

                        }
                    });
                }


                $("#event-score").html(score);

                // Get initial NOTES
                // // replace <BR> with NEWLINE
                // var regex = /<br\s*[\/]?>/gi;

                // if(thisAlertItem.notes) {
                //     thisAlertItem.notes = thisAlertItem.notes.replace(regex, "\n");
                // }

                $("#event-notes").html(thisAlertItem.notes);
    }

    function loadEventDetails(thisAlertItem, alertData) {
            // passing alertData through to postAlertDetails() because otherwise it is undefined
		        // console.log(alertData);
		        // console.log("loadEventDetails()");


                // CLEAR DATA FROM ANY PREVIOUS MODALS
                    $("#event-details-popup input").prop('checked', false);
                    $("#event-details-popup textarea").val('');


                // TOP DATA
                    // get group name
                    var findWhereObj = {};
                    findWhereObj.id = thisAlertItem.group_id;
                    var groupFromDatasets = _.findWhere(datasets.groups, findWhereObj);  // {id: thisAlertItem.group_id}
                    $("#event-details-popup .event-group strong").html(groupFromDatasets.label);

                    // get vehicle name
                    var vehicleFromDatasets = _.find(groupFromDatasets.individuals, function (item) { return item.id == thisAlertItem.vehicle_id;} );
                    $("#event-details-popup .event-vehicle-name").html(vehicleFromDatasets.label + " - " + thisAlertItem.operator);

                    // event trigger
                    var alertType = thisAlertItem.type.replace("Severe", "Hard");
                    $("#event-details-popup .event-trigger strong").html(alertType);

                    // alert date
                    var alertDate = moment.utc(thisAlertItem.date, "X").format("ddd, MMM D, YYYY");
                    $("#event-details-popup .event-date strong").html(alertDate);

                    // alert time
                    var alertTime = moment.utc(thisAlertItem.date, "X").format("h:mm:ss a");
                    $("#event-details-popup .event-time strong").html(alertTime);


                // "Coached" dropdown and date
                var alertCoachedDate;
                if (!thisAlertItem.date_coached) {
                    alertCoachedDate = "Not Coached";
                    $("#coaching_status").val("coaching_not");
                } else {
                    alertCoachedDate = moment.utc(thisAlertItem.date_coached, "X").format("ddd, MMM D, YYYY");
                    $("#coaching_status").val("coaching_coached");
                }
                $(".event-coached-date strong").html(alertCoachedDate);
                $(".event-id strong").html(thisAlertItem.id);

                // insert infractions
                if (thisAlertItem.infractions) {
                    $.each(thisAlertItem.infractions, function (key, val) {
                        $(".editableForm input[name=" + val + "]").prop('checked', true);
                    });
                }

                // SCORE
                var eventScore = 0;

                // get initial score
                $(".editableForm input:checked").each(function () {eventScore++;});
                $("#event-details-live-score").html("<b>Score:</b> " + eventScore);

                // Score on checkbox change
                $(".editableForm input:checkbox").change(function () {
                    eventScore = 0;
                    $(".editableForm input:checked").each(function () {eventScore++;});
                    $("#event-details-live-score").html("<b>Score:</b> " + eventScore);
                    thisAlertItem.score = eventScore;
                });


                // Get initial NOTES
                var regex = /<br\s*[\/]?>/gi;  // replace <BR> with NEWLINE

                if(thisAlertItem.notes) {
                    thisAlertItem.notes = thisAlertItem.notes.replace(regex, "\n");
                }

                $("#event-details-popup textarea").val(thisAlertItem.notes);

                // Post Results
                $("#event-details-popup form").unbind("submit");
                $("#event-details-popup form").submit(function (event) {
                  event.preventDefault();
                  // console.log("submit");
                  postAlertDetails(thisAlertItem, alertData);
                });
    }

    function postAlertDetails(thisAlertItem, alertData) {
        // passing alertData through to postAlertDetails() because otherwise it is undefined
				// console.log(alertData);
				// console.log("running postAlertDetails()");

                // Get Reviewed T/F
                // thisAlertItem.is_reviewed = $("input[name='is_reviewed']").is(':checked');
                thisAlertItem.is_reviewed = true;

                // Get Infractions
                thisAlertItem.infractions = [];
                $(".editableForm input:checked").each(function () {
                    thisAlertItem.infractions.push($(this).attr('name'));
                });

                // Get Notes
                // replace NEWLINE with <BR>
                thisAlertItem.notes = $(".editableForm textarea").val();
                var regex = /\r?\n/g;
                thisAlertItem.notes = thisAlertItem.notes.replace(regex, '<br/>');
                // ISSUE: check for injection / validate notes here

                // Get Coached Date
                if ($(".editableForm select").val() == "coaching_not") {
                    thisAlertItem.date_coached = null;
                } else if ($(".editableForm select").val() == "coaching_coached" && !thisAlertItem.date_coached) { // if coach date hasn't been set yet, but "coached" is selected
                    thisAlertItem.date_coached = moment().utc().format('X');
                }

                var evt = thisAlertItem;
                var url = urls.GETALERTS + evt.id;
                var data = JSON.stringify(evt);

                // POST
                var posting = $.ajax({
                    url: url,
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify(evt),
                        success: function (data) {

                              var counter = 0;
                              // get the CURRENT show-state of the chart (if show = "true", the detail <tr>s should be visible);
                              // var show = $('#reviewed-alerts-report').attr('data-show'); // if data-show="true", show = true;

                              // apply data to original array in chart
                              $("#behaviorEvents tbody tr").each(function () {

                                  counter++;
                                  // console.log(counter);

                                  var notesTrContent, infractionsTrContent, theseInfractionsHTML, theseInfractionsObj;

                                  // find alert row
                                  if ($(this).attr("data-index") == evt.id) {

                                          // make row not-bold
                                          $(this).removeClass("needsReview");

                                          // if previously red circle, remove it
                                          if ($(this).find(".fa-circle")) {
                                            $(this).children('.coachStatus').html('<i class="fa fa-circle" style="color: #119911;"></i>');
                                          }
                                          // if coached or not
                                          if (!evt.date_coached){
                                            $(this).children(".eventDetails").html('Not Coached');
                                          } else {
                                            $(this).children(".eventDetails").html('Coached: ' + moment.utc(evt.date_coached, "X").format("ddd, M/D/YY") + '');
                                          }

                                          // if scored or not
                                          if (!evt.score) {
                                              $(this).children(".eventScore").html("0");
                                          } else {
                                              $(this).children(".eventScore").html(evt.score);
                                          }

                                          // add details <tr> or not
                                          var detailsOrNot = 0;

                                          // if notes or not
                                          // if (!evt.notes || evt.notes == "" || evt.notes == " " || evt.notes == "<br>") {

                                          if (!evt.notes || /^((<br>|<br\s?\/>)*|\s*)+$/g.test(evt.notes)) {
                                            notesTrContent = '';
                                          } else {
                                            notesTrContent = "<div class='alertReportTrLabel'>Notes:</div><div class='alertReportTrContent' style='padding-left: 12px;'> " + evt.notes + "</div>";
                                            detailsOrNot = 1;
                                          }

                                          // if infractions or not
                                          if (!evt.infractions.length) {
                                              infractionsTrContent = '';
                                          } else {
                                              theseInfractionsHTML = '';
                                              theseInfractionsObj = _.pick(infractionsObj, evt.infractions); // _.pick(object, *keys);

                                              // add infractions
                                              $.each(theseInfractionsObj, function (key, val) {
                                                  if (val !== undefined) {theseInfractionsHTML += '<div class="alert-infraction-item">'+val+'</div> ';}
                                              });
                                              infractionsTrContent = "<div class='alertReportTrLabel'>Infractions:</div><div class='alertReportTrContent'> " + theseInfractionsHTML + "</div>";
                                              detailsOrNot = 1;
                                          }


                                          var rowContent = "<tr class='alertReportTr' data-index='" + evt.id + "details'><td colspan=9 ><div class='detailsTR'>" + infractionsTrContent + notesTrContent + "</div></td></tr>";

                                            // if the details row already exists,
                                            if ($("tr[data-index='"+evt.id+"details']").length) { // skip and go to the details row (see else-if, below)

                                            } else if (detailsOrNot == 1) { // if the details row wouldn't be empty
                                              // console.log("details row for " + evt.id + " did not previously exist");
                                              $(this).after(rowContent);
                                              $(this).addClass("hasDetails");

                                              // show or hide this new details row
                                              var showOrNot = $('#reviewed-alerts-report').data('show');
                                              $("tr[data-index='"+evt.id+"details']").css('display', (showOrNot == 'false') ? 'none' : '' );
                                            }

                                          // ------------------- end snippet [also in populateAlerts()]



                                  } else if ($(this).attr("data-index") == evt.id + "details") {

                                          // reload content of details <tr> (if already there)

                                          // ------------------- begin snippet [also in populateAlerts()]
                                          var detailsOrNot = 0;
                                          // if notes or not
                                          if (!evt.notes || /^((<br>|<br\s?\/>)*|\s*)+$/g.test(evt.notes)) {
                                            notesTrContent = '';
                                          } else {
                                            notesTrContent = "<div class='alertReportTrLabel'>Notes:</div><div class='alertReportTrContent' style='padding-left: 12px;'> " + evt.notes + "</div>";
                                          }

                                          if (evt.infractions.length) {
                                              theseInfractionsHTML = '';
                                              theseInfractionsObj = _.pick(infractionsObj, evt.infractions); // _.pick(object, *keys);

                                              // add infractions
                                              $.each(theseInfractionsObj, function (key, val) {
                                                  if (val !== undefined) {theseInfractionsHTML += '<div class="alert-infraction-item">'+val+'</div> ';}
                                              });
                                              infractionsTrContent = "<div class='alertReportTrLabel'>Infractions:</div><div class='alertReportTrContent'> " + theseInfractionsHTML + "</div>";
                                          } else {
                                            infractionsTrContent = '';
                                          }

                                          // whether to update / remove the details row
                                          if (notesTrContent == '' && infractionsTrContent == '') {
                                            detailsOrNot = 0;
                                          } else {
                                            detailsOrNot = 1;
                                          }

                                          // updating / removing the details row
                                          if (detailsOrNot == 1) {
                                            $(this).html("<td colspan=9 ><div class='detailsTR'>" + infractionsTrContent + notesTrContent + "</div></td>");
                                          } else if (detailsOrNot === 0) {
                                            $(this).prev().removeClass("hasDetails");
                                            $(this).remove();
                                          }

                                          // ------------------- end snippet [also in populateAlerts()]

                                  }

                              });

                              var currItem = _.findWhere(alertData, { id: data.id });
                              var index = _.indexOf(alertData, currItem);
                              alertData[index] = data;

                              //close modal
                              $.colorbox.close();

                        }
                });

                // var content = $(data).find("#content");
                // $("#result").empty().append(content);

                return false;
    }

    function deleteAlert(thisAlertID) {
				// console.log("running deleteAlert()");
				// console.log(alertData);

                var c = confirm('If you click OK, you will permanently delete this Alert, and it CANNOT be recovered.');
                if (c) {

                    var url = '/behavior_reports/behavior_events/' + thisAlertID;
                    $.ajax({ url: url, type: 'DELETE', success: function() { // remove this alert from server

                        // remove this alert from arrays
                        alertData = _.filter(alertData, function(alert){ return alert.id !== thisAlertID; });
                        alertItemIDs = _.filter(alertItemIDs, function(alertid){ return alertid[1] !== thisAlertID; });

                        // remove this alert from chart immediately
                        $("tr[data-index='" + thisAlertID + "']").remove();  // remove tr from alerts list temporarily

                    }});

                }
    }


    // ................................................ LINE GRAPHS ................................................


    // for fleet month-by-month scores
    function plotLineGraph(item) {
  			// console.log("running plotLineGraph()");
                $("#lplaceholder").css("width", "992px");

                // CLEAR DATA
                $("#lplaceholder").unbind("plothover"); // reset series hover event
				// console.log(item);

                // tooltip data
                var currAggr = { data: [], dataTT: [], date: [], color: "rgba(37, 132, 119, 1)", label: "Aggressiveness", type: ["aggr","regular"], lines: {show: true}, driveTime: item.total_time};
                var currDistr = { data: [], dataTT: [], date: [], color: "rgba(42, 108, 150, 1)", label: "Distraction", type: ["distr","regular"], lines: {show: true}, driveTime: item.total_time};
                var currSpeed = { data: [], dataTT: [], date: [], color: "rgba(169, 56, 53, 1)", label: "Speeding", type: ["speed","regular"], lines: {show: true}, driveTime: item.total_time};
                var currRoad = { data: [], dataTT: [], date: [], color: "rgba(117, 82, 149, 1)", label: "Road Alerts", type: ["road","regular"], lines: {show: true}, driveTime: item.total_time};
                var currCompd = { data: [], dataTT: [], date: [], color: "rgba(208, 103, 0, 1)", label: "Compound Events", type: ["compd","regular"], lines: {show: true}, driveTime: item.total_time};

                var currBrake = { data: [], dataTT: [], date: [], color: "rgba(83, 138, 180, 1)", label: "Braking", type: ["brake","regular"], lines: {show: true}, driveTime: item.total_time};
                var currLT = { data: [], dataTT: [], date: [], color: "rgba(19, 144, 0, 1)", label: "Left Turn", type: ["lt","regular"], lines: {show: true}, driveTime: item.total_time};
                var currRT = { data: [], dataTT: [], date: [], color:"rgba(216, 181, 0, 1)", label: "Right Turn", type: ["rt","regular"], lines: {show: true}, driveTime: item.total_time};
                var currAccel = { data: [], dataTT: [], date: [], color:"rgba(140, 0, 88, 1)", label: "Acceleration", type: ["accel","regular"], lines: {show: true}, driveTime: item.total_time};

                var currSpeedHard = { data: [], dataTT: [], date: [], color: "#aa1111", label: "High Speeding", type: ["speed","severe"], lines: {show: false}, points: {show: false}, driveTime: item.total_time};
                var currBrakeHard = { data: [], dataTT: [], date: [], color: "#aa1111", label: "Hard Braking", type: ["brake","severe"], lines: {show: false}, points: {show: false}, driveTime: item.total_time};
                var currLTHard = { data: [], dataTT: [], date: [], color: "#aa1111", label: "Hard Left Turn", type: ["lt","severe"], lines: {show: false}, points: {show: false}, driveTime: item.total_time};
                var currRTHard = { data: [], dataTT: [], date: [], color: "#aa1111", label: "Hard Right Turn", type: ["rt","severe"], lines: {show: false}, points: {show: false}, driveTime: item.total_time};
                var currAccelHard = { data: [], dataTT: [], date: [], color: "#aa1111", label: "Hard Acceleration", type: ["accel","severe"], lines: {show: false}, points: {show: false}, driveTime: item.total_time};

                dataToPlot = []; lplot = "";

                for (var i = 0; i < item.score_aggressive.length; i++) {

                    // ADD tooltip data (orig)
                    currAggr.dataTT.push([i, item.score_aggressive[i]]);
                    currDistr.dataTT.push([i, item.score_distracted[i]]);
                    currSpeed.dataTT.push([i, item.score_speed[i]]);
                    currRoad.dataTT.push([i, item.score_road_alert[i]]);
                    currCompd.dataTT.push([i, item.score_compound[i]]);
                    currBrake.dataTT.push([i, item.score_brake[i]]);
                    currLT.dataTT.push([i, item.score_left_turn[i]]);
                    currRT.dataTT.push([i, item.score_right_turn[i]]);
                    currAccel.dataTT.push([i, item.score_acceleration[i]]);

                    currSpeedHard.dataTT.push([i, item.score_speed_severe[i]]);
                    currBrakeHard.dataTT.push([i, item.score_brake_severe[i]]);
                    currLTHard.dataTT.push([i, item.score_left_turn_severe[i]]);
                    currRTHard.dataTT.push([i, item.score_right_turn_severe[i]]);
                    currAccelHard.dataTT.push([i, item.score_acceleration_severe[i]]);

                    // ADD plotting data (cap at 5)
                    if (item.score_aggressive[i] < 10) {currAggr.data.push([i, item.score_aggressive[i]]);} else {currAggr.data.push([i, 10]);}
                    if (item.score_distracted[i] < 10) {currDistr.data.push([i, item.score_distracted[i]]);} else {currDistr.data.push([i, 10]);}
                    if (item.score_speed[i] < 10) {currSpeed.data.push([i, item.score_speed[i]]);} else {currSpeed.data.push([i, 10]);}
                    if (item.score_road_alert[i] < 10) {currRoad.data.push([i, item.score_road_alert[i]]);} else {currRoad.data.push([i, 10]);}
                    if (item.score_compound[i] < 10) {currCompd.data.push([i, item.score_compound[i]]);} else {currCompd.data.push([i, 10]);}
                    if (item.score_brake[i] < 10) {currBrake.data.push([i, item.score_brake[i]]);} else {currBrake.data.push([i, 10]);}
                    if (item.score_left_turn[i] < 10) {currLT.data.push([i, item.score_left_turn[i]]);} else {currLT.data.push([i, 10]);}
                    if (item.score_right_turn[i] < 10) {currRT.data.push([i, item.score_right_turn[i]]);} else {currRT.data.push([i, 10]);}
                    if (item.score_acceleration[i] < 10) {currAccel.data.push([i, item.score_acceleration[i]]);} else {currAccel.data.push([i, 10]);}

                    if (item.score_speed_severe[i] < 10) {currSpeedHard.data.push([i, item.score_speed_severe[i]]);} else {currSpeedHard.data.push([i, 10]);}
                    if (item.score_brake_severe[i] < 10) {currBrakeHard.data.push([i, item.score_brake_severe[i]]);} else {currBrakeHard.data.push([i, 10]);}
                    if (item.score_left_turn_severe[i] < 10) {currLTHard.data.push([i, item.score_left_turn_severe[i]]);} else {currLTHard.data.push([i, 10]);}
                    if (item.score_right_turn_severe[i] < 10) {currRTHard.data.push([i, item.score_right_turn_severe[i]]);} else {currRTHard.data.push([i, 10]);}
                    if (item.score_acceleration_severe[i] < 10) {currAccelHard.data.push([i, item.score_acceleration_severe[i]]);} else {currAccelHard.data.push([i, 10]);}


                    // ADD dates
                    currAggr.date.push([i, monthNameList[i]]);
                    currDistr.date.push([i, monthNameList[i]]);
                    currSpeed.date.push([i, monthNameList[i]]);
                    currRoad.date.push([i, monthNameList[i]]);
                    currCompd.date.push([i, monthNameList[i]]);
                    currBrake.date.push([i, monthNameList[i]]);
                    currLT.date.push([i, monthNameList[i]]);
                    currRT.date.push([i, monthNameList[i]]);
                    currAccel.date.push([i, monthNameList[i]]);

                    currSpeedHard.date.push([i, monthNameList[i]]);
                    currBrakeHard.date.push([i, monthNameList[i]]);
                    currLTHard.date.push([i, monthNameList[i]]);
                    currRTHard.date.push([i, monthNameList[i]]);
                    currAccelHard.date.push([i, monthNameList[i]]);

                }

                // Gap options
                var currAggrGaps = { data: calcGaps(currAggr.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currAggr.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: true} }; // see http://jsfiddle.net/ecd3g23g/1/
                var currDistrGaps = { data: calcGaps(currDistr.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currDistr.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: true} };
                var currSpeedGaps = { data: calcGaps(currSpeed.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currSpeed.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: true} };
                var currRoadGaps = { data: calcGaps(currRoad.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currRoad.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: true} };
                var currCompdGaps = { data: calcGaps(currCompd.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currCompd.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: true} };

                var currBrakeGaps = { data: calcGaps(currBrake.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currBrake.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: true} };
                var currLTGaps = { data: calcGaps(currLT.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currLT.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: true} };
                var currRTGaps = { data: calcGaps(currRT.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currRT.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: true} };
                var currAccelGaps = { data: calcGaps(currAccel.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currAccel.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: true} };

                var currSpeedHardGaps = { data: calcGaps(currSpeedHard.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currSpeedHard.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: false} };
                var currBrakeHardGaps = { data: calcGaps(currBrakeHard.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currBrakeHard.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: false} };
                var currLTHardGaps = { data: calcGaps(currLTHard.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currLTHard.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: false} };
                var currRTHardGaps = { data: calcGaps(currRTHard.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currRTHard.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: false} };
                var currAccelHardGaps = { data: calcGaps(currAccelHard.data), points: {show: false}, lines: {show: false}, shadowSize: 0, color: currAccelHard.color, label: false, dashes: {lineWidth: 1, dashLength: 8, show: false} };

                // plot gaps and real data
                dataToPlot = [
                  currAggrGaps, currAggr,
                  currDistrGaps, currDistr,
                  currSpeedGaps, currSpeed,
                  currRoadGaps, currRoad,
                  currCompdGaps, currCompd,
                  currBrakeGaps, currBrake,
                  currLTGaps, currLT,
                  currRTGaps, currRT,
                  currAccelGaps, currAccel,

                  currSpeedHardGaps, currSpeedHard,
                  currBrakeHardGaps, currBrakeHard,
                  currLTHardGaps, currLTHard,
                  currRTHardGaps, currRTHard,
                  currAccelHardGaps, currAccelHard
                ];
				        // console.log(dataToPlot[1]);

                var xmax = item.score_aggressive.length -0.95;
                var xticks = monthTicks;

                lineGraphOptions = {
                    legend: { show: false },
                    axisLabels: { show: true },  // https://github.com/markrcote/flot-axislabels
                    xaxes: [{ axisLabel: 'Date' }],  //
                    yaxes: [{ position: 'left', axisLabel: 'Score' }],  //
                    // lines: { show: true },
                    xaxis: { min: -0.05, max: xmax, mode: null, ticks: xticks },
                    yaxis: { min: 0, max: 10 },
                    series: {points: { radius: 1.3, fill: true, show: true, lineWidth: 2.8 }, shadowSize: 0},
                    grid: { hoverable: true, mouseActiveRadius: 10} //, markings: weekendMarkings, markingsLineWidth: marksWidth}
                };

                // PLOT
                  // $(".tab-trends").click(function(){

                      lplot = $.plot($("#lplaceholder"), dataToPlot, lineGraphOptions);

                      // TREND LINE TOOLTIPS     (http://stackoverflow.com/a/16554914  --  http://jsfiddle.net/larsenmtl/wnJGx/3/)
                      $("#lplaceholder").bind("plothover", createHoverLineGraphAllCallback(item, lplot, monthsAgo, "all"));
                      $("#lplaceholder").mouseleave(function(){
                            $("#ltooltip").remove();
                            previousPoint = null;
                      });

                      hoverTrendSelectorLI(lplot, item);

                $("#trend-fit-to-data").css("display", "block");
                $("#trend-fit-to-data").html("Fit to Data");
                $("#trend-fit-to-data").unbind('click');
                setupFitLineGraphToData(lplot, item);

                  // });
    }

                    function fitLineGraphToData(largestBuffered) {
                                // console.log("fitScatterToData()");
                                lplot.getOptions().yaxes[0].max = largestBuffered;
                    }

                    function setupFitLineGraphToData(plot, item) {
                                // console.log("running setupFitLineGraphToData()");

                                var plottedData = plot.getData();
                                var allDataPoints = [];
                                // console.log(plottedData);

                                //each series
                                for (var i = plottedData.length - 1; i >= 0; i--) {

                                      if (plottedData[i].label) {
                                          //each point in each series
                                          for (var j = 0; j < plottedData[i].data.length; j++) {
                                            if (plottedData[i].data[j][1]) {
                                                allDataPoints.push(plottedData[i].data[j][1]);
                                            }
                                          }

                                      }
                                }

                                // console.log(allDataPoints);
                                var largest = _.max(allDataPoints);
                                var largestBuffered = largest + (largest / 20);

                                // if using this equation would make xmax and ymax larger than 5, keep xmax and ymax at 5, don't show "fit to data" button
                                if (largestBuffered > (100/21)) {

                                    $("#trend-fit-to-data").css("display", "none");

                                // otherwise, toggle between "fit to data" and "reset" states
                                } else {
                                    $("#trend-fit-to-data").css("display", "block");

                                    $("#trend-fit-to-data").unbind("click");
                                    $("#trend-fit-to-data").click(function () {

                                        // change button text
                                        $('#trend-fit-to-data').html($('#trend-fit-to-data').text() == 'Reset Scale' ? 'Fit to Data' : 'Reset Scale');

                                        // if plot max is 5x5
                                        if (plot.getOptions().yaxes[0].max == 5) {
                                            $("#trend-fit-to-data").html("Reset Scale");
                                            fitLineGraphToData(largestBuffered);
                                        // if plot max is less than 5x5
                                        } else {
                                            $("#trend-fit-to-data").html("Fit to Data");
                                            fitLineGraphToData(5);
                                        }

                                        plot.setupGrid();
                                        plot.draw();

                                        // Reset TREND LINE TOOLTIPS     (http://stackoverflow.com/a/16554914  --  http://jsfiddle.net/larsenmtl/wnJGx/3/)
                                        $("#lplaceholder").bind("plothover", createHoverLineGraphAllCallback(item, lplot, monthsAgo, allOrOne));
                                        $("#lplaceholder").mouseleave(function(){
                                              $("#ltooltip").remove();
                                              previousPoint = null;
                                        });

                                    });
                                }
                    }

                    function setupIndivFitLineGraphToData(plot, item) {
                                // console.log("running setupIndivFitLineGraphToData()");

                                var plottedData = plot.getData();
                                var allDataPoints = [];
                                // console.log(plottedData);

                                //each series
                                for (var i = plottedData.length - 1; i >= 0; i--) {

                                    if (plottedData[i].label) {
                                        //each point in each series
                                        for (var j = 0; j < plottedData[i].data.length; j++) {
                                            if (plottedData[i].data[j][1]) {
                                                allDataPoints.push(plottedData[i].data[j][1]);
                                            }
                                        }
                                    }
                                }

                                // console.log(allDataPoints);
                                var largest = _.max(allDataPoints);
                                var largestBuffered = largest + (largest / 20);

                                // if using this equation would make xmax and ymax larger than 5, keep xmax and ymax at 5, don't show "fit to data" button
                                if (largestBuffered > (100/21)) {

                                    $("#trend-fit-to-data").css("display", "none");

                                // otherwise, toggle between "fit to data" and "reset" states
                                } else {
                                    $("#trend-fit-to-data").css("display", "block");

                                    $("#trend-fit-to-data").unbind("click");
                                    $("#trend-fit-to-data").click(function () {

                                        // change button text
                                        $('#trend-fit-to-data').html($('#trend-fit-to-data').text() == 'Reset Scale' ? 'Fit to Data' : 'Reset Scale');

                                        // if plot max is 5x5
                                        if (plot.getOptions().yaxes[0].max == 5) {
                                            $("#trend-fit-to-data").html("Reset Scale");
                                            fitLineGraphToData(largestBuffered);
                                        // if plot max is less than 5x5
                                        } else {
                                            $("#trend-fit-to-data").html("Fit to Data");
                                            fitLineGraphToData(5);
                                        }

                                        plot.setupGrid();
                                        plot.draw();

                                        $("#lplaceholder").unbind("plothover");
                                        $("#lplaceholder").bind("plothover", createHoverLineGraphAllCallback(item, lplot, monthsAgo));
                                        $("#lplaceholder").mouseleave(function(){
                                              $("#ltooltip").remove();
                                              previousPoint = null;
                                        });

                                    });
                                }
                    }

    function createHoverLineGraphAllCallback(thisData, lplot, monthsAgo) {
				// console.log("running createHoverLineGraphAllCallback();");

                return function hoverLineGraph(event, pos, item) {       // TREND LINE TOOLTIPS (http://stackoverflow.com/a/16554914  --  http://jsfiddle.net/larsenmtl/wnJGx/3/)


                    if (item) {

                        if (previousPoint !== item.dataIndex || previousSeries !== item.seriesIndex) {
        				// console.log("bind points hover");
        				// console.log("running hoverLineGraph() all");
        				// console.log(thisData);
        				// console.log(allOrOne);
        				// console.log(monthsAgo);

                            previousPoint = item.dataIndex;
                            previousSeries = item.seriesIndex;
                            var allSeries = lplot.getData();
    				    // console.log(allSeries);
                            var thisAvg;

                            var realData = [];
                            for (var i = 0; i < allSeries.length; i++) {
                              if (allSeries[i].label) {
                                realData.push(i);
                              }
                            }

                            // time
                            var thisTimeOrig;
                            if (thisData.total_time[previousPoint]) {
                                thisTimeOrig = thisData.total_time[previousPoint];
                            } else {
                                thisTimeOrig = 0;
                            }
                            var thisTime = moment.duration(thisTimeOrig, "seconds").format("h", 1) + " hours";

                            // distance
                            var thisDistance;
                            if (thisData.total_distance[previousPoint]) {
                                thisDistance = thisData.total_distance[previousPoint] + " miles";
                            } else {
                                thisDistance = 0 + " miles";
                            }

                            // label
                            var thisLabel;
                            if (thisData.label) {
                                thisLabel = thisData.label;
                            } else {
                                thisLabel = "Fleet";
                            }
    				    // console.log(thisLabel);


                            var scoreName;
                            $("#ltooltip").remove();

                            for (var i = 0; i < realData.length; i++) {
                              thisAvg = allSeries[item.seriesIndex].dataTT[item.dataIndex][1];
                              scoreName = allSeries[item.seriesIndex].label;
                            }

                            var datestamp;

                            // if group graph
                            if (thisData.score_aggressive.length < 20) {
                                datestamp = monthNameList[item.dataIndex];

                            // if individual graph
                            } else {
    				    // console.log(monthsAgo);
                                datestamp = moment().subtract(monthsAgo, 'months').format("MMMM") + " " + (parseInt(item.dataIndex) + 1) + ", " + moment().subtract(monthsAgo, 'months').format("YYYY");
                                datestamp = moment(datestamp, "MMMM DD, YYYY").format("ddd, MMMM DD, YYYY"); // add day of week
                            }

                            // tooltip HTML
                            var tooltipContent = "<div><b>" + datestamp + "</b></div>";

                            // if this page's group or individual is hovered
                            tooltipContent += "<div><b>" + thisLabel + "</b></div>";
                            tooltipContent += "<div>" + thisDistance + " | " + thisTime + "</div>";
                            tooltipContent += "<div class='" + scoreName.toLowerCase().split(' ').join('-') + "-ttbg'>" + scoreName + ": " + thisAvg + "</div>";



                            if (allOrOne == "all") {

                                $.each(realData, function(key, val) {
                                    // if another series has the same x-y, add it to the tooltip
                                    if (val !== item.seriesIndex && allSeries[val].dataTT[item.dataIndex][1] == thisAvg) {

                                        var overlapScoreName = allSeries[val].label;
                                        if (allSeries[val].type[1] !== "severe") {
                                          tooltipContent += "<div class='" + overlapScoreName.toLowerCase().split(' ').join('-') + "-ttbg'>" + overlapScoreName + ": " + thisAvg + "</div>";
                                        }

                                    }
                                });

                            } else if (allOrOne == "one") {

                                $.each(realData, function(key, val) {
                                    if (val !== item.seriesIndex && allSeries[val].dataTT[item.dataIndex][1] == thisAvg) {

                                        var overlapScoreName = allSeries[val].label;
                                        if (allSeries[val].type[0] == allSeries[item.seriesIndex].type[0]) {
                                          tooltipContent += "<div class='" + overlapScoreName.toLowerCase().split(' ').join('-') + "-ttbg'>" + overlapScoreName + ": " + thisAvg + "</div>";
                                        }

                                    }
                                });

                            }






                            showTooltip(item.pageX, item.pageY, tooltipContent, "ltooltip");
                        }
                    } else {
                        $("#ltooltip").delay(2500).fadeOut("normal", function () { $(this).remove(); });
                        previousPoint = null;
                    }
                };
    }

    function coachedLabelClickable() {
				// console.log("coachedLabelClickable()");
                $("p.coachedMarkerLabel").unbind("click");
                $("p.coachedMarkerLabel").click(function(){
                    var thisAlertID = $(this).data('index');
                    highlightAlert(thisAlertID);
                });
    }

    function hoverTrendSelectorLI(lplot, thisData) {
				// console.log("running hoverTrendSelectorLI()");
				// console.log(monthsAgo);

                var lplottedData = lplot.getData();
				// console.log(lplottedData);
                var seriesID;

                // IF HOVERING THE LABELS ABOVE THE GRAPH
                $('#trendSelector li').unbind('mouseenter mouseleave');

                $('#trendSelector li').hover(function () {  // MOUSE HOVER IN

                        seriesID = $(this).data('index');
                        lplot.unhighlight();

                        for (var i = lplottedData.length - 1; i >= 0; i--) {
                            if (seriesID == i && lplottedData[i].data.length > 0) { // [any IFs within this IF] break this
                                lplottedData[i].lines.lineWidth = 4.5;
                                lplot.draw();
                            }
                        }

                }, function () {   // MOUSE HOVER OUT

                    // previousPoint = null;
                    for (i = lplottedData.length - 1; i >= 0; i--) {
                        lplottedData[i].lines.lineWidth = 2.3;
                    }
                    lplot.draw();
                });

                        $('#trendSelector li').unbind("click");
                        $('#trendSelector li').click(function(){

                                if (seriesID == 100) {
                                    $('#trendSelector li').removeClass("unselected");

                                    for (var i = lplottedData.length - 1; i >= 0; i--) {

                                        // if a plotted line (not a coaching marker)
                                        if (!lplottedData[i].markdata) {

                                            // dashed lines (regular)
                                            if (isEven(i) && lplottedData[i+1].type[1] == "regular") {
                                              lplottedData[i].dashes.show = true;

                                            // real data series (regular)
                                            } else if (!isEven(i) && lplottedData[i].type[1] == "regular") {
                                              lplottedData[i].lines.show = true;
                                              lplottedData[i].points.show = true;

                                            // dashed lines (severe)
                                            } else if (isEven(i) && lplottedData[i+1].type[1] == "severe") {
                                              lplottedData[i].dashes.show = false;

                                            // real data series (severe)
                                            } else if (!isEven(i) && lplottedData[i].type[1] == "severe") {
                                              lplottedData[i].lines.show = false;
                                              lplottedData[i].points.show = false;
                                            }
                                        }
                                    }
                                    // redraw
                                    lplot.draw();
				                      // console.log("lplot drawn click redraw");
                                    $("#lplaceholder").unbind("plothover");
                                    allOrOne = "all";

                                } else {
                                    $('#trendSelector li').addClass("unselected");
                                    $(this).removeClass("unselected");

                                    for (var i = 0; i < lplottedData.length; i++) {

                                        // hide all other series
                                        lplottedData[i].lines.show = false;
                                        lplottedData[i].dashes.show = false;
                                        lplottedData[i].points.show = false;

                                        if (lplottedData[i].type && i !== seriesID && lplottedData[i].type[0] == lplottedData[seriesID].type[0]) {

                                            // show severe dashed line
                                            lplottedData[i-1].dashes.show = true;

                                            // show severe line
                                            lplottedData[i].lines.show = true;
                                            lplottedData[i].points.show = true;

                                        }
                                    }

                                    // show this dashed line
                                    lplottedData[seriesID-1].dashes.show = true;

                                    // show this line
                                    lplottedData[seriesID].lines.show = true;
                                    lplottedData[seriesID].points.show = true;

                                    // redraw
                                    lplot.draw();

                                    $("#lplaceholder").unbind("plothover");
                                    allOrOne = "one";
                                }

                                $("#lplaceholder").bind("plothover", createHoverLineGraphAllCallback(thisData, lplot, monthsAgo, allOrOne));
                                $("#lplaceholder").mouseleave(function(){
                                      $("#ltooltip").remove();
                                      previousPoint = null;
                                });

                                // Tooltips are appropriate to "all" or "one" graph being plotted
                                previousPoint = null;
                                previousSeries = null;

                            });
    }

    function maintainCurrentSeries(lplottedData, allOrOne) {
				// console.log("running maintainCurrentSeries()");
				// console.log(lplottedData);
                $("#trendSelector li").each(function(){
                    if ($(this).hasClass("unselected")) {
                        var hidePlot = $(this).data('index');
                        if (hidePlot !== 100) {

                            // hide this dashed line
                            lplottedData[hidePlot-1].dashes.show = false;

                            // hide this line
                            lplottedData[hidePlot].lines.show = false;
                            lplottedData[hidePlot].points.show = false;

                        }
                    } else {
                        var showPlot = $(this).data('index');
                        if (showPlot !== 100) {

                            for (var i = 0; i < lplottedData.length; i++) {

                                var thisRealData = _.has(lplottedData[i], 'type');
                                if (thisRealData === true && i !== showPlot && lplottedData[i].type[0] == lplottedData[showPlot].type[0]) {

                                    if (lplottedData[i].type[1] !== "severe" && allOrOne == "all") {


                                      // show this dashed line
                                      lplottedData[i-1].dashes.show = true;
                                      // show this line
                                      lplottedData[i].lines.show = true;
                                      lplottedData[i].points.show = true;

                                    } else if (allOrOne == "one") {


                                      // show this dashed line + severe dashed line
                                      lplottedData[i-1].dashes.show = true;
                                      // show this line + severe line
                                      lplottedData[i].lines.show = true;
                                      lplottedData[i].points.show = true;

                                    }
                                }
                            }
                        }
                    }
                });

                // redraw
                lplot.draw();
				// console.log("lplot drawn maintain current series");
    }

    // for individual scores
    function loadIndividualData(monthsAgo, groupID) { // monthsAgo and groupID needed for date picker dropdown
				// console.log("running loadIndividualData()");

                return function(trendData) {
				// console.log(trendData);

                    var aggrPlot = {thisData: trendData, type: ["aggr","regular"], dataOrig: trendData.score_aggressive, thisPlotLabel: "Aggressiveness", scoreTypeKey: "score_aggressive", thisPlotColor: "rgba(37, 132, 119, 1)", groupID: groupID };
                    var distrPlot = {thisData: trendData, type: ["distr", "regular"], dataOrig: trendData.score_distracted, thisPlotLabel: "Distraction", scoreTypeKey: "score_distracted", thisPlotColor: "rgba(42, 108, 150, 1)", groupID: groupID };
                    var speedPlot = {thisData: trendData, type: ["speed", "regular"], dataOrig: trendData.score_speed, thisPlotLabel: "Speeding", scoreTypeKey: "score_speed", thisPlotColor: "rgba(169, 56, 53, 1)", groupID: groupID };
                    var roadPlot = {thisData: trendData, type: ["road", "regular"], dataOrig: trendData.score_road_alert, thisPlotLabel: "Road Alerts", scoreTypeKey: "score_road_alert", thisPlotColor: "rgba(117, 82, 149, 1)", groupID: groupID};
                    var compdPlot = {thisData: trendData, type: ["compd", "regular"], dataOrig: trendData.score_compound, thisPlotLabel: "Compound Events", scoreTypeKey: "score_compound", thisPlotColor: "rgba(208, 103, 0, 1)", groupID: groupID };
                    var brakePlot = {thisData: trendData, type: ["brake", "regular"], dataOrig: trendData.score_brake, thisPlotLabel: "Braking", scoreTypeKey: "score_brake", thisPlotColor: "rgba(83, 138, 180, 1)", groupID: groupID };
                    var LTPlot = {thisData: trendData, type: ["lt", "regular"], dataOrig: trendData.score_left_turn, thisPlotLabel: "Left Turn", scoreTypeKey: "score_left_turn", thisPlotColor: "rgba(19, 144, 0, 1)", groupID: groupID };
                    var RTPlot = {thisData: trendData, type: ["rt", "regular"], dataOrig: trendData.score_right_turn, thisPlotLabel: "Right Turn", scoreTypeKey: "score_right_turn", thisPlotColor: "rgba(216, 181, 0, 1)", groupID: groupID };
                    var accelPlot = {thisData: trendData, type: ["accel", "regular"], dataOrig: trendData.score_acceleration, thisPlotLabel: "Acceleration", scoreTypeKey: "score_acceleration", thisPlotColor: "rgba(140, 0, 88, 1)", groupID: groupID };

                    var speedPlotHard = {thisData: trendData, type: ["speed", "severe"], dataOrig: trendData.score_speed_severe, thisPlotLabel: "High Speeding", scoreTypeKey: "score_speed_severe", thisPlotColor: "#dd1111", groupID: groupID };
                    var brakePlotHard = {thisData: trendData, type: ["brake", "severe"], dataOrig: trendData.score_brake_severe, thisPlotLabel: "Hard Braking", scoreTypeKey: "score_brake_severe", thisPlotColor: "#dd1111", groupID: groupID };
                    var LTPlotHard = {thisData: trendData, type: ["lt", "severe"], dataOrig: trendData.score_left_turn_severe, thisPlotLabel: "Hard Left Turn", scoreTypeKey: "score_left_turn_severe", thisPlotColor: "#dd1111", groupID: groupID };
                    var RTPlotHard = {thisData: trendData, type: ["rt", "severe"], dataOrig: trendData.score_right_turn_severe, thisPlotLabel: "Hard Right Turn", scoreTypeKey: "score_right_turn_severe", thisPlotColor: "#dd1111", groupID: groupID };
                    var accelPlotHard = {thisData: trendData, type: ["accel", "severe"], dataOrig: trendData.score_acceleration_severe, thisPlotLabel: "Hard Acceleration", scoreTypeKey: "score_acceleration_severe", thisPlotColor: "#dd1111", groupID: groupID };


                    var coachedData = trendData.dates_coached;



                    var trendInitial = "initial";
                    plotIndividualLineGraph(coachedData, aggrPlot, distrPlot, speedPlot, roadPlot, compdPlot, brakePlot, LTPlot, RTPlot, accelPlot, speedPlotHard, brakePlotHard, LTPlotHard, RTPlotHard, accelPlotHard);
                    $("#trendSelector li").removeClass("unselected");
                    $("#trendMonths").addClass("inactive");
                    $("#trendDaily").removeClass("inactive");
                    var lplottedData = lplot.getData();
                    coachedLabelClickable();

                    $("#trendDaily").unbind("click");
                    $("#trendDaily").click(function () {
				    // console.log("clicked trendDaily");
                        plotIndividualLineGraph(coachedData, aggrPlot, distrPlot, speedPlot, roadPlot, compdPlot, brakePlot, LTPlot, RTPlot, accelPlot, speedPlotHard, brakePlotHard, LTPlotHard, RTPlotHard, accelPlotHard);
                        $("#trendDaily").removeClass("inactive");
                        $("#trendMonths").addClass("inactive");
                        lplottedData = lplot.getData();
                        maintainCurrentSeries(lplottedData, allOrOne); // only do this if one trendSelector li is selected
                        coachedLabelClickable();

                    });

                    $("#trendMonths").unbind("click");

                    $("#trendMonths").click(function () {
				    // console.log("clicked trendMonthly");
                        plotLineGraph(thisIndividual);
                        $("#trendDaily").addClass("inactive");
                        $("#trendMonths").removeClass("inactive");

                        lplottedData = lplot.getData();
                        maintainCurrentSeries(lplottedData, allOrOne);
                    });


                    // REPORTS DATA
                    // while the data is available, set up default report for individual

                    if (monthsAgo =="all") { // if "All Months" period is selected
                      generateAveragesReport("monthly", thisIndividual, 0);
                    } else {
                      generateAveragesReport("daily", thisIndividual, monthsAgo, trendData);
                    }

                };
    }

    function setupWeekendMarkings(weekends) {

                var weekendMarkings = [];
                var weekendColor;

                // for future implementation of a weekend toggle
                if (weekends == "weekends") {
                    weekendColor = "rgba(169, 56, 53, 0.8)";
                } else {
                    weekendColor = "#dddddd";
                }


                // ticks for month being viewed
                for (var i = 0; i < parseInt(moment().subtract(monthsAgo, 'months').daysInMonth()); i++) {
                    numTick.push([i, i + 1]);

                    // markings for weekends
                    var thisMonth = moment().subtract(monthsAgo, 'months').format("M");
                    var thisDay = thisMonth + "-" + (i + 1);
                    var dayOfWeek = moment(thisDay, "M-D").format("d");

                    // if day of week = sunday or saturday
                    if (dayOfWeek == 0 || dayOfWeek == 6) {
                        weekendMarkings.push({ xaxis: { from: i, to: i}, color: weekendColor });

                    // if day of week = weekday
                    } else if (dayOfWeek == 1 || dayOfWeek == 2 || dayOfWeek == 3 || dayOfWeek == 4 || dayOfWeek == 5 ) {
                        weekendMarkings.push({ xaxis: { from: i, to: i}, color: "#dddddd" });
                    }
                }

                return weekendMarkings;
    }

    function plotIndividualLineGraph(coachedData) {
				// console.log("running plotIndividualLineGraph()");
                $("#lplaceholder").css("width", "987px");
				// console.log(coachedData);

                // CLEAR
                $("#lplaceholder").unbind("plothover"); // reset hover event

                var thisScoreTypeGaps = {};
                dataToPlot = [];
                // if (monthsAgo == "all") {
                //   xmax = parseInt(moment().daysInMonth()) - 0.9;
                // }
                xmax = parseInt(moment().subtract(monthsAgo, 'months').daysInMonth()) - 0.9;
                // var xLabel = moment().subtract(monthsAgo, 'months').format('MMMM YYYY');
                numTick = [];

                // each score type requested (all parameters except interval and monthsAgo)
                for (var i = 1; i < arguments.length; i++) {
				// console.log(i);
                    arguments[i].data = [];
                    arguments[i].dataTT = [];
				// console.log(arguments[i]);

                    // if any data exists in fleet
                    if (datasets[arguments[i].scoreTypeKey].length) {

                        // j = each data point
                        for (var j = 0; j < arguments[i].dataOrig.length; j++) {


                            // ADD THIS tooltip data (orig)
                            arguments[i].dataTT.push([j, arguments[i].dataOrig[j]]);

                            // ADD THIS plotting data (cap at 5)
                            if (arguments[i].dataOrig[j] < 10) {
                                arguments[i].data.push([j, arguments[i].dataOrig[j]]);
                            } else {arguments[i].data.push([j, 10]);}
                        }

                        arguments[i].color = arguments[i].thisPlotColor;
                        arguments[i].label = arguments[i].thisPlotLabel;

                        var thisGapsData;
                        if (arguments[i].type[1] == "regular") {

                          arguments[i].lines = {show: true};
                          thisGapsData = calcGaps(arguments[i].data);
                          thisScoreTypeGaps = { data: thisGapsData, points: {show: false}, lines: {show: false}, shadowSize: 0, color: arguments[i].thisPlotColor, label: false, dashes: {lineWidth: 1, dashLength: 8, show: true} }; // see http://jsfiddle.net/ecd3g23g/1/

                        } else if (arguments[i].type[1] == "severe") {

                          arguments[i].lines = {show: false};
                          arguments[i].points = {show: false};
                          thisGapsData = calcGaps(arguments[i].data);
                          thisScoreTypeGaps = { data: thisGapsData, points: {show: false}, lines: {show: false}, shadowSize: 0, color: arguments[i].thisPlotColor, label: false, dashes: {lineWidth: 1, dashLength: 8, show: false} }; // see http://jsfiddle.net/ecd3g23g/1/

                        }
				// console.log(arguments[i]);

                        dataToPlot.push(thisScoreTypeGaps, arguments[i]);

                    } else {
                        dataToPlot.push({ data: [0, null] }, { data: [0, null] });
                    }
                }
                            var weekendMarkings = setupWeekendMarkings("weekends");

                // coached marks
				// console.log("adding coached marks");

                            var coachedMarks = {marks: {show: true}, data: [], markdata: []};
                            var prevCoachedDay;
                            var tdy = new Date();
                            var n = tdy.getTimezoneOffset() * 60 * -1;

                            for (var i = 0; i < coachedData.length; i++) {
                                var thisCoachedDay = parseInt(moment.utc(coachedData[i].date_coached +n, "X").format("D")) - 1;
				// console.log(thisCoachedDay);
                                var coachedTime = moment.utc(coachedData[i].date_coached + n, "X").format("h:mm a");
                                var alertId = coachedData[i].id;
                                var pos0 = {label: "<p class='coachedMarkerLabel' data-index='"+alertId+"'>Coached:<br>" + coachedTime + "</p>", position: thisCoachedDay, row: 0};
                                var pos2 = {label: "<p class='coachedMarkerLabel' data-index='"+alertId+"'>Coached:<br>" + coachedTime + "</p>", position: thisCoachedDay, row: 2};
                                var prevMarker = coachedMarks.markdata[coachedMarks.markdata.length - 1];

                                if (thisCoachedDay === prevCoachedDay) {
                                    coachedMarks.markdata[i - 1].label = coachedMarks.markdata[i - 1].label + "<br>" + coachedTime;

                                } else if (i === 0) {
                                    coachedMarks.markdata.push(pos0);

                                } else if (prevMarker.row === 0 && thisCoachedDay == prevCoachedDay + 1) {
                                    coachedMarks.markdata.push(pos2);

                                } else {
                                    coachedMarks.markdata.push(pos0);
                                }

                                prevCoachedDay = thisCoachedDay;
                            }
				// console.log(coachedMarks);
                            dataToPlot.push(coachedMarks);

                // OPTIONS

                lineGraphOptions = {
                    legend: { show: false },
                    axisLabels: { show: true },  // https://github.com/markrcote/flot-axislabels
                    xaxes: [{ axisLabel: moment().subtract(monthsAgo, 'months').format('MMMM YYYY') }],  //
                    yaxes: [{ position: 'left', axisLabel: 'Score' }],  //
                    // lines: { show: true },
                    xaxis: { min: -0.05, max: xmax, mode: null, ticks: numTick, tickLength: 0 },
                    yaxis: { min: 0, max: 10},
                    series: {points: { radius: 1.3, fill: true, show: true, lineWidth: 2.8 }, shadowSize: 0,
                        marks: {
                            show: false,
                            lineWidth: 3,
                            toothSize: 3,
                            color: "rgba(19, 144, 0, 1.0)",
                            fill: true,
                            fillColor: "rgba(19, 144, 0, 0.6)",
                            showLabels: true,
                            rowHeight: 30,
                            rows: 2,
                            labelVAlign: "top",
                            labelHAlign: "right",
                        }
                    },
                    grid: { hoverable: true, mouseActiveRadius: 10, markings: weekendMarkings, markingsLineWidth: 1},
                };
				// console.log(dataToPlot);


                // PLOT
                lplot = $.plot($("#lplaceholder"), dataToPlot, lineGraphOptions);

                // TOOLTIPS
                previousPoint = null;
                previousSeries = null;
				// console.log("all initial");
                var thisData = arguments[1].thisData;
                //$("#lplaceholder").bind("plothover", hoverLineGraphCallback(monthsAgo, "all"));
                $("#lplaceholder").unbind("plothover");
				// console.log(monthsAgo);
				// console.log("unbind points hover");
                $("#lplaceholder").bind("plothover", createHoverLineGraphAllCallback(thisData, lplot, monthsAgo));
                $("#lplaceholder").mouseleave(function(){
                      $("#ltooltip").remove();
                      previousPoint = null;
                });

                // REPLOT FOR CORRECT DIMENSIONS
                    // $(".tab-trends").click(function(){
                    //     lplot = $.plot($("#lplaceholder"), dataToPlot, lineGraphOptions);
                    // });

                hoverTrendSelectorLI(lplot, thisData);
                // $('#trendSelector li').unbind("hover");
				// console.log("unbind li hover");

                $("#trend-fit-to-data").css("display", "block");
                $("#trend-fit-to-data").html("Fit to Data");
                $("#trend-fit-to-data").unbind('click');
                setupIndivFitLineGraphToData(lplot, thisData);
    }


    // DOTTED LINE FUNCTIONS

        //y = mx + b
        //2 known xy pairs [0,0],[1,1]
        function calcSlope(x1y1, x2y2) {
            return (x2y2[1] - x1y1[1]) / (x2y2[0] - x1y1[0]);
        }

        //y − y1 = m(x − x1)
        //known x, known slope, known xy pair [0,0]
        function solveForY(x, m, x1y1) {
           return (m * (x - x1y1[0])) + x1y1[1];
        }

        function calcGaps(values) {
           var result = [];

           for(var i=0; i<values.length; i++) {
              if(values[i][1] !== null) {
                result.push(values[i]);
              } else {
              var lastIndex = findLastIndexWithValue(i, values);
              var nextIndex = findNextIndexWithValue(i, values);

              if(lastIndex === null || nextIndex === null) {
                result.push(values[i]);
                continue;
              }

              //calculate this point,
              var m = calcSlope(values[lastIndex], values[nextIndex]);

               var y = solveForY(values[i][0], m, values[lastIndex]);
               result.push([values[i][0], y]);

              }
           }
				// console.log(result);
            return result;
        }

        function findLastIndexWithValue(i, values) {
            for(var j=i-1; j>=0; j--) {
               if(values[j][1] !== null) {
               return j;
                }
            }

            return null;
        }

        function findNextIndexWithValue(i, values) {
            for(var j=i+1; j<values.length; j++) {
               if(values[j][1] !== null) {
                    return j;
                }
            }

            return null;
        }


    // ------------------------------------------- BAR GRAPH ON INDIVIDUAL PAGE -----------------------------------


    function createHoverBarGraphCallback(individualScores, groupScores, individualSevereScores, groupSevereScores) {

        return function hoverBarGraph(event, pos, item) {
				// console.log("running hoverBarGraph()");

                var blabels = ['Road Alerts','Speed','Compound','Acceleration','Right Turn','Left Turn','Braking'];
                var bSevereLabels = ['High Speed','Hard Acceleration','Hard Right Turn','Hard Left Turn','Hard Braking'];

                if (item) {
				// console.log(item);

                    // if (previousPoint !== item.dataIndex || previousSeries !== item.seriesIndex) {

                        previousPoint = item.dataIndex;
                        previousSeries = item.seriesIndex;
                        $("#btooltip").remove();

                        //THIS SCORE
                        var thisScore, thisColor, thisLabel;
                        var groupScore;
                        if (previousSeries === 0) {
                            thisScore = individualScores;
                            thisColor = barColorIndiv;
                            thisLabel = blabels;
                            groupScore = groupScores;

                        } else if (previousSeries == 1) {
                            thisScore = individualSevereScores;
                            thisColor = barColorIndivSevere;
                            thisLabel = bSevereLabels;
                            groupScore = groupSevereScores;
                        }

                        // severe or not
                        // var isSevere = '';
                        // if (previousSeries == 1) {
                        //     isSevere = " <span style='border-bottom: 3px solid " + thisColor + "; border-top: 3px solid " + thisColor + ";'>Severe</span>";
                        // }

                        var tooltipContent = "<div>" + thisLabel[item.dataIndex] + ": " + thisScore[item.dataIndex] + "</div>";
                        tooltipContent += "<div>Group " + thisLabel[item.dataIndex] + ": " + groupScore[item.dataIndex] + "</div>";


                        showTooltip(pos.pageX, pos.pageY, tooltipContent, "btooltip");
                        document.body.style.cursor = 'pointer';


                        // }
                    } else {
                            $("#btooltip").delay( 200 ).fadeOut("normal", function() {$(this).remove();});
                            document.body.style.cursor = 'default';
                    }
        };
    }

    function getBarData (barplot, individualScores, groupScores, individualSevereScores, groupSevereScores) {
				// console.log("running getBarData()");
                // get individual scores for plot label
                $.each(barplot.getData()[0].data, function(i, el){
                    individualScores.push(el[0]);
                });

                // get individual severe scores for plot label
                $.each(barplot.getData()[1].data, function(i, el){
                    individualSevereScores.push(el[0]);
                });

                // get group scores for plot tooltip

                        // get group scores for plot label
                        $.each(barplot.getData()[2].data, function(i, el){
                            groupScores.push(el[0]);
                        });

                        // get group severe scores for plot label
                        $.each(barplot.getData()[3].data, function(i, el){
                            groupSevereScores.push(el[0]);
                        });
    }

    function barLabelOptions (barplot) { //format labels on bar plot
				// console.log("running barLabelOptions()");
                // http://stackoverflow.com/a/2601155

                // get individual scores for plot label, add label
                $.each(barplot.getData()[0].data, function(i, el){
                    var o = barplot.pointOffset({x: el[0], y: el[1]});

                    var name = "";
                    $.each(bytickNames, function(i2, el2){
                        if (el2[0] == el[1]) {
                            name = el2[1];
                        }
                    });

                    // if bar is more than 450px wide, put label inside bar
                    if (o.left > 450) {
                        // get width of label
                        var labelWidth = $('<div class="data-point-label" style="overflow-x: visible; white-space: nowrap;">' + name + '</div>').css( { // + ': <b>' + el[0] + severeLabel + '</b>'
                            display: 'none'
                        }).appendTo(barplot.getPlaceholder()).width();
                        // var labelWidth = $('<div class="data-point-label" style="overflow-x: visible; white-space: nowrap;">' + name + '</div>').width();
                        $('<div class="data-point-label" style="overflow-x: visible; white-space: nowrap;">' + name + '</div>').remove();
                        if (o.left > 579) {o.left = 579;}

                        $('<div class="data-point-label" style="overflow-x: visible; white-space: nowrap;">' + name + '</div>').css( { // + ': <b>' + el[0] + severeLabel + '</b>'
                            color: '#fff',
                            position: 'absolute',
                            'text-align': 'right',
                            left: o.left - labelWidth - 10,
                            top: o.top - 24,
                            display: 'none'
                        }).appendTo(barplot.getPlaceholder()).fadeIn('slow');

                    } else {
                        $('<div class="data-point-label" style="overflow-x: visible; white-space: nowrap;">' + name + '</div>').css( { // + ': <b>' + el[0] + severeLabel + '</b>'
                            position: 'absolute',
                            'text-align': 'left',
                            left: o.left + 10,
                            top: o.top - 24,
                            display: 'none'
                        }).appendTo(barplot.getPlaceholder()).fadeIn('slow');
                    }
                });
    }


    // ................................................ REPORTS TAB .....................................................


    function generateComparisonReport(monthlyData, compareThis, monthsAgo) {
                // clear previous reports

                $("#reports-container table tbody").html('');
                $("#reports-container #printed-timestamp").html(moment().format('[Printed on] MMMM D, YYYY [at] h:mm a'));

                var totalMonths = monthlyData[compareThis][0].score_aggressive.length;
                var monthIndex = totalMonths-1-monthsAgo;
                var selectedMonthName = moment().subtract(monthsAgo, "months").format("MMMM YYYY");
                var capCompareThis = capitalizeFirstLetter(compareThis);
                if (capCompareThis == "Individuals") {capCompareThis = "Vehicles";}


                // report title
                var label;
                if (monthlyData.label) {label = monthlyData.label;} else {label = "Fleet";}
                var firstMonthName = moment().subtract(totalMonths-1, "months").format("MMMM YYYY");
                $("#reports-container h3").html(label + " Report: Compare " + capCompareThis + "<br><span style='font-weight: normal;'>" + selectedMonthName + "</span>");

                // report table column headers
                $("#reports-container table th.vehicle").html(capCompareThis);
                // add hidden first row (as header row in csv)
                $("#reports-container table tbody").html('<tr class="screen-hidden print-hidden"><td class="vehicle">'+capCompareThis+'</td><td class="time">Time Driven</td><td class="miles">Miles</td><td class="scores">Aggr</td><td class="scores">Distr</td><td class="scores">Brake</td><td class="scores">Accel</td><td class="scores">Speed</td><td class="scores">LTurn</td><td class="scores">RTurn</td><td class="scores">Road</td><td class="scores">Compd</td><td class="alerts">Alerts</td></tr>');

                // report table contents
                for (var i = 0; i < monthlyData[compareThis].length; i++) {

                    var thisCompareLabel = monthlyData[compareThis][i].label;

                    // drive time
                    var driveTimeSeconds = monthlyData[compareThis][i].total_time[monthIndex];
                    if (driveTimeSeconds === null) {driveTimeSeconds = 0;}
                    var driveTimeHours = moment.duration(driveTimeSeconds, "seconds").format("h", 1);
                    var driveTimeHourLabel = "[hours]";
                    if (driveTimeHours == 1) { driveTimeHourLabel = "[hour]"; }
                    var driveTimeHuman = moment.duration(driveTimeSeconds, "seconds").format("h " + driveTimeHourLabel, 1);

                    // miles
                    var driveMiles = monthlyData[compareThis][i].total_distance[monthIndex];

                    // scores
                    var agg = monthlyData[compareThis][i].score_aggressive[monthIndex];
                    var dis = monthlyData[compareThis][i].score_distracted[monthIndex];
                    var spe = monthlyData[compareThis][i].score_speed[monthIndex];
                    var roa = monthlyData[compareThis][i].score_road_alert[monthIndex];
                    var com = monthlyData[compareThis][i].score_compound[monthIndex];
                    var bra = monthlyData[compareThis][i].score_brake[monthIndex];
                    var lef = monthlyData[compareThis][i].score_left_turn[monthIndex];
                    var rig = monthlyData[compareThis][i].score_right_turn[monthIndex];
                    var acc = monthlyData[compareThis][i].score_acceleration[monthIndex];

                    // alerts
                    var numAlerts = monthlyData[compareThis][i].total_events[monthIndex];

                    // if null
                    if (driveMiles === null) {driveMiles = 0;}
                    if (agg === null) {agg = 0;}
                    if (dis === null) {dis = 0;}
                    if (spe === null) {spe = 0;}
                    if (roa === null) {roa = 0;}
                    if (com === null) {com = 0;}
                    if (bra === null) {bra = 0;}
                    if (lef === null) {lef = 0;}
                    if (rig === null) {rig = 0;}
                    if (acc === null) {acc = 0;}
                    if (numAlerts === null) {numAlerts = 0;}

                    // if undefined
                    if (driveMiles === undefined) {driveMiles = "--";}
                    if (agg === undefined) {agg = "--";}
                    if (dis === undefined) {dis = "--";}
                    if (spe === undefined) {spe = "--";}
                    if (roa === undefined) {roa = "--";}
                    if (com === undefined) {com = "--";}
                    if (bra === undefined) {bra = "--";}
                    if (lef === undefined) {lef = "--";}
                    if (rig === undefined) {rig = "--";}
                    if (acc === undefined) {acc = "--";}
                    if (numAlerts === undefined) {numAlerts = "--";}



                    $("#reports-container table tbody").append("<tr><td class='vehicle'>"+thisCompareLabel+"</td><td class='time'>"+driveTimeHuman+"</td><td class='miles'>"+driveMiles+"</td><td class='scores'>"+agg+"</td><td class='scores'>"+dis+"</td><td class='scores'>"+bra+"</td><td class='scores'>"+acc+"</td><td class='scores'>"+spe+"</td><td class='scores'>"+lef+"</td><td class='scores'>"+rig+"</td><td class='scores'>"+roa+"</td><td class='scores'>"+com+"</td><td class='alerts'>"+numAlerts+"</td></tr>");
                }

                var monthDriveTimeHuman = moment.duration(monthlyData.total_time[monthIndex], "seconds").format("h [hours]", 1);

                var monthDriveMiles = monthlyData.total_distance[monthIndex];

                var monthAgg = monthlyData.score_aggressive[monthIndex];
                var monthDis = monthlyData.score_distracted[monthIndex];
                var monthBra = monthlyData.score_brake[monthIndex];
                var monthAcc = monthlyData.score_acceleration[monthIndex];
                var monthSpe = monthlyData.score_speed[monthIndex];
                var monthLef = monthlyData.score_left_turn[monthIndex];
                var monthRig = monthlyData.score_right_turn[monthIndex];
                var monthCom = monthlyData.score_compound[monthIndex];
                var monthRoa = monthlyData.score_road_alert[monthIndex];
                var monthAlerts = monthlyData.total_unreviewed_events[monthIndex];

                // if null
                if (monthlyData.total_time[monthIndex] === null) {monthDriveTimeHuman = "0.0 hours";}
                if (monthDriveMiles === null) {monthDriveMiles = 0;}
                if (monthAgg === null) {monthAgg = 0;}
                if (monthDis === null) {monthDis = 0;}
                if (monthBra === null) {monthBra = 0;}
                if (monthAcc === null) {monthAcc = 0;}
                if (monthSpe === null) {monthSpe = 0;}
                if (monthLef === null) {monthLef = 0;}
                if (monthRig === null) {monthRig = 0;}
                if (monthCom === null) {monthCom = 0;}
                if (monthRoa === null) {monthRoa = 0;}
                if (monthAlerts === null) {monthAlerts = 0;}

                // if undefined
                if (monthlyData.total_time[monthIndex] === undefined) {monthDriveTimeHuman = "0.0 hours";}
                if (monthDriveMiles === undefined) {monthDriveMiles = "--";}
                if (monthAgg === undefined) {monthAgg = "--";}
                if (monthDis === undefined) {monthDis = "--";}
                if (monthBra === undefined) {monthBra = "--";}
                if (monthAcc === undefined) {monthAcc = "--";}
                if (monthSpe === undefined) {monthSpe = "--";}
                if (monthLef === undefined) {monthLef = "--";}
                if (monthRig === undefined) {monthRig = "--";}
                if (monthCom === undefined) {monthCom = "--";}
                if (monthRoa === undefined) {monthRoa = "--";}
                if (monthAlerts === undefined) {monthAlerts = "--";}



                // report table footer (Total)
                $("#reports-container table tfoot").html("<tr><td class='vehicle'>Total</td><td class='time'>"+monthDriveTimeHuman+"</td><td class='miles'>"+monthDriveMiles+"</td><td class='scores'>"+monthAgg+"</td><td class='scores'>"+monthDis+"</td><td class='scores'>"+monthBra+"</td><td class='scores'>"+monthAcc+"</td><td class='scores'>"+monthSpe+"</td><td class='scores'>"+monthLef+"</td><td class='scores'>"+monthRig+"</td><td class='scores'>"+monthCom+"</td><td class='scores'>"+monthRoa+"</td><td class='alerts'>"+monthAlerts+"</td></tr>");
    }

    function generateAveragesReport(monthlyOrDaily, monthlyData, monthsAgo, dailyData) {

                // clear previous reports, add hidden first row (as header row in csv)
                $("#reports-container table tbody").html('');
                $("#reports-container #printed-timestamp").html(moment().format('[Printed on] MMMM D, YYYY [at] h:mm a'));

                var totalMonths = monthlyData.score_aggressive.length;
                var monthIndex = totalMonths-1-monthsAgo;
                var selectedMonthName = moment().subtract(monthsAgo, "months").format("MMMM YYYY");
                var driveTimeSeconds, driveTimeHours, driveTimeHourLabel, driveTimeHuman, driveTimeMiles;
                var driveMiles, agg, dis, spe, roa, com, bra, lef, rig, acc, numAlerts;

                if (monthlyOrDaily == "monthly") {

                    // report title
                    var label;
                    if (monthlyData.label) {label = monthlyData.label;} else {label = "Fleet";}
                    var firstMonthName = moment().subtract(totalMonths-1, "months").format("MMMM YYYY");
                    $("#reports-container h3").html(label + " Report: Monthly Averages<br><span style='font-weight: normal;'>" + firstMonthName + " to " + selectedMonthName + "</span>");

                    // report table column headers
                    $("#reports-container table th.vehicle").html("Month");
                    // add hidden first row (as header row in csv)
                    $("#reports-container table tbody").html('<tr class="screen-hidden print-hidden"><td class="vehicle">Month</td><td class="time">Time Driven</td><td class="miles">Miles</td><td class="scores">Aggr</td><td class="scores">Distr</td><td class="scores">Brake</td><td class="scores">Accel</td><td class="scores">Speed</td><td class="scores">LTurn</td><td class="scores">RTurn</td><td class="scores">Road</td><td class="scores">Compd</td><td class="alerts">Alerts</td></tr>');

                    // report table contents
                    for (var i = 0; i < totalMonths; i++) {

                        var thisMonthName = moment(firstMonthName, "MMMM YYYY").add(i, "months").format("MMMM YYYY");

                        // drive time
                        driveTimeSeconds = monthlyData.total_time[i];
                        if (driveTimeSeconds === null) {driveTimeSeconds = 0;}
                        driveTimeHours = moment.duration(driveTimeSeconds, "seconds").format("h", 1);
                        driveTimeHourLabel = "[hours]";
                        if (driveTimeHours == 1) { driveTimeHourLabel = "[hour]"; }
                        driveTimeHuman = moment.duration(driveTimeSeconds, "seconds").format("h " + driveTimeHourLabel, 1);

                        // miles
                        driveMiles = monthlyData.total_distance[i];

                        // scores
                        agg = monthlyData.score_aggressive[i];
                        dis = monthlyData.score_distracted[i];
                        spe = monthlyData.score_speed[i];
                        roa = monthlyData.score_road_alert[i];
                        com = monthlyData.score_compound[i];
                        bra = monthlyData.score_brake[i];
                        lef = monthlyData.score_left_turn[i];
                        rig = monthlyData.score_right_turn[i];
                        acc = monthlyData.score_acceleration[i];

                        // alerts
                        numAlerts = monthlyData.total_events[i];

                        // if null
                        if (driveMiles === null) {driveMiles = 0;}
                        if (agg === null) {agg = 0;}
                        if (dis === null) {dis = 0;}
                        if (spe === null) {spe = 0;}
                        if (roa === null) {roa = 0;}
                        if (com === null) {com = 0;}
                        if (bra === null) {bra = 0;}
                        if (lef === null) {lef = 0;}
                        if (rig === null) {rig = 0;}
                        if (acc === null) {acc = 0;}
                        if (numAlerts === null) {numAlerts = 0;}

                        // if undefined
                        if (driveMiles === undefined) {driveMiles = "--";}
                        if (agg === undefined) {agg = "--";}
                        if (dis === undefined) {dis = "--";}
                        if (spe === undefined) {spe = "--";}
                        if (roa === undefined) {roa = "--";}
                        if (com === undefined) {com = "--";}
                        if (bra === undefined) {bra = "--";}
                        if (lef === undefined) {lef = "--";}
                        if (rig === undefined) {rig = "--";}
                        if (acc === undefined) {acc = "--";}
                        if (numAlerts === undefined) {numAlerts = "--";}

                        $("#reports-container table tbody").append("<tr><td class='vehicle'>"+thisMonthName+"</td><td class='time'>"+driveTimeHuman+"</td><td class='miles'>"+driveMiles+"</td><td class='scores'>"+agg+"</td><td class='scores'>"+dis+"</td><td class='scores'>"+bra+"</td><td class='scores'>"+acc+"</td><td class='scores'>"+spe+"</td><td class='scores'>"+lef+"</td><td class='scores'>"+rig+"</td><td class='scores'>"+roa+"</td><td class='scores'>"+com+"</td><td class='alerts'>"+numAlerts+"</td></tr>");
                    }

                    var overallDriveTimeHuman = moment.duration(monthlyData.overall_total_time, "seconds").format("h [hours]", 1);
                    if (monthlyData.overall_total_time === null) {overallDriveTimeHuman = "0.0 hours";}
                    var overallDriveMiles = monthlyData.overall_total_distance;
                    if (overallDriveMiles === null) {overallDriveMiles = 0;}

                    // report table footer (Total)
                    $("#reports-container table tfoot").html("<tr><td class='vehicle'>Total</td><td class='time'>"+overallDriveTimeHuman+"</td><td class='miles'>"+overallDriveMiles+"</td><td class='scores'>"+monthlyData.overall_score_aggressive+"</td><td class='scores'>"+monthlyData.overall_score_distracted+"</td><td class='scores'>"+monthlyData.overall_score_brake+"</td><td class='scores'>"+monthlyData.overall_score_acceleration+"</td><td class='scores'>"+monthlyData.overall_score_speed+"</td><td class='scores'>"+monthlyData.overall_score_left_turn+"</td><td class='scores'>"+monthlyData.overall_score_right_turn+"</td><td class='scores'>"+monthlyData.overall_score_road_alert+"</td><td class='scores'>"+monthlyData.overall_score_compound+"</td><td class='alerts'>"+monthlyData.overall_total_unreviewed_events+"</td></tr>");

                } else if (monthlyOrDaily == "daily") {

                    // report title
                    $("#reports-container h3").html(monthlyData.label + " Daily Report<br><span style='font-weight: normal;'>" + selectedMonthName + "</span>");

                    // report table column headers
                    $("#reports-container table th.vehicle").html("Date");
                    // add hidden first row (as header row in csv)
                    $("#reports-container table tbody").html('<tr class="screen-hidden print-hidden"><td class="vehicle">Date</td><td class="time">Time Driven</td><td class="miles">Miles</td><td class="scores">Aggr</td><td class="scores">Distr</td><td class="scores">Brake</td><td class="scores">Accel</td><td class="scores">Speed</td><td class="scores">LTurn</td><td class="scores">RTurn</td><td class="scores">Compd</td><td class="scores">Road</td><td class="alerts">Alerts</td></tr>');

                    // report table contents
                    for (var i = 0; i < parseInt(moment().subtract(monthsAgo, 'months').daysInMonth()); i++) {

                        var thisDate = moment().subtract(monthsAgo, "months").startOf("month").add(i,"days").format('MMM D, YYYY');

                        // drive time
                        driveTimeSeconds = dailyData.total_time[i];
                        if (driveTimeSeconds === null) {driveTimeSeconds = 0;}
                        driveTimeHours = moment.duration(driveTimeSeconds, "seconds").format("h", 1);
                        driveTimeHourLabel = "[hours]";
                        if (driveTimeHours == 1) { driveTimeHourLabel = "[hour]"; }
                        driveTimeHuman = moment.duration(driveTimeSeconds, "seconds").format("h " + driveTimeHourLabel, 1);

                        // miles
                        driveMiles = dailyData.total_distance[i];

                        // scores
                        agg = dailyData.score_aggressive[i];
                        dis = dailyData.score_distracted[i];
                        spe = dailyData.score_speed[i];
                        roa = dailyData.score_road_alert[i];
                        com = dailyData.score_compound[i];
                        bra = dailyData.score_brake[i];
                        lef = dailyData.score_left_turn[i];
                        rig = dailyData.score_right_turn[i];
                        acc = dailyData.score_acceleration[i];

                        // alerts
                        numAlerts = dailyData.total_events[i];

                        // if null
                        if (driveMiles === null) {driveMiles = 0;}
                        if (agg === null) {agg = 0;}
                        if (dis === null) {dis = 0;}
                        if (spe === null) {spe = 0;}
                        if (roa === null) {roa = 0;}
                        if (com === null) {com = 0;}
                        if (bra === null) {bra = 0;}
                        if (lef === null) {lef = 0;}
                        if (rig === null) {rig = 0;}
                        if (acc === null) {acc = 0;}
                        if (numAlerts === null) {numAlerts = 0;}

                        // if undefined
                        if (driveMiles === undefined) {driveMiles = "--";}
                        if (agg === undefined) {agg = "--";}
                        if (dis === undefined) {dis = "--";}
                        if (spe === undefined) {spe = "--";}
                        if (roa === undefined) {roa = "--";}
                        if (com === undefined) {com = "--";}
                        if (bra === undefined) {bra = "--";}
                        if (lef === undefined) {lef = "--";}
                        if (rig === undefined) {rig = "--";}
                        if (acc === undefined) {acc = "--";}
                        if (numAlerts === undefined) {numAlerts = "--";}

                        $("#reports-container table tbody").append("<tr><td class='vehicle'>"+thisDate+"</td><td class='time'>"+driveTimeHuman+"</td><td class='miles'>"+driveMiles+"</td><td class='scores'>"+agg+"</td><td class='scores'>"+dis+"</td><td class='scores'>"+bra+"</td><td class='scores'>"+acc+"</td><td class='scores'>"+spe+"</td><td class='scores'>"+lef+"</td><td class='scores'>"+rig+"</td><td class='scores'>"+com+"</td><td class='scores'>"+roa+"</td><td class='alerts'>"+numAlerts+"</td></tr>");
                    }

                    var monthDriveTimeHuman = moment.duration(monthlyData.total_time[monthIndex], "seconds").format("h [hours]", 1);
                    if (monthlyData.total_time[monthIndex] === null) {monthDriveTimeHuman = "0.0 hours";}

                    var monthDriveMiles = monthlyData.total_distance[monthIndex];
                    if (monthDriveMiles === null) {monthDriveMiles = 0;}

                    var monthAgg = monthlyData.score_aggressive[monthIndex];
                    var monthDis = monthlyData.score_distracted[monthIndex];
                    var monthBra = monthlyData.score_brake[monthIndex];
                    var monthAcc = monthlyData.score_acceleration[monthIndex];
                    var monthSpe = monthlyData.score_speed[monthIndex];
                    var monthLef = monthlyData.score_left_turn[monthIndex];
                    var monthRig = monthlyData.score_right_turn[monthIndex];
                    var monthCom = monthlyData.score_compound[monthIndex];
                    var monthRoa = monthlyData.score_road_alert[monthIndex];
                    var monthAlerts = monthlyData.total_events[monthIndex];



                    // report table footer (Total)
                    $("#reports-container table tfoot").html("<tr><td class='vehicle'>Total</td><td class='time'>"+monthDriveTimeHuman+"</td><td class='miles'>"+monthDriveMiles+"</td><td class='scores'>"+monthAgg+"</td><td class='scores'>"+monthDis+"</td><td class='scores'>"+monthBra+"</td><td class='scores'>"+monthAcc+"</td><td class='scores'>"+monthSpe+"</td><td class='scores'>"+monthLef+"</td><td class='scores'>"+monthRig+"</td><td class='scores'>"+monthCom+"</td><td class='scores'>"+monthRoa+"</td><td class='alerts'>"+monthAlerts+"</td></tr>");

                }
    }


    // ................................................ SCATTERPLOT .....................................................


    function yAvgLinePosCalc(yScore, plotMax) {
                var yAvg = 509 - ((yScore * 507) / plotMax);
                if (yAvg < 0) {yAvg = 2;}
                return yAvg;
                // graph y is from 0px to 511px
    }

    function xAvgLinePosCalc(xScore, plotMax) {
                var xAvg = (xScore * 564) / plotMax;
                if (xAvg > 564) {xAvg = 564;}
                return xAvg;
                // graph x is from 0px to 559px
    }

    function showAvgLines(yAvgLinePos, xAvgLinePos) {
				// console.log("running showAvgLines()");
                $(".scatter-avg-x").css({
                    left: xAvgLinePos
                }).fadeIn(200);
                $(".scatter-avg-y").css({
                    top: yAvgLinePos
                }).fadeIn(200);
    }

    function drawScatterAverageLines(lineTypeData, lineTypeName, plotMax) {
				// console.log("running drawScatterAverageLines()");
                // hover over group average lines
                if (monthsAgo == "all") { // if selected "All Months" in period dropdown
                  xAvg = lineTypeData.overall_score_distracted;
                  yAvg = lineTypeData.overall_score_aggressive;
                } else {
                  xAvg = lineTypeData.score_distracted[lineTypeData.score_distracted.length - periodNav];
                  yAvg = lineTypeData.score_aggressive[lineTypeData.score_aggressive.length - periodNav];
                }
				// console.log(xAvg);

                // show group average lines
                if (yAvg !== null && xAvg !== null) {

                    avgLineType = lineTypeName;
                    yAvgLinePos = yAvgLinePosCalc(yAvg, plotMax);
                    xAvgLinePos = xAvgLinePosCalc(xAvg, plotMax);
                    showAvgLines(yAvgLinePos, xAvgLinePos);

                    if (lineTypeName == "Fleet") {
                        $(".scatter-avg-x, .scatter-avg-y, .avgLineTT").css({ visibility: "visible", "margin-top": "20px" });
                    } else {
                        $(".scatter-avg-x, .scatter-avg-y, .avgLineTT").css({ visibility: "visible", "margin-top": "9px" });
                    }

                } else {
                    $(".scatter-avg-x, .scatter-avg-y, .avgLineTT").css({ visibility: "hidden" });
                }
    }

    function fitScatterToData(largestBuffered) {
				// console.log("fitScatterToData()");
                s.getOptions().yaxes[0].max = largestBuffered;
                s.getOptions().xaxes[0].max = largestBuffered;
    }

    function setupFitScatterToData(lineTypeData, lineTypeName) {
				// console.log("running setupFitScatterToData()");

                var plottedData = s.getData();
                var allDataPoints = [];

                //each series
                for (var i = plottedData.length - 1; i >= 0; i--) {
                  //each point in each series
                  for (var j = 0; j < plottedData[i].data.length; j++) {
                    allDataPoints.push(plottedData[i].data[j][0]);
                    allDataPoints.push(plottedData[i].data[j][1]);
                  }
                }
				// console.log(allDataPoints);
                var largest = _.max(allDataPoints);
                var largestBuffered = largest + (largest / 20);

                // if using this equation would make xmax and ymax larger than 5, keep xmax and ymax at 5, don't show "fit to data" button
                if (largestBuffered > (100/21)) {
                    // largestBuffered = 5;
                    $("#scatter-fit-to-data").css("display", "none");

                // otherwise, toggle between "fit to data" and "reset" states
                } else {
                    $("#scatter-fit-to-data").css("display", "block");

                    $("#scatter-fit-to-data").unbind("click");
                    $("#scatter-fit-to-data").click(function () {

                        // change button text
                        $('#scatter-fit-to-data').html($('#scatter-fit-to-data').text() == 'Reset Scale' ? 'Fit to Data' : 'Reset Scale');

                        // if plot max is 5x5
                        if (s.getOptions().yaxes[0].max == 10) {
                            $("#scatter-fit-to-data").html("Reset Scale");
                            fitScatterToData(largestBuffered);
                            drawScatterAverageLines(lineTypeData, lineTypeName, largestBuffered);
                        // if plot max is less than 5x5
                        } else {
                            $("#scatter-fit-to-data").html("Fit to Data");
                            fitScatterToData(10);
                            drawScatterAverageLines(lineTypeData, lineTypeName, 10);
                        }

                        s.setupGrid();
                        s.draw();

                        $("#splaceholder").unbind("plothover");
                        $("#splaceholder").bind("plothover", createScatterPlotHoverCallback(largestBuffered));
                        $("#splaceholder").mouseleave(function(){
                              $("#stooltip").remove();
                              previousPoint = null;
                        });
                    });
                }
    }

    function createScatterPlotHoverCallback(plotMax) {
        return function scatterPlotHover(event, pos, item) {
                // console.log("running scatterPlotHover()");
                var x, y;
                if (item) {
                    $("#splaceholder").css("cursor", "pointer");

    				// console.log(item);


                    if (previousPoint !== item.dataIndex) {
                        previousPoint = item.dataIndex;

                        $("#stooltip").remove();

                        // if viewing all groups, not just one group or individual
                        if (typeof item.series.groupID === 'undefined') {

                            x = item.series.dataTT[0][0];
                            y = item.series.dataTT[0][1];

                            $.each(datasets.groups, function (key, val) {
                                if (this.id == item.series.id) {

                                    var grpLabel = this.label;
                                    var grpDriveTime, grpMiles, grpOverall;
                                    if (monthsAgo == "all") { // if "All Months" period is selected
                                      grpDriveTime = getDriveTime(this.overall_total_time);
                                      grpMiles = numberWithCommas(parseInt(this.overall_total_distance));
                                      grpOverall = this.overall_grade;
                                    } else {
                                      grpDriveTime = getDriveTime(this.total_time);
                                      grpMiles = numberWithCommas(parseInt(this.total_distance[this.total_distance.length - periodNav]));
                                      grpOverall = this.grade[this.grade.length - periodNav];
                                    }



                                    showTooltip(item.pageX, item.pageY,
                                        "<div style='padding-top: 5px; border-bottom: 1px solid #444;'><b>" + grpLabel + "</b></div><div>Drive Time: " + grpDriveTime + "</div><div>Miles: " + grpMiles + "</div><div class='overall-ttbg'>Overall Score: " + grpOverall + "</div><div class='aggressiveness-ttbg'>Aggressiveness: " + y + "</div><div class='distraction-ttbg'>Distraction: " + x + "</div>", "stooltip");
                                }
                            });

                        } else if (typeof item.series.data[0][2] !== 'undefined') {

                            var indLabel, indDriveTime, indMiles, indOverall;
                            x = item.series.dataTT[item.dataIndex][0];
                            y = item.series.dataTT[item.dataIndex][1];

                            // locate current group with item.series.id
                            var thisHoveredGroup, thisHoveredIndividual;

                            $.each(datasets.groups, function (key, val) {
                                if (this.id == parseInt(item.series.groupID)) {
                                    thisHoveredGroup = this;
                                }
                            });

                            // locate hovered individual with item.series.data[0][2]
                            $.each(thisHoveredGroup.individuals, function (key, val) {

                                if (val.id == item.series.data[item.dataIndex][2]) {
                                    thisHoveredIndividual = val;
                                }
                            });

                            indLabel = thisHoveredIndividual.label;
                            if (monthsAgo == "all") { // if "All Months" period is selected
                              indDriveTime = getDriveTime(thisHoveredIndividual.overall_total_time);
                              indMiles = numberWithCommas(parseInt(thisHoveredIndividual.overall_total_distance));
                              indOverall = thisHoveredIndividual.overall_grade;
                            } else {
                              indDriveTime = getDriveTime(thisHoveredIndividual.total_time);
                              indMiles = numberWithCommas(parseInt(thisHoveredIndividual.total_distance[thisHoveredIndividual.total_distance.length - periodNav]));
                              indOverall = thisHoveredIndividual.grade[thisHoveredIndividual.grade.length - periodNav];
                            }

                            showTooltip(item.pageX, item.pageY,
                                "<div style='padding-top: 5px; border-bottom: 1px solid #444;'><b>" + indLabel + "</b></div><div>Drive Time: " + indDriveTime + "</div><div>Miles: " + indMiles + "</div><div class='overall-ttbg'>Overall Score: " + indOverall + "</div><div class='aggressiveness-ttbg'>Aggressiveness: " + y + "</div><div class='distraction-ttbg'>Distraction: " + x + "</div>", "stooltip");

                        }
                    }

                } else { //if not hovering a data point

                    //remove all tooltips
                    $("#stooltip").delay(200).fadeOut("normal", function () {$(this).remove();});
                    $("#splaceholder").css("cursor", "default");

                    previousPoint = null;
                    $(".scatter-avg-x, .scatter-avg-y").css({"border-style": "dashed"});

                    x = pos.x;
                    y = pos.y;

                    var xAvgMax5 = xAvg;
                    if (xAvgMax5 > 10){xAvgMax5 = 10;}

                    var yAvgMax5 = yAvg;
                    if (yAvgMax5 > 10){yAvgMax5 = 10;}


                    if (x > (xAvgMax5 - 0.04 * plotMax) && x < (xAvgMax5 + 0.04 * plotMax) && y > (yAvgMax5 - 0.04 * plotMax) && y < (yAvgMax5 + 0.04 * plotMax) && previousPoint != "xy averages") {

                        previousPoint = "xy averages";
                        $("#stooltip").remove();

                        $(".scatter-avg-x, .scatter-avg-y").css({
                            "border-style": "solid"
                        }).fadeIn(200);


                        if (yAvg !== null && xAvg !== null) {
                            showTooltip(pos.pageX, pos.pageY, "<div class='aggressiveness-ttbg avgLineTT'>" + avgLineType + " Aggressiveness Average: " + yAvg + "</div><div class='distraction-ttbg avgLineTT'>" + avgLineType + " Distraction Average: " + xAvg + "</div>", "stooltip");
                        }

                    } else if (x > (xAvgMax5 - 0.04 * plotMax) && x < (xAvgMax5 + 0.04 * plotMax) && previousPoint != "x average") {

                        previousPoint = "x average";
                        $("#stooltip").remove();

                        $(".scatter-avg-x").css({
                            "border-style": "solid"
                        }).fadeIn(200);


                        if (yAvg !== null && xAvg !== null) {
                            showTooltip(pos.pageX, pos.pageY, "<div class='distraction-ttbg avgLineTT'>" + avgLineType + " Distraction Average: " + xAvg + "</div>", "stooltip");
                        }

                    } else if (y > (yAvgMax5 - 0.04 * plotMax) && y < (yAvgMax5 + 0.04 * plotMax) && previousPoint != "y average") {

                        previousPoint = "y average";
                        $("#stooltip").remove();

                        $(".scatter-avg-y").css({
                            "border-style": "solid"
                        }).fadeIn(200);

                        if (yAvg !== null && xAvg !== null) {
                            showTooltip(pos.pageX, pos.pageY, "<div class='aggressiveness-ttbg avgLineTT'>" + avgLineType + " Aggressiveness Average: " + yAvg + "</div>", "stooltip");
                        }

                    }

                }
        };
    }

    function createClickScatterPlotCallback(vehicleID, groupID) {
        return function clickScatterPlot(event, pos, item) {
				// console.log("running clickScatterPlot()");

                if (item) { // if clicked a group (in fleet scatter plot)

                    if (!item.series.groupID) {
                        $("#choices").val(item.series.id).change();

                    } else if (typeof item.series.isGroup !== 'undefined') { // if clicked an individual (in group scatter plot)
                        groupID = parseInt(item.series.groupID);
                        vehicleID = item.series.data[item.dataIndex][2];
                        var g = _.findWhere(datasets.groups, {id: groupID});
                        var v = _.findWhere(g.individuals, {id: vehicleID});
                        if (v !== undefined) {
                          $("#choices").val(vehicleID).change();
                        }
                    }
                }
        };
    }

    function populateScatterPlot1(groupID, groupClass, item, thisGroup, ptRadius, ptWidth, mouseRadius) {
				// console.log("running populateScatterPlot1()");

                scatterData = [];
                $("#splaceholder").unbind("plothover");

                s = $.plot($("#splaceholder"), [{data: [null, 0]}], clearSoptions);

                // fleet plot data
                if (groupID == "fleet") {
                    $.each(item, function (key, val) {

                        var groupData = [];
                        var groupDataTT = [];
                        var distractedScore, distractedScoreTT;
                        var aggressiveScore, aggressiveScoreTT;

                        if (monthsAgo == "all") { // if selected "All Months" in period dropdown
                          distractedScoreTT = val.overall_score_distracted;
                          aggressiveScoreTT = val.overall_score_aggressive;
                        } else {
                          distractedScoreTT = val.score_distracted[val.score_distracted.length - periodNav];
                          aggressiveScoreTT = val.score_aggressive[val.score_aggressive.length - periodNav];
                        }

                        if (distractedScoreTT > 10) {
                          distractedScore = 10;
                        } else {
                          distractedScore = distractedScoreTT;
                        }

                        if (aggressiveScoreTT > 10) {
                          aggressiveScore = 10;
                        } else {
                          aggressiveScore = aggressiveScoreTT;
                        }

                        groupData.push([distractedScore, aggressiveScore]);
                        groupDataTT.push([distractedScoreTT, aggressiveScoreTT]);

                        scatterData.push({ data: groupData, dataTT: groupDataTT, color: val.color, id: val.id });

                    });

                // group plot data
                } else if (groupID !== "fleet" && groupClass == "group") {

                    var groupData = [];
                    var groupDataTT = [];
                    var distractedScore, distractedScoreTT;
                    var aggressiveScore, aggressiveScoreTT;

                    $.each(item, function (key, val) {

                        if (monthsAgo == "all") { // if selected "All Months" in period dropdown
                            distractedScoreTT = val.overall_score_distracted;
                            aggressiveScoreTT = val.overall_score_aggressive;
                        } else {
                            distractedScoreTT = val.score_distracted[val.score_distracted.length - periodNav];
                            aggressiveScoreTT = val.score_aggressive[val.score_aggressive.length - periodNav];
                        }


                        if (distractedScoreTT > 10) {
                          distractedScore = 10;
                        } else {
                          distractedScore = distractedScoreTT;
                        }

                        if (aggressiveScoreTT > 10) {
                          aggressiveScore = 10;
                        } else {
                          aggressiveScore = aggressiveScoreTT;
                        }

                        groupData.push([distractedScore, aggressiveScore, val.id]);
                        groupDataTT.push([distractedScoreTT, aggressiveScoreTT]);
                    });

                    scatterData.push({ data: groupData, dataTT: groupDataTT, color: thisGroup.color, groupID: groupID, isGroup: groupClass });
                }

                // set scatterplot point size
                soptions.series.points.radius = ptRadius;
                soptions.series.points.lineWidth = ptWidth;
                soptions.grid.mouseActiveRadius = mouseRadius;

                // NO DATA
                if (!scatterData[0]) {
                    scatterData.push({data: [0, null], dataTT: ["no data", "no data"], color: "#ffffff", groupID: null, isGroup: null});
                }

                // plot
                s = $.plot($("#splaceholder"), scatterData, soptions);
    }


    // ................................................ LEFT COLUMN .....................................................


    function getLeftScores(data) {
				// console.log("running getLeftScores()");

                var grade, aggScore, distScore, speedScore, roadScore, compScore, driveTime, miles;
                if (monthsAgo == "all") { // if selected "All Months" in period dropdown
                    grade = data.overall_grade;
                    aggScore = data.overall_score_aggressive;
                    distScore = data.overall_score_distracted;
                    speedScore = data.overall_score_speed;
                    roadScore = data.overall_score_road_alert;
                    compScore = data.overall_score_compound;

                    driveTime = getDriveTime(data.overall_total_time);
                    miles = numberWithCommas(parseFloat(data.overall_total_distance));
                } else {

                    grade = data.grade[data.grade.length - periodNav];
                    aggScore = data.score_aggressive[data.score_aggressive.length - periodNav];
                    distScore = data.score_distracted[data.score_distracted.length - periodNav];
                    speedScore = data.score_speed[data.score_speed.length - periodNav];
                    roadScore = data.score_road_alert[data.score_road_alert.length - periodNav];
                    compScore = data.score_compound[data.score_compound.length - periodNav];

                    driveTime = getDriveTime(data.total_time);
                    miles = numberWithCommas(parseFloat(data.total_distance[data.total_distance.length - periodNav]));
                }


                return {"grade": grade, "aggScore": aggScore, "distScore": distScore,
                "speedScore": speedScore, "roadScore": roadScore, "compScore": compScore,
                "driveTime": driveTime, "miles": miles};
    }

    function populateLeftColumnAverages(data) {
				// console.log("running populateLeftColumnAverages()");

                if (data.aggScore !== null) {
                    $(".wsg-overall .number").html(data.grade); // grade
                    $(".wsg-aggression .number").html(data.aggScore); // aggressiveness
                    $(".wsg-distraction .number").html(data.distScore); // distraction
                    $(".wsg-speeding .number").html(data.speedScore); // speeding
                    $(".wsg-road-alerts .number").html(data.roadScore); // road alerts
                    $(".wsg-compound-events .number").html(data.compScore); // compound

                    $("li.driveTime").html(data.driveTime + " <br><b>Total Drive Time</b>"); // drive time
                    $("li.miles").html(data.miles + " miles <br><b>Total Distance</b>"); // miles
                } else {
                    $(".wsg-overall .number").html("--"); // grade
                    $(".wsg-aggression .number").html("--"); // aggressiveness
                    $(".wsg-distraction .number").html("--"); // distraction
                    $(".wsg-speeding .number").html("--"); // speeding
                    $(".wsg-road-alerts .number").html("--"); // road alerts
                    $(".wsg-compound-events .number").html("--"); // compound

                    $("li.driveTime").html("<span style='color: #bbb;'>no data</span><br><b>Total Drive Time</b>"); // drive time
                    $("li.miles").html("<span style='color: #bbb;'>no data</span><br><b>Total Distance</b>"); // miles
                }
    }

    function clearLeftColumnChartOrBar() {
				// console.log("running clearLeftColumnChart()");
                $(".widget-dash-groups .widget-body").css("display", "none");
                $(".list-body-individual").css("display", "none");
                itemIDs = [];
    }

    function getChartContents(item) {
				// console.log("running getChartContents()");
                var itemContents = [];
                if (monthsAgo == "all") { // if selected "All Months" in period dropdown
                  $.each(item, function (key, val) { itemContents.push(
                    {"id": val.id,
                    "name": val.label,
                    "totalCol": val.overall_grade,
                    "aggCol": val.overall_score_aggressive,
                    "distCol": val.overall_score_distracted,
                    "alertCol": val.overall_total_unreviewed_events
                    });
                  });
                } else {
                  $.each(item, function (key, val) { itemContents.push(
                    {"id": val.id,
                    "name": val.label,
                    "totalCol": val.grade[val.grade.length - periodNav],
                    "aggCol": val.score_aggressive[val.score_aggressive.length - periodNav],
                    "distCol": val.score_distracted[val.score_distracted.length - periodNav],
                    "alertCol": val.total_unreviewed_events[val.total_unreviewed_events.length - periodNav]
                    });
                  });
                }

                return itemContents;
    }

    function populateLeftColumnChart(columnTitle, chartContents, rowType, itemIDs, parentGroupID) {
				// console.log("running populateLeftColumnChart()");

                $(".widget-dash-groups .widget-body").css("display", "block");

                $(".list-type").html(columnTitle);
                $("#list-container").empty();
    				// console.log(chartContents);

                // chart populate

                var show = [];
                var sortedID;
                var sortedIDs = [];

                $.each(chartContents, function (key, val) {
    				// console.log(val.aggCol);


                    // sortedIDs.push([key, val.id]);

                    show = _.findWhere(chartContents, { id: val.id });
    				// console.log(show.id);

                    sortedID = _.find(itemIDs, function (num) { return num[1] == show.id; });
                    sortedIDs.push(sortedID);
    				// console.log(sortedID[1]);

                    var totalScoreTD;
                    if (val.totalCol === null) {
                        // handle null values
                        totalScoreTD = '<td class="total-col" style="color: #bbb;"> -- </td>';
                    } else {
                        totalScoreTD = '<td class="total-col">' + val.totalCol + '</td>';
                    }


                    var aggrScoreTD;
                    if (val.aggCol === null) {
                        // handle null values
                        aggrScoreTD = '<td class="agg-col" style="color: #bbb;"> -- </td>';
                    } else {
                        aggrScoreTD = '<td class="agg-col">' + val.aggCol + '</td>';
                    }


                    var distScoreTD;
                    if (val.distCol === null) {
                        // handle null values
                        distScoreTD = '<td class="dist-col" style="color: #bbb;"> -- </td>';
                    } else {
                        distScoreTD = '<td class="dist-col">' + val.distCol + '</td>';
                    }

                    var unreviewedAlertsTD;
                    if (!val.alertCol) {
                        // handle null values
                        unreviewedAlertsTD = '<td class="alert-col" style="color: #bbb;"> - </td>';
                    } else {
                        unreviewedAlertsTD = '<td class="alert-col">' + val.alertCol + '</td>';
                    }
    				// console.log(sortedID[1]);


                    $("#list-container").append('<tr class="' + rowType + '-row-' + key + '" data-index="' + sortedID[1] + '"><td class="name">' + val.name + '</td>' + totalScoreTD + aggrScoreTD + distScoreTD + unreviewedAlertsTD + '</tr>');
                });
                // console.table(chartContents);
                // console.table(itemIDs);


                // Hover event on list chartContentss
                $('#list-container tr').mouseenter(hoverLeftColumnChart(rowType, parentGroupID));

                // Click event on List Items
                $("#list-container tr").unbind("click");

                $("#list-container tr").click(function () {
    				// console.log(this);
                    var thisClass = $(this).attr('class');
                    var thisID = $(this).data('index');
                    clickLeftColumnChart(thisClass, thisID);
                });
    }

    function populateChartTooltip(hoveredItem, groupOrIndividual) {

                var groupDiv="";
                var label, driveTime, miles, aggr, distr, overallScore;

                if (groupOrIndividual == "group") {
                    var vehicleCountInGroup = hoveredItem.individuals.length;
                    groupDiv = "<div>Vehicles in Group: " + vehicleCountInGroup + "</div>";
                }

                label = hoveredItem.label;
                if (monthsAgo == "all") {
                    driveTime = getDriveTime(hoveredItem.overall_total_time);
                    miles = numberWithCommas(parseFloat(hoveredItem.overall_total_distance));
                    aggr = hoveredItem.overall_score_aggressive;
                    distr = hoveredItem.overall_score_distracted;
                    overallScore = hoveredItem.overall_grade;
                } else {
                    driveTime = getDriveTime(hoveredItem.total_time);
                    miles = numberWithCommas(parseFloat(hoveredItem.total_distance[hoveredItem.total_distance.length - periodNav]));
                    aggr = hoveredItem.score_aggressive[hoveredItem.score_aggressive.length - periodNav];
                    distr = hoveredItem.score_distracted[hoveredItem.score_distracted.length - periodNav];
                    overallScore = hoveredItem.grade[hoveredItem.grade.length - periodNav];
                }

                if (aggr === null) {
                    miles = 0;
                    aggr = "--";
                    distr = "--";
                    overallScore = "--";
                }

                var chartTooltipContent = "<div style='padding-top: 5px; border-bottom: 1px solid #444;'><b>" + label + "</b></div><div>Drive Time: " + driveTime + "</div><div>Miles: " + miles + "</div>"+groupDiv+"<div class='overall-ttbg'>Overall Score: " + overallScore + "</div><div class='aggressiveness-ttbg'>Aggressiveness: " + aggr + "</div><div class='distraction-ttbg'>Distraction: " + distr + "</div>";
                $("<div class='chartTooltip'></div>").html(chartTooltipContent).appendTo('#behavior-page').fadeIn('slow');
    }

    function hoverLeftColumnChart(rowType, parentGroupID) {
				// console.log("running hoverLeftColumnChart()");

                // HOVERING GROUP IN CHART
                if (rowType == "group") {

                    $('#list-container tr').hover(function () {

                        // MOUSE HOVER IN
                        s.unhighlight();
                        var HCseriesID = $(this).data('index');

                        $.each(datasets.groups, function (key, val) {
                            if (val.id == HCseriesID) { // if this group

                                var plottedData = s.getData();
                                var thisPlottedIndex = _.findIndex(plottedData, function(plottedPoint) { return plottedPoint.id == HCseriesID; });
                                // var vehicleCountInGroup, grpLabel, grpDriveTime, grpMiles, grpAggr, grpDistr, chartTooltipContent;

                                    if (plottedData[thisPlottedIndex].data[0][0] !== null && plottedData[thisPlottedIndex].data[0][1] !== null) {

                                        s.highlight(thisPlottedIndex, 0);
                                        populateChartTooltip(val, "group");

                                    } else if (plottedData[thisPlottedIndex].data[0][1] === null) {// console.log("no data for this hovered chart group");

                                        populateChartTooltip(val, "group");

                                    } else {
    				                    // console.log("oops");
                                    }
                            }
                        });

                        // MOUSE HOVER OUT
                    }, function () {
                        s.unhighlight();
                        $('.chartTooltip').remove();

                        // MOUSE MOVEMENT DURING HOVER
                    }).mousemove(function (e) {

                        // Tooltip based on mouse position
                        var mousex = e.pageX + 5; //Get X coordinates
                        var mousey = e.pageY + 5; //Get Y coordinates
                        $('.chartTooltip').css({ top: mousey, left: mousex });
    				// console.log(mousey);
                    });

                    // HOVERING INDIVIDUAL IN CHART
                } else {
                    $('#list-container tr').hover(function () {

                        // MOUSE HOVER IN
                        s.unhighlight();
                        var HCitemID = $(this).data('index');


                        $.each(datasets.groups, function (key, val) {
                            if (val.id == parentGroupID) {  // if this group

                                $.each(val.individuals, function (ikey, ival) {
                                    if (ival.id == HCitemID) {  // if this individual

                                        var plottedData1 = s.getData();
                                        var plottedData2 = plottedData1[0].data;    // each individual [0]x, [1]y, [2]ID
                                        var thisPlotted2Index = _.findIndex(plottedData2, function(point) { return point[2] == HCitemID;});

                                            var indLabel, indDriveTime, indMiles, indAggr, indDistr, chartTooltipContent;
                                            if (plottedData2[thisPlotted2Index][0] !== null && plottedData2[thisPlotted2Index][1] !== null) {

                                                s.highlight(0, thisPlotted2Index);
                                                populateChartTooltip(ival, "individual");

                                            } else if (plottedData2[thisPlotted2Index][1] === null) {// console.log("no data for this hovered chart individual");

                                                populateChartTooltip(ival, "individual");

                                            } else {
                                                // console.log("oops");
                                            }
                                    }
                                });
                            }
                        });

                        // MOUSE HOVER OUT
                    }, function () {
                        s.unhighlight();
                        $('.chartTooltip').remove();

                        // MOUSE MOVEMENT DURING HOVER
                    }).mousemove(function (e) {

                        // Tooltip based on mouse position
                        var mousex = e.pageX + 5; //Get X coordinates
                        var mousey = e.pageY + 5; //Get Y coordinates
                        $('.chartTooltip').css({ top: mousey, left: mousex });
    				    // console.log(mousey);
                    });
                }
    }

    function clickLeftColumnChart(thisClass, thisID) {
				// console.log("running clickLeftColumnChart()");
                $('.chartTooltip').remove();

                // verifies that it's a group list item
                if (thisClass.substr(0, 10) == "group-row-") {

                    $.each(datasets.groups, function (key, val) {

                        // matches the list item with the group key
                        if (this.id == thisID) {
                            $("#choices").val(this.id).change();
                        }

                    });

                    // verifies that it's an individual list item
                } else if (thisClass.substr(0, 15) == "individual-row-") {

                    $.each(datasets.groups, function (key, val) {
                        $.each(val.individuals, function (key, val) {
                            if (this.id == thisID) {
                                $("#choices").val(this.id).change();
                            }
                        });
                    });

                }
    }

    function resetSortChartArrows() {
				// console.log("running resetSortChartArrows()");

                // $("#list-container-header i").removeClass('fa-caret-down');
                // $("#list-container-header i").removeClass('fa-caret-up');
                // $("#list-container-header .name i").addClass('fa-caret-up');

                $('.name div i, .total-col i, .agg-col div i, .dist-col div i, .alert-col div i').parents('th').unbind('click');
    }

    function findIDs(item, eachID, sortedID, sortedIDs, idKeyName, itemIDs) {
				// console.log("running findIDs()");
                $.each(item, function (key, val) {

                    var findWhereObj = {};
                    findWhereObj[idKeyName] = val[idKeyName];

                    eachID = _.findWhere(item, findWhereObj);   // see http://stackoverflow.com/a/2274327

                    sortedID = _.find(itemIDs, function (num) { return num[1] == eachID[idKeyName]; });
                    sortedIDs.push(sortedID);

                });
    }

    // ------- consider using this instead of sortChart()
    // function sortChart(item, colToSort, dir) {
    //     var sorted = _.sortBy(item, colToSort);
    //     if(dir == 'desc') {
    //         sorted.reverse();
    //     }
    //     return sorted;
    // }
    // -------

    function sortChart(colToSort, columnTitle, chartContents, rowType, itemIDs, parentGroupID) {
				// console.log("running sortChart()");
				// console.log"sorting chart function");
				// console.log(chartContents);
				// console.log(parentGroupID);

                // default sort on loading each view
                if (colToSort == "initial") {
    				// console.log("sorting up by name");

                    // // sort chartContents by name
                    // chartContents = chartContents.sort(function (a, b) {
                    //     if (a.totalCol < b.totalCol) return -1;
                    //     if (a.totalCol > b.totalCol) return 1;
                    //     return 0;
                    // });
                    colToSort = 2;



                    // find IDs in new sort order
    				// console.log(itemIDs);

                    // var eachID, sortedID, sortedIDs = [];
                    // findIDs(chartContents, eachID, sortedID, sortedIDs, "id", itemIDs);

                    // dropdownSortedPopulate(chartContents, parentGroupID, columnTitle);
    				// console.log(chartContents);

                }


                if (colToSort == 1) {

                    $("#list-container-header .total-col i, #list-container-header .agg-col i, #list-container-header .dist-col i, #list-container-header .alert-col i").removeClass('fa-caret-up fa-caret-down');
                    sortThis("#list-container-header .name i", "name", chartContents);

                } else if (colToSort == 2) {

                    $("#list-container-header .name i, #list-container-header .agg-col i, #list-container-header .dist-col i, #list-container-header .alert-col i").removeClass('fa-caret-up fa-caret-down');
                    sortThis("#list-container-header .total-col i", "totalCol", chartContents);

                } else if (colToSort == 3) {

                    $("#list-container-header .name i, #list-container-header .total-col i, #list-container-header .dist-col i, #list-container-header .alert-col i").removeClass('fa-caret-up fa-caret-down');
                    sortThis("#list-container-header .agg-col i", "aggCol", chartContents);

                } else if (colToSort == 4) {

                    // remove other column arrows
                    $("#list-container-header .name i, #list-container-header .total-col i, #list-container-header .agg-col i, #list-container-header .alert-col i").removeClass('fa-caret-up fa-caret-down');
                    sortThis("#list-container-header .dist-col i", "distCol", chartContents);

                } else if (colToSort == 5) {

                    // remove other column arrows
                    $("#list-container-header .name i, #list-container-header .total-col i, #list-container-header .agg-col i, #list-container-header .dist-col i").removeClass('fa-caret-up fa-caret-down');
                    sortThis("#list-container-header .alert-col i", "alertCol", chartContents);

                }
    			// console.log(chartContents);
                dropdownSortedPopulate(chartContents, parentGroupID, columnTitle);
                populateLeftColumnChart(columnTitle, chartContents, rowType, itemIDs, parentGroupID);
    }

    function findInObject(groupID, ID) {
				// console.log("running findInObject()");

                thisIndividual = "";
                thisGroup = "";

                for (var i = datasets.groups.length - 1; i >= 0; i--) {

                    // if not Fleet ...
                    if (groupID !== "Fleet" && datasets.groups[i].id == groupID) {
                        thisGroup = datasets.groups[i];

                        // ... if Individual
                        if (ID !== groupID) {
                            for (var j = thisGroup.individuals.length - 1; j >= 0; j--) {
                                if (thisGroup.individuals[j].id == ID) {
                                    thisIndividual = thisGroup.individuals[j];
                                }
                            }

                            // ... if Group
                        } else {
                        }

                        // if Fleet
                    } else if (groupID == "Fleet") {
                        thisGroup = null;
                    }
                }
    }


    // ------------------------- PAGE CONTENTS ---------------------------- //
				// console.log(thisIndividual);

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - by default, "Fleet" is selected - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // HEADER BAR --------
    var viewType = "fleet";
    var currentTab = "scores";
    subtabs(currentTab);

    periodDropdownPopulate();

    var thisMonthName = getThisMonthName();

    var h1 = "Fleet Overview";
    var leftAveragesTitle = "Scores Summary - " + thisMonthName;
    var leftChartOrBarTitle = "Groups - " + thisMonthName;
    var scatterTitle = "Group Comparison";
    var alertsTitle = "Fleet Alerts";
    var trendsTitle = "Fleet Trend Line - 12 Months";

    insertTitles(h1, leftAveragesTitle, leftChartOrBarTitle, scatterTitle, trendsTitle);


    // SCORES ---------
    var leftScores = getLeftScores(datasets);
    populateLeftColumnAverages(leftScores);


    // CHART ---------
    clearLeftColumnChartOrBar();

    var columnTitle = "Group";
    var item = datasets.groups;
    var chartContents = [];
    chartContents = getChartContents(item);
				// console.log(chartContents);
    var rowType = "group";
    $.each(item, function (key, val) { itemIDs.push([key, val.id]); });  // for default sorting order
    var colToSort = "initial";

    sortChart(colToSort, columnTitle, chartContents, rowType, itemIDs);
    $('.name div i, .total-col i, .agg-col div i, .dist-col div i, .alert-col div i').parents('th').unbind('click');

    $('.name div i').parents('th').unbind('click');
    $('.total-col div i').parents('th').unbind('click');
    $('.agg-col div i').parents('th').unbind('click');
    $('.dist-col div i').parents('th').unbind('click');
    $('.alert-col div i').parents('th').unbind('click');

    $('.name div i').parents('th').click(function () { sortChart(1, columnTitle, chartContents, rowType, itemIDs); });
    $('.total-col div i').parents('th').click(function () { sortChart(2, columnTitle, chartContents, rowType, itemIDs);});
    $('.agg-col div i').parents('th').click(function () { sortChart(3, columnTitle, chartContents, rowType, itemIDs); });
    $('.dist-col div i').parents('th').click(function () { sortChart(4, columnTitle, chartContents, rowType, itemIDs); });
    $('.alert-col div i').parents('th').click(function () { sortChart(5, columnTitle, chartContents, rowType, itemIDs); });

    // SCATTER PLOT ---------
    $("#splaceholder").css({ "margin-top": "15px", "margin-left": "8px", width: "616px", height: "572px" });

    var groupKey = "fleet";
    var isGroup = "";
    thisGroup = "";
    var ptRadius = 3;
    var ptWidth = 12;
    var mouseRadius = 15;

    vehicleID = 0;
    populateScatterPlot1(groupKey, isGroup, item, thisGroup, ptRadius, ptWidth, mouseRadius);

    $(".scatter-avg-x").css("display", "block");
    $(".scatter-avg-y").css("display", "block");
    drawScatterAverageLines(datasets, "Fleet", 10);

    // Click event on scatter plot
    // initial ID and groupID values
    var groupID;
    $("#splaceholder").bind("plotclick", createClickScatterPlotCallback(vehicleID, groupID));
    $("#splaceholder").unbind("plothover");
    $("#splaceholder").bind("plothover", createScatterPlotHoverCallback(10));
    $("#splaceholder").mouseleave(function(){
          $("#stooltip").remove();
          previousPoint = null;
    });

    setupFitScatterToData(datasets, "Fleet");


    // TREND LINE ---------
    $("#trendLine form").css("display", "none");
    $("#trendSelector li").removeClass("unselected");
    plotLineGraph(datasets);


    // ALERTS TAB ----------
				// console.log(monthsAgo);
    var alertItemIDs = [];
    var alertData;
    var unreviewedEvents = datasets.total_unreviewed_events[datasets.total_unreviewed_events.length - periodNav];
    var datePickerDefault = setDatePickerDefaultDates();

    var alertsDatePicker = runDatePicker("#alerts-date-picker", datePickerDefault);
    setAlertsByDatePicker(alertsDatePicker);// inside: setAlertsTitle, also onSubmit: setAlertsTitle
				// console.log(alertsDatePicker);

    $.get(urls.GETALERTS, { "start_date": alertsDatePicker.startDashes, "end_date": alertsDatePicker.endDashes}, loadAlertData());
    // inside: sortAlerts (populateAlerts), sortAlertsPreview (populateAlertsPreview)

        // ALERTS hide/show details ----
        $('#reviewed-alerts-report').data('show', 'false');
        $("tr.alertReportTr").css('display', 'none');

        // when Hide/Show Details button is clicked ...
        $("#reviewed-alerts-report").unbind("click");
        $("#reviewed-alerts-report").click(function(){
            $('#reviewed-alerts-report').data('show', ($('#reviewed-alerts-report').data('show') == 'false') ? 'true' : 'false'); // toggle data-show object value
            var dataShow = $('#reviewed-alerts-report').data('show')=='false' ? false : true ;
            $('#reviewed-alerts-report').html( dataShow ? 'Hide Details' : 'Show Details'); // update button state
            $("tr.alertReportTr").css('display', dataShow ? '' : 'none'); // show/hide details row
        });


    // REPORTS ---------------
    if (monthsAgo =="all") {
      generateAveragesReport("monthly", datasets, 0);
    } else {
      generateComparisonReport(datasets, "groups", monthsAgo);
    }

    // SCORE LOG TAB ----------
    var scoreLogItemIDs = [];
    var scoreLogItem;
    datePickerDefault = setDatePickerDefaultDates();

    var scorelogDatePicker = runDatePicker("#scorelog-date-picker", datePickerDefault);
    setScoreLogByDatePicker(scorelogDatePicker);// inside: setScoreLogTitle, also onSubmit: setScoreLogTitle

    $.get(urls.SCORELOGS, { "start_date": scorelogDatePicker.startDashes, "end_date": scorelogDatePicker.endDashes }, loadScoreLogData());
    // ?vehicle_id=3038&group_id=159&start_date=2016-01-01&end_date=2016-01-31



    $("#choices").change(function () {
				// console.log(thisIndividual);
				// console.log(monthsAgo);
        $("#trendSelector li").unbind();


        $("#choices").find("option:selected").each(function () {
				// console.log(this);
            var groupID = $(this).attr("name");
            var ID = $(this).attr("value");

            findInObject(groupID, ID);

            var groupClass = $(this).attr("class");
				// console.log(groupClass);

            var alertItemIDs = [];
            var alertData = {};
            var unreviewedEvents, datePickerDefault, alertsDatePicker;

            var scoreLogItemIDs = [];
            var scoreLogItem, scorelogDatePicker;


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - if "Fleet" is selected - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            if (groupID == "fleet") {
				// console.log(thisIndividual);

                $("#choices").val("Fleet");

                // HEADER BAR --------
                viewType = "fleet";
                subtabs(currentTab);

                thisMonthName = getThisMonthName();

                h1 = "Fleet Overview";
                leftAveragesTitle = "Scores Summary - " + thisMonthName;
                leftChartOrBarTitle = "Groups - " + thisMonthName;
                scatterTitle = "Group Comparison";
                alertsTitle = "Fleet Alerts";
                trendsTitle = "Fleet Trend Line - 12 Months";

                insertTitles(h1, leftAveragesTitle, leftChartOrBarTitle, scatterTitle, trendsTitle);

                // DATA ON LEFT ---------

                // SCORES ---------
                leftScores = getLeftScores(datasets);
                populateLeftColumnAverages(leftScores);

                // CHART ---------
                clearLeftColumnChartOrBar();

                columnTitle = "Group";
                item = datasets.groups;
                chartContents = getChartContents(item);
                rowType = "group";
                $.each(item, function (key, val) { itemIDs.push([key, val.id]); });  // for default sorting order
                colToSort = "initial";

                sortChart(colToSort, columnTitle, chartContents, rowType, itemIDs);
                $('.name div i, .total-col i, .agg-col div i, .dist-col div i, .alert-col div i').parents('th').unbind('click');

                $('.name div i').parents('th').click(function () { sortChart(1, columnTitle, chartContents, rowType, itemIDs); });
                $('.total-col div i').parents('th').click(function () { sortChart(2, columnTitle, chartContents, rowType, itemIDs); });
                $('.agg-col div i').parents('th').click(function () { sortChart(3, columnTitle, chartContents, rowType, itemIDs); });
                $('.dist-col div i').parents('th').click(function () { sortChart(4, columnTitle, chartContents, rowType, itemIDs); });
                $('.alert-col div i').parents('th').click(function () { sortChart(5, columnTitle, chartContents, rowType, itemIDs); });

                // SCATTER PLOT ---------

                $("#splaceholder").css({ "margin-top": "15px", "margin-left": "8px", width: "616px", height: "572px" });

                ptRadius = 6;
                ptWidth = 12;
                mouseRadius = 15;
                var groupKey = "fleet";
                var isGroup = "";

                populateScatterPlot1(groupKey, isGroup, item, thisGroup, ptRadius, ptWidth, mouseRadius);

                $(".scatter-avg-x").css("display", "block");
                $(".scatter-avg-y").css("display", "block");
                drawScatterAverageLines(datasets, "Fleet", 10);

                $("#scatter-fit-to-data").css("display", "block");
                $("#scatter-fit-to-data").html("Fit to Data");
                $("#scatter-fit-to-data").unbind('click');
                setupFitScatterToData(datasets, "Fleet");
                // $("#scatter-fit-to-data").click(function () {
                //     fitScatterToData(datasets, "Fleet");
                // });

                $("#splaceholder").unbind("plothover");
                $("#splaceholder").bind("plothover", createScatterPlotHoverCallback(10));

                    $(".scatter-avg-x").css("display", "block");
                    $(".scatter-avg-y").css("display", "block");
                    drawScatterAverageLines(datasets, "Fleet", 10);

                $("#splaceholder").mouseleave(function(){
                      $("#stooltip").remove();
                      previousPoint = null;
                });

                // TREND LINE ---------
                $("#trendLine form").css("display", "none");
                // $(".line_graph_prev_month").css("display", "none");
                // $(".line_graph_next_month").css("display", "none");

                // $("#trendSelector li").unbind("click");
                // $("#trendSelector li").addClass("unselected");
                $("#trendSelector li").removeClass("unselected");

                plotLineGraph(datasets);

                // ALERTS TAB ----------
				// console.log(monthsAgo);
                alertItemIDs = [];
                alertData = {};
                unreviewedEvents = datasets.total_unreviewed_events[datasets.total_unreviewed_events.length - periodNav];
                datePickerDefault = setDatePickerDefaultDates();

                alertsDatePicker = runDatePicker("#alerts-date-picker", datePickerDefault);
                setAlertsByDatePicker(alertsDatePicker);// inside: setAlertsTitle, also onSubmit: setAlertsTitle
				// console.log(alertsDatePicker);

                $.get(urls.GETALERTS, { "start_date": alertsDatePicker.startDashes, "end_date": alertsDatePicker.endDashes}, loadAlertData());
                // inside: sortAlerts (populateAlerts), sortAlertsPreview (populateAlertsPreview)

                    // ALERTS hide/show details ----
                    $('#reviewed-alerts-report').data('show', 'false');
                    $("tr.alertReportTr").css('display', 'none');

                    // when Hide/Show Details button is clicked ...
                    $("#reviewed-alerts-report").unbind("click");
                    $("#reviewed-alerts-report").click(function(){
                        $('#reviewed-alerts-report').data('show', ($('#reviewed-alerts-report').data('show') == 'false') ? 'true' : 'false'); // toggle data-show object value
                        var dataShow = $('#reviewed-alerts-report').data('show')=='false' ? false : true ;
                        $('#reviewed-alerts-report').html( dataShow ? 'Hide Details' : 'Show Details'); // update button state
                        $("tr.alertReportTr").css('display', dataShow ? '' : 'none'); // show/hide details row
                    });


                // REPORTS ---------------

                if (monthsAgo =="all") {
                  generateAveragesReport("monthly", datasets, 0);
                } else {
                  generateComparisonReport(datasets, "groups", monthsAgo);
                }

                // SCORE LOG TAB ----------
                scoreLogItemIDs = [];
                scoreLogItem = "";
                datePickerDefault = setDatePickerDefaultDates();

                scorelogDatePicker = runDatePicker("#scorelog-date-picker", datePickerDefault);
                setScoreLogByDatePicker(scorelogDatePicker);// inside: setScoreLogTitle, also onSubmit: setScoreLogTitle

                $.get(urls.SCORELOGS, { "start_date": scorelogDatePicker.startDashes, "end_date": scorelogDatePicker.endDashes }, loadScoreLogData());
                // ?vehicle_id=3038&group_id=159&start_date=2016-01-01&end_date=2016-01-31


                // if it's a group (has a class)
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - if a "Group" is selected - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            } else if (groupID !== "fleet" && groupClass == "group") {
				// console.log(" - - - - - - - - - - - - - - - - - - - - - - group selected - - - - - - - - - - - - - - - - - - - - - - ");

                $("#choices").val(groupID);

                // HEADER BAR --------
                viewType = "group";
                subtabs(currentTab);

                thisMonthName = getThisMonthName();

                h1 = thisGroup.label;
                leftAveragesTitle = "Scores Summary - " + thisMonthName;
                leftChartOrBarTitle = thisGroup.label + " Vehicles - " + thisMonthName;
                scatterTitle = thisGroup.label + " Vehicles - " + thisMonthName;
                alertsTitle = thisGroup.label + " - Alerts - " + thisMonthName;
                trendsTitle = thisGroup.label + " - Trend Line - 12 Months";

                insertTitles(h1, leftAveragesTitle, leftChartOrBarTitle, scatterTitle, trendsTitle);

                // DATA ON LEFT ---------

                // SCORES ---------
                leftScores = getLeftScores(thisGroup);
                populateLeftColumnAverages(leftScores);

                clearLeftColumnChartOrBar();

                colToSort = "initial";
                columnTitle = "Vehicle";
                item = thisGroup.individuals;
                chartContents = getChartContents(item);
                rowType = "individual";
                var parentGroupID = thisGroup.id;
                $.each(item, function (key, val) { itemIDs.push([key, val.id]); });  // for default sorting order

                sortChart(colToSort, columnTitle, chartContents, rowType, itemIDs, parentGroupID);
                $('.name div i, .total-col i, .agg-col div i, .dist-col div i, .alert-col div i').parents('th').unbind('click');

                $('.name div i').parents('th').click(function () { sortChart(1, columnTitle, chartContents, rowType, itemIDs, parentGroupID); });
                $('.total-col div i').parents('th').click(function () { sortChart(2, columnTitle, chartContents, rowType, itemIDs, parentGroupID); });
                $('.agg-col div i').parents('th').click(function () { sortChart(3, columnTitle, chartContents, rowType, itemIDs, parentGroupID); });
                $('.dist-col div i').parents('th').click(function () { sortChart(4, columnTitle, chartContents, rowType, itemIDs, parentGroupID); });
                $('.alert-col div i').parents('th').click(function () { sortChart(5, columnTitle, chartContents, rowType, itemIDs, parentGroupID); });


                // SCATTER PLOT ---------

                $("#splaceholder").css({ "margin-top": "27px", "margin-left": "8px", width: "604px", height: "560px" });

                ptRadius = 2;
                ptWidth = 4;
                mouseRadius = 5;
                item = thisGroup.individuals;

                populateScatterPlot1(groupID, groupClass, item, thisGroup, ptRadius, ptWidth, mouseRadius);


                $(".scatter-avg-x").css("display", "block");
                $(".scatter-avg-y").css("display", "block");
                drawScatterAverageLines(thisGroup, "Group", 10);

                $("#splaceholder").unbind("plothover");
                $("#splaceholder").bind("plothover", createScatterPlotHoverCallback(10));

                $("#splaceholder").mouseleave(function(){
                      $("#stooltip").remove();
                      previousPoint = null;
                });

                $("#scatter-fit-to-data").css("display", "block");
                $("#scatter-fit-to-data").html("Fit to Data");
                $("#scatter-fit-to-data").unbind('click');

                setupFitScatterToData(thisGroup, "Group");
                // $("#scatter-fit-to-data").click(function () {
                //     fitScatterToData(thisGroup, "Group");
                // });


                // TREND LINE ---------
                $("#trendLine form").css("display", "none");
                plotLineGraph(thisGroup);

                $("#trendSelector li").removeClass("unselected");

                // ALERTS TAB ----------
				// console.log(monthsAgo);
                alertItemIDs = [];
                alertData = {};
                unreviewedEvents = thisGroup.total_unreviewed_events[thisGroup.total_unreviewed_events.length - periodNav];
                datePickerDefault = setDatePickerDefaultDates();

                alertsDatePicker = runDatePicker("#alerts-date-picker", datePickerDefault, thisGroup.id);
                setAlertsByDatePicker(alertsDatePicker);// inside: setAlertsTitle, also onSubmit: setAlertsTitle
				// console.log(alertsDatePicker);

                $.get(urls.GETALERTS, { "group_id": groupID, "start_date": alertsDatePicker.startDashes, "end_date": alertsDatePicker.endDashes }, loadAlertData(thisGroup.id));
                // inside: sortAlerts (populateAlerts), sortAlertsPreview (populateAlertsPreview)

                    // ALERTS hide/show details ----
                    $('#reviewed-alerts-report').data('show', 'false');
                    $("tr.alertReportTr").css('display', 'none');

                    // when Hide/Show Details button is clicked ...
                    $("#reviewed-alerts-report").unbind("click");
                    $("#reviewed-alerts-report").click(function(){
                        $('#reviewed-alerts-report').data('show', ($('#reviewed-alerts-report').data('show') == 'false') ? 'true' : 'false'); // toggle data-show object value
                        var dataShow = $('#reviewed-alerts-report').data('show')=='false' ? false : true ;
                        $('#reviewed-alerts-report').html( dataShow ? 'Hide Details' : 'Show Details'); // update button state
                        $("tr.alertReportTr").css('display', dataShow ? '' : 'none'); // show/hide details row
                    });


                // REPORTS ---------------

                if (monthsAgo =="all") {
                  generateAveragesReport("monthly", thisGroup, 0);
                } else {
                  generateComparisonReport(thisGroup, "individuals", monthsAgo);
                }

                // SCORE LOG TAB ----------
                scoreLogItemIDs = [];
                scoreLogItem = "";
                datePickerDefault = setDatePickerDefaultDates();

                scorelogDatePicker = runDatePicker("#scorelog-date-picker", datePickerDefault);
                setScoreLogByDatePicker(scorelogDatePicker);// inside: setScoreLogTitle, also onSubmit: setScoreLogTitle

                $.get(urls.SCORELOGS, { "group_id": groupID, "start_date": scorelogDatePicker.startDashes, "end_date": scorelogDatePicker.endDashes }, loadScoreLogData(thisGroup.id));
                // ?vehicle_id=3038&group_id=159&start_date=2016-01-01&end_date=2016-01-31


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - if an "Individual" is selected - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            } else if (groupID !== "fleet" && groupClass !== "group") {
				// console.log(" - - - - - - - - - - - - - - - - - - - - - - individual selected - - - - - - - - - - - - - - - - - - - - - - ");

                // if this is the first individual selected from this group,
                if ($("#choices option:contains(•)").html() === null){

                    $("#choices option").each(function(){

                        // add 3 spaces before non-parent groups in dropdown
                        var contents;
                        if ($(this).attr("name") == $(this).attr("value") && $(this).attr("value") !== groupID) {
                            var nonBullet = "&nbsp;&nbsp;&nbsp;";
                            contents = $(this).html();
                            $(this).html(nonBullet + contents);

                        // add a bullet to the parent group in dropdown
                        } else if ($(this).attr("name") == $(this).attr("value")) {
                            var bullet = "&bull;&nbsp;";
                            contents = $(this).html();
                            $(this).html(bullet + contents);
                        }
                    });
                }



                // HEADER BAR --------
                viewType = "individual";
                subtabs(currentTab);

                thisMonthName = getThisMonthName();

                h1 = "Vehicle " + thisIndividual.label;
                leftAveragesTitle = "Scores Summary - " + thisMonthName;
                leftChartOrBarTitle = "Alerts - " + thisMonthName;
                scatterTitle = "All Scores - " + thisMonthName;
                alertsTitle = "Alerts - " + thisMonthName;
                trendsTitle = thisIndividual.label + " - Trend Line";

                insertTitles(h1, leftAveragesTitle, leftChartOrBarTitle, scatterTitle, trendsTitle);

                // DATA ON LEFT ---------

                // SCORES ---------
                leftScores = getLeftScores(thisIndividual);
                populateLeftColumnAverages(leftScores);

                clearLeftColumnChartOrBar();

                // ALERTS PREVIEW
                // to avoid flash of group data, moved "display: block" to below alerts \/
                $(".widget-dash-groups .widget-body").css("display", "none");





                // BAR CHART
                $("#splaceholder").css({ "margin-top": "31px", "margin-left": "21px", "width": "587px", "height": "550px" }); // css before plot, so labels are positioned correctly within container
                // clear any settings or data from scatter plots
                // s = $.plot($("#splaceholder"), [{data: [null, 0]}], clearSoptions);
                // barplot = $.plot($("#splaceholder"), [{data: [null, 0]}], clearSoptions);
                var barData = [];
                        // negativeNumbers = {xAlign: function(x) { return x - 0.5;}}
                        // insert individual report values
                        if (monthsAgo == "all") {
                            barData.push({label: thisIndividual.label + " Scores", data: [
                              [thisIndividual.overall_score_road_alert, 0],
                              [thisIndividual.overall_score_speed, 1.2],
                              [thisIndividual.overall_score_compound, 3.2],
                              [thisIndividual.overall_score_acceleration, 5.4],
                              [thisIndividual.overall_score_right_turn, 7.4],
                              [thisIndividual.overall_score_left_turn, 9.4],
                              [thisIndividual.overall_score_brake, 11.4]
                              ], bars:{barWidth: 0.8, fillColor: barColorIndiv}});

                            barData.push({label: thisIndividual.label + " Hard Scores", data: [
                              [thisIndividual.overall_score_speed_severe, 2],
                              [thisIndividual.overall_score_acceleration_severe, 6.2],
                              [thisIndividual.overall_score_right_turn_severe, 8.2],
                              [thisIndividual.overall_score_left_turn_severe, 10.2],
                              [thisIndividual.overall_score_brake_severe, 12.2],
                              ], bars:{barWidth: 0.8, fillColor: barColorIndivSevere}}); // numbers: negativeNumbers

                            barData.push({label: null, data: [
                              [thisGroup.overall_score_road_alert, 0],
                              [thisGroup.overall_score_speed, 1.2],
                              [thisGroup.overall_score_compound, 3.2],
                              [thisGroup.overall_score_acceleration, 5.4],
                              [thisGroup.overall_score_right_turn, 7.4],
                              [thisGroup.overall_score_left_turn, 9.4],
                              [thisGroup.overall_score_brake, 11.4]
                              ], bars:{barWidth: 0, fillColor: barColorIndiv}});

                            barData.push({label: null, data: [
                              [thisGroup.overall_score_speed_severe, 2],
                              [thisGroup.overall_score_acceleration_severe, 6.2],
                              [thisGroup.overall_score_right_turn_severe, 8.2],
                              [thisGroup.overall_score_left_turn_severe, 10.2],
                              [thisGroup.overall_score_brake_severe, 12.2],
                              ], bars:{barWidth: 0, fillColor: barColorIndivSevere}}); // numbers: negativeNumbers
                        } else {
                            barData.push({label: thisIndividual.label + " Scores", data: [
                              [thisIndividual.score_road_alert[thisIndividual.score_road_alert.length - periodNav], 0],
                              [thisIndividual.score_speed[thisIndividual.score_speed.length - periodNav], 1.2],
                              [thisIndividual.score_compound[thisIndividual.score_compound.length - periodNav], 3.2],
                              [thisIndividual.score_acceleration[thisIndividual.score_acceleration.length - periodNav], 5.4],
                              [thisIndividual.score_right_turn[thisIndividual.score_right_turn.length - periodNav], 7.4],
                              [thisIndividual.score_left_turn[thisIndividual.score_left_turn.length - periodNav], 9.4],
                              [thisIndividual.score_brake[thisIndividual.score_brake.length - periodNav], 11.4]
                              ], bars:{barWidth: 0.8, fillColor: barColorIndiv}});

                            barData.push({label: thisIndividual.label + " Hard Scores", data: [
                              [thisIndividual.score_speed_severe[thisIndividual.score_speed_severe.length - periodNav], 2],
                              [thisIndividual.score_acceleration_severe[thisIndividual.score_acceleration_severe.length - periodNav], 6.2],
                              [thisIndividual.score_right_turn_severe[thisIndividual.score_right_turn_severe.length - periodNav], 8.2],
                              [thisIndividual.score_left_turn_severe[thisIndividual.score_left_turn_severe.length - periodNav], 10.2],
                              [thisIndividual.score_brake_severe[thisIndividual.score_brake_severe.length - periodNav], 12.2],
                              ], bars:{barWidth: 0.8, fillColor: barColorIndivSevere}}); // numbers: negativeNumbers

                            barData.push({label: null, data: [
                              [thisGroup.score_road_alert[thisGroup.score_road_alert.length - periodNav], 0],
                              [thisGroup.score_speed[thisGroup.score_speed.length - periodNav], 1.2],
                              [thisGroup.score_compound[thisGroup.score_compound.length - periodNav], 3.2],
                              [thisGroup.score_acceleration[thisGroup.score_acceleration.length - periodNav], 5.4],
                              [thisGroup.score_right_turn[thisGroup.score_right_turn.length - periodNav], 7.4],
                              [thisGroup.score_left_turn[thisGroup.score_left_turn.length - periodNav], 9.4],
                              [thisGroup.score_brake[thisGroup.score_brake.length - periodNav], 11.4]
                              ], bars:{barWidth: 0, fillColor: barColorIndiv}});

                            barData.push({label: null, data: [
                              [thisGroup.score_speed_severe[thisGroup.score_speed_severe.length - periodNav], 2],
                              [thisGroup.score_acceleration_severe[thisGroup.score_acceleration_severe.length - periodNav], 6.2],
                              [thisGroup.score_right_turn_severe[thisGroup.score_right_turn_severe.length - periodNav], 8.2],
                              [thisGroup.score_left_turn_severe[thisGroup.score_left_turn_severe.length - periodNav], 10.2],
                              [thisGroup.score_brake_severe[thisGroup.score_brake_severe.length - periodNav], 12.2],
                              ], bars:{barWidth: 0, fillColor: barColorIndivSevere}}); // numbers: negativeNumbers
                        }
				// console.log("initial barplot plot");
                var barplot = $.plot($("#splaceholder"), barData, boptions);  // console.log("A new bar plot should have been plotted, Brake Value: " + thisIndividual.score_brake[thisIndividual.score_brake.length - periodNav]);

                var individualScores = [];
                var groupScores = [];
                var individualSevereScores = [];
                var groupSevereScores = [];

                getBarData (barplot, individualScores, groupScores, individualSevereScores, groupSevereScores);


                barLabelOptions (barplot);


                previousPoint = null;
                $("#splaceholder").unbind("plothover");
                $("#splaceholder").bind("plothover", createHoverBarGraphCallback(individualScores, groupScores, individualSevereScores, groupSevereScores));

                $("#splaceholder").mouseleave(function(){
                      $("#btooltip").remove();
                      previousPoint = null;
                });


                // SCATTER PLOT ---------
                $("#stooltip").remove(); // remove tooltip left over from group page's scatter hover
                $(".scatter-avg-x").css("display", "none");
                $(".scatter-avg-y").css("display", "none");
                $("#scatter-fit-to-data").css("display", "none");


                // TREND LINE ---------

                $("#trendLine form").css("display", "block");

                    var getIndivMonthData = urls.GETDAILYTREND + thisIndividual.id + "?period=" + moment().subtract(monthsAgo, "months").format("YYYY-MM") + "&group_id=" + thisGroup.id;

                    //plot month view
                    allOrOne = "all";
				// console.log("allOrOne is all");

                    $.get(getIndivMonthData, loadIndividualData(monthsAgo, thisGroup.id));
                    // $("#trendDaily").click();

                    $("#showWeekends").change(function () {
                        var weekendsOrNot = this.checked ? "weekends" : "";
                        var weekendMarkings = setupWeekendMarkings(weekendsOrNot);

                        var lplottedOptions = lplot.getOptions();
                        lplottedOptions.grid.markings = weekendMarkings;
                        lplot.draw();
				// console.log("lplot drawn weekends");
                    });







                // ALERTS TAB ----------
                alertItemIDs = [];
                alertData = {};
                unreviewedEvents = thisIndividual.total_unreviewed_events[thisIndividual.total_unreviewed_events.length - periodNav];
                datePickerDefault = setDatePickerDefaultDates();

                alertsDatePicker = runDatePicker("#alerts-date-picker", datePickerDefault, thisGroup.id, thisIndividual.id);
                setAlertsByDatePicker(alertsDatePicker);// inside: setAlertsTitle, also onSubmit: setAlertsTitle
				// console.log(alertsDatePicker);

                $.get(urls.GETALERTS, { "vehicle_id": thisIndividual.id, "group_id": thisGroup.id, "start_date": alertsDatePicker.startDashes, "end_date": alertsDatePicker.endDashes }, loadAlertData(thisGroup.id, thisIndividual.id));
                // inside: sortAlerts (populateAlerts), sortAlertsPreview (populateAlertsPreview)

                    // ALERTS hide/show details ----
                    $('#reviewed-alerts-report').data('show', 'false');
                    $("tr.alertReportTr").css('display', 'none');

                    // when Hide/Show Details button is clicked ...
                    $("#reviewed-alerts-report").unbind("click");
                    $("#reviewed-alerts-report").click(function(){
                        $('#reviewed-alerts-report').data('show', ($('#reviewed-alerts-report').data('show') == 'false') ? 'true' : 'false'); // toggle data-show object value
                        var dataShow = $('#reviewed-alerts-report').data('show')=='false' ? false : true ;
                        $('#reviewed-alerts-report').html( dataShow ? 'Hide Details' : 'Show Details'); // update button state
                        $("tr.alertReportTr").css('display', dataShow ? '' : 'none'); // show/hide details row
                    });

                // show alerts preview
                $(".list-body-individual").css("display", "block");



                // REPORTS TAB ---------- controlled by trend line's "loadIndividualData();"




                // SCORE LOG TAB ----------
                scoreLogItemIDs = [];
                scoreLogItem = "";
                datePickerDefault = setDatePickerDefaultDates();

                scorelogDatePicker = runDatePicker("#scorelog-date-picker", datePickerDefault);
                setScoreLogByDatePicker(scorelogDatePicker);// inside: setScoreLogTitle, also onSubmit: setScoreLogTitle

                $.get(urls.SCORELOGS, { "vehicle_id": thisIndividual.id, "group_id": groupID, "start_date": scorelogDatePicker.startDashes, "end_date": scorelogDatePicker.endDashes }, loadScoreLogData(thisGroup.id, thisIndividual.id));
                // ?vehicle_id=3038&group_id=159&start_date=2016-01-01&end_date=2016-01-31


            }

        });


        // End Dropdown

    });

}
