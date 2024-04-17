import {
    Box,
    Button,
    SimpleGrid,
    Badge,
    Grid
  } from '@chakra-ui/react'
  import React, { useState } from 'react'
  import AppLayout from 'layouts'
  import { NextPageWithLayout } from '../../NextPageWithLayout'
  import NormalTable from "../../horizon-ui/components/NormalTable";
  import tClientBrowser from "../../tClientBrowser";
  import { toast } from "react-toastify";
  import AsyncSelect from "react-select/async";
  import invariant from "tiny-invariant";
  import tClientNext from "../../tClientNext";
  
  type Option = {
    label: string;
    value: string;
  }
  const loadOptions = (
    inputValue: string,
    callback: (options: Option[]) => void
  ) => {
    tClientBrowser.users.search.query({
      offset: 0,
      limit: 10,
      query: inputValue,
    }).then(({ userList }) => {
      callback(userList.map(u => {
        return {
          label: `${u.name} (${u.email})`,
          value: u.id,
        };
      }));
    })
  }
  const UserManagement: NextPageWithLayout = () => {
    const [selected, setSelected] = useState([] as {label: string, value: string}[]);
    const [isCreating, setCreating] = useState(false);
  
    const { data, refetch } = tClientNext.groups.list.useQuery({
      userIdList: selected.map(option => option.value),
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
        <SimpleGrid
          mb='20px'
          columns={1}
          spacing={{ base: '20px', xl: '20px' }}
        >
          {data && <NormalTable
            tableTitle={''}
            columnsData={[
              {
                Header: "",
                accessor: "userIdList",
                Cell: ({ value, row }) => {
                  invariant(data.userMap);
                  const userList = (value as string[]).map(id => data.userMap[id]);
                  return <div>
                    {userList.map(({ name, id }) => <Badge key={id}>{name}</Badge>)}
                  </div>
                }
              },
              {
                Header: "",
                accessor: "meetingLink",
              },
            ]}
            tableData={data.groupList}
          />}
          {!data && <Button isLoading={true} loadingText={'...'} disabled={true}/>}
        </SimpleGrid>
      </Box>
    )
  }
  
  UserManagement.getLayout = (page) => <AppLayout>{page}</AppLayout>;
  
  export default UserManagement;