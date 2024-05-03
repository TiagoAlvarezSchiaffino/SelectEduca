import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    WrapItem,
    Wrap,
    Text,
    Icon,
  } from '@chakra-ui/react'
  import React from 'react'
  import Loader from 'components/Loader';
  import { formatUserName, compareUUID } from 'shared/strings';
  import { Interview } from 'shared/Interview';
  import { useUserContext } from 'UserContext';
  import { CheckIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
  import TrLink from 'components/TrLink';
  import { sectionSpacing } from 'theme/metrics';
  
  /**
   * @param forCalibration when true, show the current user in the interviewer list, and link to `/interviews/<id>` as
   * opposed to `/interviews/<id>/feedback`.
   */
  export default function Interviews({ interviews, forCalibration }: {
    interviews: Interview[] | undefined
    forCalibration: boolean
  }) {
    const [me] = useUserContext();
    
    return !interviews ? <Loader /> : <TableContainer>
      <Table>
        <Thead>
          <Tr>
          <Th></Th><Th>{forCalibration ? "" : ""}</Th><Th></Th>
          </Tr>
        </Thead>
        <Tbody>
        {/* Fix dislay order */}
        {interviews.sort((i1, i2) => compareUUID(i1.id, i2.id)).map(i => (
          <TrLink key={i.id} 
            href={forCalibration ? `/interviews/${i.id}` : `/interviews/${i.id}/feedback`}
            _hover={{ bg: "white" }}
          >
            <Td>
              {formatUserName(i.interviewee.name, "formal")}
            </Td>
            <Td><Wrap spacing="2">
              {i.feedbacks.filter(f => forCalibration || f.interviewer.id !== me.id).map(f => 
                <WrapItem key={f.id}>
                  {formatUserName(f.interviewer.name, "formal")}
                  {f.feedbackUpdatedAt && <CheckIcon marginStart={1} />}
                </WrapItem>
              )}
            </Wrap></Td>
            <Td>{forCalibration ? <ViewIcon /> : <EditIcon />}</Td>
          </TrLink>
        ))}
        </Tbody>
      </Table>
      
      <Text marginTop={sectionSpacing} fontSize="sm"><CheckIcon /></Text>
    </TableContainer>;
  }