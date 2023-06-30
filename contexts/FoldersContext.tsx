import React, { Dispatch, SetStateAction } from "react";

export interface folder {
  folderID: string;
  title: string;
  color: string;
  inactiveSets: string[];
  activeSets: string[];
}

interface folderContextInterface {
  folders: folder[];
  setFolders: Dispatch<SetStateAction<folder[]>>;
}

export const folderContextDefaultValue: folderContextInterface = {
  folders: [],
  setFolders: () => [],
};

export const FoldersContext = React.createContext<folderContextInterface>(
  folderContextDefaultValue
);
