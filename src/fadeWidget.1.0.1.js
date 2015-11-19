(function($, undefined) {
	
	/**
	 * Greenball/fadeWidget published under MIT license.
	 * @package https://github.com/greenball/fadeWidget
	 *
	 * Initialized CSS classes: .ui-fadeWidgetMain, .ui-fadeWidgetInside, .ui-fadeWidgetImg (optimal)
	 * 
	 * Events: create, visible, hidden, destroy
	 *
	 * @example  $(document).fadeWidget({ fx: 'drop', fxDuration: 500, image: '/my/awesomeloader.gif' });
	 * @example  $(document).fadeWidget('destroy');
	 * @example  $('#content').fadeWidget({ create: function() {
	 * 		alert('Awesomeness has been created!');
	 * }});
	 */
	$.widget('ui.fadeWidget', {
		/**
		 * Base config.
		 *
		 * @var Object
		 */
		options:	{
			// Effect used to toggle the cloak visiblity.
			fx: 		'slide',
			// Effect duration interval.
			// If setted to 0, then the widget will show the cloak when the DOM created.
			fxDuration:	0,													
			// Background color for the cloak.
			bgColor:	'rgba(0,0,0,0.75)',										
			// This class(es) will be added to the cloak's DOMs.
			addClass:	'',	
			// Image being created at the center of the cloak.
			image:		null,
			// Greenball\timerWidget & Greenball\counterWidget required for this feature.
			// Text appers in the cloar, the %timer% token will be replaced
			// with the elapsed time since the cload appered at every x ms.
			// @example 'Loading in progress, %timer% second(s) elapsed...'
			timer:		null,
			// Timer's refresh rate in miliseconds.
			timerSteps: 100,
		},
		
		/**
		 * Create the cloak and used DOMs.
		 */
		_create:		function() {
			// Create the main layer and design it.
			this._layer		= $('<div />').addClass(this.widgetFullName+'Main '+this.options.addClass)
			.css({'background-color': this.options.bgColor}).hide();
			
			// Create an inner div for positioning.
			this._inside	= $('<div />').addClass(this.widgetFullName+'Inside'+' '+this.options.addClass).appendTo(this._layer);
			
			// Check if loading image has been setted.
			(this.options.image) ? this.live('image'):null;
			
			// Check if loading timer has been setted...
			(this.options.timer) ? this.live('timer'):null;
			
			// Insert the cloak.
			this._layer.prependTo(document.body);
			this._position();
			
			// Bind the window resize event.
			$(window).bind('resize', $.proxy(this._position, this));
			
			// Fire the create event.
			this._trigger('create', null, this);
			
			// No fxDuration was given so show.
			// Fire visible event when ready.
			if ( ! this.options.fxDuration) {
				this._layer.show();
				this._trigger('visible', null, this);
			}
			// Show the cloak with an effect.
			else {
				this._layer.show(this.options.fx, this.options.fxDuration, $.proxy(function(){ this._trigger('visible', null, this); }, this));
			}
		},
		
		/**
		 * Get the cloak object.
		 *
		 * @example  $('#content').fadeWidgetFx('layer');
		 */
		layer:			function() {
			return this._layer;
		},

		/**
		 * Destroy the fadeWidget and stop the timer if running.
		 *
		 * @example  $(document).fadeWidget('destroy');
		 */
		destroy:		function() {
			// Kill the time(r).
			this.die('timer');

			// SeeYaa ;(
			$.Widget.prototype.destroy.call(this);
			
			// Remove without effect.
			if ( ! this.options.fxDuration) {
				this._layer.remove(); 
				this._trigger('hidden', null, this);
				this._trigger('destroy', null, this);
			}
			// Remove with effect.
			// Fire hidden and destroy events
			else {
				this._layer.stop(true, true).fadeOut(this.options.fx, $.proxy(function() { 
					this._layer.remove(); 
					this._trigger('hidden', null, this); 
					this._trigger('destroy', null, this); 
				}, this));
			}
			
			// Remove bindings.
			$(window).unbind('resize', $.proxy(this._position, this));
		},
		
		/**
		 * Kill a feature. >D u meany bitch!
		 *
		 * @example  $(document).fadeWidget('die', 'timer');
		 */
		die:		function(value) {
			// Kill the time(r) :/
			if(value == 'timer' && this.options.timer) {
				if ($.ui.hasOwnProperty('timerWidget') && $.ui.hasOwnProperty('counterWidget')) {
					console.error('The timer feature requires Greenball/timerWidget and Greenball/counterWidget to be load. https://github.com/greenball');
				};
				this._inside.timerWidget('destroy');
			}
			// Kill the image QQ
			else if (value == 'image' && this.options.image) {
				this._image.remove();
				this._image = null;
			}
		},
		
		/**
		 * Create or remade a feature.
		 *
		 * @example  $(document).fadeWidget('live', 'timer'); 
		 */
		live:		function( value ) {
			// Create the timer.
			if (value == 'timer' && this.options.timer && $.ui.hasOwnProperty('timerWidget') && $.ui.hasOwnProperty('counterWidget')) {
				this._inside.timerWidget({text: this.options.timer, step: this.options.timerSteps});
			} 
			// Create the image.
			else if (value == 'image' && this.options.image) {
				// Create an image element.
				// Adding an 1x1 gif to fix the bug where the img tag
				// does not fire loaded state if appers without src @@
				this._image		= $('<img />', { src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==' })
				.addClass(this.widgetFullName+'Img'+' '+this.options.addClass)
				.appendTo(this._inside).hide();
				
				// Set new src.
				this._image.attr('src', this.options.image);
				
				// Position it when loaded.
				this._image.bind('load', $.proxy(this._position, this));

				// Failsafe.
				this._position();
			}
		},
		
		/*
		 * Position, and size the div and the load image to the target.
		 */
		_position:		function() {
			this._layer.css({width: this.element.outerWidth(), height: this.element.outerHeight()}).position({of: this.element});

			// One more failsafe for case when the image being
			// loaded without the onload state we reposition it 
			// everyonce in a while.
			if(this._image) {
				setTimeout($.proxy(function() {
					this._image.position({ my: 'center center', at: 'center center', of: this._layer }).fadeIn();
				},this),100);
			}
		}
	});

	/*
	 * Shorthand for reconfig without a real call.
	 *
	 * @example  $.fadeWidgetFx({ fx: 'slide', fxDuration: 400 });
	 */
	$.fadeWidgetFx = function( options ) {
		return options ? options : {};
	};

})($);