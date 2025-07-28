# A permalink for your MIT License

I always forget to add a `LICENSE` file to my projects, so I wanted to link to a single resource that would always be up to date and would always have my details online.

Why keep this to myself, there are three ways to create your _own_ MIT license page:

1.  Use the generator tool (easiest)
2.  Make a request to the API (details below)
3.  Fork this project and send a pull request

Now I can always include <https://rem.mit-license.org> in all my projects which links `rem` (the CNAME) against my copyright holder name `Remy Sharp` - all stored in the `users` directory.

## Requesting your own MIT license page

The simplest way to create your own MIT license page is to use the self-service generator found [here](https://richienb.github.io/mit-license-generator).

You can fork this project, send me a pull request and wait for me to pull (which I'll do as quickly as possible) or if the user is still available you can do it yourself from the command line:

```bash
curl -d'{ "copyright": "Remy Sharp" }' https://rem.mit-license.org
```

If the `rem` user isn't taken already, then this will create the new user file on the fly and the URL will be immediately available.

You can send a full JSON file to the API, not _just_ the copyright, so this works too:

```bash
curl -d'{ "copyright": "Remy Sharp", "url": "https://remysharp.com", "email": "me@mysite.com", "format": "txt" }' https://rem.mit-license.org
```

Whilst the command above sends the data as a string which will later be parsed, you can explicitly specify a JSON `Content-Type`:

```bash
curl -H 'Content-Type: application/json' -d'{ "copyright": "Remy Sharp", "url": "https://remysharp.com", "email": "me@mysite.com", "format": "txt" }' https://rem.mit-license.org
```

You can also encode the data as URL query parameters like so:

```bash
curl -X POST "https://rem.mit-license.org/?copyright=Remy%20Sharp&url=http%3A%2F%2Fremysharp.com&email=me%40mysite.com&format=txt"
```

If there are any problems in the automated creation, send me a pull request and it'll go live soon after.

Equally, if you need to update the user file to include more details that you didn't initially include (extra fields in the next section) you will need to send a pull request on that `user.json` file via GitHub.

## The user.json file

The `users` directory contains a list of files, each representing a host on mit-license.org. The minimum requirement for the JSON is that it contains a `copyright` field - everything else is optional. Remember to ensure the `user.json` file is [valid JSON](https://jsonlint.com/).

Available fields:

* copyright (required)
* URL
* email
* format
* gravatar
* theme
* license

### copyright

Create a new file and give it the name of the CNAME you want (in my case it's `rem.json`). This file contains a JSON object containing at least a `copyright` property:

```json
{
  "copyright": "Remy Sharp, https://remysharp.com"
}
```

Means I can now link to <https://rem.mit-license.org> and it will show my license name (note that the date will always show the current year).

You can also use an array to hold multiple copyright holders:

```json
{
  "copyright": ["Remy Sharp", "Richie Bendall"]
}
```

Which will be formatted as:

    Remy Sharp and Richie Bendall

If you additionally want to include a URL and email with each copyright holder, use objects in the array:

```json
{
  "copyright": [
    {
      "name": "Remy Sharp, https://remysharp.com",
      "url": "https://remysharp.com",
      "email": "remy@remysharp.com"
    },
    {
      "name": "Richie Bendall, https://richienb.github.io",
      "url": "https://richienb.github.io",
      "email": "richiebendall@gmail.com"
    }
  ]
}
```

### url

In addition to the `copyright` property, if you want to make a link from the copyright text, you can include a `URL` property:

```json
{
  "copyright": "Remy Sharp, https://remysharp.com",
  "url": "https://remysharp.com"
}
```

### email

You can also include a link to your email which is displayed after the copyright notice using the `email` property (note the `mailto:` is automatically added):

```json
{
  "copyright": "Remy Sharp, https://remysharp.com",
  "url": "https://remysharp.com",
  "email": "me@mysite.com"
}
```

### format

And if you want your license to appear as plain text, just add the `format` property (currently only `txt` and `html` are supported):

```json
{
  "copyright": "Remy Sharp, https://remysharp.com",
  "url": "https://remysharp.com",
  "format": "txt"
}
```

### gravatar

And if you want to show your gravatar, just add the `gravatar` boolean property:

```json
{
  "copyright": "Remy Sharp, https://remysharp.com",
  "url": "https://remysharp.com",
  "email": "me@mysite.com",
  "gravatar": true
}
```

Note that the gravatar option requires the email property. You also need to check the compatibility of the chosen theme.

### Themes

If you've got an eye for design (or like me: not): you can contribute a theme by adding a CSS file to the `themes` directory. You can use the latest CSS technologies since they are automatically polyfilled. The default theme is simple and clean, but you can add your own as you like.

To use a theme, add the `theme` property to your `user.json` file, for example:

```json
{
  "copyright": "Remy Sharp, https://remysharp.com",
  "url": "https://remysharp.com",
  "theme": "flesch"
}
```

<details><summary><h4>Browse custom themes</h4></summary>

* default - [preview](https://mit-license.org) (by
  [@remy](https://github.com/remy),
  [@raphaelbastide](https://github.com/raphaelbastide) &
  [@evertton](https://github.com/evertton))
* flesch - [preview](https://jsbin.com/ufefid/3) (by
  [@flesch](https://github.com/flesch))
* eula-modern - [preview](https://jsbin.com/ExiVida/1/) (by [@sauerlo](https://github.com/lsauer))
* afterdark - [preview](https://jsbin.com/ivufon/4) (by [@rmartindotco](https://github.com/rmartindotco))
* orange - [preview](https://jsbin.com/uzubos/2) (by [@kirbylover4000](https://github.com/kirbylover4000))
* plaintext - [preview](https://jsbin.com/uzubos/4) (by [@barberboy](https://github.com/barberboy))
* double-windsor - [preview](https://jsbin.com/uzubos/5/) (by [@desandro](https://github.com))
* cherry - [preview](https://jsbin.com/ufefid/5/) (by [@mustafa-x](https://github.com/mustafa-x))
* white cherry - [preview](https://jsbin.com/uzezas/2/) (by [@mustafa-x](https://github.com/mustafa-x))
* blackwood - [preview](https://jsbin.com/uzezas/) (by [@mustafa-x](https://github.com/mustafa-x))
* hipster-gray - [preview](https://jsbin.com/ivufon/10) (by [@noformnocontent](https://github.com/noformnocontent))
* xtansia - [preview](https://jsbin.com/ereren/1/) (by [@tomass1996](https://github.com/tomass1996))
* magic-mint - [preview](https://jsbin.com/obibot/1/) (by [@ekhager](https://github.com/ekhager))
* default-dark - [preview](https://jsbin.com/uhagaw/10) (by
  [@remy](https://github.com/remy),
  [@raphaelbastide](https://github.com/raphaelbastide) &
  [@evertton](https://github.com/evertton))
* black-beauty - [preview](https://jsbin.com/dovivu) (by [@evertton](https://github.com/evertton))
* silver-style - [preview](https://jsbin.com/erezijI/2) (by [@dev-dipesh](https://github.com/Dev-Dipesh))
* friendly - [preview](https://jsbin.com/hilula) (by [@evertton](https://github.com/evertton))
* opensans - [preview](https://jsbin.com/UfepUvah) (by [@pburtchaell](https://github.com/pburtchaell))
* solarized - [preview](https://jsbin.com/yimax/1) (by [@anmoljagetia](https://github.com/anmoljagetia))
* willpower - [preview](https://jsbin.com/piheyicoyi/1) (by [@willpowerart](https://github.com/willpowerart))
* rokkitt - [preview](https://jsbin.com/zudayiqeco/1) (by [@luizpicolo](https://github.com/luizpicolo))
* mitserrat - [preview](https://jsbin.com/xeqekutuwe/1) (by [@WouterJanson](https://github.com/WouterJanson))
* material - [preview](https://ahaasler.github.io/mit-license-material-theme/) (by [@ahaasler](https://github.com/ahaasler)). *Available colours: blue gray (default), red, pink, purple, deep purple, indigo, blue, light blue, cyan, teal, green, light green, lime, yellow, amber, orange, deep orange, brown and grey. To use a specific colour, add it as a dash-separated suffix on the theme name, such as `material-deep-orange`.*
* hmt-blue - [preview](https://jsbin.com/naqorar/) (by [@J2TeaM](https://github.com/J2TeaM))
* dusk - [preview](https://output.jsbin.com/giqivoh) (by [@georapbox](https://github.com/georapbox))
* dusk-textured - [preview](https://output.jsbin.com/xakudav) (by [@georapbox](https://github.com/georapbox) and [@robfrawley](https://github.com/robfrawley))
* 8bits - [preview](https://matricali.github.io/mit-license-8bits-theme/) (by [@matricali](https://github.com/matricali)). *Available colours: monochrome, monochrome-white, monochrome-blue-white, monochrome-green, monochrome-amber. To use a specific colour, add it as a dash-separated suffix on the theme name, such as `8bits-monochrome`.*
* hacker - [preview](https://tommy.mit-license.org/) (by [@TommyPujol06](https://github.com/TommyPujol06))
* anon-pro - [preview](https://b.mit-license.org) (by [@bbbrrriiiaaannn](https://github.com/bbbrrriiiaaannn))
* richienb - [preview](https://richienb.github.io/mit-license-richienb-theme/demo) (by [@Richienb](https://github.com/Richienb)). *Dark variant: `richienb-dark` - [preview](https://richienb.github.io/mit-license-richienb-theme/demo-dark).*
* tryhtml - [preview](https://output.jsbin.com/cawihuwuku) (by [@abranhe](https://github.com/abranhe))
* clarity - [preview](https://output.jsbin.com/likezir) (by [@Richienb](https://github.com/Richienb))
* darkblog - [preview](https://chand1012.dev/mit-license/) (by [@chand1012](https://github.com/chand1012))
* ubuntu mono - [preview](https://kuameh.github.io/ubuntu-mono-theme-preview/) (by [@Kuameh](https://github.com/Kuameh))
* purple yam - [preview](https://jade-arinal-banares.github.io/purple-yam-preview-theme/) (by [@Bañares](https://github.com/jade-arinal-banares))
* dark mineral - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-mineral&avatar=true) (by [@axorax](https://github.com/Axorax)) *Available types: [dark sienna mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-sienna-mineral&avatar=true), [dark gold mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-gold-mineral&avatar=true), [dark coral mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-coral-mineral&avatar=true), [dark beige mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-beige-mineral&avatar=true), [dark aquamarine mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-aquamarine-mineral&avatar=true), [dark aliceblue mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-aliceblue-mineral&avatar=true), [dark blue mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-blue-mineral&avatar=true), [dark mineral borderless](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-mineral-borderless&avatar=true), [dark mediumvioletred mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-mediumvioletred-mineral&avatar=true), [dark royalblue mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-royalblue-mineral&avatar=true), [dark tan mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-tan-mineral&avatar=true), [dark tomato mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-tomato-mineral&avatar=true), [dark seagreen mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=dark-seagreen-mineral&avatar=true)
* light mineral - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=light-mineral&avatar=true) (by [@axorax](https://github.com/Axorax)) *Available types: [light coral mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=light-coral-mineral&avatar=true), [light tomato mineral](https://axorax.github.io/mit-license-org-themes/preview?theme=light-tomato-mineral&avatar=true), [light mineral borderless](https://axorax.github.io/mit-license-org-themes/preview?theme=light-mineral-borderless&avatar=true)
* green mineral - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=green-mineral&avatar=true) (by [@axorax](https://github.com/Axorax))
* spicy - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=spicy&avatar=true) (by [@axorax](https://github.com/Axorax)) *Available types: [spicy-light](https://axorax.github.io/mit-license-org-themes/preview?theme=spicy-light&avatar=true)
* github readme - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=github-readme&avatar=true) (by [@axorax](https://github.com/Axorax)) *Available types: [github readme light](https://axorax.github.io/mit-license-org-themes/preview?theme=github-readme-light&avatar=true)
* excess red - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=excess-red&avatar=true) (by [@axorax](https://github.com/Axorax))
* document-dark - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=document-dark&avatar=true) (by [@axorax](https://github.com/Axorax))
* cursive - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=cursive&avatar=true) (by [@axorax](https://github.com/Axorax))
* 3D - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=3D&avatar=true) (by [@axorax](https://github.com/Axorax))
* terminal - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal&avatar=true) (by [@axorax](https://github.com/Axorax)) *Available types: [terminal black and white](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-black-and-white&avatar=true), [terminal black and white reverse](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-black-and-white-reverse&avatar=true), [terminal darkorange](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-darkorange&avatar=true), [terminal firebrick](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-firebrick&avatar=true), [terminal dodgerblue](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-dodgerblue&avatar=true), [terminal darkslateblue](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-darkslateblue&avatar=true), [terminal wheat](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-wheat&avatar=true), [terminal yellow](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-yellow&avatar=true), [terminal fuchsia](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-fuchsia&avatar=true), [terminal olive](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-olive&avatar=true), [terminal pink gradient](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-pink-gradient&avatar=true), [terminal blue gradient](https://axorax.github.io/mit-license-org-themes/preview?theme=terminal-blue-gradient&avatar=true)
* zebra - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=zebra&avatar=true) (by [@axorax](https://github.com/Axorax))
* purple gradient - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=purple-gradient&avatar=true) (by [@axorax](https://github.com/Axorax))
* rainbow - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=rainbow&avatar=true) (by [@axorax](https://github.com/Axorax))
* unity - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=unity&avatar=true) (by [@axorax](https://github.com/Axorax)) *Available types: [unity lights on](https://axorax.github.io/mit-license-org-themes/preview?theme=unity-lights-on&avatar=true)
* isolate - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=isolate&avatar=true) (by [@axorax](https://github.com/Axorax))
* united colors - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=united-colors&avatar=true) (by [@axorax](https://github.com/Axorax))
* official document - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=official-document&avatar=true) (by [@axorax](https://github.com/Axorax)) *Available Types: [official document roboto](https://axorax.github.io/mit-license-org-themes/preview?theme=official-document-roboto&avatar=true)
* circle - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=circle&avatar=true) (by [@axorax](https://github.com/Axorax))
* riri - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=riri&avatar=true) (by [@axorax](https://github.com/Axorax))
* midnight - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=midnight&avatar=true) (by [@axorax](https://github.com/Axorax))
* boat - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=boat&avatar=true) (by [@axorax](https://github.com/Axorax))
* browser code - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=browser-code&avatar=true) (by [@axorax](https://github.com/Axorax))
* vex red - [preview](https://axorax.github.io/mit-license-org-themes/preview?theme=vex-red&avatar=true) (by [@axorax](https://github.com/Axorax)) *Available Types: [vex blue](https://axorax.github.io/mit-license-org-themes/preview?theme=vex-blue&avatar=true)

</details>

## Formats & URLs

The following types of requests can be made to this project:

* <https://rem.mit-license.org/> HTML, or the default format specified in
    the json file (currently none specified on `rem`)
* <https://rem.mit-license.org/license.html> HTML
* <https://rem.mit-license.org/license.txt> Text

The URL also supports including a start year:

* <https://rem.mit-license.org/2009/> will
    show a license year range of 2009-2016 (2016 being the current year)
* <https://rem.mit-license.org/2009-2010>
    allows me to force the year range
* <https://rem.mit-license.org/2009-2010/license.txt> year range of 2009-2010 in plain text

You can also specify either the `MIT` or `ISC` license in the URL:

* <https://rem.mit-license.org/+MIT> will
    show the MIT License (default)
* <https://rem.mit-license.org/+ISC>
    shows the ISC license instead

Finally, the URL also supports pinning the year

* <https://rem.mit-license.org/@2009>
    this is useful for when your software copyright should expire ([as discussed here](https://github.com/remy/mit-license/issues/771))

## Ways to contribute

Aside from code contributions that make the project better, there are a few other specific ways that you can contribute to this project.

Development contributions from:

* [remy](https://github.com/remy)
* [batuhanicoz](https://github.com/batuhanicoz)
* [georgebashi](https://github.com/georgebashi)
* [mathiasbynens](https://github.com/mathiasbynens)
* [evertton](https://github.com/evertton)
* [Richienb](https://github.com/Richienb)

**SSL and wildcard DNS is supported by [CloudFlare](https://www.cloudflare.com) - thank you 🙏💙**

### 1. Donate domain years

I host the domain with namecheap.com and yearly renewal is $9.69 per year. If you want to contribute a year, send me a message and I'll add the years on.

Of course, I'll do my best to continue running the domain and hosting, but this is your chance to contribute to the community project.

Domain contributions:

* [remy](https://github.com/remy) - 2011-2012
* [barberboy](https://github.com/barberboy) - 2012-2013
* [paulirish](https://github.com/paulirish) - 2013-2014
* [batuhanicoz](https://github.com/batuhanicoz) - 2014-2015
* [buritica](https://github.com/buritica) - 2015-2016
* [adamstrawson](https://github.com/adamstrawson) - 2016-2018 (2 years)
* [keithamus](https://github.com/keithamus) - 2018-2026 (8 years)
* [pmuellr](https://github.com/pmuellr) - 2026-2027
* [danielknell](https://github.com/danielknell) - 2027-2029 (2 years)
* [barberboy](https://github.com/barberboy) - 2029-2030
* [mostly-magic](https://github.com/mostly-magic) - 2030-2032

_Please note that the whois says 2021 as you can only have 10 active registered years with ICANN - but the domain is set to auto-renew, so it's all good :)_

### 2. Hosting

For the first 5 years, mit-license.org was hosted on my own dedicated server, but I've now moved to Heroku and am paying a monthly fee. If you would like to donate **[please donate here](https://www.paypal.me/rem)** include a message and I will add your name to the credit. Hosting currently costs $7 per month if you want to donate in months or years, it's gratefully received ❤

Hosting contributions:

* [remy](https://github.com/remy) - 2011-2016 Apr...
* [therebelrobot](https://github.com/therebelrobot) 1 month
* [mkody](https://github.com/mkody) 2 months
* [dan9186](https://github.com/dan9186) 1 year
* Kristin Anthony 1 year
* [zhengyi-yang](https://github.com/zhengyi-yang) 5 months
* [catodd](https://github.com/catodd) 2 months
* [lrz0](https://github.com/lrz0) 1 month
* [matricali](https://github.com/matricali) 3 months
* [youchenlee](https://github.com/youchenlee) 12 months
* [ramsey](https://github.com/ramsey) 12 months
* [rmm5t](https://github.com/rmm5t) 1 month
* [wrainaud](https://github.com/wrainaud) 3 months
* [romkey](https://github.com/romkey) 12 months
* [kylewelsby](https://github.com/kylewelsby) 6 months
* [wiesner](https://github.com/wiesner) 1 month
* [rajinwonderland](https://github.com/rajinwonderland) 3 months
* [miszo](https://github.com/miszo) 1 month
* [Bisa](https://github.com/Bisa) 3 months
* [you?](https://www.paypal.me/rem)

### 3. A lick of paint

I'm a developer, I seem only capable of _grey_! If you're a designer and want to contribute a decent lick of paint on the project that would be super. Just create a new theme and send me a pull request.

## License

And of course:

MIT: <https://rem.mit-license.org>
