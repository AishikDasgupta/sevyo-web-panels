/**
 * exFAT compatibility shim.
 *
 * On exFAT volumes the Windows driver returns EISDIR (instead of NTFS/POSIX's
 * EINVAL) for fs.readlink on regular files. Webpack/enhanced-resolve/watchpack
 * call readlink speculatively while resolving modules; they treat EINVAL
 * (and friends) as "not a symlink", but unexpected codes like EISDIR as fatal.
 *
 * This shim normalizes the bogus codes to EINVAL so every consumer follows
 * its standard "not a symlink" code path. Loaded via next.config.mjs (main
 * process) and -r in build/dev/start scripts (worker processes).
 */
'use strict';

const fs = require('node:fs');

const BOGUS = new Set(['EISDIR', 'UNKNOWN', 'EPERM']);

function normalize(err) {
  if (err && BOGUS.has(err.code)) {
    const einval = new Error(`readlink ${err.path || ''}: invalid argument`);
    einval.code = 'EINVAL';
    einval.errno = -22;
    einval.syscall = 'readlink';
    einval.path = err.path;
    return einval;
  }
  return err;
}

if (!fs.__exfatPatched) {
  const origReadlink = fs.readlink;
  const origReadlinkSync = fs.readlinkSync;

  fs.readlink = function (p, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    if (typeof callback !== 'function') {
      // Promise form
      return new Promise((resolve, reject) => {
        origReadlink.call(fs, p, options ?? undefined, (err, linkString) => {
          if (err) reject(normalize(err));
          else resolve(linkString);
        });
      });
    }
    origReadlink.call(fs, p, options ?? undefined, (err, linkString) => {
      if (err) callback(normalize(err));
      else callback(null, linkString);
    });
  };

  fs.readlinkSync = function (p, options) {
    try {
      return origReadlinkSync.call(fs, p, options);
    } catch (err) {
      throw normalize(err);
    }
  };

  if (fs.promises && typeof fs.promises.readlink === 'function') {
    const origPromReadlink = fs.promises.readlink.bind(fs.promises);
    fs.promises.readlink = async (p, options) => {
      try {
        return await origPromReadlink(p, options);
      } catch (err) {
        throw normalize(err);
      }
    };
  }

  Object.defineProperty(fs, '__exfatPatched', { value: true });
}