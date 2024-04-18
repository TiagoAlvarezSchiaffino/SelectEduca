import { ReactComponentElement } from "react";
import { Icon } from '@chakra-ui/react'
import {
  MdPerson,
  MdHome,
  MdAccountBox
} from 'react-icons/md'

export interface Route {
  name: string;
  // @ts-ignore
  icon: ReactComponentElement | string;
  secondary?: boolean;
  path: string;
  hiddenFromSidebar?: boolean;
}

const routes: Route[] = [
  {
    name: '',
    path: '/',
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
  },
  {
    name: '',
    path: '/profile',
    icon: <Icon as={MdAccountBox} width='20px' height='20px' color='inherit' />,
    hiddenFromSidebar: true,
  },
  {
    name: '',
    path: '/groups/[groupId]',
    icon: <Icon as={MdAccountBox} width='20px' height='20px' color='inherit' />,
    hiddenFromSidebar: true,
  },
  {
    name: '',
    path: '/groups/[groupId]/transcripts/[transcriptId]',
    icon: <Icon as={MdAccountBox} width='20px' height='20px' color='inherit' />,
    hiddenFromSidebar: true,
  },
  {
    name: '',
    path: '/users',
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
  },
  {
    name: '',
    path: '/groups',
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
  },
]

export default routes;