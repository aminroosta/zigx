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

# zls
