<?php

session_start();

?>
<!DOCTYPE HTML>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>Hack.lu CTF 2011</title>
  <link rel="stylesheet" href="styles/scoreboard.css" type="text/css" />
  <script type="text/javascript" src="scripts/jquery-1.6.2.min.js"></script>
  <script type="text/javascript" src="scripts/soundmanager-2.min.js"></script>
  <script type="text/javascript" src="scripts/jquery.marquee.js"></script>
  <script type="text/javascript" src="scripts/RequestAnimationFrame.js"></script>
  <script type="text/javascript" src="scripts/scoreboard-1.1.js"></script>
 </head>
 <body>
  <ul id="errors">
   <h1>Errors</h1>
   <noscript>
    <li>You have to enable javascript</li>
   </noscript>
  </ul>
  <div id="content">
   <div id="world">
    <div id="innercontent"></div>
    <canvas id="canvas" width="1000" height="600"></canvas>
    <div id="menu">
     <img src="images/icons/challenges.png" id="challenges" alt="browser" title="Challenges" />
     <img src="images/icons/submit.png" id="submit" alt="submit" title="Attack" />
     <img src="images/icons/authenticate.png" id="authenticate" alt="authenticate" title="Authenticate" />
     <img src="images/icons/separator.png" class="separator" alt="separator" />
     <img src="images/icons/settings.png" class="right" id="settings" alt="settings" title="Settings" />
     <img src="images/icons/close.png" class="right" id="close" alt="close" />
    </div>
   </div>
   <div id="sidebar">
    <div id="rankingframe">
     <div id="scrollable">
      <table id="ranking"></table>
     </div>
    </div>
    <div id="announcements">
     <div id="speed">
      <span id="speed-down">-</span> / <span id="speed-up">+</span>
     </div>
     <div id="tickerframe"></div>
    </div>
   </div>
  </div>
 </body>
</html>
