# Commanding

A simple yet practical command-Line application framework, written in TypeScript, with only 2 dependencies (`chalk` and `lodash`).


## Why another CLI framework

`Commanding` has these features:

* Written in TypeScript (easier to development & mantain, nicer to TypeScript developers)
* Less mutable state (long chaining API calls is an old design pattern)
* Decoupled (you can customize it, e.g.: write your own Sanitizer or change output themes)

## Installation

```
$ npm i commanding
```


## Quick Start

If your application only have one command:

```typescript
import { solo, command, sanitize } from 'commanding';

solo(
    command('default')
        .argument('folder', {
            description: 'Output folder',
            required: true,
        })
        .argument('remark', {
        description: 'Something not important',
        })
        .option('-s, --source', {
            name: 'file',
            required: true,
            csv: true,
            description: 'The source files needs to be converted, you can assign multiple sources by `--source=[source1],[source2]`',
        })
        .option('-e', {
            description: 'Enable encryption',
            required: true,
        })
        .option('-c, --compression', {
            name: 'level',
            default: 5,
            description: 'Compression level, default: 5',
        })
        .option('--filter', {
            name: 'preset',
            repeatable: true,
            description: 'You can apply multiple filter on your video by just using `--filter=[preset]` multiple times',
        })
        .handle((args, options) => {
            console.log(args['folder']);
            console.log(options['-s']);
            console.log(options['--source']);
        }),
    // You can provide some infomations about your application
    {
        name: "Cool Application",
        version: '0.0.1',
        description: 'Check this out mate.',
    }
)
    .parse(process.argv);

```

Then you can test your application:

```
$ node app.js -h
```

![Screenshot](github/assets/solo-example.jpg)

If your application has many commands (you can still have a default command):

```typescript
import { gether, command, sanitize } from 'commanding';

gether(
    // Choosable commands:
    [
        command('download')
            .description('Download the content of the URL')
            .argument('URL', {
                description: 'The URL you want to download from',
                required: true,
            })
            .handle((args, options) => {
                // Command logic
            }),
        command('upload')
            .description('Upload content to the URL')
            .argument('URL', {
                description: 'The URL you want to upload to',
                required: true,
            })
            .handle((args, options) => {
                // Command logic
            }),
    ],
    // Default command:
    command('default')
        .handle((args, options) => {
            // Command logic
        }),
    {
        name: "Cool Application",
        version: '0.0.1',
        description: 'Check this out mate.',
    }
)
    .parse(process.argv);

```

## Roadmap

1. [ ] - Better handling for long text
2. [ ] - Bump test coverage to 90%
3. [ ] - Support auto-complete (If it's necessary after assessment)


## Credits

Heavily inspired by [`Caporal`](https://github.com/mattallty/Caporal.js).


## License

[Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
