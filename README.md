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

For example: [source of http://rem.mit-license.org/a526bf7ad1](view-source:http://rem.mit-license.org/a526bf7ad1) shows an older version of comments inline to the HTML document (compared to the [latest version](view-source:http://rem.mit-license.org)).

This can also be targeted in my JSON file:

    {
      "copyright": "Remy Sharp, http://remysharp.com",
      "url": "http://remysharp.com",
      "version": "a526rbf7"
    }

Note that if no version is supplied, the latest copy of the LICENSE.html
will be displayed with your information included.

## License

MIT: http://rem.mit-license.org
