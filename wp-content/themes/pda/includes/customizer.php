<?php

    // add sections to customizer -- possibilities include media upload, radio buttons to toggle layouts, styles, etc.
    function wpmu_customize_register( $wp_customize ) {
        // section for contact details
        $wp_customize->add_section( 'wpmu_contact' , array(
            'title' => __( 'Contact Details', 'wpmu')
        ));
        // section for colors 
        $wp_customize->add_section( 'wpmu_colors', array(
            'title' => __( 'Color Scheme', 'wpmu' )
        ));

        // set up our own class with a generic text control. This means we don’t need to define our text control every time we add a new one
        class wpmu_Customize_Textarea_Control extends WP_Customize_Control {
            
            public $type = 'textarea';
            public function render_content() {
                
                echo '<label>';
                    echo '<span class="customize-control-title">' . esc_html( $this-> label ) . '</span>';
                    echo '<textarea rows="2" style ="width: 100%;"';
                    $this->link();
                    echo '>' . esc_textarea( $this->value() ) . '</textarea>';
                echo '</label>';
                
            }
        }

        // Address field, based on text control class above
        // setting is what WP stores in the database
        $wp_customize->add_setting( 
            'wpmu_address_setting' //ID for this setting
            , array ('default' => __( 'Your address', 'wpmu' )) // default value
        );
        //control is the interface where users will enter data
        $wp_customize->add_control( new wpmu_Customize_Textarea_Control( // new instance of class above with these settings
            $wp_customize, // the object of this class
            'wpmu_address_setting', // unique ID for the setting (above)
            array( 
                'label' => __( 'Address', 'wpmu' ),
                'section' => 'wpmu_contact', // where the control will be in the customizer
                'settings' => 'wpmu_address_setting' // where data will be sent (same setting ID)
        )));

        // Phone number field, based on text control class above
        $wp_customize->add_setting( 'wpmu_telephone_setting', array (
            'default' => __( 'Your telephone number', 'wpmu' )
        ));
        $wp_customize->add_control( new wpmu_Customize_Textarea_Control(
            $wp_customize,
            'wpmu_telephone_setting',
            array( 
                'label' => __( 'Telephone Number', 'wpmu' ),
                'section' => 'wpmu_contact',
                'settings' => 'wpmu_telephone_setting'
        )));

        // Email address field, based on text control class above
        $wp_customize->add_setting( 'wpmu_email_setting', array (
            'default' => __( 'Your email address', 'wpmu' )
        ));
        $wp_customize->add_control( new wpmu_Customize_Textarea_Control(
            $wp_customize,
            'wpmu_email_setting',
            array( 
                'label' => __( 'Email', 'wpmu' ),
                'section' => 'wpmu_contact',
                'settings' => 'wpmu_email_setting'
        )));

        // CUSTOMIZER: COLORS SECTION
        // Set up defaults and labels here, then loop through to add settings and controls
        // main color - site title, h1, h2, h4, widget headings, nav links, footer background
        $textcolors[] = array(
            'slug' => 'wpmu_color1',
            'default' => '#3394bf',
            'label' => __( 'Main color', 'wpmu' )
        );

        // secondary color - navigation background
        $textcolors[] = array(
            'slug' => 'wpmu_color2',
            'default' => '#183c5b',
            'label' => __( 'Secondary color', 'wpmu' )
        );

        // link color
        $textcolors[] = array(
            'slug' => 'wpmu_links_color1',
            'default' => '#3394bf',
            'label' => __( 'Links color', 'wpmu' )
        );

        // link color on hover
        $textcolors[] = array(
            'slug' => 'wpmu_links_color2',
            'default' => '#666',
            'label' => __( 'Links color (on hover)', 'wpmu' )
        );

        // set up Settings and Controls for all colors, one after the other
        foreach ( $textcolors as $textcolor ) {
            
            // settings
            $wp_customize->add_setting(
                $textcolor[ 'slug' ] // Unique Setting ID
                , array (
                    'default' => $textcolor[ 'default' ], // default color value
                    'type' => 'option' // type of control to use for use input
                )
            );
            // controls
            $wp_customize->add_control( new WP_Customize_Color_Control(
                $wp_customize, // this object
                $textcolor[ 'slug' ], // the ID of this setting
                array (
                    'label' => $textcolor[ 'label' ], // label for this control
                    'section' => 'wpmu_colors', // section where this control appears
                    'settings' => $textcolor[ 'slug' ] // where to save data from this control
                )
            ));
        }


    }
    add_action( 'customize_register', 'wpmu_customize_register' );

    // use customizer-added data in theme
    function wpmu_display_contact_details_in_header() { ?>

        <address>
            
            <p class="address">
                <?php // get_theme_mod() fetches data from the setting ID specified (setting_ID,default_value)
                    echo get_theme_mod( 'wpmu_address_setting', 'Your address' ); ?>
            </p>
            
            <p class="tel">
                <?php echo get_theme_mod( 'wpmu_telephone_setting', 'Your telephone number' ); ?>
            </p>
            
            <?php $email = get_theme_mod( 'wpmu_email_setting', 'Your email address' ); ?>
            <p class="email">
                <a href="<?php echo $email; ?>">
                    <?php echo $email; ?>
                </a>
            </p>

        </address>
        
    <?php }
        // find "do_action( 'wpmu_in_header' );" hook in header.php
        add_action( 'wpmu_in_header', 'wpmu_display_contact_details_in_header' );



        function wpmu_add_color_scheme() {
            $color_scheme1 = get_option( 'wpmu_color1' );
            $color_scheme2 = get_option( 'wpmu_color2' );
            $link_color1 = get_option( 'wpmu_links_color1' );
            $link_color2 = get_option ( 'wpmu_links_color2' );
            ?>
            <style>
                /* main color */
                .site-title a:link,
                .site-title a:visited,
                .site-description,
                h1,
                h2,
                h2.page-title,
                h2.post-title,
                h2 a:link,
                h2 a:visited,
                nav.main a:link,
                nav.main a:visited {color: <?php echo $color_scheme1; ?>;}
                footer {background: <?php echo $color_scheme1; ?>;}

                /* second color */
                nav.main,
                nav.main a {background: <?php echo $color_scheme2; ?>;}

                /* link color */
                a:link,
                a:visited,
                .sidebar a:link,
                .sidebar a:visited {color: <?php echo $link_color1; ?>;}
                
                /* link hover color */
                a:hover,
                a:active,
                .sidebar a:hover,
                .sidebar a:active {color: <?php echo $link_color2; ?>;}

            </style>
            <?php }
            add_action( 'wp_head', 'wpmu_add_color_scheme' );
    
?>