# A permalink for your MIT License

I always forget to add an MIT-license.txt file to my projects, so I
wanted to link to a single resource that would always be up to date and
would always have my details online.

But why keep this to myself, so it's on github for your fork and pulling
pleasure.

Now I can always include http://rem.mit-license.org in all my projects
which links `rem` (the cname) against my copyright holder name `Remy
Sharp` - all stored in the `users` directory.

## Example

The `users` directory contains a list of files, each representing a host
on mit-license.org. As present the file format is very simple, but can
be upgraded in future.

Create a new file and give it the name of the CNAME you want (in my case
it's `rem.json`). This file contains a JSON object containing at least a
`copyright` property:

    {
      "copyright": "Remy Sharp, http://remysharp.com"
    }

Means I can now link to: http://rem.mit-license.org and it will show my
license name (note that the date will always show the current year).

In addition to the `copyright` property, if you want to make a link from
the copyright text, you can include a `url` property:

    {
      "copyright": "Remy Sharp, http://remysharp.com",
      "url": "http://remysharp.com"
    }

And if you want your license to appear as plain text, just add the
`format` property (currently only `txt` and `html` are supported):

    {
      "copyright": "Remy Sharp, http://remysharp.com",
      "url": "http://remysharp.com",
      "format": "txt"
    }

Finally you can also include a license version target in the JSON file
as explained in the next section.

## License version targeting

License version targeting allows you to link your MIT license to a
specific revision in this project - therefore fixing it permanently to
a specific license text.

Though I don't expect the license text to change ever, this is just some
extra assurance for you.

Targeting requires the [sha from the license commit](https://github.com/remy/mit-license/commits/master/LICENSE.html). This can be
specified on the URL (in your permalink) or in the JSON file.

For example: http://rem.mit-license.org/a526bf7ad1 (make sure to view-source) shows an older version of comments inline to the HTML document (compared to the [latest version](http://rem.mit-license.org)).

This can also be targeted in my JSON file:

    {
      "copyright": "Remy Sharp, http://remysharp.com",
      "url": "http://remysharp.com",
      "version": "a526rbf7"
    }

Note that if no version is supplied, the latest copy of the LICENSE.html
will be displayed with your information included.

## Ways to contribute

Aside from code contributions that make the project better, there are a
few other specific ways that you can contribute to this project.

Development contributions from:

* [remy](http://github.com/remy)
* [batuhanicoz](http://github.com/batuhanicoz)
* [georgebashi](http://github.com/georgebashi)
* [mathiasbynens](http://github.com/mathiasbynens)

### 1. Donate domain years

I host the domain with namecheap.com and yearly renewal is $9.69 per
year. If you want to contribute a year, send me a message and I'll add
the years on.

Of course I'll do my best to continue running the domain and hosting,
but this is your change to contribute to the community project.

Domain contributions:

* [remy](http://github.com/remy) - 2011-2012
* [barberboy](http://github.com/barberboy) - 2012-2013

### 2. Hosting

Currently the project is hosted on my own server, and I don't expect my
server to go away any time soon, but if a lovely hosting company, like
Joyent or Media Temple or someone equally as lovely wants to step in and
contribute a simple server to host from - then we'll credit you
appropriately and you'll get lots of kudos from the web community for
being lovely.

### 3. A lick of paint

I'm a developer, I seem only capable of *grey*! If you're a designer and
want to contribute a decent lick of paint on the project that would be
super. Obviously the content should remain to the point and simple, but
I'm sure it could be tightened or sharpened. 

Drop me a messsage with any idea you've got (or even just a bit of CSS)
and we'll get it live.

## License

And of course:

MIT: http://rem.mit-license.org
