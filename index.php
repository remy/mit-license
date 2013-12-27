<?php

date_default_timezone_set('Europe/London'); // stop php from whining

$format = 'html';
$theme = 'default';
$cname = '';
$allowyearoveride = true;
$allowstartoveride = true;
$startyear = date('Y');
$year = date('Y');

// use a match instead of preg_replace to ensure we got the cname
preg_match('/^([a-z0-9\-]+)\.mit-license\..*$/', $_SERVER['HTTP_HOST'], $match);

if (count($match) == 2) {
  $cname = $match[1];
} else {
  preg_match('/^([a-z0-9\-]+)\.localhost/', $_SERVER['HTTP_HOST'], $match);
  if (count($match) == 2) {
    $cname = $match[1];
  }
}

$user_file = 'users/' . $cname . '.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $cname) {
  try {
    $data = json_decode(file_get_contents('php://input'));
    if (!property_exists($data, 'copyright')) {
      Throw new Exception('>>> JSON requires "copyright" property and value');
    }

    if (!property_exists($data, 'password')) {
      Throw new Exception('>>> JSON requires "password" property and value');
    }

    if (file_exists($user_file)) {
      $user = json_decode(file_get_contents($user_file));
      if (property_exists($user, 'password')) {
        if(hash("sha512", $data->password) != $user->password){
          Throw new Exception('>>> Incorrect Password, Please Try Again');
        }
      } else {
        echo ">> Warning: Your user Currently Has No Password\n\n";
      }
    }
    
    $data->password = hash("sha512", $data->password);

    if (!file_put_contents($user_file, json_encode($data))) {
      Throw new Exception(wordwrap('>>> Unable to create new user / update - please send a pull request on https://github.com/remy/mit-license'));
    }

    // try to add to github...!
    exec('cd /WWW/mit-license && /usr/bin/git add ' . $user_file . ' && /usr/bin/git commit -m"automated creation/updating of ' . $user_file . '"', $out, $r);
    //print_r($out); echo "\n"; print_r($r); echo "\n";
    $out = array();
    exec('cd /WWW/mit-license && /usr/bin/git push origin master -v 2>&1', $out, $r);
    //print_r($out); echo "\n"; print_r($r); echo "\n";

    echo '>>> MIT license page created / updated: http://' . $_SERVER['HTTP_HOST'] . "\n\n";
  } catch (Exception $e) {
    echo $e->getMessage() . "\n\n";
  }
  exit;
}

/**
 * Load up the user.json file and read properties in
 **/
if ($cname && file_exists($user_file)) {
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

  if (property_exists($user, 'theme')) {
    if (file_exists('themes/' . $user->theme . '.css')) {
      $theme = $user->theme;
    }
  }

  if (property_exists($user, 'startyear')) {
    $startyear = $user->startyear;
    $allowstartyearoveride = false;
  }

  if (property_exists($user, 'endyear')) {
    $year = $user->endyear;
    $allowyearoveride = false;
  }

  if (property_exists($user, 'allowyearoveride')) {
    $allowyearoveride = $allowstartyearoveride = $user->allowyearoveride;
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
  $format = array_pop(explode('.', strtolower($request))) == 'txt' ? 'txt' : 'html';

  // move down to the next part of the request
  $request = array_pop($request_uri);
}

// check if we have a year or a year range up front
preg_match('/^(\d{4})(?:(?:\-)(\d{4}))?$/', $request, $match);
if (count($match) > 1) {
  if ($match[2]) {
    if ($allowyearoveride) {
      $year = $match[2];
    }
  }
  if ($match[1]) {
    if ($allowstartyearoveride) {
      $startyear = $match[1];
    }
  }
  $request = array_pop($request_uri);
}

$year = $startyear == $year ? $year : $startyear . '-' . $year;

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
$info = $year . ' ' . $holder;
$license = str_replace('{{info}}', $info, $license);
$license = str_replace('{{theme}}', $theme, $license);
$license = str_replace('{{gravatar}}', $gravatar, $license);

// if we want text format, strip out the license from the article tag
// and then strip any other tags in the license.
if ($format == 'txt') {
  $license = array_shift(explode('</article>', array_pop(explode('<article>', $license))));
  $license = preg_replace('/<[^>]*>/', '', trim($license));
  $license = html_entity_decode($license, ENT_COMPAT | ENT_HTML401, 'UTF-8');
  header('content-type: text/plain; charset=UTF-8');
}

echo $license;
