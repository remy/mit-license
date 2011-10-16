<?php

date_default_timezone_set('Europe/London'); // stop php from whining

$user = preg_replace('/\.mit-license\.org$/', '', $_SERVER["HTTP_HOST"]);

// sanitise user (not for DNS, but for file reading, I don't know
// just in case it's hacked about with or something bananas.
$user = preg_replace('/[^a-z0-9\-]/', '', $user);

$user_file = 'users/'.$user.'.json';

if (file_exists($user_file)) {
	$user_file = file_get_contents($user_file);
	$user = json_decode($user_file);
  $holder = $user->copyright;
  if (property_exists($user, 'url')) {
    $holder = '<a href="'.$user->url.'">' . $holder . '</a>';
  }
} else {
	$holder = "&lt;copyright holders&gt;";
}
?>
<!DOCTYPE html>
<html id="home" lang="en">
<head>
<meta charset=utf-8>
<meta name=viewport content="width=device-width, initial-scale=0.70;">
<!--
Welcome fellow open source developer. This project is here for you to
link to if you're like me and keep forgetting to include the 
MIT-license.txt file.

Fork this project and send a pull request on:

  https://github.com/remy/mit-license

By adding a new JSON file to the users directory, it will yeild an 
MIT License on a CNAME, for example: 

  { "host": "rem", "copyright": "Remy Sharp" }

Means visiting http://rem.mit-license.org shows "Remy Sharp" as the 
copyright holder. Namespaces will be on a first come first serve basis,
and I'm open to folk joining the github project.

Hope you find this useful too!

- @rem

-->
<style>
html { background: #eee; }
body { margin: 0; font-family: monospace; font-size: 1.4em; }
article, footer {
  display: block; margin: 1em auto; min-width: 320px; width: 90%;
}
article { display: block; margin: 1em auto; min-width: 320px; width: 90%; border: 1px solid #ddd; padding: 1em; background: #fff; }
h1 { margin-top: 0; }
p:last-child { margin-bottom: 0; }
footer a { color: #999; font-weight: bold; }
footer a:hover { color: #333; }
</style>
</head>
<body>
<article>
<h1>The MIT License (MIT)</h1>
<p>Copyright (c) <?php echo date('Y') . ' ' . $holder; ?></p>
<p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>

<p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>

<p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
</article>
<footer>
<p><a href="https://github.com/remy/mit-license">Fork this project to create your own MIT license that you can always link to.</a></p>
</footer>
<script>var _gaq=[['_setAccount','UA-1656750-28'],['_trackPageview']];(function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];g.src='//www.google-analytics.com/ga.js';s.parentNode.insertBefore(g,s)})(document,'script')</script>
<body>
</html>
