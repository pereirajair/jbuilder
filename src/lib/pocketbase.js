import { Client, Account, Databases } from 'appwrite'

const getPBUrl = () => {
    return import.meta.env.VITE_PB_URL
}

import PocketBase from 'pocketbase';

const pb = new PocketBase(getPBUrl());

export { pb }