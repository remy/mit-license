<?php
$users = json_decode(file_get_contents('users.json'));
$user = preg_replace('/\.mit-license\.org$/', '', $_SERVER["HTTP_HOST"]);

$holder = "&lt;copyright holders&gt;";
if (property_exists($users, $user)) {
  $holder = $users->$user;
}

$info = date('Y') . ' ' . $holder;
$license = file_get_contents('LICENSE');
echo str_replace('{{info}}', $info, $license);

?>
