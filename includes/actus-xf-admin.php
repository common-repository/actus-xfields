<?php
/**
 * The administration options.
 *
 * @package    Actus_Xfields
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

$plugin = plugin_basename(__FILE__);


update_option( 'ACTUS_XF_VERSION',    ACTUS_XF_VERSION );
add_action( 'admin_enqueue_scripts', 'actus_xf_depedencies_admin' );






/*
 * Loads the necessary JS & CSS files
 *
 *
 */
function actus_xf_depedencies_admin() {
    global $axf_options, $menu, $submenu;
    $post_id = 0;
    if ( isset($_GET['post']) ) 	$post_id = intval( $_GET['post'] );
    if ( isset($_POST['post_ID']) ) $post_id = intval( $_POST['post_ID'] );

    global $submenu, $menu, $pagenow;
    $axf_options['admin_menu']     = $menu;
    $axf_options['admin_submenu']  = $submenu;
    $axf_options['current_screen'] = get_current_screen();
    $axf_options['fieldnames'] = explode( ',', get_option( 'AXF_fieldnames' ) );
    $axf_options['globals']    = json_decode( get_option( 'AXF_globals' ) );


    // LOAD WP DATA
    if ( $axf_options['current_screen']->id == "actus_page_actus-xfields" ) {
        
        $axf_options['wp_data'] = array(
            'post_types'      => get_post_types(),
            'post_categories' => get_categories(),
            'post_tags'       => get_tags( array('hide_empty' => false ) ),
            'page_templates'  => get_page_templates(),
            'post_templates'  => get_page_templates(null,'post'),
            'admin_pages'     => $menu,
            'admin_subpages'  => $submenu,
        );
        
    }
    
    wp_enqueue_media();
    
    wp_enqueue_style( 
        'actus-admin-styles', 
        ACTUS_XF_URL . 'css/actus-admin.css',
        false, ACTUS_XF_VERSION, 'all' );
    
    wp_enqueue_style( 
        'actus-xf-admin-styles', 
        ACTUS_XF_URL . 'css/actus-xf-admin.css',
        false, ACTUS_XF_VERSION, 'all' );
    
    wp_enqueue_script(
        'actus_xf_admin_script',
        ACTUS_XF_URL . 'js/actus-xf-admin.js',
        array('jquery'), ACTUS_XF_VERSION, true);
    wp_enqueue_script(
        'actus_xf_admin_events',
        ACTUS_XF_URL . 'js/actus-xf-admin-events.js',
        array('jquery', 'actus_xf_admin_script' ), ACTUS_XF_VERSION, true);
    
    $actus_nonce = wp_create_nonce( 'actus_nonce' );
    $actus_xf_params_admin = array(
        'ajax_url'   => admin_url( 'admin-ajax.php' ),
        'nonce'      => $actus_nonce,
        'plugin_dir' => ACTUS_XF_DIR,
        'plugin_url' => ACTUS_XF_URL,
        'options'    => $axf_options,
    );
    wp_localize_script(
        'actus_xf_admin_script',
        'actusXFparams', $actus_xf_params_admin );
    wp_localize_script(
        'actus_xf_admin_events',
        'actusXFparams', $actus_xf_params_admin );
    

}


/*
 * Adds ACTUS menu on admin panel
 */
if ( !function_exists( 'actus_menu' ) ) {
    function actus_menu(){
        add_menu_page( 
            'ACTUS Plugins',
            'ACTUS',
            'manage_options',
            'actus-plugins',
            'actus_plugins_page',
            ACTUS_XF_URL . 'img/actus_white_20.png',
            66
        );
    }
    if ( is_admin() ) {
        add_action( 'admin_menu', 'actus_menu' );
    }
}
/*
 * Adds submenu on ACTUS menu
 */

if ( !function_exists( 'actus_xf_submenu' ) ) {
    function actus_xf_submenu() {
        add_submenu_page(
            'actus-plugins', 
            'ACTUS Xfields Options', 
            'ACTUS Xfields', 
            'manage_options', 
            'actus-xfields', 
            'actus_xfields_admin_page'
        );
    }
    if ( is_admin() ) {
        add_action( 'admin_menu', 'actus_xf_submenu' );
    }
}

/*
 * Adds OPTIONS page
 */
if ( !function_exists( 'global_options_menu' ) ) {
    function global_options_menu(){
        add_menu_page( 
            'actus-global',
            get_bloginfo('name'),
            'manage_options',
            'actus-global-options',
            'actus_global_options_page',
            get_site_icon_url(32),
            //ACTUS_XF_URL . 'img/actus_white_20.png',
            1
        );
    }
    if ( is_admin() ) {
        add_action( 'admin_menu', 'global_options_menu' );
    }
}






/*
 * Global Options Page content
 *
 */
function actus_global_options_page(){
    ?>
    <div class="wrap actus-settings actus-xf-admin">
        
        <!-- HEADER -->
        <div class="actus-admin-header actus-xf-admin-header">
            <img class="actus-admin-header-logo" src="<?php echo esc_url( get_site_icon_url(64) ); ?>">
            <h2 class="actus-admin-header-title"><?php echo get_bloginfo('name'); ?></h2>
        </div>


        <!-- MAIN -->
        <div class="actus-admin-main actus-xf-admin-main">
            
        </div>
        
    </div>
<?php
}








/*
 * The ACTUS plugins page content
 */
if ( !function_exists( 'actus_plugins_page' ) ) {
    function actus_plugins_page() {
        
        // Enque styles
        wp_enqueue_style( 
            'actus-admin-styles',
            ACTUS_XF_URL . 'css/actus-admin.css' ,
            false, '1.0.1', 'all' );

        $actus_plugins_url = ACTUS_XF_DIR . '/includes/actus-plugins.php';
        include $actus_plugins_url;
        ?>

        <?php
    }
}




/*
 * Settings Page
 *
 * @global array    $axf_options  Array of plugin options.
 */
function actus_xfields_admin_page() {
    global $axf_options, $matched_fieldsets;
	if ( ! current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
    
        $actus_w   = ACTUS_XF_URL . 'img/actus_white.png';
        $actus_i   = ACTUS_XF_URL . 'img/info.png';
        $actus_h   = ACTUS_XF_URL . 'img/help.png';
        $axf_logo  = ACTUS_XF_URL . 'img/xfields-logo-light.png';
        $actus_ss1 = ACTUS_XF_URL . 'img/ss01.jpg';
        $icon_gear = ACTUS_XF_URL . 'img/gear.png';
        $icon_delete = ACTUS_XF_URL . 'img/x.png';
    
		$matched_fieldsets = AXF_target_match();
	
    ?>


    <div class="wrap actus-settings actus-xf-admin">
        
        <!-- HEADER -->
        <div class="actus-admin-header actus-xf-admin-header">
            <img class="actus-admin-header-logo" src="<?php echo esc_url($actus_w); ?>">
            <img class="actus-admin-header-title" src="<?php echo esc_url($axf_logo); ?>">
        </div>


        <!-- MAIN -->
        <div class="actus-admin-main actus-xf-admin-main">

            <!-- FIELDSETS -->
            <div class="actus-admin-box">
                <h1>FIELDSETS</h1>
                <div class="actus-admin-box-content">
                    <?php
                    if ( isset( $axf_options['fieldsets'] ) )
                    if ( sizeof( $axf_options['fieldsets'] ) > 0 )
                    foreach( $axf_options[ 'fieldsets' ] as $fieldset ) {
                        $where_str = 'where';
                        $targetsH = "<ul>";
                        if ( isset( $fieldset['targets'] ) )
                        if ( sizeof( $fieldset['targets'] ) > 0 )
                        foreach( $fieldset['targets'] as $target ) {
                            $criteriaValue = '';
                            $targetValue   = '';
                            if ( isset($target['criteria']) )
                                $criteriaValue = $target['criteria'];
                            if ( isset($target['criteria_title']) )
                                $criteriaValue = $target['criteria_title'];
                            $conditionValue = $target['condition'];
                            if ( isset($target['condition_title']) )
                                $conditionValue = $target['condition_title'];
                            if ( isset($target['value']) )
                                $targetValue = $target['value'];
                            if ( isset($target['value_title']) )
                                $targetValue = $target['value_title'];
                           

                            $condition = "equals to";
                            if ( $target['condition'] == '>' )
                                $condition = "is larger than";
                            
                            if ( ! isset($target['type']) || $target['type'] == '' ){
                                $target['type'] = 'post'; 
                            }
                            if ( $target['type'] == 'admin screen' ) {
                                $where_str = '';
                                $condition = "of";
                                $type_str = $target['type'];
                            } else {
                                $type_str = $target['type']."s";
                            }
                            
                            $targetsH .= "<li>on <span>".$type_str."</span> ".$where_str." <span>".$criteriaValue."</span> ".$condition." <span>".$targetValue."</span>.</li>";
                        }
                        $targetsH .= "</ul>";
						
						$targets_allowed_html = array(
							'ul'     => array(),
							'li'     => array(),
							'span'   => array(),
						);
						
                    ?>
                    <div class="actus-xfieldset"
                         id="ADMIN-<?php echo esc_attr($fieldset['id']); ?>"
                         data-id="<?php echo esc_attr($fieldset['id']); ?>">
                        <div class="actus-xfieldset-bar">
                            <div class="title"><?php echo esc_html($fieldset['title']); ?></div>
                            <div class="targets"><?php echo wp_kses( $targetsH, $targets_allowed_html ); ?></div>
                            <div class="actus-xfieldset-buttons clearfix">
                                <div class="actus-xfieldset-button axf-delete-fieldset">
                                    <img src="<?php echo esc_url($icon_delete); ?>">
                                </div>
                            </div>
                        </div>
                    </div>
                    <?php } ?>

                    <div class="actus-xf-add-fieldset">ADD FIELDSET</div>
                </div>
            </div>

        </div>

        <!-- INFORMATION -->
        <div class="actus-admin-info actus-admin-info-1">
            <div class="actus-admin-info-icon">
                <img src="<?php echo esc_url($actus_i); ?>">
            </div>
            <div class="actus-admin-info-text">
                <p><b>ACTUS Xfields</b> v<?php echo esc_html(ACTUS_XF_VERSION); ?></p>
            </div>
            <div style="clear:both"></div>
        </div>

        
        
        <!-- FOOTER -->
        <div class="actus-admin-footer">
            <div class="actus">created by <a href="https://wp.actus.works" target="_blank">ACTUS anima</a></div>
            <div class="actus-sic">code &amp; design:  <a href="mailto:sic@actus.works" target="_blank">Stelios Ignatiadis</a></div>
        </div>
        
        
    </div>



    <!-- FIELDSET EDIT -->
    <div id="AXF-EDIT" class="actus-xfieldset-edit">
        
        
        <!-- EDIT -->
        <div class="actus-xfieldset-edit-box">
            <img src='<?php echo esc_url($icon_gear); ?>' class="actus-xfieldset-options-button">
            <img src='<?php echo esc_url($icon_delete); ?>' class="actus-xfieldset-edit-close">
            <input class="actus-xfieldset-edit-title" 
                   placeholder="new fieldset title">
            
            <div class="actus-xfieldset-edit-fields">
                <div class="actus-xfieldset-edit-fields-box"></div>
                <div class="label">FIELDS</div>
            </div>
            <div class="axf-dot-line"></div>
            <div class="actus-xfieldset-edit-targets">
                <div class="actus-xfieldset-edit-targets-box"></div>
                <div class="label">TARGETS</div>
            </div>
            <div class="axf-dot-line"></div>
            <div class="actus-xfieldset-code">
                <div class="actus-xfieldset-code-box"></div>
                <div class="label">CODE</div>
            </div>
        </div>
        
        
        <!-- LIBRARY -->
        <div id="AXF-LIB" class="actus-xfields-library">
            <div class="actus-xfields-library-fields"></div>
            <div class="actus-XF-saving">
                <img src="<?php echo esc_html(ACTUS_XF_URL) . 'img/gear.png'; ?>">
            </div>
            <div class="actus-xfieldset-save">SAVE</div>
        </div>
        
        <!-- FIELDSET OPTIONS -->
        <div class="actus-xfieldset-options">
            
            <div class="axf-option axf-hide axf-switch horizontal" 
                 data-type='switch' data-name='hide'>
                <p class="axf-button-A col-1" alt="title">Hide title</p>
                <p class="axf-button-A col-1" alt="permalink">Hide permalink</p>
                <p class="axf-button-A col-1" alt="slug">Hide slug</p>
                <p class="axf-button-A col-1" alt="editor">Hide content editor</p>
                <p class="axf-button-A col-1" alt="excerpt">Hide excerpt</p>
                <p class="axf-button-A col-1" alt="comments">Hide comments</p>
                <p class="axf-button-A col-1" alt="author">Hide author</p>
                <p class="axf-button-A col-1" alt="revisions">Hide revisions</p>
                <p class="axf-button-A col-1" alt="page-attributes">Hide page attributes</p>
                <p class="axf-button-A col-1" alt="post-formats">Hide post formats</p>
                <p class="axf-button-A col-1" alt="categories">Hide categories</p>
                <p class="axf-button-A col-1" alt="tags">Hide tags</p>
                <p class="axf-button-A col-1" alt="thumbnail">Hide featured image</p>
                <p class="axf-button-A col-1 ON" alt="custom-fields">Hide custom fields</p>
            </div>
            
            
        </div>
        
        <!-- FIELDS OPTIONS -->
        <div class="actus-xfields-options">
            <div class="axf-option axf-width axf-toggle horizontal">
                <p class="axf-button-A col-5-1" alt="col-1">full</p>
                <p class="axf-button-A col-5-1" alt="col-2-1" class="ON">half</p>
                <p class="axf-button-A col-5-1" alt="col-3-1">1/3</p>
                <p class="axf-button-A col-5-1" alt="col-3-2">2/3</p>
                <p class="axf-button-A col-5-1" alt="col-4-1">1/4</p>
            </div>
            <div class="axf-option axf-size axf-toggle horizontal">
                <p class="axf-button-A col-3-1" alt="S">S</p>
                <p class="axf-button-A col-3-1" alt="M" class="ON">M</p>
                <p class="axf-button-A col-3-1" alt="L">L</p>
            </div>
            <div class="axf-option">
                <input type="text" name="name" value="">
                <p class="label">variable name</p>
            </div>
            <div class="axf-option">
                <input type="text" name="label" value="">
                <p class="label">label</p>
                <div class="axf-toggle axf-label-pos-toggle small floR">
                    <p class="axf-button-A floL" alt="top">TOP</p>
                    <p class="axf-button-A floL" alt="side">SIDE</p>
                </div>
            </div>
            <div class="axf-option axf-option-values">
                <div class="axf-option-multi-box axf-option-values-box clearfix">
                    <input type="text" name="values" placeholder="type new value">
                    <div class="axf-add axf-add-value">+</div> 
                </div>
                <p class="label">values</p>
            </div>
            <div class="axf-option axf-option-titles">
                <div class="axf-option-multi-box axf-option-titles-box clearfix">
                    <input type="text" name="titles" placeholder="type new value">
                    <div class="axf-add axf-add-title">+</div> 
                </div>
                <p class="label">titles</p>
            </div>
            <div class="axf-option">
                <input type="text" name="default" value="">
                <p class="label">default value</p>
            </div>
            <div class="axf-option">
                <input type="text" name="placeholder" value="">
                <p class="label">placeholder</p>
            </div>
            <div class="axf-option">
                <input type="text" name="clss" value="">
                <p class="label">classes</p>
            </div>
            <div class="axf-option">
                <input type="text" name="help" value="">
                <p class="label">help</p>
            </div>
            <div class="axf-option">
                <input type="text" name="addrec" value="ADD RECORD">
                <p class="label">add record button</p>
            </div>
			
            <div class="axf-option axf-recwidth axf-toggle horizontal">
                <p class="axf-button-A col-5-1" alt="col-1" class="ON">full</p>
                <p class="axf-button-A col-5-1" alt="col-2-1">half</p>
                <p class="axf-button-A col-5-1" alt="col-3-1">1/3</p>
                <p class="axf-button-A col-5-1" alt="col-3-2">2/3</p>
                <p class="axf-button-A col-5-1" alt="col-4-1">1/4</p>
            </div>
            <p class="label axf-recwidth-label">record width</p>
			
            <div class="axf-option axf-uploadtype axf-toggle horizontal">
                <p class="axf-button-A col-2-1" alt="image" class="ON">IMAGE</p>
                <p class="axf-button-A col-2-1" alt="pdf">PDF</p>
            </div>
            <p class="label axf-uploadtype-label">file type</p>
             
            <div class="axf-button-A red axf-delete-xfield">
                <p>DELETE</p>
            </div>
        </div>
        
        
        <div id='AXF-DEBUG'><pre></pre></div>
        
    </div>
    <div id="AXFhidden"></div>

    <?php
}





 

// AJAX save GLOBAL fields
add_action( 'wp_ajax_axf_global_save', 'axf_global_save_ajax_handler' );
function axf_global_save_ajax_handler() {
    
    check_ajax_referer( 'actus_nonce' );
    
	$globals = "";
	if ( isset($_POST['globals']) )
    	$globals = sanitize_text_field( wp_unslash(json_encode( $_POST['globals'], JSON_UNESCAPED_UNICODE )) );
    
    update_option( 'AXF_globals', $globals );
    
    wp_die();

}
 

// AJAX save AXF
add_action( 'wp_ajax_axf_fieldsets_save', 'axf_fieldsets_save_ajax_handler' );
function axf_fieldsets_save_ajax_handler() {
    echo 'ACTUS_XF_fieldsets';
    echo "\n";
	if ( isset( $_POST['fieldset_name'] ) )
    	echo "SAVING - " . esc_html( wp_unslash($_POST['fieldset_name']) );
    check_ajax_referer( 'actus_nonce' );
	
	$fieldsets = '';
	if ( isset( $_POST['fieldsets'] ) )
    	$fieldsets = sanitize_text_field( json_encode( $_POST['fieldsets']), JSON_UNESCAPED_UNICODE );
	
	$fieldnames = '';
	if ( isset( $_POST['fieldnames'] ) )
    $fieldnames = sanitize_text_field( wp_unslash(implode(',', $_POST['fieldnames'])) );
	
	$xfields = '';
	if ( isset( $_POST['xfields'] ) )
    $xfields    = sanitize_text_field( wp_unslash(json_encode( $_POST['xfields'], JSON_UNESCAPED_UNICODE )));
	
	if ( isset( $_POST['fieldset_name'] ) )
    	update_option( sanitize_text_field(wp_unslash($_POST['fieldset_name'])), $xfields, false );
    unset( $_SESSION['AXF_fieldsets'] );
    update_option( 'AXF_fieldsets', $fieldsets );
    update_option( 'AXF_fieldnames', $fieldnames );
    wp_die();
}


// AJAX load xfields
add_action( 'wp_ajax_axf_load_xfields', 'axf_load_xfields_ajax_handler' );
function axf_load_xfields_ajax_handler() {
    check_ajax_referer( 'actus_nonce' );
	
	$fieldset_ids = '';
	if ( isset( $_POST['matched'] ) )
    $fieldset_ids = sanitize_text_field( wp_unslash($_POST['matched']) );
    $fieldset_ids = explode( ",", $fieldset_ids );
	
    if ( isset($_POST['values']) && isset($_POST['post_id']) && 
		 $_POST['values'] == 'yes' ) {
        if ( $_POST['post_id'] > 0 )
            $actusXfieldsValuesStr = get_post_meta( intval( $_POST['post_id'] ), 'actus_xfields', true );
        else
            $actusXfieldsValuesStr = get_option( 'AXF_globals' );
        
        $actusXfieldsValues = json_decode( stripslashes($actusXfieldsValuesStr) ); 
    } else $actusXfieldsValues = array();
    
    $fieldsets = array();
    $multi = array();
    foreach( $fieldset_ids as $fieldset_id ) {
        $fieldsets[ $fieldset_id ] = json_decode( get_option( $fieldset_id ) );
        foreach( $fieldsets[ $fieldset_id ] as $key => $field ) {
            $field->value = $actusXfieldsValues->{$field->name};
            
            if ( $field->type == 'multiX' ) {
                $field->value = $actusXfieldsValues->{$key};
            }
            if ( substr($field->parent_group,0,5) == 'multi' ) {
                $key  = $fieldsets[ $fieldset_id ]->{$field->parent_group}->name;
                $field->value = $actusXfieldsValues->{$key}->{$field->name};
            } 
             
        };
    };
    
    
    echo json_encode( $fieldsets );
    wp_die();
}


// AJAX delete fieldset
add_action( 'wp_ajax_axf_delete_fieldset', 'axf_delete_fieldset_ajax_handler' );
function axf_delete_fieldset_ajax_handler() {
    check_ajax_referer( 'actus_nonce' );
    $fieldnames = explode(',', get_option( 'AXF_fieldnames' ) );
    $fieldset = json_decode( get_option( sanitize_text_field(wp_unslash($_POST['fieldset_id'])) ) );
    foreach( $fieldset as $key => $field ) {
        $fieldnames = array_diff($fieldnames, array($field->name));
    };
    
    $fieldsets = '';
	if ( isset( $_POST['fieldsets'] ) )
    $fieldsets = sanitize_text_field(wp_unslash(json_encode( $_POST['fieldsets'], JSON_UNESCAPED_UNICODE )));
	
    unset( $_SESSION['AXF_fieldsets'] );
    update_option( 'AXF_fieldsets', $fieldsets );
    update_option( 'AXF_fieldnames', implode(',',$fieldnames) );
	
	if ( isset($_POST['fieldset_id']) )
    delete_option( sanitize_text_field(wp_unslash($_POST['fieldset_id'])) );
    
    print_r( esc_html($_POST['fieldset_id']) . 'deleted!' );
    wp_die();
}



// AJAX dynamic search
add_action( 'wp_ajax_axf_dynamic_search', 'axf_dynamic_search_ajax_handler' );
function axf_dynamic_search_ajax_handler() {
    global $post, $wp_query;
    check_ajax_referer( 'actus_nonce' );
    $value = '';
	if ( isset( $_POST['value'] ) )
    $value = sanitize_text_field(wp_unslash($_POST['value']));
    $type = '';
	if ( isset( $_POST['type'] ) )
    $type  = sanitize_text_field(wp_unslash($_POST['type']));
    $criteria = '';
	if ( isset( $_POST['criteria'] ) )
    $criteria = sanitize_text_field(wp_unslash($_POST['criteria']));
        
    $post_types = array();
    $axf_post_types = get_post_types();
    foreach ( $axf_post_types as $key => $post_type ) {
        $post_types[] = $key;
    }
    $args = array();
    $args['post_type'] = $post_types;
    if ( $type != 'any item' ) $args['post_type'] = $type;
    //$query = new WP_Query( array( 'post_title' => $value );
    if ( $criteria == 'id' ) {
        $args['p'] = $value;
        $search_query = new WP_Query( $args );
    } else {
        $args['s'] = $value;
        $search_query = new WP_Query( $args );
    }
                          
    echo json_encode( $search_query, JSON_UNESCAPED_UNICODE );
    
    wp_die();
}




// AJAX read page types
add_action( 'wp_ajax_axf_page_types', 'axf_page_types_ajax_handler' );
function axf_page_types_ajax_handler() {
    global $submenu, $menu, $pagenow;
    check_ajax_referer( 'actus_nonce' );
    $axf_page_types = array();
    if ( current_user_can('manage_options') ) { // ONLY DO THIS FOR ADMIN
        $axf_page_types['menu'] = $menu;
        $axf_page_types['submenu'] = $submenu;
    }
    echo json_encode( $axf_page_types, JSON_UNESCAPED_UNICODE );
    
    wp_die();
}

?>