export type AppId = 'filezilla' | 'winscp' | 'cyberduck' | 'link' | 'command';

export const APP_IDS: readonly AppId[] = ['filezilla', 'winscp', 'cyberduck', 'link', 'command'];

export interface SftpTarget {
    /** Shown as the bookmark name in the SFTP app. */
    name: string;
    host: string;
    port: number;
    username: string;
    /** Folder inside the server, starting with "/". */
    directory: string;
}

/** Wraps a bare IPv6 address in brackets so it can sit in front of ":port". */
export const hostForUrl = (host: string): string =>
    host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;

const segments = (directory: string): string[] => directory.split('/').filter(Boolean);

const urlPath = (directory: string): string => {
    const parts = segments(directory).map(encodeURIComponent);

    return parts.length ? `/${parts.join('/')}/` : '/';
};

const xml = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** sftp://user@host:port/folder/ which opens in whatever app handles sftp links. */
export const sftpLink = (t: SftpTarget): string =>
    `sftp://${encodeURIComponent(t.username)}@${hostForUrl(t.host)}:${t.port}${urlPath(t.directory)}`;

/** WinSCP registers winscp-sftp:// when it is installed. */
export const winscpLink = (t: SftpTarget): string => `winscp-${sftpLink(t)}`;

/** One command for OpenSSH's sftp client, opening in the current folder. */
export const sftpCommand = (t: SftpTarget): string => {
    const path = segments(t.directory).join('/');
    const target = `${t.username}@${hostForUrl(t.host)}${path ? `:/${path}/` : ''}`;

    return `sftp -P ${t.port} ${/^[\w.@:/[\]-]+$/.test(target) ? target : `'${target.replace(/'/g, `'\\''`)}'`}`;
};

/**
 * A FileZilla Site Manager export (File > Import). The password is left out,
 * so FileZilla asks for it when connecting.
 */
export const fileZillaSite = (t: SftpTarget): string => {
    const parts = segments(t.directory);
    // FileZilla stores folders as "1 0 <length> <name> ...": Unix server type, no prefix.
    const remote = parts.length ? `\n            <RemoteDir>${xml(['1', '0', ...parts.flatMap((p) => [String(p.length), p])].join(' '))}</RemoteDir>` : '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<FileZilla3 version="3.60.0">
    <Servers>
        <Server>
            <Host>${xml(t.host)}</Host>
            <Port>${t.port}</Port>
            <Protocol>1</Protocol>
            <Type>0</Type>
            <User>${xml(t.username)}</User>
            <Logontype>2</Logontype>
            <EncodingType>Auto</EncodingType>
            <BypassProxy>0</BypassProxy>
            <Name>${xml(t.name)}</Name>${remote}
            <SyncBrowsing>0</SyncBrowsing>
            <DirectoryComparison>0</DirectoryComparison>
        </Server>
    </Servers>
</FileZilla3>
`;
};

/** A Cyberduck bookmark. Opening the file adds it to Cyberduck and connects. */
export const cyberduckBookmark = (t: SftpTarget): string => {
    const entries: [string, string][] = [
        ['Protocol', 'sftp'],
        ['Nickname', t.name],
        ['Hostname', t.host],
        ['Port', String(t.port)],
        ['Username', t.username],
    ];
    if (segments(t.directory).length) entries.push(['Path', `/${segments(t.directory).join('/')}`]);

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
${entries.map(([key, value]) => `    <key>${key}</key>\n    <string>${xml(value)}</string>`).join('\n')}
</dict>
</plist>
`;
};

/** A safe file name built from the server's name. */
export const fileName = (name: string, extension: string): string =>
    `${name.replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || 'server'}.${extension}`;

/** Reads the admin's "apps" setting, falling back to every app. */
export const enabledApps = (value: unknown): AppId[] =>
    Array.isArray(value) ? APP_IDS.filter((id) => value.includes(id)) : [...APP_IDS];
