import { Options, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';

const config: Options = {
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL || 'postgresql://the_trading_post_db_user:jnwKSk2PJXNk3wzEOxWtWsEgVp9EwfI1@dpg-d4cj1275r7bs73aerafg-a.oregon-postgres.render.com/the_trading_post_db',
  extensions: [SeedManager, Migrator],
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  metadataProvider: TsMorphMetadataProvider,
  debug: true,
  driverOptions: {
    connection: {
      ssl: true,
    },
  },
  seeder: {
    path: './src/seeders',
    pathTs: undefined,
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
    fileName: (className: string) => className,
  },
  migrations: {
    dropTables: false,
  },
};

export default config;
