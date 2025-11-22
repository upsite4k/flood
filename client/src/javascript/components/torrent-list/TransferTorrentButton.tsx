import React, {useState} from 'react';

type Props = {
  hash: string;
};

const TransferTorrentButton: React.FC<Props> = ({hash}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] =
    useState<'series' | 'movies' | 'games' | ''>('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const openModal = () => {
    setError(null);
    setMessage(null);
    setCategory('');
    setIsOpen(true);
  };

  const closeModal = () => {
    if (isSending) return;
    setIsOpen(false);
  };

  const submit = async () => {
    if (!category) return;
    setIsSending(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/torrents/${hash}/transfer`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({category}),
      });

      if (!res.ok) {
        let data: any = {};
        try {
          data = await res.json();
        } catch {
          // ignore
        }
        throw new Error(data.error || res.statusText);
      }

      setMessage('Transfer started.');
      setIsOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Transfer failed');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <span style={{display: 'inline-block', position: 'relative'}}>
      {/* The action button in the torrent row */}
      <button
        type="button"
        onClick={openModal}
        style={{
          padding: '2px 6px',
          fontSize: '12px',
          cursor: 'pointer',
          marginLeft: '4px',
        }}
      >
        Transfer
      </button>

      {/* Very simple “modal” overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.45)',
            zIndex: 9999,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: '#222',
              color: '#fff',
              padding: '16px',
              borderRadius: '4px',
              maxWidth: '320px',
              width: '90%',
              margin: '10% auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{marginTop: 0, marginBottom: '8px'}}>
              Transfer torrent
            </h3>

            <p style={{marginTop: 0}}>
              Choose where the downloaded folder should be transferred:
            </p>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as 'series' | 'movies' | 'games' | '')
              }
              style={{
                width: '100%',
                marginBottom: '8px',
                padding: '4px',
              }}
            >
              <option value="">Select target…</option>
              <option value="series">Series</option>
              <option value="movies">Movies</option>
              <option value="games">Games</option>
            </select>

            {error && (
              <div
                style={{
                  color: '#ff8080',
                  fontSize: '12px',
                  marginBottom: '8px',
                }}
              >
                {error}
              </div>
            )}

            {message && (
              <div
                style={{
                  color: '#80ff80',
                  fontSize: '12px',
                  marginBottom: '8px',
                }}
              >
                {message}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              <button
                type="button"
                onClick={closeModal}
                disabled={isSending}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!category || isSending}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  cursor: !category || isSending ? 'default' : 'pointer',
                }}
              >
                {isSending ? 'Starting…' : 'Start transfer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};

export default TransferTorrentButton;
