<?php
/**
 * 
 * @package     Actus_Xfields
 *
 * Plugin Name: ACTUS Xfields
 * Plugin URI:  https://wp.actus.works/actus-xfields/
 * Description: Create custom fields for your pages and posts, or global options for your website.
 * Version:     1.0.3
 * Author:      Stelios Ignatiadis
 * Author URI:  https://wp.actus.works/
 * Text Domain: actus-xfields
 * License: GPL-2.0+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}


/**
 * Define Path Constants
 *
 * @since 0.1.0
 * @constant string ACTUS_THEME_DIR   Directory of the current Theme.
 * @constant string ACTUS_XF_NAME    Plugin Basename.
 * @constant string ACTUS_XF_DIR     Directory of the Plugin.
 * @constant string ACTUS_XF_DIR     URL of the Plugin.
 * @constant string ACTUS_XF_VERSION Plugin Version.
 */
function actus_xf_define_constants() {
    if ( ! defined( 'ACTUS_XF_NAME' ) ) {
        define( 'ACTUS_XF_NAME', trim( dirname( plugin_basename(__FILE__) ), '/') );
    }
    if ( ! defined( 'ACTUS_XF_DIR' ) ) {
        define( 'ACTUS_XF_DIR', plugin_dir_path( __FILE__ ) );
    }
    if ( ! defined( 'ACTUS_XF_URL' ) ) {
        define( 'ACTUS_XF_URL', plugin_dir_url( __FILE__ ) );
    }
    if ( ! defined( 'ACTUS_XF_VERSION' ) ) {
        define( 'ACTUS_XF_VERSION', '1.0.3' );
    }
}
actus_xf_define_constants();







// INITIALIZE
add_action( 'init', 'actus_xf_init' );
add_action( 'admin_init', 'actus_xf_admin_init' );




/**
 * Plugin Initialization.
 *
 */
function actus_xf_init() {
    global $axf_options;

    // INCLUDE THE FILE THAT DEFINES VARIABLES AND DEFAULTS
    require_once ACTUS_XF_DIR . '/includes/actus-xf-main.php';


    // The Administration Options.
    if ( is_admin() ) {
        require_once ACTUS_XF_DIR . '/includes/actus-xf-admin.php';
        //require_once ACTUS_XF_DIR . '/includes/actus-mtn-edit.php';
    }

}
function actus_xf_admin_init() {
    global $axf_options;
    update_option( 'ACTUS_XF_VERSION', ACTUS_XF_VERSION );
    
    // INCLUDE THE FILE THAT DEFINES VARIABLES AND DEFAULTS
    require_once ACTUS_XF_DIR . '/includes/actus-xf-main.php';

    
}




/**
 * Actions that run during plugin activation.
 */
function activate_actus_xf() {
	require_once ACTUS_XF_DIR . '/includes/actus-xf-activator.php';
}
register_activation_hook( __FILE__, 'activate_actus_xf' );




$plugin = plugin_basename(__FILE__);
add_filter( "plugin_action_links_$plugin", 'actus_xf_settings_link' );

/*
 * Add settings link on plugin page
 *
 */
function actus_xf_settings_link( $links ) { 
  $settings_link = '<a href="admin.php?page=actus-xfields">Fieldsets</a>'; 
  array_unshift( $links, $settings_link ); 
  return $links; 
}