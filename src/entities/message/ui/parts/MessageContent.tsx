import React from 'react';
import TwemojiText from '../../../../shared/emoji/TwemojiText';
import type { MessageModel } from '../../types';

interface Props {
  message: MessageModel;
}

const MessageContent: React.FC<Props> = ({ message }) => {
  return (
    <div className="space-y-2">
      {message.text && <TwemojiText text={message.text} />}
      {message.attachments?.map((att) => (
        <div key={att.id} className="rounded-md overflow-hidden border border-white/10">
          {att.type === 'image' ? (
            <img src={att.url} alt={att.name || 'image'} className="max-w-xs rounded-md" />
          ) : (
            <a href={att.url} target="_blank" rel="noreferrer" className="underline">
              {att.name || att.url}
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageContent;
