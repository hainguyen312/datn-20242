import React from "react";
import { ChannelList, useChatContext } from "stream-chat-react";
import ShinyText from "../text/ShinyText";
import CustomChannel from "./Channel";
import CustomSearchResult from "./SearchResult";

const ChatPanel = () => {

  const { client } = useChatContext();
  const filters = { members: { $in: [client.user.id] }, type: 'messaging' };
  const options = { presence: true, state: true };
  const sort = { last_message_at: -1 };

  return (
    <div className='w-[349px] bg-[var(--page-bg)]'>
      <h1 className="font-bold text-2xl p-3">
        <ShinyText text="Chats" disabled={false} speed={0.5} className="font-bold text-2xl"/>
      </h1>
      <ChannelList Preview={CustomChannel} sort={sort} filters={filters} options={options}
        showChannelSearch additionalChannelSearchProps={{
          searchForChannels: false,
          SearchResultItem: CustomSearchResult,
        }} />
    </div>
  );
};

export default ChatPanel;
