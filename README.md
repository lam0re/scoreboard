# Scoreboard
This project was created for the challenge-based Hack.lu CTF 2011 competition. It is based on PHP and MySQL and makes heavy use of Javascript.

## Goal
The goal of this project was to write an interactive, animated scoreboard which automatically updates itself without reloads. If a team submits a flag or
an administrator announces something it gets graphically displayed. This makes it possible to open the scoreboard f.i. on a projector and follow the events.
The intention was to make it look like and feel more like a game than a website.

## Future
It is unlikely that this project will be continued (but not impossible). All important things are implemented and the competition is over, so there is no real
need to extend it. If you want to fork this project though you are more than welcome.

## Installation
Create a MySQL database (database_layout.sql) and update the settings in /public/config.php. Now move the content of /public to a web-accessible directory
and the installation is complete. Teams, challenges etc. have to be added manually to the database. All passwords are hashed with SHA-512.

## Sources
/public/images/backgrounds/stars1.jpg

/public/images/backgrounds/stars2.jpg

 - Russell Croman, http://www.rc-astro.com/


/public/images/backgrounds/world.jpg

 - http://nssdc.gsfc.nasa.gov/planetary/planets/earthpage.html


/public/images/flags/

 - http://www.famfamfam.com/lab/icons/flags/


/public/images/icons/

 - http://openiconlibrary.sourceforge.net/


/public/scripts/RequestAnimationFrame.js

 - Paul Irish, http://paulirish.com/2011/requestanimationframe-for-smart-animating/


/public/scripts/jquery.marquee.js

 - Remy Sharp, http://remysharp.com/tag/marquee


/public/scripts/jquery-1.6.2.min.js

 - http://jquery.com/


/public/scripts/soundmanager-2.min.js

 - http://www.schillmania.com/projects/soundmanager2/

