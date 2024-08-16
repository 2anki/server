import { Knex } from 'knex';

export type DropboxFile = {
  bytes: number;
  icon: string;
  id: string;
  isDir: boolean;
  link: string;
  linkType: string;
  name: string;
};

export class DropboxRepository {
  constructor(private readonly database: Knex) {}

  async saveFiles(files: DropboxFile[], owner: number | string) {
    await this.database('dropbox_uploads').insert(
      files.map((file) => ({
        owner,
        bytes: file.bytes,
        icon: file.icon,
        dropbox_id: file.id,
        isDir: file.isDir,
        link: file.link,
        linkType: file.linkType,
        name: file.name,
      }))
    );
  }
}
