<?php

include( 'config.php' );
include( 'functions.php' );

if( !isset( $_GET['m'] ) || !is_string(  $_GET['m'] ) )
{
	exit();
}

switch( $_GET['m'] )
{
	case 'get_message':
		output_xml
		(
			get_messages( 1 )
		);

	case 'get_attacks':
		if( !isset( $_POST['last'] ) )
		{
			exit();
		}

		output_xml
		(
			get_attacks
			(
				$_POST['last']
			)
		);

	case 'get_ranking':
		output_xml
		(
			get_ranking()
		);

	case 'get_challenges':
		output_xml
		(
			get_challenges()
		);

	case 'get_challenge':
		if( !isset( $_POST['id'] ) )
		{
			exit();
		}

		output_xml
		(
			get_challenge
			(
				$_POST['id']
			)
		);

	case 'submit_key':
		if( !isset( $_POST['key'] ) || !isset( $_POST['token'] ) )
		{
			exit();
		}

		output_xml
		(
			submit_key
			(
				$_POST['key'],
				$_POST['token']
			)
		);

	case 'login':
		if( !isset( $_POST['username'] ) || !isset( $_POST['password'] ) || !isset( $_POST['token'] ) )
		{
			exit();
		}

		output_xml
		(
			login
			(
				$_POST['username'],
				$_POST['password'],
				$_POST['token']
			)
		);

	case 'logout':
		if( !isset( $_POST['token'] ) )
		{
			exit();
		}

		output_xml
		(
			logout
			(
				$_POST['token']
			)
		);

	case 'get_session':
		output_xml
		(
			get_session()
		);

	case 'send_message':
		if( !isset( $_POST['password'] ) || !isset( $_POST['message'] )
		|| !isset( $_POST['image'] ) || !isset( $_POST['sound'] )
		|| !isset( $_POST['script'] ) || !isset( $_POST['token'] ) )
		{
			exit();
		}

		output_xml
		(
			send_message
			(
				$_POST['password'],
				$_POST['message'],
				$_POST['image'],
				$_POST['sound'],
				$_POST['script'],
				$_POST['token']
			)
		);

	case 'terminal':
		if( !isset( $_POST['command'] ) || !isset( $_POST['token'] ) )
		{
			exit();
		}

		output_xml
		(
			terminal
			(
				trim( $_POST['command'] ),
				$_POST['token']
			)
		);
}

?>
