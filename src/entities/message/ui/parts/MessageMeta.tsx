import React from 'react';
import EyeIcon from '../../../../shared/ui/icons/Eye';
import appSettingsStore from '../../../../shared/config/appSettings';

export interface MessageMetaProps {
  createdAtISO: string;
  views?: number;
}

const MessageMeta: React.FC<MessageMetaProps> = ({ createdAtISO, views }) => {
  const d = new Date(createdAtISO);
  const hour12 = appSettingsStore.state.timeFormat === '12h';
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12 });
  return (
    <div className="flex items-center gap-1 text-[10px] text-white/70">
      {views !== undefined && (
        <>
          <EyeIcon className="w-3 h-3" />
          <span>{views}</span>
        </>
      )}
      <span className="ml-1">{time}</span>
    </div>
  );
};

export default MessageMeta;
