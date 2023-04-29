# zigx

zigx is a command-line tool to manage the zig version on your system. It allows you to install and switch between different versions of zig easily.

## Installation

To install zigx, you need to have `tar` installed on your system. Then, run the following command:

```bash
npm install -g zigx
```

This will add the zigx command to your `PATH`.

## Usage

To use zigx, you can run the following commands:

- `zigx help`: Show a help message with the available commands.
- `zigx list`: List the avialable zig versions.
- `zigx 0.10.1`: Install and switch to zig v0.10.1. You can specify any valid zig version number or `master` for the latest development version.
- `zigx`: If you have [fzf](https://github.com/junegunn/fzf) installed, you can use it to choose the version to install from a fuzzy search menu.

## Examples

Here are some examples of using zigx:

```bash
$ zigx help
USAGE ↓
   zigx help    # show this message
   zigx list    # list zig versions
   zigx 0.10.1  # install zig v0.10.1
   zigx master  # install zig master version

   # Note: fuzzy search is available if "fzf" is installed.
   zigx         # Choose the version to install

   
$ zigx list
master
0.10.1
0.10.0
...


$ zigx master
Downloading https://ziglang.org/builds/zig-macos-aarch64-0.11.0-dev.2834+13101295b.tar.xz
Extracting zig-macos-aarch64-0.11.0-dev.2834+13101295b.tar.xz
Moving to ~/.zig
Done
Add this to your ~/.bashrc

export PATH=$PATH:$HOME/.zig


$ zig version
0.11.0-dev.2834+13101295b


$ zigx 0.9.0
Downloading https://ziglang.org/download/0.9.0/zig-macos-aarch64-0.9.0.tar.xz
Extracting zig-macos-aarch64-0.9.0.tar.xz
Moving to ~/.zig
Done
Add this to your ~/.bashrc

export PATH=$PATH:$HOME/.zig


$ zig version
0.9.0

$ zigx
>  master
   0.10.1
   0.9.0
   0.8.1
   0.7.1
   0.6.0
   0.5.0
   0.4.0
```

## Building zls from source
If you install the master version of zig using zigx, it will also build the Zig
Language Server (`zls`) from source. This can be done by running the `zigx master`
command, as shown in the example below:

```bash
$ zigx master
Downloading https://ziglang.org/builds/zig-macos-aarch64-0.11.0-dev.2868+1a455b2dd.tar.xz
Extracting zig-macos-aarch64-0.11.0-dev.2868+1a455b2dd.tar.xz
Moving to ~/.zig
Building zls from source
 git clone https://github.com/zigtools/zls.git ~/.zls
 ~/.zig/zig build -Doptimize=ReleaseSaf
 please wait ...
 cp -f ./zig-out/bin/zls ~/.zig/
Done
Add this to your ~/.bashrc

export PATH=$PATH:$HOME/.zig
```

When you run zigx master, the tool will download and install the latest
development version of Zig, and then proceed to build the zls from source. The
source code for the zls will be cloned from the `zigtools/zls` repository to the
`~/.zls` directory, and then compiled using the `~/.zig/zig` binary. Once the build
process is complete, the resulting `zls` binary will be copied to `~/.zig/`, and
the `~/.zls` folder will be removed.

Don't forget to add the following line to your `~/.bashrc`:
This will allow you to use the zls with any editor or IDE that supports the
Language Server Protocol (LSP).
```bash
export PATH=$PATH:$HOME/.zig
```
Note that building zls from source may take some time, depending on your
system's configuration and the speed of your internet connection.
