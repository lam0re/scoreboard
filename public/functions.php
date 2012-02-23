<?php

if( !defined( 'INITIALIZED' ) )
{ // No direct call, needs config
	exit();
}

// General

function output_xml( $xml )
{
	header( 'Content-Type: text/xml' );
	exit( $xml->asXML() );
}

function valid_token( $token )
{
	return ( $_SESSION['token'] === $token );
}

// Message

function get_messages( $limit )
{
	if( !is_numeric( $limit ) || ( $limit > 100 ) )
	{
		exit();
	}

	$result = mysql_query
	(
		"SELECT
			ticker.id,
			ticker.text,
			ticker.image,
			ticker.sound,
			ticker.script
		FROM
			ticker
		ORDER BY
			ticker.id DESC
		LIMIT " .
		    intval( $limit )
	);

	if( !$result )
	{
		exit( 'MySQL: Syntax error' );
	}

	$xml = new SimpleXMLElement( '<transmissions></transmissions>' );

	while( $answer = mysql_fetch_assoc( $result ) )
	{
		$xml_announcement = $xml->addChild( 'announcement' );
		$xml_announcement->addChild( 'id', $answer['id'] );
		$xml_announcement->addChild( 'text', $answer['text'] );
		$xml_announcement->addChild( 'image', $answer['image'] );
		$xml_announcement->addChild( 'sound', $answer['sound'] );
		$xml_announcement->addChild( 'script', $answer['script'] );
	}

	return $xml;
}

// Latest attacks

function get_attacks( $id )
{
	$limit = 20;

	if( $id < 1 )
	{ // First call
		$limit = 1;
	}

	$result = mysql_query
	(
		"SELECT
			attacks.id,
			teams.name,
			locations.x,
			locations.y,
			locations.country,
			locations.code,
			challenges.score
		FROM
			attacks
		JOIN
			teams
		ON
			attacks.team = teams.id
		JOIN
			locations
		ON
			teams.location = locations.id
		JOIN
			challenges
		ON
			attacks.challenge = challenges.id
		WHERE
			attacks.id > '" . mysql_real_escape_string( $id ) . "'
		ORDER BY
			attacks.id DESC
		LIMIT " .
			intval( $limit )
	);

	if( !$result )
	{
		exit( 'MySQL: Syntax error' );
	}

	$xml = new SimpleXMLElement( '<attacks></attacks>' );

	while( $answer = mysql_fetch_assoc( $result ) )
	{
		$xml_attack = $xml->addChild( 'attack' );
		$xml_attack->addChild( 'id', $answer['id'] );
		$xml_attack->addChild( 'origin_x', $answer['x'] );
		$xml_attack->addChild( 'origin_y', $answer['y'] );
		$xml_attack->addChild( 'teamname', $answer['name'] );
		$xml_attack->addChild( 'country', $answer['country'] );
		$xml_attack->addChild( 'code', $answer['code'] );
		$xml_attack->addChild( 'score', ( $answer['score'] / 500 ) );
	}

	return $xml;
}

// Current ranking

function get_ranking()
{
	$result = mysql_query
	(
		"SELECT
			teams.id,
			teams.name,
			locations.country,
			locations.code,
			(
				SELECT
					COALESCE( SUM( challenges.score ), 0 ) + COALESCE( SUM( attacks.additional ), 0 )
				FROM
					challenges, attacks
				WHERE
					attacks.team = teams.id
					AND attacks.challenge = challenges.id
			) AS score
		FROM
			teams
		JOIN
			locations
		ON
			teams.location = locations.id
		ORDER BY
			score DESC,
			teams.name ASC"
	);

	if( !$result )
	{
		exit( 'MySQL: Syntax error' );
	}

	$xml = new SimpleXMLElement( '<ranking></ranking>' );
	
	$current['rank'] = 1;
	$current['score'] = -1;

	while( $answer = mysql_fetch_assoc( $result ) )
	{
		if( $current['score'] < 0 )
		{
			$current['score'] = $answer['score'];
		}

		if( $answer['score'] < $current['score'] )
		{
			$current['score'] = $answer['score'];
			$current['rank']++;
		}

		$xml_team = $xml->addChild( 'team' );
		$xml_team->addChild( 'id', $answer['id'] );
		$xml_team->addChild( 'rank', $current['rank'] );
		$xml_team->addChild( 'name', $answer['name'] );
		$xml_team->addChild( 'country', $answer['country'] );
		$xml_team->addChild( 'code', $answer['code'] );
		$xml_team->addChild( 'score', $answer['score'] );
	}

	return $xml;
}

// Challenge browser

function get_challenges()
{
	if( !is_loggedin() )
	{
		exit();
	}

	$result = mysql_query
	(
		"SELECT
			categories.id,
			categories.name
		FROM
			categories
		ORDER BY
			categories.id ASC"
	);

	if( !$result )
	{
		exit( 'MySQL: Syntax error' );
	}

	$xml = new SimpleXMLElement( '<categories></categories>' );

	while( $category = mysql_fetch_assoc( $result ) )
	{
		$subresult = mysql_query
		(
			"SELECT
				challenges.id,
				challenges.title,
				challenges.score,
				(
					SELECT
						COUNT( attacks.id )
					FROM
						attacks
					WHERE
						attacks.challenge = challenges.id
						AND attacks.team = '" . mysql_real_escape_string( $_SESSION['teamid'] ) . "'
				) AS solved
			FROM
				challenges
			WHERE
				challenges.category = '" . mysql_real_escape_string( $category['id'] ) . "'
			ORDER BY
				challenges.title ASC"
		);

		if( !$subresult )
		{
			exit( 'MySQL: Syntax error' );
		}

		$xml_category = $xml->addChild( 'category' );
		$xml_category->addChild( 'name', $category['name'] );

		while( $answer = mysql_fetch_assoc( $subresult ) )
		{
			$xml_challenge = $xml_category->addChild( 'challenge' );
			$xml_challenge->addChild( 'id', $answer['id'] );
			$xml_challenge->addChild( 'title', $answer['title'] );
			$xml_challenge->addChild( 'solved', $answer['solved'] );
			$xml_challenge->addChild( 'score', $answer['score'] );
		}
	}

	return $xml;
}

function get_challenge( $id )
{
	$result = mysql_query
	(
		"SELECT
			challenges.id,
			challenges.title,
			challenges.description
		FROM
			challenges
		WHERE
			challenges.id = '" . mysql_real_escape_string( $id ) . "'"
	);

	if( !$result )
	{
		exit( 'MySQL: Syntax error' );
	}

	$answer = array();
	if( mysql_num_rows( $result ) === 1 )
	{
		$answer = mysql_fetch_assoc( $result );
	}
	else
	{
		$answer = array( 'id' => 0, 'title' => '', 'description' => '', 'image' => '' ); 
	}

	$xml = new SimpleXMLElement( '<challenge></challenge>' );
	$xml->addChild( 'id', $answer['id'] );
	$xml->addChild( 'title', $answer['title'] );
	$xml->addChild( 'description', $answer['description'] );

	return $xml;
}

// Attack

function submit_key( $key, $token )
{
	if( !is_loggedin() || !valid_token( $token ) )
	{
		exit();
	}

	$hash = hash( 'sha512', $key );

	$result = mysql_query
	(
		"SELECT
			challenges.id,
			(
				SELECT
					COUNT( attacks.id )
				FROM
					attacks
				WHERE
					attacks.challenge = challenges.id
					AND attacks.team = '" . mysql_real_escape_string( $_SESSION['teamid'] ) . "'
			) AS already_solved,
			(
				SELECT
					COUNT( attacks.id )
				FROM
					attacks
				WHERE
					attacks.challenge = challenges.id
			) AS number_solved_all
		FROM
			challenges
		WHERE
			challenges.key = '" . mysql_real_escape_string( $hash ) . "'"
	);

	if( !$result )
	{
		exit( 'MySQL: Syntax error' );
	}

	$answer = array();

	if( mysql_num_rows( $result ) === 1 )
	{
		$data = mysql_fetch_assoc( $result );

		if( $data['already_solved'] == '1' )
		{
			$answer['code'] = 2;
		}
		else if( $data['already_solved'] == '0' )
		{
			// Additional score			
			$additional = 0;

			if( $data['number_solved_all'] === '0' )
			{
				$additional = 3;
			}
			else if( $data['number_solved_all'] === '1' )
			{
				$additional = 2;
			}
			else if( $data['number_solved_all'] === '2' )
			{
				$additional = 1;
			}

			// Insert
			mysql_query
			(
				"INSERT INTO
					attacks
					(
						team,
						challenge,
						additional,
						date
					)
					VALUES
					(
						'" . mysql_real_escape_string( $_SESSION['teamid'] ) . "',
						'" . mysql_real_escape_string( $data['id'] ) . "',
						'" . mysql_real_escape_string( $additional )  . "',
						NOW()
					)"
			);

			$answer['code'] = 1;
		}
	}
	else
	{
		$answer['code'] = 3;
	}

	$xml = new SimpleXMLElement( '<attack></attack>' );
	$xml->addChild( 'code', $answer['code'] );

	return $xml;
}

// Authentication

function is_loggedin()
{
	if( isset( $_SESSION['teamid'] ) && ( $_SESSION['teamid'] !== false ) && ( intval( $_SESSION['teamid'] ) > 0 ) )
	{
		return true;
	}
	else
	{
		return false;
	}
}

function login( $team, $password, $token )
{
	if( !valid_token( $token ) )
	{
		exit();
	}

	$answer = array();

	if( is_loggedin() )
	{
		$answer['code'] = 2;
	}
	else
	{
		$hash = hash( 'sha512', $password );

		$result = mysql_query
		(
			"SELECT
				teams.id
			FROM
				teams
			WHERE
				BINARY teams.name = '" . mysql_real_escape_string( $team ) . "'
				AND teams.password = '" . mysql_real_escape_string( $hash ) . "'"
		);

		if( !$result )
		{
			exit( 'MySQL: Syntax error' );
		}

		if( mysql_num_rows( $result ) === 1 )
		{
			$answer['code'] = 1;
			$data = mysql_fetch_assoc( $result );
			$_SESSION['teamid'] = intval( $data['id'] );
		}
		else
		{
			$answer['code'] = 3;
			$_SESSION['teamid'] = false;
		}
	}

	$xml = new SimpleXMLElement( '<login></login>' );
	$xml->addChild( 'code', $answer['code'] );

	return $xml;
}

function logout( $token )
{
	if( !valid_token( $token ) )
	{
		exit();
	}

	$answer = array();

	if( is_loggedin() )
	{
		$answer['code'] = 1;
	}
	else
	{
		$answer['code'] = 2;
	}
	
	$_SESSION['teamid'] = false;

	$xml = new SimpleXMLElement( '<logout></logout>' );
	$xml->addChild( 'code', $answer['code'] );

	return $xml;
}

function get_session()
{
	$answer = array();

	if( is_loggedin() )
	{
		$answer['loggedin'] = 1;
	}
	else
	{
		$answer['loggedin'] = 0;
	}

	$xml = new SimpleXMLElement( '<status></status>' );
	$xml->addChild( 'loggedin', $answer['loggedin'] );
	$xml->addChild( 'token', $_SESSION['token'] );

	return $xml;
}

function send_message( $password, $message, $image, $sound, $script, $token )
{
	if( !valid_token( $token ) )
	{
		exit();
	}

	$answer = array();

	if( hash( 'sha512', $password ) !== MESSAGE_KEY )
	{
		$answer['code'] = 3;
	}
	else
	{
		$directory = 'images/avatars/';
		$real_base = realpath( $directory );
		$image_relative = $directory . $image;
		$image_absolute = realpath( $image_relative );

		if( ( $image_absolute === false ) || ( strpos( $image_absolute, $real_base ) !== 0 ) || !file_exists( $image_absolute ) )
		{
			$answer['code'] = 2;
		}
		else
		{
			$result = mysql_query
			(
				"INSERT INTO
					ticker
					(
						text,
						image,
						sound,
						script
					)
					VALUES
					(
						'" . mysql_real_escape_string( $message ) . "',
						'" . mysql_real_escape_string( $image ) . "',
						'" . mysql_real_escape_string( $sound ) . "',
						'" . mysql_real_escape_string( $script ) . "'
					)"
			);

			if( !$result )
			{
				exit( 'MySQL: Syntax error' );
			}

			$answer['code'] = 1;
		}
	}

	$xml = new SimpleXMLElement( '<message></message>' );
	$xml->addChild( 'code', $answer['code'] );

	return $xml;
}

function terminal( $command, $token )
{
	if( !valid_token( $token ) )
	{
		exit();
	}

	$answer['command'] = '';
	$answer['output'] = '';

	switch( $command )
	{
		case 'help':
			$answer['output'] =
				"page\n" .
				"   authentication\n" .
				"   challenges\n" .
				"   sendmessage\n" .
				"   submit\n" .
				"radio\n" .
				"   chipmode\n" .
				"   dubstep\n" .
				"   dubweiser\n" .
				"reset\n" .
				"   attacks\n" .
				"   ticker\n" .
				"   ranking\n";
			break;

		case 'page':
			$answer['command'] = 'clear_mainframe( false );';
			$answer['output'] = 'Loading main page ...';
			break;

		case 'page authentication':
			if( is_loggedin() )
			{
				$answer['command'] = 'page_logout();';
				$answer['output'] = 'Loading page logout ...';
			}
			else
			{
				$answer['command'] = 'page_login();';
				$answer['output'] = 'Loading page login ...';
			}
			break;

		case 'page challenges':
			if( is_loggedin() )
			{
				$answer['command'] = 'page_challenges();';
				$answer['output'] = 'Loading page challenges ...';
			}
			else
			{
				$answer['output'] = 'You have to be authenticated ...';
			}
			break;

		case 'page sendmessage':
			$answer['command'] = 'page_sendmessage();';
			$answer['output'] = 'Loading page sendmessage ...';
			break;

		case 'page settings':
			$answer['command'] = 'page_settings();';
			$answer['output'] = 'Loading page settings ...';
			break;

		case 'page submit':
			if( is_loggedin() )
			{
				$answer['command'] = 'page_submit();';
				$answer['output'] = 'Loading page submit ...';
			}
			else
			{
				$answer['output'] = 'You have to be authenticated ...';
			}
			break;			

		case 'radio':
			$answer['command'] = 'stop_radio();';
			$answer['output'] = 'Stopping the radio ...';
			break;

		case 'radio chipmode':
			$answer['command'] = 'start_radio("http://212.116.114.35:8000/;stream.mp3");';
			$answer['output'] = 'Playing <Chipmode.com>';
			break;

		case 'radio dubstep':
			$answer['command'] = 'start_radio("http://80.94.69.106:6374/;stream.mp3");';
			$answer['output'] = 'Playing <Di.Fm Dubstep>';
			break;

		case 'radio dubweiser':
			$answer['command'] = 'start_radio("http://dubweiser.ru:8000/;stream.mp3");';
			$answer['output'] = 'Playing <Dubweiser.ru>';
			break;

		case 'reset':
			$answer['command'] = 'window.location.reload();';
			$answer['output'] = 'Resetting ...';
			break;

		case 'reset attacks':
			$answer['command'] = 'last_attack = "0"; check_attacks();';
			$answer['output'] = 'Resetting attacks ...';
			break;

		case 'reset ticker':
			$answer['command'] = 'last_message = "0"; check_ticker();';
			$answer['output'] = 'Resetting ticker ...';
			break;

		case 'reset ranking':
			$answer['command'] = 'update_ranking();';
			$answer['output'] = 'Resetting ticker ...';
			break;

		default:
			$answer['output'] = 'Unknown command ...';
			break;
	}

	$xml = new SimpleXMLElement( '<terminal></terminal>' );
	$xml->addChild( 'input', $command );
	$xml->addChild( 'command', $answer['command'] );
	$xml->addChild( 'output', $answer['output'] );

	return $xml;
}

?>
