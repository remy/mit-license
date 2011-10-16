<?php

// grab sha from request uri
$request = $_SERVER["REQUEST_URI"];
if ($request != "" && $request != "/" && $request != "/index.php") {
  $sha = preg_replace('/[^a-f0-9]/', '', $_SERVER["REQUEST_URI"]);
}

// grab username from host & json
$users = json_decode(file_get_contents('users.json'));
$user = preg_replace('/\.mit-license\.org$/', '', $_SERVER["HTTP_HOST"]);
$holder = "&lt;copyright holders&gt;";
if (property_exists($users, $user)) {
  $holder = $users->$user;
}

// if sha specified, use that revision of licence
if ($sha != "") {
  $out = array();
  exec("git show " . $sha . ":LICENSE.html", $out, $r);
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
echo str_replace('{{info}}', $info, $license);

?>
