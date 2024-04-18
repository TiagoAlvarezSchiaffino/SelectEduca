import { ReactComponentElement } from "react";
import { Resource } from "../../shared/RBAC";

export interface IRoute {
  name: string;
  layout: string;
  icon: ReactComponentElement | string;
  secondary?: boolean;
  path: string;
  hiddenFromSidebar?: boolean;
}