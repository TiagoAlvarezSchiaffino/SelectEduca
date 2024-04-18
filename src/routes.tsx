import { ReactComponentElement } from "react";
import { Icon } from '@chakra-ui/react'
import {
  MdPerson,
  MdHome,
} from 'react-icons/md'
import { Role } from "shared/RBAC";

export interface Route {
  name: string;
  // @ts-ignore
  icon: ReactComponentElement | string;
  secondary?: boolean;
  path: string;
  role: Role,
}

const routes: Route[] = [
  {
    name: '',
    path: '/',
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
    role: 'ANYONE',
  },
  {
    name: '',
    path: '/users',
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    role: 'ADMIN',
  },
  {
    name: '',
    path: '/groups',
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    role: 'ADMIN',
  },
]

export default routes;