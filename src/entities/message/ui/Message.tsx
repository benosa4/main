import React, { useRef, useState } from 'react';
import type { MessageModel } from '../types';
import MessageContent from './parts/MessageContent';
import MessageMeta from './parts/MessageMeta';
import ActionButton from './parts/ActionButton';
import QuickReaction from './parts/QuickReaction';
import { messageStore } from '../../../features/messages/model';
import SvgAppendix from './parts/SvgAppendix';
import Reactions from './parts/Reactions';
import appSettingsStore from '../../../shared/config/appSettings';
import { EmojiPicker, Tone } from '../../../emoji';
import { nameToNative } from '../../../emoji/nameToNative';

export interface MessageProps {
  message: MessageModel;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const mine = message.sender === 'me';
  const containerRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTop, setPickerTop] = useState(0);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    const y = rect ? e.clientY - rect.top : 0;
    setPickerTop(y);
    setPickerOpen(true);
  };

  const handlePick = ({ name, tone }: { name: string; tone: Tone }) => {
    const native = nameToNative(name, tone);
    if (native) {
      messageStore.toggleReaction(message.conversationId, message.id, native);
    }
    setPickerOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`flex ${mine ? 'justify-end' : 'justify-start'} group relative`}
      onContextMenu={handleContextMenu}
    >
      {pickerOpen && (
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setPickerOpen(false)}
        />
      )}
      <div className="flex items-end gap-2 max-w-[70%]">
        {!mine && <ActionButton />}
        <div
          className={`relative rounded-lg px-3 py-2 ${mine ? 'bg-blue-600 text-white' : 'bg-white/10 text-white'} shadow-sm ${mine && appSettingsStore.state.animations && appSettingsStore.state.animationPrefs.interface.sendMessage ? 'animate-[fadeInUp_0.25s_ease_forwards]' : ''}`}
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
      {pickerOpen && (
        <div className="absolute left-full ml-2" style={{ top: pickerTop }}>
          <EmojiPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onPick={handlePick}
            defaultTone="default"
            persistToneKey="emoji_last_tone"
            animateInsidePicker={true}
          />
        </div>
      )}
    </div>
  );
};

export default Message;
