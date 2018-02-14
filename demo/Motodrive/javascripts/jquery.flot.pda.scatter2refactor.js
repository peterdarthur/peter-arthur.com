/* global moment */
/* global $ */
(function() {
    'use strict';
    
    //constants 
    
    var TABS = {
        SCORES: 0,
        ALERTS: 1,
        TRENDS: 2
    };
    
    var MODE = {
        FLEET: 0,
        GROUP: 1,
        INDIVIDUAL: 2
    };
    
    var TOTAL_MONTHS_ALLOWED = 13;
    
    //state + data
    var currentState = null,
        fleetData = null,
        alerts = [],
        stateHistory = [];
    
    
    function init() {
        console.log('init');
        
        populatePeriodOptions();
        currentState = getStateFromUi();
        stateHistory.push(currentState);
        
        //user changes tab, period, or ind/grp/flt
        $('#periods').change(uiStateChangedHandler);
        $('#choices').change(uiStateChangedHandler);
        $('.tab-scores').click(uiStateChangedHandler);
        $('.tab-alerts').click(uiStateChangedHandler);
        $('.tab-trends').click(uiStateChangedHandler);
        
        $.get("/behavior_reports/data", behaviorDataReceivedHandler);
    }
    

    function behaviorDataReceivedHandler(data) {
        console.log('behaviorDataReceivedHandler');
        
        fleetData = data;
        renderUiForState(currentState);
    }
    
    
    
    function uiStateChangedHandler() {
        console.log('uiStateChangedHandler');
        
        if(!fleetData) {
            return; //do nothing until we have data
        }
        
        currentState = getStateFromUi();
        stateHistory.push(currentState);
        renderUiForState(currentState);
    }
    
    
    
    
    /* ui modifiers */
    
    //this is going to be your call everything function. Called whenever 'State' changes
    function renderUiForState(currentState) {
        console.log('renderUiForState mode: ' +currentState.mode);
        console.log(currentState);
        console.log(fleetData);
        
        //hide all elements that vary by MODE
        
        if(currentState.mode == MODE.FLEET) {
            populateScoreTiles('FLEET', currentState.selectedPeriodOffset, fleetData);
            plotAggrDistScatterChart(currentState.groups, currentState.selectedPeriodOffset);
            
        } else if(currentState.mode == MODE.GROUP) {
            populateScoreTiles(currentState.selectedGroup.label, currentState.selectedPeriodOffset, currentState.selectedGroup);
            plotAggrDistScatterChart(currentState.selectedGroup.individuals, currentState.selectedPeriodOffset);
        } else if(currentState.mode == MODE.INDIVIDUAL) {
            populateScoreTiles(currentState.selectedIndividual.label, currentState.selectedPeriodOffset, currentState.selectedIndividual);
        }
        
        
    }
    

    function populatePeriodOptions() {
        $("#periods option").remove();
        
        for(var i=0; i<TOTAL_MONTHS_ALLOWED; i++) {
            var label = moment().subtract(i, 'months').format("MMMM YYYY");
            $("<option></option>")
               .attr("value", i)
               .text(label)
               .appendTo('#periods'); 
        }
    }
    
    
    function plotTrendLine(data, labels) {
        console.log('plotTrendLine');
        
        //this should just look at the length of labels
    }
    
    function populateAlertsTable(alerts) {
        
    }
    
    function populateAggrDistScatterPlotTable(items, monthsAgo) {
        
    }
    
    //MISSING PREVIOUS MONTH DATA
    function populateScoreTiles(title, monthsAgo, data) {
        
        var offset = data.score_aggressive.length - (1 + monthsAgo);
        
        $(".wsg-aggression .number").html(data.score_aggressive[offset]); // aggressiveness
        $(".wsg-distraction .number").html(data.score_distracted[offset]); // distraction
        $(".wsg-speeding .number").html(data.score_speed[offset]); // speeding
        $(".wsg-road-alerts .number").html(data.score_road_alert[offset]); // road alerts
        
        $("li.driveTime").html(data.total_time[offset] + " <br><b>Total Drive Time</b>"); // drive time
        $("li.miles").html(data.total_distance[offset] + " miles <br><b>Total Distance</b>"); // miles
        
        if((offset-1) >= 0) {
            //set the 'prev' indicators
        }
    }
    
    function plotScoreBreakDownBarChart() {
        
    }
    
    //incomplete
    function plotAggrDistScatterChart(data, monthsAgo) {
        console.log('plotAggrDistScatterChart');
        
        var scatterData = [];
        
         /* fillColor would not cooperate in jquery.flot.threshold.above.js - 
           the only way to change the fill is to increase the stroke enough to cover 
           the white (default) fill. */
        var opts = {
            legend: { show: false },
            axisLabels: { show: true },  // https://github.com/markrcote/flot-axislabels
            xaxes: [{ axisLabel: 'Distracted Driving' }],
            yaxes: [{ position: 'left', axisLabel: 'Aggressive Driving' }],
            series: {
                grid: {},
                points: { radius: 6, show: true, fill: true, lineWidth: 12 }
            },
            xaxis: { min: 0, max: 5, ticks: 5 },
            yaxis: { min: 0, max: 5, ticks: 5 },
            grid: { hoverable: true, clickable: true, mouseActiveRadius: 15 },
            margin: { top: 50, right: 0, left: 0, bottom: 0 }
        };
        
        //no data
        if(!data || data.length === 0) {
            scatterData.push({ 
                    label: "No Data", 
                    data: [[0,0]], 
                    points: { 
                        fillColor: "#058DC7" 
                    }, 
                    color: "#058DC7" 
                });
        } else { //extract data
        
            for(var i=data.length-1; i>= 0; i--) { //build chartData
                scatterData.push({ 
                    label: data.label, 
                    data: [[data[i].score_aggressive[monthsAgo], data[i].score_distracted[monthsAgo]]], 
                    points: { 
                        fillColor: "#058DC7" 
                    }, 
                    color: "#058DC7" 
                });
            
            }
            
            
        }
        
        $.plot($("#splaceholder"), scatterData, opts);
    }
    
    
    /* interact with giant fleet data obj */
    
    function fleetGetGroupById(id) {
        
        if(!fleetData) {
            return null;
        }
        
        for(var i = fleetData.groups.length-1; i<=0;i--) {
            if(fleetData.groups[i].id == id) {
                return fleetData.groups[i];
            }
        }
        
        return null;
    }
    
    function fleetGetIndividualByGroupAndId(grpid, id) {
        
        if(!fleetData) {
            return null;
        }
        
        for(var i = fleetData.groups.length-1; i<=0;i--) {
            if(fleetData.groups[i].id == grpid) {
                for(var j = fleetData.groups[i].individuals.length-1;j<=0;j--) {
                    if(fleetData.groups[i].individuals[j].id == id) {
                        return fleetData.groups[i].individuals[j];
                    }
                }
                break;
            }
        }
        
        return null;
    }
    
    /* READ DATA FROM UI */
    
    function getStateFromUi() {
        
        var state = {
            tab: getSelectedTab(),
            selectedPeriodOffset: getSelectedPeriodOffset(),
            selectedGroup: getSelectedGroup(),
            selectedIndividual: getSelectedIndividual()
        };
        
        if(state.selectedIndividual !== null) {
            state.mode = MODE.INDIVIDUAL;
        } else if(state.selectedIndividual === null && state.selectedGroup !== null) {
            state.mode = MODE.GROUP;
        } else {
            state.mode = MODE.FLEET;
        }
        
        return state;
    }
    
    
    function getSelectedGroup() {
        var val = $('#choices').val(),
            option = $('#choices').find(":selected");
        
        if(val == 'Fleet') {
            return null;
        } else {
            var grpid = -1;
            
            if($(option).is('[data-group-id]')) {
                grpid = $(option).data('group-id');
            } else {
                grpid = val;
            }
            
            return fleetGetGroupById(grpid);
            
        }
    }
    
    function getSelectedIndividual() {
        var val = $('#choices').val(),
            option = $('#choices').find(":selected");
        
        if($(option).is('[data-group-id]')) {
            var grpid = $(option).data('group-id');
            return fleetGetIndividualByGroupAndId(grpid, val);
        } else {
            return null;
        }
    }
    
    function getSelectedPeriodOffset() {
        return parseInt($("#periods").val());
    }
    
    function getSelectedTab() {
        if( $('.tab-scores').hasClass('active-tab') ) {
            return TABS.SCORES;
        } else if($('.tab-alerts').hasClass('active-tab')) {
            return TABS.ALERTS;
        } else if($('.tab-trends').hasClass('active-tab')) {
            return TABS.TRENDS;
        }
    }
    
    
    
    init(); //run
    
    
})();






