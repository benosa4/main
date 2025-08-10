import React from 'react';
import type { MessageModel } from '../../../entities/message/types';
import StickyDate from '../../../entities/sticky-date/ui/StickyDate';
import Message from '../../../entities/message/ui/Message';

export interface MessageDateGroupProps {
  label: string;
  messages: MessageModel[];
}

const MessageDateGroup: React.FC<MessageDateGroupProps> = ({ label, messages }) => {
  return (
    <div className="space-y-2">
      <StickyDate label={label} />
      {messages.map((m) => (
        <Message key={m.id} message={m} />
      ))}
    </div>
  );
};

export default MessageDateGroup;

