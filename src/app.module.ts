import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { WalletMembersModule } from './wallet_members/wallet_members.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpenseSplitsModule } from './expense_splits/expense_splits.module';
import { SettlementsModule } from './settlements/settlements.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MeModule } from './me/me.module';
import { ExeptionModule } from './exeption/exeption.module';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';

@Module({
  imports: [UsersModule, WalletsModule, WalletMembersModule, CategoriesModule, ExpensesModule, ExpenseSplitsModule, SettlementsModule, AuthModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '1h' },
    }),
    MeModule,
    ExeptionModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
    provide: 'APP_FILTER',
    useClass: CatchEverythingFilter
  }],
})
export class AppModule {}
