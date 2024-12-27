interface DownloadTitleProps {
  hasFiles: boolean;
}

export const DownloadTitle = ({ hasFiles }: DownloadTitleProps) => {
  return hasFiles ? 'Your downloads are ready' : 'No downloads available';
};
