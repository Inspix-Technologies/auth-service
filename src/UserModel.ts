import {
  Table,
  Column,
  Model,
  HasOne,
  Unique,
  DefaultScope,
  Scopes,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  isVerified: boolean;
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id'> {}

@Table({
  timestamps: true,
  tableName: 'users',
})
class User extends Model<UserAttributes, UserCreationAttributes> {
  @Column
  name!: string;

  @Column
  email!: string;

  @Column({field: 'is_verified'})
  isVerified!: boolean
}

export default User;
