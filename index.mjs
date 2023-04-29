#!/usr/bin/env node
import {fzf} from 'fzf-node'
import os from 'node:os';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import shell from 'shelljs';
import {satisfies} from 'compare-versions';

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

  if (version == 'master') {
    install_zls();
  }

  console.log('Done\nAdd this to your ~/.bashrc');
  console.log('\x1b[36m%s\x1b[0m', '\nexport PATH=$PATH:$HOME/.zig\n');
};

const install_zls = async () => {
  console.log(`Building zls from source`);
  shell.exec('rm -rf ~/.zls/');

  console.log(' git clone https://github.com/zigtools/zls.git ~/.zls');
  shell.exec('git clone https://github.com/zigtools/zls.git ~/.zls', {silent: true});

  shell.cd('~/.zls/');

  const commits = shell.exec('git log --oneline -- build.zig', {silent: true})
    .stdout
    .split('\n')
    .filter(line => line)
    .map(l => l.split(' ')[0]);

  const zig_version = shell.exec('~/.zig/zig version', {silent: true})
    .stdout
    .trim();

  // get min zig version from zls/build.zig,
  // example: 0.10.0-dev.4458+b120c819d
  while (true) {
    const min_version = shell.exec('cat build.zig', {silent: true})
      .stdout
      .split('\n')
      .filter(l => l.includes('std.SemanticVersion.parse'))
    [0].split('"')[1];

    const [zig_major, zig_minor] = zig_version.split(/-dev\.|\+/);
    const [min_major, min_minor] = min_version.split(/-dev\.|\+/);
    const version_is_ok = satisfies(zig_major, '>=' + min_major) &&
      (zig_minor * 1) >= (min_minor * 1);

    if (!version_is_ok) {
      const commit = commits.shift();
      console.log(" git checkout " + commit);
      shell.exec("git checkout " + commit, {silent: true});
      continue;
    }
    break;
  }
  console.log(' ~/.zig/zig build -Doptimize=ReleaseSaf');
  console.log(' please wait ...');
  shell.exec('~/.zig/zig build -Doptimize=ReleaseSafe', {silent: true});

  console.log(' cp -f ./zig-out/bin/zls ~/.zig/');
  shell.exec('cp -f ./zig-out/bin/zls ~/.zig/');

  shell.cd('-');
  shell.exec('rm -rf ~/.zls/');
};

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
