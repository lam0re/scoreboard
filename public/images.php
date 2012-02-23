<?php

include( 'config.php' );
include( 'functions.php' );

// Private functions

function draw_border( $height, $width )
{
	$height = intval( $height );
	$width = intval( $width );

	if( ( $height <= 200 ) || ( $height > 2000 ) || ( $width <= 200 ) || ( $width > 2000 ) )
	{
		return( 'Size: 201-2000' );
	}

	// Load resources
	$images['top_left'] = imagecreatefrompng( 'images/border/top_left.png' );
	$images['top_right'] = imagecreatefrompng( 'images/border/top_right.png' );
	$images['bottom_left'] = imagecreatefrompng( 'images/border/bottom_left.png' );
	$images['bottom_right'] = imagecreatefrompng( 'images/border/bottom_right.png' );
	$images['left'] = imagecreatefrompng( 'images/border/left.png' );
	$images['right'] = imagecreatefrompng( 'images/border/right.png' );
	$images['top'] = imagecreatefrompng( 'images/border/top.png' );
	$images['bottom'] = imagecreatefrompng( 'images/border/bottom.png' );

	// Transparency
	foreach( $images as $image )
	{
		imagealphablending( $image, true );
	}

	// Create transparent png
	$border = imagecreatetruecolor( $width, $height );
	$white = imagecolorallocate( $border, 255, 255, 255 );
	imagecolortransparent( $border, $white );
	imagefill( $border, 0, 0, $white );

	// Insert border elements
	imagecopy( $border, $images['top_left'], 0, 0, 0, 0, 100, 100 );
	imagecopy( $border, $images['top_right'], ($width - 100), 0, 0, 0, 100, 100 );
	imagecopy( $border, $images['bottom_left'], 0, ($height - 100), 0, 0, 100, 100 );
	imagecopy( $border, $images['bottom_right'], ($width - 100), ($height - 100), 0, 0, 100, 100 );
	imagecopyresized( $border, $images['left'], 0, 100, 0, 0, 4, ($height - 200), 4, 1 );
	imagecopyresized( $border, $images['right'], ($width - 4), 100, 0, 0, 4, ($height - 200), 4, 1 );
	imagecopyresized( $border, $images['top'], 100, 0, 0, 0, ($width - 200), 5, 1, 5 );
	imagecopyresized( $border, $images['bottom'], 100, ($height - 5), 0, 0, ($width - 200), 5, 1, 5 );

	// Output
	header( 'Cache-Control:max-age=86400' );
	header( 'Content-Type: image/png' );
	imagepng( $border );

	// Destroy
	imagedestroy( $border );

	foreach( $images as $image )
	{
		imagedestroy( $image );
	}
}

// 

if( !isset( $_GET['m'] ) )
{
	exit();
}

switch( $_GET['m'] )
{
	case 'border':
		if( !isset( $_GET['h'] ) || !isset( $_GET['w'] ) )
		{
			exit();
		}

		exit
		(
			draw_border
			(
				$_GET['h'],
				$_GET['w']
			)
		);
}

?>
