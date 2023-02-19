import { isLoginPage } from '../NavigationBar/helpers/isLoginPage';

export const canShowNavbar = (path: string) => !isLoginPage(path);
