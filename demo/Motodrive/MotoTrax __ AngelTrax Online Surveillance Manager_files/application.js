// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults
var updateDataTimer, reloadPageTimer, reloadMapTimer;

$(function() {
    setup_colorbox();

    var lastID = null;
    var handleMouseover = function(e) {
        var target = e.target || e.srcElement;
        lastID = target.id;
    };

    if (document.addEventListener) {
        document.addEventListener('mouseover', handleMouseover, false);
    }
    else {
        document.attachEvent('onmouseover', handleMouseover);
    }

    $("th a, .pagination a").live("click", function() {
        $(".pagination").html("Update Data...");
        $.getScript(this.href);
        return false;
    });

    $("*.filter_check").live('click', changeFilter);
    $("*.map_it_check").live('click', function() {
        var page_num = $("#data-table").attr("data-page");
        var direction = $("#direction").attr("value");
        var sort = $("#sort").attr("value");
        var map_it_url = $("#map_it_url").attr("value");
        var strSearch = $("#event_search").serialize();

        if (!map_it_url) map_it_url = "";
        if (page_num <= 0) page_num = 1;

        $.getScript("/events?page=" + page_num + "&direction=" + direction + "&sort=" + sort + map_it_url + "&" + strSearch);
        //    return false;
    });

    $("*#csv_file, *#pdf_file, #save_submit").live('click', function() {
        $.colorbox.close();
    });

    $("*#share_submit").live('click', function() {
        var page_num = $("#data-table").attr("data-page");
        var direction = $("#direction").attr("value");
        var sort = $("#sort").attr("value");
        var href = document.location.pathname;
        var mail_to = $("#mail_to").attr("value");
        var cc_to = $("#cc_to").attr("value");
        var bcc_to = $("#bcc_to").attr("value");
        var subject = $("#subject").attr("value");

        if (page_num <= 0) page_num = 1;

        var selectedID = $(".ui-selected").attr("id");
        var newHref;
        if (selectedID == "csv-file")
            newHref = href + "?page=" + page_num + "&direction=" + direction + "&sort=" + sort + "&" + strSearch + "&mail_to=" + mail_to + "&cc_to=" + cc_to + "&bcc_to=" + bcc_to + "&subject=" + subject + "&csv=1&mail=1";
        else
            newHref = href + "?page=" + page_num + "&direction=" + direction + "&sort=" + sort + "&" + strSearch + "&mail_to=" + mail_to + "&cc_to=" + cc_to + "&bcc_to=" + bcc_to + "&subject=" + subject + "&pdf=1&mail=1";
        $.getScript(newHref);
        $.colorbox.close();
    });

    // event/health follow check
    $("*.follow_check").live('click', function() {
        var page_num = $("#data-table").attr("data-page");
        var direction = $("#direction").attr("value");
        var sort = $("#sort").attr("value");
        var map_it_url = $("#map_it_url").attr("value");
        var strSearch = $("#event_search").serialize();
        var href = $("#data-table").attr("data-path");
        var follow = "";
        var event_id = $(this).attr("value");
        var follow_up_url = escape("follow_up[event_id]=" + event_id);

        if (page_num <= 0) page_num = 1;
        if (!map_it_url) map_it_url = "";

        if ($(this).is(":checked")) {
            follow = "add";
        }
        else {
            follow = "remove";
        }

        $.getScript(href + "?page=" + page_num + "&direction=" + direction + "&sort=" + sort + map_it_url + "&" + strSearch + "&follow=" + follow + "&" + follow_up_url);

        // return false;
    });

    $("*#follow-up-submit").live('click', function() {
        var href = window.location.href;
        var id = $("#follow_up_id").attr("value");
        var notes = $("#follow_up_notes").attr("value");
        var follow_up_url = escape("follow_up[notes]=" + notes);
        $.getScript(href + "follow_ups/" + id + "?" + follow_up_url);
        $.colorbox.close();
        return false;
    });

    $("#top5_idle_day, #top5_idle_week, #top5_idle_month, #top5_overspeed_day, #top5_overspeed_week, #top5_overspeed_month, #top5_dvrup_day, #top5_dvrup_week, #top5_dvrup_month, #top5_health_day, #top5_health_week, #top5_health_month").live('click', function() {
        var linkTd = document.getElementById(lastID);
        $.getScript(linkTd);
        return false;
    });

    $("*#download_duration").live('change', update_download);
    $("*#set_time").live('click', update_download);
    $("#download_start_date,#download_start_time").live('change', update_manual_download);
    $("#download_timestamp,#manual_duration").live('change', update_manual_download_timestamp);
    $("*.input-space, *#search_network_status, *#event_duration, *#search_event_type_id_in, *#search_vehicle_id_in, *#start_date, *#stop_date, *#search_follow_up_id_is_not_null, *#search_fuel_name_eq, *#search_mileage_range_eq, *#search_health_dvr_boot_eq, *#search_vehicle_type_name_eq, *#search_year_eq, *#search_mac_id_eq, *#search_dvr_type_eq, *#search_operator_id_eq, *#search_ind_type_id_eq, *#search_card_number_in").live("change", function() {
        var strSearch = getSearchString();
        //    $.get($(strSearch).attr("action"), $(strSearch).serialize(), null, "script");
        var eScroll = (document.getElementById("search_event_type_id_in") == null) ? 0 : document.getElementById("search_event_type_id_in").scrollTop;
        var vScroll = (document.getElementById("search_vehicle_id_in") == null) ? 0 : document.getElementById("search_vehicle_id_in").scrollTop;
        var idScroll = (document.getElementById("search_id_in") == null) ? 0 : document.getElementById("search_id_in").scrollTop;
        var vnScroll = (document.getElementById("search_vehicle_num_in") == null) ? 0 : document.getElementById("search_vehicle_num_in").scrollTop;
        var ipScroll = (document.getElementById("search_health_ip_addr_in") == null) ? 0 : document.getElementById("search_health_ip_addr_in").scrollTop;
        var newSearch = $(strSearch).serialize() + "&escroll=" + eScroll + "&vscroll=" + vScroll + "&idscroll=" + idScroll + "&vnscroll=" + vnScroll + "&ipscroll=" + ipScroll;
        $.get($(strSearch).attr("action"), newSearch, null, "script");
        return false;
    });

    $("*#clear_filters_btn").live('click', function() {
        var href = $("#data-table").attr("data-path");
        $.getScript(href);
        return false;
    });

    // map
    $("*.map-input-space").live("change", function() {
        var strSearch = getSearchString();
        $.get($(strSearch).attr("action"), $(strSearch).serialize() + "&enable=true", load, "script");
        return false;
    });

    $("*#start_date, *#stop_date, *#search_created_at_gte, *#search_created_at_lte, *#download_start_date, *#nas_start_date, *#nas_stop_date, #manual-report-start-date, #manual-report-end-date").live("focus", function() {
        $(this).datepicker({
            //buttonImage: '/images/calendar_icon.jpg',
            //buttonImageOnly: true,
            //showOn: 'button',
            dateFormat: 'mm/dd/y',
            changeYear: true
        });
    });

    $("#arf_weekly, #arf_monthly").live('change', function() {
        if ($(this).attr("id") == "arf_weekly") {
            document.getElementById("arf_monthly").checked = false;
        }
        else {
            document.getElementById("arf_weekly").checked = false;
        }
        if (document.getElementById("arf_weekly").checked == true)
            document.getElementById("user_autoreport_weekday").disabled = false;
        else
            document.getElementById("user_autoreport_weekday").disabled = true;
    });

    $("#manual_report_submit").live('click', function() {
        var href = document.location.pathname;
        var asset = $("#manural-report-assst").attr("value");
        var start_date = $("#manual-report-start-date").attr("value");
        var end_date = $("#manual-report-end-date").attr("value");
        var speeding = document.getElementById("manual-report-type-speeding").checked;
        var idletime = document.getElementById("manual-report-type-idletime").checked;
        var distance = document.getElementById("manual-report-type-distance").checked;
        var sav = document.getElementById("manual-report-type-sav").checked;

        var date_start = new Date(start_date);
        var date_end = new Date(end_date);
        var diff = date_end - date_start
        if (isNaN(diff) || diff < 0) {
            alert("Date error! Select date again.");
            return false;
        }

        var newHref = href + "?manual_report=true&asset=" + asset + "&start_date=" + start_date + "&end_date=" + end_date + "&speeding=" + speeding + "&idletime=" + idletime + "&distance=" + distance + "&sav=" + sav;
        $.getScript(newHref);
        alert("Send Manual Report...");
        return false;
    });

    //  $("*.export-gpx").live("click", function() {
    //    var strSearch = getSearchString();
    //    var newHref = 'route_rewind?' + $(strSearch).serialize() + "&export=1";
    //    $.getScript(newHref);
    //    $.get($(strSearch).attr("action"), $(strSearch).serialize() + "&export=1", null, "script");
    //    return false;
    //  });

    /*$.datepicker.setDefaults( {
      //buttonImage: '/images/calendar_icon.jpg',
      //buttonImageOnly: true,
      //showOn: 'button',
      dateFormat: 'mm/dd/y',
      changeYear: true,
    });*/

    //$("*#start_date").datepicker();
    //$("*#stop_date").datepicker();
    //  $("*#created_at_gte").datepicker();
    //  $("*#created_at_lte").datepicker();

    if ($("#data-table").length > 0) {
        if (updateDataTimer)
            clearTimeout(updateDataTimer);
        updateDataTimer = setTimeout(updateDatas, 60000);
    }

    if ($("#live-map").length > 0) {
        if (reloadMapTimer)
            clearTimeout(reloadMapTimer);
        reloadMapTimer = setTimeout(updateMap, 5000);
    }

    if ($("#reload-page").length > 0) {
        if (reloadPageTimer)
            clearTimeout(reloadPageTimer);
        reloadPageTimer = setTimeout(reloadPage, 60000);
    }

    //updateFilter();
})

function getSearchString() {
    var strSearch = "";
    if ($("*").hasClass("event_search")) {
        strSearch = "#event_search";
    }
    else if ($("*").hasClass("health_search")) {
        strSearch = "#health_search";
    }
    else if ($("*").hasClass("vehicle_search")) {
        strSearch = "#vehicle_search";
    }
    else if ($("*").hasClass("organization_search")) {
        strSearch = "#organization_search";
    }
    else if ($("*").hasClass("user_search")) {
        strSearch = "#user_search";
    }
    else if ($("*").hasClass("boundary_search")) {
        strSearch = "#boundary_search";
    }
    else if ($("*").hasClass("group_search")) {
        strSearch = "#group_search";
    }
    else if ($("*").hasClass("check_in_search")) {
        strSearch = "#check_in_search";
    }
    else if ($("*").hasClass("rfid_search")) {
        strSearch = "#rfid_search";
    }
    else if ($("*").hasClass("gps_info_search")) {
        strSearch = "#gps_info_search";
    }
    else if ($("*").hasClass("fix_route_search")) {
        strSearch = "#fix_route_search";
    }
    else strSearch = "#nofound";
    return strSearch;
}

function update_manual_download_timestamp() {
    var datetime = $('#download_timestamp').val();
    var length = $('#manual_duration').val();
    var ip = $('#download_vehicle_ip').val();

    var beginDate = new Date(datetime);
    var endDate = new Date(datetime);
    endDate.setSeconds(endDate.getSeconds() + parseInt(length));

    var bday = beginDate.getDate(),
        bmon = beginDate.getMonth() + 1,
        byear = beginDate.getFullYear() - 2000,
        bhrs = beginDate.getHours(),
        bmins = beginDate.getMinutes(),
        bsecs = beginDate.getSeconds(),
        eday = endDate.getDate(),
        emon = endDate.getMonth() + 1,
        eyear = endDate.getFullYear() - 2000,
        ehrs = endDate.getHours(),
        emins = endDate.getMinutes(),
        esecs = endDate.getSeconds();

    var bdayStr = bday < 10 ? "0" + bday.toString() : bday.toString();
    var bmonStr = bmon < 10 ? "0" + bmon.toString() : bmon.toString();
    var byearStr = byear < 10 ? "0" + byear.toString() : byear.toString();
    var bhrsStr = bhrs < 10 ? "0" + bhrs.toString() : bhrs.toString();
    var bminsStr = bmins < 10 ? "0" + bmins.toString() : bmins.toString();
    var bsecsStr = bsecs < 10 ? "0" + bsecs.toString() : bsecs.toString();

    var edayStr = eday < 10 ? "0" + eday.toString() : eday.toString();
    var emonStr = emon < 10 ? "0" + emon.toString() : emon.toString();
    var eyearStr = eyear < 10 ? "0" + eyear.toString() : eyear.toString();
    var ehrsStr = ehrs < 10 ? "0" + ehrs.toString() : ehrs.toString();
    var eminsStr = emins < 10 ? "0" + emins.toString() : emins.toString();
    var esecsStr = esecs < 10 ? "0" + esecs.toString() : esecs.toString();

    var begin = byearStr + bmonStr + bdayStr + bhrsStr + bminsStr + bsecsStr;
    var end = eyearStr + emonStr + edayStr + ehrsStr + eminsStr + esecsStr;

    var link = 'http://' + ip + '/GetDvrFile.cgi?begin=' + begin + '&end=' + end;

    $('a.manual-download-btn').attr('href', link);
}

function update_manual_download() {
    var date = $('#download_start_date').val();
    var time = $('#start-time').slider("calculatedValue") + ':00';
    var length = $('#manual_duration').val();
    var ip = $('#download_vehicle_ip').val();


    var beginDate = new Date(date + ' ' + time);
    var endDate = new Date(date + ' ' + time);
    endDate.setSeconds(endDate.getSeconds() + parseInt(length));

    var bday = beginDate.getDate(),
        bmon = beginDate.getMonth() + 1,
        byear = beginDate.getFullYear() - 2000,
        bhrs = beginDate.getHours(),
        bmins = beginDate.getMinutes(),
        bsecs = beginDate.getSeconds(),
        eday = endDate.getDate(),
        emon = endDate.getMonth() + 1,
        eyear = endDate.getFullYear() - 2000,
        ehrs = endDate.getHours(),
        emins = endDate.getMinutes(),
        esecs = endDate.getSeconds();

    var bdayStr = bday < 10 ? "0" + bday.toString() : bday.toString();
    var bmonStr = bmon < 10 ? "0" + bmon.toString() : bmon.toString();
    var byearStr = byear < 10 ? "0" + byear.toString() : byear.toString();
    var bhrsStr = bhrs < 10 ? "0" + bhrs.toString() : bhrs.toString();
    var bminsStr = bmins < 10 ? "0" + bmins.toString() : bmins.toString();
    var bsecsStr = bsecs < 10 ? "0" + bsecs.toString() : bsecs.toString();

    var edayStr = eday < 10 ? "0" + eday.toString() : eday.toString();
    var emonStr = emon < 10 ? "0" + emon.toString() : emon.toString();
    var eyearStr = eyear < 10 ? "0" + eyear.toString() : eyear.toString();
    var ehrsStr = ehrs < 10 ? "0" + ehrs.toString() : ehrs.toString();
    var eminsStr = emins < 10 ? "0" + emins.toString() : emins.toString();
    var esecsStr = esecs < 10 ? "0" + esecs.toString() : esecs.toString();

    var begin = byearStr + bmonStr + bdayStr + bhrsStr + bminsStr + bsecsStr;
    var end = eyearStr + emonStr + edayStr + ehrsStr + eminsStr + esecsStr;

    var link = 'http://' + ip + '/GetDvrFile.cgi?begin=' + begin + '&end=' + end;

    $('a.manual-download-btn').attr('href', link);

}

function update_download() {
    $("img.get-clip-icn").parent().html('<img src="/images/spinner.gif"/>');
    $("*.manual-download").html('<img src="/images/spinner.gif"/>');
    $.get($("#event-download-form").attr("action"), $("#event-download-form").serialize(), null, "script");
    return false;
}

function updateMap() {
    //  var strSearch = getSearchString();
    //  $.get($(strSearch).attr("action"), $(strSearch).serialize(), reloadLiveMarkers, "xml");
    if (reloadMapTimer)
        clearTimeout(reloadMapTimer);
    reloadLiveMarkers();
    reloadMapTimer = setTimeout(updateMap, 1000);
    return false;
}

function reloadPage() {
    href = window.location.href;
    $.getScript(href);
    if (reloadPageTimer)
        clearTimeout(reloadPageTimer);
    reloadPageTimer = setTimeout(reloadPage, 60000);
    return false;
}

function updateDatas() {
    var page_num = $("#data-table").attr("data-page");
    var direction = $("#direction").attr("value");
    var sort = $("#sort").attr("value");
    var href = $("#data-table").attr("data-path");
    var strSearch = "";

    // check search form class
    if ($("*").hasClass("event_search")) {
        strSearch = $("#event_search").serialize();
    }
    else if ($("*").hasClass("health_search")) {
        strSearch = $("#health_search").serialize();
    }
    else if ($("*").hasClass("vehicle_search")) {
        strSearch = $("#vehicle_search").serialize();
    }
    else if ($("*").hasClass("event-download-form")) {
        strSearch = $("#event-download-form").serialize();
    }
    else if ($("*").hasClass("check_in_search")) {
        strSearch = $("#check_in_search").serialize();
    }
    else if ($("*").hasClass("gps_infos_search")) {
        strSearch = $("#gps_infos_search").serialize();
    }
    else strSearch = "";

    if (page_num <= 0) page_num = 1;
    var eScroll = (document.getElementById("search_event_type_id_in") == null) ? 0 : document.getElementById("search_event_type_id_in").scrollTop;
    var vScroll = (document.getElementById("search_vehicle_id_in") == null) ? 0 : document.getElementById("search_vehicle_id_in").scrollTop;
    var idScroll = (document.getElementById("search_id_in") == null) ? 0 : document.getElementById("search_id_in").scrollTop;
    var vnScroll = (document.getElementById("search_vehicle_num_in") == null) ? 0 : document.getElementById("search_vehicle_num_in").scrollTop;
    var ipScroll = (document.getElementById("search_health_ip_addr_in") == null) ? 0 : document.getElementById("search_health_ip_addr_in").scrollTop;

    $(".pagination").html("Update Data...");
    if ($("*").hasClass("event_search")) {
        var map_it_url = $("#map_it_url").attr("value");
        if (!map_it_url)
            map_it_url = "";
        $.getScript(href + "?page=" + page_num + "&direction=" + direction + "&sort=" + sort + map_it_url + "&" + strSearch + "&escroll=" + eScroll + "&vscroll=" + vScroll + "&idscroll=" + idScroll + "&vnscroll=" + vnScroll + "&ipscroll=" + ipScroll);
    }
    else
        $.getScript(href + "?page=" + page_num + "&direction=" + direction + "&sort=" + sort + "&" + strSearch + "&escroll=" + eScroll + "&vscroll=" + vScroll + "&idscroll=" + idScroll + "&vnscroll=" + vnScroll + "&ipscroll=" + ipScroll);

    if (updateDataTimer)
        clearTimeout(updateDataTimer);
    updateDataTimer = setTimeout(updateDatas, 60000);
    return false;
}


function updateFilter() {
    $("*.filter_check").each(function(i) {
        var id = i + 1;
        //var id = parseInt($(this).attr("id").replace('filter_', ''));
        if ($("*#filter_" + id).is(":checked")) {
            $("*#column_" + id).hide();
        } else {
            $("*#column_" + id).show();
        }
    });
}

function changeFilter() {
    //var id = parseInt($(this).attr("id").replace('filter_', ''));
    var strSearch = getSearchString();

    //$(".pagination").html("Update Data...");
    $(".pages").html("Update Data...");
    $.get($(strSearch).attr("action"), $(strSearch).serialize(), null, "script");
}

function setup_colorbox() { }

function slider_update_datas(value) {
    var strSearch = getSearchString();
    $.get($(strSearch).attr("action"), $(strSearch).serialize(), null, "script");
    return false;
}

function disableEnterKey() {
    if (event.keyCode == 13) {
        event.cancelBubble = true;
        event.returnValue = false;
    }
}

