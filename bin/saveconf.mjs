#!/usr/bin/env node

import fs from 'fs'
import merge from 'lodash/merge.js'
import path from 'path'
import { normalize } from './normalize.mjs'

export const saveconf = async (src, sav, typ, nam) => {
  const tconf = await normalize(sav);
  let mrg = {
    [typ]: {
      [nam]: src
    }
  }
  if (typ === "root") {
    mrg = src
  } else if (Array.isArray(tconf[typ])) {
    tconf[typ] = {};
  }
  const fconf = merge(tconf, mrg);
  fs.writeFileSync(path.resolve(sav), JSON.stringify(fconf));
  return fconf;
}