#!/usr/bin/env node

import fs from 'fs'
import { ensureFileSync } from 'fs-extra'
import Handlebars from "handlebars"
import path from 'path'
import stream from 'stream'
import util from 'util'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { inquire } from './inquire.mjs'
import { normalize } from './normalize.mjs'
import { saveconf } from './saveconf.mjs'

const pipeline = util.promisify(stream.pipeline);

const argv = yargs(hideBin(process.argv))
  .usage('Usage: npx @tisf/hb <src> [dst] [path] [options]')
  .command('$0 <src> [dst] [path]', 't', (yargs) => {
    yargs.positional('src', {
      describe: 'Url or path of data',
      type: 'string'
    })
    yargs.positional('dst', {
      describe: 'Url or path of template',
      type: 'string'
    })
    yargs.positional('path', {
      describe: 'Path to download file to',
      type: 'string'
    })
  })
  .options({
    t: {
      default: 'features',
      describe: 'Tisf group (default: features)',
      type: 'string'
    },
    n: {
      describe: 'Tisf name',
      type: 'string'
    },
    s: {
      default: 'tisf.json',
      describe: 'Save Tisf config',
      type: 'string'
    },
    p: {
      describe: 'Is src list of prompts (default: false)',
      type: 'boolean'
    },
    l: {
      describe: 'Is src list of files (default: false)',
      type: 'boolean'
    }
  })
  .help('h')
  .demandCommand(1)
  .parse();

const dance = async (src, dst, pth) => {

  const typ = argv.t;
  const nam = argv.n;
  const sav = argv.s;

  if (sav) {
    await saveconf(src, sav, typ, nam);
  }

  console.log(src);

  if(dst) {
    const template = Handlebars.compile(dst);
    const output = template(src);
    const filename = argv.path ? path.resolve(argv.path) : path.resolve(pth);
    ensureFileSync(filename);
    await pipeline(output, fs.createWriteStream(filename));  
  }
};

(async () => {

  let src = await normalize(argv.src);
  const typ = argv.t;
  const nam = argv.n;
  const prp = argv.p;
  const lst = argv.l;

  if (prp) {
    src = await inquire(src.prompts);
  } else {
    if (typ === "root") {
      if (nam) {
        src = src?.[nam] || {};
      }
    } else {
      src = src?.[typ]?.[nam] || {};
    }
  }

  if (lst) {
    const dst = await normalize(argv.dst);
    for (const x of dst.files) {
      const second = await normalize(x[0], null);
      const third = path.resolve(x[1] || "");
      await dance(src, second, third);
    }
  } else {
    let dst;
    if(argv.dst) {
      dst = await normalize(argv.dst, null);
    }
    const pth = path.resolve(argv.path || "");
    await dance(src, dst, pth)
  }
})();
