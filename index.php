<?php

date_default_timezone_set('Europe/London'); // stop php from whining

function get_cname_and_user()
{
    static $user_info = null;

    if ($user_info === null) {
        // use a match instead of preg_replace to ensure we got the cname
        preg_match('/^([a-z0-9\-]+)\.mit-license\..*$/', $_SERVER['HTTP_HOST'], $match);

        $user_info[] = count($match) == 2 ? $match[1] : '';
        $user_info[] = 'users/'.$user_info[0].'.json';
    }

    return $user_info;
}

function get_license_path($name)
{
    $name = $name ?: 'MIT';

    return 'licenses/'.strtoupper($name).'.html';
}

function send_response_error_json($error, $status = 'HTTP/1.1 422 Unprocessable Entity')
{
    header($status);
    header('Content-Type: text/json', true);

    echo json_encode(['errors' => [$error]]);
    exit;
}

function send_response_json($message)
{
    header('HTTP/1.1 201 Created');
    header('Content-Type: text/json', true);

    echo json_encode(['success' => [$message]]);
    exit;
}

function read_http_post()
{
    if (null === ($data = json_decode(file_get_contents('php://input')))) {
        send_response_error_json('JSON could not be parsed');
    }

    if (!property_exists($data, 'copyright') || empty($data->copyright)) {
        send_response_error_json('JSON requires "copyright" property and value');
    }

    list($cname, $user_file) = get_cname_and_user();

    if (file_exists($user_file)) {
        send_response_error_json('User already exists - to update values, please send a pull request on https://github.com/remy/mit-license');
    }

    if (!file_put_contents($user_file, json_encode($data))) {
        send_response_error_json('Unable to create new user - please send a pull request on https://github.com/remy/mit-license');
    }

    $web_root = escapeshellarg(dirname(__FILE__));
    $user_file = escapeshellarg($user_file);
    $commands = [
        sprintf('cd %s && /usr/bin/git add %s', $web_root, $user_file),
        sprintf('cd %s && /usr/bin/git commit -m"automated creation of %s"', $web_root, $user_file),
        sprintf('cd %s && /usr/bin/git push origin master -v 2>&1', $web_root),
    ];

    foreach ($commands as $c) {
        exec($c, $out, $return);

        if ($return != 0) {
            file_put_contents($web_root.DIRECTORY_SEPARATOR.'git-errors.log', var_export($out, true));
            send_response_error_json('Unable to create new user - please send a pull request on https://github.com/remy/mit-license');
        }
    }

    send_response_json('MIT license page created: https://'.$cname.'.mit-license.org');
}

list($cname, $user_file) = get_cname_and_user();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $cname) {
    read_http_post();
    exit;
}

$format = 'html';
$theme = 'default';
$gravatar = '';

list($cname, $user_file) = get_cname_and_user();

/*
 * Load up the user.json file and read properties in
 **/
if ($cname && file_exists($user_file)) {
    $user = json_decode(file_get_contents($user_file));

    // move old-format usernames and emails into new-format array
    if (!is_array($user->copyright)) {
        $person = new \stdClass();
        $person->name = $user->copyright;

        if (property_exists($user, 'email')) {
            $person->email = $user->email;
        }

        if (property_exists($user, 'url')) {
            $person->url = $user->url;
        }

        if (property_exists($user, 'gravatar')) {
            $person->gravatar = $user->gravatar;
        }

        $user->copyright = [$person];
    }

    $holders = [];
    $gravatar = null;
    foreach ($user->copyright as $c) {
        $person = htmlentities($c->name, ENT_COMPAT | ENT_HTML401, 'UTF-8');

        if (property_exists($c, 'url')) {
            $person = '<a href="'.$c->url.'">'.$person.'</a>';
        }

        if (property_exists($c, 'email')) {
            $person = $person.' &lt;<a href="mailto:'.$c->email.'">'.$c->email.'</a>&gt;';
        }

        if ($gravatar === null && property_exists($c, 'gravatar')) {
            if ($c->gravatar === true && property_exists($c, 'email')) {
                $gravatar = $c->email;
            } elseif ($c->gravatar !== false) {
                $gravatar = $c->gravatar;
            }
        }

        $holders[] = $person;
    }

    $holder = implode($holders, ", ");

    if ($gravatar !== null) {
        $gravatar = '<img id="gravatar" src="http://www.gravatar.com/avatar/'.md5(strtolower(trim($gravatar))).'"/>';
    }

    if (property_exists($user, 'format') && strtolower($user->format) == 'txt') {
        $format = 'txt';
    }

    if (property_exists($user, 'theme') && file_exists('themes/'.$user->theme.'.css')) {
        $theme = $user->theme;
    }
} else {
    $holder = '&lt;copyright holders&gt;';
}

/*
 * Now process the request url. Optional parts of the url are (in order):
 * [sha]/[year|year-range]/license.[format]
 * eg. http://rem.mit-license.org/a526bf7ad1/2009-2010/license.txt
 **/

$request_uri = explode('/', $_SERVER['REQUEST_URI']);

// url file format overrides user preference
foreach ($request_uri as $r) {
    if (stripos($r, 'license') === 0 && pathinfo($r, PATHINFO_EXTENSION) === 'txt') {
        $format = 'txt';
    }
};

$year = date('Y');
foreach ($request_uri as $r) {
    preg_match('/^(@?)(\d{4})(\-)?(\d{4})?$/', $r, $match);

    if (count($match) === 3) {
        $year = $match[2];
    } elseif (count($match) === 4) {
        $year = $match[2] == $year ? $match[2] : $match[2] . '-' . $year;
    } elseif (count($match) === 5) {
        $year = $match[2] . '-' . $match[4];
    }
}

$sha = '';
foreach ($request_uri as $r) {
    preg_match('/^([a-f0-9]{7,})$/', $r, $match);

    if (isset($match[1])) {
        $sha = $match[1];
    }
}

if (empty($sha) && isset($user) && property_exists($user, 'version')) {
    $sha = preg_replace('/[^a-f0-9]/', '', $user->version);
}

$license_type = null;
foreach ($request_uri as $r) {
    preg_match('/^\+([A-Z]+)$/', $r, $match);

    if (isset($match[1]) && file_exists(get_license_path($match[1]))) {
        $license_type = $match[1];
    }
}

if (null === $license_type && isset($user) && property_exists($user, 'license') && file_exists(get_license_path($user->license))) {
    $license_type = $user->license;
}

// if sha specified, use that revision of licence
$license = '';
if ($sha != '') {
    exec(sprintf('/usr/local/bin/git show %s:licenses/%s', escapeshellarg($sha), get_license_path($license_type)), $out, $return);

    if ($return == 0) {
        $license = implode("\n", $out);
    }
}

if (empty($license)) {
    $license = file_get_contents(get_license_path($license_type));
}

// replace info tag and display
$info = $year.' '.$holder;
$license = str_replace('{{info}}', $info, $license);
$license = str_replace('{{theme}}', $theme, $license);
$license = str_replace('{{gravatar}}', $gravatar, $license);

// if we want text format, strip out the license from the article tag
// and then strip any other tags in the license.
if ($format == 'txt') {
    $license = array_shift(explode('</article>', array_pop(explode('<article>', $license))));
    $license = preg_replace('/<[^>]*>/', '', trim($license));
    $license = html_entity_decode($license, ENT_COMPAT | ENT_HTML401, 'UTF-8');
    $license .= "\n";
    header('content-type: text/plain; charset=UTF-8');
}

echo $license;
