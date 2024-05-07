import {
    Avatar,
    Button,
    HStack,
    Icon,
    IconButton,
    Spacer,
    Text,
    Textarea,
    TextareaProps,
    VStack,
  } from '@chakra-ui/react';
  import React, { useState } from 'react';
  import { ChatMessage } from 'shared/ChatMessage';
  import { ChatRoom } from 'shared/ChatRoom';
  import { componentSpacing, paragraphSpacing } from 'theme/metrics';
  import trpc, { trpcNext } from 'trpc';
  import { formatUserName, prettifyDate } from 'shared/strings';
  import moment from 'moment';
  import ReactMarkdown from 'react-markdown';
  import { MdEdit } from 'react-icons/md';
  import { useUserContext } from 'UserContext';
  import { AddIcon } from '@chakra-ui/icons';
  import invariant from "tiny-invariant";
  
  export default function Room({ room } : {
   room: ChatRoom,
  }) {
    return <VStack spacing={paragraphSpacing * 1.5} align="start">
        {!room.messages.length && <Text color="grey">No discussion content. Click the button to add:</Text>}
  
      <MessageCreator roomId={room.id} />
  
      {room.messages.sort((a, b) => moment(a.updatedAt).isAfter(moment(b.updatedAt)) ? -1 : 1)
        .map(m => <Message key={m.id} message={m} />)
      }
    </VStack>;
  }
  
  function MessageCreator({ roomId }: {
    roomId: string,
  }) {
    const [editing, setEditing] = useState<boolean>(false);
  
    return editing ? <Editor roomId={roomId} onClose={() => setEditing(false)} marginTop={componentSpacing} /> : 
        <IconButton variant="outline" icon={<AddIcon />} onClick={() => setEditing(true)} aria-label="New message" />;
  }
  
  function Message({ message: m }: {
    message: ChatMessage,
  }) {
    const [user] = useUserContext();
    const name = formatUserName(m.user.name);
    const [editing, setEditing] = useState<boolean>(false);
  
    return <HStack align="top" spacing={componentSpacing} width="100%">
      <Avatar name={name} boxSize={10} />
      <VStack align="start" width="100%">
        <HStack minWidth="210px" spacing={componentSpacing}>
          <Text>{name}</Text>
          <Text color="grey">
            {m.updatedAt && prettifyDate(m.updatedAt)}
            {m.updatedAt !== m.createdAt && "Updated"}
          </Text>
  
          {!editing && user.id == m.user.id && <>
            <Spacer />
            <Icon as={MdEdit} cursor="pointer" onClick={() => setEditing(true)} />
          </>}
        </HStack>
  
        {editing ? <Editor message={m} onClose={() => setEditing(false)} /> : <ReactMarkdown>{m.markdown}</ReactMarkdown>}
      </VStack>
    </HStack>;
  }
  
  function Editor({ roomId, message, onClose, ...rest }: {
    roomId?: string,        // create a new message when specified
    message?: ChatMessage,  // must be specified iff. roomId is undefined
    onClose: Function,
  } & TextareaProps) {
    const [markdown, setMarkdown] = useState<string>(message ? message.markdown : "");
    const [saving, setSaving] = useState<boolean>(false);
    const utils = trpcNext.useContext();
  
    const save = async () => {
      setSaving(true);
      try {
        if (message) {
          invariant(!roomId);
          await trpc.partnerships.internalChat.updaateMessage.mutate({ messageId: message.id, markdown });
        } else {
          invariant(roomId);
          await trpc.partnerships.internalChat.createMessage.mutate({ roomId, markdown });
        }
        utils.partnerships.internalChat.getRoom.invalidate();
        onClose();
      } finally {
        setSaving(false);
      }
    };
  
    return <>
      <Textarea autoFocus background="white" value={markdown} onChange={e => setMarkdown(e.target.value)} {...rest} />
      <HStack>
        <Button onClick={save} isLoading={saving} isDisabled={!markdown} variant="brand">{roomId ? "Add" : "Update"}</Button>
        <Button onClick={() => onClose()} variant="ghost">Cancel</Button>
      </HStack>
    </>;
  }