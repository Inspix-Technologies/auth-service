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
  uid: string;
  name: string;
  businessName: string;
  businessType: string;
  phoneNumber: string;
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
  uid!: string

  @Column
  email!: string;
  
  @Column
  name!: string;

  @Column
  businessName!: string;

  @Column
  businessType!: string;

  @Column
  phoneNumber!: string;

  @Column({field: 'is_verified'})
  isVerified!: boolean
}

export default User;
