import React from 'react';
import TwemojiText from '../../../../shared/emoji/TwemojiText';
import type { MessageModel } from '../../types';
import MediaImage from '../../../../shared/ui/MediaImage';
import MediaVideo, { isVideoLike } from '../../../../shared/ui/MediaVideo';

interface Props {
  message: MessageModel;
}

const MessageContent: React.FC<Props> = ({ message }) => {
  return (
    <div className="space-y-2">
      {message.text && <TwemojiText text={message.text} />}
      {message.attachments?.map((att) => {
        const key = att.id;
        if (att.type === 'image') {
          return (
            <div key={key} className="rounded-md overflow-hidden border border-white/10">
              <MediaImage url={att.url} alt={att.name || 'image'} mime={att.mime} className="max-w-xs rounded-md" />
            </div>
          );
        }
        // if it's a file or declared video, try to render as video when URL/MIME suggests so
        if ((att.type === 'file' || att.type === 'video') && isVideoLike(att.url, att.mime)) {
          return (
            <div key={key} className="rounded-md overflow-hidden border border-white/10">
              <MediaVideo url={att.url} mime={att.mime} className="max-w-sm rounded-md" />
            </div>
          );
        }
        return (
          <div key={key} className="rounded-md overflow-hidden border border-white/10">
            <a href={att.url} target="_blank" rel="noreferrer" className="underline">
              {att.name || att.url}
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default MessageContent;
