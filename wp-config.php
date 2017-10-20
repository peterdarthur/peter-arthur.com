<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'peterartDB8ujrd');

/** MySQL database username */
define('DB_USER', 'peterartDB8ujrd');

/** MySQL database password */
define('DB_PASSWORD', 'WhfQIZNC1K');

/** MySQL hostname */
define('DB_HOST', '127.0.0.1');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'XLXiu*]q+.;AH#2DLW5DPamx3FNYjMUgr$>nv^}7J,7IUcBMUfryXjr$<3u^<3AM');
define('SECURE_AUTH_KEY',  'YQnm${AjPfyey{Vo!o!4N0JcJcvcv>v>BUBQjQj$GatZt_1-[9O1GVlOds|o~:C|4');
define('LOGGED_IN_KEY',    'Jcnv@>jr$,}3F^>3BJQY7FMUcjvQYfny^>qy,7EM{3AIUbj![5CKRZ8GNVhowRd');
define('NONCE_KEY',        '~4G!:4CNVdCJRZks-Zgow![0v@[08FRqx.]2AL#;9HTaiHPWepx*elt*#;t+_;5DL');
define('AUTH_SALT',        '7YrUjy>u,3I{BQfEUjybq^y<6MAPfu4JZkNcs!kz[8!0FV8JYoQgv,n@}B,3JY~');
define('SECURE_AUTH_SALT', 'd~hs!:w|4K}CRdsVgs!gs@>8@>4FRc*]9LW5HSepOal+#lx_;D_:9KW5GShtSdp-[');
define('LOGGED_IN_SALT',   ';HT;6HPWiqPWepx*]lx*#29H#;9HPltSalt-#;t-#19Hjr$,7E,{7EMXfEMXfnyT');
define('NONCE_SALT',       'In^jy<7^AQ3IXmPfu.3EUjMbq^jy<7${AQ2ITjybq*u.2I]APe|4JY8NcrUkz>r');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define('WP_DEBUG', false);define('FS_METHOD', 'direct');

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
