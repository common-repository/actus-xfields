/**
 * @summary ACTUS Xfields administration events.
 *
 * @since 0.1.0
 *
 *
*/


(function( $ ){
    
    
    
    ACTUS.XF.EVENTS = {
        
        fieldsets : function( mode ){
            mode = mode || 'on';
            
            $('body').off('click','.actus-xf-add-fieldset');
            $('body').off('click','.actus-xfieldset-bar');
            $('body').off('click','.axf-delete-fieldset');
            
            if ( mode.toLowerCase() == 'on' ) {

                // FIELDSET ADD
                $('body').on('click','.actus-xf-add-fieldset', ACTUS.XF.ACTIONS.fieldsetAdd );
                
                // FIELDSET EDIT 
                $('body').on('click','.actus-xfieldset-bar', ACTUS.XF.ACTIONS.fieldsetEdit );
  
                // FIELDSET DELETE
                $('body').on('click', '.axf-delete-fieldset', ACTUS.XF.ACTIONS.fieldsetDelete );
        
            }
        },
        
        fieldsetEdit : function( mode ){
            mode = mode || 'on';
            
            $('body').off('click','#new-and_target');
            $('body').off('click','#new-or_target');
            $('body').off('click','#new-delete_target');
            $('body').off('change','.actus-xfieldset-edit-title');
            $('body').off('click','.actus-xfieldset-edit-close');
            $('body').off('click','.actus-xfieldset-options-button');
            $('body').off('click','.actus-xfieldset-options .axf-switch p');
            
            if ( mode.toLowerCase() == 'on' ) {

                // CLOSE FIELDSET EDIT
                $('body').on('click','.actus-xfieldset-edit-close', ACTUS.XF.ACTIONS.fieldsetEditClose );
                
                // FIELDSET EDIT TITLE
                $('body').on('change', '.actus-xfieldset-edit-title', ACTUS.XF.ACTIONS.fieldsetEditTitle );
                
                // FIELDSET OPTIONS CLICK
                $('body').on('click','.actus-xfieldset-options-button', ACTUS.XF.RENDER.fieldsetOptions );
                
                // FIELDSET OPTIONS SWITCH CLICK
                $('body').on('click','.actus-xfieldset-options .axf-switch p ', ACTUS.XF.ACTIONS.fieldsetOptionsSwitch );
                
                

                // EDIT TARGET CHANGE
                $('body').on('AXF-CHANGE',function(e, name, value){
//console.log( name +": "+ value );

                    targetID  = currentDropdown.parent().attr('id');
                    targetIdx = currentDropdown.parent().data('idx');
                    targetType = currentDropdown.parent().find('#new-target-type').data('value');
                    title = value.split(',')[1];
                    value = value.split(',')[0];
                    currentDropdown.attr('data-value', value);

                    // TYPE
                    if ( name == 'target-type' ) {
                        ACTUS.XF.FS.targets[targetIdx].type = value;
                        ACTUS.XF.FS.targets[targetIdx].type_title = title;
                        var values = ACTUS.XF.defaults.criteria[value].join(',');
                        var titles = values;
                        if( value == 'admin screen' ) {
                            $( '#'+targetID+' div[name="target-condition"]').addClass('disabled');
                            values = [];
                            $.each( ACTUS.XF.adminPageGroups, function(key){
                                values.push(key);
                            })
                            values = values.join(',');
                        }
                        args = {
                            name   : 'target-criteria',
                            values : values,
                            titles : titles,
                            plchld : 'criteria'
                        }
                        newCriteria = ACTUS.XF.CREATE.dropdown( args );
                        $( '#' + targetID + ' .axf-field[name="target-criteria"]' ).remove();
                        $( '#' + targetID + ' .axf-field[name="target-type"]' )
                            .after( newCriteria );

                        $('#'+targetID+' div[name="target-condition"]').addClass('disabled');
                        $('#'+targetID+' div[name="target-value"]' ).addClass('disabled');
                        if ( value == 'admin screen' ) {
                            //$('#'+targetID+' div[name="target-criteria"]').addClass('disabled');
                        }
                    }
                    // CRITERIA
                    if ( name == 'target-criteria' ) {
                        ACTUS.XF.FS.targets[targetIdx].criteria = value;
                        ACTUS.XF.FS.targets[targetIdx].criteria_title = title;
                        $( '#'+targetID+' div[name="target-condition"]').removeClass('disabled').find('.value').html('=');
                        ACTUS.XF.FS.targets[targetIdx].condition = '=';

                        // admin screen
                        if ( ACTUS.XF.FS.targets[targetIdx].type == 'admin screen' ) {
                            var values = '';
                            var titles = '';
                            var idx = 0;
                            $.each( ACTUS.XF.adminPages[value], function(name,rec){
                                if ( idx > 0 ) { 
                                    titles += ',';
                                    values += ',';
                                }
                     
                                titles += name;
                                values += rec;

                                idx++;
                            })
							
							if ( values == "" ) {
								ACTUS.XF.FS.targets[targetIdx].value = value;
							} else {
								
								args = {
									name   : 'target-value',
									values : values,
									titles : titles,
									plchld : value
								}
								newValueField = ACTUS.XF.CREATE.dropdown( args );
								$( '#' + targetID + ' .axf-field[name="target-value"]' ).remove();
								$( '#'+targetID+' div[name="and_target"]' )
									.before( newValueField );

							}
                            
                        }

                        
                        
                        //
                        if ( value == 'type' || value == "category" || value == "template" || value == "tag" ) {

                            if ( value == 'type' )      data = 'postTypes';
                            if ( value == 'category' )  data = 'postCategories';
                            if ( value == 'tag' )       data = 'postTags';
                            if ( value == 'template' )  data = 'pageTemplates';
                            
                            if ( value == 'template' && targetType == 'post' )  data = 'postTemplates';
                            
                            var values = '';
                            var titles = '';
                            var idx = 0;
                            $.each( ACTUS.XF[data], function(name,rec){
                                if ( idx > 0 ) { 
                                    titles += ',';
                                    values += ',';
                                }
                                if ( value == 'category' || 
                                     value == "tag" ) {
                                    titles += rec.name;
                                    values += rec.term_id;
                                } else {
                                    titles += name;
                                    values += rec;
                                }
                                idx++;
                            })
                            args = {
                                name   : 'target-value',
                                values : values,
                                titles : titles,
                                plchld : value
                            }
                            newValueField = ACTUS.XF.CREATE.dropdown( args );
                            $( '#' + targetID + ' .axf-field[name="target-value"]' ).remove();
                            $( '#'+targetID+' div[name="and_target"]' )
                                .before( newValueField );
                            

                        }
                        if ( value == 'id' || value == "search" || 
                             value == "parent" ) {
                            plchld = 'post ID';
                            if ( type == 'page' )
                                plchld = 'page ID';
                            if ( value == "search" || value == "parent" ) {
                                $( '#'+targetID+' div[name="target-condition"]').addClass('disabled');
                                plchld = 'search';
                            }
                            type =$( '#'+targetID+' div[name="target-type"]').attr('data-value');
                            args = {
                                type   : type,
                                name   : 'target-value',
                                plchld : plchld
                            }
                            newValueField = ACTUS.XF.CREATE.dynamicSearch( args );
                            $( '#' + targetID + ' .axf-field[name="target-value"]' ).remove();
                            $( '#'+targetID+' div[name="and_target"]' )
                                .before( newValueField );
                        }


                    }
                    // CONDITION
                    if ( name == 'target-condition' ) {
                        ACTUS.XF.FS.targets[targetIdx].condition = value;
                        ACTUS.XF.FS.targets[targetIdx].condition_title = title;
                    }
                    // VALUE
                    if ( name == 'target-value' ) {
                        ACTUS.XF.FS.targets[targetIdx].value = value;
                        ACTUS.XF.FS.targets[targetIdx].value_title = title;
                    }


                })

                // add AND TARGET
                $('body').on('click', '#new-and_target', ACTUS.XF.ACTIONS.targetAddAND );

                // add OR TARGET
                $('body').on('click', '#new-or_target', ACTUS.XF.ACTIONS.targetAddOR );

                // DELETE TARGET
                $('body').on('click', '#new-delete_target', ACTUS.XF.ACTIONS.targetDelete );
                
            }

    },
        
        fieldsEdit : function( mode ){
            mode = mode || 'on';
            
            $('body').off('click','.actus-xfieldset-edit-fields .axf-field');
            $('body').off('click','.axf-delete-xfield');
            $('body').off('change','.axf-option input');
            $('body').off('click','.axf-width p');
            $('body').off('click','.axf-size p');
            $('body').off('click','.axf-label-pos-toggle p');
            $('body').off('click','.axf-option-multi-box .axf-add');
            $('body').off('click','.axf-option-multi-box p img');
                
            if ( mode.toLowerCase() == 'on' ) {
                // SELECT FIELD
                $('body').on('click','.actus-xfieldset-edit-fields .axf-field',function(e){
                    e.stopPropagation();
                    ACTUS.XF.FID = $(this).attr( 'id' );
                    ACTUS.XF.F   =  ACTUS.XF.FS.xfields[ ACTUS.XF.FID ];
                    name  = $(this).attr( 'name' );
                    ACTUS.XF.RENDER.options();
                })

                // DELETE FIELD
                $('body').on('click','.axf-delete-xfield',function(e){
                    if ( ACTUS.XF.F.type == 'group' || ACTUS.XF.F.type == 'multi' ) {
                        $.each( ACTUS.XF.FS.xfields, function(){
                            if ( this.parent_group == ACTUS.XF.F.id )
                                delete ACTUS.XF.FS.xfields[this.id];
                        })
                    }
                    ACTUS.XF.fieldnames
                        .splice($.inArray(ACTUS.XF.F.name, ACTUS.XF.fieldnames),1);
                    delete ACTUS.XF.FS.xfields[ACTUS.XF.F.id];
                    delete ACTUS.XF.F;
                    $( '.actus-xfields-options' ).removeClass( 'open' );
                    ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
                })

                // OPTION CLICK
                $('body').on('click','.axf-option input',function(e){
                    val  = $(this).val();
                    name = $(this).attr( 'name' );
                    if ( name == 'name' ) {
                        oldName = val;
                    }
                    
                })
                // OPTION CHANGE
                $('body').on('change','.axf-option input',function(e){
                    name = $(this).attr( 'name' );
                    val  = $(this).val();
                    $('body').trigger('AXF-OPTION-CHANGE',[ name, val]);
                })
                $('body').on('AXF-OPTION-CHANGE', function(e,name,val){
                    if ( name == 'dropdown_default' ) name = 'default';
                    if ( name == 'values' || name == 'titles' ) return;
                    if ( name == 'name' ) {
                        
                        ACTUS.TOOLS.rename( val, ACTUS.XF.fieldnames, function( newName ){
                            ACTUS.XF.fieldnames
                                .splice(ACTUS.XF.fieldnames.indexOf(oldName),1);
                            ACTUS.XF.fieldnames.push( newName );
                            ACTUS.XF.F.name = newName;
                            $('.axf-option input[name="name"]').val( newName );
                            ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
                        })
                    }
                    ACTUS.XF.F[ name ] = val;
                    ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
                })
                
                // OPTION WIDTH CHANGE
                $('body').on('click','.axf-width p',function(e){
                    $('.axf-width p').removeClass('ON');
                    $(this).addClass('ON');
                    widthClass = $(this).attr('alt');
                    ACTUS.XF.F.width = widthClass;
                    ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
                })
                // OPTION SIZE CHANGE
                $('body').on('click','.axf-size p',function(e){
                    $('.axf-size p').removeClass('ON');
                    $(this).addClass('ON');
                    sizeClass = $(this).attr('alt');
                    ACTUS.XF.F.size = sizeClass;
                    ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
                })
                // OPTION LABEL POSITION CHANGE
                $('body').on('click','.axf-label-pos-toggle p',function(e){
                    $('.axf-label-pos-toggle p').removeClass('ON');
                    $(this).addClass('ON');
                    labelPos = $(this).attr('alt');
                    ACTUS.XF.F.label_pos = labelPos;
                    ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
                })

                // DROPDOWN VALUE/TITLE ADD
                $('body').on('click','.axf-option-multi-box .axf-add',function(e){
                    val  = $.trim( $(this).siblings('input').val() );
                    name = $(this).siblings('input').attr('name');
                    if ( val == '' ) return;
                    $(this).siblings('input').val('');
                    ACTUS.XF.F[ name ] = ACTUS.XF.F[ name ] || [];
                    ACTUS.XF.F[ name ].push( $.trim( val ) );
                    $( '.axf-option-' + name + '-box > p' ).remove();
                    $.each(ACTUS.XF.F[ name ], function(i,v){
                        valueH = '<p><span>' + (i+1) + '</span>' + v + ACTUS.XF.images.icon_x_img +'</p>';
                        $( '.axf-option-' + name + '-box input' ).before( valueH );
                    })

                })
                // DROPDOWN VALUE/TITLE DELETE
                $('body').on('click','.axf-option-multi-box p img',function(e){
                    idx  = parseInt($(this).siblings('span').text()) - 1;
                    $(this).siblings('span').remove();
                    val  = $(this).parent().text();
                    name = $(this).parent().siblings('input').attr('name');
                    ACTUS.XF.F[ name ].splice($.inArray(val, ACTUS.XF.F[ name ]), 1);
                    $( '.axf-option-' + name + '-box > p' ).remove();
                    $.each(ACTUS.XF.F[ name ], function(i,v){
                        valueH = '<p><span>' + (i+1) + '</span>' + v + ACTUS.XF.images.icon_x_img +'</p>';
                        $( '.axf-option-' + name + '-box input' ).before( valueH );
                    })
                })
                
                // OPTION REC WIDTH CHANGE
                $('body').on('click','.axf-recwidth p',function(e){
                    $('.axf-recwidth p').removeClass('ON');
                    $(this).addClass('ON');
                    widthClass = $(this).attr('alt');
                    ACTUS.XF.F.recwidth = widthClass;
                    ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
                })
                
                // OPTION UPLOAD TYPE CHANGE
                $('body').on('click','.axf-uploadtype p',function(e){
                    $('.axf-uploadtype p').removeClass('ON');
                    $(this).addClass('ON');
                    uploadtype = $(this).attr('alt');
                    ACTUS.XF.F.uploadtype = uploadtype;
                    ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
                })
            }
    
        }
        
    }
    
    // INIT EVENTS
    if ( actusXFparams.options.current_screen.id == 
        'actus_page_actus-xfields' )
        ACTUS.XF.EVENTS.fieldsets();
    
    
    
$(document).ready(function() {
        
        
        $('<div>').attr('id','axf-dropdown-list').appendTo('body');
        $('<div>').attr('id','axf-search-list').appendTo('body');

        ACTUS.XF.CREATE.library();
        
        
 
    
    
    // BODY CLICK
    $('body').on('click',function(e){
        $('#axf-dropdown-list').slideUp(100);
        if ( !$(e.target).parent().hasClass( "axf-dynamic-search" ) )
            $('#axf-search-list').html( '' ).slideUp(100);
    })
        
        
        
                
    // DYNAMIC SEARCH
    $('body').on('keyup','.axf-dynamic-search input',function(e){
        val = $(this).val();
        currentField = $(this).parent();
        currentFieldName = currentField.attr('name');
        type = currentField.siblings('div[name="target-type"]').attr('data-value');
        criteria = currentField.siblings('div[name="target-criteria"]').attr('data-value');
        limit = 3;
        if ( criteria == 'id' ) limit = 1;

//console.log( val.length, limit, val, type );
        if ( val.length >= limit ) {
            $.post( actusXFparams.ajax_url, {
                _ajax_nonce: actusXFparams.nonce,
                action     : 'axf_dynamic_search',
                value  : val,
                type  : type,
                criteria  : criteria,
            }, function(data) {
                query = JSON.parse( data );
                $( '.actus-XF-saving' ).fadeOut( 200 );
                
                if ( query.posts.length > 0 ) {
                    listH = '';
                    $.each(query.posts, function(i,post){ 
                        listH += '<p class="'+post.post_type+'" '+
                                     'data-id="'+post.ID+'" ' +
                                     'data-title="'+post.post_title+'" ' +
                                     'data-slug="'+post.post_name+'" ' +
                                     'data-type="'+post.post_type+'">' +
                                     post.ID+': '+post.post_title+'</p>';
                    })
                    listL = currentField.parent().offset().left;
                    
                    listT = parseInt( currentField.parent().offset().top + currentField.parent().height() );
                    listW = parseInt( currentField.width() );
                    listL = currentField.offset().left;
                    
                    $('#axf-search-list').html( listH );

                    if ( (listT + $('#axf-search-list').height() + 16) > 
                         ( $(window).height() + $(window).scrollTop()) ) {
                        listT = currentField.parent().offset().top - 
                                $('#axf-search-list').height() - 
                                currentField.parent().height() + 10;
                    }
                    $( '#axf-search-list' )
                        .css({ left: listL+'px', top: listT+'px', width: listW+'px' })
                        .slideDown(150);
                } else {
                    $('#axf-search-list').html( '' ).slideUp(100);
                }


            });
        } else {
            $('#axf-search-list').html( '' ).slideUp(100);
        }
    })
    $('body').on('click','#axf-search-list p',function(e){
        e.stopPropagation();
        currentSearchValue = $(this).text();
        
        if ( criteria == 'id' ) currentSearchValue = $(this).data('id') + ',' + $(this).data('id');
        
        

        $('#axf-search-list').slideUp(100);
        currentField.data('value',currentSearchValue);
        currentField.find('input').val( currentSearchValue );
        
        $('body').trigger('AXF-CHANGE',[ currentFieldName, currentSearchValue]);

    })
        
        
    // DROPDOWN
    $('body').off('click','.axf-dropdown');
    $('body').off('click','#axf-dropdown-list p');
    $('body').on('click','.axf-dropdown',function(e){
        if ( $(this).hasClass('disabled') ) return;
        if ( $(this).hasClass('AXF-drag') ) return;
        e.stopPropagation();
        currentDropdown = $(this);
        currentDropdownName = $(this).attr('name');
        //$('#axf-dropdown-list').slideUp(100);
        $('#axf-search-list').html( '' ).slideUp(100);
        titles = $(this).find('.value').data('titles');
        values = $(this).find('.value').data('values');
        if (typeof(values) === 'undefined' ) values = '';
        if (typeof(titles) === 'undefined' ) titles = values;

        titles = titles.toString().split(',');
        values = values.toString().split(',');
        listH = '';
        $.each(titles,function(i,label){ 
            listH += '<p alt="'+values[i]+'">'+label+'</p>';
        })
        listT = parseInt( currentDropdown.offset().top + currentDropdown.height() );
        listW = parseInt( currentDropdown.width() ) - 16;
        $('#axf-dropdown-list').html( listH );
        //if ( listW > 320 ) listW = 336;
        listL = currentDropdown.offset().left + ( currentDropdown.width() - (listW+8) );
        
        if ( (listT + $('#axf-dropdown-list').height() + 16) > 
             ( $(window).height() + $(window).scrollTop()) ) {
            listT = currentDropdown.offset().top - 
                    $('#axf-dropdown-list').height() - 
                    currentDropdown.height() + 10;
        }
        $( '#axf-dropdown-list' )
            .css({ left: listL+'px', top: listT+'px', width: listW+'px' })
            .slideDown(150);
        $( '#axf-dropdown-list' ).removeClass( 'txtL' );
        if ( $( this ).hasClass( 'dropL' ) ) {
            $( '#axf-dropdown-list' ).addClass( 'txtL' );
        }
    })
    $('body').on('click','#axf-dropdown-list p',function(e){
        e.stopPropagation();
        currentDropdownValue = $(this).attr('alt');
        currentDropdownLabel = $(this).text();

        $('#axf-dropdown-list').slideUp(100);
        currentDropdown.data('value',currentDropdownValue);
        currentDropdown.find('.value').text( currentDropdownLabel );
        currentDropdown.find('input').val( currentDropdownLabel );
        
        //currentDropdownValue += ',' + currentDropdownLabel;

        if ( currentDropdown.closest('.actus-xfieldset-edit').length )
            $('body').trigger('AXF-CHANGE',[ currentDropdownName, currentDropdownValue]);
        
        if ( currentDropdown.closest('.actus-xfields-options').length )
            $('body').trigger('AXF-OPTION-CHANGE',[ currentDropdownName, currentDropdownValue]);

    })
    
        
        
    var orig_send_to_editor = window.send_to_editor;
    


    
    // UPLOAD
    $('body').on('click', '.actus-upload-button', function(e){
        var button = $(this);
        var currentInput = $(this).siblings('input');
        var currentImage = $(this).siblings('img');
        var _orig_send_attachment = wp.media.editor.send.attachment;
        var send_attachment_bkp = wp.media.editor.send.attachment;
        var _custom_media = true;
        wp.media.editor.send.attachment = function(props, attachment) {
            if ( _custom_media ) {
                
                currentInput.val( attachment.url );
                currentImage.attr( 'src', attachment.url );
             
            } else {
                return _orig_send_attachment.apply( this, [props, attachment] );
            };
        }

        wp.media.editor.open(button);
        return false;
        
    })
    $('body').on('click', '.actus-upload-buttonX', function(e){
        tb_show('actus', 'media-upload.php?type=image&TB_iframe=1');
        currentInput = $(this).siblings('input');
        currentInputName = currentInput.attr('name');
        currentImage = $(this).siblings('img');
        
        
        window.send_to_editor = function( html ) {
            imgurl = $(html).attr( 'src' );
            currentInput.val( imgurl );
            currentImage.attr( 'src', imgurl );
            tb_remove();
            window.send_to_editor = orig_send_to_editor;
        }


        return false;
    });

    
    // HELP
    $('body').on('mouseover', '.axf-help-button', function(e){
        ACTUS.XF.FID  = $(this).closest('.axf-field').attr( 'id' );
        ACTUS.XF.FSID = $(this).closest('.axf-fieldset').data( 'id' );
        ACTUS.XF.FS   = ACTUS.XF.fieldsets[ ACTUS.XF.FSID ];
        ACTUS.XF.F    = ACTUS.XF.FS.xfields[ ACTUS.XF.FID ];
        
        helpH = '<div class="axf-help">' + ACTUS.XF.F.help + '</div>';
        $('body').append( helpH );
        
        xx = e.pageX;
        yy = e.pageY - $(window).scrollTop();
        $( '.axf-help' ).css({
            left : xx - 80,
            top  : yy - 40,
        }) 
        
    })
    $('body').on('mouseout', '.axf-help-button', function(e){
        $( '.axf-help' ).remove(); 
    })
    
    
    // VALUE CHANGE
    $('body').on('change', '.axf-field input', function(){
        name = $(this).attr( 'name' );
        val  = $(this).val();
        console.log( name, val );
    })
    
    
    
    
    // MULTI DELETE
    $('body').on('click', '.axf-delete-record', function(e){
        base       = $(this).closest('.axf-multi');
        baseID     = base.attr('id');
        multiInput = base.children('input');
        ACTUS.XF.F = ACTUS.XF.FS.xfields[ baseID ];
        multiVal   = ACTUS.XF.F.value;
        baseFields = base.children('.axfields[data-idx="0"]');
        curIdx = $(this).closest('.axfields').attr('data-idx');
        multiVal['count']--;
        $(this).closest('.axfields').remove();
        ACTUS.TOOLS.reIndex( base.children('.axfields') );
        
        multiVal['fields'] = [];
        multiVal['fieldnames'] = [];
        multiVal['name'] = ACTUS.XF.FS.xfields[baseID]['name'];
        base.children('.axfields[data-idx="0"]')
            .find('.axf-field').each(function(){
            curID = $(this).attr('id');
            curName = ACTUS.XF.FS.xfields[curID]['name'];
            multiVal['fields'].push( curID );
            multiVal['fieldnames'].push( curName );
        })
        base.attr('data-value', JSON.stringify( multiVal ) );
        ACTUS.XF.F.value = multiVal;
        
    })
    
    // MULTI ADD
    $('body').on('click', '.axf-multi-add, .axf-add-record', function(e){
        base       = $(this).closest('.axf-multi');
        baseID     = base.attr('id');
        ACTUS.XF.F = ACTUS.XF.FS.xfields[ baseID ];
        multiCount = $('input[name="'+baseID+'"]').val() || 0;
        multiCount++;
        
        $(this).siblings('.axfields').not('[data-idx="0"]')
                        .slideDown(200);
        
        baseFields = base.children('.axfields[data-idx="0"]');
        target = $(this).parent();
        newIdx = $(this).closest('.axfields').attr('data-idx');
        newIdx = parseInt( newIdx ) + 1;
        if ( $(this).hasClass('axf-multi-add') ) {
            newIdx = multiCount;
            target = base.children('.axfields[data-idx="'+(newIdx-1)+'"]');
        }
        
        baseFields.clone().insertAfter( target );
        ACTUS.TOOLS.reIndex( base.children('.axfields'), true );
        
        base.children('.axfields[data-idx="'+newIdx+'"]')
            .find('.axf-field').each(function(){
            ACTUS.XF.FS.xfields[curID]['idx'] = newIdx;
            curID = $(this).attr('id');
            curName = ACTUS.XF.FS.xfields[curID]['name'];
            $(this).find('textarea') 
                .attr('id', curID + '_editor_' + newIdx)
                .attr('name', curID + '_' + newIdx);
            if ( $("#" + curID + '_editor_' + newIdx).length > 0  )
                ACTUS.XF.INIT.editors( ACTUS.XF.FSID );
        })
        $('input[name="'+baseID+'"]').val(multiCount);
    })

    
           
                 
    // SAVE
    $('body').on('click', '.actus-xfieldset-save', function(e){

        $(this).addClass( 'click-anim' );
        setTimeout(function(){
            $('.click-anim').removeClass( 'click-anim' );
        },400)
        
        $('.actus-xfieldset-edit-fields .axf-multi').each(function(){
            fields = [];
            fieldnames = [];
            $(this).find('.axfields > .axf-field').each(function(){
                fields.push( $(this).attr('id') );
                fieldnames.push( ACTUS.XF.FS.xfields[ $(this).attr('id') ]['name'] );
            })
            ACTUS.XF.FS.xfields[ $(this).attr('id') ]['multival'] = {};
            ACTUS.XF.FS.xfields[ $(this).attr('id') ]['multival']['count'] = $(this).find('.axfields').length - 1;
            ACTUS.XF.FS.xfields[ $(this).attr('id') ]['multival']['fields'] = fields;
            ACTUS.XF.FS.xfields[ $(this).attr('id') ]['multival']['fieldnames'] = fieldnames;
            ACTUS.XF.FS.xfields[ $(this).attr('id') ]['multival']['name'] = ACTUS.XF.FS.xfields[ $(this).attr('id') ]['name'];
        })

        $( '.actus-XF-saving' ).fadeIn( 200 );
        var fieldsetsToSave = {};
        var xfieldsToSave   = ACTUS.XF.FS.xfields;
        $.each( ACTUS.XF.fieldsets, function(i,rec){
            fieldsetsToSave[i] = {
                id      : rec.id,
                title   : rec.title,
                targets : rec.targets,
                options : rec.options,
            }
        })
        

        $.each( xfieldsToSave, function(i,rec){
            delete xfieldsToSave[ i ].children;
        })
        $.post( actusXFparams.ajax_url, {
            _ajax_nonce: actusXFparams.nonce,
            action     : 'axf_fieldsets_save',
            fieldsets  : fieldsetsToSave,
            fieldnames : ACTUS.XF.fieldnames,
            xfields    : xfieldsToSave,
            fieldset_name: ACTUS.XF.FSID,
        }, function(data) {
            $( '.actus-XF-saving' ).fadeOut( 200 );
        });
        
    })
    

        
        
    
    // SAVE GLOBAL FIELDS
    $('body').on('click', '#new-save_globals', function(e){
        
        $( '.actus-XF-saving' ).fadeIn( 200 );
        
        var fieldsetsToSave = {};
        var xfieldsToSave   = ACTUS.XF.FS.xfields;

        getGlobalFields();

        $.post( actusXFparams.ajax_url, {
            _ajax_nonce: actusXFparams.nonce,
            action     : 'axf_global_save',
            matched    : ACTUS.XF.matched,
            globals    : ACTUS.XF.globals,
        }, function(data) {
            $( '.actus-XF-saving' ).fadeOut( 200 );
        });
        
    })
          
        
})
    
    function getGlobalFields(){
        $.each( ACTUS.XF.matched, function(i, fsid){
            currentFS = ACTUS.XF.fieldsets[fsid];
//console.log('currentFS.xfields:', currentFS.xfields);
            $.each( currentFS.xfields, function(idx, xfield){
                if ( ! xfield.id ) return;
                
                if ( xfield.type != 'group' && xfield.type != 'multi' &&
                   xfield.parent_group.substr(0,5) != 'multi' ) {

                    value = $('[name="' + xfield.id + '"]').val();
                    ACTUS.XF.globals[ xfield.name ] = value;
                    
                }
                

                // MULTI
                if ( xfield.type == 'multi' ) {
                    ACTUS.XF.globals[ xfield.name ] = [];
                }

                if ( xfield.parent_group.substr(0,5) == 'multi' &&
                     xfield.type != 'multi' ) {

                    multiName = currentFS.xfields[ xfield.parent_group ].name;
                    if ( ACTUS.XF.globals[ multiName ].length == 0 )
                        ACTUS.XF.globals[ multiName ] = {};

                    if ( xfield.type == 'textarea' || xfield.type == 'texteditor' ) {
                        count = parseInt( $('[name="' + xfield.parent_group + '"]').val() );
                        value = [];
                        value[0] = "";
                        for ( n=1;n<=count;n++) {
                            value[n] =$('[name="' + xfield.parent_group + '_' + xfield.id + '_' + n + '"]').val();
                        }

                    } else {

                        value =$('[name="' + xfield.parent_group + '_' + xfield.id + '[]"]').val();
                        
                        value = $('[name="' + xfield.parent_group + '_' + xfield.id + '[]"]')
                        .map(function(){ return $(this).val() }).get();

                    }
                    ACTUS.XF.globals[ multiName ][ xfield.name ] = value;

                }
                
                
                
            })
        })
        
    }

    
    
    // *********************************** WINDOW RESIZE
    $(window).on('resize', function(){
        $('#axf-dropdown-list').slideUp(100);
    })
    
    
    
    // *********************************** DRAG AND DROP
    ACTUS.XF.DRAGnDROP = {};
    ACTUS.XF.DRAGnDROP.ON = function(){
    
        // INIT
        ACTUS.XF.DRAGnDROP.OFF();
        overlayH = '<div class="AXF-drag-overlay"></div>';
        $( '.axf-lib-field' ).addClass( 'AXF-drag' );
        $( '.actus-xfieldset-edit-fields-box > .axf-group .axf-field' ).addClass( 'AXF-drag' );
        $( '.AXF-drag.axf-group' ).find('.axf-fields').before( overlayH );
        $( '.AXF-drag.axf-field' ).not('.axf-group').append( overlayH );
        $( '.AXF-drag' ).attr('draggable', 'true');
        

        // ********** DRAG START
        $( 'body' ).on( 'dragstart', '.AXF-drag', function(ev){
            ev.stopPropagation();
            duplicate = false;
            if (ev.ctrlKey || ev.metaKey) duplicate = true;

            if ( $(this).hasClass( 'axf-lib-field' ) ) {
                // LIBRARY ITEM
                dragSource = $( this ).children();
                dragType   = $(this).data('type')
            } else {
                // EDIT BOX ITEM
                dragSource = $( this );
                dragType = '';
            }
            dragSource.clone()
                .attr('id','AXF-drag-clone')
                .appendTo( '#AXFhidden' )
                .removeClass('AXF-drag AXF-drop')
                .append( overlayH );
            dragSource.addClass( 'dragged' );
            
            $( '.AXF-drop' ).removeClass('AXF-drop');
            $( '.actus-xfieldset-edit-fields-box .axf-field' )
                .addClass( 'AXF-drop' );
            $( this ).removeClass( 'AXF-drop' );
            
            //setTimeout(function(){
            //    dragSource.addClass( 'AXF-drag-scroll' );
            //},1000);
        })
        // ********** DRAG OVER
        $( 'body' ).on( 'dragover', '#AXF-EDIT', function(e){
            $('#AXFdragPreview').remove();
            dropTarget = '';
        })
        $( 'body' ).on( 'dragover', '.AXF-drop', function(e){
            dropTarget = $( this );
            if ( dropTarget.attr('id') == 'AXFdragPreview' ) {
                e.stopPropagation();
                return;
            }
            if ( dropTarget.attr('id') == dragSource.attr('id') ) {
                e.stopPropagation();
                $( '#AXF-drag-clone' ).hide();
                return;
            } 
            if ( dropTarget.hasClass('dragged') ) {
                $( '#AXF-drag-clone' ).hide();
                dropTarget = 'self';
                return;
            } else {
                
                $( '#AXF-drag-clone' ).show();
                e.stopPropagation();
                
                if ( dragSource.parent().hasClass( 'axf-lib-field' ) ) {
                    // Drag Library Item
                    previewWidth = ' col-1';
                    if ( dropTarget.closest('.axf-group').hasClass('basegroup') ) previewWidth = ' col-2-1';
                    previewH =  '<div id="AXFdragPreview" class="AXF-drop axf-field axf-' + dragType + previewWidth + ' floL">' + dragSource.html() + '</div>';
                } else {
                    // Drag Edit Item
                    previewH = $( '#AXF-drag-clone' );
                }
                 

                $('#AXFdragPreview').remove();
                if ( dropTarget.hasClass( 'axf-group' ) ) {
                    // target is group
                    target  = dropTarget.children('.axfields');
                    targetF = 'append';
                    ACTUS.XF.targetGroup = dropTarget;
                    target.append( previewH );
                } else {
                    // target is field
                    target  = dropTarget;
                    mouseY  = e.originalEvent.pageY;
                    targetY = dropTarget.offset().top;
                    targetH = dropTarget.height();
                    ACTUS.XF.targetGroup = dropTarget.closest('.axf-group');
                    if ( mouseY < targetY + (targetH/3) ) {
                        //target.before( previewH );
                        //targetF = 'before';
                        target.after( previewH );
                        targetF = 'after';
                    } else {
                        target.after( previewH );
                        targetF = 'after';
                    }
                    
                }
            }

        })
        // ********** DRAG END
        $( 'body' ).on( 'dragend', '.AXF-drag', function(e){
            e.stopPropagation();
            //$( '#AXFdragPreview' ).remove();
            $( '#AXFdragPreview' ).addClass('axf-field');
            $( '.dragged' ).removeClass( 'dragged' );

            if ( dropTarget != '' ) {
                

                // FIELD
                ACTUS.XF.targetGroupID =  ACTUS.XF.targetGroup.attr('id');
                if ( dragSource.parent().hasClass( 'axf-lib-field' ) ) {
                    draggedType = dragSource.parent().data('type');
                    sort = ACTUS.XF.targetGroup.find('.axfields .axf-field').length;
                    if ( draggedType == 'input' ) labelPos = 'side';
                    ACTUS.XF.FID = draggedType + '_' + $.now();
                    ACTUS.TOOLS.rename( draggedType+'_1', ACTUS.XF.fieldnames,  function( newName ){
                        ACTUS.XF.fieldnames.push( newName );
                        newField = {
                            id     : ACTUS.XF.FID,
                            name   : newName,
                            type   : draggedType,
                            sort   : sort,
                            width  : $.trim( previewWidth ),
                        };
                        if ( draggedType == 'group' ) 
                            newField.label = ACTUS.XF.FID;
                        if ( draggedType == 'multi' ) 
                            newField.label = newName;
                        if ( draggedType == 'input' ) 
                            newField.labelPos = 'side';
                        ACTUS.XF.FS.xfields = ACTUS.XF.FS.xfields || {};
                        ACTUS.XF.FS.xfields[ ACTUS.XF.FID ] = newField ;

                        $( '#AXF-drag-clone' ).remove();
                        $( '#AXFdragPreview' )
                            .attr('id',ACTUS.XF.FID)
                            .addClass('axf-field');
                        
                        ACTUS.XF.F = ACTUS.XF.FS.xfields[ ACTUS.XF.FID ];
                        ACTUS.XF.F.parent_group = ACTUS.XF.targetGroupID;
                        AXFsort( '#' + ACTUS.XF.targetGroupID, function(){
                            ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID, '', 'click' );
                        });
                    });
                } else {
                    ACTUS.XF.FID = dragSource.attr('id');
                    dragSource.remove();
                    $( '#AXF-drag-clone' ).attr('id',ACTUS.XF.FID);
                    
                    ACTUS.XF.F = ACTUS.XF.FS.xfields[ ACTUS.XF.FID ];
                    ACTUS.XF.F.parent_group = ACTUS.XF.targetGroupID;
                    AXFsort( '#' + ACTUS.XF.targetGroupID, function(){
                        ACTUS.XF.RENDER.XFields( ACTUS.XF.FSID );
                    });
                }
            }

        }) 
        
    }
    ACTUS.XF.DRAGnDROP.OFF = function(){
        $( '.AXF-drag' ).attr('draggable', 'false');
        
        $( 'body' ).off( 'dragstart', '.AXF-drag' );
        $( 'body' ).off( 'dragover', '.AXF-drag' );
        $( 'body' ).off( 'dragend', '.AXF-drag' );
        $( 'body' ).off( 'dragover', '#AXF-EDIT' );
    }
    
    
    function AXFsort( group, callback ) {
        callback = callback || function(){};
        $( group + ' > .axfields' ).children('.axf-field').each(function(i,rec){
            $(rec).data('sort', i);
            ACTUS.XF.FS.xfields[ $(rec).attr('id') ].sort = i.toString();
        });
        callback();
    }
    
    
})(jQuery);
   
var $ = jQuery.noConflict();
    
