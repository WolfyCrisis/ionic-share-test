import { Component } from '@angular/core';
import { Share } from '@capacitor/share';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  constructor() {}

  async share(type: string, event?: Event) {
    const canShareRes = await Share.canShare();

    if (canShareRes.value) {
      switch (type) {
        case 'text': {
          await Share.share({
            title: 'text only',
            dialogTitle: 'text only',
            text: 'Here is some text about nothing, but meow meow I guess. Link to Katress, my favourite pal.',
            url: 'https://palworld.fandom.com/wiki/Katress',
          });
          break;
        }
        case 'img/vid': {
          const files = (event?.target as HTMLInputElement).files;
          if (files !== null) {
            const filesUri = [];

            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const base64 = await this.toBase64(file);

              const filePath = () => {
                if (file.type.includes('image')) {
                  return `images/${file.name}`;
                } else if (file.type.includes('video')) {
                  return `videos/${file.name}`;
                }
                return '';
              };

              if (filePath()) {
                const writeFileRes = await Filesystem.writeFile({
                  data: base64,
                  path: filePath(),
                  directory: Directory.Cache,
                  recursive: true,
                });

                filesUri.push(writeFileRes.uri);
              }
            }

            await Share.share({
              files: filesUri,
            });
          }
          break;
        }
        case 'file': {
          const files = (event?.target as HTMLInputElement).files;
          if (files !== null) {
            const filesUri = [];

            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const base64 = await this.toBase64(file);

              const writeFileRes = await Filesystem.writeFile({
                data: base64,
                path: `files/${file.name}`,
                directory: Directory.Cache,
                recursive: true,
              });

              filesUri.push(writeFileRes.uri);
            }

            await Share.share({
              files: filesUri,
            });
          }
          break;
        }
      }
    }
  }

  // To upload the same file again.
  uploadClick(event: Event) {
    (event.target as HTMLInputElement).value = '';
  }

  // Convert to base64
  toBase64 = (file: File) =>
    new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      // eslint-disable-next-line no-underscore-dangle
      const zoneOriginalInstance = (reader as any)
        .__zone_symbol__originalInstance;
      zoneOriginalInstance.readAsDataURL(file);
      zoneOriginalInstance.onload = () => resolve(zoneOriginalInstance.result);
      zoneOriginalInstance.onerror = (error: any) => reject(error);
    });
}
