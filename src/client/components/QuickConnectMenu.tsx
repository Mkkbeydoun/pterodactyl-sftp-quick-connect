import { FolderSync, Link2, SquareTerminal, Download, AppWindow } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuItem,
    toast,
    useCurrentUser,
    useServerPermission,
    type FileManagerSlotData,
} from '@pterodactyl/sdk';
import {
    cyberduckBookmark,
    fileName,
    fileZillaSite,
    hostForUrl,
    sftpCommand,
    sftpLink,
    winscpLink,
    type AppId,
    type SftpTarget,
} from '../sftp';

interface Props {
    data: FileManagerSlotData;
    apps: AppId[];
    host: string;
}

const download = (name: string, contents: string, type: string) => {
    const url = URL.createObjectURL(new Blob([contents], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const open = (url: string) => {
    window.location.href = url;
};

const copy = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success('Command copied.');
    } catch {
        toast.error(`Could not copy. The command is: ${text}`);
    }
};

/** "Open in SFTP app" menu in the file manager toolbar, pointed at the folder being viewed. */
export default function QuickConnectMenu({ data, apps, host }: Props) {
    const user = useCurrentUser();
    const canSftp = useServerPermission('file.sftp');
    const server = data.server.attributes;

    if (!canSftp || apps.length === 0) return null;

    const target: SftpTarget = {
        name: server.name,
        host: host || server.sftp_details.ip,
        port: server.sftp_details.port,
        username: `${user.username}.${server.identifier}`,
        directory: data.directory,
    };
    const folder = data.directory.replace(/^\/+|\/+$/g, '');
    const where = folder ? `/${folder}` : 'the server root';

    return (
        <div className='rxsq:mt-3 rxsq:mb-3 rxsq:flex rxsq:flex-wrap rxsq:items-center rxsq:justify-end rxsq:gap-x-3 rxsq:gap-y-1 rxsq:text-sm'>
            <span className='rxsq:text-muted-foreground'>
                <span className='rxsq:font-mono rxsq:break-all'>
                    {target.username}@{hostForUrl(target.host)}:{target.port}
                </span>
                , password is your panel password
            </span>
            <DropdownMenu
                triggerClassName='rxsq:inline-flex rxsq:min-h-9 rxsq:items-center rxsq:gap-2 rxsq:rounded-md rxsq:border rxsq:border-border rxsq:bg-card rxsq:px-3 rxsq:py-1.5 rxsq:font-medium rxsq:text-card-foreground rxsq:transition-colors rxsq:hover:bg-accent rxsq:hover:text-accent-foreground rxsq:focus-visible:outline-2 rxsq:focus-visible:outline-ring'
                triggerContent={
                    <>
                        <FolderSync size={16} aria-hidden='true' />
                        Open in SFTP app
                    </>
                }
            >
                {apps.includes('filezilla') && (
                    <DropdownMenuItem
                        icon={Download}
                        description='Download, then File > Import in FileZilla'
                        onClick={() => download(fileName(server.name, 'xml'), fileZillaSite(target), 'application/xml')}
                    >
                        FileZilla
                    </DropdownMenuItem>
                )}
                {apps.includes('winscp') && (
                    <DropdownMenuItem icon={AppWindow} description={`Opens ${where}`} onClick={() => open(winscpLink(target))}>
                        WinSCP
                    </DropdownMenuItem>
                )}
                {apps.includes('cyberduck') && (
                    <DropdownMenuItem
                        icon={Download}
                        description='Download and open the bookmark'
                        onClick={() =>
                            download(fileName(server.name, 'duck'), cyberduckBookmark(target), 'application/octet-stream')
                        }
                    >
                        Cyberduck
                    </DropdownMenuItem>
                )}
                {apps.includes('link') && (
                    <DropdownMenuItem icon={Link2} description={`Opens ${where}`} onClick={() => open(sftpLink(target))}>
                        Default SFTP app
                    </DropdownMenuItem>
                )}
                {apps.includes('command') && (
                    <DropdownMenuItem
                        icon={SquareTerminal}
                        description='Copy an sftp command'
                        onClick={() => void copy(sftpCommand(target))}
                    >
                        Terminal
                    </DropdownMenuItem>
                )}
            </DropdownMenu>
        </div>
    );
}
