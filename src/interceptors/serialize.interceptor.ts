import {
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { plainToClass, plainToInstance } from 'class-transformer'

interface ClassContructor {
  new (...args: any[]): {}
}

export function Serialize(dto: ClassContructor) {
  return UseInterceptors(new SerializeInterceptor(dto))
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    // Run someting before a reques is handled by the request handler
    return handler.handle().pipe(
      map((data: any) => {
        // Run seomthing before the response is sent out
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true // ensures that when dto is turned to json, it is only going to share the exposed properties
        })
      })
    )
  }
}