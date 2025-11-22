import {createRef, FC, MutableRefObject} from 'react';
import {observer} from 'mobx-react-lite';

import {Checkmark} from '@client/ui/icons';
import ConfigStore from '@client/stores/ConfigStore';
import TorrentActions from '@client/actions/TorrentActions';
import TorrentContextMenuActions from '@client/constants/TorrentContextMenuActions';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import type {ContextMenuItem} from '@client/stores/UIStore';

import type {TorrentProperties} from '@shared/types/Torrent';

import PriorityMeter from '../general/PriorityMeter';

const getLastSelectedTorrent = (): string => TorrentStore.selectedTorrents[TorrentStore.selectedTorrents.length - 1];

const InlineTorrentPropertyCheckbox: FC<{property: keyof TorrentProperties}> = observer(
  ({property}: {property: keyof TorrentProperties}) => (
    <span className="toggle-input checkbox" style={{display: 'inline'}}>
      <div className="toggle-input__indicator">
        <div
          className="toggle-input__indicator__icon"
          style={{
            opacity: TorrentStore.torrents[getLastSelectedTorrent()][property] ? '1' : undefined,
          }}
        >
          <Checkmark />
        </div>
      </div>
    </span>
  ),
);

export const getContextMenuItems = (torrent: TorrentProperties): Array<ContextMenuItem> => {
  const changePriorityFuncRef = createRef<() => number>();

  return [
    {
      type: 'action',
      action: 'start',
      label: TorrentContextMenuActions.start,
      clickHandler: () => {
        TorrentActions.startTorrents({
          hashes: TorrentStore.selectedTorrents,
        });
      },
    },
    {
      type: 'action',
      action: 'stop',
      label: TorrentContextMenuActions.stop,
      clickHandler: () => {
        TorrentActions.stopTorrents({
          hashes: TorrentStore.selectedTorrents,
        });
      },
    },
    {
      type: 'action',
      action: 'remove',
      label: TorrentContextMenuActions.remove,
      clickHandler: () => {
        UIStore.setActiveModal({id: 'remove-torrents'});
      },
    },
    {
      type: 'action',
      action: 'checkHash',
      label: TorrentContextMenuActions.checkHash,
      clickHandler: () => {
        TorrentActions.checkHash({
          hashes: TorrentStore.selectedTorrents,
        });
      },
    },
    {
      type: 'action',
      action: 'reannounce',
      label: TorrentContextMenuActions.reannounce,
      clickHandler: () => {
        TorrentActions.reannounce({
          hashes: TorrentStore.selectedTorrents as [string, ...string[]],
        });
      },
    },
    {
      type: 'separator',
    },
    {
      type: 'action',
      action: 'setTaxonomy',
      label: TorrentContextMenuActions.setTaxonomy,
      clickHandler: () => {
        UIStore.setActiveModal({id: 'set-taxonomy'});
      },
    },
    {
      type: 'action',
      action: 'move',
      label: TorrentContextMenuActions.move,
      clickHandler: () => {
        UIStore.setActiveModal({id: 'move-torrents'});
      },
    },
    {
      type: 'action',
      action: 'setTrackers',
      label: TorrentContextMenuActions.setTrackers,
      clickHandler: () => {
        UIStore.setActiveModal({id: 'set-trackers'});
      },
    },
    {
      type: 'separator',
    },
    {
      type: 'action',
      action: 'torrentDetails',
      label: TorrentContextMenuActions.torrentDetails,
      clickHandler: () => {
        UIStore.setActiveModal({
          id: 'torrent-details',
          hash: getLastSelectedTorrent(),
        });
      },
    },
     {
      type: 'action',
      action: 'transfer',
      label: TorrentContextMenuActions.transfer,
      clickHandler: async () => {
        const hash = getLastSelectedTorrent();

        // Ask user where to transfer
        const input = window.prompt(
          'Transfer to (series / movies / games):',
          'series',
        );
        if (!input) {
          return;
        }

        const category = input.toLowerCase().trim() as
          | 'series'
          | 'movies'
          | 'games';

        if (!['series', 'movies', 'games'].includes(category)) {
          window.alert('Invalid target, please use series / movies / games');
          return;
        }

        try {
          const res = await fetch(
            `${ConfigStore.baseURI}api/torrents/${hash}/transfer`,
            {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({category}),
            },
          );

          if (!res.ok) {
            let data: any = {};
            try {
              data = await res.json();
            } catch {
              // ignore JSON error
            }
            throw new Error(data.error || res.statusText);
          }

          window.alert('Transfer started.');
        } catch (e: any) {
          window.alert(
            `Transfer failed: ${e?.message ?? String(e)}`,
          );
        }
      },
    },
    {
      type: 'action',
      action: 'downloadContents',
      label: TorrentContextMenuActions.downloadContents,
      clickHandler: (e) => {
        e.preventDefault();

        TorrentStore.selectedTorrents.forEach((hash) => {
          const link = document.createElement('a');

          link.download = '';
          link.href = `${ConfigStore.baseURI}api/torrents/${hash}/contents/all/data`;
          link.style.display = 'none';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      },
    },
    {
      type: 'action',
      action: 'downloadMetainfo',
      label: TorrentContextMenuActions.downloadMetainfo,
      clickHandler: (e) => {
        e.preventDefault();

        const link = document.createElement('a');

        link.download = '';
        link.href = `${ConfigStore.baseURI}api/torrents/${TorrentStore.selectedTorrents.join(',')}/metainfo`;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    },
    {
      type: 'action',
      action: 'generateMagnet',
      label: TorrentContextMenuActions.generateMagnet,
      clickHandler: () => {
        UIStore.setActiveModal({id: 'generate-magnet'});
      },
    },
    {
      type: 'action',
      action: 'setInitialSeeding',
      label: TorrentContextMenuActions.setInitialSeeding,
      clickHandler: () => {
        const {selectedTorrents} = TorrentStore;
        TorrentActions.setInitialSeeding({
          hashes: selectedTorrents,
          isInitialSeeding: !TorrentStore.torrents[getLastSelectedTorrent()].isInitialSeeding,
        });
      },
      dismissMenu: false,
      labelAction: () => <InlineTorrentPropertyCheckbox property="isInitialSeeding" />,
    },
    {
      type: 'action',
      action: 'setSequential',
      label: TorrentContextMenuActions.setSequential,
      clickHandler: () => {
        const {selectedTorrents} = TorrentStore;
        TorrentActions.setSequential({
          hashes: selectedTorrents,
          isSequential: !TorrentStore.torrents[getLastSelectedTorrent()].isSequential,
        });
      },
      dismissMenu: false,
      labelAction: () => <InlineTorrentPropertyCheckbox property="isSequential" />,
    },
    {
      type: 'action',
      action: 'setPriority',
      label: TorrentContextMenuActions.setPriority,
      clickHandler: () => {
        if (changePriorityFuncRef.current != null) {
          TorrentActions.setPriority({
            hashes: TorrentStore.selectedTorrents,
            priority: changePriorityFuncRef.current(),
          });
        }
      },
      dismissMenu: false,
      labelAction: () => (
        <PriorityMeter
          id={torrent.hash}
          key={torrent.hash}
          level={torrent.priority}
          maxLevel={3}
          onChange={() => undefined}
          priorityType="torrent"
          showLabel={false}
          changePriorityFuncRef={changePriorityFuncRef as MutableRefObject<() => number>}
          clickHandled
        />
      ),
    },
  ];
};
