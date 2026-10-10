import './styles.css';
import { definePterodactylExtension } from '@pterodactyl/sdk';
import QuickConnectMenu from './components/QuickConnectMenu';
import { enabledApps } from './sftp';

export default definePterodactylExtension({
    setup({ slots, config }) {
        const apps = enabledApps(config.apps);
        const host = typeof config.host === 'string' ? config.host.trim() : '';

        slots.register('server.files.toolbar', ({ data }) => <QuickConnectMenu data={data} apps={apps} host={host} />);
    },
});
