import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { createExtensionTestHost, createTestServer } from '@pterodactyl/sdk/testing';
import type { FileManagerSlotData } from '@pterodactyl/sdk';
import QuickConnectMenu from './components/QuickConnectMenu';
import {
    cyberduckBookmark,
    enabledApps,
    fileName,
    fileZillaSite,
    sftpCommand,
    sftpLink,
    winscpLink,
    type SftpTarget,
} from './sftp';

const target: SftpTarget = {
    name: 'Rust & Friends',
    host: 'node1.example.com',
    port: 2022,
    username: 'moe.serv_abc',
    directory: '/oxide/plugins',
};

test('links open the current folder', () => {
    expect(sftpLink(target)).toBe('sftp://moe.serv_abc@node1.example.com:2022/oxide/plugins/');
    expect(winscpLink(target)).toBe('winscp-sftp://moe.serv_abc@node1.example.com:2022/oxide/plugins/');
    expect(sftpLink({ ...target, directory: '/' })).toBe('sftp://moe.serv_abc@node1.example.com:2022/');
    expect(sftpLink({ ...target, host: '2001:db8::1' })).toContain('@[2001:db8::1]:2022/');
    expect(sftpLink({ ...target, directory: '/my maps' })).toContain('/my%20maps/');
});

test('the terminal command quotes paths with spaces', () => {
    expect(sftpCommand(target)).toBe('sftp -P 2022 moe.serv_abc@node1.example.com:/oxide/plugins/');
    expect(sftpCommand({ ...target, directory: '/' })).toBe('sftp -P 2022 moe.serv_abc@node1.example.com');
    expect(sftpCommand({ ...target, directory: "/it's here" })).toBe(
        "sftp -P 2022 'moe.serv_abc@node1.example.com:/it'\\''s here/'",
    );
});

test('the FileZilla site uses SFTP, asks for the password and escapes the name', () => {
    const site = fileZillaSite(target);
    expect(site).toContain('<Protocol>1</Protocol>');
    expect(site).toContain('<Logontype>2</Logontype>');
    expect(site).toContain('<Name>Rust &amp; Friends</Name>');
    expect(site).toContain('<RemoteDir>1 0 5 oxide 7 plugins</RemoteDir>');
    expect(site).not.toContain('<Pass');
    expect(fileZillaSite({ ...target, directory: '/' })).not.toContain('RemoteDir');
});

test('the Cyberduck bookmark has the folder and no password', () => {
    const duck = cyberduckBookmark(target);
    expect(duck).toContain('<string>sftp</string>');
    expect(duck).toContain('<key>Path</key>\n    <string>/oxide/plugins</string>');
    expect(duck).not.toContain('Password');
});

test('file names and the apps setting are cleaned up', () => {
    expect(fileName('Rust & Friends', 'xml')).toBe('Rust-Friends.xml');
    expect(fileName('***', 'duck')).toBe('server.duck');
    expect(enabledApps(['command', 'bogus', 'filezilla'])).toEqual(['filezilla', 'command']);
    expect(enabledApps(null)).toHaveLength(5);
});

let host: ReturnType<typeof createExtensionTestHost> | undefined;
const slotData = (server: ReturnType<typeof createTestServer>): FileManagerSlotData => ({
    server,
    directory: '/oxide',
    files: [],
    selectedFiles: [],
    isFetching: false,
    setSelectedFiles: () => undefined,
    refresh: async () => undefined,
});

const hostFor = (server: ReturnType<typeof createTestServer>) =>
    (host = createExtensionTestHost({ extensionId: 'sftp-quick-connect', prefix: 'rxsq', server }));

afterEach(() => {
    cleanup();
    host?.dispose();
});

test('the menu shows the login for people with SFTP access', async () => {
    const server = createTestServer({ permissions: ['file.sftp'], owner: false });
    render(<QuickConnectMenu data={slotData(server)} apps={['filezilla']} host='sftp.example.com' />, {
        wrapper: hostFor(server).Wrapper,
    });

    expect(await screen.findByText('Open in SFTP app')).toBeTruthy();
    expect(screen.getByText(/@sftp\.example\.com:/)).toBeTruthy();
});

test('the menu is hidden without SFTP access', async () => {
    const server = createTestServer({ permissions: ['file.read'], owner: false });
    const { container } = render(<QuickConnectMenu data={slotData(server)} apps={['filezilla']} host='' />, {
        wrapper: hostFor(server).Wrapper,
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(container.textContent).toBe('');
});
