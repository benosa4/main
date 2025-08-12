import React from 'react';
import type { MessageModel } from '../types';
import MessageContent from './parts/MessageContent';
import MessageMeta from './parts/MessageMeta';
import ActionButton from './parts/ActionButton';
import QuickReaction from './parts/QuickReaction';
import { messageStore } from '../../../features/messages/model';
import SvgAppendix from './parts/SvgAppendix';
import Reactions from './parts/Reactions';
import appSettingsStore from '../../../shared/config/appSettings';

export interface MessageProps {
  message: MessageModel;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const mine = message.sender === 'me';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} group`}>
      <div className="flex items-end gap-2 max-w-[70%]">
        {!mine && <ActionButton />}
        <div
          className={`relative rounded-lg px-3 py-2 ${mine ? 'text-white' : 'bg-white/10 text-white'} shadow-sm`}
          style={mine ? { backgroundColor: appSettingsStore.state.chatColor } : undefined}
        >
          <SvgAppendix side={mine ? 'right' : 'left'} />
          <MessageContent message={message} />
          <div className={`mt-1 flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <MessageMeta createdAtISO={message.createdAt} views={message.views?.count} />
          </div>
          <Reactions
            reactions={message.reactions}
            onToggle={(emoji) => messageStore.toggleReaction(message.conversationId, message.id, emoji)}
          />
        </div>
        {mine && <ActionButton />}
      </div>
      <div className={`${mine ? 'mr-2' : 'ml-2'}`}>
        <QuickReaction onReact={(emoji) => messageStore.toggleReaction(message.conversationId, message.id, emoji)} />
      </div>
    </div>
  );
};

export default Message;
