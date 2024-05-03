import {
    Flex,
    Box,
    Link,
    UnorderedList,
    ListItem,
    Heading,
  } from '@chakra-ui/react'
  import React from 'react'
  import { DownloadIcon } from '@chakra-ui/icons';
  import Loader from 'components/Loader';
  import { trpcNext } from 'trpc';
  import menteeApplicationFields from 'shared/menteeApplicationFields';
  import z from "zod";
  import { paragraphSpacing, sectionSpacing } from 'theme/metrics';
  
  export default function MenteeApplication({ menteeUserId, title } : {
    menteeUserId: string,
    title?: string,
  }) {
    const { data: app, isLoading } = trpcNext.users.getApplication.useQuery({ 
      userId: menteeUserId, 
      type: "MenteeInterview",
    });
  
    return isLoading ? <Loader /> : <Flex direction="column" gap={sectionSpacing}>
      <Heading size="md">{title || ""}</Heading>
      {!app ? "" : menteeApplicationFields.map(f => {
        if (f.name in app) {
          return <Flex key={f.name} direction="column" gap={paragraphSpacing}>
            <Box><b>{f.name}</b></Box>
            <Box>
              <ApplicationFieldValue
                // @ts-ignore
                value={app[f.name]} 
              />
            </Box>
          </Flex>;
        }
      })}
    </Flex>;
  }
  
  function ApplicationFieldValue({ value }: {
    value: any,
  }) {
    if (Array.isArray(value)) {
      return <UnorderedList>
        {value.map((v, idx) => <ListItem key={idx}><ApplicationFieldValue value={v} /></ListItem>)}
      </UnorderedList>;
    } else if (z.string().url().safeParse(value).success) {
      return <Link href={value}>
        <DownloadIcon />
      </Link>;
    } else if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    } else if (typeof value === "string") {
      return value.split("\n").map((p, idx) => <p key={idx}>{p}</p>);
    } else {
      return value;
    }
  }