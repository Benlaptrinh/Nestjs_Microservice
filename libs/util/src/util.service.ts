import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
    sum()   {
        return 1 + 1;
    }
}
