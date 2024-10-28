<?php
/**
 * Main Code for ACTUS Xfields.
 *
 * @package    Actus_Xfields
 */


// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}



// DEFINE AND LOAD VARIABLES
global $post, $axf_options, $matched_fieldsets, $AXFields;


// LOAD DATA
$_SESSION['AXF_fieldsets'] = json_decode( get_option( 'AXF_fieldsets' ), true );
$axf_options = array(
    'version'    => ACTUS_XF_VERSION,
    'fieldsets'  => $_SESSION['AXF_fieldsets'],
);   

$matched_fieldsets = AXF_target_match();
//dbg( $matched_fieldsets, 'MATCHED');


// SCREEN CONTROL
if ( $matched_fieldsets != "" ) {
foreach( $matched_fieldsets as $current ) {
if ( isset( $axf_options['fieldsets'][$current]['options'] ) ) {
foreach( $axf_options['fieldsets'][$current]['options']['hide'] as $hide ) {
    if ( $hide == 'permalink' ) {
        echo "<style>#edit-slug-box { display: none; }</style>";
    } else if ( $hide == 'slug' ) {
        echo "<style>#slugdiv { display: none; }</style>";
    } else if ( $hide == 'categories' ) {
        echo "<style>#categorydiv { display: none; }</style>";
    } else if ( $hide == 'tags' ) {
        echo "<style>#tagsdiv-post_tag { display: none; }</style>";
    } else {
        remove_post_type_support('post', $hide);
        remove_post_type_support('page', $hide);
        if ( $hide == 'comments' ) {
            echo "<style>#commentsdiv { display: none; }</style>";
        }
    }
        
}
}
}
}
//if ( $axf_options['fieldsets'] )
//    remove_post_type_support('page', 'editor');



// DEFINE $AXFields
function AXF_wp_loaded(){
    global $post, $AXFields;
    $AXFieldsLoaded = json_decode( stripslashes(get_post_meta( $post->ID, 'actus_xfields', true )), true );
    $AXGlobalsLoaded = json_decode( stripslashes( get_option( 'AXF_globals' ) ), true );
    $AXFields  = array();
    $AXGlobals = array();
    // string values
    if ( $AXGlobalsLoaded )
        $AXGlobals = $AXGlobalsLoaded;
    
    if ( $AXFieldsLoaded )
    foreach ($AXFieldsLoaded as $key => $field) {
            
		$AXFields[ $key ] = $field;

    }
}
add_action( 'wp', 'AXF_wp_loaded' );




function create_AXF_metabox() {
    global $post, $matched_fieldsets;
    $matched_fieldsets = AXF_target_match();
//dbg( $matched_fieldsets, 'create_AXF_metabox');
	
    $actus_black = ACTUS_XF_URL . 'img/actus_black_20.png';
    $metabox_title = "<img src='$actus_black' class='actus-metabox-logo'>";
    $metabox_title .= esc_html__( 'ACTUS extra fields', 'actus-xfields' );
    
    // Can only be used on a single post type (ie. page or post or a custom post type).
    // Must be repeated for each post type you want the metabox to appear on.
    add_meta_box(
        'actus_fields', // Metabox ID
        $metabox_title, // Title to display
        'AXF_render_metabox', // Function to call that contains the metabox content
        'page', // Post type to display metabox on
        'normal', // Where to put it (normal = main colum, side = sidebar, etc.)
        'default' // Priority relative to other metaboxes
    );
    add_meta_box(
        'actus_fields', 
        'ACTUS extra fields',
        'AXF_render_metabox',
        'post',
        'normal',
        'default'
    );
    add_meta_box(
        'actus_fields', 
        'ACTUS extra fields',
        'AXF_render_metabox',
        'product',
        'normal',
        'default'
    );
    $current_user = wp_get_current_user();
    if($current_user->roles[0] === 'administrator') {
        add_meta_box( 'axf_meta', __( 'Meta Box Title', 'actus-xfields' ), 'prfx_meta_callback', 'dashboard' );
    }

}
add_action( 'add_meta_boxes', 'create_AXF_metabox' );
 

function dbg( $data, $label="" ){
  echo '<script>';
  echo 'console.log("' . $label . ' --->>> ",'. json_encode( $data ) .')';
  echo '</script>';
}





add_action( 'current_screen', 'AXF_admin_screens' );
function AXF_admin_screens() {
    global $post, $axf_options, $admin_matched, $matched_fieldsets, $menu, $submenu, $hook_suffix;
	
    $current_screen = get_current_screen();

	if ( $current_screen->id != 'page' && $current_screen->id != 'post' ) {
	$matched_fieldsets = array();
    foreach( $admin_matched as $key => $fieldset_ids ) {
    foreach( $fieldset_ids as $fieldset_id ) {
        if(  strpos( $key, $current_screen->id ) !== false ||
             strpos( $current_screen->id, $key ) !== false ||
             $current_screen->id == $key ||
             $hook_suffix == $key ) {
            $match = $key;
			if ( ! in_array($fieldset_id, $matched_fieldsets) )
				$matched_fieldsets[] = $fieldset_id;
			
			$hook = $match;
			if ( $hook == 'actus-xfields' ) 
				$hook = 'actus_page_actus-xfields';
			$hook = 'admin_head';
			$hook = 'admin_footer';
			$hook = 'admin_head-'.$hook_suffix;
			$hook = 'admin_footer-'.$hook_suffix;

			add_action($hook, 'AXF_render_metabox_admin');
        }
    }
    }
    }

}
function AXF_render_metabox_admin() {
    global $post, $axf_options, $admin_matched, $matched_fieldsets, $menu, $submenu;
    echo '<div class="clear"></div>';
    echo '<div id="ADMIN-AXFIELDS" class="wrap"></div>';    
    ?>
    <script>
    jQuery(document).ready(function() {

        ACTUS.XF.postID  = 0;
        ACTUS.XF.matched = <?php echo json_encode( $matched_fieldsets ); ?>;
        ACTUS.XF.RENDER.metabox('#ADMIN-AXFIELDS');

    })
    </script>
    <?php
    
}



// ADMIN SCREENS TARGET MATCH
function AXF_admin_target_match(){
    global $post, $axf_options, $admin_matched;
    $admin_matched = array();
    $return  = array();
	
   // LOOP FIELDSETS
	if ( isset($axf_options['fieldsets']) )
	if ( sizeof($axf_options['fieldsets']) > 0 )
    foreach( $axf_options['fieldsets'] as $fieldset ) {
        if ( isset($fieldset['targets']) ) {
        if ( sizeof($fieldset['targets']) > 0 ) {
            
            //LOOP TARGETS
            foreach( $fieldset['targets'] as $target ) {
                if ( $target['type'] == 'admin screen' ) {
					if ( ! isset( $admin_matched[ $target['value'] ] ) )
						$admin_matched[ $target['value'] ] = [];
                    $admin_matched[ $target['value'] ][] = $fieldset['id'];
                    $return[] = $fieldset['id'];
                }
                
            }
            
        }
        }
        
    }
    
    return $return;
}


// TARGET MATCH
function AXF_target_match() {
    global $post, $axf_options;
    $LOG = array();
    $matched = array();
    
    //$current_screen = get_current_screen();
    
    if ( ! isset( $_GET['post'] ) && ! isset( $_POST['post_ID'] ) ) {
		AXF_admin_target_match();
        return false;
	}
    
    $post_id = 0;
    if ( isset( $_GET['post'] ) ) 	  $post_id = intval( $_GET['post'] );
    if ( isset( $_POST['post_ID'] ) ) $post_id = intval( $_POST['post_ID'] );
    
    $post_parent   = wp_get_post_parent_id( $post_id );
    $post_type     = get_post_type( $post_id );
    //$page_template = get_post_meta($post_id, '_wp_page_template', true);
    $page_template = get_page_template_slug($post_id);
    
    // LOOP FIELDSETS
	if ( isset($axf_options['fieldsets']) )
	if ( sizeof($axf_options['fieldsets']) > 0 )
    foreach( $axf_options['fieldsets'] as $fieldset ) {
        $LOG[] = '################ ' . $fieldset['id'];
        $matches  = [];
        $matchIdx = -1;
        $prevBool = '';
        $cnt = 0;
        if ( isset($fieldset['targets']) ) {
        if ( sizeof($fieldset['targets']) > 0 ) {
            
            //LOOP TARGETS
            foreach( $fieldset['targets'] as $target ) {
                if ( ! isset($target['boole']) ) $target['boole'] = 'OR';
                if ( $target['boole'] == 'OR' ) {
                    $matchIdx++;
                    $matches[ $matchIdx ] = true;
                }
                if ( !isset($target['type']) || $target['type'] == '' )
                    $target['type'] = 'post';
                
                // TYPE
                // post
                if ( $target['type'] == 'post' && $post_type != 'post' )
                    { $matches[ $matchIdx ] = false; }
                // page
                if ( $target['type'] == 'page' && $post_type != 'page' )
                    { $matches[ $matchIdx ] = false; }

                
                if ( $cnt > 0 ) $LOG[] = $target['boole'] . ' #########';
                
                if ( $target['boole'] == 'AND' ) {
                    $matches[ $matchIdx ] = true;
                } else {
                    $LOG[] = 'item >>> ' . $target['type'] . ' >>> ' . $matches[ $matchIdx ];
                }
                

                // ADMIN SCREEN
                if ( $target['type'] == 'admin screen' ) { 
                    $matches[ $matchIdx ] = false;
                }

                // ID
                if ( $target['criteria'] == 'id' && 
                     $target['value'] != $post_id ) { 
                    $matches[ $matchIdx ] = false;
                }
                // Type
                if ( $target['criteria'] == 'type' && 
                     $target['value'] != $post_type ) { 
                    $matches[ $matchIdx ] = false;
                }
                // Search
                if ( $target['criteria'] == 'search' ) { 
                    $target_id = intval( explode(':',$target['value'])[0] );
                    if ( $target_id != $post_id )
                        $matches[ $matchIdx ] = false;
                }
                // Parent
                if ( $target['criteria'] == 'parent' ) { 
                    $target_id = intval( explode(':',$target['value'])[0] );
                    if ( $target_id != $post_parent )
                        $matches[ $matchIdx ] = false;
                }
                
                
                if ( $target['criteria'] == 'id' )
                    $LOG[] = 'id >>> ' . $target['value'] . ' >>> ' . $matches[ $matchIdx ];
                if ( $target['criteria'] == 'type' )
                    $LOG[] = 'type >>> ' . $target['value'] . ' >>> ' . $matches[ $matchIdx ];


                // Template
                if ( isset($target['criteria']) ) {
                    if ( $target['criteria'] == 'template' && 
                         $target['value'] != $page_template )
                        { $matches[ $matchIdx ] = false; }
                } else  
                    $matches[ $matchIdx ] = false;
                
                if ( $target['criteria'] == 'template' )
                   $LOG[] = 'template >>> ' . $target['value'] . ' >>> ' . $matches[ $matchIdx ];

                
                if ( isset($target['boole']) ) {
                    /*
                    if ( $target['boole'] == 'AND' ) {
                        if ( !$matches[ $matchIdx ] ) continue;
                    }
                    if ( $target['boole'] == 'OR' ) {
                        $matchIdx++;
                        $matches[ $matchIdx ] = true;
                    }
                    */
                    
                    $prevBool = $target['boole'];
                } else $prevBool = '';
                
                

$LOG[] = $matchIdx . ' >>>>>>>>>>>>>>>> ' . $matches[ $matchIdx ];
                
                
            }
        } else $matches[ $matchIdx ] = false;
        } else $matches[ $matchIdx ] = false;
        
        
$LOG[] = ' ';
$LOG[] = $matches;
        
        $match = false;
        foreach( $matches as $match_set ) {
            if ( $match_set ) {
                $match = true;
            } 
            $LOG[] = $match_set . ' --- ' . $match;
        }
$LOG[] = ' ';

        if ( $match ) {
            $matched[] = $fieldset['id'];
            // load matched fieldset fields
            $axf_options['fieldsets'][ $fieldset['id'] ]['xfields'] =
                json_decode( get_option( $fieldset['id'] ), true );
        }
    }

//dbg( $LOG );
//dbg( $matched );
//dbg( $matched, 'MATCHED');
    return $matched;

}


// RENDER METABOX
function AXF_render_metabox() {
    global $post, $axf_options, $matched_fieldsets, $AXFields;
        
	$postID = 0;
	if ( is_object( $post ) )
		$postID = $post->ID;
	
 
    //$matched_fieldsets = AXF_target_match();
    if ( ! is_object($matched_fieldsets) && ! is_array($matched_fieldsets) )
		return;
    if ( sizeof($matched_fieldsets) == 0 ) return;
    
    ?>
    <script>
    jQuery(document).ready(function() {

        ACTUS.XF.postID  = <?php echo intval($postID); ?>;
        ACTUS.XF.matched = <?php echo json_encode( $matched_fieldsets ); ?>;
        ACTUS.XF.RENDER.metabox();

    })
    </script>
    <?php
    


	wp_nonce_field( 'actus_xfields_form_nonce', 'actus_xfields_form_process' );


}





// SAVE ACTUS FIELDS
function actus_extra_fields_save( $post_id ) {
    global $axf_options, $matched_fieldsets, $post;
    
    /*
	// Verify that our security field exists. If not, bail.
	if ( !isset( $_POST['actus_xfields_form_process'] ) ) return;

	// Verify data came from edit/dashboard screen
	if ( !wp_verify_nonce( $_POST['actus_xfields_form_process'], 'actus_xfields_form_nonce' ) ) {
		return $post->ID;
	}
    */

	// Verify user has permission to edit post
	if ( !current_user_can( 'edit_post', $post->ID )) {
		return $post->ID;
	}

    $matched_fieldsets = AXF_target_match();
    AXF_render_metabox();

    $actus_xfields_save = array();
	if ( is_object($matched_fieldsets) || is_array($matched_fieldsets) )
	if ( sizeof($matched_fieldsets) > 0 )
    foreach ($matched_fieldsets as $fieldset_id) {
        $fieldset = $axf_options['fieldsets'][ $fieldset_id ];

        foreach ($fieldset['xfields'] as $xfield) {	
        if ( isset( $xfield['id'] ) ) {
        //if ( isset( $_POST[ $xfield['id'] ] ) ) {

			
            if ( $xfield['type'] != 'group' && 
                 $xfield['type'] != 'multi' &&
                 substr($xfield['parent_group'],0,5) != 'multi' ) {
                
				if ( isset($_POST[ $xfield['id'] ]) )
                $value = wp_filter_post_kses( wp_unslash($_POST[ $xfield['id'] ]) );
                
                if ( is_string( $_POST[ $xfield['id'] ] ) )
                    $value = wp_filter_post_kses( wp_unslash($_POST[ $xfield['id'] ]) );
                //$value = sanitize_text_field( ($_POST[ $xfield['name'] ]) );

                if ( $xfield['type'] == 'textarea' )  {
                    $value = sanitize_textarea_field( wp_unslash($_POST[ $xfield['id'] ]) );
                }
                if ( $xfield['type'] == 'textarea' ||
                     $xfield['type'] == 'texteditor' )  {
                    $remove   = array("\r\n", "\n", "\r", "rn", "rnrn", "<p>&nbsp;</p>");
                    $value = str_replace($remove, '', $value);
                    $value = str_replace('\"', "\'", $value);
                }

                if ( is_array( $_POST[ $xfield['id'] ] ) )
                    $value = $_POST[ $xfield['id'] ];
                    
                $actus_xfields_save[ $xfield['name'] ] = $value;
            }
            
			
            // MULTI 
            if ( substr($xfield['parent_group'],0,5) === 'multi' &&
                 $xfield['type'] != 'multi' ) {
                
                $multiName = $fieldset['xfields'][ $xfield['parent_group'] ]['name'];
				if ( ! isset( $actus_xfields_save[ $multiName ] ) )
					$actus_xfields_save[ $multiName ] = array();
                if ( $xfield['type'] == 'textarea' || 
                     $xfield['type'] == 'texteditor' ) {
                    
					
                    $count = intval( $_POST[ $xfield['parent_group'] ] );

                    $value = array();
                    $value[0] = "";
                    for ( $n=1;$n<=$count;$n++) {
                        $value[$n] = wp_filter_post_kses( wp_unslash( $_POST[ $xfield['parent_group'].'_'.$xfield['id'] . '_' . $n ] ));
                        
                        $remove   = array("\r\n", "\n", "\r", "rn", "rnrn", "<p>&nbsp;</p>");
                        $value[$n] = str_replace($remove, '', $value[$n]);
                    }
	
                    
                } else {
                    
                    $value = $_POST[ $xfield['parent_group'].'_'.$xfield['id'] ];

                    foreach( $value as $n => $v ) {
						$v =  wp_filter_post_kses( wp_unslash($v) );
						$value[ $n ] =  $v;
                    }
                    
                }

                $actus_xfields_save[ $multiName ][ $xfield['name'] ] = $value;

            }
            
            
            
        //}
        }
        }
    }
    $actus_xfields_save_str = json_encode( $actus_xfields_save, JSON_UNESCAPED_UNICODE );

    update_post_meta( $post->ID, 'actus_xfields', $actus_xfields_save_str );
    //update_post_meta( $post->ID, 'actus_xfields_post', json_encode($_POST) );

}
add_action( 'save_post', 'actus_extra_fields_save', 1, 2 );
add_action( 'save_post_product', 'actus_extra_fields_save', 1, 2 );


