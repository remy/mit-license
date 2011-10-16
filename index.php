<?php
$users = json_decode(file_get_contents('users.json'));
$user = preg_replace('/\.mit-license\.org$/', '', $_SERVER["HTTP_HOST"]);

$holder = "&lt;copyright holders&gt;";
if (property_exists($users, $user)) {
  $holder = $users->$user;
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

By adding a new record to users.json will yeild an MIT License on a 
CNAME, for example: 

  { "rem": "Remy Sharp" }

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
<p>Copyright (c) <?php echo date('Y', time()), ' ', $holder; ?></p>
<p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>

<p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>

<p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
</article>
<footer>
<p><a href="https://github.com/remy/mit-license">Fork this project to create your own MIT license that you can always link to.</a></p>
</footer>
<body>
</html>
