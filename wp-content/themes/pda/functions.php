<?php 
include( get_stylesheet_directory() . '/includes/customizer.php' );

// adds support for featured images in these post types
add_theme_support( 'post-thumbnails', array( 'post', 'page', 'project' ));
?>
