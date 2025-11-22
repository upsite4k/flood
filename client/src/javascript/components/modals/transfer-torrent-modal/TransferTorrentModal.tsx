import {FC, useState} from 'react';
import {Trans, useLingui} from '@lingui/react';

import {Form, FormRow} from '@client/ui';
import ConfigStore from '@client/stores/ConfigStore';
import TorrentContextMenuActions from '@client/constants/TorrentContextMenuActions';
import TorrentStore from '@client/stores/TorrentStore';
import UIStore from '@client/stores/UIStore';

import Modal from '../Modal';
import ModalActions from '../ModalActions';

type Category = 'series' | 'movies' | 'games';

const getLastSelectedTorrent = (): string =>
  TorrentStore.selectedTorrents[TorrentStore.selectedTorrents.length - 1];

const TransferTorrentModal: FC = () => {
  const {i18n} = useLingui();
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hashes = TorrentStore.selectedTorrents;
  const isDisabled = hashes.length === 0;

  return (
    <Modal
      heading={i18n._(TorrentContextMenuActions.transfer)}
      content={
        <div className="modal__content">
          <Form
            className="inverse"
            onSubmit={async ({formData}) => {
              if (isDisabled) return;
              setError(null);
              setIsTransferring(true);

              const hash = getLastSelectedTorrent();
              const category = (formData.category as Category) ?? 'series';

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
                    // ignore JSON parse error
                  }
                  throw new Error(data.error || res.statusText);
                }

                UIStore.setActiveModal(null);
              } catch (e: any) {
                setError(e?.message ?? String(e));
              } finally {
                setIsTransferring(false);
              }
            }}
          >
            <FormRow>
              <label htmlFor="category" style={{display: 'block', marginBottom: 4}}>
                <Trans id="torrents.transfer.select.destination"/>
              </label>
              <select id="category" name="category" defaultValue="series" style={{width: '100%'}}>
                <option value="series">Series</option>
                <option value="movies">Movies</option>
                <option value="games">Games</option>
              </select>
            </FormRow>
            {isDisabled && (
              <FormRow>
                <div className="inverse">
                  <Trans id="torrents.transfer.no.selection" />
                </div>
              </FormRow>
            )}
            {error && (
              <FormRow>
                <div style={{color: '#ff8080', fontSize: 12}}>{error}</div>
              </FormRow>
            )}
            <ModalActions
              actions={[
                {
                  content: i18n._('button.cancel'),
                  triggerDismiss: true,
                  type: 'tertiary',
                },
                {
                  content: i18n._('torrents.transfer.start') /* falls back to id if missing */,
                  isLoading: isTransferring,
                  submit: true,
                  type: 'primary',
                },
              ]}
            />
          </Form>
        </div>
      }
    />
  );
};

export default TransferTorrentModal;
