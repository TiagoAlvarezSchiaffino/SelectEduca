import {
  Box,
  Button,
  Grid,
  VStack,
  StackDivider
} from '@chakra-ui/react'
import React, { useState } from 'react'
import AppLayout from 'AppLayout'
import { NextPageWithLayout } from '../../NextPageWithLayout'
import tClientBrowser from "../../tClientBrowser";
import { toast } from "react-toastify";
import AsyncSelect from "react-select/async";
import tClientNext from "../../tClientNext";
import GroupBar from 'components/GroupBar';

type Option = {
  label: string,
  value: string,
}
const loadOptions = (
  inputValue: string,
  callback: (options: Option[]) => void
) => {
  tClientBrowser.users.search.query({
    query: inputValue,
  }).then(({ users }) => {
    callback(users.map(u => {
      return {
        label: `${u.name} (${u.email})`,
        value: u.id,
      };
    }));
  })
}

const Page: NextPageWithLayout = () => {
  const [selected, setSelected] = useState([] as {label: string, value: string}[]);
  const [isCreating, setCreating] = useState(false);

  const { data, refetch } = tClientNext.groups.list.useQuery({
    userIds: selected.map(option => option.value),
  });

  const createGroup = async () => {
    setCreating(true);
    tClientBrowser.groups.create.mutate({
      userIds: selected.map(option => option.value),
    })
      .then(() => {
        refetch();
      })
      .catch((e) => toast.error(e.message, { autoClose: false }))
      .finally(() => setCreating(false));
  };

  return (
    <Box paddingTop={'80px'}>
      <Box>
        <Grid templateColumns={'3fr 1fr'} columnGap={'20px'}>
          <AsyncSelect
            cacheOptions
            loadOptions={loadOptions}
            isMulti
            value={selected}
            onChange={(v) => setSelected(v.map(item => ({ label: item.label, value: item.value })))}
          />
          <Button
            isLoading={isCreating}
            loadingText='...'
            fontSize='sm' variant='brand' fontWeight='500' mb='24px' onClick={async () => {
              createGroup();
          }}>
          </Button>
        </Grid>
      </Box>
      <VStack divider={<StackDivider />} align='left' spacing='3'>
        {data && data.map(group => <GroupBar key={group.id} group={group} showSelf />)}
      </VStack>
      {!data && <Button isLoading={true} loadingText={'...'} disabled={true}/>}
    </Box>
  )
}

Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Page;