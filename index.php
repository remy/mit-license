<?php

date_default_timezone_set('Europe/London'); // stop php from whining

$user_file = preg_replace('/\.mit-license\..*$/', '', $_SERVER["HTTP_HOST"]);

// sanitise user (not for DNS, but for file reading, I don't know
// just in case it's hacked about with or something bananas.
$user_file = preg_replace('/[^a-z0-9\-]/', '', $user_file);
$user_file = 'users/'.$user_file.'.json';

if (file_exists($user_file)) {
  $user = json_decode(file_get_contents($user_file));
  $holder = $user->copyright;
  if (property_exists($user, 'url')) {
    $holder = '<a href="'.$user->url.'">' . $holder . '</a>';
  }
} else {
  $holder = "&lt;copyright holders&gt;";
}

// grab sha from request uri
$request = $_SERVER["REQUEST_URI"];
$sha = '';
if ($request != "" && $request != "/" && $request != "/index.php") {
  $sha = preg_replace('/[^a-f0-9]/', '', $_SERVER["REQUEST_URI"]);
} else if (isset($user) && property_exists($user, 'version')) {
  $sha = preg_replace('/[^a-f0-9]/', '', $user->version);
}

// if sha specified, use that revision of licence
$license = '';
if ($sha != "") {
  try {
    // TODO must cache and optimise this as it'll kill my server :-(
    $gitCommitData = json_decode(@file_get_contents('https://api.github.com/repos/remy/mit-license/git/trees/' . $sha));
    if (isset($gitCommitData) && is_object($gitCommitData) && property_exists($gitCommitData, 'tree')) {
      foreach ($gitCommitData->tree as $commit) {
        if ($commit->path == 'LICENSE.html') {
          $licenseData = json_decode(file_get_contents($commit->url));
          $license = base64_decode($licenseData->content);
          break;
        }
      }
    }
  } catch (Exception $e) {
    echo 'Caught exception: ',  $e->getMessage(), "\n";
  }
  /*
  $out = array();
  // preg_replace should save us - but: please help me Obi Wan...
  exec("git show " . $sha . ":LICENSE.html", $out, $r);
  if ($r == 0) {
    $license = implode("\n", $out);
  }
   */
}

// if we didn't manage to read one in, use latest
if ($license == "") {
  $license = file_get_contents('LICENSE.html');
}

// replace info tag and display
$info = date('Y') . ' ' . $holder;
echo str_replace('{{info}}', $info, $license);

?>
