import { ReactComponentElement } from "react";
import { Icon } from '@chakra-ui/react';
import {
  MdPerson,
  MdHome,
  MdGroups,
  MdScience,
} from 'react-icons/md'
import Role from "./shared/Role";

export interface SidebarItem {
  name: string,
  // @ts-ignore
  icon: ReactComponentElement | string,
  secondary?: boolean,
  path: string,
  role?: Role,
}

export const sidebarItems: SidebarItem[] = [
  {
    name: '',
    path: '/',
    icon: <Icon as={MdHome} width='20px' height='20px' color='inherit' />,
  },
  {
    name: '',
    path: '/groups/lab',
    icon: <Icon as={MdScience} width='20px' height='20px' color='inherit' />,
    role: 'SummaryEngineer',
  },
  {
    name: '',
    path: '/users',
    icon: <Icon as={MdPerson} width='20px' height='20px' color='inherit' />,
    role: 'UserManager',
  },
  {
    name: '',
    path: '/groups',
    icon: <Icon as={MdGroups} width='20px' height='20px' color='inherit' />,
    role: 'GroupManager',
  },
]

export const isWindowAvailable = () => typeof window !== "undefined";

const findCurrentRoute = (routes: SidebarItem[]) => {
  const foundRoute = routes.find(
    (route) =>
      isWindowAvailable() &&
      window.location.href.indexOf('/' + route.path) !== -1 &&
      route
  );

  return foundRoute;
};

export const getActiveRoute = (routes: SidebarItem[]): string => {
  const route = findCurrentRoute(routes);
  return route?.name || "Default Brand Text";
};

export const getActiveSidebar = (routes: SidebarItem[]): boolean => {
  const route = findCurrentRoute(routes);
  return route?.secondary ?? false;
};

export const getActiveSidebarText = (routes: SidebarItem[]): string | boolean => {
  return getActiveRoute(routes) || false;
};