#!/usr/bin/env node
import {fzf} from 'fzf-node'
import os from 'node:os';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import shell from 'shelljs';

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
    return console.log(`version='${version}' not found`);
  }

  const links = versions[version][arch + "-" + platform];

  if (!links) {
    return console.log(`${arch + "-" + version} not found`);
  }

  const file_path = await download(links["tarball"]);
  const file_name = path.basename(links["tarball"]);
  const file_dir = path.dirname(file_path);
  console.log(`Extracting ${file_name}`);
  shell.exec(`tar -xf ${file_path} -C ${file_dir}`);

  const zig_dir = path.join(file_dir, file_name.replace(/\.tar\.xz$|\.zip$/, ''));
  console.log(`Moving to ~/.zig`);
  shell.exec(`rm -rf ~/.zig/ && mv ${zig_dir} ~/.zig/ && rm ${file_path}`);

  console.log('Done\nAdd this to your ~/.bashrc');
  console.log('\x1b[36m%s\x1b[0m', '\nexport PATH=$PATH:$HOME/.zig\n');
};

// const install_zls = async () => {
//   shell.exec('rm -rf ~/.zls/', {silent: false});
//   shell.exec('git clone https://github.com/zigtools/zls.git ~/.zls', {silent: false});
//   shell.cd('~/.zls/', {silent: false});
//   shell.echo('zig build -Doptimize=ReleaseSafe');
//   shell.exec('~/.zig/zig build -Doptimize=ReleaseSafe', {silent: false});
// };

const list_versions = async () => {
  const versions = await fetch('https://ziglang.org/download/index.json').then(r => r.json());
  Object.keys(versions).forEach(v => console.log(v));
}


(async () => {
  const [_node_path, _file_path, next = ''] = process.argv;

  let has_fzf = shell.which('fzf');

  if (next == 'help' || next == '--help') {
    return show_help();
  }
  if (next == 'list') {
    return await list_versions();
  }
  // if (next == 'zls') {
  //   return await install_zls();
  // }
  if (!has_fzf && !next) {
    return show_help();
  }
  return await install_zig(next);
})();

function show_help() {
  console.log(`USAGE ↓
   zigx help    # show this message
   zigx list    # list zig versions
   zigx 0.10.1  # install zig v0.10.1
   zigx master  # install zig master version
        
   # Note: fuzzy search is available if "fzf" is installed.
   zigx         # Choose the version to install

  `);
}
