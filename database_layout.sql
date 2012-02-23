CREATE TABLE IF NOT EXISTS `attacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team` int(11) NOT NULL,
  `challenge` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `additional` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `team` (`team`,`challenge`)
);

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `challenges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `score` int(11) NOT NULL,
  `key` text NOT NULL,
  `category` int(11) NOT NULL,
  `deactivated` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `country` text NOT NULL,
  `code` text NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `location` int(11) NOT NULL,
  `registration` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `local` tinyint(1) NOT NULL,
  `password` text NOT NULL,
  `mail` text NOT NULL,
  `beer` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `ticker` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `image` text NOT NULL,
  `sound` text NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `script` text NOT NULL,
  PRIMARY KEY (`id`)
);

