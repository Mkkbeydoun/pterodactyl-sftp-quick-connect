<?php

namespace RustixDev\SftpQuickConnect;

use Pterodactyl\Extensions\ExtensionProvider;
use Pterodactyl\Services\Extensions\ExtensionSettingDefinition;
use Pterodactyl\Services\Extensions\ExtensionSettingsDefinition;

class SftpQuickConnectProvider extends ExtensionProvider
{
    public const array APPS = [
        'filezilla' => 'FileZilla',
        'winscp' => 'WinSCP',
        'cyberduck' => 'Cyberduck',
        'link' => 'Any SFTP app (sftp:// link)',
        'command' => 'Terminal command',
    ];

    public function boot(): void
    {
        $this->registerSettings(new ExtensionSettingsDefinition($this->settings(), [
            ExtensionSettingDefinition::make('host', 'host', '', ['nullable', 'string', 'max:253', 'regex:/^[A-Za-z0-9.:\-\[\]]*$/'])
                ->field('text')
                ->label('SFTP address')
                ->help("Leave empty to use each node's own address. Set it when players connect through a different hostname, such as sftp.example.com.")
                ->frontend(),
            ExtensionSettingDefinition::make('apps', 'apps', array_keys(self::APPS))
                ->multiselect(array_map(
                    fn (string $value, string $label) => ['value' => $value, 'label' => $label],
                    array_keys(self::APPS),
                    self::APPS,
                ))
                ->label('Apps to offer')
                ->frontend(),
        ]));
    }
}
