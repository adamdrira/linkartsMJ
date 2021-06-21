import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {
    transform(obj: Object, args: any[] = null): any {
        let array = [];
        Object.keys(obj).forEach(key => {
            array.push({
                value: obj[key],
                key: key
            });
        });
        return array;
    }
}


@Pipe({
  name: 'filterAlbum',
  pure:false
})
export class FilterAlbumPipe implements PipeTransform {
    
    transform(items: any[], filter: String): any {
        if (!items || !filter) {
            return items;
        }
        return items.filter(item => item.title.indexOf(filter) !== -1);
    }

}


@Pipe({ name: 'tooltipList' })

export class TooltipListPipe implements PipeTransform {

  transform(lines: string[]): string {

    let list: string = '';

    lines.forEach(line => {
      list += '• ' + line + '\n'; 
    });

    return list;
  }
}