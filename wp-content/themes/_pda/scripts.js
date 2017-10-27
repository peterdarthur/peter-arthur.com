(function($) {

	function createSquare(element,w,h) {
        	$(element).each(function(){
        		var width = parseInt($(this).css('width'), 10);
        		var height = (width * h) / w; // cross-multiply ratios
        		$(this).css('height', height + 'px');
        	});
    }
	var $box = $('.post-box');

	$(document).ready(function(){

	    // set post-box aspect ratio
	    $(window).bind('resize', function() {
	    	createSquare($box,4,3);
	    });    
	    $(window).resize();

	    $('.post-box').hover( function() {
	        $(this).find('.post-info').stop(true, true).fadeIn();
	    }, function(){
	        $(this).find('.post-info').stop(true, true).fadeOut();

	    });
	});
	// $(document).ready(function(){createSquare($box)});
	// $(window).bind('resize', function(){createSquare($box)}); // https://stackoverflow.com/a/1194531/4107296

})(jQuery);