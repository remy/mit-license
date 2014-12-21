#Self-hosted MIT License

This is a self-hosted version of this project. With this version you can host your MIT License on your own host.

This version is a little bit different from what you have seen. You just have to put this files where you want to have the license.

##Add your data

Inside the assets folder you have a file called "info.json". You should put your info there and you have the following options:

+ **copyright** → Your Name
+ **url** → Your Website
+ **email** → Your Email
+ **gravatar** → True/False
+ **format** → txt/html
+ **licenseUrl** → The URL where the license will be available

Here you don't have the options "theme" nor "version". This is an example "info.json" file:

```json
{
    "copyright": "Henrique Dias",
    "url": "http://henriquedias.com",
    "email": "me@henriquedias.com",
    "gravatar": true,
    "format": "html",
    "licenseUrl": "http://license.henriquedias.com/mit"
}
```

##Changing the theme

You can also change the theme. To do this you just have to replace the file "assets/template.css" with any other you want (you can use any theme that are available in /themes or create a new one).
