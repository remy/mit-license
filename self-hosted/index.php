<?php

date_default_timezone_set('Europe/London'); // stop php from whining

$format = 'html';
$licenseUrl = '';
$user_file = 'assets/info.json';

/**
 * Load up the user.json file and read properties in
 **/
if (file_exists($user_file)) {

    $user = json_decode(file_get_contents($user_file));
    $holder = htmlentities($user->copyright, ENT_COMPAT | ENT_HTML401, 'UTF-8');

    if (property_exists($user, 'url')) {
        $holder = '<a href="' . $user->url . '">' . $holder . '</a>';
    }

    if (property_exists($user, 'email')) {
        $holder = $holder . ' &lt;<a href="mailto:' . $user->email . '">' . $user->email . '</a>&gt;';

        if(property_exists($user, 'gravatar') && $user->gravatar === true){
            $gravatar = '<img id="gravatar" src="http://www.gravatar.com/avatar/' . md5(strtolower(trim($user->email))) . '" />';
        }
    }

    if (property_exists($user, 'format')) {
        if (strtolower($user->format) == 'txt') {
            $format = 'txt';
        }
    }

    if (property_exists($user, 'licenseUrl')) {
        $licenseUrl = $user->licenseUrl;
    }

} else {
    $holder = "&lt;copyright holders&gt;";
}

/**
 * Now process the request url. Optional parts of the url are (in order):
 * [sha]/[year|year-range]/license.[format]
 * eg. http://rem.mit-license.org/a526bf7ad1/2009-2010/license.txt
 **/

// grab sha from request uri
$request_uri = explode('/', $_SERVER["REQUEST_URI"]);
$request = array_pop($request_uri);

// in case there's a trailing slash (unlikely)
if ($request == '') $request = array_pop($request_uri);

// url file format overrides user preference
if (stripos($request, 'license') === 0) {

    $request = explode('.', strtolower($request));
    $request = array_pop($request);

    $format = $request == 'txt' ? 'txt' : 'html';

    // move down to the next part of the request
    $request = array_pop($request_uri);
}

// check if we have a year or a year range up front
$year = date('Y');

preg_match('/^(\d{4})(?:(?:\-)(\d{4}))?$/', $request, $match);

if (count($match) > 1) {

    if (isset($match[2])) {
        $year = $match[2];
    }
    if ($match[1]) {
        $year = $match[1] == $year ? $year : $match[1] . '-' . $year;
    }
    $request = array_pop($request_uri);
}

$license = file_get_contents('assets/license.html');

// replace info tag and display
$info = $year . ' ' . $holder;
$license = str_replace('{{info}}', $info, $license);
$license = str_replace('{{gravatar}}', $gravatar, $license);
$license = str_replace('{{license-url}}', $licenseUrl, $license);

// if we want text format, strip out the license from the article tag
// and then strip any other tags in the license.
if ($format == 'txt') {

    $license = explode('<article>', $license);
    $license = explode('</article>', array_pop($license));
    $license = array_shift($license);
    $license = preg_replace('/<[^>]*>/', '', trim($license));
    $license = html_entity_decode($license, ENT_COMPAT | ENT_HTML401, 'UTF-8');
    $license .= "\n";
    header('content-type: text/plain; charset=UTF-8');
}

echo $license;
