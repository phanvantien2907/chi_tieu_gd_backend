import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { ExeptionModule } from './exeption/exeption.module';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from 'src/modules/users/users.module';
import { WalletsModule } from 'src/modules/wallets/wallets.module';
import { WalletMembersModule } from 'src/modules/wallet_members/wallet_members.module';
import { CategoriesModule } from 'src/modules/categories/categories.module';
import { ExpensesModule } from 'src/modules/expenses/expenses.module';
import { ExpenseSplitsModule } from 'src/modules/expense_splits/expense_splits.module';
import { SettlementsModule } from 'src/modules/settlements/settlements.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { MeModule } from 'src/modules/me/me.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    UsersModule,
    WalletsModule,
    WalletMembersModule,
    CategoriesModule,
    ExpensesModule,
    ExpenseSplitsModule,
    SettlementsModule,
    AuthModule,
    UsersModule,
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '1h' },
    }),
    MeModule,
    ExeptionModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 5,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_FILTER',
      useClass: CatchEverythingFilter,
    },
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
