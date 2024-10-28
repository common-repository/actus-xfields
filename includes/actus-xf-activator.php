<?php
/**
 * Actions that run during plugin activation
 *
 * Sets the default options
 *
 * @package    Actus_Xfields
 */
 
// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

update_option( 'ACTUS_XF_VERSION', ACTUS_XF_VERSION );
/*
add_option( 'ACTUS_MTN_test',        250);
*/