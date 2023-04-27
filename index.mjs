#!/usr/bin/env node
import {fzf} from 'fzf-node'
import {execSync} from 'child_process';
import os from 'node:os';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const download = (url) => {
  console.log(`Downloading ${url}`);
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const file_name = (Math.random() + 1).toString(36).substring(7);
      const file_path = `${os.tmpdir()}/${file_name}`;
      const wstream = fs.createWriteStream(file_path);
      let resolved = false;
      res.pipe(wstream);
      wstream.on('finish', () => {
        wstream.close();
        resolved = true;
        resolve(file_path);
      });
      wstream.on("exit", () => {
        if (!resolved) {
          console.log(`Failed to download ${url}`);
          reject();
        }
      });
    })
  });
}

const shell = cmd => execSync(cmd, {encoding: 'utf8'});

const install_zig = async (version) => {
  const versions = await fetch('https://ziglang.org/download/index.json').then(r => r.json());
  if (version === '') {
    version = await fzf(Object.keys(versions), [])
  }

  const platform = {
    'darwin': 'macos',
    'linux': 'linux',
    'win32': 'windows',
  }[os.platform()];

  if (!platform) {
    return console.log(`platform = ${os.platform()} is not supported`);
  }

  const arch = {
    'arm64': 'aarch64',
    'ppc': 'powerpc',
    'ppc64': 'powerpc64le',
    'x64': 'x86_64'
  }[os.arch()];

  if (!arch) {
    return console.log(`arch = ${os.arch()} is not supported`);
  }

  if (!versions[version]) {
    return console.log(`version = ${version} not found`);
  }

  const links = versions[version][arch + "-" + platform];

  if (!links) {
    return console.log(`${arch + "-" + version} not found`);
  }

  const file_path = await download(links["tarball"]);
  const file_name = path.basename(links["tarball"]);
  const file_dir = path.dirname(file_path);
  console.log(`Extracting ${file_name}`);
  shell(`tar -xf ${file_path} -C ${file_dir}`);

  const zig_dir = path.join(file_dir, file_name.replace(/\.tar\.xz$|\.zip$/, ''));
  console.log(`Moving to ~/.zig`);
  shell(`rm -rf ~/.zig/ && mv ${zig_dir} ~/.zig/ && rm ${file_path}`);

  console.log('Done\nAdd this to your ~/.bashrc');
  console.log('\x1b[36m%s\x1b[0m', '\nexport PATH=$PATH:$HOME/.zig\n');
};

const install_zls = async (version) => {
};


(async () => {
  const [_node_path, _file_path, next = '', version = ''] = process.argv;

  let has_fzf = true;
  try {shell(`which fzf`)} catch (error) {has_fzf = false;}

  if (next == 'help' || next == '--help') {
    show_help();
  } else if (!has_fzf) {
    if (next === "zig" && version) {
      install_zig(version);
    } else if (next == "zls" && version) {
      install_zls(version);
    } else {
      show_help();
    }
  } else {
    const next_ = next || await fzf(["zig", "zls"], [])
    if (next_ === "zig") {
      install_zig(version);
    } else {
      install_zls(version);
    }
  }
})();

function show_help() {
  console.log(`USAGE ↓
   zigx help        # show this message
   zigx zig master  # install zig master version
   zigx zls master  # build zls from the master
        
   # Note: fuzzy search is available if "fzf" is installed.
   zigx zig         # Choose a zig version to install
   zigx zls         # Choose a pre-built zls version
   zigx             # Choose what to install

  `);
}
