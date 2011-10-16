# A permalink for your MIT License

I always forget to add an MIT-license.txt file to my projects, so I
wanted to link to a single resource that would always be up to date and
would always have my details online.

But why keep this to myself, so it's on github for your fork and pulling
pleasure.

Now I can always include http://rem.mit-license.org in all my projects
which links `rem` (the cname) against my copyright holder name `Remy
Sharp` - all stored in the `users` directory.

# Example

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

# License

MIT: http://rem.mit-license.org
