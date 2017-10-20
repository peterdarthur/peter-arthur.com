<?php
/**
* Plugin Name:   CPT Shortcode
* Description:   Adds a custom post type "Project" and taxonomy "Skills"
* Version:       1.0
* Author:        Peter
*
*
*/

/*********************************************************************************
Register Post Type
*********************************************************************************/

function wpmu_create_post_type() {
	$labels = array( 
		'name' => __( 'Projects', 'wpmu' ),
		'singular_name' => __( 'Project', 'wpmu' ),
		'add_new' => __( 'New Project', 'wpmu' ),
		'add_new_item' => __( 'Add New Project', 'wpmu' ),
		'edit_item' => __( 'Edit Project', 'wpmu' ),
		'new_item' => __( 'New Project', 'wpmu' ),
		'view_item' => __( 'View Project', 'wpmu' ),
		'search_items' => __( 'Search Projects', 'wpmu' ),
		'not_found' =>  __( 'No Projects Found', 'wpmu' ),
		'not_found_in_trash' => __( 'No Projects found in Trash', 'wpmu' ),
	);
	$args = array(
		'labels' => $labels,
		'has_archive' => true,
		'public' => true,
		'hierarchical' => false,
		'rewrite' => array( 'slug' => 'projects' ),
		'supports' => array(
			'title', 
			'editor', 
			'excerpt', 
			'custom-fields', 
			'thumbnail', // had to add support for post-thumbnails in theme's functions.php
			'page-attributes'
		),
		'taxonomies' => array( 'post_tag', 'category'), 
	);
	register_post_type( 'project', $args );
} 
add_action( 'init', 'wpmu_create_post_type' );
 
/*********************************************************************************
Register Taxonomy
*********************************************************************************/

function wpmu_register_taxonomy() {
	
	  $labels = array(
			'name'              => __( 'Skills', 'wpmu' ),
			'singular_name'     => __( 'Skill', 'wpmu' ),
			'search_items'      => __( 'Search Skills', 'wpmu' ),
			'all_items'         => __( 'All Skills', 'wpmu' ),
			'edit_item'         => __( 'Edit Skills', 'wpmu' ),
			'update_item'       => __( 'Update Skills', 'wpmu' ),
			'add_new_item'      => __( 'Add New Skills', 'wpmu' ),
			'new_item_name'     => __( 'New Skill Name', 'wpmu' ),
			'menu_name'         => __( 'Skills', 'wpmu' ),
		);
		
		$args = array(
			'labels' => $labels,
			'hierarchical' => true,
			'sort' => true,
			'args' => array( 'orderby' => 'term_order' ),
			'rewrite' => array( 'slug' => 'Skills' ),
			'show_admin_column' => true
		);
		
		register_taxonomy( 'skill', array( 'post', 'project' ), $args);
		
	}
	add_action( 'init', 'wpmu_register_taxonomy' );

	/*********************************************************************************/
	// if a taxonomy and post type exist already,
	// instead of re-registering them, link them like this:

	function wpmu_add_categories_to_pages() {
		register_taxonomy_for_object_type( 'category', 'page' );
	}
	add_action( 'init', 'wpmu_add_categories_to_pages' );