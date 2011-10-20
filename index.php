<?php

date_default_timezone_set('Europe/London'); // stop php from whining

$format = 'html';
$theme = 'default';
$user_file = preg_replace('/\.mit-license\..*$/', '', $_SERVER["HTTP_HOST"]);

// sanitise user (not for DNS, but for file reading, I don't know
// just in case it's hacked about with or something bananas.
$user_file = preg_replace('/[^a-z0-9\-]/', '', $user_file);
$user_file = 'users/'.$user_file.'.json';

if (file_exists($user_file)) {
  $user = json_decode(file_get_contents($user_file));
  $holder = htmlentities($user->copyright, ENT_COMPAT | ENT_HTML5, 'UTF-8');
  if (property_exists($user, 'url')) {
    $holder = '<a href="'.$user->url.'">' . $holder . '</a>';
  }

  if (property_exists($user, 'format')) {
    if (strtolower($user->format) == 'txt') {
      $format = 'txt';
    }
  }

  if (property_exists($user, 'theme')) {
    if (file_exists('themes/' . $user->theme . '.css')) {
      $theme = $user->theme;
    }
  }
} else {
  $holder = "&lt;copyright holders&gt;";
}

// grab sha from request uri
$request_uri = explode('/', $_SERVER["REQUEST_URI"]);

$request = array_pop($request_uri);
// in case there's a trailing slash (unlikely)
if ($request == '') $request = array_pop($request_uri);

// url file format overrides user preference
if (stripos($request, 'license') === 0) {
  $format = array_pop(explode('.', strtolower($request))) == 'txt' ? 'txt' : 'html';

  // move down to the next part of the request
  $request = array_pop($request_uri);
}

// check if there's a SHA on the url and read this to switch license versions
$sha = '';
if ($request != "" && $request != "/" && $request != "/index.php") {
  $sha = preg_replace('/[^a-f0-9]/', '', $request);
} else if (isset($user) && property_exists($user, 'version')) {
  $sha = preg_replace('/[^a-f0-9]/', '', $user->version);
}

// if sha specified, use that revision of licence
$license = '';
if ($sha != "") {
  $out = array();
  // preg_replace should save us - but: please help me Obi Wan...
  exec("/usr/local/bin/git show " . $sha . ":LICENSE.html", $out, $r);
  if ($r == 0) {
    $license = implode("\n", $out);
  } 
}

// if we didn't manage to read one in, use latest
if ($license == "") {
  $license = file_get_contents('LICENSE.html');
}

// replace info tag and display
$info = date('Y') . ' ' . $holder;
$license = str_replace('{{info}}', $info, $license);
$license = str_replace('{{theme}}', $theme, $license);

// if we want text format, strip out the license from the article tag
// and then strip any other tags in the license.
if ($format == 'txt') {
  $license = array_shift(explode('</article>', array_pop(explode('<article>', $license))));
  $license = preg_replace('/<[^>]*>/', '', trim($license));
  $license = html_entity_decode($license);
  header('content-type: text/plain');
}

echo $license;

?>
