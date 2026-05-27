import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class UppercasePipe implements PipeTransform {
  transform(value: any) {
    if (value?.gender && typeof value?.gender == 'string') {
      return {...value, gender: value?.gender?.toUpperCase() }
    }
    return value;
  }
}
