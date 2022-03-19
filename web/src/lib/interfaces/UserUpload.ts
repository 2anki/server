interface UserUpload {
  id: string;
  size_mb: number;
  owner: number;
  key: string;
  filename: string;
  object_id: string;
}

export default UserUpload;
