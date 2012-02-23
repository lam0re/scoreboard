/*
   ###                                        
    ###                                       
     ##                                       
     ##                                       
     ##                                       
     ##      /###   ### /### /###     /###    
     ##     / ###  / ##/ ###/ /##  / / ###  / 
     ##    /   ###/   ##  ###/ ###/ /   ###/  
     ##   ##    ##    ##   ##   ## ##    ##   
     ##   ##    ##    ##   ##   ## ##    ##   
     ##   ##    ##    ##   ##   ## ##    ##   
     ##   ##    ##    ##   ##   ## ##    ##   
     ##   ##    /#    ##   ##   ## ##    /#   
     ### / ####/ ##   ###  ###  ### ####/ ##  
      ##/   ###   ##   ###  ###  ### ###   ## 
*/

// Global variables

var attack_list = new Array();
var explosion_list = new Array();
var last_attack = '0';
var last_message = '0';
var allow_requests = true;
var muted = false;
var scrollamount = 3;
var alpha_max = 0;
var loggedin = false;
var terminal = false;
var token = false;
var canvas = false;
var context = false;
var refresh_rate = false;
var draw_animation = true;
var resolution = false;

// Sounds

soundManager.onready
(
	function()
	{
		soundManager.createSound
		(
			{
				id: 'attack',
				url: 'sounds/attack.mp3',
				autoLoad: true,
				autoPlay: false
			}
		);
	}
);

function start_radio( url )
{
	stop_radio();

	soundManager.createSound
	(
		{
			id: 'radio',
			url: url,
			autoLoad: true,
			stream: true,
			autoPlay: true
		}
	);
}

function stop_radio()
{
	soundManager.destroySound( 'radio' );
}

// Classes

function cAttack( origin_x, origin_y, teamname, country, flag, score )
{
	this.origin_x = parseInt( origin_x );
	this.origin_y = parseInt( origin_y );
	this.current_x = this.origin_x;
	this.current_y = this.origin_y;
	this.teamname = teamname;
	this.country = country;
	this.flag = flag;
	this.score = parseFloat( score );

	this.fadein = true;
	this.fadeout = false;
	this.wait = false;
	this.fadein_original = 50;
	this.fadeout_original = 20;
	this.wait_original = 25;
	this.fadein_current = this.fadein_original;
	this.fadeout_current = this.fadeout_original;
	this.wait_current = this.wait_original;

	this.get_alpha = function()
	{
		if( this.fadein )
		{
			return ( 1 - ( this.fadein_current / this.fadein_original ) );
		}
		else if( this.fadeout )
		{
			return ( this.fadeout_current / this.fadeout_original );
		}
		else
		{
			return 1;
		}
	}

	this.get_origin_x = function()
	{
		return this.origin_x;
	}

	this.get_origin_y = function()
	{
		return this.origin_y;
	}

	this.get_current_x = function()
	{
		return this.current_x;
	}

	this.get_current_y = function()
	{
		return this.current_y;
	}

	this.get_country = function()
	{
		return this.country;
	}

	this.get_teamname = function()
	{
		return this.teamname;
	}

	this.get_flag = function()
	{
		return this.flag;
	}

	this.get_score = function()
	{
		return this.score;
	}

	this.update = function()
	{
		// Tip: Calculate the positions with timestamps (not ticks) for more complex animations.
		// In this case it doesn't matter, because the calculations are very simple and fast.

		if( this.fadein )
		{
			if( this.fadein_current-- < 1 )
			{
				this.fadein = false;
			}
		}
		else if( this.wait )
		{
			if( this.wait_current-- < 1 )
			{
				this.wait = false;
				this.fadeout = true;
			}
		}
		else if( this.fadeout )
		{
			if( this.fadeout_current-- < 1 )
			{
				return true;
			}
		}
		else if( this.current_x < 935 )
		{
			this.current_x++;
		}
		else if( this.current_x > 935 )
		{
			this.current_x--;
		}
		else if( this.current_y < 234 )
		{
			this.current_y++;
		}
		else if( this.current_y > 234 )
		{
			this.current_y--;
		}
		else
		{
			// Load your weapons
			soundManager.play( 'attack' );

			this.wait = true;
		}

		return false;
	}
}

function cExplosion( x, y, maxsize, maxalpha, speed )
{
	this.x = x;
	this.y = y;
	this.maxsize = maxsize;
	this.maxalpha = maxalpha;
	this.speed = speed;
	this.size = 0;

	this.get_x = function()
	{
		return this.x;
	}

	this.get_y = function()
	{
		return this.y;
	}

	this.get_maxsize = function()
	{
		return this.maxsize;
	}

	this.get_size = function()
	{
		return this.size * speed;
	}

	this.get_alpha = function()
	{
		return ( this.maxalpha - 0.1 ) * ( this.get_size() / this.maxsize ) + 0.1;
	}

	this.update = function()
	{
		if( this.get_size() < this.maxsize )
		{
			this.size++;
			return false;
		}
		else
		{
			return true;
		}
	}
}

// Class helper

function add_attack( origin_x, origin_y, teamname, country, code, score )
{
	var flag = new Image();
	flag.src = 'images/flags/' + code + '.png';

	attack_list.push( new cAttack( origin_x, origin_y, teamname, country, flag, score ) );
}

function add_explosion( x, y, maxsize, maxalpha, speed )
{
	explosion_list.push( new cExplosion( x, y, maxsize, maxalpha, speed ) );
}

// Drawing

function clear()
{
	context.clearRect( 0, 0, canvas.width, canvas.height );
}

function render()
{
	clear();

	attack_list.forEach
	(
		function( element, index, array )
		{
			var alpha = element.get_alpha() * alpha_max;

			context.strokeStyle = '#ccc';
			context.fillStyle = "rgba(204, 204, 204, " + alpha + ")";
			context.globalAlpha = alpha * 0.6;

			// Flag
			context.drawImage
			(
				element.get_flag(),
				element.get_origin_x() + 5,
				element.get_origin_y() + 2
			);

			context.font = "10px monospace";

			// Country
			context.fillText
			(
				'[' + element.get_country() + ']',
				element.get_origin_x() + 23,
				element.get_origin_y() + 14
			);

			// Teamname
			context.fillText
			(
				element.get_teamname(),
				element.get_origin_x() + 5,
				element.get_origin_y() + 25
			);

			// Position
			context.fillText
			(
				'[' + element.get_current_x() + ',' + element.get_current_y() + ']',
				element.get_origin_x() + 5,
				element.get_origin_y() + 36
			);

			context.strokeStyle = '#900000';
			context.globalAlpha = alpha;
			context.beginPath();

			// Vertical line
			context.moveTo( element.get_current_x(), 5 );
			context.lineTo( element.get_current_x(),element.get_current_y() - 3 );
			context.moveTo( element.get_current_x(), element.get_current_y() + 3 );
			context.lineTo( element.get_current_x(), 595);

			// Horizontal line
			context.moveTo( 3, element.get_current_y() );
			context.lineTo( element.get_current_x() - 3, element.get_current_y() );
			context.moveTo( element.get_current_x() + 3, element.get_current_y() );
			context.lineTo( 997, element.get_current_y() );

			// Circle
			context.arc( element.get_current_x(), element.get_current_y(), 10, 0, Math.PI*2, true );

			context.closePath();
			context.stroke();
		}
	);

	explosion_list.forEach
	(
		function( element, index, array )
		{
			var x = element.get_x();
			var y = element.get_y();
			var size = element.get_size();
			var alpha = element.get_alpha() * alpha_max;

			context.strokeStyle = 'red';
			context.fillStyle = 'red';
			context.globalAlpha = alpha;

			context.beginPath();
			context.arc( x, y, size, 0, 2 * Math.PI, true );
			context.closePath();

			context.stroke();
			context.fill();
		}
	);
}

function update()
{
	attack_list.forEach
	(
		function( element, index, array )
		{
			var finished = element.update();

			if( finished )
			{
				add_explosion
				(
					element.get_current_x(),
					element.get_current_y(),
					40 * element.get_score(),	// Max radius
					rand_between( 20, 80 ) / 100,	// Max alpha
					rand_between( 20, 80 ) / 100	// Speed
				);

				// Remove attack
				delete element;
				array.splice( index, 1 );

				// Update the scoreboard
				update_ranking();
			}
		}
	);

	explosion_list.forEach
	(
		function( element, index, array )
		{
			var finished = element.update();

			if( finished )
			{
				// Remove explosion
				delete element;
				array.splice( index, 1 );
			}
		}
	);
}

function animate()
{
	setTimeout
	(
		function()
		{
			requestAnimationFrame( animate );
		},
		get_refresh_rate()
	);

	if( !draw_animation )
	{
		return;
	}

	if( ( attack_list.length > 0 ) || ( explosion_list.length > 0 ) )
	{
		// Disable ajax calls
		allow_requests = false;

		// Draw the animation
		render();
	}
	else if( !allow_requests )
	{
		// Clear the canvas one last time
		clear();

		// Enable ajax calls
		allow_requests = true;
	}
}

// Attacks

function check_attacks()
{
	$.post
	(
		'ajax.php?m=get_attacks',
		{
			'last': last_attack
		},
		function( xml )
		{
			$( xml ).find( 'attack' ).each
			(
				function()
				{
					last_attack = $( this ).find( 'id' ).text();

					add_attack
					(
						$( this ).find( 'origin_x' ).text(),
						$( this ).find( 'origin_y' ).text(),
						$( this ).find( 'teamname' ).text(),
						$( this ).find( 'country' ).text(),
						$( this ).find( 'code' ).text(),
						$( this ).find( 'score' ).text()
					);
				}
			);
		}
	);
}

function attack_wait()
{
	if( allow_requests )
	{
		check_attacks();
	}

	setTimeout
	(
		function()
		{
			attack_wait()
		},
		10000
	);
}

// Ranking

function minimize_ranking()
{
	$( '#rankingframe' ).css( 'height', '345px' );
	$( '#rankingframe' ).css( 'background', 'url(../images.php?m=border&h=345&w=300) left top no-repeat, url(../images/backgrounds/ranking.png) left top repeat' );
	$( '#scrollable' ).css( 'maxHeight', '310px' );
}

function maximize_ranking()
{
	$( '#rankingframe' ).animate({height:"600px"},200);
	$( '#rankingframe' ).css( 'background', 'url(../images.php?m=border&h=600&w=300) left top no-repeat, url(../images/backgrounds/ranking.png) left top repeat' );
	$( '#scrollable' ).css( 'maxHeight', '560px' );
}

function update_ranking()
{
	$.get
	(
		'ajax.php?m=get_ranking',
		function( xml )
		{
			var table = $( '<table>' );

			$( xml ).find( 'team' ).each
			(
				function()
				{
					var trow = $( '<tr>' );
					$( '<td>' ).text( $( this ).find( 'rank' ).text() ).appendTo( trow );
					$( '<td>' ).html( '<img alt="flag" src="images/flags/' + $( this ).find( 'code' ).text() + '.png" alt="flag" />' ).appendTo( trow );
					$( '<td>' ).text( $( this ).find( 'name' ).text() ).appendTo( trow );
					$( '<td>' ).addClass( 'score' ).text( $( this ).find( 'score' ).text() ).appendTo( trow );

					trow.appendTo( table );
				}
			);

			$( '#ranking' ).html( table.html() );
		}
	);
}

// Ticker

function check_ticker()
{
	$.get
	(
		'ajax.php?m=get_message',
		function( xml )
		{
			$( xml ).find( 'announcement' ).each
			(
				function()
				{
					var id = $( this ).find( 'id' ).text();

					if( ( id ) && ( id != last_message ) )
					{
						last_message = id;

						show_message
						(
							$( this ).find( 'text' ).text(),
							$( this ).find( 'image' ).text(),
							$( this ).find( 'sound' ).text()
						);

						try
						{
							eval( $( this ).find( 'script' ).text() );
						}
						catch( e ) {}
					}
				}
			);
		}
	);
}

function show_message( text, image, sound )
{
	$( '#tickerframe' ).html( '<marquee id="ticker" loop="2" scrollamount="' + scrollamount + '" onfinish="reset_ticker();"></marquee>' );
	$( '#ticker' ).text( text );
	$( '#announcements' ).css( 'display', 'inline-block' );
	$( '#announcements' ).css( 'background-image', 'url(../images.php?m=border&h=250&w=300), url(images/avatars/' + image + ')' );

	if( $.browser.webkit )
	{ // Webkit doesn't know onfinish
		setTimeout( 'reset_ticker()', text.length * 2000 );
	}

	minimize_ranking(); 

	if( ( !muted ) && ( sound != '' ) )
	{
		soundManager.onready
		(
			function()
			{
				var audio = soundManager.createSound
				(
					{
						id: 'Sound',
						url: 'sounds/' + sound
					}
				);

				audio.play
				(
					{
						onfinish:
							function()
							{
								this.destruct();
							}
					}
				);

				audio.play();
			}
		);
	}
}

function reset_ticker()
{
	$( '#announcements' ).fadeOut
	(
		'slow',
		function()
		{
			maximize_ranking();
		}
	);
}

function ticker_wait()
{
	if( allow_requests )
	{
		check_ticker();
	}

	setTimeout
	(
		function()
		{
			ticker_wait()
		},
		15000
	);
}

// Pages

function clear_mainframe( active )
{
	if( active )
	{
		$( '#challenges' ).hide();
		$( '#submit' ).hide();
		$( '#authenticate' ).hide();
		$( '#settings' ).hide();
		$( '.separator', '#menu' ).hide();
		$( '#close' ).show();

		$( '#innercontent' ).empty();
		$( '#innercontent' ).css( 'display', 'inline-block' );

		alpha_max = 0.1;
		$( '#world' ).css( 'background', 'url(../images.php?m=border&h=600&w=1000), url(../images/backgrounds/milky.png) top left repeat, url(../images/backgrounds/stars2.jpg)' );
	}
	else
	{
		$( '#challenges' ).show();
		$( '#submit' ).show();
		$( '#authenticate' ).show();
		$( '#settings' ).show();
		$( '.separator', '#menu' ).show();
		$( '#close' ).hide();

		$( '#innercontent' ).empty();
		$( '#innercontent' ).css( 'display', 'none' );

		alpha_max = 1;
		$( '#world' ).css( 'background', 'url(../images.php?m=border&h=600&w=1000), url(../images/backgrounds/stars2.jpg)' );
	}
}

function toggle_color( element, color )
{
	var old_color = $( element ).css( 'color' );
	$( element ).css( 'color', color );

	setTimeout
	(
		function()
		{
			$( element ).css( 'color', old_color );
		},
		300
	);
}

function page_challenges()
{
	clear_mainframe( true );

	var challengesframe = $( '<div>' ).attr( 'id', 'challengesframe' ).appendTo( $( '#innercontent' ) );
	var challengeframe = $( '<div>' ).attr( 'id', 'challengeframe' ).appendTo( $( '#innercontent' ) );
	var categories = $( '<ul>' ).appendTo( challengesframe );

	$.get
	(
		'ajax.php?m=get_challenges',
		function( xml )
		{
			var last_category = false;

			$( xml ).find( 'category' ).each
			(
				function()
				{
					var category = $( '<li>' ).addClass( 'category' ).text( $( this ).find( 'name' ).text() ).appendTo( categories );
					var challenges = $( '<ul>' ).appendTo( category );

					$( this ).find( 'challenge' ).each
					(
						function()
						{
							var id = $( this ).find( 'id' ).text();
							var title = $( this ).find( 'title' ).text();
							var score = $( this ).find( 'score' ).text();
							var challenge = $( '<li>' ).addClass( 'challenge' ).text( title + ' (' + score + ')' ).appendTo( challenges );

							challenge.click
							(
								function()
								{
									open_challenge( id );
								}
							);

							var solved = $( this ).find( 'solved' ).text();

							if( solved == '1' )
							{
								challenge.addClass( 'solved' );
							}
							else
							{
								challenge.addClass( 'notsolved' );
							}
						}
					);
				}
			);
		}
	);
}

function open_challenge( id )
{
	$( '#challengeframe' ).empty();

	$.post
	(
		'ajax.php?m=get_challenge',
		{
			'id': id
		},
		function( xml )
		{
			$( '<h1>' ).text( $( xml ).find( 'title' ).text() ).appendTo( $( '#challengeframe' ) );
			var challenge_description = $( '<span>' ).html( $( xml ).find( 'description' ).text() ).appendTo( $( '#challengeframe' ) );
		}
	);
}

function page_submit()
{
	clear_mainframe( true );

	var formframe = $( '<div>' ).attr( 'id', 'formframe' ).addClass( 'flags' ).appendTo( $( '#innercontent' ) );
	var form = $( '<form>' ).appendTo( formframe );
	$( '<h1>' ).attr( 'id', 'header' ).text( 'Attack' ).appendTo( form );

	var label_flag = $( '<label>' ).text( 'Flag' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Any challenge' ).appendTo( label_flag );
	$( '<input>' ).attr( 'type', 'text' ).attr( 'id', 'flag' ).appendTo( form );

	$( '<button>' ).attr( 'type', 'submit' ).text( 'Send' ).appendTo( form );

	form.submit
	(
		function()
		{
			$.post
			(
				'ajax.php?m=submit_key',
				{
					'key': $( '#flag' ).attr( 'value' ),
					'token': token
				},
				function( xml )
				{
					switch( $( xml ).find( 'code' ).text() )
					{
						case '1':
							clear_mainframe( false );
							check_attacks();
							break;

						case '2':
							toggle_color( $( '#header' ), 'orange' );
							break;

						case '3':
							toggle_color( $( '#header' ), 'red' );
							break;
					}
				}
			);

			return false;
		}
	);
}

function page_login()
{
	clear_mainframe( true );

	var formframe = $( '<div>' ).attr( 'id', 'formframe' ).appendTo( $( '#innercontent' ) );
	var form = $( '<form>' ).appendTo( formframe );
	$( '<h1>' ).attr( 'id', 'header' ).text( 'Authenticate' ).appendTo( form );

	var label_username = $( '<label>' ).text( 'Username' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Enter your teamname' ).appendTo( label_username );
	$( '<input>' ).attr( 'type', 'text' ).attr( 'id', 'username' ).appendTo( form );

	var label_password = $( '<label>' ).text( 'Password' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Enter your password' ).appendTo( label_password );
	$( '<input>' ).attr( 'type', 'password' ).attr( 'id', 'password' ).appendTo( form );

	$( '<button>' ).attr( 'type', 'submit' ).text( 'Login' ).appendTo( form );

	form.submit
	(
		function()
		{
			$.post
			(
				'ajax.php?m=login',
				{
					'username': $( '#username' ).attr( 'value' ),
					'password': $( '#password' ).attr( 'value' ),
					'token': token
				},
				function( xml )
				{
					switch( $( xml ).find( 'code' ).text() )
					{
						case '1':
							login();
							clear_mainframe( false );
							break;

						case '2':
							toggle_color( $( '#header' ), 'orange' );
							break;

						case '3':
							toggle_color( $( '#header' ), 'red' );
							break;
					}
				}
			);

			return false;
		}
	);
}

function page_logout()
{
	clear_mainframe( true );

	var formframe = $( '<div>' ).attr( 'id', 'formframe' ).appendTo( $( '#innercontent' ) );
	var form = $( '<form>' ).appendTo( formframe );
	$( '<h1>' ).attr( 'id', 'header' ).text( 'Authenticate' ).appendTo( form );
	$( '<button>' ).attr( 'type', 'submit' ).text( 'Logout' ).appendTo( form );

	form.submit
	(
		function()
		{
			$.post
			(
				'ajax.php?m=logout',
				{
					'token': token
				},
				function( xml )
				{
					switch( $( xml ).find( 'code' ).text() )
					{
						case '1':
							logout();
							clear_mainframe( false );
							break;

						case '2':
							toggle_color( $( '#header' ), 'red' );
							break;
					}
				}
			);

			return false;
		}
	);	
}

function page_sendmessage()
{
	clear_mainframe( true );

	var formframe = $( '<div>' ).attr( 'id', 'formframe' ).appendTo( $( '#innercontent' ) );
	var form = $( '<form>' ).appendTo( formframe );
	$( '<h1>' ).attr( 'id', 'header' ).text( 'Send Message' ).appendTo( form );

	var label_password = $( '<label>' ).text( 'Password' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Required' ).appendTo( label_password );
	$( '<input>' ).attr( 'type', 'password' ).attr( 'id', 'password' ).appendTo( form );

	var label_message = $( '<label>' ).text( 'Message' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Required' ).appendTo( label_message );
	$( '<input>' ).attr( 'type', 'text' ).attr( 'id', 'message' ).appendTo( form );

	var label_image = $( '<label>' ).text( 'Image' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Required' ).appendTo( label_image );
	$( '<input>' ).attr( 'type', 'text' ).attr( 'id', 'image' ).appendTo( form );

	var label_sound = $( '<label>' ).text( 'Sound' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Optional' ).appendTo( label_sound );
	$( '<input>' ).attr( 'type', 'text' ).attr( 'id', 'sound' ).appendTo( form );

	var label_script = $( '<label>' ).text( 'Script' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Optional' ).appendTo( label_script );
	$( '<input>' ).attr( 'type', 'text' ).attr( 'id', 'script' ).appendTo( form );

	$( '<button>' ).attr( 'type', 'submit' ).text( 'Send' ).appendTo( form );

	form.submit
	(
		function()
		{
			$.post
			(
				'ajax.php?m=send_message',
				{
					'password': $( '#password' ).attr( 'value' ),
					'message': $( '#message' ).attr( 'value' ),
					'image': $( '#image' ).attr( 'value' ),
					'sound': $( '#sound' ).attr( 'value' ),
					'script': $( '#script' ).attr( 'value' ),
					'token': token
				},
				function( xml )
				{
					switch( $( xml ).find( 'code' ).text() )
					{
						case '1':
							check_ticker();
							clear_mainframe( false );
							break;

						case '2':
							toggle_color( $( '#header' ), 'orange' );
							break;

						case '3':
							toggle_color( $( '#header' ), 'red' );
							break;
					}
				}
			);

			return false;
		}
	);
}

function page_settings()
{
	clear_mainframe( true );

	var formframe = $( '<div>' ).attr( 'id', 'formframe' ).appendTo( $( '#innercontent' ) );
	var form = $( '<form>' ).appendTo( formframe );
	$( '<h1>' ).attr( 'id', 'header' ).text( 'Settings' ).appendTo( form );

	var label_refreshrate = $( '<label>' ).text( 'Refresh rate' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Whatever' ).appendTo( label_refreshrate );
	var refreshrate_dropdown = $( '<select>' ).attr( 'id', 'refreshrate' ).appendTo( form );
	var refreshrate_off = $( '<option>' ).attr( 'value', '0' ).text( 'Off' ).appendTo( refreshrate_dropdown );
	var refreshrate_low = $( '<option>' ).attr( 'value', '1' ).text( 'Low' ).appendTo( refreshrate_dropdown );
	var refreshrate_mid = $( '<option>' ).attr( 'value', '2' ).text( 'Mid' ).appendTo( refreshrate_dropdown );
	var refreshrate_high = $( '<option>' ).attr( 'value', '3' ).text( 'High' ).appendTo( refreshrate_dropdown );

	switch( refresh_rate )
	{
		case '0':
			refreshrate_off.attr( 'selected', 'selected' );
			break;

		case '1':
			refreshrate_low.attr( 'selected', 'selected' );
			break;

		case '2':
			refreshrate_mid.attr( 'selected', 'selected' );
			break;

		case '3':
			refreshrate_high.attr( 'selected', 'selected' );
			break;
	}

	var label_mute = $( '<label>' ).text( 'Disable sound' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Eternal silence' ).appendTo( label_mute );
	var mute_dropdown = $( '<select>' ).attr( 'id', 'mute' ).appendTo( form );
	var mute_no = $( '<option>' ).attr( 'value', '0' ).text( 'No' ).appendTo( mute_dropdown );
	var mute_yes = $( '<option>' ).attr( 'value', '1' ).text( 'Yes' ).appendTo( mute_dropdown );

	switch( muted )
	{
		case false:
			mute_no.attr( 'selected', 'selected' );
			break;

		case true:
			mute_yes.attr( 'selected', 'selected' );
			break;
	}

	var label_resolution = $( '<label>' ).text( 'Resolution' ).appendTo( form );
	$( '<span>' ).addClass( 'small' ).text( 'Whatever' ).appendTo( label_resolution );
	var resolution_dropdown = $( '<select>' ).attr( 'id', 'resolution' ).appendTo( form );
	var resolution_low = $( '<option>' ).attr( 'value', '0' ).text( 'Low' ).appendTo( resolution_dropdown );
	var resolution_mid = $( '<option>' ).attr( 'value', '1' ).text( 'Mid' ).appendTo( resolution_dropdown );
	var resolution_high = $( '<option>' ).attr( 'value', '2' ).text( 'High' ).appendTo( resolution_dropdown );

	switch( resolution )
	{
		case '0':
			resolution_low.attr( 'selected', 'selected' );
			break;

		case '1':
			resolution_mid.attr( 'selected', 'selected' );
			break;

		case '2':
			resolution_high.attr( 'selected', 'selected' );
			break;
	}

	$( '<button>' ).attr( 'type', 'submit' ).text( 'Send' ).appendTo( form );

	form.submit
	(
		function()
		{
			set_refresh_rate( $( '#refreshrate' ).val() );
			set_sound_status( $( '#mute' ).val() );
			set_resolution( $( '#resolution' ).val() );

			clear_mainframe( false );

			return false;
		}
	);
}

function page_console()
{
	if( !terminal )
	{
		terminal = generate_terminal( generate_box( 'Terminal' ) ).appendTo( $( 'body' ) );
		$( '.terminal-input', terminal ).focus();
	}
	else
	{
		$( terminal ).remove();
		terminal = false;
	}
}

function generate_box( title )
{
	var container = $( '<div>' ).addClass( 'container' );
	var box = $( '<div>' ).addClass( 'box' );

	var header = $( '<div>' ).addClass( 'box-header' ).appendTo( box );
	var body = $( '<div>' ).addClass( 'box-body' ).appendTo( box );

	$( '<h1>' ).text( title ).appendTo( header );

	var navigation = $( '<div>' ).addClass( 'box-navigation' ).appendTo( header );

	var clicking = false;
	var offsetX = offsetY = 0;

	header.mousedown
	(
		function( pointer )
		{
			clicking = true;

			var offset = header.offset();

			offsetX = pointer.pageX - offset.left;
			offsetY = pointer.pageY - offset.top;
		}
	);

	$( document ).mouseup
	(
		function()
		{
		    clicking = false;
		}
	);

	$( document ).mousemove
	(
		function( pointer )
		{
			if( clicking == false ) return;

			var x = pointer.pageX - offsetX;
			var y = pointer.pageY - offsetY;

			box.css( 'left', x ).css( 'top', y );
		}
	);

	$( '<img>' ).addClass( 'close' ).attr( 'src', 'images/icons/close_small.png' ).appendTo( navigation );

	box.appendTo( container );

	return container;
}

function generate_terminal( container )
{
	var output = $( '<pre>' ).addClass( 'terminal-output' );
	var frame = $( '<div>' ).addClass( 'box-frame' ).append( output );
	var input = $( '<input>' ).attr( 'type', 'text' ).addClass( 'terminal-input' );
	var submit = $( '<input>' ).attr( 'type', 'submit' ).val( 'Send' );
	var clear = $( '<input>' ).attr( 'type', 'reset' ).val( 'Clear' );
	var form = $( '<form>' ).addClass( 'terminal-form' );

	form.append( input ).append( submit ).append( clear );
	$( '.box-body', container ).append( frame ).append( form );

	submit.click
	(
		function()
		{
			$.post
			(
				'ajax.php?m=terminal',
				{
					'command': $( input ).attr( 'value' ),
					'token': token
				},
				function( xml )
				{
					var command = $( xml ).find( 'command' );

					try
					{
						eval( command.text() );
					}
					catch( e ) {}

					output.text( output.text() + "# " + $( xml ).find( 'input' ).text() + "\n" + $( xml ).find( 'output' ).text() + "\n" );
				}
			);

			input.val( '' );
			input.focus();

			return false;
		}
	);

	clear.click
	(
		function()
		{
			input.val( '' );
			output.text( '' );

			return false;
		}
	);

	$( '.close', container ).click
	(
		function()
		{
			page_console();
		}
	);

	return container;
}

//

function rand_between( min, max )
{
	return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

function set_refresh_rate( value )
{
	switch( value )
	{
		case '0':
			refresh_rate = '0';
			draw_animation = false;
			clear();
			break;

		case '1':
			refresh_rate = '1';
			draw_animation = true;
			break;

		case '2':
			refresh_rate = '2';
			draw_animation = true;
			break;

		case '3':
			refresh_rate = '3';
			draw_animation = true;
			break;
	}
}

function get_refresh_rate()
{
	switch( refresh_rate )
	{
		default:
		case '0':
			return 200;

		case '1':
			return 100;

		case '2':
			return 50;

		case '3':
			return 25;
	}
}

function set_sound_status( mute )
{
	switch( mute )
	{
		case '0':
			soundManager.unmute();
			muted = false;
			break;

		case '1':
			soundManager.mute();
			muted = true;
			break;
	}
}

function set_resolution( value )
{
	switch( value )
	{
		case '0':
			resolution = '0';
			$( '#content' ).css( 'zoom', '0.6' );
			$( '#content' ).css( '-moz-transform', 'scale(0.6)' );
			$( '#ranking' ).css( 'font-size', '17px' );
			$( 'body' ).css( 'font-size', '16px' );
			break;

		case '1':
			resolution = '1';
			$( '#content' ).css( 'zoom', '0.8' );
			$( '#content' ).css( '-moz-transform', 'scale(0.8)' );
			$( '#ranking' ).css( 'font-size', '15px' );
			$( 'body' ).css( 'font-size', '14px' );
			break;

		case '2':
			resolution = '2';
			$( '#content' ).css( 'zoom', '1.0' );
			$( '#content' ).css( '-moz-transform', 'scale(1.0)' );
			$( '#ranking' ).css( 'font-size', '13px' );
			$( 'body' ).css( 'font-size', '12px' );
			break;
	}
}

function login()
{
	loggedin = true;

	$( '#challenges' ).css( 'cursor', 'pointer' );
	$( '#submit' ).css( 'cursor', 'pointer' );
}

function logout()
{
	loggedin = false;

	$( '#challenges' ).css( 'cursor', 'url(images/icons/disabled.png),auto' );
	$( '#submit' ).css( 'cursor', 'url(images/icons/disabled.png),auto' );
}

function load_session()
{
	$.get
	(
		'ajax.php?m=get_session',
		function( xml )
		{
			if( $( xml ).find( 'loggedin' ).text() == '1' )
			{
				login();
			}
			else
			{
				logout();
			}

			token = $( xml ).find( 'token' ).text();
		}
	);
}

function check_browser()
{
	var last_warning = false;

	if( !jQuery.support.boxModel )
	{
		last_warning = $( '<li>' ).text( 'Your browser does not support the w3c css box model' ).appendTo( $( '#errors' ) );
	}

	if( !jQuery.support.ajax )
	{
		last_warning = $( '<li>' ).text( 'Your browser does not support ajax' ).appendTo( $( '#errors' ) );
	}

	if( !jQuery.support.opacity )
	{
		last_warning = $( '<li>' ).text( 'Your browser does not support opacity' ).appendTo( $( '#errors' ) );
	}

	if( !jQuery.support.leadingWhitespace )
	{
		last_warning = $( '<li>' ).text( 'Your browser has problems with leading whitespaces' ).appendTo( $( '#errors' ) );
	}

	if( $.browser.mozilla && $.browser.version.slice( 0, 3 ) == '1.9' )
	{
		last_warning = $( '<li>' ).text( 'Firefox 3 is not supported' ).appendTo( $( '#errors' ) );
	}

	if( last_warning )
	{
		$( '<li>' ).text( 'Update your browser (Firefox, Chrome, Safari, Opera) or use the minimal version' ).appendTo( $( '#errors' ) );

		return false;
	}
	else
	{
		return true;
	}
}

function initialize()
{
	$( '#errors' ).css( 'display', 'none' );
	$( '#content' ).css( 'display', 'inline-block' );

	canvas = document.getElementById( 'canvas' );
	context = canvas.getContext( '2d' );

	attack_wait();
	ticker_wait();
	update_ranking();

	set_refresh_rate( '3' );
	set_sound_status( '0' );
	set_resolution( '2' );

	// Animation loop
	animate();

	// Update loop
	setInterval( "update()", 30 );
}

$( document ).ready
(
	function()
	{
		if( !check_browser() )
		{ // Browser is not supported
			return;
		}

		// Marquee extra stuff
		$( 'marquee' ).marquee();

		load_session();

		clear_mainframe( false );

		$( '#challenges' ).click
		(
			function()
			{
				if( !loggedin )
				{
					return;
				}

				page_challenges();
			}
		);

		$( '#submit' ).click
		(
			function()
			{
				if( !loggedin )
				{
					return;
				}

				page_submit();
			}
		);

		$( '#authenticate' ).click
		(
			function()
			{
				if( loggedin )
				{
					page_logout();
				}
				else
				{
					page_login();
				}
			}
		);

		$( '#settings' ).click
		(
			function()
			{
				page_settings();
			}
		);

		$( '#close' ).click
		(
			function()
			{
				clear_mainframe( false );
			}
		);

		$( '#speed-down' ).click
		(
			function()
			{
				if( scrollamount < 2 )
				{
					return;
				}

				$( '#ticker' ).attr
				(
					{
						scrollamount:
							--scrollamount
					}
				);
			}
		);

		$( '#speed-up' ).click
		(
			function()
			{
				if( scrollamount > 8 )
				{
					return;
				}

				$( '#ticker' ).attr
				(
					{
						scrollamount:
							++scrollamount
					}
				);
			}
		);

		// Keybinds
		$( document ).keypress
		(
			function( e )
			{
				if( ( e.which == 122 && e.ctrlKey ) || ( $.browser.webkit && ( e.which == 26 ) ) )
				{ // Ctrl + z
					page_console();
				}
			}
		);

		initialize();
	}
);

