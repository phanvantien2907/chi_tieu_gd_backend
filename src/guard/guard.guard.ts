import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, UseFilters } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';

@Injectable()
 @UseFilters(CatchEverythingFilter)
export class GuardsGuard implements CanActivate {
  canActivate( context: ExecutionContext,): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const openRouter = ['/auth/login', '/auth/register', '/auth/forget-password', '/auth/reset-password/:id'];
    if(openRouter.includes(req.url)) { return true;}
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] ;
    if(!authHeader || !authHeader.startsWith('Bearer')) {
      throw new UnauthorizedException('Thiếu token, bạn chưa đăng nhập');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      req['user'] = decoded;
       return true;
    } catch (err) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
