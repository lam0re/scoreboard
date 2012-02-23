<?php

// Definitions
define( 'MESSAGE_KEY', '' );
define( 'DB_HOST', '' );
define( 'DB_USER', '' );
define( 'DB_PASS', '' );
define( 'DB_NAME', '' );

// Debug
ini_set( 'display_errors', '0' );

// Database
$database = mysql_connect( DB_HOST, DB_USER, DB_PASS );
mysql_select_db( DB_NAME, $database );

if( mysql_errno() )
{
	exit( 'MySQL: Wrong credentials' );
}

function stripslashes_deep( &$value )
{
	$value = is_array( $value ) ?
		array_map( 'stripslashes_deep', $value ) :
		stripslashes( $value );

	return $value;
}

if( get_magic_quotes_gpc() )
{
	stripslashes_deep( $_GET );
	stripslashes_deep( $_POST );
	stripslashes_deep( $_COOKIE );
} 

session_start();

if( !isset( $_SESSION['token'] ) )
{
	$_SESSION['token'] = sha1( uniqid( '', true ) );
}

define( 'INITIALIZED', true );

?>
