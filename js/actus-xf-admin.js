/**
 * @summary ACTUS Xfields administration.
 *
 * @since 0.1.0
 *
 * @global array   actusXFparams            Parameters received from PHP call.
 *
*/


(function( $ ){
    
    if ( typeof( window.ACTUS ) === 'undefined' ) window.ACTUS = {};
    
    
    ACTUS.XF = {
        fieldsets  : JSON.parse(JSON.stringify( actusXFparams.options.fieldsets )) || {},
        fieldnames : actusXFparams.options.fieldnames || [],
        FID   : '', // current field ID
        FSID  : '', // current fieldset ID
        F     : {}, // current field
        FS    : {}, // current fieldset
        tree  : {}, // layout tree
        targetGroup : '',
        targetGroupID : '',
        globals : actusXFparams.options.globals || {},
        
        postTypes : {},
        postCategories : {},
        pageTemplates : {},
        postTemplates : {},
        adminPageGroups : {},
        adminPages : [],
        
        defaults    : {
            target_types : [ 'post', 'page', 'any item', 'admin screen' ],
            criteria     : {
                post: [
                    'id', 'search', 'template', 'category', 'tag', 'status', 'format'
                ],
                page: ['id', 'search', 'template', 'parent', 'status' ],
                "any item": [
                    'id', 'search', 'type', 'template', 'category', 'tag', 'status', 'format'
                ],
                "admin screen": [],
            },
            condition    : [ '=', 'NOT =' ],
            field_types  : [ 'text', 'textarea', 'dropdown', 'photo' ],
            input_types  : [ 'text', 'number', 'email', 'phone', 'date' ],
            field_options: {
                id        : '',
                name      : '',
                type      : '',
                value     : '',
                default   : '',
                values    : '',
                titles    : '',
                label     : '',
                clss      : '',
                plchld    : '',
                help      : '',
                parent_group    : '',
                label_pos : '',
                size      : 'M',
                width     : 'col-1',
                sort      : 0,
                idx       : 0,
            }
        },
        images      : {
            icon_x : actusXFparams.plugin_url + 'img/x_red.png',
            icon_help : actusXFparams.plugin_url + 'img/icon-help.png',
            icon_x_img : '<img src="' + actusXFparams.plugin_url + 'img/x_red.png">',
            placeholder : actusXFparams.plugin_url + 'img/placeholder.png'
        },
        matched     : [],
        
    };
    
    ACTUS.XF.INIT = {
        admin :  function() {
            ACTUS.XF.postTypes = actusXFparams.options.wp_data.post_types;
            ACTUS.XF.postCategories = actusXFparams.options.wp_data.post_categories;
            ACTUS.XF.postTags = actusXFparams.options.wp_data.post_tags;
            ACTUS.XF.pageTemplates = actusXFparams.options.wp_data.page_templates;
            ACTUS.XF.postTemplates = actusXFparams.options.wp_data.post_templates;

            ACTUS.XF.INIT.adminPageLists();

            /*
            ACTUS.XF.READ.postTypes();
            ACTUS.XF.READ.postCategories();
            ACTUS.XF.READ.pageTemplates();
            */
        },
        adminPageLists: function(){
            ACTUS.XF.adminPageGroups = {};
            ACTUS.XF.adminPages = [];
            $.each( actusXFparams.options.wp_data.admin_pages, function(key, group){
                value = $.trim( group[0].replace(/(<([^>]+)>)/ig,"") );
                if ( value.substr(-2) == ' 0' )
                    value = value.substr(0,value.length-2);
                if ( value != "" ) {
                    ACTUS.XF.adminPageGroups[group[2]] = value;
                    ACTUS.XF.defaults.criteria['admin screen'].push( value );
                }
            })
            
            $.each( actusXFparams.options.wp_data.admin_subpages, function(key, group){
                ACTUS.XF.adminPages[key] = {};
            $.each( group, function(keyB, item){
                if ( typeof item[2] !== 'undefined' ) {
                    name = item[3] || item[0];
                    ACTUS.XF.adminPages[key][name] = item[2];
                }
                
            })
            })
            

        },
        multiFields: function( ID ) {
            
            $('#'+ID).find('.axf-multi').each(function(){
                base   = $(this);
                baseID = $(this).attr('id');
                count  = $('input[name="'+baseID+'"]').val() || 0;

                baseFields = base.find('.axfields[data-idx="0"]');
                idx = 1;
                baseFields.find('.axf-field').each(function(){
                    curID = $(this).attr('id');
                    $(this).find('input[name="'+curID+'"]')
                        .attr('name', curID + '[]' ).val('');
                    $(this).find('textarea[name="'+curID+'"]')
                        .attr('name', curID ).text('');
                    idx++;
                })
                buttonsH = "<div class='axf-delete-record actus-button-A actus-button-A2 dark'>x</div><div class='axf-add-record actus-button-A actus-button-A2 dark'>+</div>";
                baseFields.append( buttonsH );
                target = $(this).find('.axf-multi-add');

                for (n = 1; n <= count; n++) {
                    baseFields.clone().attr('data-idx', n).insertBefore( target );
                    base.find('.axfields[data-idx="'+n+'"] .axf-field').each(function(){
                        id = $(this).attr('id');
                        newID = id + '_' + n;
                        inputName = id;
                        if (ACTUS.XF.fieldsets[ID].xfields[id].parent_group.substr(0,5) == 'multi') 
                            inputName = ACTUS.XF.fieldsets[ID].xfields[id].parent_group+"_"+id;
                        $(this).attr('id', newID);
                        ACTUS.XF.fieldsets[ID].xfields[id].value = ACTUS.XF.fieldsets[ID].xfields[id].value || [];

                        curVal = ACTUS.XF.fieldsets[ID].xfields[id].value[n];
                        $(this).find('input[name="'+inputName+'[]"]').val( curVal );
                        $(this).find('textarea[name="'+id+'"]')
                            .attr('id', id + '_editor_' + n)
                            .attr('name', inputName + '_' + n).html( curVal );
                        //Photo
                        if ( ACTUS.XF.fieldsets[ID].xfields[id].type == 'photo' ) {
                            if ( curVal == '' )
                                curVal = ACTUS.XF.images.placeholder;
                            $(this).find('img').attr('src', curVal );
                        }
                    })
                }

            })
        },
        editors: function( ID, selector ) {
            selector = selector || '.mceEditor';
            // INIT EDITORS
            if ( typeof( tinyMCE ) == "object" &&
                 typeof( tinyMCE.execCommand ) == "function" ) {
                $('#'+ID).find( selector ).each(function(i,v) {
                    if ( $(this).closest('.axfields[data-idx="0"]').length == 0 ) {
                    id = $(this).attr('id');
                    //tinyMCE.execCommand("mceAddControl", false, id);
                    //editorSettings = wp.editor.getDefaultSettings();
//console.log(editorSettings);
                    //tinymce.init(editorSettings.tinymce); 
                    tinyMCE.init({
                        selector: '#'+id,
                        convert_fonts_to_spans : true,
                        entity_encoding : "raw",
                        remove_trailing_brs: true,
                        remove_linebreaks : true,
                        //theme : "advanced",
                        //theme: "inlite",
                        theme: "modern",
                        menubar: false,
                        branding: false,
                        //toolbar_items_size: 'small',
                        browser_spellcheck : true,
                        contextmenu: false,
                        media_buttons: true,
                        //toolbar: 'undo redo |',
                        toolbar: 'styleselect | fontsizeselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist blockquote | removeformat | link image imagetools',
                        plugins : 'lists link image media',
                        //toolbar: 'insert',
                        //insert_button_items: 'image link | inserttable',
                        //plugins : 'advlist link image lists charmap print preview',
                        //theme_advanced_buttons1 : "newdocument,|,styleselect,formatselect,fontselect,fontsizeselect",

                    });
                    //tinyMCE.execCommand("mceAddEditor", false, id);
                    //wp.editor.initialize( id, editorSettings );
                    }
                })
            }

        },
    }

    
    ACTUS.XF.CREATE = {
        
        fieldset : function( ID ) {
            ID = $.trim( ID ) || 'AXFS_' + $.now();
            ACTUS.XF.fieldsets[ ID ] = {};
            ACTUS.XF.fieldsets[ ID ].id      = ID;
            ACTUS.XF.fieldsets[ ID ].title   = '';
            ACTUS.XF.fieldsets[ ID ].targets = [{}];
            ACTUS.XF.fieldsets[ ID ].xfields = {};
            base_group = 'group_' + $.now();
            ACTUS.XF.fieldsets[ ID ].xfields[base_group] = {
                name: base_group, parent_group: 'base', type: 'group', label: 'MAIN GROUP', width: 'col-1'
            };
            
            ACTUS.XF.FSID = ID;
            ACTUS.XF.FS   = ACTUS.XF.fieldsets[ ID ];
        },
        library  : function(){
            var AXF = this;
            groupH = '<div id="group_0" class="axf-field axf-group" name="group_lib"><p class="label">GROUP</p></div>';
            multiH = '<div id="multi_0" class="axf-field axf-group axf-multi" name="multi_lib"><p class="label">MULTI</p></div>';
            libArgs = [
                [ 'multi', multiH ],
                [ 'group', groupH ],
                [ 'photo', AXF.photo( {name:'photo_0'} ) ], 
                [ 'textarea', AXF.textarea( {name:'textarea_0',value:'SIMPLE TEXT'} ) ],
                [ 'texteditor', AXF.texteditor({name:'texteditor_0',value:'RICH TEXT'} ) ],
                [ 'input', AXF.input( {type:'text',name:'input_0',plchld:'INPUT'} ) ],
                [ 'dropdown', AXF.dropdown( {name:'dropdown_0',plchld:'DROPDOWN'} ) ],
            ];
            $.each(libArgs,function(i,arg){
                $('<div>')
                    .addClass('axf-lib-field')
                    .data('type', arg[0] )
                    .html( arg[1] )
                    .prependTo('#AXF-LIB .actus-xfields-library-fields');
            })
            
        },
        
        dropdown : function( options ) {
            options  = options || {};
            defaults = ACTUS.XF.defaults.field_options;
            var args = $.extend( true, {}, defaults, options );
            if ( args.plchld != '' )
                args.plchld = '<span class="placeholder">'+args.plchld+'</span>';
            if ( args.label != '' ) args.clss += ' labeled';
            if ( args.value != '' ) args.plchld = args.value;
            if ( args.titles == '' ) args.titles = args.values;
            if ( typeof(args.values) == 'string' )
                args.values = args.values.split(',');
            if ( typeof(args.titles) == 'string' )
                args.titles = args.titles.split(',');
            
            idx = $.inArray(args.value, args.values);
            args.plchld = args.titles[ idx ] || '<span>select</span>';
            
            html =
            '<div id="new-' + args.name + '" class="axf-field axf-dropdown '+args.clss+'" name="'+args.name+'" data-value="'+args.value+'">' +
                '<p class="label">'+args.label+'</p>' +
                '<p class="value axf-button-A" ' +
                    'data-titles="' + args.titles + '" ' +
                    'data-values="' + args.values + '">' + args.plchld + '</p>' +
                '<input name="'+args.name+'" type="text" hidden value="">' +
            '</div>';
            return html;
        },
        input    : function( options ) {
            options  = options || {};
            defaults = ACTUS.XF.defaults.field_options;
            var args = $.extend( true, {}, defaults, options );

            if ( args.label != '' ) args.clss += ' labeled';
            html =
            '<div id="new-' + args.name + '" class="axf-field axf-input '+args.clss+'" name="'+args.name+'">' +
                '<p class="label">'+args.label+'</p>' +
                '<input type="'+args.type+'" name="'+args.name+'" '+
                    'value="'+args.value+'" placeholder="'+args.plchld+'">' +
            '</div>';
            return html;
        },
        dynamicSearch : function( options ) {
            options  = options || {};
            defaults = ACTUS.XF.defaults.field_options;
            defaults.type = 'post';
            var args = $.extend( true, {}, defaults, options );

            if ( args.label != '' ) args.clss += ' labeled';
            html =
            '<div id="new-' + args.name + '" class="axf-field axf-input axf-dynamic-search '+args.clss+'" name="'+args.name+'" data-type="'+args.type+'">' +
                '<p class="label">'+args.label+'</p>' +
                '<input type="text" name="'+args.name+'" '+
                    'value="'+args.value+'" placeholder="'+args.plchld+'">' +
            '</div>';
            return html;
        },
        textarea : function( options ) {
            options  = options || {};
            defaults = ACTUS.XF.defaults.field_options;
            var args = $.extend( true, {}, defaults, options );

            if ( args.label != '' ) args.clss += ' labeled';
            html =
            '<div id="new-' + args.name + '" class="axf-field axf-textarea '+args.clss+'" name="'+args.name+'">' +
                '<p class="label">'+args.label+'</p>' +
                '<textarea name="'+args.name+'">'+args.value+'</textarea>' +
            '</div>';
            return html;
        },
        texteditor : function( options ) {
            options  = options || {};
            defaults = ACTUS.XF.defaults.field_options;
            var args = $.extend( true, {}, defaults, options );
            
            if ( args.label != '' ) args.clss += ' labeled';
            html =
            '<div id="new-' + args.name + '" class="axf-field axf-texteditor '+args.clss+'" name="'+args.name+'">' +
                '<p class="label">'+args.label+'</p>' +
                '<textarea name="'+args.name+'">'+args.value+'</textarea>' +
            '</div>';
            return html;
        },
        photo    : function( options ) {
            options  = options || {};
            defaults = ACTUS.XF.defaults.field_options;
            var args = $.extend( true, {}, defaults, options );

            valueText = args.value;
            if ( args.value == '' )  {
                args.value = ACTUS.XF.images.placeholder;
                valueText = args.plchld;
            }
            if ( args.label != '' ) args.clss += ' labeled';
            html =
                '<div id="new-' + args.name + '" class="axf-field axf-photo '+args.clss+' clearfix" name="'+args.name+'">' +
                    '<p class="label">'+args.label+'</p>' +
                    '<img class="axf-photo-img" src="'+args.value+'">' +
                    '<input type="text" name="'+args.name+'" value="'+valueText+'">' +
                    '<input type="button" value="UPLOAD" class="actus-upload-button">' +
                '</div>';
            return html;
        },
        button   : function( name, label, clss ) {
            name   = name   || '';
            label  = label  || '';
            clss   = clss   || '';
            if ( label == '[x]' ) 
                label = '<img src="'+ACTUS.XF.images.icon_x+'">';
            html =
            '<div id="new-' + name + '" class="axf-field axf-button '+clss+'" name="'+name+'">' +
                '<p class="label">'+label+'</p>' +
            '</div>';
            return html;
        },

        tree : function( source, callback ) {
            callback = callback || function(){};
            var tree = [],
                mappedArr = {},
                arrElem,
                mappedElem;

            arr = JSON.parse(JSON.stringify( source ));
            $.each( arr, function(i,arrElem) {
                mappedArr[ i ] = arrElem;
                mappedArr[ i ]['id'] = i;
                mappedArr[ i ]['children'] = [];
            })


            for (var id in mappedArr) {
                if (mappedArr.hasOwnProperty(id)) {
                    mappedElem = mappedArr[id];
                    if ( mappedElem.parent_group != 'base' ) {
                        mappedArr[mappedElem['parent_group']]['children'].push(mappedElem);
                    }
                    else {
                        tree.push(mappedElem);
                    }
                }
            }

            callback( tree );
            return tree;
        },
        
    };
    
    ACTUS.XF.RENDER = {
        
        metabox   : function( AXF_target ){
            AXF_target = AXF_target || '#actus_fields > .inside';
            $( AXF_target ).empty();
            
            // LOAD MATCHED FIELDS
            $.post( actusXFparams.ajax_url, {
                _ajax_nonce : actusXFparams.nonce,
                action      : 'axf_load_xfields',
                matched     : ACTUS.XF.matched.join(','),
                values      : 'yes',
                post_id     : ACTUS.XF.postID
            }, function( data ) {
                $( '.actus-XF-saving' ).fadeOut( 200 );
                loadedXfields = JSON.parse( data );
                
                $.each( ACTUS.XF.matched, function(ifs, fieldsetID) {
                    $( AXF_target ).append('<div id="'+fieldsetID+'" class="axf-fieldset"></div>');
                    fields = loadedXfields[ fieldsetID ];
                    //$.each(loadedXfields,function(i,fields){
                        ACTUS.XF.FSID = fieldsetID;
                        ACTUS.XF.FS   = ACTUS.XF.fieldsets[ fieldsetID ];
                        ACTUS.XF.FS.xfields = fields;
                        ACTUS.XF.RENDER.XFields( fieldsetID, '#' + fieldsetID, 'append' );
                    //})

                })      
                listsH = '<div id="axf-dropdown-list"></div><div id="axf-search-list"></div>';
                $('#axf-dropdown-list').remove();
                $('#axf-search-list').remove();
                $('body').append( listsH );
                $('#actus_fields').show();
                
                
                $('.axf-group > .label').off('click');
                $('.axf-group > .label').click(function(){
                    $(this).siblings('.axfields').not('[data-idx="0"]')
                        .slideToggle(200);
                })
                
                if ( AXF_target == '#ADMIN-AXFIELDS' ) {
                    h =  ACTUS.XF.CREATE.button( 'save_globals', 'SAVE OPTIONS', 'col-1 clearfix' );
                    $( h ).appendTo( AXF_target );
                    ACTUS.XF.RENDER.code( AXF_target, AXF_target );
                    
                } else {
                
                    ACTUS.XF.RENDER.code( AXF_target, '#actus_fields' );
                }
            });


        },
        
        field     : function( xfield ) {
            var options  = JSON.parse(JSON.stringify(xfield)) || {};
            options.id = options.id || options.type + '_' + $.now();  
            var defaults = ACTUS.XF.defaults.field_options;
            if ( options.parent_group == 'group_0' ) defaults.width = 'col-2-1';
            if ( options.parent_group == 'multi_0' ) defaults.width = 'col-2-1';
            var XF = $.extend( true, {}, defaults, options );
            
            
            if ( XF.size   == 'normal' || XF.size  == '' ) XF.size = 'M';
            if ( XF.value  == '' || XF.value  == null ) 
                XF.value = XF.default;
            
            if ( XF.titles == '' ) XF.titles = XF.values;
            valueText = XF.value;
            XF.inputname = XF.id;
            if ( XF.parent_group.substr(0,5) == 'multi' && 
                 XF.type != 'multi' ) {
                XF.value = '';
                XF.inputname = XF.parent_group + '_' + XF.id + '[]';
            }
            if ( XF.type == 'multi' ) {
                n = 0;
                $.each(XF.value, function(ii,vv){
                    if (n==0) XF.value = vv.length - 1;
                    n++;
                })
            }
            if ( XF.type == 'photo' && valueText == '' )  {
                XF.value  = ACTUS.XF.images.placeholder;
                XF.plchld = XF.value;
                
                valueText = XF.plchld;
            }
            
            

            // CLASSES
            classes = ' ' + XF.clss + ' ' + XF.width + ' size' + XF.size;
            helpIcon = '<span class="axf-help-button"><img src="' + ACTUS.XF.images.icon_help + '"></span>';
            if ( XF.label_pos == 'side' ) classes += ' label-left';
            if ( XF.help != '' ) XF.label = XF.label + helpIcon;
            if ( XF.label != '' ) classes += ' labeled';
            if ( XF.label == '[x]' ) 
                XF.label = '<img src="' + ACTUS.XF.images.icon_x + '">';

            if ( XF.type == 'multi' ) {
                classes = ' axf-group' + classes;
            }
            dataValue = XF.value;
            if ( XF.type == 'texteditor' )
                dataValue = '';
            html =
            '<div id="' + XF.id + '" ' + 
                 'class="axf-field axf-' + XF.type + classes + '" ' +
                 "data-value='" + dataValue + "'>" +
                '<p class="label">' + XF.label + '</p>';

            // GROUP
            if ( XF.type == 'group' ) {
                html +=
                    '<div class="axfields clearfix"></div>';
            }
            
            // INPUT
            if ( XF.type == 'input' ) {
                html +=
                    '<input type="' + XF.type + '" ' +
                           'name="' + XF.inputname + '" '+
                           'value="' + XF.value + '" ' + 
                           'placeholder="' + XF.plchld + '">';
            }

            // TEXTAREA
            if ( XF.type == 'textarea' ) {
                html +=
                    '<textarea name="'+XF.inputname+'">' +
                        XF.value +
                    '</textarea>';
            }

            // TEXTEDITOR
            if ( XF.type == 'texteditor' ) {
                html +=
                    '<textarea id="' + XF.id + '_editor" class="mceEditor" name="'+XF.id+'">' +
                        XF.value +
                    '</textarea>';
            }

            // DROPDOWN
            if ( XF.type == 'dropdown' ) {
                XF.plchld = 
                    '<span class="placeholder">'+XF.plchld+'</span>' || '';
                if ( XF.value != '' ) XF.plchld = XF.value;
                if ( XF.titles == '' ) XF.titles = XF.values;

                idx = $.inArray(XF.value, XF.values);
                XF.plchld = XF.titles[ idx ] || 'select';
                
                html +=
                '<p class="value axf-button-A" ' +
                    'data-titles="' + XF.titles + '" ' +
                    'data-values="' + XF.values + '">' + XF.plchld +
                '</p>' +
                '<input name="'+XF.inputname+'" type="text" hidden value="">';
            }

            // PHOTO
            if ( XF.type == 'photo' ) {
				XF.uploadtype = XF.uploadtype || 'image';
				if ( XF.uploadtype == 'image' )
					html +=
						'<img class="axf-photo-img" src="' + XF.value + '">';
				html +=
					'<input type="text" name="' + XF.inputname + '" ' +
						   'value="' + valueText + '">' +
					'<input type="button" value="UPLOAD" class="actus-upload-button">';
            }

            // MULTI
            if ( XF.type == 'multi' ) {
                XF.addrec = XF.addrec || 'ADD RECORD';
                XF.recwidth = XF.recwidth || 'col-1';
                XF.recwidth += ' floL';
                html += '<div class="axfields '+XF.recwidth+' clearfix" data-idx="0"></div>';
                multiCount = parseInt( XF.value );
                for (n = 1; n <= multiCount; n++) {
                    htmlX = '<div class="axfields '+XF.recwidth+' clearfix" data-idx="'+n+'"></div>';
                }
                
                html +=
                    '<div class="axf-multi-add actus-button-A">'+XF.addrec+'</div>' +
                    '<input hidden ' +
                           'name="' + XF.id + '" '+
                           "value='" + XF.value + "'>";

            }
            

            html += '</div>';
            return html;
        },
        XFields   : function( ID, target, mode ) {
            target = target || '.actus-xfieldset-edit-fields-box';
            mode   = mode   || 'clear';
            if ( target=='' ) target = '.actus-xfieldset-edit-fields-box';
            
            ACTUS.XF.fieldsets[ ID ].xfields = 
                ACTUS.XF.fieldsets[ ID ].xfields || [];

            // Render tree
            if ( mode == 'clear' || mode == 'click' ) $( target ).empty();
            ACTUS.XF.CREATE.tree( ACTUS.XF.fieldsets[ID].xfields, function(tree){
                ACTUS.XF.RENDER.tree( tree, target, function(){
                    ACTUS.XF.DRAGnDROP.ON();
                    
                    ACTUS.XF.INIT.multiFields( ID );
                    ACTUS.XF.INIT.editors( ID );
                    ACTUS.XF.RENDER.code();
                    if ( mode == 'click' )
                        $( '#' + ACTUS.XF.FID ).trigger('click');
                });
            });

        },
        tree      : function( children, target, callback ) {
            callback = callback || function(){};
            var sorted = {};
//console.log( Object.keys( children ).length );
            $.each( children, function ( i, child ) {
                sorted[ child.sort ] = child;
            })
            
            $.each( sorted, function ( i, child ) {
                target = target || '#' + child.parent_group + ' > .axfields';
                var classes = child.width + ' ' + child.size;
                var xfieldH = ACTUS.XF.RENDER.field( child );
                $( target ).append( xfieldH );

                if ( Object.keys( child.children ).length > 0 ) {
                    ACTUS.XF.RENDER.tree( child.children );
                }
            })
            callback();

            //return groupsH;
        },
        
        fieldsetOptions : function () {
            if ( $( '.actus-xfieldset-options' ).hasClass( 'open' ) ) {
                
                $( '.actus-xfieldset-options' ).removeClass( 'open' );
                
            } else {
                $( '.actus-xfields-options' ).removeClass( 'open' );
                $( '.actus-xfieldset-options' ).addClass( 'open' );
                values =  ACTUS.XF.FS.options || {};
                $( '.actus-xfieldset-options .axf-option' ).each(function(){
                    current = $(this);
                    name = $(this).data('name');
                    type = $(this).data('type');
                    val  = values[ name ];
                    if ( type == 'switch' ) {
                        $.each(val,function(){
                            current.find('p[alt="'+this+'"]').addClass('ON');
                        })
                    }
                })
            }
        },
        options   : function () {
            var self = this;
            $( '.actus-xfieldset-options' ).removeClass( 'open' );
            $( '.actus-xfields-options' ).addClass( 'open' );
            values =  ACTUS.XF.defaults.input_types.join(',');
            $( '.axf-option' ).hide();
            $( '.axf-recwidth-label' ).hide();
            $( '.axf-uploadtype-label' ).hide();
            $( '.axf-width' ).show();
            $( '.axf-width p' ).removeClass('ON');
            $( '.axf-width p[alt="'+ACTUS.XF.F.width+'"]' ).addClass('ON');
            $( '.axf-size' ).show();
            $( '.axf-size p' ).removeClass('ON');
            if ( ACTUS.XF.F.size == 'normal' || 
                 typeof(ACTUS.XF.F.size) === 'undefined' )
                ACTUS.XF.F.size = 'M';
            $( '.axf-size p[alt="'+ACTUS.XF.F.size+'"]' ).addClass('ON');
            $( '.axf-label-pos-toggle p' ).removeClass('ON');
            $( '.axf-label-pos-toggle p[alt="'+ACTUS.XF.F.label_pos+'"]' ).addClass('ON');
            // TYPE
            if ( ACTUS.XF.F.type == 'input' ) {
                args = {
                    name   : 'type',
                    value  : 'text',
                    values : values,
                }
                typeH = '<div class="axf-option axf-input-type">' +
                            ACTUS.XF.CREATE.dropdown( args ) +
                            '<p class="label">input type</p>' +
                        '</div>';
                $( '.axf-input-type' ).remove();
                $( '.actus-xfields-options .axf-size' ).after( typeH );
                $( '.axf-input-type' ).show();
            }
            // NAME
            if ( ACTUS.XF.F.type != 'group' ) {
                $( '.actus-xfields-options input[name="name"]' )
                    .val( ACTUS.XF.F.name ).parent().show();
            }
            // LABEL
            $( '.actus-xfields-options input[name="label"]' )
                .val( ACTUS.XF.F.label ).parent().show();
            // VALUES
            if ( ACTUS.XF.F.type == 'dropdown'  ) {
                $( '.axf-option-values' ).show();
                $( '.axf-option-values-box > p' ).remove();
                $.each(ACTUS.XF.F.values, function(i,v){
                    valueH = '<p><span>' + (i+1) + '</span>' + v + ACTUS.XF.images.icon_x_img +'</p>';
                    $( '.axf-option-values-box input' ).before( valueH );
                })
            }
            // TITLES
            if ( ACTUS.XF.F.type == 'dropdown'  ) {
                $( '.axf-option-titles' ).show();
                $( '.axf-option-titles-box > p' ).remove();
                $.each(ACTUS.XF.F.titles, function(i,v){
                    valueH = '<p><span>' + (i+1) + '</span>' + v + ACTUS.XF.images.icon_x_img +'</p>';
                    $( '.axf-option-titles-box input' ).before( valueH );
                })
            }
            // DEFAULT
            if ( ACTUS.XF.F.type == 'dropdown' ) {
                args = {
                    name   : 'dropdown_default',
                    value  : ACTUS.XF.F.default,
                    values : ACTUS.XF.F.values,
                    titles : ACTUS.XF.F.titles,
                }
                typeH = '<div class="axf-option axf-dropdown-default">' +
                            ACTUS.XF.CREATE.dropdown( args ) +
                            '<p class="label">default value</p>' +
                        '</div>';
                $( '.axf-dropdown-default' ).remove();
                $( '.actus-xfields-options input[name="default"]' ).parent().after( typeH );
                $( '.axf-dropdown-default' ).show();

            } else {
                if ( ACTUS.XF.F.type != 'group' &&
                     ACTUS.XF.F.type != 'multi' ) {
                    $( '.actus-xfields-options input[name="default"]' )
                        .val( ACTUS.XF.F.default )
                        .parent().show();
                }
            }
            // PLACEHOLDER
            if ( ACTUS.XF.F.type == 'input' ||
                 ACTUS.XF.F.type == 'dropdown' ) {
                $( '.actus-xfields-options input[name="placeholder"]' )
                    .val( ACTUS.XF.F.plchld )
                    .parent().show();
            }
            // CLASSES
            $( '.actus-xfields-options input[name="clss"]' )
                .val( ACTUS.XF.F.clss ).parent().show();

            // HELP
            $( '.actus-xfields-options input[name="help"]' )
                .val( ACTUS.XF.F.help ).parent().show();

            // ADD RECORD BUTTON
            if ( ACTUS.XF.F.type == 'multi' ) {
                ACTUS.XF.F.addrec = ACTUS.XF.F.addrec || 'ADD RECORD';
                $( '.actus-xfields-options input[name="addrec"]' )
                    .val( ACTUS.XF.F.addrec ).parent().show();
            }
            // REC WIDTH
            if ( ACTUS.XF.F.type == 'multi' ) {
				ACTUS.XF.F.recwidth = ACTUS.XF.F.recwidth || 'col-1';
                $( '.axf-recwidth' ).show();
                $( '.axf-recwidth-label' ).show();
                $( '.axf-recwidth p[alt="'+ACTUS.XF.F.recwidth+'"]' ).addClass('ON');
            }


            // UPLOAD TYPE
            if ( ACTUS.XF.F.type == 'photo' ) {
				ACTUS.XF.F.uploadtype = ACTUS.XF.F.uploadtype || 'image';
                $( '.axf-uploadtype' ).show();
                $( '.axf-uploadtype-label' ).show();
                $( '.axf-uploadtype p[alt="'+ACTUS.XF.F.uploadtype+'"]' ).addClass('ON');
            }



        },
        targets   : function( ID ) {
            var targetsH = '';
            ACTUS.XF.fieldsets[ ID ].targets = ACTUS.XF.fieldsets[ ID ].targets || [{}];
            var targets = JSON.parse(
                JSON.stringify(ACTUS.XF.fieldsets[ ID ].targets)) || {};
            
            if ( targets.length > 0 ) {
            $.each( targets, function(idx,target){
                
                target.type      = target.type      || 'post';
                target.criteria  = target.criteria  || '';
                target.condition = target.condition || '';
                target.value     = target.value     || '';
                target.boole     = target.boole     || '';
                
                targetsH += ACTUS.XF.RENDER.target( 
                    idx, 
                    target.type, 
                    target.criteria, 
                    target.condition, 
                    target.value, 
                    target.boole 
                );
                
            })
            }
            //targetsH += ACTUS.XF.CREATE.button( 'or_target', 'OR', 'col-1 transparent clearfix' );
            //targetsH += '<div class="actus-xfieldset-add-target axf-button-B">ADD TARGET</div>';
            targetsH += ACTUS.XF.CREATE.button( 'or_target', 'OR', 'col-1 transparent clearfix' );
            $('.actus-xfieldset-edit-targets-box').html( targetsH );
        },
        target    : function( idx, type, criteria, condition, value, boole ) {
            idx       = idx       || 0;
            type      = type      || 'post';
            criteria  = criteria  || '';
            condition = condition || '';
            value     = value     || '';
            boole     = boole     || '';
            targetsH = '';
            if ( boole != "AND" && idx > 0 )
                targetsH += ACTUS.XF.CREATE.button( 'or_target', 'OR', 'col-1 transparent clearfix disabled' );
            
            
            targetsH += 
                '<div class="actus-xfieldset-edit-target clearfix"' + 
                    'id="target-'+idx+'" data-idx="'+idx+'" data-boole="'+boole+'">';
            targetsH += ACTUS.XF.CREATE.button( 'delete_target', '[x]', 'transparent' );

            // type
            values = ACTUS.XF.defaults.target_types.join(',');
            args = {
                name   : 'target-type',
                value  : type,
                values : values,
                plchld : 'type'
            }
            targetsH += ACTUS.XF.CREATE.dropdown( args );
            // criteria
            values =  ACTUS.XF.defaults.criteria[type].join(',');
            titles = values;
            if ( type == 'admin screen' ) {
                values = [];
                $.each( ACTUS.XF.adminPageGroups, function(key){
                    values.push(key);
                })
                values = values.join(',');
            }
            args = {
                name   : 'target-criteria',
                value  : criteria,
                values : values,
                titles : titles,
                plchld : 'criteria'
            }
            targetsH += ACTUS.XF.CREATE.dropdown( args );
            
            // condition
            conditionClass = '';
            if ( criteria == 'id' || criteria == "search" ||
                 type == "admin screen" )
                conditionClass = ' disabled';
            values =  ACTUS.XF.defaults.condition.join(',');
            args = {
                name   : 'target-condition',
                value  : condition,
                values : values,
                clss   : conditionClass,
                plchld : 'condition'
            }
            targetsH += ACTUS.XF.CREATE.dropdown( args );


            // value
            if ( criteria == 'type' || criteria == "category" ||
                 criteria == "template" || type == "admin screen" ) {
                
                if ( criteria == 'type' )      func = 'postTypes';
                if ( criteria == 'category' )  func = 'postCategories';
                if ( criteria == 'tag' )       func = 'postTags';
                if ( criteria == 'template' )  func = 'pageTemplates';
                if ( type == 'admin screen' )  {
                    ACTUS.XF.adminPagesCurrent = ACTUS.XF.adminPages[criteria];
                    func = 'adminPagesCurrent';
                }
                //if ( criteria == 'adminPages' )      func = 'pageTemplates';
                if ( criteria == 'template' && type == 'post' )
                    func = 'postTemplates';
                var values = '';
                var titles = '';
                var idx = 0;
                $.each( ACTUS.XF[func], function(name,rec){
                    if ( idx > 0 ) { 
                        titles += ',';
                        values += ',';
                    }
                    titles += name;
                    values += rec;
                    idx++;
                })
                args = {
                    name   : 'target-value',
                    value  : value,
                    values : decodeURIComponent( values ),
                    titles : titles,
                    plchld : criteria
                }
                targetsH += ACTUS.XF.CREATE.dropdown( args );
                
                
            } else  if ( criteria == 'id' || criteria == "search" || 
                         criteria == "parent" ) {
                plchld = 'post ID';
                if ( criteria == "search" ) plchld = 'search';
                
                args = {
                    type   : type,
                    name   : 'target-value',
                    value  : value,
                    plchld : plchld
                }
                targetsH += ACTUS.XF.CREATE.dynamicSearch( args );
            } else {
                targetsH += '<div class="axf-field" name="target-value"></div>';
            }
            
            
            //targetsH += ACTUS.XF.CREATE.input( 'text', 'target-value', value, '', 'light', 'value' );
            targetsH += ACTUS.XF.CREATE.button( 'and_target', 'AND', 'transparent' );

            targetsH += '</div>';
            
            return targetsH;
        },
        
        code      : function( target, source ){
            target = target || '.actus-xfieldset-code-box';
            source = source || '.actus-xfieldset-edit-fields';
            if ( target != '.actus-xfieldset-code-box' ) {
                $('<div class="clear">').appendTo( target );
                $('<div class="code-box">').appendTo( target );
                target += ' .code-box';
            }
            target = $( target );
            source = $( source );
            
            codeH  = '<p class="code-label">CODE</p>'; 
            codeH += '<code>'; 
            codeH += '<br>&lt;?php' + '<br>';
            
            str = '$AXFields';
            if ( source.attr('id') == 'ADMIN-AXFIELDS' ) str = '$AXGlobals';


            source.find('.axf-field').each(function(){
                fid   = $(this).attr('id');
                if ( typeof ACTUS.XF.fieldsets[ ACTUS.XF.FSID ].xfields[ fid ] === 'undefined' ) return;
                name  = ACTUS.XF.fieldsets[ ACTUS.XF.FSID ].xfields[ fid ].name;
                label = ACTUS.XF.fieldsets[ ACTUS.XF.FSID ].xfields[ fid ].label;
                type  = ACTUS.XF.fieldsets[ ACTUS.XF.FSID ].xfields[ fid ].type;
                multival = ACTUS.XF.fieldsets[ ACTUS.XF.FSID ].xfields[ fid ].multival;
                parent = ACTUS.XF.fieldsets[ ACTUS.XF.FSID ].xfields[ fid ].parent_group;

                if ( type != 'multi' ) {                    
                    comm = "echo <span>" + str + "[ '" + name + "' ]</span>;";
                    if ( type == 'photo' ) {
                        comm = "echo '&lt;img src=\"' . <span>" + str + "[ '" + name + "' ]</span> . '\"&gt;';";
                    }
           
                } else {

                    comm  = "for ( <span>$n</span> = 1; <span>$n</span> <= sizeof( <span>" + str + "[ '" + name + "' ][ '" + multival.fieldnames[0] + "' ]</span> ); <span>$n</span>++ ) { <br>";
                    $.each( multival.fieldnames, function(){
                        comm += "&nbsp;&nbsp;&nbsp;&nbsp;echo <span>" + str + "[ '" + name + "' ][ '" + this + "' ][ $n ]</span>;<br>";
                    })
                    comm += "}";
                } 
            

                if ( type != 'group' && parent.substr(0,5) != 'multi' ) {
                    codeH += comm;
                    if ( typeof(label) !== 'undefined' && label != '' && label != fid )
                        codeH += " <span class='comment'>// " + label + "</span>";
                    codeH += "<br>";
                    //codeH += "echo '&lt;br&gt;';<br>";
                }
            })
            
            codeH += '?&gt;';
            codeH += '</code>';
            target.html( codeH );
            
            $('.code-label').off('click');
            $('.code-label').click(function(){
console.log('CLICK');
                $(this).siblings('code').slideToggle(200);
            })
        },
        
    }
    
    ACTUS.XF.READ = {
        
        adminPages : function( callback ) {
            callback = callback || function(){};
            
            axf_page_types = {};
            $.each(actusXFparams.options.admin_menu,function(i,val){
                if ( val[4] != "wp-menu-separator" ) {
                    str = '<div>'+val[0]+'</div>';
                    str = $( str ).find('span').remove().end().text();
                    //str = $( str ).text();
                    axf_page_types[ str ] = {
                        title: "<span class='bold'>"+str+'<span>',
                        link: val[2],
                    }
                }
                $.each(actusXFparams.options.admin_submenu[val[2]], function(ii,sub){
                    str = '<div>'+sub[0]+'</div>';
                    str = $( str ).find('span').remove().end().text();
                    axf_page_types[ str ] = {
                        title: "<span class='sub'>"+str+'<span>',
                        link: sub[2],
                    }
                })
            })
            
            callback( axf_page_types );
            return;
            

            
        },

    }
    
    // EVENT ACTIONS
    ACTUS.XF.ACTIONS = {
        
        fieldsetEdit   : function(e){
            ACTUS.XF.EVENTS.fieldsetEdit();
            ACTUS.XF.EVENTS.fieldsEdit();
            ACTUS.XF.FSID = $(this).parent().data('id');
            ACTUS.XF.FS   = ACTUS.XF.fieldsets[ ACTUS.XF.FSID ];

            $('.actus-xfieldset-edit').addClass('open');
            $('.actus-xfieldset-edit-fields-box').html( '' );

            $.post( actusXFparams.ajax_url, {
                _ajax_nonce : actusXFparams.nonce,
                action      : 'axf_load_xfields',
                matched     : ACTUS.XF.FSID,
            }, function( data ) {
                $( '.actus-XF-saving' ).fadeOut( 200 );
                loadedXfields = JSON.parse( data );
                ACTUS.XF.FS.xfields = loadedXfields[ ACTUS.XF.FSID ];
                $('.actus-xfieldset-edit-title').val( ACTUS.XF.FS.title );
                ACTUS.XF.RENDER.targets( ACTUS.XF.FSID );
                ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
            })
        },
        fieldsetAdd    : function(e){
            ACTUS.XF.CREATE.fieldset();
            ACTUS.XF.EVENTS.fieldsetEdit();
            ACTUS.XF.EVENTS.fieldsEdit();
            $('.actus-xfieldset-edit').addClass('open');
            $('.actus-xfieldset-edit-fields-box').html( '' );
            $('.actus-xfieldset-edit-title').val( '' ).focus();
            ACTUS.XF.RENDER.targets( ACTUS.XF.FSID );
            ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
        },
        fieldsetDelete : function(e){
            e.stopPropagation();
            ACTUS.XF.FSID = $(this).closest('.actus-xfieldset').data('id');
            ACTUS.XF.FS = {};
            currentFieldset = $(this).closest('.actus-xfieldset');

            args = {
                title: 'Delete Fieldset',
                text : 'Are you sure you want to delete this Fieldset;',
            };
            ACTUS.POPUP( args, function(){

            ACTUS.XF.fieldnames
                .splice($.inArray(ACTUS.XF.F.name, ACTUS.XF.fieldnames),1);

                currentFieldset.remove();                        
                delete ACTUS.XF.fieldsets[ ACTUS.XF.FSID ];
                $( '.actus-XF-saving' ).fadeIn( 200 );
                $.post( actusXFparams.ajax_url, {
                    _ajax_nonce: actusXFparams.nonce,
                    action: 'axf_delete_fieldset',
                    fieldsets: ACTUS.XF.fieldsets,
                    fieldset_id: ACTUS.XF.FSID,
                }, function( data ) {
                    ACTUS.XF.fieldnames = data.split(',');
                    $( '.actus-XF-saving' ).fadeOut( 200 );
                });
            }) 
        },
        fieldsetEditTitle : function(e){
            ACTUS.XF.FS.title = $.trim( $(this).val() );
        },
        fieldsetOptionsSwitch : function(e){
            name = $(this).parent().data('name');
            $(this).toggleClass('ON');
            if ( typeof(ACTUS.XF.FS.options) === 'undefined' )
                ACTUS.XF.FS.options = {};
            ACTUS.XF.FS.options[name] = [];
            $(this).parent().find('.ON').each(function() {
                ACTUS.XF.FS.options[name].push( $(this).attr('alt') );
            })
        },
        fieldsetEditClose : function(e){
            $('.actus-xfieldset-edit').removeClass('open')
            $('.actus-xfields-options').removeClass('open');
            $('.actus-xfieldset-options').removeClass('open');
            ACTUS.XF.EVENTS.fieldsetEdit('off');
            ACTUS.XF.EVENTS.fieldsEdit('off');
        },
        
        targetAddAND : function(e){
            if ( $(this).hasClass('disabled') ) return;
            targetID  = $(this).parent().attr('id');
            targetIdx = parseInt( $(this).parent().data('idx') );
            ACTUS.XF.FS.targets[targetIdx+1] = {};
            ACTUS.XF.FS.targets[targetIdx+1].boole = 'AND';
            $(this).attr('id','').addClass('disabled');
            targetType = $(this).siblings('.axf-field[name="target-type"]').attr('data-value');
            targetH = ACTUS.XF.RENDER.target( targetIdx + 1, targetType, '', '', '', 'AND' );
            $(this).parent().after( targetH );
        },
        targetAddOR  : function(e){
            if ( $(this).hasClass('disabled') ) return;
            targetID  = $(this).prev().attr('id');
            targetIdx = parseInt( $(this).prev().data('idx') );
            ACTUS.XF.FS.targets[targetIdx+1] = {};
            ACTUS.XF.FS.targets[targetIdx+1].boole = 'OR';
            //$(this).attr('id','').addClass('disabled');

            targetH  = ACTUS.XF.RENDER.target( targetIdx + 1 );
            //targetH += ACTUS.XF.CREATE.button( 'or_target', 'OR', 'col-1 transparent clearfix' );
            $(this).before( targetH );
        },
        targetDelete : function(e){
            currentTarget = $(this).parent();
            targetID  = currentTarget.attr('id');
            targetIdx = parseInt( currentTarget.data('idx') );
            args = {
                title: 'Delete Target',
                text : 'Are you sure you want to delete this target;',
            };
            ACTUS.POPUP( args, function(){
                if ( currentTarget.prev().hasClass('axf-button') &&
                     currentTarget.next().hasClass('axf-button') )
                    currentTarget.next().remove();
                currentTarget.remove();
                delete ACTUS.XF.FS.targets[targetIdx];
                i = 0;
                var tempTargets = ACTUS.XF.FS.targets;
                ACTUS.XF.FS.targets = {};
                $.each( tempTargets, function(ii,vv){
                    if ( ii != targetIdx ) {
                        ACTUS.XF.FS.targets[i] = vv;
                        i++;
                    }
                })
            })
        },
        
    }
    
    
    ACTUS.TOOLS = {
        
        reIndex : function( items, id ) {
            id = id || false;
            idx = 0;
            items.each(function(){
                $(this).attr('data-idx',idx);
                if ( id ) {
                    if ( idx == 0 ) {
                        baseNames = [];
                        $(this).find('.axf-field').each(function(){
                            baseNames.push( $(this).attr('id') );
                        })
                    } else {
                        fieldIdx = 0;
                        $(this).attr('id', baseNames[fieldIdx] + "_" + idx);
                        $(this).find('.axf-field').each(function(){
                            $(this).find('textarea').attr('name', baseNames[fieldIdx] + "_" + idx )
                            fieldIdx++;
                        })
                    }
                }
                idx++;
            })
        },
        rename : function( name, names, callback, idx, basename ) {
            callback = callback || function(){};
            idx = idx || 1 ;
            basename = basename || name ;
            if ( $.inArray(name, names) !== -1 ) {
                if ( name.split('_').length > 0 ) {
                    if ( parseInt(name.split('_')[ name.split('_').length-1 ]) > 0 ) {
                        idx = parseInt(name.split('_')[ name.split('_').length-1 ]) + 1;
                        basename = '';
                        $.each(name.split('_'),function(i,v){
                            if ( i == name.split('_').length-1 ) return;
                            if ( i > 0 ) basename += "_";
                            basename += v;
                        })
                    }
                }
                name = basename + '_' + idx;
                idx++;
                ACTUS.TOOLS.rename( name, names, callback, idx, basename );
            } else {
                callback( name );
            }

        },
        
    }
    
    ACTUS.DEBUG = function( content, label ){
        label = label || '';
        content = JSON.stringify( content, null, 2 );
        $('#AXF-DEBUG').show();
        $('#AXF-DEBUG').prepend( content );
        $('#AXF-DEBUG').prepend( '<br>----------------- '+label+'<br>' );
    }
    
    
    ACTUS.POPUP = function ( args, callback) {
        callback = callback || function(){};
        args.type  = args.type  ||'confirm'; // message | confirm
        args.title = args.title || '';
        args.text  = args.text  || '';
        $( '.actus-popup' ).remove();
        $( '.actus-popup-overlay' ).remove();
        
        popupButtons = '<div class="actus-button-A actus-popup-ok">OK</div>';
        if ( args.type == 'confirm' )
            
        popupButtons = 
            '<div class="actus-button-A actus-popup-no">NO</div>' +
            '<div class="actus-button-A actus-popup-yes">YES</div>';
                    
        
        popupH = '<div class="actus-popup-title">' +
                    '<h2>' + args.title + '</h2>' +
                 '</div>' +
                 '<div class="actus-popup-text">' +
                    '<p>' + args.text + '</p>' +
                 '</div>' +
                 '<div class="actus-popup-buttons">' + popupButtons + '</div>';
        
        $('<div>')
            .addClass( 'actus-popup-overlay' )
            .appendTo( 'body' );
        $('<div>')
            .addClass( 'actus-popup' )
            .html( popupH )
            .appendTo( 'body' );
        
        setTimeout(function(){
            $( '.actus-popup' ).addClass( 'open' );
            $( '.actus-popup-overlay' ).addClass( 'open' );
        }, 1)
        
        // EVENTS
        $('body').off('click', '.actus-popup-yes, .actus-popup-ok, .actus-popup-no, .actus-popup-overlay');
        $('body').on('click', '.actus-popup-yes, .actus-popup-ok',function(){
            $( '.actus-popup' ).removeClass( 'open' );
            $( '.actus-popup-overlay' ).removeClass( 'open' );
            callback();
        })
        $('body').on('click', '.actus-popup-no, .actus-popup-overlay',function(){
            $( '.actus-popup' ).removeClass( 'open' );
            $( '.actus-popup-overlay' ).removeClass( 'open' );
        })
    } 

    
    
    
    if ( actusXFparams.options.current_screen.id == 
        'actus_page_actus-xfields' )
        ACTUS.XF.INIT.admin();
    


    
    
    
    
})(jQuery);
   
var $ = jQuery.noConflict();
    


 