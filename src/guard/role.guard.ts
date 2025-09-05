import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RoleGuard implements CanActivate {
constructor(private readonly user_role: ('admin' | 'client')[]) {}

 canActivate( context: ExecutionContext,): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'] || req.headers['Authorization'] ;
    if(!authHeader || !authHeader.startsWith('Bearer')) {
      throw new UnauthorizedException('Thiếu token, bạn chưa đăng nhập');
    }
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
     decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (err) {
    throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }
    req['user'] = decoded;
    if(!this.user_role.includes(decoded.userRole)) { throw new ForbiddenException('Bạn không có quyền truy cập vào tài nguyên này'); }
    return true;
 }
}