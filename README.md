# SFTP Quick Connect

Open a server's files in FileZilla, WinSCP, Cyberduck or a terminal in one click, with the SFTP address, username and current folder already filled in.

## Features

- **Open in SFTP app** menu on every server's Files page, next to the SFTP login (`username.server@host:port`).
- **Opens the folder you're looking at**, not just the server root.
- **FileZilla**: downloads a site file to add with **File → Import**.
- **WinSCP**: opens WinSCP straight onto the server.
- **Cyberduck**: downloads a bookmark that opens in Cyberduck.
- **Default SFTP app**: an `sftp://` link for any other app.
- **Terminal**: copies an `sftp -P <port> user@host:/folder/` command.
- Passwords are never put in links or files; the app asks for the panel password when it connects.
- Only shown to people with the **SFTP access** permission on the server.

## Settings

Open **Admin → Extensions → SFTP Quick Connect → Settings**.

| Setting | What it does |
|---|---|
| SFTP address | Use this hostname instead of each node's own address, for example `sftp.example.com`. Leave empty to use the node's address. |
| Apps to offer | Which entries appear in the menu. All of them by default. |

## Requirements

- Pterodactyl Panel 2.0 (2.0-develop or later)
- PHP 8.3+

## Install

1. Download `sftp-quick-connect-<version>.pteroext` from the [latest release](https://github.com/Rustix-Development/pterodactyl-sftp-quick-connect/releases/latest).
2. In the panel, open **Admin → Extensions**, upload the file and enable it.
3. Reload the panel.

From a terminal instead:

```sh
php artisan p:extension:install /path/to/sftp-quick-connect-<version>.pteroext --enable
```

## Build from source

```sh
npm install
npm run typecheck
npm test
npm run build
php artisan p:extension:doctor /path/to/sftp-quick-connect
php artisan p:extension:pack /path/to/sftp-quick-connect
```

## Uninstall

Remove it under **Admin → Extensions**, or from a terminal:

```sh
php artisan p:extension:remove sftp-quick-connect
```

## License

MIT. See [LICENSE](LICENSE).

This is a community extension and is not affiliated with or endorsed by Pterodactyl.
